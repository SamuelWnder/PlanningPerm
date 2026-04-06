from dataclasses import dataclass, field
from datetime import date
from typing import Literal, Optional


PlanningDecisionType = Literal["approved", "refused", "withdrawn", "split"]


@dataclass
class PlanningDecisionRecord:
    lpa_code: str
    lpa_name: str
    reference: str
    address: str
    description: str
    application_type: str
    decision: PlanningDecisionType
    decision_date: date
    conditions: list[str] = field(default_factory=list)
    officer_name: Optional[str] = None
    appeal_lodged: bool = False
    appeal_decision: Optional[str] = None
    raw_data: Optional[dict] = None


@dataclass
class ScraperResult:
    lpa_code: str
    lpa_name: str
    records: list[PlanningDecisionRecord]
    errors: list[str] = field(default_factory=list)

    @property
    def success_count(self) -> int:
        return len(self.records)

    @property
    def error_count(self) -> int:
        return len(self.errors)
