const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const oracledb = require('oracledb');
const { getPool } = require('../config/database');
const { loadEnvironment } = require('../config/environment');
const ApiError = require('../utils/api-error');

const SALT_ROUNDS = 10;
const env = loadEnvironment();

async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

async function comparePassword(plainPassword, hash) {
  return bcrypt.compare(plainPassword, hash);
}

function generateTokens(user) {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  });

  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });

  return { accessToken, refreshToken };
}

function verifyAccessToken(token) {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET);
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired access token');
  }
}

function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET);
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }
}

async function findUserByUsername(username) {
  const pool = getPool();
  const result = await pool.execute(
    `SELECT id, username, email, password_hash, role, is_active, created_at, updated_at
     FROM users
     WHERE username = :username`,
    { username },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    id: row.ID,
    username: row.USERNAME,
    email: row.EMAIL,
    password_hash: row.PASSWORD_HASH,
    role: row.ROLE,
    is_active: row.IS_ACTIVE,
    created_at: row.CREATED_AT,
    updated_at: row.UPDATED_AT,
  };
}

async function findUserByEmail(email) {
  const pool = getPool();
  const result = await pool.execute(
    `SELECT id, username, email, role, is_active FROM users WHERE email = :email`,
    { email },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    id: row.ID,
    username: row.USERNAME,
    email: row.EMAIL,
    role: row.ROLE,
    is_active: row.IS_ACTIVE,
  };
}

async function findUserById(id) {
  const pool = getPool();
  const result = await pool.execute(
    `SELECT id, username, email, role, is_active, created_at, updated_at
     FROM users
     WHERE id = :id`,
    { id },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    id: row.ID,
    username: row.USERNAME,
    email: row.EMAIL,
    role: row.ROLE,
    is_active: row.IS_ACTIVE,
    created_at: row.CREATED_AT,
    updated_at: row.UPDATED_AT,
  };
}

async function createUser({ username, email, password, role = 'user' }) {
  const pool = getPool();
  const passwordHash = await hashPassword(password);

  const result = await pool.execute(
    `INSERT INTO users (username, email, password_hash, role, is_active)
     VALUES (:username, :email, :passwordHash, :role, 1)
     RETURNING id, username, email, role, is_active, created_at, updated_at INTO
       :outId, :outUsername, :outEmail, :outRole, :outIsActive, :outCreatedAt, :outUpdatedAt`,
    {
      username,
      email,
      passwordHash,
      role,
      outId: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
      outUsername: { type: oracledb.STRING, maxSize: 100, dir: oracledb.BIND_OUT },
      outEmail: { type: oracledb.STRING, maxSize: 255, dir: oracledb.BIND_OUT },
      outRole: { type: oracledb.STRING, maxSize: 20, dir: oracledb.BIND_OUT },
      outIsActive: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
      outCreatedAt: { type: oracledb.DATE, dir: oracledb.BIND_OUT },
      outUpdatedAt: { type: oracledb.DATE, dir: oracledb.BIND_OUT },
    },
    { autoCommit: true }
  );

  const out = result.outBinds;
  return {
    id: out.outId[0],
    username: out.outUsername[0],
    email: out.outEmail[0],
    role: out.outRole[0],
    is_active: out.outIsActive[0],
    created_at: out.outCreatedAt[0],
    updated_at: out.outUpdatedAt[0],
  };
}

module.exports = {
  hashPassword,
  comparePassword,
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  findUserByUsername,
  findUserByEmail,
  findUserById,
  createUser,
};
