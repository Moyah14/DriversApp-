import React from 'react';
import './TransactionDetailsModal.css';
import transactionIcon from '../media/Group 99.png';
import backButton from '../media/backButton.png';

interface TransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: {
    id: string;
    name: string;
    email: string;
    idNo: string;
    type: string;
    status: 'Success' | 'Failed' | 'Pending';
    amount: string;
    date: string;
  } | null;
}

const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({ isOpen, onClose, transaction }) => {
  if (!isOpen || !transaction) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success':
        return '#22c55e';
      case 'Failed':
        return '#ef4444';
      case 'Pending':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="txn-details-overlay" onClick={onClose}>
      <div className="txn-details-panel" onClick={(e) => e.stopPropagation()}>
        <div className="txn-panel-header">
          <button className="txn-close-button" onClick={onClose}>
            <span> <img className='back-button' src={backButton} alt="backButton" /></span>
          </button>
          <h2 className="txn-panel-title">Transaction Details</h2>
        </div>
        
        <div className="txn-panel-body">
          <div className="txn-icon-container">
            <img src={transactionIcon} alt="transaction" />
          </div>
          
          <div className="txn-amount-display">
            {transaction.amount}
          </div>
          
          <div className="txn-status-indicator">
            <div 
              className="txn-status-dot" 
              style={{ backgroundColor: getStatusColor(transaction.status) }}
            ></div>
            <span className="txn-status-label">{transaction.status}</span>
          </div>
          
          <div className="txn-info-section">
            <div className="txn-info-item">
              <span className="txn-info-key">Transaction Type:</span>
              <span className="txn-info-value">{transaction.type}</span>
            </div>
            <div className="txn-info-item">
              <span className="txn-info-key">Date:</span>
              <span className="txn-info-value">{transaction.date}</span>
            </div>
            <div className="txn-info-item">
              <span className="txn-info-key">Transaction ID:</span>
              <span className="txn-info-value">{transaction.id}</span>
            </div>
          </div>
          
          <button className="txn-download-button">
            Download Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailsModal; 