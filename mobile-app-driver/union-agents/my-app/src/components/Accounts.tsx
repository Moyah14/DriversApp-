import React, { useEffect, useState } from 'react';
import './Accounts.css';
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';
import groupAvatar from '../Media/user-group-03 (1).png';
import filterIcon from '../Media/Edit.png';
import downloadIcon from '../Media/download-04.png';
import imgLogo from '../Media/Group 921.png';
import search from '../Media/search-02.png';
import { api } from '../api/client';


interface Account {
  id: string;
  name: string;
  phoneNumber: string;
  residentialAddress: string;
  nin: string;
  driversLicense: string;
}

const Accounts: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'drivers'>('drivers');
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    api('/api/v1/users?role=DRIVER')
      .then((rows) =>
        setAccounts(
          (rows || []).map((u: any) => ({
            id: String(u.id),
            name: u.full_name || u.name || '—',
            phoneNumber: u.phone || '—',
            residentialAddress: u.address || '—',
            nin: u.nin || '—',
            driversLicense: u.license_ref || '—',
          }))
        )
      )
      .catch(() => setAccounts([]));
  }, []);

  const filteredAccounts = accounts.filter(account =>
    account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.phoneNumber.includes(searchTerm) ||
    account.nin.includes(searchTerm)
  );

  const accountsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filteredAccounts.length / accountsPerPage) || 1);
  const startIndex = (currentPage - 1) * accountsPerPage;
  const endIndex = startIndex + accountsPerPage;
  const currentAccounts = filteredAccounts.slice(startIndex, endIndex);

  const handleRowClick = (account: Account) => {
    setSelectedAccount(account);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAccount(null);
  };


  return (
    <div className={`accounts-manager${darkMode ? ' dark' : ''}`}>
      <Sidebar activeView={'accounts'} onNavigate={(view: string) => navigate(`/${view}`)} />
      <main className="accounts-main-wrapper">
        <div className="header">
          <h1 className="header-title">Accounts</h1>
          <div className="header-right">
            <button className="theme-toggle" onClick={() => setDarkMode(dm => !dm)}>
              {darkMode ? '☀️' : '🌙'}
                </button>
            <div className="notifications">
              <span className="notification-icon">🔔</span>
              <div className="notification-dot"></div>
            </div>
            <div className="profile">
              <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="avatar" style={{ width: 40, height: 40, borderRadius: '50%' }} />
              <div className="profile-info">
                <div className="profile-name">Ibrahim Musa</div>
                <div className="profile-email">ibrahim.Musa@gmail.com</div>
              </div>
            </div>
          </div>
        </div>

        {/* Accounts Content */}
        <div className="accounts-main-content">
          {/* Controls Row: Tabs + Filter + Download */}
          <div className="accounts-controls-section">
            <div className="accounts-tab-navigation">
              <button 
                className={`accounts-tab-btn ${activeTab === 'drivers' ? 'accounts-tab-active' : ''}`}
                onClick={() => setActiveTab('drivers')}
              >
                Drivers
              </button>
            </div>
            <div className="accounts-action-buttons">
              <button className="accounts-filter-button">
                <span className="accounts-filter-icon"><img src={filterIcon} alt="" /></span>
                Filter
              </button>
              <button className="accounts-download-button">
                <span className="accounts-download-icon"><img src={downloadIcon} alt="" /></span>
                Download Report
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="accounts-stats-grid">
            <div className="accounts-stat-card">
              <div className="accounts-stat-content">
                <div className="accounts-stat-header">
                  <div className="accounts-stat-label">All Accounts</div>
                  <div className="accounts-stat-icon">
                    <img src={groupAvatar} alt="All Accounts" />
                  </div>
                </div>
                <div className="accounts-stat-number">15,678</div>
              </div>
              <div className="accounts-stat-decoration"></div>
            </div>
            <div className="accounts-stat-card">
              <div className="accounts-stat-content">
                <div className="accounts-stat-header">
                  <div className="accounts-stat-label">Active Accounts</div>
                  <div className="accounts-stat-icon">
                    <img src={groupAvatar} alt="Active Accounts" />
                  </div>
                </div>
                <div className="accounts-stat-number">12,678</div>
              </div>
              <div className="accounts-stat-decoration"></div>
            </div>
            <div className="accounts-stat-card">
              <div className="accounts-stat-content">
                <div className="accounts-stat-header">
                  <div className="accounts-stat-label">Suspended Accounts</div>
                  <div className="accounts-stat-icon">
                    <img src={groupAvatar} alt="Suspended Accounts" />
                  </div>
                </div>
                <div className="accounts-stat-number">2,678</div>
              </div>
              <div className="accounts-stat-decoration"></div>
            </div>
            <div className="accounts-stat-card">
              <div className="accounts-stat-content">
                <div className="accounts-stat-header">
                  <div className="accounts-stat-label">Deleted Accounts</div>
                  <div className="accounts-stat-icon">
                    <img src={groupAvatar} alt="Deleted Accounts" />
                  </div>
                </div>
                <div className="accounts-stat-number">1,232</div>
              </div>
              <div className="accounts-stat-decoration"></div>
            </div>
          </div>

          {/* Recently Added Accounts */}
          <div className="accounts-data-section">
            <div className="accounts-table-header">
              <h3>Recently Added Accounts</h3>
              <div className="accounts-table-controls">
                <div className="accounts-table-filter">
                  <img src={filterIcon} alt="filter" />
                </div>
              <div className="accounts-table-search">
                  <span className="accounts-search-icon1"> <img src={  search} alt="" /></span>
                <input 
                    style={{ border: 'none' }}
                  type="text" 
                    placeholder={` Search...`} 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                </div>
              </div>
            </div>
            
            <div className="accounts-table-wrapper">
              <table className="accounts-data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone Number</th>
                    <th>Residential Address</th>
                    <th>NIN</th>
                    <th>Drivers License</th>
                  </tr>
                </thead>
                <tbody>
                  {currentAccounts.map((account) => (
                    <tr
                      key={account.id}
                      onClick={() => {
                        setSelectedAccount(account);
                        setIsModalOpen(true);
                      }}
                      style={{ cursor: 'pointer' }}
                      className="accounts-table-row-clickable"
                    >
                      <td style={{ fontWeight: '600' }}>{account.name}</td>
                      <td>{account.phoneNumber}</td>
                      <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{account.residentialAddress}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '13px' }}>{account.nin}</td>
                      <td>
                        <div className="accounts-license-cell">
                          <img src={imgLogo} alt="license" className="accounts-license-icon" />
                          <span style={{ fontSize: '13px' }}>{account.driversLicense}</span>
                          <button className="accounts-more-options" onClick={e => e.stopPropagation()}>⋮</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="accounts-pagination">
              <button 
                className="accounts-pagination-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              >
                ←
              </button>
              
              {Array.from({ length: Math.min(15, totalPages) }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`accounts-pagination-btn ${page === currentPage ? 'accounts-pagination-active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
              
              {totalPages > 15 && (
                <>
                  <span className="accounts-pagination-ellipsis">...</span>
                  {[58, 59, 60].map(page => (
                    <button
                      key={page}
                      className={`accounts-pagination-btn ${page === currentPage ? 'accounts-pagination-active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                </>
              )}
              
              <button 
                className="accounts-pagination-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              >
                →
              </button>
              
              <div className="accounts-pagination-goto">
                <span>Go to page:</span>
                <select 
                  value={currentPage} 
                  onChange={(e) => setCurrentPage(Number(e.target.value))}
                >
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <option key={page} value={page}>{page}</option>
                  ))}
                </select>
                <button className="accounts-goto-button">Go</button>
              </div>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
};

export default Accounts;