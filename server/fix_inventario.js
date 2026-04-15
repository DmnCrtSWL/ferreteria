require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL + (process.env.DATABASE_URL?.includes('sslmode') ? '' : '?sslmode=require'),
  ssl: { rejectUnauthorized: false }
});

async function fix() {
  const client = await pool.connect();
  try {
    // Find duplicate producto values
    const dups = await client.query(`
      SELECT TRIM(producto) as prod, COUNT(*) as cnt, array_agg(id ORDER BY id) as ids
      FROM inventario
      GROUP BY TRIM(producto)
      HAVING COUNT(*) > 1
      ORDER BY cnt DESC
      LIMIT 20
    `);
    console.log('Grupos duplicados encontrados:', dups.rows.length);
    if (dups.rows.length > 0) {
      console.log('Muestra:', dups.rows.slice(0, 3).map(r => ({ prod: r.prod.slice(0, 40), cnt: r.cnt })));
    }

    // Delete duplicates — for each producto keep only MAX(id)
    const result = await client.query(`
      DELETE FROM inventario
      WHERE id NOT IN (
        SELECT MAX(id)
        FROM inventario
        GROUP BY TRIM(producto)
      )
    `);
    console.log('Duplicados eliminados:', result.rowCount);

    // Fix "0" departamentos
    const fixed = await client.query(`
      UPDATE inventario
      SET departamento = NULL
      WHERE departamento IN ('0', '')
    `);
    console.log('Departamentos "0"/"" corregidos:', fixed.rowCount);

    // Final count
    const count = await client.query('SELECT COUNT(*) FROM inventario');
    console.log('Total registros:', count.rows[0].count);

    // Now create the unique index
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS inventario_producto_unique
      ON inventario (TRIM(producto))
    `);
    console.log('✅  Unique index creado correctamente.');

  } finally {
    client.release();
    await pool.end();
  }
}

fix().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
