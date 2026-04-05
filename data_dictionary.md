# Report Room — Data Dictionary

This document outlines the database schema, sequences, tables, and columns used throughout the Report Room project. The database backend is Oracle Database.

## Sequences

The project uses the following Oracle sequences for generating primary keys automatically:
- `seq_users`
- `seq_reports`
- `seq_report_params`
- `seq_execution_logs`

---

## 1. Tables: `users`
Stores all user accounts, credentials, and their assigned roles (Admin/User).

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | NUMBER | **PRIMARY KEY** | Auto-incremented via `seq_users`. |
| `username` | VARCHAR2(100) | **NOT NULL, UNIQUE** | The user's login name. |
| `email` | VARCHAR2(255) | **NOT NULL, UNIQUE** | The user's email address. |
| `password_hash` | VARCHAR2(255) | **NOT NULL** | Bcrypt hashed password. |
| `role` | VARCHAR2(20) | CHECK in `('admin', 'user')` | Determines user permissions. Default: `user` |
| `is_active` | NUMBER(1) | | Flag indicating account status (1=active, 0=inactive). Default: `1` |
| `created_at` | TIMESTAMP | | Timestamp when account was created. Default: `SYSTIMESTAMP` |
| `updated_at` | TIMESTAMP | | Timestamp when account was last updated. Default: `SYSTIMESTAMP` |

---

## 2. Table: `reports`
Stores metadata and the native SQL code for reports generated within the platform.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | NUMBER | **PRIMARY KEY** | Auto-incremented via `seq_reports`. |
| `name` | VARCHAR2(255) | **NOT NULL** | Display name of the report. |
| `description` | CLOB | | Detailed description of what the report does. |
| `sql_query` | CLOB | **NOT NULL** | The executable Oracle SQL SELECT statement with parameter placeholders. |
| `created_by` | NUMBER | **FOREIGN KEY** -> `users(id)` | The user (admin) who created the report. |
| `is_active` | NUMBER(1) | | Indicates if the report is currently available (1=active). Default: `1` |
| `created_at` | TIMESTAMP | | Timestamp of creation. Default: `SYSTIMESTAMP` |
| `updated_at` | TIMESTAMP | | Timestamp of last modification. Default: `SYSTIMESTAMP` |

*Indexes*: 
- `idx_reports_created_by` on `reports(created_by)`

---

## 3. Table: `report_params`
Stores the parameters required by each report natively linking to their `sql_query` placeholders (e.g., `:department_id`).

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | NUMBER | **PRIMARY KEY** | Auto-incremented via `seq_report_params`. |
| `report_id` | NUMBER | **FOREIGN KEY** -> `reports(id)` ON DELETE CASCADE | Associated report identifier. |
| `param_name` | VARCHAR2(100) | **NOT NULL** | Internal bind variable name (e.g. `department_id`). |
| `param_label` | VARCHAR2(255) | **NOT NULL** | Display name for the frontend UI (e.g. `Select Department`). |
| `param_type` | VARCHAR2(50) | **NOT NULL**, CHECK | Can be: `text`, `number`, `date`, `multi_value`, `select`. |
| `placeholder` | VARCHAR2(255) | | Input field placeholder text. |
| `is_required` | NUMBER(1) | | Flag (1=required, 0=optional). Default: `1` |
| `default_value` | CLOB | | Default value to populate in the UI. |
| `options_json` | CLOB | | JSON array of static options for `select` typed bounds. |
| `sort_order` | NUMBER | | Configures visual order rendering. Default: `0` |

*Constraints & Indexes*: 
- `UNIQUE(report_id, param_name)` ensuring no duplicate parameter handles on the same report.
- `idx_report_params_rid` on `report_params(report_id)`.

---

## 4. Table: `execution_logs`
Logs report execution metrics to provide auditing and performance tracking.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | NUMBER | **PRIMARY KEY** | Auto-incremented via `seq_execution_logs`. |
| `report_id` | NUMBER | **FOREIGN KEY** -> `reports(id)` | The report that was executed. |
| `user_id` | NUMBER | **FOREIGN KEY** -> `users(id)` | The user who executed the report. |
| `params_json` | CLOB | | Stringified JSON of parameters supplied during execution. |
| `row_count` | NUMBER | | Number of results returned. |
| `execution_time_ms`| NUMBER| | Query duration in milliseconds. |
| `status` | VARCHAR2(20) | CHECK in `('success', 'error')` | Did the query execute successfully? |
| `error_message` | CLOB | | Error output/stack trace if the query failed. |
| `executed_at` | TIMESTAMP | | Run time. Default: `SYSTIMESTAMP` |

*Indexes*: 
- `idx_exec_logs_report` on `execution_logs(report_id)`
- `idx_exec_logs_user` on `execution_logs(user_id)`
- `idx_exec_logs_date` on `execution_logs(executed_at)`

---

## 5. Table: `gtt_filter_values`
A Global Temporary Table (GTT) designated purely to bypass Oracle's strict 999 bounds for `IN` clauses during `multi_value` parameters.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `param_key` | VARCHAR2(100) | | Identifier bridging the filter values per query request. |
| `val` | VARCHAR2(4000)| | Value element matching the database column target criteria. |

*Properties*: 
- Automatically drops rows per session isolation via `ON COMMIT DELETE ROWS`.
- Contains index `idx_gtt_filter_val` on `(param_key, val)` for ultra-fast performance.
