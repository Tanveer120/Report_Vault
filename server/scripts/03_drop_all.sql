-- =====================================================
-- Report Room — Drop All Objects (Cleanup Script)
-- Run this to tear down the schema for a fresh start.
-- =====================================================

DROP TABLE execution_logs PURGE;
DROP TABLE report_params PURGE;
DROP TABLE reports PURGE;
DROP TABLE users PURGE;
DROP TABLE gtt_filter_values PURGE;

DROP SEQUENCE seq_users;
DROP SEQUENCE seq_reports;
DROP SEQUENCE seq_report_params;
DROP SEQUENCE seq_execution_logs;
