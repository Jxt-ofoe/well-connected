'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import toast from 'react-hot-toast';
import { FiTrash2, FiDownload, FiPrinter } from 'react-icons/fi';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      const data = await apiFetch('/orders');
      setOrders(data);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
      await apiFetch(`/orders/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      toast.success(`Order marked as ${status}`);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const deleteOrder = async (orderId, orderRef) => {
    if (!confirm(`Delete order ${orderRef}? This action cannot be undone.`)) return;

    try {
      await apiFetch(`/orders/${orderId}`, { method: 'DELETE' });
      toast.success('Order deleted!');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to delete order');
    }
  };

  const generatePDF = (order) => {
    if (order.status === 'pending') {
      toast.error('PDF receipt only available after payment is confirmed');
      return;
    }

    const printWindow = window.open('', '_blank');
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${order.orderReference || order.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #d4a843; padding-bottom: 20px; }
          .header h1 { color: #d4a843; margin: 0; font-size: 28px; }
          .header p { margin: 5px 0; color: #666; }
          .info-section { margin: 20px 0; }
          .info-row { display: flex; justify-content: space-between; margin: 8px 0; }
          .label { font-weight: bold; color: #333; }
          .value { color: #666; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #f5f5f5; padding: 12px; text-align: left; border-bottom: 2px solid #d4a843; }
          td { padding: 12px; border-bottom: 1px solid #eee; }
          .total-row { font-weight: bold; font-size: 18px; background: #f9f9f9; }
          .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>WELL CONNECTED</h1>
          <p>Premium Provisions Store</p>
          <p>Order Receipt</p>
        </div>
        
        <div class="info-section">
          <div class="info-row">
            <span class="label">Order Reference:</span>
            <span class="value">${order.orderReference || `#${order.id}`}</span>
          </div>
          <div class="info-row">
            <span class="label">Date:</span>
            <span class="value">${order.createdAt ? new Date(order.createdAt).toLocaleString() : '—'}</span>
          </div>
          <div class="info-row">
            <span class="label">Status:</span>
            <span class="value" style="text-transform: uppercase; color: #4ade80;">${order.status}</span>
          </div>
        </div>

        <div class="info-section">
          <h3 style="color: #d4a843; margin-bottom: 10px;">Customer Information</h3>
          <div class="info-row">
            <span class="label">Name:</span>
            <span class="value">${order.customerName}</span>
          </div>
          <div class="info-row">
            <span class="label">Phone:</span>
            <span class="value">${order.phone}</span>
          </div>
          <div class="info-row">
            <span class="label">Delivery Address:</span>
            <span class="value">${order.address}</span>
          </div>
        </div>

        <h3 style="color: #d4a843; margin-top: 30px;">Order Items</h3>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td>${item.productName || `Product #${item.product_id}`}</td>
                <td>${item.quantity}</td>
                <td>GH₵${Number(item.productPrice || 0).toFixed(2)}</td>
                <td>GH₵${(Number(item.productPrice || 0) * item.quantity).toFixed(2)}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="3" style="text-align: right;">TOTAL:</td>
              <td style="color: #d4a843;">GH₵${Number(order.totalPrice).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <p>Thank you for your business!</p>
          <p>For inquiries, contact us at support@wellconnected.com</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const getBadgeClass = (status) => {
    const classes = {
      pending: 'badge badge-pending',
      paid: 'badge badge-paid',
      delivered: 'badge badge-delivered',
    };
    return classes[status] || 'badge';
  };

  if (loading) return <div className="spinner" />;

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', marginBottom: '0.25rem' }}>
        Orders
      </h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>{orders.length} total orders</p>

      {orders.length === 0 ? (
        <div className="empty-state">
          <h3>No orders yet</h3>
          <p>Orders from your customers will appear here</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Order Reference</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <>
                  <tr
                    key={order.id}
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.9rem' }}>
                      {order.orderReference || `#${order.id}`}
                    </td>
                    <td>{order.customerName}</td>
                    <td>{order.phone}</td>
                    <td style={{ color: 'var(--color-gold)', fontWeight: 600 }}>
                      GH₵{Number(order.totalPrice).toFixed(2)}
                    </td>
                    <td>
                      <span className={getBadgeClass(order.status)}>{order.status}</span>
                    </td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <select
                          value={order.status}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          className="filter-select"
                          style={{ minWidth: '100px', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="delivered">Delivered</option>
                        </select>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => generatePDF(order)}
                          title="Generate PDF Receipt"
                          disabled={order.status === 'pending'}
                          style={{ padding: '0.4rem 0.6rem' }}
                        >
                          <FiPrinter />
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => deleteOrder(order.id, order.orderReference || `#${order.id}`)}
                          title="Delete Order"
                          style={{ padding: '0.4rem 0.6rem' }}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedOrder === order.id && order.items && (
                    <tr key={`${order.id}-detail`}>
                      <td colSpan={7} style={{ background: 'var(--color-bg-secondary)', padding: '1rem 1.5rem' }}>
                        <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                          Order Items:
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                          <strong>Address:</strong> {order.address}
                        </div>
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              padding: '0.4rem 0',
                              fontSize: '0.85rem',
                              borderBottom: idx < order.items.length - 1 ? '1px solid var(--color-border)' : 'none',
                            }}
                          >
                            <span>
                              {item.productName || `Product #${item.product_id}`} × {item.quantity}
                            </span>
                            <span style={{ color: 'var(--color-gold)' }}>
                              GH₵{(Number(item.productPrice || 0) * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
