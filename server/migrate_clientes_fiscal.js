require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL + (process.env.DATABASE_URL?.includes('sslmode') ? '' : '?sslmode=require'),
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  const client = await pool.connect();
  try {
    // Add rfc column if it doesn't exist
    await client.query(`
      ALTER TABLE clientes
      ADD COLUMN IF NOT EXISTS rfc VARCHAR(13);
    `);
    console.log('✅  Column "rfc" added to clientes.');

    // Add regimen_fiscal column if it doesn't exist
    await client.query(`
      ALTER TABLE clientes
      ADD COLUMN IF NOT EXISTS regimen_fiscal VARCHAR(10);
    `);
    console.log('✅  Column "regimen_fiscal" added to clientes.');

  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
