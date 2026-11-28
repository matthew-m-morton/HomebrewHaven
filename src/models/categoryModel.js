import pool from '../database/db.js';

const CATEGORY_TABLES = { spell_school: 'spell_schools', item_type: 'item_types', creature_type: 'creature_types' };

// Core (original) categories first, then community-approved ones, each alphabetical
export async function getCategories(kind) {
  const table = CATEGORY_TABLES[kind];
  if (!table) throw new Error(`Unknown category kind: ${kind}`);
  const { rows } = await pool.query(
    `SELECT id, name, is_core FROM ${table} ORDER BY is_core DESC, LOWER(name)`);
  return rows;
}