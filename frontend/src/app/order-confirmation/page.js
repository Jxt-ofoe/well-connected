'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FiCheckCircle, FiDownload } from 'react-icons/fi';
import { apiFetch } from '@/lib/api';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderReference = searchParams.get('orderReference');
  const total = searchParams.get('total');
  const paid = searchParams.get('paid');
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    if (orderReference && paid === 'true') {
      // Fetch full order details for PDF
      apiFetch('/orders')
        .then(orders => {
          const order = orders.find(o => o.orderReference === orderReference);
          setOrderDetails(order);
        })
        .catch(console.error);
    }
  }, [orderReference, paid]);

  const downloadPDF = () => {
    if (!orderDetails) return;

    const printWindow = window.open('', '_blank');
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${orderReference}</title>
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
          .paid-stamp { color: #4ade80; font-weight: bold; font-size: 24px; text-align: center; margin: 20px 0; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>WELL CONNECTED</h1>
          <p>Premium Provisions Store</p>
          <p>Payment Receipt</p>
        </div>
        
        <div class="paid-stamp">✅ PAID</div>
        
        <div class="info-section">
          <div class="info-row">
            <span class="label">Order Reference:</span>
            <span class="value">${orderReference}</span>
          </div>
          <div class="info-row">
            <span class="label">Date:</span>
            <span class="value">${orderDetails.createdAt ? new Date(orderDetails.createdAt).toLocaleString() : new Date().toLocaleString()}</span>
          </div>
          <div class="info-row">
            <span class="label">Payment Status:</span>
            <span class="value" style="color: #4ade80; font-weight: bold;">PAID</span>
          </div>
          ${orderDetails.paymentReference ? `
          <div class="info-row">
            <span class="label">Payment Reference:</span>
            <span class="value">${orderDetails.paymentReference}</span>
          </div>
          ` : ''}
        </div>

        <div class="info-section">
          <h3 style="color: #d4a843; margin-bottom: 10px;">Customer Information</h3>
          <div class="info-row">
            <span class="label">Name:</span>
            <span class="value">${orderDetails.customerName}</span>
          </div>
          ${orderDetails.email ? `
          <div class="info-row">
            <span class="label">Email:</span>
            <span class="value">${orderDetails.email}</span>
          </div>
          ` : ''}
          <div class="info-row">
            <span class="label">Phone:</span>
            <span class="value">${orderDetails.phone}</span>
          </div>
          <div class="info-row">
            <span class="label">Delivery Address:</span>
            <span class="value">${orderDetails.address}</span>
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
            ${orderDetails.items.map(item => `
              <tr>
                <td>${item.productName || `Product #${item.product_id}`}</td>
                <td>${item.quantity}</td>
                <td>GH₵${Number(item.productPrice || 0).toFixed(2)}</td>
                <td>GH₵${(Number(item.productPrice || 0) * item.quantity).toFixed(2)}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="3" style="text-align: right;">TOTAL PAID:</td>
              <td style="color: #d4a843;">GH₵${Number(total).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <p>Thank you for your payment!</p>
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

  return (
    <div className="confirmation-card animate-fade-in-up">
      <div className="confirmation-icon">
        <FiCheckCircle />
      </div>
      <h1>Order Confirmed!</h1>
      <p>
        Thank you for your order. We&apos;ve received it and will process it shortly.
      </p>

      {orderReference && (
        <div
          style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
            ORDER REFERENCE
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-gold)', fontFamily: 'monospace' }}>
            {orderReference}
          </div>
          {total && (
            <div style={{ marginTop: '0.5rem', color: 'var(--color-text-secondary)' }}>
              Total: GH₵{Number(total).toFixed(2)}
            </div>
          )}
          {paid === 'true' && (
            <div style={{ marginTop: '1rem' }}>
              <div style={{ color: 'var(--color-success)', fontWeight: 600, marginBottom: '0.5rem' }}>
                ✅ Payment Confirmed
              </div>
              <button
                className="btn btn-primary"
                onClick={downloadPDF}
                disabled={!orderDetails}
                style={{ width: '100%' }}
              >
                <FiDownload /> Download Receipt (PDF)
              </button>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/products" className="btn btn-primary">
          Continue Shopping
        </Link>
        <Link href="/" className="btn btn-secondary">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <>
      <Navbar />
      <div className="page container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Suspense fallback={<div className="spinner" />}>
          <ConfirmationContent />
        </Suspense>
      </div>
      <Footer />
    </>
  );
}
