require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const xlsx = require('xlsx');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL + (process.env.DATABASE_URL?.includes('sslmode') ? '' : '?sslmode=require'),
  ssl: { rejectUnauthorized: false }
});

async function importExcel() {
  const parseNum = (str) => {
    if (!str) return 0;
    if (typeof str === 'number') return str;
    const clean = str.replace(/[^\d.-]/g, '');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  };

  const workbook = xlsx.readFile('/Users/ricardo/Documents/Deploy/ferreteria/admin/public/INVENTARIO AL 06 ABRIL 2026.xlsx');
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  
  // Skip the first row (headers)
  const rows = data.slice(1);

  const client = await pool.connect();
  let count = 0;
  
  try {
    await client.query('BEGIN');
    
    for (const row of rows) {
      if (!row || row.length === 0) continue;
      
      const codigo = String(row[0] || '').trim();
      const producto = String(row[1] || '').trim();
      
      if (!producto) continue;

      const p_costo = parseNum(row[2]);
      const p_venta = parseNum(row[3]);
      const p_mayoreo = parseNum(row[4]);
      const existencia = parseNum(row[5]);
      const inv_minimo = parseNum(row[6]);
      const inv_maximo = parseNum(row[7]);
      const raw_dept = String(row[8] || '').trim();
      const departamento = (raw_dept === '0' || raw_dept === '') ? null : raw_dept;

      await client.query(`
        INSERT INTO inventario (codigo, producto, p_costo, p_venta, p_mayoreo, existencia, inv_minimo, inv_maximo, departamento)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (producto) DO UPDATE SET
          codigo       = EXCLUDED.codigo,
          p_costo      = EXCLUDED.p_costo,
          p_venta      = EXCLUDED.p_venta,
          p_mayoreo    = EXCLUDED.p_mayoreo,
          existencia   = EXCLUDED.existencia,
          inv_minimo   = EXCLUDED.inv_minimo,
          inv_maximo   = EXCLUDED.inv_maximo,
          departamento = EXCLUDED.departamento,
          edited_at    = NOW()
      `, [codigo || null, producto, p_costo, p_venta, p_mayoreo, existencia, inv_minimo, inv_maximo, departamento]);
      
      count++;
    }
    
    await client.query('COMMIT');
    console.log(`Successfully inserted ${count} records into inventario.`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error importing:', error);
  } finally {
    client.release();
    pool.end();
  }
}

importExcel();
