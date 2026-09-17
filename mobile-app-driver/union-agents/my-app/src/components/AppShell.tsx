import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import './Dashboard.css';

interface Props {
  title: string;
  children: React.ReactNode;
}

const AppShell: React.FC<Props> = ({ title, children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeView = location.pathname.replace(/^\//, '') || 'dashboard';

  return (
    <div className="dashboard">
      <Sidebar activeView={activeView} onNavigate={(view) => navigate(`/${view}`)} />
      <main className="main-content">
        <div className="top-header">
          <div className="header-left">
            <h1 className="main-title">{title}</h1>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
};

export default AppShell;
