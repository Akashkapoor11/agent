-- =====================================================
-- PERMANENT SEED DATA  (safe to re-run — idempotent)
-- =====================================================

SET search_path TO milan;

-- USERS
INSERT INTO milan.users (username, email, role)
VALUES
  ('securityadmin', 'admin@company.com',       'admin'),
  ('analyst1',      'analyst@company.com',     'analyst'),
  ('analyst2',      'analyst2@company.com',    'analyst'),
  ('compliance1',   'compliance@company.com',  'compliance')
ON CONFLICT (username) DO NOTHING;

-- LOG SOURCES
INSERT INTO milan.log_sources (source_name, source_type, region)
SELECT 'Azure', 'Cloud', 'India' WHERE NOT EXISTS (SELECT 1 FROM milan.log_sources WHERE source_name = 'Azure');

-- =====================================================
-- RAW LOGS  (18 rows, explicit UUIDs for idempotency)
-- =====================================================
INSERT INTO milan.raw_logs (log_id, source_id, raw_event, hash_signature, is_duplicate)
SELECT 'a1000001-0000-0000-0000-000000000000'::uuid, s.source_id,
  '{"user":"akash.kapoor","ip":"49.37.22.14","country":"India","device":"Windows","login_result":"success"}'::jsonb,
  'hash_rl_001', false FROM milan.log_sources s WHERE s.source_name='Azure'
ON CONFLICT (log_id) DO NOTHING;

INSERT INTO milan.raw_logs (log_id, source_id, raw_event, hash_signature, is_duplicate)
SELECT 'a1000002-0000-0000-0000-000000000000'::uuid, s.source_id,
  '{"user":"akash.kapoor","ip":"172.33.4.21","country":"Russia","device":"Linux","login_result":"failed"}'::jsonb,
  'hash_rl_002', false FROM milan.log_sources s WHERE s.source_name='Azure'
ON CONFLICT (log_id) DO NOTHING;

INSERT INTO milan.raw_logs (log_id, source_id, raw_event, hash_signature, is_duplicate)
SELECT 'a1000003-0000-0000-0000-000000000000'::uuid, s.source_id,
  '{"user":"priya.sharma","ip":"116.31.116.50","country":"China","device":"Mac","login_result":"failed"}'::jsonb,
  'hash_rl_003', false FROM milan.log_sources s WHERE s.source_name='Azure'
ON CONFLICT (log_id) DO NOTHING;

INSERT INTO milan.raw_logs (log_id, source_id, raw_event, hash_signature, is_duplicate)
SELECT 'a1000004-0000-0000-0000-000000000000'::uuid, s.source_id,
  '{"user":"priya.sharma","ip":"116.31.116.50","country":"China","device":"Mac","login_result":"failed"}'::jsonb,
  'hash_rl_004', true FROM milan.log_sources s WHERE s.source_name='Azure'
ON CONFLICT (log_id) DO NOTHING;

INSERT INTO milan.raw_logs (log_id, source_id, raw_event, hash_signature, is_duplicate)
SELECT 'a1000005-0000-0000-0000-000000000000'::uuid, s.source_id,
  '{"user":"rahul.gupta","ip":"103.5.134.20","country":"India","device":"Android","login_result":"success"}'::jsonb,
  'hash_rl_005', false FROM milan.log_sources s WHERE s.source_name='Azure'
ON CONFLICT (log_id) DO NOTHING;

INSERT INTO milan.raw_logs (log_id, source_id, raw_event, hash_signature, is_duplicate)
SELECT 'a1000006-0000-0000-0000-000000000000'::uuid, s.source_id,
  '{"user":"sarah.jones","ip":"82.45.12.200","country":"United Kingdom","device":"Windows","login_result":"success","hour":2}'::jsonb,
  'hash_rl_006', false FROM milan.log_sources s WHERE s.source_name='Azure'
ON CONFLICT (log_id) DO NOTHING;

INSERT INTO milan.raw_logs (log_id, source_id, raw_event, hash_signature, is_duplicate)
SELECT 'a1000007-0000-0000-0000-000000000000'::uuid, s.source_id,
  '{"user":"john.smith","ip":"44.201.18.99","country":"United States","device":"Windows","login_result":"success","action":"privilege_escalation"}'::jsonb,
  'hash_rl_007', false FROM milan.log_sources s WHERE s.source_name='Azure'
ON CONFLICT (log_id) DO NOTHING;

INSERT INTO milan.raw_logs (log_id, source_id, raw_event, hash_signature, is_duplicate)
SELECT 'a1000008-0000-0000-0000-000000000000'::uuid, s.source_id,
  '{"user":"amit.patel","ip":"103.21.58.14","country":"India","device":"Windows","login_result":"success"}'::jsonb,
  'hash_rl_008', false FROM milan.log_sources s WHERE s.source_name='Azure'
ON CONFLICT (log_id) DO NOTHING;

INSERT INTO milan.raw_logs (log_id, source_id, raw_event, hash_signature, is_duplicate)
SELECT 'a1000009-0000-0000-0000-000000000000'::uuid, s.source_id,
  '{"user":"maria.garcia","ip":"212.170.36.15","country":"Spain","device":"Mac","login_result":"success"}'::jsonb,
  'hash_rl_009', false FROM milan.log_sources s WHERE s.source_name='Azure'
ON CONFLICT (log_id) DO NOTHING;

INSERT INTO milan.raw_logs (log_id, source_id, raw_event, hash_signature, is_duplicate)
SELECT 'a1000010-0000-0000-0000-000000000000'::uuid, s.source_id,
  '{"user":"david.lee","ip":"175.45.176.0","country":"South Korea","device":"Linux","login_result":"failed"}'::jsonb,
  'hash_rl_010', false FROM milan.log_sources s WHERE s.source_name='Azure'
ON CONFLICT (log_id) DO NOTHING;

INSERT INTO milan.raw_logs (log_id, source_id, raw_event, hash_signature, is_duplicate)
SELECT 'a1000011-0000-0000-0000-000000000000'::uuid, s.source_id,
  '{"user":"priya.sharma","ip":"103.11.68.25","country":"India","device":"Mac","login_result":"success"}'::jsonb,
  'hash_rl_011', false FROM milan.log_sources s WHERE s.source_name='Azure'
ON CONFLICT (log_id) DO NOTHING;

INSERT INTO milan.raw_logs (log_id, source_id, raw_event, hash_signature, is_duplicate)
SELECT 'a1000012-0000-0000-0000-000000000000'::uuid, s.source_id,
  '{"user":"akash.kapoor","ip":"49.37.22.14","country":"India","device":"Windows","login_result":"success","action":"file_access"}'::jsonb,
  'hash_rl_012', false FROM milan.log_sources s WHERE s.source_name='Azure'
ON CONFLICT (log_id) DO NOTHING;

INSERT INTO milan.raw_logs (log_id, source_id, raw_event, hash_signature, is_duplicate)
SELECT 'a1000013-0000-0000-0000-000000000000'::uuid, s.source_id,
  '{"user":"john.smith","ip":"197.210.54.12","country":"Nigeria","device":"Windows","login_result":"failed"}'::jsonb,
  'hash_rl_013', false FROM milan.log_sources s WHERE s.source_name='Azure'
ON CONFLICT (log_id) DO NOTHING;

INSERT INTO milan.raw_logs (log_id, source_id, raw_event, hash_signature, is_duplicate)
SELECT 'a1000014-0000-0000-0000-000000000000'::uuid, s.source_id,
  '{"user":"sarah.jones","ip":"82.45.12.200","country":"United Kingdom","device":"Windows","login_result":"success","action":"data_export"}'::jsonb,
  'hash_rl_014', false FROM milan.log_sources s WHERE s.source_name='Azure'
ON CONFLICT (log_id) DO NOTHING;

INSERT INTO milan.raw_logs (log_id, source_id, raw_event, hash_signature, is_duplicate)
SELECT 'a1000015-0000-0000-0000-000000000000'::uuid, s.source_id,
  '{"user":"amit.patel","ip":"39.57.134.5","country":"Pakistan","device":"Android","login_result":"failed"}'::jsonb,
  'hash_rl_015', false FROM milan.log_sources s WHERE s.source_name='Azure'
ON CONFLICT (log_id) DO NOTHING;

INSERT INTO milan.raw_logs (log_id, source_id, raw_event, hash_signature, is_duplicate)
SELECT 'a1000016-0000-0000-0000-000000000000'::uuid, s.source_id,
  '{"user":"rahul.gupta","ip":"103.5.134.20","country":"India","device":"Windows","login_result":"success"}'::jsonb,
  'hash_rl_016', false FROM milan.log_sources s WHERE s.source_name='Azure'
ON CONFLICT (log_id) DO NOTHING;

INSERT INTO milan.raw_logs (log_id, source_id, raw_event, hash_signature, is_duplicate)
SELECT 'a1000017-0000-0000-0000-000000000000'::uuid, s.source_id,
  '{"user":"maria.garcia","ip":"189.122.33.60","country":"Brazil","device":"Mac","login_result":"failed"}'::jsonb,
  'hash_rl_017', false FROM milan.log_sources s WHERE s.source_name='Azure'
ON CONFLICT (log_id) DO NOTHING;

INSERT INTO milan.raw_logs (log_id, source_id, raw_event, hash_signature, is_duplicate)
SELECT 'a1000018-0000-0000-0000-000000000000'::uuid, s.source_id,
  '{"user":"david.lee","ip":"175.45.176.0","country":"South Korea","device":"Linux","login_result":"success"}'::jsonb,
  'hash_rl_018', false FROM milan.log_sources s WHERE s.source_name='Azure'
ON CONFLICT (log_id) DO NOTHING;

-- =====================================================
-- NORMALIZED EVENTS  (18 rows linked to raw logs)
-- =====================================================
INSERT INTO milan.normalized_events (event_id, log_id, user_email, ip_address, geo_location, device, event_type, login_status, risk_score, anomaly_flag, normalized_json, event_timestamp)
VALUES ('b1000001-0000-0000-0000-000000000000'::uuid, 'a1000001-0000-0000-0000-000000000000'::uuid,
  'akash.kapoor@company.com', '49.37.22.14', 'India', 'Windows', 'login', 'success', 12, false,
  '{"source":"Azure","status":"normal","reason":""}'::jsonb, '2026-04-25 09:14:00')
ON CONFLICT (event_id) DO NOTHING;

INSERT INTO milan.normalized_events (event_id, log_id, user_email, ip_address, geo_location, device, event_type, login_status, risk_score, anomaly_flag, normalized_json, event_timestamp)
VALUES ('b1000002-0000-0000-0000-000000000000'::uuid, 'a1000002-0000-0000-0000-000000000000'::uuid,
  'akash.kapoor@company.com', '172.33.4.21', 'Russia', 'Linux', 'login', 'failed', 88, true,
  '{"source":"Azure","reason":"geo anomaly + login from Russia, usual location India"}'::jsonb, '2026-04-25 09:47:00')
ON CONFLICT (event_id) DO NOTHING;

INSERT INTO milan.normalized_events (event_id, log_id, user_email, ip_address, geo_location, device, event_type, login_status, risk_score, anomaly_flag, normalized_json, event_timestamp)
VALUES ('b1000003-0000-0000-0000-000000000000'::uuid, 'a1000003-0000-0000-0000-000000000000'::uuid,
  'priya.sharma@company.com', '116.31.116.50', 'China', 'Mac', 'login', 'failed', 92, true,
  '{"source":"Azure","reason":"geo anomaly + multiple failures from China"}'::jsonb, '2026-04-25 11:22:00')
ON CONFLICT (event_id) DO NOTHING;

INSERT INTO milan.normalized_events (event_id, log_id, user_email, ip_address, geo_location, device, event_type, login_status, risk_score, anomaly_flag, normalized_json, event_timestamp)
VALUES ('b1000004-0000-0000-0000-000000000000'::uuid, 'a1000004-0000-0000-0000-000000000000'::uuid,
  'priya.sharma@company.com', '116.31.116.50', 'China', 'Mac', 'login', 'failed', 92, true,
  '{"source":"Azure","reason":"duplicate event — geo anomaly + multiple failures from China"}'::jsonb, '2026-04-25 11:22:05')
ON CONFLICT (event_id) DO NOTHING;

INSERT INTO milan.normalized_events (event_id, log_id, user_email, ip_address, geo_location, device, event_type, login_status, risk_score, anomaly_flag, normalized_json, event_timestamp)
VALUES ('b1000005-0000-0000-0000-000000000000'::uuid, 'a1000005-0000-0000-0000-000000000000'::uuid,
  'rahul.gupta@company.com', '103.5.134.20', 'India', 'Android', 'login', 'success', 35, false,
  '{"source":"Azure","reason":"new device type detected"}'::jsonb, '2026-04-25 13:05:00')
ON CONFLICT (event_id) DO NOTHING;

INSERT INTO milan.normalized_events (event_id, log_id, user_email, ip_address, geo_location, device, event_type, login_status, risk_score, anomaly_flag, normalized_json, event_timestamp)
VALUES ('b1000006-0000-0000-0000-000000000000'::uuid, 'a1000006-0000-0000-0000-000000000000'::uuid,
  'sarah.jones@company.com', '82.45.12.200', 'United Kingdom', 'Windows', 'login', 'success', 55, true,
  '{"source":"Azure","reason":"after-hours login at 02:30 UTC"}'::jsonb, '2026-04-25 02:30:00')
ON CONFLICT (event_id) DO NOTHING;

INSERT INTO milan.normalized_events (event_id, log_id, user_email, ip_address, geo_location, device, event_type, login_status, risk_score, anomaly_flag, normalized_json, event_timestamp)
VALUES ('b1000007-0000-0000-0000-000000000000'::uuid, 'a1000007-0000-0000-0000-000000000000'::uuid,
  'john.smith@company.com', '44.201.18.99', 'United States', 'Windows', 'privilege_escalation', 'success', 78, true,
  '{"source":"Azure","reason":"unexpected privilege escalation to admin role"}'::jsonb, '2026-04-25 15:40:00')
ON CONFLICT (event_id) DO NOTHING;

INSERT INTO milan.normalized_events (event_id, log_id, user_email, ip_address, geo_location, device, event_type, login_status, risk_score, anomaly_flag, normalized_json, event_timestamp)
VALUES ('b1000008-0000-0000-0000-000000000000'::uuid, 'a1000008-0000-0000-0000-000000000000'::uuid,
  'amit.patel@company.com', '103.21.58.14', 'India', 'Windows', 'login', 'success', 8, false,
  '{"source":"Azure","status":"normal","reason":""}'::jsonb, '2026-04-26 08:10:00')
ON CONFLICT (event_id) DO NOTHING;

INSERT INTO milan.normalized_events (event_id, log_id, user_email, ip_address, geo_location, device, event_type, login_status, risk_score, anomaly_flag, normalized_json, event_timestamp)
VALUES ('b1000009-0000-0000-0000-000000000000'::uuid, 'a1000009-0000-0000-0000-000000000000'::uuid,
  'maria.garcia@company.com', '212.170.36.15', 'Spain', 'Mac', 'login', 'success', 15, false,
  '{"source":"Azure","status":"normal","reason":""}'::jsonb, '2026-04-26 09:55:00')
ON CONFLICT (event_id) DO NOTHING;

INSERT INTO milan.normalized_events (event_id, log_id, user_email, ip_address, geo_location, device, event_type, login_status, risk_score, anomaly_flag, normalized_json, event_timestamp)
VALUES ('b1000010-0000-0000-0000-000000000000'::uuid, 'a1000010-0000-0000-0000-000000000000'::uuid,
  'david.lee@company.com', '175.45.176.0', 'South Korea', 'Linux', 'login', 'failed', 65, true,
  '{"source":"Azure","reason":"repeated failed logins from unusual location"}'::jsonb, '2026-04-26 11:18:00')
ON CONFLICT (event_id) DO NOTHING;

INSERT INTO milan.normalized_events (event_id, log_id, user_email, ip_address, geo_location, device, event_type, login_status, risk_score, anomaly_flag, normalized_json, event_timestamp)
VALUES ('b1000011-0000-0000-0000-000000000000'::uuid, 'a1000011-0000-0000-0000-000000000000'::uuid,
  'priya.sharma@company.com', '103.11.68.25', 'India', 'Mac', 'login', 'success', 72, true,
  '{"source":"Azure","reason":"login success following critical failure pattern from China"}'::jsonb, '2026-04-26 14:33:00')
ON CONFLICT (event_id) DO NOTHING;

INSERT INTO milan.normalized_events (event_id, log_id, user_email, ip_address, geo_location, device, event_type, login_status, risk_score, anomaly_flag, normalized_json, event_timestamp)
VALUES ('b1000012-0000-0000-0000-000000000000'::uuid, 'a1000012-0000-0000-0000-000000000000'::uuid,
  'akash.kapoor@company.com', '49.37.22.14', 'India', 'Windows', 'file_access', 'success', 10, false,
  '{"source":"Azure","status":"normal","reason":""}'::jsonb, '2026-04-26 16:02:00')
ON CONFLICT (event_id) DO NOTHING;

INSERT INTO milan.normalized_events (event_id, log_id, user_email, ip_address, geo_location, device, event_type, login_status, risk_score, anomaly_flag, normalized_json, event_timestamp)
VALUES ('b1000013-0000-0000-0000-000000000000'::uuid, 'a1000013-0000-0000-0000-000000000000'::uuid,
  'john.smith@company.com', '197.210.54.12', 'Nigeria', 'Windows', 'login', 'failed', 91, true,
  '{"source":"Azure","reason":"login failed from Nigeria — never seen country for this user"}'::jsonb, '2026-04-26 22:15:00')
ON CONFLICT (event_id) DO NOTHING;

INSERT INTO milan.normalized_events (event_id, log_id, user_email, ip_address, geo_location, device, event_type, login_status, risk_score, anomaly_flag, normalized_json, event_timestamp)
VALUES ('b1000014-0000-0000-0000-000000000000'::uuid, 'a1000014-0000-0000-0000-000000000000'::uuid,
  'sarah.jones@company.com', '82.45.12.200', 'United Kingdom', 'Windows', 'data_export', 'success', 82, true,
  '{"source":"Azure","reason":"large data export — volume exceeds baseline threshold"}'::jsonb, '2026-04-27 10:04:00')
ON CONFLICT (event_id) DO NOTHING;

INSERT INTO milan.normalized_events (event_id, log_id, user_email, ip_address, geo_location, device, event_type, login_status, risk_score, anomaly_flag, normalized_json, event_timestamp)
VALUES ('b1000015-0000-0000-0000-000000000000'::uuid, 'a1000015-0000-0000-0000-000000000000'::uuid,
  'amit.patel@company.com', '39.57.134.5', 'Pakistan', 'Android', 'login', 'failed', 76, true,
  '{"source":"Azure","reason":"login failed from Pakistan — geo outside normal range"}'::jsonb, '2026-04-27 11:30:00')
ON CONFLICT (event_id) DO NOTHING;

INSERT INTO milan.normalized_events (event_id, log_id, user_email, ip_address, geo_location, device, event_type, login_status, risk_score, anomaly_flag, normalized_json, event_timestamp)
VALUES ('b1000016-0000-0000-0000-000000000000'::uuid, 'a1000016-0000-0000-0000-000000000000'::uuid,
  'rahul.gupta@company.com', '103.5.134.20', 'India', 'Windows', 'login', 'success', 5, false,
  '{"source":"Azure","status":"normal","reason":""}'::jsonb, '2026-04-27 13:45:00')
ON CONFLICT (event_id) DO NOTHING;

INSERT INTO milan.normalized_events (event_id, log_id, user_email, ip_address, geo_location, device, event_type, login_status, risk_score, anomaly_flag, normalized_json, event_timestamp)
VALUES ('b1000017-0000-0000-0000-000000000000'::uuid, 'a1000017-0000-0000-0000-000000000000'::uuid,
  'maria.garcia@company.com', '189.122.33.60', 'Brazil', 'Mac', 'login', 'failed', 68, true,
  '{"source":"Azure","reason":"login failed from Brazil — usual location is Spain"}'::jsonb, '2026-04-27 15:12:00')
ON CONFLICT (event_id) DO NOTHING;

INSERT INTO milan.normalized_events (event_id, log_id, user_email, ip_address, geo_location, device, event_type, login_status, risk_score, anomaly_flag, normalized_json, event_timestamp)
VALUES ('b1000018-0000-0000-0000-000000000000'::uuid, 'a1000018-0000-0000-0000-000000000000'::uuid,
  'david.lee@company.com', '175.45.176.0', 'South Korea', 'Linux', 'login', 'success', 20, false,
  '{"source":"Azure","status":"normal","reason":""}'::jsonb, '2026-04-27 17:50:00')
ON CONFLICT (event_id) DO NOTHING;

-- =====================================================
-- ANOMALY ALERTS
-- =====================================================
INSERT INTO milan.anomaly_alerts (alert_id, event_id, severity, risk_percent, anomaly_reason, alert_status)
VALUES ('c1000002-0000-0000-0000-000000000000'::uuid, 'b1000002-0000-0000-0000-000000000000'::uuid,
  'High', 88, 'Geo anomaly — login from Russia, baseline location is India', 'OPEN')
ON CONFLICT (alert_id) DO NOTHING;

INSERT INTO milan.anomaly_alerts (alert_id, event_id, severity, risk_percent, anomaly_reason, alert_status)
VALUES ('c1000003-0000-0000-0000-000000000000'::uuid, 'b1000003-0000-0000-0000-000000000000'::uuid,
  'Critical', 92, 'Geo anomaly + multiple failed attempts from China', 'OPEN')
ON CONFLICT (alert_id) DO NOTHING;

INSERT INTO milan.anomaly_alerts (alert_id, event_id, severity, risk_percent, anomaly_reason, alert_status)
VALUES ('c1000006-0000-0000-0000-000000000000'::uuid, 'b1000006-0000-0000-0000-000000000000'::uuid,
  'Medium', 55, 'After-hours login detected at 02:30 UTC', 'REVIEWED')
ON CONFLICT (alert_id) DO NOTHING;

INSERT INTO milan.anomaly_alerts (alert_id, event_id, severity, risk_percent, anomaly_reason, alert_status)
VALUES ('c1000007-0000-0000-0000-000000000000'::uuid, 'b1000007-0000-0000-0000-000000000000'::uuid,
  'High', 78, 'Unexpected privilege escalation to admin role', 'OPEN')
ON CONFLICT (alert_id) DO NOTHING;

INSERT INTO milan.anomaly_alerts (alert_id, event_id, severity, risk_percent, anomaly_reason, alert_status)
VALUES ('c1000010-0000-0000-0000-000000000000'::uuid, 'b1000010-0000-0000-0000-000000000000'::uuid,
  'High', 65, 'Repeated failed logins from South Korea — outside user baseline', 'OPEN')
ON CONFLICT (alert_id) DO NOTHING;

INSERT INTO milan.anomaly_alerts (alert_id, event_id, severity, risk_percent, anomaly_reason, alert_status)
VALUES ('c1000011-0000-0000-0000-000000000000'::uuid, 'b1000011-0000-0000-0000-000000000000'::uuid,
  'High', 72, 'Successful login immediately after critical failure pattern', 'OPEN')
ON CONFLICT (alert_id) DO NOTHING;

INSERT INTO milan.anomaly_alerts (alert_id, event_id, severity, risk_percent, anomaly_reason, alert_status)
VALUES ('c1000013-0000-0000-0000-000000000000'::uuid, 'b1000013-0000-0000-0000-000000000000'::uuid,
  'Critical', 91, 'Login failed from Nigeria — country never seen for this account', 'OPEN')
ON CONFLICT (alert_id) DO NOTHING;

INSERT INTO milan.anomaly_alerts (alert_id, event_id, severity, risk_percent, anomaly_reason, alert_status)
VALUES ('c1000014-0000-0000-0000-000000000000'::uuid, 'b1000014-0000-0000-0000-000000000000'::uuid,
  'High', 82, 'Data export volume exceeds baseline — potential exfiltration', 'OPEN')
ON CONFLICT (alert_id) DO NOTHING;

INSERT INTO milan.anomaly_alerts (alert_id, event_id, severity, risk_percent, anomaly_reason, alert_status)
VALUES ('c1000015-0000-0000-0000-000000000000'::uuid, 'b1000015-0000-0000-0000-000000000000'::uuid,
  'High', 76, 'Login failed from Pakistan — geo outside normal range for this user', 'OPEN')
ON CONFLICT (alert_id) DO NOTHING;

INSERT INTO milan.anomaly_alerts (alert_id, event_id, severity, risk_percent, anomaly_reason, alert_status)
VALUES ('c1000017-0000-0000-0000-000000000000'::uuid, 'b1000017-0000-0000-0000-000000000000'::uuid,
  'High', 68, 'Login failed from Brazil — usual location is Spain', 'OPEN')
ON CONFLICT (alert_id) DO NOTHING;

-- =====================================================
-- AUDIT LOGS
-- =====================================================
INSERT INTO milan.audit_logs (audit_id, action_type, actor, metadata, action_timestamp)
VALUES
  ('d1000001-0000-0000-0000-000000000000'::uuid, 'ingest',   'system',        '{"title":"Log Ingestion Started","detail":"Azure feed connected — 8 raw events received"}'::jsonb,          '2026-04-25 09:00:00'),
  ('d1000002-0000-0000-0000-000000000000'::uuid, 'process',  'system',        '{"title":"Normalization Complete","detail":"18 events normalized, 1 duplicate flagged"}'::jsonb,               '2026-04-25 09:05:00'),
  ('d1000003-0000-0000-0000-000000000000'::uuid, 'detect',   'system',        '{"title":"Anomaly Detected","detail":"Critical risk score 92 — priya.sharma@company.com from China"}'::jsonb, '2026-04-25 11:22:00'),
  ('d1000004-0000-0000-0000-000000000000'::uuid, 'detect',   'system',        '{"title":"Anomaly Detected","detail":"High risk score 88 — akash.kapoor@company.com from Russia"}'::jsonb,   '2026-04-25 09:47:00'),
  ('d1000005-0000-0000-0000-000000000000'::uuid, 'review',   'analyst1',      '{"title":"Alert Reviewed","detail":"After-hours login for sarah.jones marked as REVIEWED"}'::jsonb,           '2026-04-25 08:35:00'),
  ('d1000006-0000-0000-0000-000000000000'::uuid, 'detect',   'system',        '{"title":"Privilege Escalation Alert","detail":"john.smith escalated to admin role — flagged"}'::jsonb,       '2026-04-25 15:40:00'),
  ('d1000007-0000-0000-0000-000000000000'::uuid, 'ingest',   'system',        '{"title":"Log Ingestion Resumed","detail":"Azure feeds synced — 6 new events"}'::jsonb,            '2026-04-26 08:00:00'),
  ('d1000008-0000-0000-0000-000000000000'::uuid, 'detect',   'system',        '{"title":"Anomaly Detected","detail":"Critical risk score 91 — john.smith@company.com from Nigeria"}'::jsonb, '2026-04-26 22:15:00'),
  ('d1000009-0000-0000-0000-000000000000'::uuid, 'detect',   'system',        '{"title":"Data Exfiltration Risk","detail":"sarah.jones data export flagged — risk score 82"}'::jsonb,        '2026-04-27 10:04:00'),
  ('d1000010-0000-0000-0000-000000000000'::uuid, 'report',   'securityadmin', '{"title":"Daily Security Report Generated","detail":"10 anomaly alerts open, 2 critical — review required"}'::jsonb, '2026-04-27 18:00:00')
ON CONFLICT (audit_id) DO NOTHING;
