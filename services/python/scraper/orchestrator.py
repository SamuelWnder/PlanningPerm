"""
Orchestrates scraping across all configured LPAs.
Called by the APScheduler cron job weekly.
"""

import asyncio
import logging
from datetime import date, timedelta
from typing import Optional

from supabase import create_client, Client

from .idox_scraper import IdoxScraper
from .northgate_scraper import NorthgateScraper
from .models import PlanningDecisionRecord, ScraperResult

logger = logging.getLogger(__name__)


class ScrapeOrchestrator:
    def __init__(self, supabase: Client):
        self.supabase = supabase

    async def run_full_scrape(
        self,
        lpa_codes: Optional[list[str]] = None,
        days_back: int = 90,
        max_per_lpa: int = 500,
    ) -> dict[str, int]:
        """
        Scrape recent decisions for all (or specified) LPAs.
        Returns a dict of lpa_code -> records_saved.
        """
        # Fetch LPA config from DB
        query = self.supabase.table("lpas").select("*")
        if lpa_codes:
            query = query.in_("code", lpa_codes)
        lpas = query.execute().data

        date_to = date.today()
        date_from = date_to - timedelta(days=days_back)

        results: dict[str, int] = {}

        for lpa in lpas:
            logger.info(f"Scraping {lpa['name']} ({lpa['code']})...")
            try:
                result = await self._scrape_lpa(lpa, date_from, date_to, max_per_lpa)
                saved = await self._save_records(result.records)
                results[lpa["code"]] = saved

                # Update last_scraped and count
                self.supabase.table("lpas").update({
                    "last_scraped": date.today().isoformat(),
                    "applications_scraped": lpa.get("applications_scraped", 0) + saved,
                }).eq("code", lpa["code"]).execute()

                logger.info(f"  Saved {saved} records, {len(result.errors)} errors")
                if result.errors:
                    for err in result.errors[:5]:
                        logger.warning(f"  {err}")

            except Exception as e:
                logger.error(f"Failed to scrape {lpa['name']}: {e}")
                results[lpa["code"]] = 0

            # Polite pause between LPAs
            await asyncio.sleep(5)

        return results

    async def _scrape_lpa(
        self,
        lpa: dict,
        date_from: date,
        date_to: date,
        max_results: int,
    ) -> ScraperResult:
        portal_type = lpa.get("portal_type", "idox")

        if portal_type == "northgate":
            async with NorthgateScraper(lpa["code"], lpa["name"], lpa["portal_url"]) as scraper:
                return await scraper.search_decisions(date_from, date_to, max_results)
        else:
            async with IdoxScraper(lpa["code"], lpa["name"], lpa["portal_url"]) as scraper:
                return await scraper.search_decisions(date_from, date_to, max_results=max_results)

    async def _save_records(self, records: list[PlanningDecisionRecord]) -> int:
        if not records:
            return 0

        rows = [
            {
                "lpa_code": r.lpa_code,
                "lpa_name": r.lpa_name,
                "reference": r.reference,
                "address": r.address,
                "description": r.description,
                "application_type": r.application_type,
                "decision": r.decision,
                "decision_date": r.decision_date.isoformat(),
                "conditions": r.conditions,
                "officer_name": r.officer_name,
                "appeal_lodged": r.appeal_lodged,
                "appeal_decision": r.appeal_decision,
            }
            for r in records
        ]

        # Upsert: ignore duplicates (lpa_code, reference unique constraint)
        result = (
            self.supabase.table("planning_decisions")
            .upsert(rows, on_conflict="lpa_code,reference", ignore_duplicates=True)
            .execute()
        )

        return len(result.data) if result.data else 0
