"""
Idox Public Access scraper for UK planning decisions.

Idox is the most common planning portal software used by English LPAs.
Northgate (used by Birmingham and others) has a separate scraper.

Idox portals follow a predictable structure:
  /online-applications/search.do?action=advanced  -> search form
  /online-applications/applicationDetails.do?activeTab=summary&keyVal=... -> detail page
"""

import asyncio
import re
from datetime import date, datetime
from typing import Optional
from urllib.parse import urljoin, urlencode

import httpx
from bs4 import BeautifulSoup
from tenacity import retry, stop_after_attempt, wait_exponential

from .models import PlanningDecisionRecord, ScraperResult


HOUSEHOLDER_APP_TYPES = [
    "Householder Application",
    "Householder Prior Approval",
    "Full Application",
    "Prior Approval",
    "Certificate of Lawfulness - Proposed",
    "Certificate of Lawfulness - Existing",
]


class IdoxScraper:
    """Scrapes planning decisions from Idox Public Access portals."""

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

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
    )
    async def _get(self, url: str, **kwargs) -> httpx.Response:
        resp = await self.session.get(url, **kwargs)
        resp.raise_for_status()
        return resp

    async def search_decisions(
        self,
        date_from: date,
        date_to: date,
        application_types: Optional[list[str]] = None,
        max_results: int = 1000,
    ) -> ScraperResult:
        """
        Search for decided planning applications in a date range.
        Returns a ScraperResult with all found decisions.
        """
        records: list[PlanningDecisionRecord] = []
        errors: list[str] = []

        search_url = f"{self.base_url}/search.do"
        params = {
            "action": "advanced",
            "dateType": "DC",           # Decision date
            "dateFrom": date_from.strftime("%d/%m/%Y"),
            "dateTo": date_to.strftime("%d/%m/%Y"),
            "searchType": "Application",
        }

        try:
            # Get the search results page
            resp = await self._get(search_url, params=params)
            soup = BeautifulSoup(resp.text, "lxml")

            # Extract total results count
            total_text = soup.select_one(".showing-results, #totalCount")
            total = self._parse_total(total_text.get_text() if total_text else "")

            # Collect application links from paginated results
            app_keys = await self._collect_app_keys(soup, resp.url, total, max_results)

            # Fetch details for each application
            for key in app_keys:
                try:
                    record = await self._fetch_decision_detail(key)
                    if record:
                        records.append(record)
                    await asyncio.sleep(0.5)  # Polite delay
                except Exception as e:
                    errors.append(f"Error fetching {key}: {e}")

        except Exception as e:
            errors.append(f"Search failed: {e}")

        return ScraperResult(
            lpa_code=self.lpa_code,
            lpa_name=self.lpa_name,
            records=records,
            errors=errors,
        )

    async def _collect_app_keys(
        self,
        first_page_soup: BeautifulSoup,
        base_url,
        total: int,
        max_results: int,
    ) -> list[str]:
        """Collect application key values from all result pages."""
        keys: list[str] = []
        soup = first_page_soup
        page = 1

        while len(keys) < min(total, max_results):
            page_keys = self._extract_keys_from_page(soup)
            keys.extend(page_keys)

            if len(page_keys) == 0:
                break

            # Try to find next page link
            next_link = soup.select_one("a[rel='next'], .next a, li.next a")
            if not next_link:
                break

            next_url = urljoin(str(base_url), next_link["href"])
            resp = await self._get(next_url)
            soup = BeautifulSoup(resp.text, "lxml")
            page += 1
            await asyncio.sleep(1.0)

        return keys[:max_results]

    def _extract_keys_from_page(self, soup: BeautifulSoup) -> list[str]:
        keys = []
        for link in soup.select("a[href*='keyVal=']"):
            href = link.get("href", "")
            match = re.search(r"keyVal=([A-Z0-9]+)", href)
            if match:
                keys.append(match.group(1))
        return list(dict.fromkeys(keys))  # deduplicate preserving order

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=2, max=8))
    async def _fetch_decision_detail(
        self, key: str
    ) -> Optional[PlanningDecisionRecord]:
        """Fetch and parse a single application detail page."""
        url = f"{self.base_url}/applicationDetails.do"
        params = {"activeTab": "summary", "keyVal": key}
        resp = await self._get(url, params=params)
        soup = BeautifulSoup(resp.text, "lxml")

        def find_field(label: str) -> str:
            """Find a field value by its label in the summary table."""
            for th in soup.find_all("th"):
                if label.lower() in th.get_text().lower():
                    td = th.find_next_sibling("td")
                    if td:
                        return td.get_text(strip=True)
            return ""

        reference = find_field("Reference") or find_field("Application No")
        if not reference:
            return None

        description = find_field("Proposal") or find_field("Description")
        address = find_field("Location") or find_field("Address")
        app_type = find_field("Application Type")
        decision_str = find_field("Decision")
        decision_date_str = find_field("Decision Date") or find_field("Decided")

        # Parse decision
        decision = self._parse_decision(decision_str)
        if not decision:
            return None  # Skip undecided / non-decision statuses

        # Parse date
        decision_date = self._parse_date(decision_date_str)
        if not decision_date:
            return None

        # Extract conditions from decision notices tab if available
        conditions = await self._fetch_conditions(key)

        return PlanningDecisionRecord(
            lpa_code=self.lpa_code,
            lpa_name=self.lpa_name,
            reference=reference,
            address=address,
            description=description,
            application_type=app_type,
            decision=decision,
            decision_date=decision_date,
            conditions=conditions,
            officer_name=find_field("Case Officer") or find_field("Officer"),
            appeal_lodged=False,
        )

    async def _fetch_conditions(self, key: str) -> list[str]:
        """Attempt to extract conditions from the conditions tab."""
        try:
            url = f"{self.base_url}/applicationDetails.do"
            params = {"activeTab": "conditions", "keyVal": key}
            resp = await self._get(url, params=params)
            soup = BeautifulSoup(resp.text, "lxml")
            conditions = []
            for item in soup.select(".condition-item, .conditionText, li.condition"):
                text = item.get_text(strip=True)
                if text and len(text) > 20:
                    conditions.append(text)
            return conditions[:20]  # Cap at 20 conditions
        except Exception:
            return []

    def _parse_decision(self, text: str) -> Optional[str]:
        text_lower = text.lower()
        if any(w in text_lower for w in ["approv", "grant", "permit", "consent"]):
            return "approved"
        if any(w in text_lower for w in ["refus", "reject", "denied"]):
            return "refused"
        if "withdraw" in text_lower:
            return "withdrawn"
        if "split" in text_lower:
            return "split"
        return None

    def _parse_date(self, text: str) -> Optional[date]:
        for fmt in ("%d/%m/%Y", "%Y-%m-%d", "%d %B %Y", "%d %b %Y"):
            try:
                return datetime.strptime(text.strip(), fmt).date()
            except ValueError:
                continue
        return None

    def _parse_total(self, text: str) -> int:
        match = re.search(r"[\d,]+", text.replace(",", ""))
        return int(match.group()) if match else 0
