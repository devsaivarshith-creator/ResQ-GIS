"""
Mock Alert Provider.
Provides realistic disaster alerts when live SACHET/NDMA feed is in demo mode.
"""
from __future__ import annotations
import json
from pathlib import Path
from datetime import datetime
from app.schemas import DisasterAlert, Severity, DataProvenance
from app.providers.base import AlertProvider

DATA_PATH = Path(__file__).resolve().parents[4] / "data" / "demo" / "alerts.json"


class MockAlertProvider(AlertProvider):
    @property
    def name(self) -> str:
        return "Mock Alert Provider (Demo Mode)"

    async def get_active_alerts(self, region: str | None = None) -> list[DisasterAlert]:
        if not DATA_PATH.exists():
            return []

        try:
            with open(DATA_PATH, "r", encoding="utf-8") as f:
                items = json.load(f)

            alerts = []
            for a in items:
                area = a.get("region", "")
                if region and region.lower() not in area.lower():
                    continue

                sev_val = a.get("severity", "yellow").lower()
                sev = Severity.RED if sev_val == "red" else Severity.ORANGE if sev_val == "orange" else Severity.YELLOW

                # Ensure issued_at is active and recent (within past 72h, not stuck in yesterday)
                raw_issued = a.get("issuedAt")
                if raw_issued:
                    try:
                        parsed_dt = datetime.fromisoformat(raw_issued.replace("Z", "+00:00")).replace(tzinfo=None)
                        if (datetime.utcnow() - parsed_dt).total_seconds() > 86400 * 3:
                            issued_dt = datetime.utcnow() - timedelta(hours=((len(alerts) * 6) % 70) + 0.5)
                        else:
                            issued_dt = parsed_dt
                    except Exception:
                        issued_dt = datetime.utcnow() - timedelta(hours=1)
                else:
                    issued_dt = datetime.utcnow() - timedelta(hours=1)

                alerts.append(
                    DisasterAlert(
                        id=a.get("id"),
                        type=a.get("type", "General Alert"),
                        severity=sev,
                        title=a.get("title", ""),
                        description=a.get("description", ""),
                        issued_at=issued_dt,
                        expires_at=datetime.fromisoformat(a.get("expiresAt")) if a.get("expiresAt") else None,
                        region=area,
                        geometry=a.get("geometry"),
                        source=a.get("source", "DEMO"),
                        provenance=DataProvenance.DEMO,
                    )
                )
            return alerts
        except Exception:
            return []
