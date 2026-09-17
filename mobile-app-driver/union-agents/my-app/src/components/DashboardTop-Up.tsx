import React, { useState } from 'react';
import './DashboardTop-Up.css';
import { api } from '../api/client';

export type TopUpLookupResult = {
  userId: string | number;
  vehicleId: string | number | null;
  fullName: string;
  phone?: string;
  amount: number;
  plateNumber: string;
};

interface DashboardTopUpProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel: () => void;
  onNext: (data: TopUpLookupResult) => void;
}

const DashboardTopUp: React.FC<DashboardTopUpProps> = ({
  isOpen,
  onClose,
  onCancel,
  onNext
}) => {
  const [plateNumber, setPlateNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [amount, setAmount] = useState('0.00');
  const [isVerified, setIsVerified] = useState(false);
  const [lookup, setLookup] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerifyId = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await api('/api/v1/payments/lookup', {
        method: 'POST',
        body: JSON.stringify({ plateNumber }),
      });
      setLookup(result);
      setIsVerified(true);
      setDriverName(result.full_name || '—');
    } catch (err: any) {
      setIsVerified(false);
      setLookup(null);
      setDriverName('');
      setError(err.message || 'Lookup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (!lookup || !isVerified) {
      setError('Please verify plate number first');
      return;
    }
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      setError('Enter a valid amount');
      return;
    }
    onNext({
      userId: lookup.user_id,
      vehicleId: lookup.vehicle_id || null,
      fullName: lookup.full_name || driverName,
      phone: lookup.phone,
      amount: amt,
      plateNumber: lookup.plate_number || plateNumber,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="topup-modal-overlay">
      <div className="topup-modal-container">
        <div className="topup-modal-header">
          <div className="topup-icon-header">
            <img src="/Media/money-add-01.png" alt="Money Add" className="topup-icon-img" />
          </div>
          <button className="topup-close-button" onClick={onClose}>
            <span>×</span>
          </button>
        </div>

        <div className="topup-modal-content">
          <div className="topup-title-section">
            <h2 className="topup-modal-title">Top-Up Driver Card</h2>
            <div className="topup-progress-indicator">
              <img src="/Media/Group 765.png" alt="Step 1/2" className="topup-progress-icon-img" />
            </div>
          </div>

          <div className="topup-form">
            <div className="topup-form-row">
              <div className="topup-form-group">
                <label className="topup-form-label">Plate Number / ID Number*</label>
                <div className="topup-input-with-verify">
                  <input
                    type="text"
                    className="topup-form-input"
                    placeholder="e.g. PLJ-1101ABC"
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                  />
                  <button 
                    className="topup-verify-button"
                    onClick={handleVerifyId}
                    disabled={loading || !plateNumber.trim()}
                  >
                    {loading ? '...' : 'Verify ID'}
                  </button>
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>
                  Seeded plate example: <strong>PLJ-1101ABC</strong>
                </div>
              </div>

              <div className="topup-form-group">
                <label className="topup-form-label">Drivers Name*</label>
                <input
                  type="text"
                  className="topup-form-input topup-driver-name"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  readOnly
                />
              </div>
            </div>

            <div className="topup-form-group topup-amount-group">
              <label className="topup-form-label">Amount*</label>
              <input
                type="text"
                className="topup-form-input topup-amount-input"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            {error && <div style={{ color: '#dc2626', marginTop: 8 }}>{error}</div>}
          </div>

          <div className="topup-modal-actions">
            <button className="topup-action-button topup-cancel" onClick={onCancel}>
              Cancel
            </button>
            <button className="topup-action-button topup-next" onClick={handleNext}>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTopUp;
