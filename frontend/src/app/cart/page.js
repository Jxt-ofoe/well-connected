'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag } from 'react-icons/fi';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, cartTotal, cartCount } = useCart();

  if (cart.length === 0) {
    return (
      <>
        <Navbar />
        <div className="page container">
          <div className="empty-state" style={{ paddingTop: '4rem' }}>
            <FiShoppingBag style={{ fontSize: '4rem', color: 'var(--color-text-muted)' }} />
            <h3 style={{ marginTop: '1rem' }}>Your cart is empty</h3>
            <p style={{ marginBottom: '2rem' }}>Add some products to get started</p>
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
      <Navbar />
      <div className="page container">
        <div className="page-header">
          <h1>Shopping Cart</h1>
          <p>{cartCount} item{cartCount !== 1 ? 's' : ''} in your cart</p>
        </div>

        <div className="checkout-layout">
          <div>
            {cart.map((item) => (
              <div key={item.id} className="cart-item animate-fade-in">
                <img
                  src={item.image || '/placeholder.jpg'}
                  alt={item.name}
                  className="cart-item-image"
                />
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">
                    GH₵{Number(item.price).toFixed(2)}
                  </div>
                </div>
                <div className="cart-item-controls">
                  <button
                    className="qty-btn"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <FiMinus />
                  </button>
                  <span style={{ minWidth: '2rem', textAlign: 'center', fontWeight: 600 }}>
                    {item.quantity}
                  </span>
                  <button
                    className="qty-btn"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <FiPlus />
                  </button>
                </div>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => removeFromCart(item.id)}
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>

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
            <Link
              href="/checkout"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '1.5rem', justifyContent: 'center' }}
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
