# 📊 Report Room

**Report Room** is a secure, no-code SQL report builder designed to bridge the gap between technical database queries and non-technical end-users. It allows administrators to write complex parameterized SQL queries once, and automatically generates dynamic, user-friendly frontend forms for staff to run those reports securely.

Built specifically for **Oracle Database**, it features advanced query rewriting to bypass Oracle's strict 999-value `IN` clause limit using Session-based Global Temporary Tables (GTTs), while ensuring zero data leakage between concurrent users.

---

## ✨ Key Features

- **No-Code Execution**: End-users simply fill out clean web forms. No SQL knowledge required.
- **Dynamic Form Generation**: The UI automatically builds itself based on the parameters (text, number, date, select, multi-value lists) defined by the admin.
- **Oracle 999-Limit Bypass**: Seamlessly handles arrays of >999 values (e.g., pasting 10,000 employee IDs) by automatically routing them through a bulk-inserted Global Temporary Table.
- **Strict Parsing Security**: A robust SQL Validator natively strips string literals to scan for DML/DDL (e.g., `DROP`, `UPDATE`) ensuring only safe `SELECT` constraints are executed.
- **High-Performance Excel Export**: Built-in streaming exporter capable of offloading 50k+ row datasets directly to `.xlsx` files without crashing Node.js memory.
- **Execution Audit Trail**: Logs every query execution time, row count, user ID, and parameter footprint.

---

## 🏗️ Architecture overview

Report Room is decoupled into three primary layers:

### 1. The Frontend (React 19 + Vite)
Built with React and Tailwind CSS. The interface is split into Role-Based dashboards.
- **Admin Flow**: A SQL syntax-highlighted editor with a parameter builder.
- **User Flow**: A dynamic schema renderer that takes parameter definitions and builds a clean form (using `react-datepicker` and custom multi-value tag inputs).

### 2. The Backend (Node.js + Express)
The backend acts as the secure orchestrator. It uses the `oracledb` Thin mode driver.
- **Query Engine Pipeline**:
  - `SqlValidator`: Ensures the query is safe.
  - `ParamBinder`: Differentiates between standard bind variables and array values.
  - `GttManager`: Uses `executeMany` for fast bulk staging.
  - `SqlRewriter`: Mutates the AST/Regex of the SQL to swap `IN (:val)` with `IN (SELECT val FROM gtt_filter_values)`.

### 3. The Database (Oracle >= 11g)
Relies on a specific `ON COMMIT DELETE ROWS` Global Temporary Table. This natively forces Oracle to isolate the staged data exclusively to the Node.js connection session currently holding the transaction, automatically wiping it the millisecond the request completes.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, React Router v7, Tailwind CSS v3, Axios, Zustand/Context API.
- **Backend**: Node.js 18+, Express v5, Joi (Validation), JSON Web Tokens (JWT), winston (Logging), exceljs (Exports).
- **Database**: Oracle Database + `node-oracledb`.

---

## 🚀 Installation & Setup

For a complete, step-by-step guide on how to configure Oracle Instant Client, run the DDL files, seed the initial database, and start both servers, please refer to the core [INSTALL.md](./INSTALL.md) file.

### Quick Start Overview:
1. Run `@server/scripts/01_create_tables.sql` and `@02_create_gtt.sql` in your Oracle DB.
2. `cd server && cp .env.example .env` (Populate your DB credentials).
3. `npm run db:seed` to create the initial Admin account.
4. `npm run dev` to start the backend on port 3000.
5. `cd client && npm install && npm run dev` to start the frontend on port 5173.

---

## 🔒 Security Posture

- **Parameter Binding Only**: String concatenation is strictly prohibited in the engine layer.
- **Rate Limiting**: Distinct rate limiters for Authentication (brute force prevention), General API, and costly Export Operations.
- **Concurrency Locks**: Exports are wrapped in a Node.js Semaphore limiting memory-heavy streams to 5 concurrent jobs.
- **JWT Rotation**: Implement short-lived Access Tokens (15m) alongside Refresh Tokens.

---

## 📝 License

Proprietary / Internal Business Use.
