-- Create Database
-- CREATE DATABASE ai_log_intelligence;

-- \c ai_log_intelligence;

CREATE SCHEMA IF NOT EXISTS milan;

SET search_path TO milan;

-------------------------------------
-- 1. USERS / RBAC
-------------------------------------
CREATE TABLE IF NOT EXISTS milan.users (
 user_id   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
 username  VARCHAR(100) NOT NULL UNIQUE,
 email     VARCHAR(150) NOT NULL UNIQUE,
 role      VARCHAR(50)  NOT NULL CHECK (role IN ('admin', 'analyst', 'compliance')),
 created_at TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
);

-------------------------------------
-- 2. LOG SOURCES
-------------------------------------
CREATE TABLE IF NOT EXISTS milan.log_sources (
 source_id   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
 source_name VARCHAR(100) NOT NULL UNIQUE,
 source_type VARCHAR(50)  NOT NULL,
 region      VARCHAR(50),
 api_endpoint TEXT,
 is_active   BOOLEAN      DEFAULT TRUE,
 created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-------------------------------------
-- 3. RAW LOGS (JSON STORAGE)
-------------------------------------
CREATE TABLE IF NOT EXISTS milan.raw_logs (
 log_id          UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
 source_id       UUID      REFERENCES milan.log_sources(source_id) ON DELETE SET NULL,
 raw_event       JSONB,
 received_time   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 hash_signature  TEXT      UNIQUE,
 is_duplicate    BOOLEAN   DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_raw_json        ON milan.raw_logs USING GIN(raw_event);
CREATE INDEX IF NOT EXISTS idx_raw_source_id   ON milan.raw_logs(source_id);
CREATE INDEX IF NOT EXISTS idx_raw_is_dup      ON milan.raw_logs(is_duplicate);
CREATE INDEX IF NOT EXISTS idx_raw_recv_time   ON milan.raw_logs(received_time DESC);

-------------------------------------
-- 4. NORMALIZED LOG EVENTS
-------------------------------------
CREATE TABLE IF NOT EXISTS milan.normalized_events (
 event_id        UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
 log_id          UUID         REFERENCES milan.raw_logs(log_id) ON DELETE SET NULL,

 user_email      VARCHAR(150) NOT NULL,
 ip_address      INET         NOT NULL,
 geo_location    VARCHAR(100),
 device          VARCHAR(100),

 event_type      VARCHAR(50)  NOT NULL,
 login_status    VARCHAR(50),

 event_timestamp TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
 risk_score      NUMERIC(5,2) CHECK (risk_score BETWEEN 0 AND 100),
 anomaly_flag    BOOLEAN      DEFAULT FALSE,

 normalized_json JSONB,
 created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_event_json          ON milan.normalized_events USING GIN(normalized_json);
CREATE INDEX IF NOT EXISTS idx_event_log_id        ON milan.normalized_events(log_id);
CREATE INDEX IF NOT EXISTS idx_event_timestamp     ON milan.normalized_events(event_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_event_anomaly       ON milan.normalized_events(anomaly_flag);
CREATE INDEX IF NOT EXISTS idx_event_user_email    ON milan.normalized_events(user_email);

-------------------------------------
-- 5. CORRELATED SECURITY EVENTS
-------------------------------------
CREATE TABLE IF NOT EXISTS milan.correlated_events (
 correlation_id     UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
 session_identifier VARCHAR(100),
 linked_events      JSONB,
 correlation_reason TEXT,
 created_at         TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_correlated_linked ON milan.correlated_events USING GIN(linked_events);

-------------------------------------
-- 6. ANOMALY ALERTS
-------------------------------------
CREATE TABLE IF NOT EXISTS milan.anomaly_alerts (
 alert_id       UUID         PRIMARY KEY DEFAULT gen_random_uuid(),

 event_id       UUID         REFERENCES milan.normalized_events(event_id) ON DELETE CASCADE,

 severity       VARCHAR(30)  CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
 risk_percent   NUMERIC(5,2) CHECK (risk_percent BETWEEN 0 AND 100),

 anomaly_reason TEXT,

 alert_status   VARCHAR(30)  DEFAULT 'OPEN'
                             CHECK (alert_status IN ('OPEN', 'REVIEWED', 'CLOSED', 'FALSE_POSITIVE')),
 assigned_to    UUID         REFERENCES milan.users(user_id) ON DELETE SET NULL,

 created_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_alert_event_id    ON milan.anomaly_alerts(event_id);
CREATE INDEX IF NOT EXISTS idx_alert_assigned_to ON milan.anomaly_alerts(assigned_to);
CREATE INDEX IF NOT EXISTS idx_alert_status      ON milan.anomaly_alerts(alert_status);
CREATE INDEX IF NOT EXISTS idx_alert_created_at  ON milan.anomaly_alerts(created_at DESC);

-------------------------------------
-- 7. AUDIT TRAIL
-------------------------------------
CREATE TABLE IF NOT EXISTS milan.audit_logs (
 audit_id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
 action_type      VARCHAR(100),
 actor            VARCHAR(100),
 metadata         JSONB,
 action_timestamp TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON milan.audit_logs(action_timestamp DESC);

-------------------------------------
-- 8. PIPELINE HEALTH MONITOR
-------------------------------------
CREATE TABLE IF NOT EXISTS milan.ingestion_pipeline_monitor (
 pipeline_id        UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
 source_id          UUID      REFERENCES milan.log_sources(source_id) ON DELETE SET NULL,
 ingestion_status   VARCHAR(50),
 records_processed  INTEGER   DEFAULT 0,
 error_count        INTEGER   DEFAULT 0,
 last_sync          TIMESTAMP,
 created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pipeline_source_id ON milan.ingestion_pipeline_monitor(source_id);

-------------------------------------
-- 9. RETENTION MANAGEMENT
-------------------------------------
CREATE TABLE IF NOT EXISTS milan.retention_queue (
 retention_id      UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
 log_id            UUID      REFERENCES milan.raw_logs(log_id) ON DELETE CASCADE,
 expiry_date       TIMESTAMP,
 deletion_approved BOOLEAN   DEFAULT FALSE,
 created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_retention_log_id ON milan.retention_queue(log_id);
