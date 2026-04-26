const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('../database/database');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve frontend files directly
app.use(express.static(path.join(__dirname, '../frontend')));

// --- AUTH API ---
// POST /api/auth/signup
app.post('/api/auth/signup', async (req, res) => {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Generate a random 4-character Gym ID (e.g., 529A)
        const gymId = Math.random().toString(36).substring(2, 6).toUpperCase();
        const hashedPassword = await bcrypt.hash(password, 10);
        
        db.run(
            `INSERT INTO users (name, email, password, gym_id) VALUES (?, ?, ?, ?)`,
            [name, email, hashedPassword, gymId],
            function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(400).json({ error: 'Email already exists' });
                    }
                    return res.status(500).json({ error: 'Database error' });
                }
                
                res.status(201).json({
                    message: 'User created successfully',
                    user: {
                        id: this.lastID,
                        name,
                        email,
                        gym_id: gymId
                    }
                });
            }
        );
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!user) return res.status(400).json({ error: 'Invalid email or password' });
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });
        
        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                gym_id: user.gym_id
            }
        });
    });
});

// --- STATUS API ---
app.get('/api/status', (req, res) => {
    db.get(`SELECT * FROM gym_status WHERE id = 1`, (err, status) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(status || { capacity: 42, available_racks: 8 });
    });
});

// --- LOCKER API ---
app.get('/api/lockers', (req, res) => {
    db.all(`SELECT * FROM lockers`, (err, lockers) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(lockers);
    });
});

app.post('/api/lockers/book', (req, res) => {
    const { lockerId, userId } = req.body;
    
    // Check if available
    db.get(`SELECT status FROM lockers WHERE id = ?`, [lockerId], (err, locker) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!locker) return res.status(404).json({ error: 'Locker not found' });
        if (locker.status === 'occupied') return res.status(400).json({ error: 'Locker already occupied' });
        
        // Update to occupied
        db.run(`UPDATE lockers SET status = 'occupied', user_id = ? WHERE id = ?`, [userId, lockerId], function(err) {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json({ message: 'Locker booked successfully', lockerId });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
