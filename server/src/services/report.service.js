const oracledb = require('oracledb');
const { getPool } = require('../config/database');
const ApiError = require('../utils/api-error');

async function listReports({ page = 1, pageSize = 20, search = '' } = {}) {
  const pool = getPool();
  const offset = (page - 1) * pageSize;
  const hasSearch = search && search.trim().length > 0;
  const searchPattern = hasSearch ? `%${search.trim()}%` : null;

  const countResult = await pool.execute(
    `SELECT COUNT(*) AS total
     FROM reports r
     WHERE r.is_active = 1
       AND (:search IS NULL OR LOWER(r.name) LIKE LOWER(:search))`,
    { search: searchPattern },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  const total = countResult.rows[0].TOTAL;

  const result = await pool.execute(
    `SELECT r.id, r.name, r.description, r.created_at, r.updated_at,
            u.username AS created_by_username
     FROM reports r
     JOIN users u ON r.created_by = u.id
     WHERE r.is_active = 1
       AND (:search IS NULL OR LOWER(r.name) LIKE LOWER(:search))
     ORDER BY r.created_at DESC
     OFFSET :offset ROWS FETCH NEXT :pageSize ROWS ONLY`,
    { search: searchPattern, offset, pageSize },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  return {
    reports: result.rows.map(row => ({
      id: row.ID,
      name: row.NAME,
      description: row.DESCRIPTION,
      created_by_username: row.CREATED_BY_USERNAME,
      created_at: row.CREATED_AT,
      updated_at: row.UPDATED_AT,
    })),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

async function getReportById(id, { isAdmin = false } = {}) {
  const pool = getPool();
  const selectFields = isAdmin
    ? 'r.id, r.name, r.description, r.sql_query, r.created_by, r.is_active, r.created_at, r.updated_at'
    : 'r.id, r.name, r.description, r.created_by, r.is_active, r.created_at, r.updated_at';

  const result = await pool.execute(
    `SELECT ${selectFields}, u.username AS created_by_username
     FROM reports r
     JOIN users u ON r.created_by = u.id
     WHERE r.id = :id`,
    { id },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    id: row.ID,
    name: row.NAME,
    description: row.DESCRIPTION,
    ...(isAdmin && { sql_query: row.SQL_QUERY }),
    created_by: row.CREATED_BY,
    created_by_username: row.CREATED_BY_USERNAME,
    is_active: row.IS_ACTIVE,
    created_at: row.CREATED_AT,
    updated_at: row.UPDATED_AT,
  };
}

async function createReport({ name, description, sql_query, created_by, params = [] }) {
  const pool = getPool();
  let connection;

  try {
    connection = await pool.getConnection();

    const insertResult = await connection.execute(
      `INSERT INTO reports (name, description, sql_query, created_by, is_active)
       VALUES (:name, :description, :sqlQuery, :createdBy, 1)
       RETURNING id, created_at, updated_at INTO :outId, :outCreatedAt, :outUpdatedAt`,
      {
        name,
        description: description || null,
        sqlQuery: sql_query,
        createdBy: created_by,
        outId: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
        outCreatedAt: { type: oracledb.DATE, dir: oracledb.BIND_OUT },
        outUpdatedAt: { type: oracledb.DATE, dir: oracledb.BIND_OUT },
      },
      { autoCommit: false }
    );

    const reportId = insertResult.outBinds.outId[0];

    if (params.length > 0) {
      for (let i = 0; i < params.length; i++) {
        const p = params[i];
        await connection.execute(
          `INSERT INTO report_params
           (report_id, param_name, param_label, param_type, placeholder, is_required, default_value, options_json, sort_order)
           VALUES (:reportId, :paramName, :paramLabel, :paramType, :placeholder, :isRequired, :defaultValue, :optionsJson, :sortOrder)`,
          {
            reportId,
            paramName: p.param_name,
            paramLabel: p.param_label,
            paramType: p.param_type,
            placeholder: p.placeholder || null,
            isRequired: p.is_required !== undefined ? p.is_required : 1,
            defaultValue: p.default_value || null,
            optionsJson: p.options_json || null,
            sortOrder: p.sort_order !== undefined ? p.sort_order : i,
          }
        );
      }
    }

    await connection.commit();

    const report = await getReportById(reportId, { isAdmin: true });
    report.params = await getParamsByReportId(reportId);
    return report;
  } catch (err) {
    if (connection) {
      await connection.rollback();
    }
    if (err.errorNum === 1) {
      throw new ApiError(400, 'A parameter with this name already exists for this report');
    }
    throw err;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

async function updateReport(id, { name, description, sql_query, params }) {
  const pool = getPool();
  let connection;

  try {
    connection = await pool.getConnection();

    const existing = await connection.execute(
      `SELECT id FROM reports WHERE id = :id AND is_active = 1`,
      { id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (existing.rows.length === 0) {
      throw new ApiError(404, 'Report not found');
    }

    const updates = [];
    const binds = { id };

    if (name !== undefined) {
      updates.push('name = :name');
      binds.name = name;
    }
    if (description !== undefined) {
      updates.push('description = :description');
      binds.description = description;
    }
    if (sql_query !== undefined) {
      updates.push('sql_query = :sqlQuery');
      binds.sqlQuery = sql_query;
    }

    if (updates.length > 0) {
      updates.push('updated_at = SYSTIMESTAMP');
      await connection.execute(
        `UPDATE reports SET ${updates.join(', ')} WHERE id = :id`,
        binds,
        { autoCommit: false }
      );
    }

    if (params !== undefined) {
      await connection.execute(
        `DELETE FROM report_params WHERE report_id = :id`,
        { id }
      );

      for (let i = 0; i < params.length; i++) {
        const p = params[i];
        await connection.execute(
          `INSERT INTO report_params
           (report_id, param_name, param_label, param_type, placeholder, is_required, default_value, options_json, sort_order)
           VALUES (:reportId, :paramName, :paramLabel, :paramType, :placeholder, :isRequired, :defaultValue, :optionsJson, :sortOrder)`,
          {
            reportId: id,
            paramName: p.param_name,
            paramLabel: p.param_label,
            paramType: p.param_type,
            placeholder: p.placeholder || null,
            isRequired: p.is_required !== undefined ? p.is_required : 1,
            defaultValue: p.default_value || null,
            optionsJson: p.options_json || null,
            sortOrder: p.sort_order !== undefined ? p.sort_order : i,
          }
        );
      }
    }

    await connection.commit();

    const report = await getReportById(id, { isAdmin: true });
    report.params = await getParamsByReportId(id);
    return report;
  } catch (err) {
    if (connection) {
      await connection.rollback();
    }
    if (err.errorNum === 1) {
      throw new ApiError(400, 'A parameter with this name already exists for this report');
    }
    throw err;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

async function deleteReport(id) {
  const pool = getPool();
  const result = await pool.execute(
    `UPDATE reports SET is_active = 0, updated_at = SYSTIMESTAMP WHERE id = :id AND is_active = 1`,
    { id },
    { autoCommit: true }
  );

  if (result.rowsAffected === 0) {
    throw new ApiError(404, 'Report not found');
  }
}

async function getParamsByReportId(reportId) {
  const pool = getPool();
  const result = await pool.execute(
    `SELECT id, report_id, param_name, param_label, param_type, placeholder,
            is_required, default_value, options_json, sort_order
     FROM report_params
     WHERE report_id = :reportId
     ORDER BY sort_order ASC, id ASC`,
    { reportId },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  return result.rows.map(row => ({
    id: row.ID,
    report_id: row.REPORT_ID,
    param_name: row.PARAM_NAME,
    param_label: row.PARAM_LABEL,
    param_type: row.PARAM_TYPE,
    placeholder: row.PLACEHOLDER,
    is_required: row.IS_REQUIRED,
    default_value: row.DEFAULT_VALUE,
    options_json: row.OPTIONS_JSON,
    sort_order: row.SORT_ORDER,
  }));
}

module.exports = {
  listReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport,
  getParamsByReportId,
};
