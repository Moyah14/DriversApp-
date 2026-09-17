import React, { useState, useRef, useEffect } from 'react';
import './DashboardAuthorize.css';
import { api } from '../api/client';
import type { TopUpLookupResult } from './DashboardTop-Up';

interface DashboardAuthorizeProps {
  isOpen: boolean;
  onClose: () => void;
  onPrevious: () => void;
  onTopUp: () => void;
  phoneNumber: string;
  topUpData?: TopUpLookupResult | null;
}

const DashboardAuthorize: React.FC<DashboardAuthorizeProps> = ({
  isOpen,
  onClose,
  onPrevious,
  onTopUp,
  phoneNumber,
  topUpData
}) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      inputRefs.current[0]?.focus();
      setCode(['', '', '', '', '', '']);
      setError('');
    }
  }, [isOpen]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const digits = pastedData.split('').filter(char => /\d/.test(char));
    
    const newCode = [...code];
    digits.forEach((digit, index) => {
      if (index < 6) {
        newCode[index] = digit;
      }
    });
    setCode(newCode);
  };

  const handleTopUp = async () => {
    if (!topUpData) {
      setError('Missing top-up details');
      return;
    }
    if (code.join('').length < 6) {
      setError('Enter the 6-digit code (demo: 123456)');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api('/api/v1/payments/topup', {
        method: 'POST',
        body: JSON.stringify({
          userId: topUpData.userId,
          vehicleId: topUpData.vehicleId,
          amount: topUpData.amount,
        }),
      });
      alert(`Top-up successful: ₦${Number(topUpData.amount).toLocaleString()} for ${topUpData.fullName}`);
      onTopUp();
    } catch (err: any) {
      setError(err.message || 'Top-up failed');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const displayPhone = phoneNumber || topUpData?.phone || '+234 *** *** ****';

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <div className="phone-icon-header">
            <img src="/Media/Frame 914.png" alt="Phone" className="phone-icon-img" />
          </div>
          <button className="close-button" onClick={onClose}>
            <span>×</span>
          </button>
        </div>

        <div className="modal-content">
          <div className="title-section">
            <h2 className="modal-title">Authorize Transaction</h2>
            <div className="progress-indicator">
              <img src="/Media/Group 204.png" alt="Progress 2/2" className="progress-icon-img" />
            </div>
          </div>

          <p className="modal-description">
            Enter the 6-digit code sent to <span className="phone-number">{displayPhone}</span>
            <br />
            <span style={{ fontSize: 12, color: '#6b7280' }}>Demo: use <strong>123456</strong></span>
          </p>

          <div className="code-input-container" onPaste={handlePaste}>
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className="code-input"
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
              />
            ))}
          </div>
          {error && <div style={{ color: '#dc2626', marginTop: 12 }}>{error}</div>}

          <div className="modal-actions">
            <button className="action-button previous" onClick={onPrevious}>
              Previous
            </button>
            <button className="action-button topup" onClick={handleTopUp} disabled={saving}>
              {saving ? 'Processing...' : 'Top Up'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAuthorize;
