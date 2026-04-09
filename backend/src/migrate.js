require('dotenv').config();
const { db } = require('./db');

async function migrate() {
  try {
    console.log('🔄 Running migration...');
    
    await db.execute(`
      ALTER TABLE products ADD COLUMN pack_size INTEGER DEFAULT 1
    `).catch(() => console.log('pack_size column already exists'));
    
    await db.execute(`
      ALTER TABLE products ADD COLUMN unit_price REAL
    `).catch(() => console.log('unit_price column already exists'));
    
    await db.execute(`
      ALTER TABLE products ADD COLUMN sell_individually INTEGER DEFAULT 0
    `).catch(() => console.log('sell_individually column already exists'));
    
    await db.execute(`
      ALTER TABLE orders ADD COLUMN orderReference TEXT
    `).catch(() => console.log('orderReference column already exists'));
    
    await db.execute(`
      ALTER TABLE orders ADD COLUMN email TEXT
    `).catch(() => console.log('email column already exists'));
    
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
