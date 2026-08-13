import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../lib/db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'smart_grocery_secret_key_2026';

// Helper to format JSON / boolean fields from MySQL rows
function formatRow(row) {
  if (!row) return null;
  const formatted = { ...row };
  for (const key of Object.keys(formatted)) {
    if (['is_featured', 'is_published', 'is_active', 'auto_apply'].includes(key)) {
      formatted[key] = Boolean(formatted[key]);
    }
    if (typeof formatted[key] === 'string' && (formatted[key].startsWith('[') || formatted[key].startsWith('{'))) {
      try {
        formatted[key] = JSON.parse(formatted[key]);
      } catch (e) {
        // Keep original string if parse fails
      }
    }
  }
  return formatted;
}

// Authentication Middleware
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.user = user;
    next();
  });
}

// ==========================================
// 1. AUTHENTICATION ROUTES
// ==========================================

// Register
router.post('/auth/register', async (req, res) => {
  const { email, password, full_name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const [existing] = await pool.query('SELECT * FROM profiles WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    const role = email === 'msmraqeeb@gmail.com' ? 'admin' : 'customer';

    await pool.query(
      'INSERT INTO profiles (id, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)',
      [userId, email, hashedPassword, full_name || '', role]
    );

    const user = { id: userId, email, full_name, role };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '30d' });

    res.json({ token, user });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM profiles WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const userRow = rows[0];
    if (userRow.password) {
      const match = await bcrypt.compare(password, userRow.password);
      if (!match) {
        return res.status(400).json({ error: 'Invalid email or password' });
      }
    }

    const user = {
      id: userRow.id,
      email: userRow.email,
      full_name: userRow.full_name,
      role: userRow.role
    };

    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get Current Profile
router.get('/auth/me', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, email, full_name, role, created_at FROM profiles WHERE id = ?', [req.user.id]);
    if (rows.length === 0) return res.status(444).json({ error: 'User not found' });
    res.json(formatRow(rows[0]));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update Profile Name
router.put('/auth/profile', authenticateToken, async (req, res) => {
  const { full_name } = req.body;
  try {
    await pool.query('UPDATE profiles SET full_name = ? WHERE id = ?', [full_name, req.user.id]);
    res.json({ success: true, full_name });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Update Password
router.put('/auth/password', authenticateToken, async (req, res) => {
  const { password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query('UPDATE profiles SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// Admin: Get all profiles
router.get('/profiles', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, email, full_name, role, created_at FROM profiles ORDER BY created_at DESC');
    res.json(rows.map(formatRow));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profiles' });
  }
});

// Admin: Update user role
router.put('/profiles/:id/role', async (req, res) => {
  const { role } = req.body;
  try {
    await pool.query('UPDATE profiles SET role = ? WHERE id = ?', [role, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// ==========================================
// 2. PRODUCTS & CATEGORIES & BRANDS
// ==========================================

// Products
router.get('/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json(rows.map(formatRow));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.post('/products', async (req, res) => {
  const p = req.body;
  try {
    const imagesJson = JSON.stringify(p.images || []);
    const variantsJson = JSON.stringify(p.variants || []);
    const [result] = await pool.query(
      `INSERT INTO products (name, slug, price, original_price, category, brand, unit, sku, images, image_url, short_description, description, badge, is_featured, variants)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [p.name, p.slug || null, p.price, p.original_price || null, p.category || null, p.brand || null, p.unit || null, p.sku || null, imagesJson, p.image_url || null, p.short_description || null, p.description || null, p.badge || null, p.is_featured ? 1 : 0, variantsJson]
    );
    res.json({ id: result.insertId, ...p });
  } catch (error) {
    console.error('Insert product error:', error);
    res.status(500).json({ error: 'Failed to insert product' });
  }
});

router.put('/products/:id', async (req, res) => {
  const p = req.body;
  const id = req.params.id;
  try {
    const imagesJson = JSON.stringify(p.images || []);
    const variantsJson = JSON.stringify(p.variants || []);
    await pool.query(
      `UPDATE products SET name=?, slug=?, price=?, original_price=?, category=?, brand=?, unit=?, sku=?, images=?, image_url=?, short_description=?, description=?, badge=?, is_featured=?, variants=?
       WHERE id=?`,
      [p.name, p.slug || null, p.price, p.original_price || null, p.category || null, p.brand || null, p.unit || null, p.sku || null, imagesJson, p.image_url || null, p.short_description || null, p.description || null, p.badge || null, p.is_featured ? 1 : 0, variantsJson, id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Categories
router.get('/categories', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    res.json(rows.map(formatRow));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.post('/categories', async (req, res) => {
  const { name, slug, parent_id, image_url } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO categories (name, slug, parent_id, image_url) VALUES (?, ?, ?, ?)',
      [name, slug || null, parent_id || null, image_url || null]
    );
    res.json({ id: result.insertId, name, slug, parent_id, image_url });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add category' });
  }
});

router.put('/categories/:id', async (req, res) => {
  const { name, slug, parent_id, image_url } = req.body;
  try {
    await pool.query(
      'UPDATE categories SET name=?, slug=?, parent_id=?, image_url=? WHERE id=?',
      [name, slug || null, parent_id || null, image_url || null, req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update category' });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// Brands
router.get('/brands', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM brands ORDER BY name ASC');
    res.json(rows.map(formatRow));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
});

router.post('/brands', async (req, res) => {
  const { name, slug, logo_url } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO brands (name, slug, logo_url) VALUES (?, ?, ?)',
      [name, slug || null, logo_url || null]
    );
    res.json({ id: result.insertId, name, slug, logo_url });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add brand' });
  }
});

router.put('/brands/:id', async (req, res) => {
  const { name, slug, logo_url } = req.body;
  try {
    await pool.query(
      'UPDATE brands SET name=?, slug=?, logo_url=? WHERE id=?',
      [name, slug || null, logo_url || null, req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update brand' });
  }
});

router.delete('/brands/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM brands WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete brand' });
  }
});

// ==========================================
// 3. SETTINGS & OTHER RESOURCES
// ==========================================

// Settings
router.get('/settings/:key', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM settings WHERE `key` = ?', [req.params.key]);
    if (rows.length === 0) return res.json(null);
    res.json(formatRow(rows[0]));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch setting' });
  }
});

router.post('/settings', async (req, res) => {
  const { key, value } = req.body;
  try {
    const valJson = typeof value === 'string' ? value : JSON.stringify(value);
    await pool.query(
      'INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)',
      [key, valJson]
    );
    res.json({ success: true, key, value });
  } catch (error) {
    console.error('Settings upsert error:', error);
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

// Banners
router.get('/banners', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM banners ORDER BY sort_order ASC');
    res.json(rows.map(formatRow));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch banners' });
  }
});

// Blog Posts
router.get('/blog-posts', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM blog_posts ORDER BY created_at DESC');
    res.json(rows.map(formatRow));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
});

// Attributes
router.get('/attributes', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM attributes ORDER BY name ASC');
    res.json(rows.map(formatRow));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attributes' });
  }
});

router.post('/attributes', async (req, res) => {
  const { name, values } = req.body;
  try {
    const valuesJson = JSON.stringify(values || []);
    const [result] = await pool.query(
      'INSERT INTO attributes (name, `values`) VALUES (?, ?)',
      [name, valuesJson]
    );
    res.json({ id: result.insertId, name, values });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add attribute' });
  }
});

router.put('/attributes/:id', async (req, res) => {
  const { name, values } = req.body;
  try {
    const valuesJson = JSON.stringify(values || []);
    await pool.query(
      'UPDATE attributes SET name=?, `values`=? WHERE id=?',
      [name, valuesJson, req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update attribute' });
  }
});

router.delete('/attributes/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM attributes WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete attribute' });
  }
});

// Coupons
router.get('/coupons', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM coupons ORDER BY created_at DESC');
    res.json(rows.map(formatRow));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch coupons' });
  }
});

router.post('/coupons', async (req, res) => {
  const c = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO coupons (code, discount_type, discount_value, minimum_spend, expiry_date, status, auto_apply)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [c.code, c.discount_type, c.discount_value, c.minimum_spend || 0, c.expiry_date, c.status || 'Active', c.auto_apply ? 1 : 0]
    );
    res.json({ id: result.insertId, ...c });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add coupon' });
  }
});

router.put('/coupons/:id', async (req, res) => {
  const c = req.body;
  try {
    await pool.query(
      `UPDATE coupons SET code=?, discount_type=?, discount_value=?, minimum_spend=?, expiry_date=?, status=?, auto_apply=?
       WHERE id=?`,
      [c.code, c.discount_type, c.discount_value, c.minimum_spend || 0, c.expiry_date, c.status || 'Active', c.auto_apply ? 1 : 0, req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update coupon' });
  }
});

router.delete('/coupons/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM coupons WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete coupon' });
  }
});

// Reviews
router.get('/reviews', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM reviews ORDER BY created_at DESC');
    res.json(rows.map(formatRow));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

router.post('/reviews', async (req, res) => {
  const r = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO reviews (product_id, product_name, author_name, rating, comment) VALUES (?, ?, ?, ?, ?)',
      [r.productId || r.product_id, r.productName || r.product_name, r.authorName || r.author_name, r.rating, r.comment]
    );
    res.json({ id: result.insertId, ...r });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

router.put('/reviews/:id/reply', async (req, res) => {
  const { reply } = req.body;
  try {
    await pool.query('UPDATE reviews SET reply = ? WHERE id = ?', [reply, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reply to review' });
  }
});

router.delete('/reviews/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM reviews WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

// Pages
router.get('/pages', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM pages ORDER BY created_at DESC');
    res.json(rows.map(formatRow));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
});

// ==========================================
// 4. ORDERS & USER WISHLIST / ADDRESSES
// ==========================================

// Orders
router.get('/orders', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(rows.map(formatRow));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.post('/orders', async (req, res) => {
  const o = req.body;
  try {
    const itemsJson = JSON.stringify(o.items || []);
    const [result] = await pool.query(
      `INSERT INTO orders (customer_name, customer_email, customer_phone, customer_address, customer_district, customer_area, subtotal, shipping_cost, discount, total, status, items, coupon_code, user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [o.customer_name, o.customer_email || null, o.customer_phone || null, o.customer_address || null, o.customer_district || null, o.customer_area || null, o.subtotal || 0, o.shipping_cost || 0, o.discount || 0, o.total || 0, o.status || 'Pending', itemsJson, o.coupon_code || null, o.user_id || null]
    );
    res.json({ id: result.insertId, ...o });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

router.put('/orders/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// User Wishlist
router.get('/wishlist/:userId', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT product_id FROM wishlist WHERE user_id = ?', [req.params.userId]);
    res.json(rows.map(r => r.product_id));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

router.post('/wishlist', async (req, res) => {
  const { user_id, product_id } = req.body;
  try {
    await pool.query('INSERT IGNORE INTO wishlist (user_id, product_id) VALUES (?, ?)', [user_id, product_id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
});

router.delete('/wishlist', async (req, res) => {
  const { user_id, product_id } = req.body;
  try {
    await pool.query('DELETE FROM wishlist WHERE user_id = ? AND product_id = ?', [user_id, product_id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
});

// User Addresses
router.get('/addresses/:userId', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM addresses WHERE user_id = ? ORDER BY created_at DESC', [req.params.userId]);
    res.json(rows.map(formatRow));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch addresses' });
  }
});

router.post('/addresses', async (req, res) => {
  const a = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO addresses (user_id, full_name, phone, address_line, district, area) VALUES (?, ?, ?, ?, ?, ?)',
      [a.user_id, a.full_name, a.phone, a.address_line, a.district, a.area]
    );
    res.json({ id: result.insertId, ...a });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add address' });
  }
});

router.delete('/addresses/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM addresses WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete address' });
  }
});

export default router;
