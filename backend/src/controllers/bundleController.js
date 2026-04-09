const { db } = require('../db');

// Create a new bundle
db.createBundle = async ({ name, description, price, discount, productIds }) => {
  const bundleResult = await db.execute({
    sql: 'INSERT INTO bundles (name, description, price, discount) VALUES (?, ?, ?, ?)',
    args: [name, description || '', price || null, discount || null],
  });
  const bundleId = Number(bundleResult.lastInsertRowid);
  for (const pid of productIds) {
    await db.execute({
      sql: 'INSERT INTO bundle_products (bundle_id, product_id) VALUES (?, ?)',
      args: [bundleId, pid],
    });
  }
  return bundleId;
};

// Get all bundles (with product details)
db.getAllBundles = async () => {
  const bundles = (await db.execute('SELECT * FROM bundles WHERE is_active = 1')).rows;
  for (const bundle of bundles) {
    const products = (await db.execute({
      sql: `SELECT p.* FROM products p JOIN bundle_products bp ON p.id = bp.product_id WHERE bp.bundle_id = ?`,
      args: [bundle.id],
    })).rows;
    bundle.products = products;
  }
  return bundles;
};

// Get bundle by id (with product details)
db.getBundleById = async (id) => {
  const bundleRows = (await db.execute({
    sql: 'SELECT * FROM bundles WHERE id = ?',
    args: [id],
  })).rows;
  if (!bundleRows.length) return null;
  const bundle = bundleRows[0];
  const products = (await db.execute({
    sql: `SELECT p.* FROM products p JOIN bundle_products bp ON p.id = bp.product_id WHERE bp.bundle_id = ?`,
    args: [id],
  })).rows;
  bundle.products = products;
  return bundle;
};

// Delete a bundle
db.deleteBundle = async (id) => {
  await db.execute({ sql: 'DELETE FROM bundle_products WHERE bundle_id = ?', args: [id] });
  await db.execute({ sql: 'DELETE FROM bundles WHERE id = ?', args: [id] });
};

module.exports = {};
