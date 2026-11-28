import pool from '../database/db.js';
import { getEntryType, SHARED_COLUMNS } from './entryTypes.js';

function typeOrThrow(slug) {
  const type = getEntryType(slug);
  if (!type) throw new Error(`Unknown entry type: ${slug}`);
  return type;
}

// Joins the category so views get one display name whether it's real or "Other"
function selectFrom({ table, category }) {
  if (!category) return `SELECT e.* FROM ${table} e`;
  return `SELECT e.*, COALESCE(c.name, e.${category.other}) AS category_name,
                 (e.${category.column} IS NULL) AS category_is_other
          FROM ${table} e
          LEFT JOIN ${category.table} c ON c.id = e.${category.column}`;
}

export async function findEntryById(slug, id) {
  const type = typeOrThrow(slug);
  const { rows } = await pool.query(`${selectFrom(type)} WHERE e.id = $1`, [id]);
  return rows[0] ?? null;
}

export async function findEntriesByOwner(slug, ownerId) {
  const type = typeOrThrow(slug);
  const { rows } = await pool.query(
    `${selectFrom(type)} WHERE e.owner_id = $1 ORDER BY e.updated_at DESC`, [ownerId]);
  return rows;
}

export async function createEntry(slug, ownerId, data) {
  const { table, columns } = typeOrThrow(slug);
  const cols = ['owner_id', ...SHARED_COLUMNS, ...columns];
  const values = [ownerId, ...[...SHARED_COLUMNS, ...columns].map((c) => data[c] ?? null)];
  const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
  const { rows } = await pool.query(
    `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders}) RETURNING id`, values);
  return rows[0].id;
}

export async function updateEntry(slug, id, data) {
  const { table, columns } = typeOrThrow(slug);
  const cols = [...SHARED_COLUMNS, ...columns];
  const sets = cols.map((c, i) => `${c} = $${i + 1}`).join(', ');
  const values = [...cols.map((c) => data[c] ?? null), id];
  const { rowCount } = await pool.query(
    `UPDATE ${table} SET ${sets}, updated_at = NOW() WHERE id = $${values.length}`, values);
  return rowCount === 1;
}

export async function deleteEntry(slug, id) {
  const { table } = typeOrThrow(slug);
  const { rowCount } = await pool.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
  return rowCount === 1;
}