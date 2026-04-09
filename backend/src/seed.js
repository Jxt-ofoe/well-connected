require('dotenv').config();
const bcrypt = require('bcrypt');
const { db, initDB } = require('./db');

async function seed() {
  await initDB();

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  try {
    await db.execute({
      sql: 'INSERT OR IGNORE INTO users (email, password, role) VALUES (?, ?, ?)',
      args: ['admin@wellconnected.com', hashedPassword, 'admin'],
    });
    console.log('✅ Admin user created (admin@wellconnected.com / admin123)');
  } catch (error) {
    console.log('Admin user already exists or error:', error.message);
  }

  // Clear existing products for re-seed
  await db.execute('DELETE FROM products');

  // Seed provision products with multiple variants per category
  const products = [
    // === Rice ===
    { name: 'Jasmine Rice (5kg)', price: 85, description: 'Premium long-grain jasmine rice with a natural fragrance. Perfect for fried rice and jollof.', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', stock: 40, category: 'Rice' },
    { name: 'Basmati Rice (5kg)', price: 95, description: 'Extra-long grain basmati rice. Light, fluffy, and aromatic — ideal for special dishes.', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', stock: 35, category: 'Rice' },
    { name: 'Local Rice (5kg)', price: 60, description: 'Locally sourced Ghanaian rice. Affordable and perfect for everyday cooking.', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', stock: 60, category: 'Rice' },
    { name: 'Brown Rice (2kg)', price: 45, description: 'Whole grain brown rice rich in fiber and nutrients. A healthier alternative.', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', stock: 25, category: 'Rice' },
    { name: 'Royal Stallion Rice (10kg)', price: 150, description: 'Premium parboiled rice. Known for its consistent quality and great taste.', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', stock: 20, category: 'Rice' },

    // === Cooking Oil ===
    { name: 'Frytol Vegetable Oil (3L)', price: 75, description: 'Premium refined vegetable oil. Cholesterol-free and ideal for frying.', image: 'https://images.unsplash.com/photo-1474979266404-7eadf1f34de6?w=500', stock: 40, category: 'Cooking Oil' },
    { name: 'Frytol Vegetable Oil (5L)', price: 120, description: 'Large bottle of Frytol vegetable oil for families and bulk cooking.', image: 'https://images.unsplash.com/photo-1474979266404-7eadf1f34de6?w=500', stock: 30, category: 'Cooking Oil' },
    { name: 'Palm Oil (1L)', price: 25, description: 'Pure red palm oil for traditional soups and stews.', image: 'https://images.unsplash.com/photo-1474979266404-7eadf1f34de6?w=500', stock: 50, category: 'Cooking Oil' },
    { name: 'Coconut Oil (500ml)', price: 35, description: 'Cold-pressed coconut oil for cooking, baking, and skin care.', image: 'https://images.unsplash.com/photo-1474979266404-7eadf1f34de6?w=500', stock: 30, category: 'Cooking Oil' },
    { name: 'Groundnut Oil (2L)', price: 55, description: 'Pure groundnut oil with rich flavor. Great for deep frying.', image: 'https://images.unsplash.com/photo-1474979266404-7eadf1f34de6?w=500', stock: 25, category: 'Cooking Oil' },

    // === Noodles & Pasta ===
    { name: 'Indomie Instant Noodles (Box of 40)', price: 95, description: 'Box of 40 packs of Indomie Super Pack. Quick and delicious meals.', image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=500', stock: 30, category: 'Noodles & Pasta' },
    { name: 'Indomie Chicken Flavour (Single)', price: 3, description: 'Single pack of Indomie chicken flavour noodles.', image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=500', stock: 200, category: 'Noodles & Pasta' },
    { name: 'Spaghetti (500g)', price: 12, description: 'Quality spaghetti made from durum wheat. Perfect for jollof spaghetti.', image: 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=500', stock: 80, category: 'Noodles & Pasta' },
    { name: 'Macaroni (500g)', price: 10, description: 'Elbow macaroni for mac & cheese, soups, and salads.', image: 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=500', stock: 60, category: 'Noodles & Pasta' },

    // === Sugar & Sweeteners ===
    { name: 'Granulated Sugar (1kg)', price: 15, description: 'Fine white granulated sugar for beverages and baking.', image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=500', stock: 100, category: 'Sugar & Sweeteners' },
    { name: 'Sugar Cubes (500g)', price: 12, description: 'Convenient sugar cubes for tea and coffee.', image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=500', stock: 60, category: 'Sugar & Sweeteners' },
    { name: 'Honey (500ml)', price: 45, description: 'Pure natural honey. A healthy alternative to sugar.', image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=500', stock: 30, category: 'Sugar & Sweeteners' },

    // === Dairy & Beverages ===
    { name: 'Peak Powdered Milk (900g)', price: 75, description: 'Full cream powdered milk rich in vitamins and calcium.', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500', stock: 35, category: 'Dairy & Beverages' },
    { name: 'Milo (1kg)', price: 55, description: 'Chocolate malt drink packed with energy for the whole family.', image: 'https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=500', stock: 45, category: 'Dairy & Beverages' },
    { name: 'Lipton Yellow Label Tea (100 bags)', price: 28, description: 'Classic black tea for a refreshing cup any time of day.', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500', stock: 70, category: 'Dairy & Beverages' },
    { name: 'Nescafé Classic (200g)', price: 40, description: 'Instant coffee with rich aroma and smooth taste.', image: 'https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=500', stock: 50, category: 'Dairy & Beverages' },
    { name: 'Ideal Evaporated Milk (160ml x 12)', price: 60, description: 'Carton of evaporated milk for tea, coffee, and cooking.', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500', stock: 40, category: 'Dairy & Beverages' },

    // === Household & Cleaning ===
    { name: 'Parazone Bleach (1L)', price: 15, description: 'Powerful bleach for household cleaning and disinfection.', image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=500', stock: 60, category: 'Household & Cleaning' },
    { name: 'Key Soap (Pack of 6)', price: 18, description: 'Multipurpose bar soap for laundry and dish washing.', image: 'https://images.unsplash.com/photo-1585441695325-21557c28bdf3?w=500', stock: 70, category: 'Household & Cleaning' },
    { name: 'Omo Detergent (1kg)', price: 22, description: 'Powerful washing powder for bright, clean clothes.', image: 'https://images.unsplash.com/photo-1585441695325-21557c28bdf3?w=500', stock: 55, category: 'Household & Cleaning' },
    { name: 'Morning Fresh Dishwashing Liquid (450ml)', price: 14, description: 'Effective dish soap that cuts through grease easily.', image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=500', stock: 80, category: 'Household & Cleaning' },

    // === Seasoning & Spices ===
    { name: 'Maggi Star (Box of 100)', price: 20, description: 'Seasoning cubes to enhance the flavor of soups, stews, and rice.', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500', stock: 80, category: 'Seasoning & Spices' },
    { name: 'Royco Seasoning (100 cubes)', price: 22, description: 'All-purpose seasoning cubes with rich savory flavor.', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500', stock: 60, category: 'Seasoning & Spices' },
    { name: 'Tomato Paste (400g Tin)', price: 8, description: 'Concentrated tomato paste for jollof, stews, and sauces.', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500', stock: 100, category: 'Seasoning & Spices' },
    { name: 'Ground Pepper (200g)', price: 12, description: 'Freshly ground dried pepper for spicy dishes.', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500', stock: 50, category: 'Seasoning & Spices' },
    { name: 'Curry Powder (100g)', price: 8, description: 'Aromatic curry powder for fried rice, soups, and marinades.', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500', stock: 70, category: 'Seasoning & Spices' },

    // === Canned & Packaged Foods ===
    { name: 'Sardines in Oil (155g)', price: 10, description: 'Canned sardines in vegetable oil. Quick protein for any meal.', image: 'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=500', stock: 80, category: 'Canned & Packaged Foods' },
    { name: 'Corned Beef (340g)', price: 28, description: 'Premium corned beef in a tin. Great for sandwiches and stews.', image: 'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=500', stock: 40, category: 'Canned & Packaged Foods' },
    { name: 'Baked Beans (400g)', price: 12, description: 'Baked beans in tomato sauce. Perfect with bread or rice.', image: 'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=500', stock: 50, category: 'Canned & Packaged Foods' },
    { name: 'Tuna Chunks (170g)', price: 18, description: 'Canned tuna chunks in brine. Rich in omega-3 and protein.', image: 'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=500', stock: 35, category: 'Canned & Packaged Foods' },

    // === Flour & Baking ===
    { name: 'Golden Penny Flour (2kg)', price: 25, description: 'All-purpose wheat flour for baking, frying, and pastries.', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500', stock: 50, category: 'Flour & Baking' },
    { name: 'Semovita (5kg)', price: 65, description: 'Premium semolina for smooth, lump-free fufu and swallow.', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500', stock: 30, category: 'Flour & Baking' },
    { name: 'Cornflour (400g)', price: 10, description: 'Fine cornstarch for thickening soups and sauces.', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500', stock: 60, category: 'Flour & Baking' },
    { name: 'Baking Powder (100g)', price: 6, description: 'Essential leavening agent for cakes, pancakes, and pastries.', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500', stock: 70, category: 'Flour & Baking' },

    // === Toiletries ===
    { name: 'Dettol Antiseptic (750ml)', price: 32, description: 'Trusted antiseptic for wound cleaning, bathing, and disinfection.', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500', stock: 50, category: 'Toiletries' },
    { name: 'Close-Up Toothpaste (140ml)', price: 8, description: 'Gel toothpaste with long-lasting freshness and cavity protection.', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500', stock: 80, category: 'Toiletries' },
    { name: 'Lux Bath Soap (Pack of 6)', price: 20, description: 'Luxurious moisturizing bath soap with a pleasant fragrance.', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500', stock: 50, category: 'Toiletries' },
    { name: 'Tissue Paper (12 Rolls)', price: 25, description: 'Soft, absorbent tissue paper for everyday use.', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500', stock: 60, category: 'Toiletries' },
  ];

  for (const product of products) {
    try {
      await db.execute({
        sql: 'INSERT INTO products (name, price, description, image, stock, category) VALUES (?, ?, ?, ?, ?, ?)',
        args: [product.name, product.price, product.description, product.image, product.stock, product.category],
      });
    } catch (error) {
      console.log(`Product "${product.name}" error:`, error.message);
    }
  }

  console.log(`✅ ${products.length} provision products seeded across ${[...new Set(products.map(p => p.category))].length} categories`);
  console.log('🎉 Database seeding complete!');
  process.exit(0);
}

seed().catch(console.error);
