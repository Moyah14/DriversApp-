import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardSidebar.css';
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

interface DashboardSidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ activeView, onNavigate }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearSession();
    navigate('/login');
  };

  return (
    <aside className="dashboard-sidebar">
      <div className="dashboard-sidebar-header">
        <div className="dashboard-logo">
          <img src={logoImg} className="dashboard-sidebar-logo-img" alt="Logo" />
        </div>
      </div>
      <div className="dashboard-search-container">
        <div className="dashboard-search-box">
          <span className="dashboard-search-icon"><img src={search} alt="" /></span>
          <input type="text" placeholder="Search..." />
        </div>
      </div>
      <nav className="dashboard-sidebar-nav">
        <button
          className={`dashboard-nav-item${activeView === 'dashboard' ? ' active' : ''}`}
          onClick={() => onNavigate('dashboard')}
        >
          <span className="dashboard-nav-icon"><img src={dashboard} alt="" /></span>
          <span className="dashboard-nav-label">Dashboard</span>
        </button>
        <button
          className={`dashboard-nav-item${activeView === 'accounts' ? ' active' : ''}`}
          onClick={() => onNavigate('accounts')}
        >
          <span className="dashboard-nav-icon"><img src={accounts} alt="" /></span>
          <span className="dashboard-nav-label">Accounts</span>
        </button>
        <button
          className={`dashboard-nav-item${activeView === 'payments' ? ' active' : ''}`}
          onClick={() => onNavigate('payments')}
        >
          <span className="dashboard-nav-icon"><img src={payments} alt="" /></span>
          <span className="dashboard-nav-label">Payments</span>
        </button>
        <button
          className={`dashboard-nav-item${activeView === 'routes' ? ' active' : ''}`}
          onClick={() => onNavigate('routes')}
        >
          <span className="dashboard-nav-icon"><img src={routes} alt="" /></span>
          <span className="dashboard-nav-label">Routes</span>
        </button>
        <button
          className={`dashboard-nav-item${activeView === 'analytics' ? ' active' : ''}`}
          onClick={() => onNavigate('analytics')}
        >
          <span className="dashboard-nav-icon"><img src={analytics} alt="" /></span>
          <span className="dashboard-nav-label">Analytics</span>
        </button>
        <button
          className={`dashboard-nav-item${activeView === 'settings' ? ' active' : ''}`}
          onClick={() => onNavigate('settings')}
        >
          <span className="dashboard-nav-icon"><img src={settings} alt="" /></span>
          <span className="dashboard-nav-label">Settings</span>
        </button>
      </nav>
      <div className="dashboard-sidebar-footer">
        <button className="dashboard-logout-btn" onClick={handleLogout}>
          <span className="dashboard-logout-icon"><img src={logout} alt="" /></span>
          <span className="dashboard-logout-text">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
