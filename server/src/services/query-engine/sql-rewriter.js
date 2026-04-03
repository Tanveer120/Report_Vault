class SqlRewriter {
  rewriteInClause(sql, paramName) {
    const gttKeyBind = `_gtt_key_${paramName}`;
    const pattern = new RegExp(
      `IN\\s*\\(\\s*:${paramName}\\s*\\)`,
      'gi'
    );
    return sql.replace(
      pattern,
      `IN (SELECT val FROM gtt_filter_values WHERE param_key = :${gttKeyBind})`
    );
  }

  buildGttBinds(gttParams) {
    const binds = {};
    for (const param of gttParams) {
      binds[`_gtt_key_${param.name}`] = param.name;
    }
    return binds;
  }
}

module.exports = SqlRewriter;
