# Oracle IN-Clause (1000+) Limit Handling Architecture

A common limitation in Oracle Databases (up to specific newer patches/versions) is the hard limit on the number of elements allowed inside an `IN (...)` clause. Traditionally, Oracle restricts `IN` lists to a maximum of 1,000 items (specifically 999 values).

Report Room deals with this elegantly at the Query Engine layer. The system dynamically decides between **Inline Parameter Expansion** (for <1000 values) and a **Global Temporary Table (GTT) Subquery** (for >1000 values), completely abstracting the limit away from both the end-user and the SQL report designer.

Here is the complete architectural breakdown of how this operates:

---

## 1. The Core Components

The handling logic is segmented across four core classes inside `server/src/services/query-engine/`:

1. **`ParamBinder` (`param-binder.js`)**: Analyzes the input array length compared to the 999 limit.
2. **`GttManager` (`gtt-manager.js`)**: Handles bulk `executeMany` inserts into the temporary table when limits are breached.
3. **`SqlRewriter` (`sql-rewriter.js`)**: Modifies the original SQL abstract syntax using Regex.
4. **`QueryEngine` (`index.js`)**: The orchestrator that coordinates the validation, insertion, query firing, and transaction cleanup.

---

## 2. When Input is < 1000 Values (Inline Expansion)

If a user selects fewer than 1000 values from a multi-select dropdown for a report:

#### Step 1: Classification
`ParamBinder.classifyParams()` detects the array length is `< 1000` (controlled by `IN_CLAUSE_LIMIT` constant) and shoves the parameter into the **`inline`** queue.

#### Step 2: String Replacement
`ParamBinder.expandInClause()` uses RegExp to dynamically rewrite the SQL query string.  
If the developer wrote: 
```sql
SELECT * FROM employees WHERE dept_id IN (:departments)
```
And 3 items were passed `[101, 102, 103]`, it string-replaces the query to:
```sql
SELECT * FROM employees WHERE dept_id IN (:departments_0, :departments_1, :departments_2)
```

#### Step 3: Execution
The bind variables object is rebuilt to perfectly align with the new suffix placeholders (`departments_0: 101, departments_1: 102, ...`), and a standard execution occurs. No transactions or sub-tables are necessary.

---

## 3. When Input is > 1000 Values (GTT Subquery)

If a user selects *thousands* of values crossing the 999 boundary:

#### Step 1: Pre-requisite - The Global Temporary Table
At installation (`server/scripts/02_create_gtt.sql`), the database creates a single table:
```sql
CREATE GLOBAL TEMPORARY TABLE gtt_filter_values (
    param_key  VARCHAR2(100),
    val        VARCHAR2(4000)
) ON COMMIT DELETE ROWS;
```
> **Crucial Detail**: `ON COMMIT DELETE ROWS` isolates the table per session context. Data inserted by User A is invisible to User B, and the moment a transaction resolves (Commit/Rollback), the rows simply vanish instantly from the memory tablespace.

#### Step 2: Classification
`ParamBinder.classifyParams()` detects `values.length > 999` and flags the query as `needsGTT: true`, moving this parameter dataset into the **`gtt`** queue.

#### Step 3: Batch Insertion into GTT
The query execution is rerouted to `QueryEngine._executeWithGTT()`.
`GttManager` takes over and executes `connection.executeMany(...)` to perform high-speed bulk inserts into `gtt_filter_values`. 
- The `param_key` is the name of the binding.
- The `val` is the actual array value.

#### Step 4: Subquery Rewrite
`SqlRewriter.rewriteInClause()` replaces the static inline clause with an active subquery.
Original Query:
```sql
SELECT * FROM employees WHERE dept_id IN (:departments)
```
Rewritten Query:
```sql
SELECT * FROM employees WHERE dept_id IN (
    SELECT val FROM gtt_filter_values WHERE param_key = :_gtt_key_departments
)
```

#### Step 5: Execution & Cleanup
1. The new subquery executes. Oracle joins the main target table against the `gtt_filter_values` table via its built-in indexing (`idx_gtt_filter_val`), completely circumventing the 1000 limit.
2. After retrieving the `result.rows`, `QueryEngine` executes `await connection.commit()`.
3. Due to `ON COMMIT DELETE ROWS`, this transaction fires a commit and causes Oracle to automatically flush the GTT table session data.

---

## Summary

By maintaining `inline` processing for small tasks, the engine stays incredibly fast for 95% of queries. The `GTT` fallback automatically triggers only on extremely massive reports, ensuring the codebase never triggers the infamous `ORA-01795: maximum number of expressions in a list is 1000` error, keeping the experience seamless across all edges.
