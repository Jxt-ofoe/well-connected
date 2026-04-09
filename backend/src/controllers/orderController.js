const { db } = require('../db');
const axios = require('axios');

// Generate unique order reference with timestamp to avoid collisions
function generateOrderReference() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const timestamp = date.getTime().toString().slice(-6); // Last 6 digits of timestamp
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return `WC-${year}${month}${day}-${timestamp}${random}`;
}

const createOrder = async (req, res) => {
  try {
    const { customerName, email, phone, address, items, paymentReference } = req.body;

    // Calculate total price
    let totalPrice = 0;
    const productDetails = [];

    for (const item of items) {
      const result = await db.execute({
        sql: 'SELECT * FROM products WHERE id = ?',
        args: [item.product_id],
      });

      if (result.rows.length === 0) {
        return res.status(400).json({ error: `Product with ID ${item.product_id} not found.` });
      }

      const product = result.rows[0];

      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for "${product.name}".` });
      }

      totalPrice += product.price * item.quantity;
      productDetails.push({ ...product, quantity: item.quantity });
    }

    // Generate unique order reference
    const orderReference = generateOrderReference();

    // Create order
    const orderResult = await db.execute({
      sql: 'INSERT INTO orders (orderReference, customerName, email, phone, address, totalPrice, status, paymentReference) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      args: [orderReference, customerName, email || null, phone, address, totalPrice, 'pending', paymentReference || null],
    });

    const orderId = Number(orderResult.lastInsertRowid);

    // Create order items and update stock
    for (const item of items) {
      await db.execute({
        sql: 'INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?)',
        args: [orderId, item.product_id, item.quantity],
      });

      await db.execute({
        sql: 'UPDATE products SET stock = stock - ? WHERE id = ?',
        args: [item.quantity, item.product_id],
      });
    }

    res.status(201).json({
      message: 'Order placed successfully',
      orderId,
      orderReference,
      totalPrice,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const confirmPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({ error: 'Payment reference is required' });
    }

    // Verify payment with Paystack API
    try {
      const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
      
      if (!paystackSecretKey) {
        console.error('PAYSTACK_SECRET_KEY not configured');
        return res.status(500).json({ error: 'Payment verification not configured' });
      }

      const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        { 
          headers: { 
            Authorization: `Bearer ${paystackSecretKey}` 
          } 
        }
      );

      if (!response.data || response.data.status !== true || response.data.data.status !== 'success') {
        console.error('Payment verification failed:', response.data);
        return res.status(400).json({ error: 'Payment verification failed. Please contact support.' });
      }

      // Verify amount matches (in kobo/pesewas)
      const paidAmount = response.data.data.amount / 100; // Convert from pesewas to cedis
      
      const existing = await db.execute({
        sql: 'SELECT * FROM orders WHERE id = ?',
        args: [id],
      });

      if (existing.rows.length === 0) {
        return res.status(404).json({ error: 'Order not found.' });
      }

      const order = existing.rows[0];
      
      // Allow small rounding differences (0.01 cedis)
      if (Math.abs(paidAmount - order.totalPrice) > 0.01) {
        console.error(`Amount mismatch: Paid ${paidAmount}, Expected ${order.totalPrice}`);
        return res.status(400).json({ error: 'Payment amount does not match order total' });
      }

      // Update order status to paid
      await db.execute({
        sql: 'UPDATE orders SET status = ?, paymentReference = ? WHERE id = ?',
        args: ['paid', reference, id],
      });

      res.json({ message: 'Payment confirmed successfully', verified: true });
      
    } catch (paystackError) {
      console.error('Paystack API error:', paystackError.response?.data || paystackError.message);
      return res.status(500).json({ error: 'Failed to verify payment with Paystack' });
    }
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await db.execute('SELECT * FROM orders ORDER BY createdAt DESC');

    // Get items per order
    const ordersWithItems = await Promise.all(
      orders.rows.map(async (order) => {
        const items = await db.execute({
          sql: `SELECT oi.*, p.name as productName, p.price as productPrice, p.image as productImage
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?`,
          args: [order.id],
        });
        return { ...order, items: items.rows };
      })
    );

    res.json(ordersWithItems);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const existing = await db.execute({
      sql: 'SELECT * FROM orders WHERE id = ?',
      args: [id],
    });

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    await db.execute({
      sql: 'UPDATE orders SET status = ? WHERE id = ?',
      args: [status, id],
    });

    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await db.execute({
      sql: 'SELECT * FROM orders WHERE id = ?',
      args: [id],
    });

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    // Restore stock before deleting order
    const items = await db.execute({
      sql: 'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
      args: [id],
    });

    for (const item of items.rows) {
      await db.execute({
        sql: 'UPDATE products SET stock = stock + ? WHERE id = ?',
        args: [item.quantity, item.product_id],
      });
    }

    // Delete order items first
    await db.execute({
      sql: 'DELETE FROM order_items WHERE order_id = ?',
      args: [id],
    });

    // Delete order
    await db.execute({
      sql: 'DELETE FROM orders WHERE id = ?',
      args: [id],
    });

    res.json({ message: 'Order deleted successfully and stock restored' });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { createOrder, getAllOrders, updateOrderStatus, deleteOrder, confirmPayment };
