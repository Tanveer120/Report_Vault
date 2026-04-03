require('dotenv').config();

const bcrypt = require('bcrypt');
const oracledb = require('oracledb');

async function seedAdmin() {
  const username = process.env.SEED_ADMIN_USERNAME || 'admin';
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@reportroom.local';
  const password = process.env.SEED_ADMIN_PASSWORD || 'Admin@12345';
  const saltRounds = 10;

  const hash = await bcrypt.hash(password, saltRounds);

  let connection;
  try {
    connection = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_CONNECT_STRING,
    });

    const existing = await connection.execute(
      `SELECT id FROM users WHERE username = :username`,
      { username },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (existing.rows.length > 0) {
      console.log(`Admin user "${username}" already exists (id: ${existing.rows[0].ID}).`);
      return;
    }

    await connection.execute(
      `INSERT INTO users (username, email, password_hash, role, is_active)
       VALUES (:username, :email, :hash, 'admin', 1)`,
      { username, email, hash },
      { autoCommit: true }
    );

    console.log(`Admin user "${username}" created successfully.`);
  } catch (err) {
    console.error('Failed to seed admin user:', err.message);
    process.exitCode = 1;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

seedAdmin();
