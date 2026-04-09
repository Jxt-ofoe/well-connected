'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { apiFetch } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiShoppingBag, FiMinus, FiPlus } from 'react-icons/fi';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedPackSize, setSelectedPackSize] = useState(null); // How many units per purchase

  useEffect(() => {
    if (params.id) {
      apiFetch(`/products/${params.id}`)
        .then((data) => {
          setProduct(data);
          // Set initial pack size based on product settings
          setSelectedPackSize(data.pack_size || 1);
        })
        .catch(() => toast.error('Product not found'))
        .finally(() => setLoading(false));
    }
  }, [params.id]);

  const handleAddToCart = () => {
    if (product) {
      const itemToAdd = selectedPackSize < product.pack_size && product.sell_individually
        ? { ...product, name: `${product.name} (${selectedPackSize} ${selectedPackSize === 1 ? 'unit' : 'units'})`, price: product.unit_price * selectedPackSize, pack_size: selectedPackSize, isCustomPack: true }
        : product;
      addToCart(itemToAdd, quantity);
      toast.success(`${itemToAdd.name} added to cart!`);
    }
  };

  const getCurrentPrice = () => {
    if (selectedPackSize < product.pack_size && product.sell_individually && product.unit_price) {
      return product.unit_price * selectedPackSize;
    }
    return product.price;
  };

  const getMaxQuantity = () => {
    if (selectedPackSize < product.pack_size && product.sell_individually) {
      return Math.floor((product.stock * product.pack_size) / selectedPackSize);
    }
    return product.stock;
  };



  if (loading || !selectedPackSize) {
    return (
      <>
        <Navbar />
        <div className="page loading-page">
          <div className="spinner" />
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="page container">
          <div className="empty-state">
            <h3>Product not found</h3>
            <button className="btn btn-secondary" onClick={() => router.push('/products')}>
              Back to Shop
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="page container">
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => router.push('/products')}
          style={{ marginBottom: '2rem' }}
        >
          <FiArrowLeft /> Back to Shop
        </button>

        <div className="product-detail animate-fade-in-up">
          <img
            src={product.image || '/placeholder.jpg'}
            alt={product.name}
            className="product-detail-image"
          />

          <div className="product-detail-info">
            {product.category && (
              <span className="hero-badge" style={{ marginBottom: '1rem' }}>
                {product.category}
              </span>
            )}
            <h1>{product.name}</h1>
            
            {/* Debug info - remove after testing */}
            {process.env.NODE_ENV === 'development' && (
              <div style={{ padding: '0.5rem', background: '#333', fontSize: '0.8rem', marginBottom: '1rem' }}>
                sell_individually: {String(product.sell_individually)} | 
                pack_size: {product.pack_size} | 
                unit_price: {product.unit_price}
              </div>
            )}
            
            {/* Pack Size Selector - Single Unit or Whole Pack */}
            {product.sell_individually && product.pack_size > 1 && product.unit_price && (
              <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(212, 175, 55, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gold)' }}>
                <label className="form-label" style={{ marginBottom: '0.75rem', display: 'block', color: 'var(--color-gold)' }}>
                  Choose purchase option:
                </label>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <button
                    className={`btn ${selectedPackSize === 1 ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => { setSelectedPackSize(1); setQuantity(1); }}
                    style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>Single Unit</span>
                    <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>GH₵{Number(product.unit_price).toFixed(2)}</span>
                  </button>
                  <button
                    className={`btn ${selectedPackSize === product.pack_size ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => { setSelectedPackSize(product.pack_size); setQuantity(1); }}
                    style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>Full Pack</span>
                    <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>{product.pack_size} units - GH₵{Number(product.price).toFixed(2)}</span>
                  </button>
                </div>
              </div>
            )}

            <div className="product-detail-price">
              GH₵{Number(getCurrentPrice()).toFixed(2)}
              {selectedPackSize === product.pack_size && product.pack_size > 1 && (
                <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginLeft: '0.75rem' }}>
                  (Pack of {product.pack_size})
                </span>
              )}
            </div>

            <p className="product-detail-desc">{product.description}</p>

            <div className="product-detail-meta">
              <div>
                <span>Stock</span>
                <strong>
                  {product.stock > 0 ? (
                    selectedPackSize < product.pack_size && product.sell_individually
                      ? `${Math.floor((product.stock * product.pack_size) / selectedPackSize)} available`
                      : `${product.stock} packs`
                  ) : 'Out of stock'}
                </strong>
              </div>
              <div>
                <span>Category</span>
                <strong>{product.category || 'General'}</strong>
              </div>
              {product.pack_size > 1 && (
                <div>
                  <span>Full Pack Size</span>
                  <strong>{product.pack_size} units</strong>
                </div>
              )}
            </div>

            {product.stock > 0 && (
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div className="cart-item-controls">
                  <button
                    className="qty-btn"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <FiMinus />
                  </button>
                  <span style={{ minWidth: '2rem', textAlign: 'center', fontWeight: 600 }}>
                    {quantity}
                  </span>
                  <button
                    className="qty-btn"
                    onClick={() => setQuantity(Math.min(getMaxQuantity(), quantity + 1))}
                  >
                    <FiPlus />
                  </button>
                </div>
              </div>
            )}

            <button
              className="btn btn-primary btn-lg"
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              style={{ width: '100%' }}
            >
              <FiShoppingBag />
              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
