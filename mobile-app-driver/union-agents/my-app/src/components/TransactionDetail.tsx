import React from "react";
import "./TransactionDetail.css";
import { FiArrowLeft, FiDownload } from "react-icons/fi";
const BackIcon = FiArrowLeft as unknown as React.ComponentType;
const DownloadIcon = FiDownload as unknown as React.ComponentType<{ style?: React.CSSProperties }>;

interface TransactionDetailProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: {
    name: string;
    email: string;
    id: string;
    type: string;
    status: string;
    amount: string;
    date: string;
  };
}

const TransactionDetail: React.FC<TransactionDetailProps> = ({ 
  isOpen, 
  onClose, 
  transaction 
}) => {
  if (!isOpen) return null;
  return (
    <div className="transaction-detail-overlay">
      <div className="transaction-detail-drawer">
        <button className="td-back-btn" onClick={onClose}>
          <BackIcon />
        </button>
        <h2 className="td-title">Transaction Details</h2>
        <div className="td-center">
          <div className="td-icon-circle">
            {/* You can use an SVG or icon here */}
            <svg width="48" height="48" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="24" fill="#e6f9ed" />
              <path d="M16 20h16v8a2 2 0 0 1-2 2H18a2 2 0 0 1-2-2v-8z" fill="#219150"/>
              <rect x="16" y="16" width="16" height="6" rx="2" fill="#fff" stroke="#219150" strokeWidth="2"/>
              <circle cx="20" cy="19" r="1" fill="#219150"/>
            </svg>
          </div>
          <div className="td-amount">{transaction?.amount || '₦25,000'}</div>
          <div className={`td-status ${transaction?.status === 'Success' ? 'td-success' : transaction?.status === 'Pending' ? 'td-pending' : 'td-failed'}`}>
            ● {transaction?.status || 'Success'}
          </div>
        </div>
        <hr className="td-divider" />
        <div className="td-info-row">
          <span>Recipient Name</span>
          <span className="td-info-bold">{transaction?.name || 'N/A'}</span>
        </div>
        <div className="td-info-row">
          <span>Email Address</span>
          <span className="td-info-bold">{transaction?.email || 'N/A'}</span>
        </div>
        <div className="td-info-row">
          <span>Transaction Type</span>
          <span className="td-info-bold">{transaction?.type || 'Transfer'}</span>
        </div>
        <div className="td-info-row">
          <span>Date</span>
          <span className="td-info-bold">{transaction?.date || '7-Jan-2025 5:30PM'}</span>
        </div>
        <div className="td-info-row">
          <span>Transaction ID</span>
          <span className="td-info-bold">{transaction?.id || '36758904'}</span>
        </div>
        <button className="td-download-btn">
          <DownloadIcon style={{ marginRight: 8 }} />
          Download Receipt
        </button>
      </div>
    </div>
  );
};

export default TransactionDetail;
