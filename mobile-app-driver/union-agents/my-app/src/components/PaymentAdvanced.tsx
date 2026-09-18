import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import './PaymentAdvanced.css';
import donwloadButton from '../Media/download-04.png';
import searchButton from '../Media/search-02.png';
import notificationButton from '../Media/Notification bell.png';
import transactionButton from '../Media/Group 921.png';
import profilePicture from '../Media/Profile Image.png'
import { api } from '../api/client';
import { mapPaymentRow } from '../utils/apiMappers';
import TransactionDetail from './TransactionDetail';

interface Transaction {
  id: string;
  name: string;
  email: string;
  idNo: string;
  type: string;
  status: 'Success' | 'Failed' | 'Pending';
  amount: string;
  date: string;
}

const Payments: React.FC = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('payments');
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    api('/api/v1/payments')
      .then((rows) => setTransactions((rows || []).map(mapPaymentRow)))
      .catch(() => setTransactions([]));
  }, []);

  const handleNavigate = (view: string) => {
    setActiveView(view);
    if (view === 'dashboard') {
      navigate('/dashboard');
    } else if (view === 'accounts') {
      navigate('/accounts');
    } else if (view === 'payments') {
      navigate('/payments');
    } else if (view === 'routes') {
      navigate('/routes');
    }
  };

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
    <div className="payments-page-wrapper">
      <Sidebar activeView={activeView} onNavigate={handleNavigate} />
      <main className="payments-content-wrapper">
        {/* Header */}
        <div className="payments-header-section">
          <div className="payments-header-left">
            <h1 className="payments-page-title">Payments</h1>
            <p className="payments-page-subtitle">An overview of all payments made</p>
          </div>
          <div className="payments-header-right">
            <button className="payments-header-icon">
              <img src={donwloadButton} alt="download" />
            </button>
            <button className="payments-header-icon">
              <img src={searchButton} alt="message" />
            </button>
            <button className="payments-header-icon">
              <img src={notificationButton} alt="notifications" />
            </button>
            <div className="payments-profile-container">
              <img src={profilePicture} alt="profile" className="payments-profile-avatar" />
              
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="payments-search-filter-row">
          <div className="payments-search-container">
            <img src={require('../Media/search-02.png')} alt="search" className="payments-search-icon" />
            <input
              type="text"
              className="payments-search-input"
              placeholder="Search payments id, user"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <button className="payments-filter-button">
            <img src={require('../Media/Edit.png')} alt="filter" className="payments-filter-icon" />
            <span className="payments-filter-text">Filter</span>
          </button>
        </div>

        {/* Recent Transactions Header with Tabs */}
        <div className="payments-transactions-header">
          <h2 className="payments-transactions-title">Recent Transactions</h2>
          <div className="payments-transaction-filters">
            <button 
              className={`payments-filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All (#12400)
            </button>
            <button 
              className={`payments-filter-tab ${activeFilter === 'card' ? 'active' : ''}`}
              onClick={() => setActiveFilter('card')}
            >
              Card (#4000)
            </button>
            <button 
              className={`payments-filter-tab ${activeFilter === 'transfer' ? 'active' : ''}`}
              onClick={() => setActiveFilter('transfer')}
            >
              Transfer (#3000)
            </button>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="payments-transactions-section">
          
          <div className="payments-transactions-table">
            <div className="payments-table-header">
              <div className="payments-header-cell">NAME</div>
              <div className="payments-header-cell">EMAIL ADDRESS</div>
              <div className="payments-header-cell">ID NO</div>
              <div className="payments-header-cell">TYPE</div>
              <div className="payments-header-cell">STATUS</div>
              <div className="payments-header-cell">AMOUNT</div>
              <div className="payments-header-cell">DATE</div>
              <div className="payments-header-cell"></div>
            </div>
            
            <div className="payments-table-body">
              {transactions.map((transaction) => (
                <div 
                  key={transaction.id} 
                  className="payments-table-row"
                  onMouseEnter={() => setHoveredRow(transaction.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <div className="payments-table-cell">
                    <input type="checkbox" className="payments-checkbox" />
                    <span className="payments-name-text">{transaction.name}</span>
                  </div>
                  <div className="payments-table-cell">{transaction.email}</div>
                  <div className="payments-table-cell">{transaction.idNo}</div>
                  <div className="payments-table-cell">{transaction.type}</div>
                  <div className="payments-table-cell payments-status-cell">
                    <div 
                      className="payments-status-dot" 
                      style={{ backgroundColor: getStatusColor(transaction.status) }}
                    ></div>
                    <span className="payments-status-text">{transaction.status}</span>
                  </div>
                  <div className="payments-table-cell payments-amount-cell">{transaction.amount}</div>
                  <div className="payments-table-cell">{transaction.date}</div>
                  <div className="payments-table-cell payments-action-cell">
                    <button className="payments-action-menu">
                      <span className="payments-menu-dots">⋮</span>
                    </button>
                  </div>
                  {hoveredRow === transaction.id && (
                    <div className="payments-view-transaction-popup">
                      <button 
                        className="payments-view-transaction-btn"
                        onClick={() => {
                          setSelectedTransaction(transaction);
                          setIsModalOpen(true);
                        }}
                      >
                        <img src={transactionButton} alt="view" />
                        View Transaction
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pagination */}
        <div className="payments-pagination-container">
          <div className="payments-pagination-info">
            Showing 1-11 of 120 entries
          </div>
          <div className="payments-pagination-controls">
            <button className="payments-pagination-btn payments-prev-btn">Previous</button>
            <button className="payments-pagination-btn payments-page-btn active">1</button>
            <button className="payments-pagination-btn payments-page-btn">2</button>
            <button className="payments-pagination-btn payments-page-btn">3</button>
            <button className="payments-pagination-btn payments-page-btn">4</button>
            <button className="payments-pagination-btn payments-page-btn">5</button>
            <button className="payments-pagination-btn payments-page-btn">6</button>
            <button className="payments-pagination-btn payments-next-btn">Next</button>
          </div>
        </div>
      </main>
      <TransactionDetail
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTransaction(null);
        }}
        transaction={selectedTransaction || undefined}
      />
    </div>
  );
};

export default Payments;