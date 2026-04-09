'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { apiFetch } from '@/lib/api';
import { FiSearch, FiChevronRight } from 'react-icons/fi';

const categoryImages = {
  'Rice': '/rice.jpg',
  'Cooking Oil': '/oil.jpg',
  'Noodles & Pasta': '/pasta.jpg',
  'Sugar & Sweeteners': '/sugar.jpg',
  'Dairy & Beverages': '/diary.jpg',
  'Household & Cleaning': '/household.jpg',
  'Seasoning & Spices': '/spice.jpg',
  'Canned & Packaged Foods': '/cannedfood.jpg',
  'Toiletries': '/toiletries.jpg',
  'Flour & Baking': '/floor.png',
  'Frozen Foods': '/frozen.jpg',
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    apiFetch('/products')
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const catMap = {};
    products.forEach((p) => {
      if (p.category) {
        if (!catMap[p.category]) {
          catMap[p.category] = { name: p.category, count: 0, minPrice: p.price, maxPrice: p.price };
        }
        catMap[p.category].count++;
        catMap[p.category].minPrice = Math.min(catMap[p.category].minPrice, p.price);
        catMap[p.category].maxPrice = Math.max(catMap[p.category].maxPrice, p.price);
      }
    });
    return Object.values(catMap).sort((a, b) => a.name.localeCompare(b.name));
  }, [products]);

  const filteredCategories = useMemo(() => {
    if (!search) return categories;
    const q = search.toLowerCase();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        products.some(
          (p) => p.category === c.name && p.name.toLowerCase().includes(q)
        )
    );
  }, [categories, search, products]);

  return (
    <>
      <Navbar />
      <div className="page container">
        <div className="page-header animate-fade-in">
          <h1>Our Provisions</h1>
          <p>Select a category to browse available products</p>
        </div>

        <div className="filter-bar">
          <div className="search-wrapper">
            <FiSearch />
            <input
              type="text"
              className="search-input"
              placeholder="Search categories or products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="spinner" />
        ) : filteredCategories.length === 0 ? (
          <div className="empty-state">
            <h3>No categories found</h3>
            <p>Try adjusting your search</p>
          </div>
        ) : (
          <div className="category-grid">
            {filteredCategories.map((cat) => (
              <Link
                key={cat.name}
                href={`/products/category/${encodeURIComponent(cat.name)}`}
                className="category-card animate-fade-in-up"
              >
                <div className="category-card-image-wrapper">
                  <img
                    src={categoryImages[cat.name] || '/placeholder.jpg'}
                    alt={cat.name}
                    className="category-card-image"
                    loading="lazy"
                  />
                  <div className="category-card-overlay" />
                </div>
                <div className="category-card-body">
                  <h3 className="category-card-name">{cat.name}</h3>
                  <p className="category-card-count">{cat.count} product{cat.count !== 1 ? 's' : ''}</p>
                  <p className="category-card-price">
                    From GH₵{Number(cat.minPrice).toFixed(2)}
                  </p>
                </div>
                <div className="category-card-arrow">
                  <FiChevronRight />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
