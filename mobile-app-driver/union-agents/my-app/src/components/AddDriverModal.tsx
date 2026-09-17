import React, { useState } from 'react';
import { api, getStoredUser } from '../api/client';

interface AddDriverModalProps {
  onClose: () => void;
}

const AddDriverModal: React.FC<AddDriverModalProps> = ({ onClose }) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const me = getStoredUser<any>();
      let tenantId = me?.tenantId || me?.tenant_id;
      if (!tenantId) {
        const tenants = await api('/api/v1/tenants');
        tenantId = (tenants || []).find((t: any) => t.status === 'active')?.id || (tenants || [])[0]?.id;
      }
      const emailSlug = fullName.toLowerCase().replace(/\s+/g, '.') || 'driver';
      await api('/api/v1/users', {
        method: 'POST',
        body: JSON.stringify({
          email: `${emailSlug}.${Date.now()}@drivers.local`,
          password: 'ChangeMe123!',
          fullName,
          role: 'DRIVER',
          phone,
          tenantId,
        }),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add driver');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Add New Driver</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label>Full Name</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} required style={{ width: '100%', padding: 8 }} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} required style={{ width: '100%', padding: 8 }} />
          </div>
          {error && <div style={{ color: '#dc2626', marginBottom: 8 }}>{error}</div>}
          <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          <button type="button" onClick={onClose} style={{ marginLeft: 8 }}>Close</button>
        </form>
      </div>
    </div>
  );
};

export default AddDriverModal;
