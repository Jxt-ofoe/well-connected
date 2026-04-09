const express = require('express');
const router = express.Router();
const { db } = require('../db');

// Create bundle
router.post('/', async (req, res) => {
  try {
    const { name, description, price, discount, productIds } = req.body;
    if (!name || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ error: 'Name and productIds required' });
    }
    const bundleId = await db.createBundle({ name, description, price, discount, productIds });
    res.status(201).json({ message: 'Bundle created', id: bundleId });
  } catch (error) {
    console.error('Create bundle error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Get all bundles
router.get('/', async (req, res) => {
  try {
    const bundles = await db.getAllBundles();
    res.json(bundles);
  } catch (error) {
    console.error('Get bundles error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Get bundle by id
router.get('/:id', async (req, res) => {
  try {
    const bundle = await db.getBundleById(req.params.id);
    if (!bundle) return res.status(404).json({ error: 'Bundle not found' });
    res.json(bundle);
  } catch (error) {
    console.error('Get bundle error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Update bundle
router.put('/:id', async (req, res) => {
  try {
    const { name, description, price, discount, productIds } = req.body;
    if (!name || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ error: 'Name and productIds required' });
    }
    await db.execute({
      sql: 'UPDATE bundles SET name = ?, description = ?, price = ?, discount = ? WHERE id = ?',
      args: [name, description || '', price || null, discount || null, req.params.id],
    });
    await db.execute({ sql: 'DELETE FROM bundle_products WHERE bundle_id = ?', args: [req.params.id] });
    for (const pid of productIds) {
      await db.execute({
        sql: 'INSERT INTO bundle_products (bundle_id, product_id) VALUES (?, ?)',
        args: [req.params.id, pid],
      });
    }
    res.json({ message: 'Bundle updated' });
  } catch (error) {
    console.error('Update bundle error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Delete bundle
router.delete('/:id', async (req, res) => {
  try {
    await db.deleteBundle(req.params.id);
    res.json({ message: 'Bundle deleted' });
  } catch (error) {
    console.error('Delete bundle error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
