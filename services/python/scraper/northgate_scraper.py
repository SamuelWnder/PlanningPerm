"""
Northgate PlanningExplorer scraper.

Used by Birmingham City Council and some other authorities.
The interface differs from Idox — it uses a ASP.NET WebForms-style UI.
"""

import asyncio
import re
from datetime import date, datetime
from typing import Optional
from urllib.parse import urljoin

import httpx
from bs4 import BeautifulSoup
from tenacity import retry, stop_after_attempt, wait_exponential

from .models import PlanningDecisionRecord, ScraperResult


class NorthgateScraper:
    """Scrapes planning decisions from Northgate PlanningExplorer portals."""

    def __init__(self, lpa_code: str, lpa_name: str, base_url: str):
        self.lpa_code = lpa_code
        self.lpa_name = lpa_name
        self.base_url = base_url.rstrip("/")
        self.session = httpx.AsyncClient(
            timeout=30.0,
            headers={
                "User-Agent": (
                    "PlanningPerm/1.0 (Research tool aggregating public planning data; "
                    "contact: data@planningperm.co.uk)"
                )
            },
            follow_redirects=True,
        )

    async def __aenter__(self):
        return self

    async def __aexit__(self, *args):
        await self.session.aclose()

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=2, max=10))
    async def _get(self, url: str, **kwargs) -> httpx.Response:
        resp = await self.session.get(url, **kwargs)
        resp.raise_for_status()
        return resp

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=2, max=10))
    async def _post(self, url: str, **kwargs) -> httpx.Response:
        resp = await self.session.post(url, **kwargs)
        resp.raise_for_status()
        return resp

    async def search_decisions(
        self,
        date_from: date,
        date_to: date,
        max_results: int = 1000,
    ) -> ScraperResult:
        records: list[PlanningDecisionRecord] = []
        errors: list[str] = []

        try:
            search_url = f"{self.base_url}/PlanAppDisplay.aspx"
            # First GET to get the ASP.NET viewstate tokens
            resp = await self._get(search_url)
            soup = BeautifulSoup(resp.text, "lxml")

            viewstate = soup.find("input", {"name": "__VIEWSTATE"})
            event_validation = soup.find("input", {"name": "__EVENTVALIDATION"})

            post_data = {
                "__VIEWSTATE": viewstate["value"] if viewstate else "",
                "__EVENTVALIDATION": event_validation["value"] if event_validation else "",
                "searchDecisionDateFrom": date_from.strftime("%d/%m/%Y"),
                "searchDecisionDateTo": date_to.strftime("%d/%m/%Y"),
                "btnSearch": "Search",
            }

            resp = await self._post(search_url, data=post_data)
            soup = BeautifulSoup(resp.text, "lxml")

            app_refs = self._extract_references(soup)

            for ref in app_refs[:max_results]:
                try:
                    record = await self._fetch_detail(ref)
                    if record:
                        records.append(record)
                    await asyncio.sleep(0.5)
                except Exception as e:
                    errors.append(f"Error fetching {ref}: {e}")

        except Exception as e:
            errors.append(f"Search failed: {e}")

        return ScraperResult(
            lpa_code=self.lpa_code,
            lpa_name=self.lpa_name,
            records=records,
            errors=errors,
        )

    def _extract_references(self, soup: BeautifulSoup) -> list[str]:
        refs = []
        for link in soup.select("a[href*='PlanAppDisp']"):
            href = link.get("href", "")
            match = re.search(r"AppNo=([^&]+)", href)
            if match:
                refs.append(match.group(1))
        return list(dict.fromkeys(refs))

    async def _fetch_detail(self, ref: str) -> Optional[PlanningDecisionRecord]:
        url = f"{self.base_url}/PlanAppDisp.aspx"
        resp = await self._get(url, params={"AppNo": ref})
        soup = BeautifulSoup(resp.text, "lxml")

        def get_field(label: str) -> str:
            for row in soup.select("tr"):
                th = row.find("th") or row.find("td", class_="label")
                if th and label.lower() in th.get_text().lower():
                    td = row.find("td", class_="value") or th.find_next_sibling("td")
                    if td:
                        return td.get_text(strip=True)
            return ""

        decision_str = get_field("Decision")
        decision = self._parse_decision(decision_str)
        if not decision:
            return None

        decision_date = self._parse_date(get_field("Decision Date"))
        if not decision_date:
            return None

        return PlanningDecisionRecord(
            lpa_code=self.lpa_code,
            lpa_name=self.lpa_name,
            reference=ref,
            address=get_field("Location") or get_field("Address"),
            description=get_field("Proposal") or get_field("Description"),
            application_type=get_field("Application Type"),
            decision=decision,
            decision_date=decision_date,
            officer_name=get_field("Case Officer"),
        )

    def _parse_decision(self, text: str) -> Optional[str]:
        text_lower = text.lower()
        if any(w in text_lower for w in ["approv", "grant", "permit"]):
            return "approved"
        if any(w in text_lower for w in ["refus", "reject"]):
            return "refused"
        if "withdraw" in text_lower:
            return "withdrawn"
        return None

    def _parse_date(self, text: str) -> Optional[date]:
        for fmt in ("%d/%m/%Y", "%Y-%m-%d", "%d %B %Y"):
            try:
                return datetime.strptime(text.strip(), fmt).date()
            except ValueError:
                continue
        return None
