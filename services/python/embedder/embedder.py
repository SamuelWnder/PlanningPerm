"""
Embedding pipeline for planning decisions and policy documents.

Takes raw text (from scraped decisions or PDF policy documents) and:
1. Chunks the text
2. Generates embeddings with OpenAI text-embedding-3-small
3. Stores vectors in Supabase (pgvector)

The embedding content for a planning decision is:
  "[Application Type] at [Address]: [Description]. Decision: [Approved/Refused]."
  This produces a rich semantic representation of what was proposed and decided.
"""

import asyncio
import logging
from typing import Optional

import openai
from supabase import Client
from tqdm import tqdm

logger = logging.getLogger(__name__)

EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIMENSIONS = 1536
BATCH_SIZE = 100  # OpenAI allows up to 2048 inputs per request


class DecisionEmbedder:
    """Generates and stores embeddings for planning decisions."""

    def __init__(self, supabase: Client, openai_client: openai.AsyncOpenAI):
        self.supabase = supabase
        self.openai = openai_client

    def _build_decision_text(self, decision: dict) -> str:
        """Build the text to embed for a planning decision."""
        parts = []
        if decision.get("application_type"):
            parts.append(f"Application type: {decision['application_type']}.")
        if decision.get("address"):
            parts.append(f"Location: {decision['address']}.")
        if decision.get("description"):
            parts.append(f"Proposal: {decision['description']}.")
        if decision.get("decision"):
            parts.append(f"Decision: {decision['decision'].title()}.")
        if decision.get("conditions"):
            conds = decision["conditions"]
            if conds:
                parts.append(f"Number of conditions: {len(conds)}.")
        return " ".join(parts)

    async def embed_unprocessed_decisions(
        self,
        lpa_code: Optional[str] = None,
        batch_size: int = BATCH_SIZE,
    ) -> int:
        """
        Find planning decisions that don't yet have embeddings and embed them.
        Returns count of newly embedded decisions.
        """
        # Find unembedded decisions
        query = (
            self.supabase.table("planning_decisions")
            .select("id, lpa_code, address, description, application_type, decision, conditions")
            .not_.in_("id", self._subquery_embedded_ids())
        )
        if lpa_code:
            query = query.eq("lpa_code", lpa_code)

        decisions = query.limit(5000).execute().data
        if not decisions:
            logger.info("No unembedded decisions found.")
            return 0

        logger.info(f"Embedding {len(decisions)} decisions...")
        total_embedded = 0

        # Process in batches
        for i in range(0, len(decisions), batch_size):
            batch = decisions[i : i + batch_size]
            texts = [self._build_decision_text(d) for d in batch]

            try:
                response = await self.openai.embeddings.create(
                    model=EMBEDDING_MODEL,
                    input=texts,
                )
                embeddings = [item.embedding for item in response.data]

                rows = [
                    {
                        "decision_id": batch[j]["id"],
                        "embedding": embeddings[j],
                        "content": texts[j],
                    }
                    for j in range(len(batch))
                ]

                self.supabase.table("decision_embeddings").insert(rows).execute()
                total_embedded += len(rows)
                logger.info(f"  Embedded batch {i // batch_size + 1} ({total_embedded} total)")

            except Exception as e:
                logger.error(f"Embedding batch {i // batch_size + 1} failed: {e}")

            await asyncio.sleep(0.2)  # Rate limit padding

        return total_embedded

    def _subquery_embedded_ids(self) -> list[str]:
        """Get IDs of decisions that already have embeddings."""
        result = (
            self.supabase.table("decision_embeddings")
            .select("decision_id")
            .execute()
        )
        return [r["decision_id"] for r in (result.data or [])]


class PolicyEmbedder:
    """
    Chunks and embeds policy documents (NPPF, local plans).

    Text is split using a recursive character splitter with overlap
    so that context is preserved at chunk boundaries.
    """

    CHUNK_SIZE = 1000      # characters
    CHUNK_OVERLAP = 200

    def __init__(self, supabase: Client, openai_client: openai.AsyncOpenAI):
        self.supabase = supabase
        self.openai = openai_client

    def _chunk_text(self, text: str) -> list[str]:
        """Split text into overlapping chunks."""
        chunks = []
        start = 0
        while start < len(text):
            end = min(start + self.CHUNK_SIZE, len(text))
            # Try to break on a sentence boundary
            if end < len(text):
                last_period = text.rfind(". ", start, end)
                if last_period > start + self.CHUNK_SIZE // 2:
                    end = last_period + 1
            chunks.append(text[start:end].strip())
            start = end - self.CHUNK_OVERLAP
        return [c for c in chunks if len(c) > 100]

    async def embed_pdf(
        self,
        pdf_path: str,
        document_name: str,
        lpa_code: Optional[str] = None,
        section: Optional[str] = None,
    ) -> int:
        """Extract text from a PDF, chunk it, embed, and store."""
        from pypdf import PdfReader

        reader = PdfReader(pdf_path)
        full_text = "\n".join(
            page.extract_text() or "" for page in reader.pages
        )

        chunks = self._chunk_text(full_text)
        logger.info(f"PDF '{document_name}': {len(reader.pages)} pages → {len(chunks)} chunks")

        return await self._embed_and_store_chunks(
            chunks, document_name, lpa_code, section
        )

    async def embed_text(
        self,
        text: str,
        document_name: str,
        lpa_code: Optional[str] = None,
        section: Optional[str] = None,
    ) -> int:
        chunks = self._chunk_text(text)
        return await self._embed_and_store_chunks(
            chunks, document_name, lpa_code, section
        )

    async def _embed_and_store_chunks(
        self,
        chunks: list[str],
        document_name: str,
        lpa_code: Optional[str],
        section: Optional[str],
    ) -> int:
        total = 0
        for i in range(0, len(chunks), BATCH_SIZE):
            batch = chunks[i : i + BATCH_SIZE]
            response = await self.openai.embeddings.create(
                model=EMBEDDING_MODEL,
                input=batch,
            )
            embeddings = [item.embedding for item in response.data]
            rows = [
                {
                    "lpa_code": lpa_code,
                    "document_name": document_name,
                    "section": section,
                    "content": batch[j],
                    "embedding": embeddings[j],
                }
                for j in range(len(batch))
            ]
            self.supabase.table("policy_chunks").insert(rows).execute()
            total += len(rows)
            await asyncio.sleep(0.2)

        return total
