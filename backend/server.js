const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const app = express();
app.use(express.json()); // Allow server to parse JSON data
app.use(cors());         // Enable CORS for cross-origin requests

let db; // Store database connection

// Initialize database and start the server
async function startServer() {
    try {
        // 1. Connect and create the SQLite database file
        db = await open({
            filename: './edustream.sqlite', 
            driver: sqlite3.Database
        });
        console.log('✅ SQLite database connected! File created/opened: edustream.sqlite');

        // ==========================================
        // 2. Create database tables
        // ==========================================
        await db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL,
                xp INTEGER DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS books (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                author TEXT,
                price REAL NOT NULL,
                stock INTEGER DEFAULT 10,
                category TEXT
            );
        `);
        console.log('✅ Tables "users" and "books" checked/created successfully!');

        // ==========================================
        // 3. Insert initial test data (if tables are empty)
        // ==========================================
        
        // Check if the users table is empty
        const userCount = await db.get('SELECT COUNT(*) as count FROM users');
        if (userCount.count === 0) {
            console.log('🔄 Inserting initial user data...');
            const insertUser = await db.prepare('INSERT INTO users (id, name, password, role) VALUES (?, ?, ?, ?)');
            await insertUser.run('bcs24020033', 'Justin', 'pass123', 'student');
            await insertUser.run('lec01', 'Dr. Sarah', 'pass123', 'lecturer');
            await insertUser.run('admin01', 'Admin', 'pass123', 'admin');
            await insertUser.finalize();
        }

        // Check if the books table is empty
        const bookCount = await db.get('SELECT COUNT(*) as count FROM books');
        if (bookCount.count === 0) {
            console.log('🔄 Inserting initial book data...');
            const insertBook = await db.prepare('INSERT INTO books (title, author, price, category) VALUES (?, ?, ?, ?)');
            // Note: Prices represent Ringgit Malaysia (RM)
            await insertBook.run('Web Development 101', 'John Doe', 85.50, 'Computer Science');
            await insertBook.run('Advanced React Patterns', 'Jane Smith', 120.00, 'Programming');
            await insertBook.run('Database Design Fundamentals', 'Alan Turing', 95.00, 'Database');
            await insertBook.finalize();
        }

        // ==========================================
        // 4. API Endpoints
        // ==========================================
        
        // Basic health check endpoint
        app.get('/', (req, res) => {
            res.send('EduStream backend is running!');
        });

        // API endpoint to fetch all books
        app.get('/api/books', async (req, res) => {
            try {
                const books = await db.all('SELECT * FROM books');
                res.json(books);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // ==========================================
        // USER LOGIN API (POST)
        // ==========================================
        app.post('/api/login', async (req, res) => {
            try {
                // Extract login details sent from the frontend
                const { id, password, role } = req.body;
                
                // Query the database to find a matching user
                const query = 'SELECT id, name, role, xp FROM users WHERE id = ? AND password = ? AND role = ?';
                const user = await db.get(query, [id, password, role]);
                
                if (user) {
                    // Match found! Send back success and user details (excluding password)
                    res.json({ success: true, user: user });
                } else {
                    // No match found in the database
                    res.status(401).json({ success: false, message: 'Invalid ID, Password, or Role' });
                }
            } catch (error) {
                console.error('Login error:', error);
                res.status(500).json({ success: false, message: 'Internal server error' });
            }
        });

        // ==========================================
        // CHECKOUT API (POST) - Deduct Inventory
        // ==========================================
        app.post('/api/checkout', async (req, res) => {
            try {
                // Receive the cart data from frontend
                const { cart } = req.body; 

                if (!cart || cart.length === 0) {
                    return res.status(400).json({ success: false, message: 'Cart is empty' });
                }

                // Loop through each item in the cart and deduct 1 from its stock in the database
                for (let item of cart) {
                    await db.run('UPDATE books SET stock = stock - 1 WHERE id = ? AND stock > 0', [item.id]);
                }

                res.json({ success: true, message: 'Checkout successful and inventory updated!' });
            } catch (error) {
                console.error('Checkout error:', error);
                res.status(500).json({ success: false, message: 'Internal server error' });
            }
        });
        
        // ==========================================
        // 5. Listen on port 3000
        // ==========================================
        app.listen(3000, () => {
            console.log('🚀 Server running on port 3000');
            console.log('👉 Test the books API: http://localhost:3000/api/books');
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
    }
}

startServer();