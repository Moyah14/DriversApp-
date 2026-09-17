import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';
import logoImg from '../media/image0 (1) 2.png';
import search from '../media/search-02.png';
import dashboard from '../media/dashboard-square-01.png';
import accounts from '../media/user-group-03.png';
import payments from '../media/money-bag-02.png';
import logout from '../media/logout-01.png';  
import routes from '../media/road.png';
import analytics from '../media/analytics-02.png';
import settings from '../media/settings-01.png';
import { clearSession } from '../../api/client';

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearSession();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <img src={logoImg} className="sidebar-logo-img" alt="Logo" />
        </div>
      </div>
      <div className="search-container">
        <div className="search-box">
          <span className="search-icon"><img src={search} alt="" /></span>
          <input type="text" placeholder="Search..." />
        </div>
      </div>
      <nav className="sidebar-nav">
        <button
          className={`nav-item${activeView === 'dashboard' ? ' active' : ''}`}
          onClick={() => onNavigate('dashboard')}
        >
          <span className="nav-icon"><img src={dashboard} alt="" /></span>
          <span className="nav-label">Dashboard</span>
        </button>
        <button
          className={`nav-item${activeView === 'accounts' ? ' active' : ''}`}
          onClick={() => onNavigate('accounts')}
        >
          <span className="nav-icon"><img src={accounts} alt="" /></span>
          <span className="nav-label">Accounts</span>
        </button>
        <button
          className={`nav-item${activeView === 'payments' ? ' active' : ''}`}
          onClick={() => onNavigate('payments')}
        >
          <span className="nav-icon"><img src={payments} alt="" /></span>
          <span className="nav-label">Payments</span>
        </button>
        <button
          className={`nav-item${activeView === 'routes' ? ' active' : ''}`}
          onClick={() => onNavigate('routes')}
        >
          <span className="nav-icon"><img src={routes} alt="" /></span>
          <span className="nav-label">Routes</span>
        </button>
        <button
          className={`nav-item${activeView === 'analytics' ? ' active' : ''}`}
          onClick={() => onNavigate('analytics')}
        >
          <span className="nav-icon"><img src={analytics} alt="" /></span>
          <span className="nav-label">Analytics</span>
        </button>
        <button
          className={`nav-item${activeView === 'settings' ? ' active' : ''}`}
          onClick={() => onNavigate('settings')}
        >
          <span className="nav-icon"><img src={settings} alt="" /></span>
          <span className="nav-label">Settings</span>
        </button>
      </nav>
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <span className="logout-icon"><img src={logout} alt="" /></span>
          <span className="logout-text">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar; 