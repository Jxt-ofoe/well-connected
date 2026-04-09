const { db } = require('../db');

const getAllProducts = async (req, res) => {
  try {
    const result = await db.execute('SELECT * FROM products ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.execute({
      sql: 'SELECT * FROM products WHERE id = ?',
      args: [id],
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, price, description, image, stock, category, pack_size, unit_price, sell_individually } = req.body;

    // Validation
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Product name is required' });
    }
    if (price < 0) {
      return res.status(400).json({ error: 'Price must be non-negative' });
    }
    if (stock < 0) {
      return res.status(400).json({ error: 'Stock must be non-negative' });
    }
    if (sell_individually && pack_size > 1 && !unit_price) {
      return res.status(400).json({ error: 'Unit price is required when selling individually' });
    }

    const result = await db.execute({
      sql: 'INSERT INTO products (name, price, description, image, stock, category, pack_size, unit_price, sell_individually) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      args: [name, price, description || '', image || '', stock || 0, category || '', pack_size || 1, unit_price || null, sell_individually ? 1 : 0],
    });

    res.status(201).json({
      message: 'Product created successfully',
      id: Number(result.lastInsertRowid),
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, image, stock, category, pack_size, unit_price, sell_individually } = req.body;

    // Validation
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Product name is required' });
    }
    if (price < 0) {
      return res.status(400).json({ error: 'Price must be non-negative' });
    }
    if (stock < 0) {
      return res.status(400).json({ error: 'Stock must be non-negative' });
    }
    if (sell_individually && pack_size > 1 && !unit_price) {
      return res.status(400).json({ error: 'Unit price is required when selling individually' });
    }

    // Check if product exists
    const existing = await db.execute({
      sql: 'SELECT * FROM products WHERE id = ?',
      args: [id],
    });

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    await db.execute({
      sql: 'UPDATE products SET name = ?, price = ?, description = ?, image = ?, stock = ?, category = ?, pack_size = ?, unit_price = ?, sell_individually = ? WHERE id = ?',
      args: [name, price, description || '', image || '', stock || 0, category || '', pack_size || 1, unit_price || null, sell_individually ? 1 : 0, id],
    });

    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await db.execute({
      sql: 'SELECT * FROM products WHERE id = ?',
      args: [id],
    });

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    await db.execute({
      sql: 'DELETE FROM products WHERE id = ?',
      args: [id],
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };
