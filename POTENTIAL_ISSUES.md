# ⚠️ Potential Issues & Future Crashes

## 🔴 CRITICAL ISSUES

### 1. **Race Condition in Order Creation**
**Problem:** Multiple customers can order the same product simultaneously, causing overselling.

**Scenario:**
- Product has 5 units in stock
- Customer A orders 5 units (checks stock: 5 available ✓)
- Customer B orders 3 units (checks stock: 5 available ✓)
- Both orders succeed, but only 5 units exist

**Location:** `backend/src/controllers/orderController.js` - `createOrder()`

**Fix:** Use database transactions
```javascript
// Wrap order creation in a transaction
await db.batch([
  { sql: 'BEGIN TRANSACTION' },
  { sql: 'SELECT stock FROM products WHERE id = ? FOR UPDATE', args: [productId] },
  { sql: 'UPDATE products SET stock = stock - ? WHERE id = ?', args: [qty, productId] },
  { sql: 'INSERT INTO orders ...', args: [...] },
  { sql: 'COMMIT' }
], 'write');
```

---

### 2. **Stock Not Restored on Order Deletion**
**Problem:** When admin deletes an order, stock is NOT returned to inventory.

**Scenario:**
- Customer orders 10 units (stock: 100 → 90)
- Admin deletes order
- Stock remains at 90 (should be 100)

**Location:** `backend/src/controllers/orderController.js` - `deleteOrder()`

**Fix:**
```javascript
// Before deleting, restore stock
const items = await db.execute({
  sql: 'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
  args: [id]
});

for (const item of items.rows) {
  await db.execute({
    sql: 'UPDATE products SET stock = stock + ? WHERE id = ?',
    args: [item.quantity, item.product_id]
  });
}
```

---

### 3. **Order Reference Collision**
**Problem:** `generateOrderReference()` uses random 4-digit number (0000-9999). With high traffic, duplicates are likely.

**Scenario:**
- Two orders at same time get same random number
- Database INSERT fails (orderReference is UNIQUE)
- Customer sees error, payment may be charged

**Location:** `backend/src/controllers/orderController.js` - `generateOrderReference()`

**Fix:** Use UUID or add retry logic
```javascript
function generateOrderReference() {
  const date = new Date();
  const timestamp = date.getTime(); // milliseconds since epoch
  const random = Math.floor(Math.random() * 1000);
  return `WC-${timestamp}-${random}`;
}
```

---

### 4. **No Paystack Webhook Verification**
**Problem:** Payment confirmation endpoint has NO security. Anyone can mark orders as paid.

**Scenario:**
- Hacker calls `/api/orders/123/confirm-payment` with fake reference
- Order marked as paid without actual payment

**Location:** `backend/src/controllers/orderController.js` - `confirmPayment()`

**Fix:** Verify payment with Paystack API
```javascript
const axios = require('axios');

const confirmPayment = async (req, res) => {
  const { reference } = req.body;
  
  // Verify with Paystack
  const response = await axios.get(
    `https://api.paystack.co/transaction/verify/${reference}`,
    { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
  );
  
  if (response.data.data.status !== 'success') {
    return res.status(400).json({ error: 'Payment not successful' });
  }
  
  // Then update order...
};
```

---

### 5. **Cart Stores Full Product Objects**
**Problem:** Cart stores product price in localStorage. If admin changes price, old cart has old price.

**Scenario:**
- Customer adds product (price: GH₵100) to cart
- Admin changes price to GH₵150
- Customer checks out, pays GH₵100 (old price)

**Location:** `frontend/src/context/CartContext.js`

**Fix:** Store only product IDs, fetch fresh data at checkout
```javascript
// Store only: { id, quantity }
// At checkout, fetch current prices from API
```

---

## 🟡 MEDIUM ISSUES

### 6. **No Input Validation**
**Problem:** No validation on product creation/update. Can create products with negative prices, empty names, etc.

**Fix:** Add validation middleware
```javascript
const { body, validationResult } = require('express-validator');

router.post('/products', [
  body('name').trim().notEmpty().withMessage('Name required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be positive'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be non-negative'),
], createProduct);
```

---

### 7. **No Rate Limiting on Payment Endpoint**
**Problem:** No rate limiting. Attackers can spam payment confirmations.

**Fix:** Add rate limiting
```javascript
const rateLimit = require('express-rate-limit');

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10 // 10 requests per IP
});

router.post('/orders/:id/confirm-payment', paymentLimiter, confirmPayment);
```

---

### 8. **Pack Size Logic Not Validated**
**Problem:** Admin can set `sell_individually = true` but forget to set `unit_price`. Frontend will crash.

**Location:** `backend/src/controllers/productController.js`

**Fix:**
```javascript
if (sell_individually && pack_size > 1 && !unit_price) {
  return res.status(400).json({ 
    error: 'unit_price required when sell_individually is enabled' 
  });
}
```

---

### 9. **No Pagination on Orders/Products**
**Problem:** `getAllOrders()` and `getAllProducts()` fetch ALL records. With 10,000+ orders, this will timeout.

**Fix:** Add pagination
```javascript
const page = parseInt(req.query.page) || 1;
const limit = 50;
const offset = (page - 1) * limit;

const result = await db.execute({
  sql: 'SELECT * FROM orders ORDER BY createdAt DESC LIMIT ? OFFSET ?',
  args: [limit, offset]
});
```

---

### 10. **localStorage Cart Can Be Manipulated**
**Problem:** Users can edit localStorage to change prices in cart.

**Fix:** Always validate prices server-side at checkout (already doing this, but ensure it's never skipped)

---

## 🟢 LOW PRIORITY ISSUES

### 11. **No Email Notifications**
**Problem:** Customers don't receive order confirmation emails.

**Fix:** Integrate SendGrid/AWS SES

---

### 12. **No Order Cancellation**
**Problem:** Customers can't cancel orders. Only admin can delete.

**Fix:** Add customer-facing cancel endpoint (only for pending orders)

---

### 13. **No Product Search/Filter**
**Problem:** With 100+ products, customers can't search or filter by category.

**Fix:** Add search endpoint
```javascript
router.get('/products/search', async (req, res) => {
  const { q, category } = req.query;
  const result = await db.execute({
    sql: 'SELECT * FROM products WHERE name LIKE ? AND category LIKE ?',
    args: [`%${q}%`, `%${category}%`]
  });
  res.json(result.rows);
});
```

---

### 14. **No Image Upload**
**Problem:** Admin must paste image URLs. No file upload.

**Fix:** Integrate Cloudinary or AWS S3

---

### 15. **No Audit Logs**
**Problem:** Can't track who changed what in admin dashboard.

**Fix:** Add audit_logs table

---

### 16. **JWT Never Expires**
**Problem:** Admin tokens don't expire. If leaked, valid forever.

**Location:** `backend/src/controllers/authController.js`

**Fix:**
```javascript
const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { 
  expiresIn: '7d' // Token expires in 7 days
});
```

---

### 17. **No Database Backups**
**Problem:** If Turso database corrupts, all data lost.

**Fix:** Set up automated backups in Turso dashboard

---

### 18. **No Error Monitoring**
**Problem:** When app crashes in production, you won't know why.

**Fix:** Integrate Sentry
```javascript
const Sentry = require('@sentry/node');
Sentry.init({ dsn: process.env.SENTRY_DSN });
```

---

### 19. **No HTTPS Enforcement**
**Problem:** Backend might accept HTTP requests (insecure).

**Fix:** Add middleware
```javascript
app.use((req, res, next) => {
  if (req.headers['x-forwarded-proto'] !== 'https' && process.env.NODE_ENV === 'production') {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});
```

---

### 20. **No Admin Password Change**
**Problem:** Default admin password (`admin123`) can't be changed via UI.

**Fix:** Add password change endpoint

---

## 🛠️ IMMEDIATE ACTIONS BEFORE DEPLOYMENT

1. ✅ **Fix stock restoration on order deletion** (Critical)
2. ✅ **Add Paystack webhook verification** (Critical)
3. ✅ **Change order reference to use timestamp** (Critical)
4. ✅ **Add input validation** (Medium)
5. ✅ **Add JWT expiration** (Medium)
6. ⚠️ **Change default admin password** (High)
7. ⚠️ **Add rate limiting** (Medium)

---

## 📊 MONITORING CHECKLIST

After deployment, monitor:
- [ ] Order creation success rate
- [ ] Payment confirmation failures
- [ ] Stock discrepancies
- [ ] API response times
- [ ] Error logs
- [ ] Database size growth

---

## 🆘 EMERGENCY CONTACTS

- **Turso Support:** https://turso.tech/support
- **Paystack Support:** support@paystack.com
- **Vercel Support:** https://vercel.com/support
- **Railway Support:** https://railway.app/help
