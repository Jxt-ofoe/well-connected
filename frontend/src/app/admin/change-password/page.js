'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (form.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await apiFetch('/admin/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });

      toast.success('Password changed successfully!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 2000);
    } catch (error) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page container">
      <div className="page-header">
        <h1>Change Password</h1>
        <p>Update your admin account password</p>
      </div>

      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        <div style={{ 
          padding: '1.5rem', 
          background: 'rgba(212, 175, 55, 0.1)', 
          borderRadius: 'var(--radius-md)', 
          border: '1px solid var(--color-gold)',
          marginBottom: '2rem'
        }}>
          <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-gold)' }}>
            ⚠️ <strong>Security Notice:</strong> Change the default password immediately.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input
              type="password"
              name="currentPassword"
              className="form-input"
              placeholder="Enter current password"
              value={form.currentPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              type="password"
              name="newPassword"
              className="form-input"
              placeholder="Enter new password (min 6 characters)"
              value={form.newPassword}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              className="form-input"
              placeholder="Confirm new password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ flex: 1 }}
            >
              {loading ? 'Changing...' : 'Change Password'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => router.push('/admin/dashboard')}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
