from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID
from decimal import Decimal

class UserBase(BaseModel):
    username: str
    email: str
    role: str

class UserResponse(UserBase):
    user_id: UUID
    created_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)

class NormalizedEventResponse(BaseModel):
    event_id: UUID
    user_email: Optional[str]
    ip_address: Optional[str]
    geo_location: Optional[str]
    device: Optional[str]
    event_type: Optional[str]
    login_status: Optional[str]
    event_timestamp: Optional[datetime]
    risk_score: Optional[Decimal]
    anomaly_flag: Optional[bool]
    normalized_json: Optional[Dict[str, Any]]
    created_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)

class AnomalyAlertResponse(BaseModel):
    alert_id: UUID
    event_id: UUID
    severity: Optional[str]
    risk_percent: Optional[Decimal]
    anomaly_reason: Optional[str]
    alert_status: Optional[str]
    created_at: Optional[datetime]
    
    event: Optional[NormalizedEventResponse] = None # Added for joined data

    model_config = ConfigDict(from_attributes=True)

class AuditLogResponse(BaseModel):
    audit_id: UUID
    action_type: Optional[str]
    actor: Optional[str]
    metadata_: Optional[Dict[str, Any]] = None # alias doesn't work well without Field, let's keep it simple
    action_timestamp: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)
