const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
     const res1 = await pool.query("SELECT * FROM client_payments LIMIT 5");
     console.log("Client Payments:", res1.rows);
     
     const res2 = await pool.query(`
        WITH Deudores AS (
          SELECT 
            c.id, 
            c.name,
            (
              COALESCE((SELECT SUM(total) FROM sales WHERE LOWER(TRIM(client_name)) = LOWER(TRIM(c.name)) AND deleted_at IS NULL), 0)
              -
              COALESCE((SELECT SUM(amount) FROM client_payments WHERE LOWER(TRIM(client_name)) = LOWER(TRIM(c.name)) AND deleted_at IS NULL), 0)
            ) as deuda
          FROM clientes c
          WHERE c.deleted_at IS NULL
        )
        SELECT name, deuda FROM Deudores WHERE ROUND(deuda::numeric, 2) > 0 ORDER BY deuda DESC
     `);
     console.log("Deudores:", res2.rows);

  } catch(e) {
     console.error("Error", e);
  } finally {
     pool.end();
  }
}
run();
