require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL + (process.env.DATABASE_URL?.includes('sslmode') ? '' : '?sslmode=require'),
  ssl: { rejectUnauthorized: false }
});

async function dedup() {
  const client = await pool.connect();
  try {
    // Count before
    const before = await client.query('SELECT COUNT(*) FROM inventario WHERE deleted_at IS NULL');
    console.log('Registros antes:', before.rows[0].count);

    // Fix "0" departamentos → NULL
    const fixed = await client.query(`
      UPDATE inventario
      SET departamento = NULL
      WHERE (departamento = '0' OR departamento = '') AND deleted_at IS NULL
    `);
    console.log('Departamentos "0" corregidos:', fixed.rowCount);

    // Delete duplicates — keep the record with MAX(id) per (codigo, producto)
    const deleted = await client.query(`
      DELETE FROM inventario
      WHERE id NOT IN (
        SELECT MAX(id)
        FROM inventario
        WHERE deleted_at IS NULL
        GROUP BY COALESCE(NULLIF(TRIM(codigo), ''), '__NO_CODIGO__'), TRIM(producto)
      )
      AND deleted_at IS NULL
    `);
    console.log('Duplicados eliminados:', deleted.rowCount);

    // Count after
    const after = await client.query('SELECT COUNT(*) FROM inventario WHERE deleted_at IS NULL');
    console.log('Registros después:', after.rows[0].count);

  } finally {
    client.release();
    await pool.end();
  }
}

dedup().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
