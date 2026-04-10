require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const xlsx = require('xlsx');

const upload = multer({ storage: multer.memoryStorage() });

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'https://ferreteria-admin.vercel.app',
  // Add any preview URLs or custom domains here
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json());


// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('Error acquiring database client', err.stack);
  } else {
    console.log('Database connected successfully');
    client.query(`
      CREATE TABLE IF NOT EXISTS client_payments (
        id SERIAL PRIMARY KEY,
        client_name VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(100),
        date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        deleted_at TIMESTAMP WITH TIME ZONE
      );
    `).catch(err => console.error('Error creating client_payments table', err));
    release();
  }
});

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'Hardware Store API is running!' });
});

// ─── USERS ────────────────────────────────────────────────────────────────────

// GET /api/users — List active (non-deleted) users
app.get('/api/users', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, email, role, created_at, edited_at
       FROM users
       WHERE deleted_at IS NULL
       ORDER BY id ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// GET /api/users/:id — Get single user
app.get('/api/users/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, email, role, created_at, edited_at
       FROM users
       WHERE id = $1 AND deleted_at IS NULL`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

// POST /api/users — Create user
app.post('/api/users', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nombre, correo y contraseña son requeridos' });
  }
  const validRoles = ['administrador', 'operativo', 'Sistemas'];
  const userRole = validRoles.includes(role) ? role : 'operativo';
  try {
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [name, email, password, userRole]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }
    console.error(err);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

// PUT /api/users/:id — Update user
app.put('/api/users/:id', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const validRoles = ['administrador', 'operativo', 'Sistemas'];
    const fields = [];
    const values = [];
    let idx = 1;

    if (name) { fields.push(`name = $${idx++}`); values.push(name); }
    if (email) { fields.push(`email = $${idx++}`); values.push(email); }
    if (password) { fields.push(`password = $${idx++}`); values.push(password); }
    if (role && validRoles.includes(role)) { fields.push(`role = $${idx++}`); values.push(role); }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    fields.push(`edited_at = NOW()`);
    values.push(req.params.id);

    const { rows } = await pool.query(
      `UPDATE users
       SET ${fields.join(', ')}
       WHERE id = $${idx} AND deleted_at IS NULL
       RETURNING id, name, email, role, created_at, edited_at`,
      values
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

// DELETE /api/users/:id — Soft delete
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE users
       SET deleted_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ message: 'Usuario eliminado', id: rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

// ─── Server ───────────────────────────────────────────────────────────────────

// ─── AUTH ─────────────────────────────────────────────────────────────────────

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
  }
  try {
    const { rows } = await pool.query(
      `SELECT id, name, email, role, password FROM users WHERE email = $1 AND deleted_at IS NULL`,
      [email]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    const user = rows[0];
    if (user.password !== password) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    // Return user info (never the password)
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// ─── PURCHASES ───────────────────────────────────────────────────────────────


const MX_TZ = 'America/Mexico_City';

// Helper: format a JS Date as 'DD/MM/YYYY HH:mm' in CDMX timezone
function fmtMx(dt) {
  if (!dt) return null;
  return new Date(dt).toLocaleString('es-MX', {
    timeZone: MX_TZ,
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false
  });
}

// GET /api/purchases
app.get('/api/purchases', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, folio, provider, payment_method, date, total, status, created_at, edited_at
      FROM purchases
      WHERE deleted_at IS NULL
      ORDER BY id DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener compras' });
  }
});

// GET /api/purchases/:id
app.get('/api/purchases/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, folio, provider, payment_method, date, total, status, created_at, edited_at
      FROM purchases
      WHERE id = $1 AND deleted_at IS NULL
    `, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Compra no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener compra' });
  }
});

// POST /api/purchases
app.post('/api/purchases', async (req, res) => {
  const { folio, provider, payment_method, date, total } = req.body;
  if (!folio || !provider || !payment_method || !date || total == null) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }
  try {
    const { rows } = await pool.query(`
      INSERT INTO purchases (folio, provider, payment_method, date, total)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [folio, provider, payment_method, date, total]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear compra' });
  }
});

// PUT /api/purchases/:id
app.put('/api/purchases/:id', async (req, res) => {
  const { folio, provider, payment_method, date, total, status } = req.body;
  const validStatus = ['Sin desglosar', 'Desglosado'];
  const fields = [];
  const values = [];
  let idx = 1;
  if (folio) { fields.push(`folio = $${idx++}`); values.push(folio); }
  if (provider) { fields.push(`provider = $${idx++}`); values.push(provider); }
  if (payment_method) { fields.push(`payment_method = $${idx++}`); values.push(payment_method); }
  if (date) { fields.push(`date = $${idx++}`); values.push(date); }
  if (total != null) { fields.push(`total = $${idx++}`); values.push(total); }
  if (status && validStatus.includes(status)) { fields.push(`status = $${idx++}`); values.push(status); }
  if (!fields.length) return res.status(400).json({ error: 'Sin campos para actualizar' });
  fields.push(`edited_at = NOW()`);
  values.push(req.params.id);
  try {
    const { rows } = await pool.query(`
      UPDATE purchases SET ${fields.join(', ')}
      WHERE id = $${idx} AND deleted_at IS NULL
      RETURNING *
    `, values);
    if (!rows.length) return res.status(404).json({ error: 'Compra no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar compra' });
  }
});

// DELETE /api/purchases/:id (soft)
app.delete('/api/purchases/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      UPDATE purchases SET deleted_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING id
    `, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Compra no encontrada' });
    res.json({ message: 'Compra eliminada', id: rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar compra' });
  }
});

// GET /api/purchases/:id/items
app.get('/api/purchases/:id/items', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, name, unit, quantity, price, discount, subtotal
      FROM purchase_items
      WHERE purchase_id = $1
      ORDER BY id ASC
    `, [req.params.id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener desglose' });
  }
});

// POST /api/purchases/:id/items (Bulk replace items)
app.post('/api/purchases/:id/items', async (req, res) => {
  const purchaseId = req.params.id;
  const { items, status } = req.body;

  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Se requiere un arreglo de items' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Revert Old Stock
    const oldItemsRes = await client.query('SELECT name, quantity FROM purchase_items WHERE purchase_id = $1', [purchaseId]);
    for (const oldItem of oldItemsRes.rows) {
      await client.query(`
        UPDATE inventory 
        SET stock = stock - $1, edited_at = NOW()
        WHERE product_name = $2
      `, [oldItem.quantity, oldItem.name]);
    }

    // 2. Delete old items (hard delete for breakdown lines)
    await client.query('DELETE FROM purchase_items WHERE purchase_id = $1', [purchaseId]);

    // Get the purchase date for the inventory's last_purchase_date
    const purchaseRes = await client.query('SELECT date FROM purchases WHERE id = $1', [purchaseId]);
    const pDate = purchaseRes.rows[0]?.date || null;

    // 3. Insert new items and Apply New Stock
    for (const item of items) {
      await client.query(`
        INSERT INTO purchase_items (purchase_id, name, unit, quantity, price, discount, subtotal)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [purchaseId, item.name, item.unit, item.quantity, item.price, item.discount || 0, item.subtotal]);

      // UPSERT into inventory
      await client.query(`
        INSERT INTO inventory (product_name, stock, unit, last_purchase_date)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (product_name) DO UPDATE SET 
          stock = inventory.stock + EXCLUDED.stock,
          unit = EXCLUDED.unit,
          last_purchase_date = GREATEST(inventory.last_purchase_date, EXCLUDED.last_purchase_date),
          edited_at = NOW()
      `, [item.name, item.quantity, item.unit, pDate]);
    }

    // 4. Update purchase status
    if (status) {
      await client.query(`
        UPDATE purchases SET status = $1, edited_at = NOW()
        WHERE id = $2 AND deleted_at IS NULL
      `, [status, purchaseId]);
    }

    await client.query('COMMIT');
    res.json({ message: 'Desglose guardado y existencia actualizada' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error syncing inventory:', err);
    res.status(500).json({ error: 'Error al verificar inventario' });
  } finally {
    client.release();
  }
});

// ─── INVENTORY ────────────────────────────────────────────────────────────────

// ─── INVENTARIO (NUEVO) ───────────────────────────────────────────────────────
app.get('/api/inventario', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, codigo, producto, p_costo, p_venta, p_mayoreo, existencia, inv_minimo, inv_maximo, departamento, created_at, edited_at
      FROM inventario
      WHERE deleted_at IS NULL
      ORDER BY producto ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener nuevo inventario' });
  }
});

app.post('/api/inventario', async (req, res) => {
  const { 
    codigo, 
    producto, 
    p_costo, 
    p_venta, 
    p_mayoreo, 
    existencia, 
    inv_minimo, 
    inv_maximo, 
    departamento 
  } = req.body;

  if (!producto) {
    return res.status(400).json({ error: 'El nombre del producto es requerido' });
  }

  try {
    const { rows } = await pool.query(`
      INSERT INTO inventario (codigo, producto, p_costo, p_venta, p_mayoreo, existencia, inv_minimo, inv_maximo, departamento)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      codigo || null, 
      producto, 
      p_costo || 0, 
      p_venta || 0, 
      p_mayoreo || 0, 
      existencia || 0, 
      inv_minimo || 0, 
      inv_maximo || 0, 
      departamento || null
    ]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear producto en el inventario' });
  }
});

app.put('/api/inventario/:id', async (req, res) => {
  const { existencia, p_venta, p_mayoreo } = req.body;
  const fields = [];
  const values = [];
  let idx = 1;

  if (existencia !== undefined) { fields.push(`existencia = $${idx++}`); values.push(existencia); }
  if (p_venta !== undefined) { fields.push(`p_venta = $${idx++}`); values.push(p_venta); }
  if (p_mayoreo !== undefined) { fields.push(`p_mayoreo = $${idx++}`); values.push(p_mayoreo); }

  if (fields.length === 0) return res.status(400).json({ error: 'Faltan campos (existencia, p_venta o p_mayoreo)' });

  fields.push(`edited_at = NOW()`);
  values.push(req.params.id);

  try {
    const { rows } = await pool.query(`
      UPDATE inventario 
      SET ${fields.join(', ')}
      WHERE id = $${idx} AND deleted_at IS NULL
      RETURNING *
    `, values);

    if (rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error actualizando inventario' });
  }
});

app.post('/api/inventario/import', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se subió ningún archivo' });
  
  const parseNum = (str) => {
    if (!str) return 0;
    if (typeof str === 'number') return str;
    const clean = str.replace(/[^\d.-]/g, '');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  };

  try {
    // Con memoryStorage el archivo viene en req.file.buffer (no en disco)
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    
    // DEBUG: log header and first 3 rows to diagnose column mapping
    console.log('[IMPORT] Header row:', JSON.stringify(data[0]));
    data.slice(1, 4).forEach((row, i) => console.log(`[IMPORT] Row ${i+1}:`, JSON.stringify(row)));

    const rowsRaw = data.slice(1);
    
    const client = await pool.connect();
    let updatedCount = 0;
    let insertedCount = 0;

    try {
      await client.query('BEGIN');
      
      for (const row of rowsRaw) {
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
        const departamento = String(row[8] || '').trim();

        let existingResult;
        if (codigo) {
           existingResult = await client.query('SELECT id FROM inventario WHERE codigo = $1 AND deleted_at IS NULL LIMIT 1', [codigo]);
           if (existingResult.rows.length === 0) {
              existingResult = await client.query('SELECT id FROM inventario WHERE producto = $1 AND deleted_at IS NULL LIMIT 1', [producto]);
           }
        } else {
           existingResult = await client.query('SELECT id FROM inventario WHERE producto = $1 AND deleted_at IS NULL LIMIT 1', [producto]);
        }

        if (existingResult.rows.length > 0) {
           const id = existingResult.rows[0].id;
           await client.query(`
             UPDATE inventario 
             SET codigo = $1, producto = $2, p_costo = $3, p_venta = $4, p_mayoreo = $5, existencia = $6, inv_minimo = $7, inv_maximo = $8, departamento = $9, edited_at = NOW()
             WHERE id = $10
           `, [codigo || null, producto, p_costo, p_venta, p_mayoreo, existencia, inv_minimo, inv_maximo, departamento, id]);
           updatedCount++;
        } else {
           await client.query(`
             INSERT INTO inventario (codigo, producto, p_costo, p_venta, p_mayoreo, existencia, inv_minimo, inv_maximo, departamento)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           `, [codigo || null, producto, p_costo, p_venta, p_mayoreo, existencia, inv_minimo, inv_maximo, departamento]);
           insertedCount++;
        }
      }
      
      await client.query('COMMIT');
      res.json({ message: 'Importación completada', updatedCount, insertedCount });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error importando Excel:', error);
    res.status(500).json({ error: 'Error procesando el archivo Excel' });
  }
});

// ─── INVENTORY (OLD) ──────────────────────────────────────────────────────────
// GET /api/inventory
app.get('/api/inventory', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, product_name, stock, unit, last_purchase_date, edited_at
      FROM inventory
      WHERE deleted_at IS NULL
      ORDER BY product_name ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener inventario' });
  }
});

// PUT /api/inventory/:id
app.put('/api/inventory/:id', async (req, res) => {
  const { stock } = req.body;
  if (stock == null) return res.status(400).json({ error: 'Stock requerido' });

  try {
    const { rows } = await pool.query(`
      UPDATE inventory 
      SET stock = $1, edited_at = NOW()
      WHERE id = $2 AND deleted_at IS NULL
      RETURNING *
    `, [stock, req.params.id]);

    if (rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error actualizando inventario' });
  }
});

// ─── SALES (VENTAS) ───────────────────────────────────────────────────────────

// GET /api/sales
app.get('/api/sales', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, folio, client_name, payment_method, date, total, created_at, edited_at
      FROM sales
      WHERE deleted_at IS NULL
      ORDER BY id DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener ventas' });
  }
});

// GET /api/sales/:id (Header + Items)
app.get('/api/sales/:id', async (req, res) => {
  try {
    // 1. Get header
    const { rows: saleRows } = await pool.query(`
      SELECT id, folio, client_name, payment_method, date, total, created_at, edited_at
      FROM sales
      WHERE id = $1 AND deleted_at IS NULL
    `, [req.params.id]);

    if (saleRows.length === 0) return res.status(404).json({ error: 'Venta no encontrada' });
    const sale = saleRows[0];

    // 2. Get items
    const { rows: itemRows } = await pool.query(`
      SELECT id, product_name, unit, quantity, price, discount, subtotal
      FROM sale_items
      WHERE sale_id = $1
      ORDER BY id ASC
    `, [req.params.id]);

    sale.items = itemRows;
    res.json(sale);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener la venta' });
  }
});

// POST /api/sales (Header + Items in single transaction + Inventory reduction)
app.post('/api/sales', async (req, res) => {
  const { folio, client_name, payment_method, date, total, items } = req.body;
  if (!client_name || !payment_method || !date || total == null || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Faltan datos de la venta o productos' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Verify Inventory
    for (const item of items) {
      const invRes = await client.query('SELECT stock FROM inventory WHERE product_name = $1 AND deleted_at IS NULL FOR UPDATE', [item.name]);
      if (invRes.rows.length === 0) {
        throw new Error(`El producto "${item.name}" no existe en el inventario`);
      }
      const available = Number(invRes.rows[0].stock);
      const requested = Number(item.quantity);
      if (requested > available) {
        throw new Error(`Stock insuficiente para "${item.name}". Solicitado: ${requested}, Disponible: ${available}`);
      }
    }

    // 2. Insert Sale Header
    const saleRes = await client.query(`
      INSERT INTO sales (folio, client_name, payment_method, date, total)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, [folio || null, client_name, payment_method, date, total]);
    const saleId = saleRes.rows[0].id;

    // 3. Insert Items && Deduct Inventory
    for (const item of items) {
      // Insert item
      await client.query(`
        INSERT INTO sale_items (sale_id, product_name, unit, quantity, price, discount, subtotal)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [saleId, item.name, item.unit, item.quantity, item.price, item.discount || 0, item.subtotal]);

      // Deduct inventory
      await client.query(`
        UPDATE inventory
        SET stock = stock - $1, edited_at = NOW()
        WHERE product_name = $2
      `, [item.quantity, item.name]);
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Venta registrada con éxito', id: saleId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating sale:', err.message);
    res.status(400).json({ error: err.message || 'Error al procesar la venta' });
  } finally {
    client.release();
  }
});

// PUT /api/sales/:id (Header only)
app.put('/api/sales/:id', async (req, res) => {
  const { folio, client_name, payment_method, date } = req.body;
  const fields = [];
  const values = [];
  let idx = 1;

  if (folio !== undefined) { fields.push(`folio = $${idx++}`); values.push(folio); }
  if (client_name) { fields.push(`client_name = $${idx++}`); values.push(client_name); }
  if (payment_method) { fields.push(`payment_method = $${idx++}`); values.push(payment_method); }
  if (date) { fields.push(`date = $${idx++}`); values.push(date); }

  if (fields.length === 0) return res.status(400).json({ error: 'Sin campos para actualizar' });

  fields.push(`edited_at = NOW()`);
  values.push(req.params.id);

  try {
    const { rows } = await pool.query(`
      UPDATE sales SET ${fields.join(', ')}
      WHERE id = $${idx} AND deleted_at IS NULL
      RETURNING *
    `, values);
    if (!rows.length) return res.status(404).json({ error: 'Venta no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar la venta' });
  }
});

// DELETE /api/sales/:id (Soft delete Header + Revert Inventory using sale_items)
app.delete('/api/sales/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Soft delete header
    const { rows } = await client.query(`
      UPDATE sales SET deleted_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING id
    `, [req.params.id]);

    if (!rows.length) throw new Error('Venta no encontrada o ya eliminada');

    // 2. Revert inventory
    const itemsRes = await client.query('SELECT product_name, quantity FROM sale_items WHERE sale_id = $1', [req.params.id]);
    for (const item of itemsRes.rows) {
      await client.query(`
        UPDATE inventory
        SET stock = stock + $1, edited_at = NOW()
        WHERE product_name = $2
      `, [item.quantity, item.product_name]);
    }

    await client.query('COMMIT');
    res.json({ message: 'Venta eliminada e inventario restaurado', id: rows[0].id });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error deleting sale:', err.message);
    res.status(400).json({ error: err.message || 'Error al eliminar la venta' });
  } finally {
    client.release();
  }
});

// ─── Exports / Start ──────────────────────────────────────────────────────────
// ─── CLIENTES ────────────────────────────────────────────────────────────────
// GET /api/clientes
app.get('/api/clientes', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, folio, name, phone, address, created_at, edited_at
      FROM clientes
      WHERE deleted_at IS NULL
      ORDER BY id DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
});

// GET /api/clientes/:id
app.get('/api/clientes/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, folio, name, phone, address, created_at, edited_at
      FROM clientes
      WHERE id = $1 AND deleted_at IS NULL
    `, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener cliente' });
  }
});

// POST /api/clientes
app.post('/api/clientes', async (req, res) => {
  const { name, phone, address } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'El nombre es requerido' });
  }
  try {
    // Generate a simple folio, e.g., CL-YYYYMMDD-HHMMSS
    const now = new Date();
    const ts = now.toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const folio = `CL-${ts}`;

    const { rows } = await pool.query(`
      INSERT INTO clientes (folio, name, phone, address)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [folio, name, phone, address]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear cliente' });
  }
});

// PUT /api/clientes/:id
app.put('/api/clientes/:id', async (req, res) => {
  const { name, phone, address } = req.body;
  const fields = [];
  const values = [];
  let idx = 1;

  if (name !== undefined) { fields.push(`name = $${idx++}`); values.push(name); }
  if (phone !== undefined) { fields.push(`phone = $${idx++}`); values.push(phone); }
  if (address !== undefined) { fields.push(`address = $${idx++}`); values.push(address); }

  if (fields.length === 0) {
    return res.status(400).json({ error: 'No data to update' });
  }

  fields.push(`edited_at = NOW()`);
  values.push(req.params.id);

  try {
    const query = `
      UPDATE clientes
      SET ${fields.join(', ')}
      WHERE id = $${idx} AND deleted_at IS NULL
      RETURNING *
    `;
    const { rows } = await pool.query(query, values);
    if (!rows.length) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar cliente' });
  }
});

// DELETE /api/clientes/:id
app.delete('/api/clientes/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      UPDATE clientes SET deleted_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING id
    `, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json({ message: 'Cliente eliminado', id: rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar cliente' });
  }
});
// ─── CUENTAS ───────────────────────────────────────────────────────────────────

// GET /api/cuentas
app.get('/api/cuentas', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        c.id, 
        c.name AS cliente, 
        (SELECT MAX(date) FROM sales WHERE LOWER(TRIM(client_name)) = LOWER(TRIM(c.name)) AND deleted_at IS NULL) as ultima_compra, 
        (
          COALESCE((SELECT SUM(amount) FROM client_payments WHERE LOWER(TRIM(client_name)) = LOWER(TRIM(c.name)) AND deleted_at IS NULL), 0)
          -
          COALESCE((SELECT SUM(total) FROM sales WHERE LOWER(TRIM(client_name)) = LOWER(TRIM(c.name)) AND deleted_at IS NULL), 0)
        ) as cuenta_total
      FROM clientes c
      WHERE c.deleted_at IS NULL
      ORDER BY c.id DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener cuentas' });
  }
});

// GET /api/cuentas/:id/movimientos
app.get('/api/cuentas/:id/movimientos', async (req, res) => {
  try {
    const { rows: clientRows } = await pool.query(`SELECT name FROM clientes WHERE id = $1 LIMIT 1`, [req.params.id]);
    if (!clientRows.length) return res.status(404).json({ error: 'Cliente no encontrado' });
    
    const clientName = clientRows[0].name;

    const { rows: salesRows } = await pool.query(`
      SELECT id, date, (total * -1) AS total, payment_method, folio, 'cargo' as type
      FROM sales
      WHERE LOWER(TRIM(client_name)) = LOWER(TRIM($1)) AND deleted_at IS NULL
      UNION ALL
      SELECT id, date, amount AS total, payment_method, NULL as folio, 'abono' as type
      FROM client_payments
      WHERE LOWER(TRIM(client_name)) = LOWER(TRIM($1)) AND deleted_at IS NULL
      ORDER BY date DESC
    `, [clientName]);
    
    res.json(salesRows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener movimientos' });
  }
});


// POST /api/cuentas/:id/pagos
app.post('/api/cuentas/:id/pagos', async (req, res) => {
  const { amount, payment_method } = req.body;
  if (!amount || !payment_method) return res.status(400).json({ error: 'Monto y forma de pago son requeridos' });
  
  try {
    const { rows: clientRows } = await pool.query(`SELECT name FROM clientes WHERE id = $1 LIMIT 1`, [req.params.id]);
    if (!clientRows.length) return res.status(404).json({ error: 'Cliente no encontrado' });
    const clientName = clientRows[0].name;

    const { rows } = await pool.query(`
      INSERT INTO client_payments (client_name, amount, payment_method)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [clientName, amount, payment_method]);
    
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar abono' });
  }
});


// ─── REPORTS ──────────────────────────────────────────────────────────────────

// GET /api/reports/payments?period...
app.get('/api/reports/payments', async (req, res) => {
  const { period, start, end, month } = req.query;

  const buildDateWhere = (col) => {
    if (period === 'today') {
      return `DATE(${col} AT TIME ZONE 'America/Mexico_City') = DATE(CURRENT_TIMESTAMP AT TIME ZONE 'America/Mexico_City')`;
    }
    if (period === 'month' && month) {
      return `TO_CHAR(${col} AT TIME ZONE 'America/Mexico_City', 'YYYY-MM') = '${month.replace(/'/g, "''")}'`;
    }
    if (period === 'range' && start && end) {
      return `DATE(${col} AT TIME ZONE 'America/Mexico_City') BETWEEN '${start.replace(/'/g, "''")}' AND '${end.replace(/'/g, "''")}'`;
    }
    return '1=1'; // all
  };

  try {
    const [paymentsRes, deudoresRes] = await Promise.all([
      pool.query(`
        SELECT payment_method, COALESCE(SUM(amount), 0)::numeric AS total
        FROM client_payments
        WHERE deleted_at IS NULL AND ${buildDateWhere('date')}
        GROUP BY payment_method
      `),
      pool.query(`
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
      `)
    ]);

    const METHODS = ['Efectivo', 'Transferencia', 'Tarjeta'];
    const ingresosMap = {};
    for (const r of paymentsRes.rows) ingresosMap[r.payment_method] = Number(r.total);

    const ingresosByMethod = METHODS.map(method => ({
      method,
      ingresos: ingresosMap[method] || 0
    }));

    const totalIngresos = ingresosByMethod.reduce((acc, r) => acc + r.ingresos, 0);

    const allDeudores = deudoresRes.rows.map(d => ({ name: d.name, deuda: Number(d.deuda) }));
    const totalDeudaGlobal = allDeudores.reduce((acc, d) => acc + d.deuda, 0);
    const topDeudores = allDeudores.slice(0, 5);

    res.json({
      ingresos: ingresosByMethod,
      total_ingresos: totalIngresos,
      total_deuda: totalDeudaGlobal,
      top_deudores: topDeudores
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al generar reporte de pagos' });
  }
});

module.exports = app;

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}
