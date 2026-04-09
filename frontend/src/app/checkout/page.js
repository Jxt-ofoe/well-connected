'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { apiFetch } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Script from 'next/script';

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const [form, setForm] = useState({ customerName: '', phone: '', address: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [paystackLoaded, setPaystackLoaded] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePaystackSuccess = (reference) => {
    setLoading(true);
    
    const orderData = {
      customerName: form.customerName,
      phone: form.phone,
      address: form.address,
      email: form.email,
      paymentReference: reference.reference,
      items: cart.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
      })),
    };

    apiFetch('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    })
      .then((result) => {
        return apiFetch(`/orders/${result.orderId}/confirm-payment`, {
          method: 'POST',
          body: JSON.stringify({ reference: reference.reference }),
        }).then(() => result);
      })
      .then((result) => {
        clearCart();
        router.push(`/order-confirmation?orderReference=${result.orderReference}&total=${result.totalPrice}&paid=true`);
      })
      .catch((error) => {
        toast.error(error.message || 'Failed to place order');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handlePaystackClose = () => {
    toast.error('Payment cancelled');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!paystackLoaded) {
      toast.error('Payment system is loading, please wait...');
      return;
    }

    if (!window.PaystackPop) {
      toast.error('Payment system not loaded. Please refresh the page.');
      return;
    }

    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    if (!publicKey || publicKey === 'pk_test_your_key_here') {
      toast.error('Payment system not configured. Please contact support.');
      console.error('Paystack public key not set in environment variables');
      return;
    }

    try {
      // Initialize Paystack payment
      const handler = window.PaystackPop.setup({
        key: publicKey,
        email: form.email,
        amount: Math.round(cartTotal * 100), // Amount in pesewas
        currency: 'GHS',
        ref: `WC-${new Date().getTime()}`,
        callback: handlePaystackSuccess,
        onClose: handlePaystackClose,
      });

      handler.openIframe();
    } catch (error) {
      console.error('Paystack error:', error);
      toast.error('Failed to initialize payment. Please try again.');
    }
  };

  if (cart.length === 0) {
    return (
      <>
        <Navbar />
        <div className="page container">
          <div className="empty-state" style={{ paddingTop: '4rem' }}>
            <h3>Your cart is empty</h3>
            <p style={{ marginBottom: '2rem' }}>Add products before checking out</p>
            <Link href="/products" className="btn btn-primary">
              Browse Products
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Script 
        src="https://js.paystack.co/v1/inline.js" 
        onLoad={() => setPaystackLoaded(true)}
      />
      <Navbar />
      <div className="page container">
        <div className="page-header">
          <h1>Checkout</h1>
          <p>Complete your order</p>
        </div>

        <div className="checkout-layout">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="customerName"
                className="form-input"
                placeholder="Enter your full name"
                value={form.customerName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="Enter your email address"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                name="phone"
                className="form-input"
                placeholder="Enter your phone number"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Delivery Address</label>
              <textarea
                name="address"
                className="form-input"
                placeholder="Enter your full delivery address"
                value={form.address}
                onChange={handleChange}
                required
                rows={3}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? 'Processing...' : `Pay GH₵${cartTotal.toFixed(2)} with Paystack`}
            </button>
            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '1rem' }}>
              🔒 Secure payment powered by Paystack
            </p>
          </form>

          <div className="cart-summary">
            <h3>Order Summary</h3>
            {cart.map((item) => (
              <div key={item.id} className="cart-summary-row">
                <span>{item.name} × {item.quantity}</span>
                <span>GH₵{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="cart-summary-total">
              <span>Total</span>
              <span>GH₵{cartTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
