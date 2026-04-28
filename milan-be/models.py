from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, DateTime, Numeric, Text
from sqlalchemy.dialects.postgresql import UUID, INET, JSONB
from sqlalchemy.sql import func
import uuid
from database import Base

_s = "milan"

class User(Base):
    __tablename__ = "users"
    __table_args__ = {"schema": _s}
    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(100), unique=True)
    email = Column(String(150))
    role = Column(String(50))
    created_at = Column(DateTime, default=func.now())

class LogSource(Base):
    __tablename__ = "log_sources"
    __table_args__ = {"schema": _s}
    source_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_name = Column(String(100))
    source_type = Column(String(50))
    region = Column(String(50))
    api_endpoint = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())

class RawLog(Base):
    __tablename__ = "raw_logs"
    __table_args__ = {"schema": _s}
    log_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_id = Column(UUID(as_uuid=True), ForeignKey('milan.log_sources.source_id'))
    raw_event = Column(JSONB)
    received_time = Column(DateTime, default=func.now())
    hash_signature = Column(String)
    is_duplicate = Column(Boolean, default=False)

class NormalizedEvent(Base):
    __tablename__ = "normalized_events"
    __table_args__ = {"schema": _s}
    event_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    log_id = Column(UUID(as_uuid=True), ForeignKey('milan.raw_logs.log_id'))
    user_email = Column(String(150))
    ip_address = Column(INET)
    geo_location = Column(String(100))
    device = Column(String(100))
    event_type = Column(String(50))
    login_status = Column(String(50))
    event_timestamp = Column(DateTime)
    risk_score = Column(Numeric(5, 2))
    anomaly_flag = Column(Boolean, default=False)
    normalized_json = Column(JSONB)
    created_at = Column(DateTime, default=func.now())

class CorrelatedEvent(Base):
    __tablename__ = "correlated_events"
    __table_args__ = {"schema": _s}
    correlation_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_identifier = Column(String(100))
    linked_events = Column(JSONB)
    correlation_reason = Column(Text)
    created_at = Column(DateTime, default=func.now())

class AnomalyAlert(Base):
    __tablename__ = "anomaly_alerts"
    __table_args__ = {"schema": _s}
    alert_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(UUID(as_uuid=True), ForeignKey('milan.normalized_events.event_id'))
    severity = Column(String(30))
    risk_percent = Column(Numeric(5, 2))
    anomaly_reason = Column(Text)
    alert_status = Column(String(30), default='OPEN')
    assigned_to = Column(UUID(as_uuid=True), ForeignKey('milan.users.user_id'), nullable=True)
    created_at = Column(DateTime, default=func.now())

class AuditLog(Base):
    __tablename__ = "audit_logs"
    __table_args__ = {"schema": _s}
    audit_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    action_type = Column(String(100))
    actor = Column(String(100))
    metadata_ = Column("metadata", JSONB)
    action_timestamp = Column(DateTime, default=func.now())

class IngestionPipelineMonitor(Base):
    __tablename__ = "ingestion_pipeline_monitor"
    __table_args__ = {"schema": _s}
    pipeline_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_id = Column(UUID(as_uuid=True), ForeignKey('milan.log_sources.source_id'))
    ingestion_status = Column(String(50))
    records_processed = Column(Integer)
    error_count = Column(Integer)
    last_sync = Column(DateTime)

class RetentionQueue(Base):
    __tablename__ = "retention_queue"
    __table_args__ = {"schema": _s}
    retention_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    log_id = Column(UUID(as_uuid=True), ForeignKey('milan.raw_logs.log_id'))
    expiry_date = Column(DateTime)
    deletion_approved = Column(Boolean, default=False)
