from fastapi import FastAPI, Depends, Request
from fastapi.routing import APIRouter
from fastapi.responses import JSONResponse, FileResponse, RedirectResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi.middleware.cors import CORSMiddleware
import os
import traceback
import logging

import models
import schemas
from database import engine, get_db

FE_DIST = os.path.realpath(
    os.path.join(os.path.dirname(__file__), "..", "milan-fe", "dist")
)
FE_BUNDLED = os.path.isdir(FE_DIST)

logging.basicConfig(level=logging.ERROR, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(title="AI Log Intelligence Backend")


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": "HTTPException",
            "status_code": exc.status_code,
            "message": str(exc.detail),
            "path": str(request.url),
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "error": "ValidationError",
            "status_code": 422,
            "message": "Request validation failed",
            "details": exc.errors(),
            "path": str(request.url),
        },
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    tb = traceback.format_exc()
    logger.error("Unhandled exception on %s\n%s", request.url, tb)
    return JSONResponse(
        status_code=500,
        content={
            "error": type(exc).__name__,
            "status_code": 500,
            "message": str(exc),
            "traceback": tb,
            "path": str(request.url),
        },
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

router = APIRouter(prefix="/milan-aegis")


@router.get("/api/logs/normalized")
def get_normalized_logs(db: Session = Depends(get_db)):
    logs = db.query(models.NormalizedEvent).order_by(models.NormalizedEvent.event_timestamp.desc()).all()
    result = []
    for event in logs:
        nj = event.normalized_json or {}
        source = nj.get('source', event.device or 'Unknown')
        reason = nj.get('reason', '')
        normalized_text = ' '.join(filter(None, [event.event_type, event.login_status, reason]))
        result.append({
            "id": str(event.event_id),
            "timestamp": event.event_timestamp.strftime("%d/%m %H:%M:%S") if event.event_timestamp else "",
            "user": event.user_email or "Unknown",
            "event": (event.event_type or "Unknown").replace('_', ' ').title(),
            "status": event.login_status or "unknown",
            "system": source,
            "ip": str(event.ip_address) if event.ip_address else "",
            "location": event.geo_location or "Unknown",
            "normalizedText": normalized_text,
            "riskScore": float(event.risk_score) if event.risk_score else 0,
            "anomalyFlag": event.anomaly_flag or False,
            "original": nj,
        })
    return result


@router.get("/api/alerts")
def get_alerts(db: Session = Depends(get_db)):
    alerts = db.query(models.AnomalyAlert, models.NormalizedEvent).join(
        models.NormalizedEvent, models.AnomalyAlert.event_id == models.NormalizedEvent.event_id
    ).all()
    result = []
    for alert, event in alerts:
        result.append({
            "id": str(alert.alert_id),
            "timestamp": event.event_timestamp.strftime("%d/%m %H:%M:%S") if event.event_timestamp else alert.created_at.strftime("%d/%m %H:%M:%S"),
            "user": event.user_email,
            "system": event.normalized_json.get('source', 'Unknown') if event.normalized_json else 'Unknown',
            "event": event.event_type,
            "status": alert.alert_status.lower(),
            "riskScore": float(alert.risk_percent) if alert.risk_percent else 0,
            "severity": alert.severity.lower() if alert.severity else 'medium',
            "reason": alert.anomaly_reason,
            "original": event.normalized_json,
            "rowNumber": 1
        })
    return result


@router.get("/api/stats")
def get_stats(db: Session = Depends(get_db)):
    total_raw = db.query(func.count(models.RawLog.log_id)).scalar() or 0
    normalized_count = db.query(func.count(models.NormalizedEvent.event_id)).scalar() or 0
    duplicates_count = db.query(func.count(models.RawLog.log_id)).filter(models.RawLog.is_duplicate == True).scalar() or 0
    anomalies = db.query(func.count(models.AnomalyAlert.alert_id)).scalar() or 0
    return {
        "totalEvents": total_raw,
        "cleanedRecords": normalized_count,
        "duplicatesRemoved": duplicates_count,
        "anomaliesDetected": anomalies,
    }


@router.get("/api/summary")
def get_summary(db: Session = Depends(get_db)):
    # Sources — count normalized events grouped by source/device
    rows = db.query(models.NormalizedEvent).all()
    source_counts = {}
    for ev in rows:
        nj = ev.normalized_json or {}
        source = nj.get('source') or ev.device or 'Unknown'
        source_counts[source] = source_counts.get(source, 0) + 1

    sources = [
        {"label": label, "value": f"{count} event{'s' if count != 1 else ''}", "detail": f"Events attributed to {label} in the analyzed baseline."}
        for label, count in sorted(source_counts.items(), key=lambda kv: -kv[1])
    ] or [
        {"label": "Identity", "value": "0 events", "detail": "No events in the analyzed baseline yet."}
    ]

    # Policy — derive from anomaly alerts
    alerts = db.query(models.AnomalyAlert).all()
    policy_violations = sum(1 for a in alerts if a.anomaly_reason and 'policy' in (a.anomaly_reason or '').lower())
    privileged = sum(1 for a in alerts if a.anomaly_reason and ('priv' in (a.anomaly_reason or '').lower() or 'admin' in (a.anomaly_reason or '').lower()))
    blocked = sum(1 for a in alerts if a.alert_status in ('REVIEWED', 'CLOSED'))

    policy = [
        {"label": "Policy Violations", "value": str(policy_violations), "detail": "Alerts referencing a policy or compliance breach."},
        {"label": "Privileged Events", "value": str(privileged), "detail": "Privileged or admin activity flagged for review."},
        {"label": "Blocked / Reviewed", "value": str(blocked), "detail": "Alerts that have been reviewed or closed."},
    ]

    # Reports — static summary cards (status reflects data presence)
    has_data = len(rows) > 0
    status = "Ready" if has_data else "Pending"
    total_alerts = len(alerts)
    reports = [
        {"label": "Daily Risk Summary", "value": status, "detail": f"{total_alerts} anomaly alert{'s' if total_alerts != 1 else ''} across {len(rows)} sampled event{'s' if len(rows) != 1 else ''}."},
        {"label": "Incident Summary", "value": status, "detail": "Highest-severity incidents from the analyzed baseline."},
        {"label": "Trend Summary", "value": status, "detail": "Activity patterns inferred from the analyzed window."},
    ]

    return {
        "sources": sources,
        "reports": reports,
        "policy": policy,
    }


@router.get("/api/audit")
def get_audit_logs(db: Session = Depends(get_db)):
    audits = db.query(models.AuditLog).order_by(models.AuditLog.action_timestamp.desc()).all()
    result = []
    for audit in audits:
        meta = audit.metadata_ or {}
        action = audit.action_type or 'process'
        result.append({
            "id": str(audit.audit_id),
            "type": action,
            "title": meta.get('title', action.replace('_', ' ').title()),
            "detail": meta.get('detail', f"Actor: {audit.actor or 'system'}"),
            "timestamp": audit.action_timestamp.strftime("%d/%m %H:%M:%S") if audit.action_timestamp else "",
        })
    return result


app.include_router(router)


# Pure backend: no root route, no FE-serving routes. Any path other
# than /milan-aegis/api/* falls through to the StarletteHTTPException
# handler above, which returns the standard FastAPI-style JSON 404:
#
#   {"error":"HTTPException","status_code":404,"message":"Not Found","path":"..."}
#
# In the unified Docker deploy (root /Dockerfile or local docker-compose)
# the FE is served by a separate path layer (nginx in milan-fe or the
# Vite dev server) that proxies /milan-aegis/api/* here. This file does
# not need to know about the FE.


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "5000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
