'use client';

import Link from 'next/link';

export default function ProductCard({ product }) {
  return (
    <Link href={`/products/${product.id}`}>
      <div className="product-card animate-fade-in-up">
        <img
          src={product.image || '/placeholder.jpg'}
          alt={product.name}
          className="product-card-image"
          loading="lazy"
        />
        <div className="product-card-body">
          {product.category && (
            <div className="product-card-category">{product.category}</div>
          )}
          <h3 className="product-card-name">{product.name}</h3>
          <div className="product-card-price">
            GH₵{Number(product.price).toFixed(2)}
            {product.pack_size > 1 && (
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginLeft: '0.5rem' }}>
                (Pack of {product.pack_size})
              </span>
            )}
          </div>
          {product.unit_price && product.pack_size > 1 && (
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
              GH₵{Number(product.unit_price).toFixed(2)} each
            </div>
          )}
          {product.stock !== undefined && (
            <div className="product-card-stock">
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
