'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit, FiTrash2, FiX } from 'react-icons/fi';

const emptyProduct = { name: '', price: '', description: '', image: '', stock: '', category: '', pack_size: '1', unit_price: '', sell_individually: false };

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    try {
      const data = await apiFetch('/products');
      setProducts(data);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openCreate = () => {
    setEditingProduct(null);
    setForm(emptyProduct);
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name || '',
      price: String(product.price || ''),
      description: product.description || '',
      image: product.image || '',
      stock: String(product.stock || ''),
      category: product.category || '',
      pack_size: String(product.pack_size || '1'),
      unit_price: String(product.unit_price || ''),
      sell_individually: Boolean(product.sell_individually),
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock) || 0,
        pack_size: parseInt(form.pack_size) || 1,
        unit_price: form.unit_price ? parseFloat(form.unit_price) : null,
        sell_individually: form.sell_individually,
      };

      if (editingProduct) {
        await apiFetch(`/products/${editingProduct.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        toast.success('Product updated!');
      } else {
        await apiFetch('/products', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        toast.success('Product created!');
      }

      setShowModal(false);
      fetchProducts();
    } catch (error) {
      toast.error(error.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    if (!confirm(`Delete "${product.name}"?`)) return;

    try {
      await apiFetch(`/products/${product.id}`, { method: 'DELETE' });
      toast.success('Product deleted!');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  if (loading) return <div className="spinner" />;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', marginBottom: '0.25rem' }}>
            Products
          </h1>
          <p style={{ color: 'var(--color-text-muted)' }}>{products.length} products</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <FiPlus /> Add Product
        </button>
      </div>

      {products.length === 0 ? (
        <div className="empty-state">
          <h3>No products yet</h3>
          <p>Create your first product to get started</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Pack Size</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={product.image || '/placeholder.jpg'}
                        alt={product.name}
                        style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                      />
                      <span style={{ fontWeight: 500 }}>{product.name}</span>
                    </div>
                  </td>
                  <td>{product.category || '—'}</td>
                  <td>
                    {product.pack_size > 1 ? (
                      <span style={{ fontSize: '0.9rem' }}>
                        Pack of {product.pack_size}
                        {product.unit_price && (
                          <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                            GH₵{Number(product.unit_price).toFixed(2)} each
                          </span>
                        )}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.9rem' }}>Single</span>
                    )}
                  </td>
                  <td style={{ color: 'var(--color-gold)', fontWeight: 600 }}>GH₵{Number(product.price).toFixed(2)}</td>
                  <td>{product.stock}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(product)}>
                        <FiEdit />
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(product)}>
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Product Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>{editingProduct ? 'Edit Product' : 'New Product'}</h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', color: 'var(--color-text-muted)', fontSize: '1.2rem' }}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input type="text" name="name" className="form-input" value={form.name} onChange={handleChange} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Price ($)</label>
                  <input type="number" name="price" className="form-input" step="0.01" value={form.price} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock</label>
                  <input type="number" name="stock" className="form-input" value={form.stock} onChange={handleChange} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Pack Size</label>
                  <input 
                    type="number" 
                    name="pack_size" 
                    className="form-input" 
                    min="1" 
                    value={form.pack_size} 
                    onChange={handleChange} 
                  />
                  <small style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Number of units in a pack (e.g., 1, 6, 12, 24)</small>
                </div>
                <div className="form-group">
                  <label className="form-label">Unit Price (optional)</label>
                  <input type="number" name="unit_price" className="form-input" step="0.01" value={form.unit_price} onChange={handleChange} />
                  <small style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Price per single item</small>
                </div>
              </div>
              {parseInt(form.pack_size) > 1 && (
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="sell_individually"
                      checked={form.sell_individually}
                      onChange={(e) => setForm({ ...form, sell_individually: e.target.checked })}
                    />
                    <span className="form-label" style={{ margin: 0 }}>Allow customers to buy single units</span>
                  </label>
                  <small style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginLeft: '1.5rem' }}>
                    Customers can choose between buying 1 unit or the full pack of {form.pack_size}
                  </small>
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Category</label>
                <input type="text" name="category" className="form-input" value={form.category} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input type="text" name="image" className="form-input" value={form.image} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea name="description" className="form-input" value={form.description} onChange={handleChange} rows={3} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingProduct ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
