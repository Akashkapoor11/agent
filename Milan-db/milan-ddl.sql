-- Create Database
-- CREATE DATABASE ai_log_intelligence;

-- \c ai_log_intelligence;

CREATE SCHEMA IF NOT EXISTS milan;

SET search_path TO milan;

-------------------------------------
-- 1. USERS / RBAC
-------------------------------------
CREATE TABLE IF NOT EXISTS milan.users (
 user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 username VARCHAR(100) UNIQUE,
 email VARCHAR(150),
 role VARCHAR(50), -- admin, analyst, compliance
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-------------------------------------
-- 2. LOG SOURCES
-------------------------------------
CREATE TABLE IF NOT EXISTS milan.log_sources (
 source_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 source_name VARCHAR(100), -- Azure
 source_type VARCHAR(50),
 region VARCHAR(50),
 api_endpoint TEXT,
 is_active BOOLEAN DEFAULT TRUE,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-------------------------------------
-- 3. RAW LOGS (JSON STORAGE)
-------------------------------------
CREATE TABLE IF NOT EXISTS milan.raw_logs (
 log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 source_id UUID REFERENCES milan.log_sources(source_id),
 raw_event JSONB,
 received_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 hash_signature TEXT,
 is_duplicate BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_raw_json ON milan.raw_logs USING GIN(raw_event);

-------------------------------------
-- 4. NORMALIZED LOG EVENTS
-------------------------------------
CREATE TABLE IF NOT EXISTS milan.normalized_events (
 event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 log_id UUID REFERENCES milan.raw_logs(log_id),

 user_email VARCHAR(150),
 ip_address INET,
 geo_location VARCHAR(100),
 device VARCHAR(100),

 event_type VARCHAR(50), -- login success/failure
 login_status VARCHAR(50),

 event_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 risk_score NUMERIC(5,2),
 anomaly_flag BOOLEAN DEFAULT FALSE,

 normalized_json JSONB,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_event_json
ON milan.normalized_events USING GIN(normalized_json);

-------------------------------------
-- 5. CORRELATED SECURITY EVENTS
-------------------------------------
CREATE TABLE IF NOT EXISTS milan.correlated_events (
 correlation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 session_identifier VARCHAR(100),
 linked_events JSONB,
 correlation_reason TEXT,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-------------------------------------
-- 6. ANOMALY ALERTS
-------------------------------------
CREATE TABLE IF NOT EXISTS milan.anomaly_alerts (
 alert_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

 event_id UUID REFERENCES milan.normalized_events(event_id),

 severity VARCHAR(30),
 risk_percent NUMERIC(5,2),

 anomaly_reason TEXT,

 alert_status VARCHAR(30) DEFAULT 'OPEN',
 assigned_to UUID REFERENCES milan.users(user_id),

 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-------------------------------------
-- 7. AUDIT TRAIL
-------------------------------------
CREATE TABLE IF NOT EXISTS milan.audit_logs (
 audit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 action_type VARCHAR(100),
 actor VARCHAR(100),
 metadata JSONB,
 action_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-------------------------------------
-- 8. PIPELINE HEALTH MONITOR
-------------------------------------
CREATE TABLE IF NOT EXISTS milan.ingestion_pipeline_monitor (
 pipeline_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 source_id UUID REFERENCES milan.log_sources(source_id),
 ingestion_status VARCHAR(50),
 records_processed INTEGER,
 error_count INTEGER,
 last_sync TIMESTAMP
);

-------------------------------------
-- 9. RETENTION MANAGEMENT
-------------------------------------
CREATE TABLE IF NOT EXISTS milan.retention_queue (
 retention_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 log_id UUID REFERENCES milan.raw_logs(log_id),
 expiry_date TIMESTAMP,
 deletion_approved BOOLEAN DEFAULT FALSE
);
