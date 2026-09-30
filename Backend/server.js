const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Database connection
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
});
// Test connection
db.getConnection().then(() => {
    console.log('MySQL Connected successfully');
}).catch(err => {
    console.error('MySQL connection error:', err.message);
});

// ==================== ROUTES ====================

// GET all employees with optional search
app.get('/api/employees', async (req, res) => {
    try {
        const { search, department, status } = req.query;
        let query = 'SELECT * FROM employees WHERE 1=1';
        let params = [];

        if (search) {
            query += ' AND (name LIKE ? OR email LIKE ? OR position LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        if (department) {
            query += ' AND department = ?';
            params.push(department);
        }
        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }
        query += ' ORDER BY created_at DESC';

        const [rows] = await db.execute(query, params);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET single employee
app.get('/api/employees/:id', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM employees WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'Employee not found' });
        res.json({ success: true, data: rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET dashboard stats
app.get('/api/stats', async (req, res) => {
    try {
        const [[totalResult]] = await db.execute('SELECT COUNT(*) as total FROM employees');
        const [[activeResult]] = await db.execute("SELECT COUNT(*) as active FROM employees WHERE status = 'Active'");
        const [[salaryResult]] = await db.execute('SELECT SUM(salary) as total_salary FROM employees');
        const [deptResult] = await db.execute('SELECT department, COUNT(*) as count FROM employees GROUP BY department');

        res.json({
            success: true,
            data: {
                total: totalResult.total,
                active: activeResult.active,
                inactive: totalResult.total - activeResult.active,
                total_salary: salaryResult.total_salary || 0,
                by_department: deptResult
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// CREATE employee
app.post('/api/employees', async (req, res) => {
    try {
        const { name, email, phone, department, position, salary, status, join_date } = req.body;

        if (!name || !email) {
            return res.status(400).json({ success: false, message: 'Name and Email are required' });
        }

        const [result] = await db.execute(
            'INSERT INTO employees (name, email, phone, department, position, salary, status, join_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [name, email, phone, department, position, salary, status || 'Active', join_date]
        );

        res.status(201).json({ success: true, message: 'Employee added successfully', id: result.insertId });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }
        res.status(500).json({ success: false, message: err.message });
    }
});

// UPDATE employee
app.put('/api/employees/:id', async (req, res) => {
    try {
        const { name, email, phone, department, position, salary, status, join_date } = req.body;

        await db.execute(
            'UPDATE employees SET name=?, email=?, phone=?, department=?, position=?, salary=?, status=?, join_date=? WHERE id=?',
            [name, email, phone, department, position, salary, status, join_date, req.params.id]
        );

        res.json({ success: true, message: 'Employee updated successfully' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE employee
app.delete('/api/employees/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM employees WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Employee deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});