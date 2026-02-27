require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS sales (
        id             SERIAL PRIMARY KEY,
        folio          TEXT,
        client_name    TEXT NOT NULL,
        payment_method TEXT NOT NULL,
        date           DATE NOT NULL,
        total          NUMERIC(12,2) NOT NULL,
        created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        edited_at      TIMESTAMPTZ,
        deleted_at     TIMESTAMPTZ
      );
    `);
    console.log('✅  Table "sales" ready.');

    await client.query(`
      CREATE TABLE IF NOT EXISTS sale_items (
        id           SERIAL PRIMARY KEY,
        sale_id      INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
        product_name TEXT NOT NULL,
        unit         TEXT NOT NULL,
        quantity     NUMERIC(10,2) NOT NULL,
        price        NUMERIC(12,2) NOT NULL,
        discount     NUMERIC(12,2) NOT NULL DEFAULT 0,
        subtotal     NUMERIC(12,2) NOT NULL,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✅  Table "sale_items" ready.');

  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
