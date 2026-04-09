'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FiShoppingBag, FiMenu, FiX } from 'react-icons/fi';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { cartCount } = useCart();

  return (
    <nav className="navbar">
      <Link href="/" className="navbar-brand">
        Well Connected
      </Link>

      <button
        className="navbar-menu-btn"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        {menuOpen ? <FiX /> : <FiMenu />}
      </button>

      <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
        <Link href="/" onClick={() => setMenuOpen(false)}>
          Home
        </Link>
        <Link href="/products" onClick={() => setMenuOpen(false)}>
          Shop
        </Link>
        <Link href="/cart" onClick={() => setMenuOpen(false)}>
          <span className="cart-icon">
            <FiShoppingBag />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </span>
        </Link>
      </div>
    </nav>
  );
}
