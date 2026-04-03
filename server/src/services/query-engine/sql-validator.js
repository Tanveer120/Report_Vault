const ApiError = require('../../utils/api-error');

function stripStringLiterals(sql) {
  return sql.replace(/'([^']*(?:''[^']*)*)'/g, "''");
}

class SqlValidator {
  validate(sql) {
    if (!sql || typeof sql !== 'string' || !sql.trim()) {
      throw new ApiError(400, 'SQL query cannot be empty');
    }

    const trimmed = sql.trim();
    const normalized = trimmed.toUpperCase();

    if (!normalized.startsWith('SELECT') && !normalized.startsWith('WITH')) {
      throw new ApiError(400, 'Only SELECT queries are allowed');
    }

    const forbidden = [
      'INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER', 'CREATE',
      'TRUNCATE', 'GRANT', 'REVOKE', 'EXEC', 'EXECUTE',
      'MERGE', 'CALL', 'DBMS_', 'UTL_',
    ];

    const stripped = stripStringLiterals(trimmed);

    for (const keyword of forbidden) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(stripped)) {
        throw new ApiError(400, `Forbidden keyword detected: ${keyword}`);
      }
    }

    if (trimmed.includes(';')) {
      throw new ApiError(400, 'Multiple statements are not allowed');
    }

    return true;
  }
}

module.exports = SqlValidator;
