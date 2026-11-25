import pool from '../database/db.js';
import { generateFriendCode } from '../utils/friendCode.js';

export const findUserByEmail = async (email) => {
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
    [email]
  );
  return rows[0] ?? null;
};

export const findUserByUsername = async (username) => {
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE LOWER(username) = LOWER($1)',
    [username]
  );
  return rows[0] ?? null;
};

export const createUser = async ({ username, email, passwordHash }) => {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const { rows } = await pool.query(
        `INSERT INTO users (role_id, username, email, password_hash, friend_code)
         VALUES ((SELECT id FROM roles WHERE name = 'user'), $1, $2, $3, $4)
         RETURNING id, username, email, friend_code`,
        [username, email, passwordHash, generateFriendCode()]
      );
      return rows[0];
    } catch (err) {
      if (err.code === '23505' && err.constraint === 'users_friend_code_key') continue;
      throw err;
    }
  }
  throw new Error('Could not generate a unique friend code');
};

export const findUserById = async (id) => {
  const { rows } = await pool.query(
    `SELECT u.id, u.username, u.email, u.friend_code, u.created_at, r.name AS role
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.id = $1`,
    [id]
  );
  return rows[0] ?? null;
};