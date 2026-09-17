import React, { useEffect, useState } from 'react';
import './account.css';
import Sidebar from '../Sidebar/Sidebar';
import { useNavigate } from 'react-router-dom';
import AccountDetailsModal from './AccountDetailsModal';
import AccountAgentModal from './AccountAgentModal';
import './AccountAgentModal.css';     
import groupAvatar from '../media/user-group-03 (1).png';
import Header from '../header/header';
import filterIcon from '../media/preference-horizontal.png';
import downloadIcon from '../media/download-03.png';
import imgLogo from '../media/image-02.png';
import search from '../media/search-02.png';
import { api } from '../../api/client';


interface Account {
  id: string;
  name: string;
  phoneNumber: string;
  residentialAddress: string;
  nin: string;
  driversLicense: string;
}

const Accounts: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'drivers' | 'agents'>('drivers');
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAgentModalOpen, setAgentModalOpen] = React.useState(false);
  const [selectedAgent, setSelectedAgent] = React.useState<any | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
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

    api('/api/v1/users?role=AGENT')
      .then((rows) =>
        setAgents(
          (rows || []).map((u: any) => ({
            name: u.full_name || u.name || '—',
            phone: u.phone || '—',
            address: u.address || '—',
            email: u.email || '—',
            dateRegistered: u.created_at || '—',
            status: u.status || 'Active',
            drivers: [],
          }))
        )
      )
      .catch(() => setAgents([]));
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

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAccount(null);
  };

  return (
    <div className={`accounts-manager${darkMode ? ' dark' : ''}`}>
      <Sidebar activeView={'accounts'} onNavigate={(view) => navigate(`/${view}`)} />
      <main className="accounts-main-wrapper">
        <Header
          title="Accounts"
          darkMode={darkMode}
          onToggleTheme={() => setDarkMode(dm => !dm)}
          showThemeSwitch={true}
          rightContent={
            <div className="user-profile-section">
              <div className="user-avatar-container">
                <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="avatar" style={{ width: 40, height: 40, borderRadius: '50%' }} />
              </div>
              <div className="user-info-details">
                <span className="user-display-name">Ibrahim Musa</span>
                <span className="user-email-address">ibrahim.Musa@gmail.com</span>
              </div>
            </div>
          }
        />

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
              <button 
                className={`accounts-tab-btn ${activeTab === 'agents' ? 'accounts-tab-active' : ''}`}
                onClick={() => setActiveTab('agents')}
              >
                Agents
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
                <div className="accounts-stat-number">{accounts.length + agents.length}</div>
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
                <div className="accounts-stat-number">{accounts.length}</div>
              </div>
              <div className="accounts-stat-decoration"></div>
            </div>
            <div className="accounts-stat-card">
              <div className="accounts-stat-content">
                <div className="accounts-stat-header">
                  <div className="accounts-stat-label">Agents</div>
                  <div className="accounts-stat-icon">
                    <img src={groupAvatar} alt="Suspended Accounts" />
                  </div>
                </div>
                <div className="accounts-stat-number">{agents.length}</div>
              </div>
              <div className="accounts-stat-decoration"></div>
            </div>
            <div className="accounts-stat-card">
              <div className="accounts-stat-content">
                <div className="accounts-stat-header">
                  <div className="accounts-stat-label">Drivers</div>
                  <div className="accounts-stat-icon">
                    <img src={groupAvatar} alt="Deleted Accounts" />
                  </div>
                </div>
                <div className="accounts-stat-number">{accounts.length}</div>
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
            
            {activeTab === 'drivers' && (
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
            )}

            {activeTab === 'agents' && (
              <div className="accounts-table-wrapper">
                <table className="accounts-data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email Address</th>
                      <th>Phone Number</th>
                      <th>No of Drivers Registered</th>
                      <th>Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agents.map((agent, idx) => (
                      <tr
                        key={idx}
                        onClick={() => {
                          setSelectedAgent(agent);
                          setAgentModalOpen(true);
                        }}
                        style={{ cursor: 'pointer' }}
                        className="accounts-table-row-clickable"
                      >
                        <td style={{ fontWeight: '600' }}>{agent.name}</td>
                        <td>{agent.email}</td>
                        <td>{agent.phone}</td>
                        <td>{agent.drivers?.length || 0} Drivers</td>
                        <td>Level 1</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

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

      {/* Account Details Modal */}
      <AccountDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        account={selectedAccount}
      />

      {/* Account Agent Modal */}
      <AccountAgentModal
        isOpen={isAgentModalOpen}
        onClose={() => setAgentModalOpen(false)}
        agent={selectedAgent}
      />
    </div>
  );
};

export default Accounts;
