require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL + (process.env.DATABASE_URL?.includes('sslmode') ? '' : '?sslmode=require'),
  ssl: { rejectUnauthorized: false }
});

async function check() {
  const client = await pool.connect();
  try {
    const r = await client.query(`SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'inventario'`);
    console.log('Indexes:', JSON.stringify(r.rows, null, 2));
  } finally {
    client.release();
    await pool.end();
  }
}
check().catch(e => { console.error(e.message); process.exit(1); });
