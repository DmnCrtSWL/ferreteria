require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL + (process.env.DATABASE_URL?.includes('sslmode') ? '' : '?sslmode=require'),
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  const client = await pool.connect();
  try {
    // Add unique index on producto for UPSERT support
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS inventario_producto_unique
      ON inventario (TRIM(producto))
      WHERE deleted_at IS NULL
    `);
    console.log('✅  Unique index on inventario(producto) created.');
  } finally {
    client.release();
    await pool.end();
  }
}
migrate().catch(err => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
