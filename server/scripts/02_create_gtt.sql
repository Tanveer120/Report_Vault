-- =====================================================
-- Report Room — Global Temporary Table (GTT)
-- =====================================================
-- This GTT is the core mechanism for handling Oracle's 999-value
-- IN-clause limit. Each session's data is automatically isolated
-- and cleaned up on COMMIT via ON COMMIT DELETE ROWS.
-- =====================================================

CREATE GLOBAL TEMPORARY TABLE gtt_filter_values (
    param_key  VARCHAR2(100),
    val        VARCHAR2(4000)
) ON COMMIT DELETE ROWS;

CREATE INDEX idx_gtt_filter_val ON gtt_filter_values(param_key, val);
