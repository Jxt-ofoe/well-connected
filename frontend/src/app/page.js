'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import Footer from '@/components/Footer';
import { apiFetch } from '@/lib/api';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/products')
      .then((data) => setProducts(data.slice(0, 4)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content animate-fade-in-up">
          <span className="hero-badge">✦ Premium Provisions</span>
          <h1>Your One-Stop Provisions Store</h1>
          <p>
            Quality groceries, household essentials, and everyday provisions 
            delivered to your doorstep. Stock up on everything you need.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/products" className="btn btn-primary btn-lg">
              Shop Now
            </Link>
            <Link href="/products" className="btn btn-secondary btn-lg">
              Browse Provisions
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container" style={{ paddingBottom: '4rem' }}>
        <h2 className="section-title">Popular Provisions</h2>
        {loading ? (
          <div className="spinner" />
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link href="/products" className="btn btn-secondary">
            View All Products →
          </Link>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container" style={{ paddingBottom: '4rem' }}>
        <h2 className="section-title">Shop by Category</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem' }}>
          {[
            { name: 'Rice', image: '/rice.jpg' },
            { name: 'Cooking Oil', image: '/oil.jpg' },
            { name: 'Noodles & Pasta', image: '/pasta.jpg' },
            { name: 'Sugar & Sweeteners', image: '/sugar.jpg' },
            { name: 'Dairy & Beverages', image: '/diary.jpg' },
            { name: 'Household & Cleaning', image: '/household.jpg' },
            { name: 'Seasoning & Spices', image: '/spice.jpg' },
            { name: 'Canned & Packaged Foods', image: '/cannedfood.jpg' },
            { name: 'Flour & Baking', image: '/floor.png' },
            { name: 'Toiletries', image: '/toiletries.jpg' },
            { name: 'Frozen Foods', image: '/frozen.jpg' },
          ].map((category, i) => (
            <Link
              key={i}
              href={`/products?category=${encodeURIComponent(category.name)}`}
              className="category-card animate-fade-in-up"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div style={{ position: 'relative', width: '100%', paddingBottom: '100%', overflow: 'hidden', borderRadius: 'var(--radius-md)' }}>
                <img
                  src={category.image}
                  alt={category.name}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', padding: '1rem 0.75rem', color: 'white' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>{category.name}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Value Props */}
      <section
        style={{
          background: 'var(--color-bg-secondary)',
          borderTop: '1px solid var(--color-border)',
          borderBottom: '1px solid var(--color-border)',
          padding: '4rem 0',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '2rem',
              textAlign: 'center',
            }}
          >
            {[
              { icon: '🚚', title: 'Fast Delivery', desc: 'Quick doorstep delivery on all provision orders' },
              { icon: '🛒', title: 'Fresh & Quality', desc: 'Only the freshest groceries and trusted brands' },
              { icon: '🔒', title: 'Secure Checkout', desc: 'Your payment information is always safe' },
              { icon: '💰', title: 'Best Prices', desc: 'Competitive prices on all your everyday essentials' },
            ].map((item, i) => (
              <div key={i} style={{ padding: '1.5rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{item.icon}</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  {item.title}
                </h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
