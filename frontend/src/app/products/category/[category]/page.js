'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import Footer from '@/components/Footer';
import { apiFetch } from '@/lib/api';
import { FiArrowLeft, FiSearch } from 'react-icons/fi';

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryName = decodeURIComponent(params.category);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    apiFetch('/products')
      .then((data) => {
        const filtered = data.filter((p) => p.category === categoryName);
        setProducts(filtered);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [categoryName]);

  const filtered = useMemo(() => {
    if (!search) return products;
    return products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  return (
    <>
      <Navbar />
      <div className="page container">
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => router.push('/products')}
          style={{ marginBottom: '1.5rem' }}
        >
          <FiArrowLeft /> All Categories
        </button>

        <div className="page-header animate-fade-in">
          <h1>{categoryName}</h1>
          <p>{products.length} product{products.length !== 1 ? 's' : ''} available</p>
        </div>

        {products.length > 3 && (
          <div className="filter-bar">
            <div className="search-wrapper">
              <FiSearch />
              <input
                type="text"
                className="search-input"
                placeholder={`Search in ${categoryName}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        )}

        {loading ? (
          <div className="spinner" />
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <h3>No products found</h3>
            <p>Try adjusting your search</p>
          </div>
        ) : (
          <div className="product-grid">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
