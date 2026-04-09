const { createClient } = require('@libsql/client');
require('dotenv').config();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function initDB() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'admin'
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        description TEXT,
        image TEXT,
        stock INTEGER DEFAULT 0,
        category TEXT,
        pack_size INTEGER DEFAULT 1,
        unit_price REAL,
        sell_individually INTEGER DEFAULT 0
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        orderReference TEXT UNIQUE NOT NULL,
        customerName TEXT NOT NULL,
        email TEXT,
        phone TEXT NOT NULL,
        address TEXT NOT NULL,
        totalPrice REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        paymentReference TEXT,
        createdAt TEXT DEFAULT (datetime('now'))
      )
    `);


    await db.execute(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);

    // Bundles: group of products with set or discounted price
    await db.execute(`
      CREATE TABLE IF NOT EXISTS bundles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL,
        discount REAL, -- percent discount (0-100), null if not used
        is_active INTEGER DEFAULT 1
      )
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS bundle_products (
        bundle_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        PRIMARY KEY (bundle_id, product_id),
        FOREIGN KEY (bundle_id) REFERENCES bundles(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);

    console.log('✅ Database tables initialized');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

module.exports = { db, initDB };
