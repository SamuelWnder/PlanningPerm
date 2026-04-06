"""
FastAPI service exposing:
  POST /search/decisions  — vector search for similar planning decisions
  POST /search/policy     — vector search for relevant policy chunks
  POST /embed/decisions   — trigger embedding of unembedded decisions
  POST /scrape/run        — trigger a scrape job
  GET  /health            — health check
"""

import os
import logging
from contextlib import asynccontextmanager
from typing import Optional

import openai
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client

from embedder import DecisionEmbedder, PolicyEmbedder
from scraper import ScrapeOrchestrator

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# =============================================
# Dependencies
# =============================================

def get_supabase() -> Client:
    return create_client(
        os.environ["SUPABASE_URL"],
        os.environ["SUPABASE_SERVICE_ROLE_KEY"],
    )

def get_openai() -> openai.AsyncOpenAI:
    return openai.AsyncOpenAI(api_key=os.environ["OPENAI_API_KEY"])

def verify_api_key(x_api_key: str = Header(...)):
    if x_api_key != os.environ.get("API_KEY", ""):
        raise HTTPException(status_code=401, detail="Invalid API key")
    return x_api_key


# =============================================
# App
# =============================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    from scheduler import setup_scheduler
    scheduler = setup_scheduler()
    scheduler.start()
    logger.info("Scheduler started")
    yield
    scheduler.shutdown()


app = FastAPI(title="Planning Perm Data Service", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# =============================================
# Request / Response models
# =============================================

class SearchDecisionsRequest(BaseModel):
    query_text: str
    lpa_code: str
    application_type: Optional[str] = None
    match_count: int = 20

class DecisionResult(BaseModel):
    decision_id: str
    reference: str
    address: str
    description: str
    decision: str
    decision_date: str
    lpa_name: str
    similarity: float

class SearchDecisionsResponse(BaseModel):
    results: list[DecisionResult]

class SearchPolicyRequest(BaseModel):
    query_text: str
    lpa_code: Optional[str] = None
    match_count: int = 10

class PolicyResult(BaseModel):
    chunk_id: str
    lpa_code: Optional[str]
    document_name: str
    section: Optional[str]
    content: str
    similarity: float

class SearchPolicyResponse(BaseModel):
    results: list[PolicyResult]

class EmbedRequest(BaseModel):
    lpa_code: Optional[str] = None

class ScrapeRequest(BaseModel):
    lpa_codes: Optional[list[str]] = None
    days_back: int = 90
    max_per_lpa: int = 500


# =============================================
# Endpoints
# =============================================

@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/search/decisions", response_model=SearchDecisionsResponse)
async def search_decisions(
    req: SearchDecisionsRequest,
    _: str = Depends(verify_api_key),
    supabase: Client = Depends(get_supabase),
    oai: openai.AsyncOpenAI = Depends(get_openai),
):
    """Vector search for planning decisions similar to the query."""
    # Embed the query
    emb_resp = await oai.embeddings.create(
        model="text-embedding-3-small",
        input=req.query_text,
    )
    query_embedding = emb_resp.data[0].embedding

    # Call the Postgres function
    result = supabase.rpc(
        "search_similar_decisions",
        {
            "query_embedding": query_embedding,
            "filter_lpa_code": req.lpa_code,
            "filter_application_type": req.application_type,
            "match_count": req.match_count,
        },
    ).execute()

    return SearchDecisionsResponse(
        results=[
            DecisionResult(
                decision_id=str(row["decision_id"]),
                reference=row["reference"],
                address=row["address"],
                description=row["description"],
                decision=row["decision"],
                decision_date=str(row["decision_date"]),
                lpa_name=row["lpa_name"],
                similarity=round(float(row["similarity"]), 4),
            )
            for row in (result.data or [])
        ]
    )


@app.post("/search/policy", response_model=SearchPolicyResponse)
async def search_policy(
    req: SearchPolicyRequest,
    _: str = Depends(verify_api_key),
    supabase: Client = Depends(get_supabase),
    oai: openai.AsyncOpenAI = Depends(get_openai),
):
    """Vector search for relevant policy chunks."""
    emb_resp = await oai.embeddings.create(
        model="text-embedding-3-small",
        input=req.query_text,
    )
    query_embedding = emb_resp.data[0].embedding

    result = supabase.rpc(
        "search_policy_chunks",
        {
            "query_embedding": query_embedding,
            "filter_lpa_code": req.lpa_code,
            "match_count": req.match_count,
        },
    ).execute()

    return SearchPolicyResponse(
        results=[
            PolicyResult(
                chunk_id=str(row["chunk_id"]),
                lpa_code=row.get("lpa_code"),
                document_name=row["document_name"],
                section=row.get("section"),
                content=row["content"],
                similarity=round(float(row["similarity"]), 4),
            )
            for row in (result.data or [])
        ]
    )


@app.post("/embed/decisions")
async def trigger_embedding(
    req: EmbedRequest,
    _: str = Depends(verify_api_key),
    supabase: Client = Depends(get_supabase),
    oai: openai.AsyncOpenAI = Depends(get_openai),
):
    embedder = DecisionEmbedder(supabase, oai)
    count = await embedder.embed_unprocessed_decisions(lpa_code=req.lpa_code)
    return {"embedded": count}


@app.post("/scrape/run")
async def trigger_scrape(
    req: ScrapeRequest,
    _: str = Depends(verify_api_key),
    supabase: Client = Depends(get_supabase),
):
    orchestrator = ScrapeOrchestrator(supabase)
    results = await orchestrator.run_full_scrape(
        lpa_codes=req.lpa_codes,
        days_back=req.days_back,
        max_per_lpa=req.max_per_lpa,
    )
    return {"results": results}
