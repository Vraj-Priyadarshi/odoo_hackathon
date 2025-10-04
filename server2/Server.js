const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
require('dotenv').config();

const app = express();

// ==================== DATABASE ====================
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'your_database_name',
  password: process.env.DB_PASSWORD || 'your_password',
  port: process.env.DB_PORT || 5432,
});

pool.on('connect', () => console.log('✅ Connected to PostgreSQL'));
pool.on('error', (err) => console.error('❌ Database error', err));

// ==================== MIDDLEWARE ====================
app.use(cors({
  origin:['http://localhost:3000', 'http://localhost:5173','http://localhost:5173'], // React app// React app
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  store: new pgSession({
    pool,                 // your pg pool
    createTableIfMissing: true  // <-- automatically create the 'session' table if missing
  }),
  secret: process.env.SESSION_SECRET || 'supersecret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 } // 1 hour
}));


// ==================== MIDDLEWARE TO VERIFY ADMIN ====================
const requireAdmin = (req, res, next) => {
  // Assume admin session is already set
  if(req.session && req.session.userRole === 'admin') return next();
  return res.status(403).json({ message: 'Admin access required' });
};

// ==================== ADMIN ROUTES ====================

// Fetch all employees
// Fetch all employees
app.get('/api/admin/employees', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.name, u.email, u.role, u.manager_id,
             m.name AS manager_name, u.created_at
      FROM users u
      LEFT JOIN users m ON u.manager_id = m.id
      WHERE u.role='employee'
      ORDER BY u.created_at DESC
    `);
    res.json(result.rows);
  } catch(err) {
    console.error('Employee fetch error:', err.message);
    res.status(500).json({ message: 'Failed to fetch employees', error: err.message });
  }
});

// Add new expense
app.post('/api/expenses', async (req, res) => {
  const { amount, currency, category, description, date } = req.body;
  if (!amount || !currency || !category || !description || !date)
    return res.status(400).json({ message: "All fields are required" });

  try {
    const result = await pool.query(`
      INSERT INTO expenses (amount, currency, category, description, date, employee_id, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, 'Pending', NOW(), NOW())
      RETURNING *
    `, [amount, currency, category, description, date, req.session.userId]);

    res.status(201).json({ message: "Expense submitted", expense: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to submit expense", error: err.message });
  }
});

// Fetch all managers
app.get('/api/admin/managers', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, email, role, created_at
      FROM users
      WHERE role='manager'
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch(err) {
    console.error('Manager fetch error:', err.message);
    res.status(500).json({ message: 'Failed to fetch managers', error: err.message });
  } 
});


/// Create new user (employee or manager)
app.post('/api/admin/create-user', async (req, res) => {
  const { name, email, password, role, managerId } = req.body;

  if(!name || !email || !password || !role)
    return res.status(400).json({ message: 'Name, email, password, role required' });

  if(!['employee', 'manager'].includes(role))
    return res.status(400).json({ message: 'Role must be employee or manager' });

  try {
    const emailCheck = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if(emailCheck.rows.length > 0)
      return res.status(400).json({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const finalManagerId = role === 'manager' ? null : (managerId || null);

    const result = await pool.query(`
      INSERT INTO users (name, email, password, role, manager_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING id, name, email, role, manager_id, created_at
    `, [name, email, hashedPassword, role, finalManagerId]);

    res.status(201).json({ message: 'User created', user: result.rows[0] });
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create user', error: err.message });
  }
});

// Update user role / manager assignment
app.put('/api/admin/update-role/:id', async (req, res) => {
  const { id } = req.params;
  const { role, managerId } = req.body;

  if(!role) return res.status(400).json({ message: 'Role required' });
  if(!['employee','manager','admin'].includes(role))
    return res.status(400).json({ message: 'Invalid role' });

  try {
    const userCheck = await pool.query('SELECT * FROM users WHERE id=$1', [id]);
    if(userCheck.rows.length === 0) return res.status(404).json({ message: 'User not found' });

    const finalManagerId = role === 'manager' ? null : (managerId || null);

    if(finalManagerId) {
      const managerCheck = await pool.query('SELECT role FROM users WHERE id=$1', [finalManagerId]);
      if(managerCheck.rows.length === 0 || managerCheck.rows[0].role !== 'manager')
        return res.status(400).json({ message: 'Invalid manager ID' });
    }

    const result = await pool.query(`
      UPDATE users SET role=$1, manager_id=$2, updated_at=NOW()
      WHERE id=$3
      RETURNING id, name, email, role, manager_id
    `, [role, finalManagerId, id]);

    res.json({ message: 'User updated', user: result.rows[0] });
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update user', error: err.message });
  }
});

// Delete user
app.delete('/api/admin/delete-user/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const userCheck = await pool.query('SELECT id, role FROM users WHERE id=$1', [id]);
    if(userCheck.rows.length === 0) return res.status(404).json({ message: 'User not found' });

    if(userCheck.rows[0].role === 'admin')
      return res.status(403).json({ message: 'Cannot delete admin' });

    await pool.query('UPDATE users SET manager_id=NULL WHERE manager_id=$1', [id]);
    const deleteResult = await pool.query('DELETE FROM users WHERE id=$1 RETURNING id, name, email, role', [id]);

    res.json({ message: 'User deleted', user: deleteResult.rows[0] });
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete user', error: err.message });
  }
});
// ==================== EMPLOYEE/MANAGER AUTH ====================

// Employee / Manager login
app.post('/api/er-login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ message: 'User not found' });

    const user = result.rows[0];
    if (!['employee','manager'].includes(user.role)) return res.status(403).json({ message: 'Access denied' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid password' });

    req.session.userId = user.id;
    req.session.userRole = user.role;

    res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Employee / Manager registration
app.post('/api/er-register', async (req, res) => {
  const { name, email, password, role, manager_id } = req.body;
  if (!name || !email || !password || !role)
    return res.status(400).json({ message: 'All fields required' });
  if (!['employee','manager'].includes(role))
    return res.status(400).json({ message: 'Invalid role' });

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (existing.rows.length > 0)
      return res.status(400).json({ message: 'Email already exists' });

    const hashed = await bcrypt.hash(password, 10);

    let result;
    if (role === 'manager') {
      result = await pool.query(`
        INSERT INTO users (name,email,password,role,created_at,updated_at)
        VALUES ($1,$2,$3,$4,NOW(),NOW())
        RETURNING id,name,email,role,manager_id
      `, [name,email,hashed,role]);
    } else {
      result = await pool.query(`
        INSERT INTO users (name,email,password,role,manager_id,created_at,updated_at)
        VALUES ($1,$2,$3,$4,$5,NOW(),NOW())
        RETURNING id,name,email,role,manager_id
      `, [name,email,hashed,role,manager_id || null]);
    }

    res.status(201).json({ message: 'User registered', user: result.rows[0] });
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});

// Get own expenses (Employee)
app.get('/api/expenses/user/me', async (req,res) => {
  if(req.session.userRole !== 'employee') return res.status(403).json({ message: 'Access denied' });
  try {
    const result = await pool.query(`
      SELECT * FROM expenses WHERE employee_id=$1 ORDER BY date DESC
    `, [req.session.userId]);
    res.json(result.rows);
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch expenses' });
  }
});

// Get pending approvals (Manager)
app.get('/api/expenses/pending', async (req,res) => {
  if(req.session.userRole !== 'manager') return res.status(403).json({ message: 'Access denied' });
  try {
    const result = await pool.query(`
      SELECT e.*, u.name AS employee_name 
      FROM expenses e
      JOIN users u ON e.employee_id=u.id
      WHERE e.status='Pending' AND u.manager_id=$1
      ORDER BY e.date DESC
    `,[req.session.userId]);
    res.json(result.rows);
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch pending expenses' });
  }
});

// Get processed expenses (Manager)
app.get('/api/expenses/processed', async (req,res) => {
  if(req.session.userRole !== 'manager') return res.status(403).json({ message: 'Access denied' });
  try {
    const result = await pool.query(`
      SELECT e.*, u.name AS employee_name 
      FROM expenses e
      JOIN users u ON e.employee_id=u.id
      WHERE e.status IN ('Approved','Rejected') AND u.manager_id=$1
      ORDER BY e.date DESC
    `,[req.session.userId]);
    res.json(result.rows);
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch processed expenses' });
  }
});

// Approve expense (Manager)
app.post('/api/expenses/:id/approve', async (req,res) => {
  if(req.session.userRole !== 'manager') return res.status(403).json({ message: 'Access denied' });
  const { id } = req.params;
  const { comment } = req.body;

  try {
    const expRes = await pool.query('SELECT * FROM expenses WHERE id=$1', [id]);
    if(expRes.rows.length===0) return res.status(404).json({ message: 'Expense not found' });

    const exp = expRes.rows[0];
    const empRes = await pool.query('SELECT * FROM users WHERE id=$1', [exp.employee_id]);
    if(empRes.rows[0].manager_id !== req.session.userId)
      return res.status(403).json({ message: 'Not authorized to approve this expense' });

    await pool.query('UPDATE expenses SET status=$1, comments=$2, updated_at=NOW() WHERE id=$3',
      ['Approved', comment || null, id]);
    res.json({ message: 'Expense approved' });
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to approve expense' });
  }
});

// Reject expense (Manager)
app.post('/api/expenses/:id/reject', async (req,res) => {
  if(req.session.userRole !== 'manager') return res.status(403).json({ message: 'Access denied' });
  const { id } = req.params;
  const { comment } = req.body;

  try {
    const expRes = await pool.query('SELECT * FROM expenses WHERE id=$1', [id]);
    if(expRes.rows.length===0) return res.status(404).json({ message: 'Expense not found' });

    const exp = expRes.rows[0];
    const empRes = await pool.query('SELECT * FROM users WHERE id=$1', [exp.employee_id]);
    if(empRes.rows[0].manager_id !== req.session.userId)
      return res.status(403).json({ message: 'Not authorized to reject this expense' });

    await pool.query('UPDATE expenses SET status=$1, comments=$2, updated_at=NOW() WHERE id=$3',
      ['Rejected', comment || null, id]);
    res.json({ message: 'Expense rejected' });
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to reject expense' });
  }
});
// ==================== START SERVER ====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
