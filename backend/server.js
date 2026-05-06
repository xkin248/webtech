const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

const app = express();
app.use(express.json()); 
app.use(cors()); 

// ==========================================
// 1. 静态文件托管 (托管前端 HTML/CSS/JS)
// ==========================================
app.use('/static', express.static(path.join(__dirname, '../static')));
app.use(express.static(path.join(__dirname, '../templates')));

let db; 

async function startServer() {
    try {
        // 确保数据库文件路径在不同环境下都能正确定位
        db = await open({
            filename: path.join(__dirname, './edustream.sqlite'), 
            driver: sqlite3.Database
        });
        console.log('✅ SQLite database connected!');

        // --- 数据库表初始化 ---
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
            CREATE TABLE IF NOT EXISTS posts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                body TEXT NOT NULL,
                authorName TEXT NOT NULL,
                authorRole TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // --- 自动填充初始数据 (如果表是空的) ---
        const userCount = await db.get('SELECT COUNT(*) as count FROM users');
        if (userCount.count === 0) {
            const insertUser = await db.prepare('INSERT INTO users (id, name, password, role) VALUES (?, ?, ?, ?)');
            await insertUser.run('bcs24020033', 'Justin', 'pass123', 'student');
            await insertUser.run('lec01', 'Dr. Sarah', 'pass123', 'lecturer');
            await insertUser.run('admin01', 'Admin', 'pass123', 'admin');
            await insertUser.finalize();
        }

        const bookCount = await db.get('SELECT COUNT(*) as count FROM books');
        if (bookCount.count === 0) {
            const insertBook = await db.prepare('INSERT INTO books (title, author, price, category) VALUES (?, ?, ?, ?)');
            await insertBook.run('Web Development 101', 'John Doe', 85.50, 'Computer Science');
            await insertBook.run('Advanced React Patterns', 'Jane Smith', 120.00, 'Programming');
            await insertBook.run('Database Design Fundamentals', 'Alan Turing', 95.00, 'Database');
            await insertBook.finalize();
        }

        const postCount = await db.get('SELECT COUNT(*) as count FROM posts');
        if (postCount.count === 0) {
            const insertPost = await db.prepare('INSERT INTO posts (title, body, authorName, authorRole) VALUES (?, ?, ?, ?)');
            await insertPost.run('Welcome to the EduStream Community!', 'Feel free to ask questions here.', 'Admin', 'admin');
            await insertPost.run('Need help with Web Tech', 'How to deploy Node.js?', 'Justin', 'student');
            await insertPost.finalize();
        }

        // ==========================================
        // 2. API 路由接口
        // ==========================================
        
        app.get('/api/books', async (req, res) => {
            try { res.json(await db.all('SELECT * FROM books')); } 
            catch (error) { res.status(500).json({ error: error.message }); }
        });

        app.post('/api/login', async (req, res) => {
            const { id, password, role } = req.body;
            const user = await db.get('SELECT id, name, role, xp FROM users WHERE id = ? AND password = ? AND role = ?', [id, password, role]);
            if (user) res.json({ success: true, user: user });
            else res.status(401).json({ success: false, message: 'Invalid ID, Password, or Role' });
        });

        app.post('/api/register', async (req, res) => {
            const { id, name, password, role } = req.body;
            const existingUser = await db.get('SELECT id FROM users WHERE id = ?', [id]);
            if (existingUser) return res.status(409).json({ success: false, message: 'ID taken.' });
            await db.run('INSERT INTO users (id, name, password, role) VALUES (?, ?, ?, ?)', [id, name, password, role]);
            res.json({ success: true });
        });

        app.get('/api/posts', async (req, res) => {
            const posts = await db.all('SELECT * FROM posts ORDER BY id DESC');
            res.json({ success: true, data: posts });
        });

        app.post('/api/posts', async (req, res) => {
            const { title, body, authorName, authorRole } = req.body;
            await db.run('INSERT INTO posts (title, body, authorName, authorRole) VALUES (?, ?, ?, ?)', [title, body, authorName, authorRole]);
            res.json({ success: true });
        });

        app.delete('/api/posts/:id', async (req, res) => {
            await db.run('DELETE FROM posts WHERE id = ?', [req.params.id]);
            res.json({ success: true });
        });

        app.post('/api/checkout', async (req, res) => {
            const { cart } = req.body;
            for (let item of cart) {
                await db.run('UPDATE books SET stock = stock - 1 WHERE id = ? AND stock > 0', [item.id]);
            }
            res.json({ success: true });
        });

        // ==========================================
        // 3. 页面路由 (多页面应用的完美解法)
        // ==========================================
        
        // 预设 templates 文件夹的绝对路径
        const templatesPath = path.join(__dirname, '../templates ');

        // 为每一个页面设置专属的访问通道
        app.get('/', (req, res) => res.sendFile(path.join(templatesPath, 'index.html')));
        app.get('/index.html', (req, res) => res.sendFile(path.join(templatesPath, 'index.html')));
        app.get('/courses.html', (req, res) => res.sendFile(path.join(templatesPath, 'courses.html')));
        app.get('/bookstore.html', (req, res) => res.sendFile(path.join(templatesPath, 'bookstore.html')));
        app.get('/forum.html', (req, res) => res.sendFile(path.join(templatesPath, 'forum.html')));
        app.get('/portal.html', (req, res) => res.sendFile(path.join(templatesPath, 'portal.html')));
        
        // Dashboard 页面通道
        app.get('/student-dashboard.html', (req, res) => res.sendFile(path.join(templatesPath, 'student-dashboard.html')));
        app.get('/lecturer-dashboard.html', (req, res) => res.sendFile(path.join(templatesPath, 'lecturer-dashboard.html')));
        app.get('/admin-dashboard.html', (req, res) => res.sendFile(path.join(templatesPath, 'admin-dashboard.html')));

        // 真正的 404 兜底：如果用户乱输网址，提示找不到页面，而不是盲目返回主页
        app.use((req, res) => {
            res.status(404).send('<h1 style="text-align:center; margin-top:50px;">404 - Page Not Found</h1><div style="text-align:center;"><a href="/">Go back home</a></div>');
        });

        const PORT = process.env.PORT || 3000; 
        app.listen(PORT, () => {
            console.log(`🚀 EduStream Server is Live!`);
            console.log(`🔗 Local link: http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
    }
}

startServer();