import React from 'react';
import notification from '../media/Notification bell.png';
import ThemeSwitch from '../ThemeSwitch';
import './header.css';

interface HeaderProps {
  title: string;
  rightContent?: React.ReactNode;
  darkMode?: boolean;
  onToggleTheme?: () => void;
  showThemeSwitch?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  rightContent, 
  darkMode = false, 
  onToggleTheme, 
  showThemeSwitch = false 
}) => (
  <header className={`header1${darkMode ? ' dark' : ''}`}>
    <div className="header-left">
      <h1 className="header-title">{title}</h1>
    </div>
    <div className="header-right">
      {showThemeSwitch && onToggleTheme && (
        <ThemeSwitch 
          isDarkMode={darkMode} 
          onToggle={onToggleTheme} 
        />
      )}
      <div className="notifications">
        <span className="notification-icon">
          <img src={notification} alt="notification" />
        </span>
      </div>
      {rightContent}
    </div>
  </header>
);

export default Header;
