const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./edustream.sqlite', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        return;
    }
    console.log('Connected to the edustream.sqlite database for seeding.');
});

db.serialize(() => {
    db.run(`DROP TABLE IF EXISTS books`);
    db.run(`
        CREATE TABLE books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            price REAL NOT NULL,
            stock INTEGER NOT NULL,
            category TEXT NOT NULL
        )
    `);

    const bookStmt = db.prepare(`INSERT INTO books (title, author, price, stock, category) VALUES (?, ?, ?, ?, ?)`);
    bookStmt.run("Web Development 101", "John Doe", 85.50, 15, "Computer Science");
    bookStmt.run("Advanced React Patterns", "Jane Smith", 120.00, 8, "Programming");
    bookStmt.run("Database Design Fundamentals", "Alan Turing", 95.00, 20, "Database");
    bookStmt.run("Introduction to Cybersecurity", "Alice Bob", 105.00, 5, "Security");
    bookStmt.finalize();
    console.log('✅ Books table created and seeded successfully.');

    db.run(`DROP TABLE IF EXISTS users`);
    db.run(`
        CREATE TABLE users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL
        )
    `);

    const userStmt = db.prepare(`INSERT INTO users (id, name, password, role) VALUES (?, ?, ?, ?)`);
    userStmt.run("bcs24020033", "Justin", "password123", "student"); 
    userStmt.run("lec01", "Dr. Sarah", "admin123", "lecturer");      
    userStmt.finalize();
    console.log('✅ Users table created and seeded successfully.');
});

db.close((err) => {
    if (err) {
        console.error('Error closing database:', err.message);
    } else {
        console.log('Database connection closed. Seeding complete!');
    }
});