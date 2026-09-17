import React from 'react';
import './ThemeSwitch.css';
import darkModeIcon from '../media/darkmodelogo.png';
import LightModeIcon from '../media/lightModeLogo.png';

interface ThemeSwitchProps {
  isDarkMode: boolean;
  onToggle: () => void;
}

const ThemeSwitch: React.FC<ThemeSwitchProps> = ({ isDarkMode, onToggle }) => {
  return (
    <div className="theme-switch-container">
      <button 
        className={`theme-switch ${isDarkMode ? 'dark' : 'light'}`}
        onClick={onToggle}
        aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      >
        <div className="theme-switch-track">
          <div className="theme-switch-knob">
            <img 
              src={isDarkMode ? darkModeIcon : LightModeIcon} 
              alt={isDarkMode ? 'Dark Mode' : 'Light Mode'}
              className="theme-switch-icon"
            />
          </div>
        </div>
      </button>
    </div>
  );
};

export default ThemeSwitch;
