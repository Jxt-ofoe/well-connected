'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { FiBox, FiShoppingCart, FiDollarSign, FiClock, FiDownload, FiKey } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [products, ordersData] = await Promise.all([
          apiFetch('/products'),
          apiFetch('/orders'),
        ]);

        setOrders(ordersData);
        setStats({
          totalProducts: products.length,
          totalOrders: ordersData.length,
          totalRevenue: ordersData.reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0),
          pendingOrders: ordersData.filter((o) => o.status === 'pending').length,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const generateDailySalesReport = () => {
    const selectedOrders = orders.filter(order => {
      if (!order.createdAt) return false;
      const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
      return orderDate === selectedDate;
    });

    if (selectedOrders.length === 0) {
      toast.error('No orders found for selected date');
      return;
    }

    const totalSales = selectedOrders.reduce((sum, o) => sum + Number(o.totalPrice), 0);
    const paidOrders = selectedOrders.filter(o => o.status === 'paid' || o.status === 'delivered');
    const paidSales = paidOrders.reduce((sum, o) => sum + Number(o.totalPrice), 0);

    const printWindow = window.open('', '_blank');
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Daily Sales Report - ${selectedDate}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 1000px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #d4a843; padding-bottom: 20px; }
          .header h1 { color: #d4a843; margin: 0; font-size: 32px; }
          .header p { margin: 5px 0; color: #666; font-size: 18px; }
          .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 30px 0; }
          .summary-card { background: #f9f9f9; padding: 20px; border-radius: 8px; text-align: center; border: 2px solid #eee; }
          .summary-card .label { font-size: 14px; color: #666; text-transform: uppercase; margin-bottom: 10px; }
          .summary-card .value { font-size: 28px; font-weight: bold; color: #d4a843; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #f5f5f5; padding: 12px; text-align: left; border-bottom: 2px solid #d4a843; font-size: 14px; }
          td { padding: 12px; border-bottom: 1px solid #eee; font-size: 13px; }
          .status-badge { padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
          .status-pending { background: #fef3c7; color: #92400e; }
          .status-paid { background: #dbeafe; color: #1e40af; }
          .status-delivered { background: #d1fae5; color: #065f46; }
          .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; border-top: 2px solid #eee; padding-top: 20px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>WELL CONNECTED</h1>
          <p>Daily Sales Report</p>
          <p style="font-size: 16px; color: #333;">${new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        
        <div class="summary">
          <div class="summary-card">
            <div class="label">Total Orders</div>
            <div class="value">${selectedOrders.length}</div>
          </div>
          <div class="summary-card">
            <div class="label">Total Sales</div>
            <div class="value">GH₵${totalSales.toFixed(2)}</div>
          </div>
          <div class="summary-card">
            <div class="label">Paid Sales</div>
            <div class="value" style="color: #4ade80;">GH₵${paidSales.toFixed(2)}</div>
          </div>
        </div>

        <h3 style="color: #d4a843; margin-top: 30px; margin-bottom: 15px;">Order Details</h3>
        <table>
          <thead>
            <tr>
              <th>Order Ref</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            ${selectedOrders.map(order => `
              <tr>
                <td style="font-family: monospace; font-weight: 600;">${order.orderReference || `#${order.id}`}</td>
                <td>${order.customerName}</td>
                <td>${order.phone}</td>
                <td style="font-weight: 600; color: #d4a843;">GH₵${Number(order.totalPrice).toFixed(2)}</td>
                <td>
                  <span class="status-badge status-${order.status}">${order.status}</span>
                </td>
                <td style="color: #666;">${order.createdAt ? new Date(order.createdAt).toLocaleTimeString() : '—'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p><strong>Report Generated:</strong> ${new Date().toLocaleString()}</p>
          <p>Well Connected - Premium Provisions Store</p>
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

  const statCards = [
    { label: 'Total Products', value: stats.totalProducts, icon: <FiBox />, color: 'var(--color-gold)' },
    { label: 'Total Orders', value: stats.totalOrders, icon: <FiShoppingCart />, color: 'var(--color-info)' },
    { label: 'Revenue', value: `GH₵${stats.totalRevenue.toFixed(2)}`, icon: <FiDollarSign />, color: 'var(--color-success)' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: <FiClock />, color: 'var(--color-warning)' },
  ];

  if (loading) return <div className="spinner" />;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', marginBottom: '0.5rem' }}>
            Dashboard
          </h1>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Welcome back. Here&apos;s your store overview.
          </p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => router.push('/admin/change-password')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <FiKey /> Change Password
        </button>
      </div>

      <div className="stats-grid">
        {statCards.map((card, i) => (
          <div key={i} className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 'var(--radius-md)',
                  background: `${card.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: card.color,
                  fontSize: '1.2rem',
                }}
              >
                {card.icon}
              </div>
              <span className="stat-card-label">{card.label}</span>
            </div>
            <div className="stat-card-value" style={{ color: card.color }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Daily Sales Report */}
      <div style={{ marginTop: '3rem', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '2rem' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '1rem' }}>
          Daily Sales Report
        </h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
          Generate and download sales report for any date
        </p>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1, minWidth: '200px', marginBottom: 0 }}>
            <label className="form-label">Select Date</label>
            <input
              type="date"
              className="form-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={generateDailySalesReport}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <FiDownload /> Generate Report
          </button>
        </div>
      </div>
    </div>
  );
}
