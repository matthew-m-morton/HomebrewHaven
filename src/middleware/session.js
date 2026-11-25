import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import pool from '../database/db.js';

if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET is not set');
}

const PgStore = connectPgSimple(session);
const isProd = process.env.NODE_ENV === 'production';

export const sessionMiddleware = session({
  store: new PgStore({ pool, tableName: 'session', createTableIfMissing: true }),
  name: 'hh.sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
});