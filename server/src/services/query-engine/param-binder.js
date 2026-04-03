const { IN_CLAUSE_LIMIT } = require('../../utils/constants');

class ParamBinder {
  classifyParams(params, paramDefs) {
    const simple = [];
    const inline = [];
    const gtt = [];

    for (const def of paramDefs) {
      const userValue = params[def.param_name];

      if (def.param_type === 'multi_value') {
        const values = Array.isArray(userValue) ? userValue : [userValue];

        if (values.length === 0) {
          if (def.is_required) {
            throw new Error(`Parameter '${def.param_name}' is required`);
          }
          continue;
        }

        if (values.length > IN_CLAUSE_LIMIT) {
          gtt.push({ name: def.param_name, values });
        } else {
          inline.push({ name: def.param_name, values });
        }
      } else {
        simple.push({ name: def.param_name, value: userValue, type: def.param_type });
      }
    }

    return { simple, inline, gtt, needsGTT: gtt.length > 0 };
  }

  buildBindObject(classified) {
    const binds = {};

    for (const param of classified.simple) {
      binds[param.name] = param.value;
    }

    for (const param of classified.inline) {
      param.values.forEach((val, idx) => {
        binds[`${param.name}_${idx}`] = val;
      });
    }

    return binds;
  }

  expandInClause(sql, classified) {
    let expanded = sql;

    for (const param of classified.inline) {
      const placeholders = param.values
        .map((_, idx) => `:${param.name}_${idx}`)
        .join(', ');

      const pattern = new RegExp(
        `IN\\s*\\(\\s*:${param.name}\\s*\\)`,
        'gi'
      );
      expanded = expanded.replace(pattern, `IN (${placeholders})`);
    }

    return expanded;
  }
}

module.exports = ParamBinder;
