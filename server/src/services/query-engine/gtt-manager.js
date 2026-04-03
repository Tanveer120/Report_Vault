const oracledb = require('oracledb');
const { GTT_BATCH_SIZE } = require('../../utils/constants');

class GttManager {
  async insertValues(connection, paramKey, values) {
    const sql = `INSERT INTO gtt_filter_values (param_key, val) VALUES (:pk, :v)`;

    for (let i = 0; i < values.length; i += GTT_BATCH_SIZE) {
      const batch = values.slice(i, i + GTT_BATCH_SIZE).map(v => ({
        pk: paramKey,
        v: String(v),
      }));

      await connection.executeMany(sql, batch, {
        autoCommit: false,
        bindDefs: {
          pk: { type: oracledb.STRING, maxSize: 100 },
          v: { type: oracledb.STRING, maxSize: 4000 },
        },
      });
    }
  }
}

module.exports = GttManager;
