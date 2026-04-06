"""
APScheduler cron jobs for the Planning Perm Python service.

Jobs:
  - weekly_scrape: Scrape all LPA portals for new decisions
  - weekly_embed:  Embed any unprocessed decisions
  - daily_tracker: Poll Planning Portal for tracker updates
"""

import asyncio
import logging
import os

import httpx
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

logger = logging.getLogger(__name__)

NEXT_APP_URL = os.environ.get("NEXT_APP_URL", "http://localhost:3000")
API_KEY = os.environ.get("API_KEY", "")


async def _post(endpoint: str, body: dict = {}):
    async with httpx.AsyncClient(timeout=300) as client:
        resp = await client.post(
            f"{NEXT_APP_URL}/api/tracker/{endpoint}",
            json=body,
            headers={"x-api-key": API_KEY},
        )
        return resp.json()


async def weekly_scrape():
    """Scrape all configured LPAs for recent decisions."""
    logger.info("Starting weekly LPA scrape...")
    from supabase import create_client
    from scraper.orchestrator import ScrapeOrchestrator
    import openai

    supabase = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_ROLE_KEY"])
    orchestrator = ScrapeOrchestrator(supabase)
    results = await orchestrator.run_full_scrape(days_back=14, max_per_lpa=500)
    total = sum(results.values())
    logger.info(f"Weekly scrape complete: {total} records saved across {len(results)} LPAs")


async def weekly_embed():
    """Embed any unprocessed planning decisions."""
    logger.info("Starting weekly embedding pass...")
    from supabase import create_client
    import openai as openai_module
    from embedder.embedder import DecisionEmbedder

    supabase = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_ROLE_KEY"])
    oai = openai_module.AsyncOpenAI(api_key=os.environ["OPENAI_API_KEY"])
    embedder = DecisionEmbedder(supabase, oai)
    count = await embedder.embed_unprocessed_decisions()
    logger.info(f"Embedding complete: {count} decisions embedded")


async def daily_tracker_poll():
    """Trigger the Next.js tracker poll endpoint."""
    logger.info("Running daily tracker poll...")
    try:
        result = await _post("poll")
        logger.info(f"Tracker poll: {result}")
    except Exception as e:
        logger.error(f"Tracker poll failed: {e}")


def setup_scheduler() -> AsyncIOScheduler:
    scheduler = AsyncIOScheduler()

    # Weekly scrape: Sunday 2am
    scheduler.add_job(
        weekly_scrape,
        CronTrigger(day_of_week="sun", hour=2, minute=0),
        id="weekly_scrape",
        replace_existing=True,
    )

    # Weekly embedding: Sunday 4am (after scrape)
    scheduler.add_job(
        weekly_embed,
        CronTrigger(day_of_week="sun", hour=4, minute=0),
        id="weekly_embed",
        replace_existing=True,
    )

    # Daily tracker poll: 9am weekdays
    scheduler.add_job(
        daily_tracker_poll,
        CronTrigger(day_of_week="mon-fri", hour=9, minute=0),
        id="daily_tracker",
        replace_existing=True,
    )

    return scheduler
