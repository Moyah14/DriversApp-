import React, { useState, useEffect } from "react";
import NotificationDropdown from "./NotificationDropdown";

interface TopbarProps {
  pageTitle?: string;
}

const Topbar: React.FC<TopbarProps> = ({ pageTitle = "Super Admin" }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  // For badge: count unread in mockNotifications
  const mockNotifications = [
    { unread: true }, { unread: true }, { unread: false }, { unread: false }
  ];
  const unreadCount = mockNotifications.filter(n => n.unread).length;

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(savedDarkMode);
    applyDarkMode(savedDarkMode);
  }, []);

  const applyDarkMode = (darkMode: boolean) => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    applyDarkMode(newDarkMode);
  };

  return (
    <header style={{
      height: 70,
      background: "#fff",
      borderBottom: "1px solid #eee",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 2rem",
      position: "sticky",
      top: 0,
      zIndex: 10
    }}>
      {/* Left side - Dashboard title */}
      <div>
        <h1 style={{ 
          margin: 0, 
          fontSize: "24px", 
          fontWeight: "600",
          color: "#222"
        }}>
          {pageTitle}
        </h1>
      </div>

      {/* Right side - Theme toggle, notifications, profile */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "20px" 
      }}>
        {/* Theme toggle */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          background: "#f5f5f5",
          borderRadius: "20px",
          overflow: "hidden"
        }}>
          <button
            onClick={toggleTheme}
            style={{
              background: isDarkMode ? "transparent" : "#16a34a",
              color: isDarkMode ? "#666" : "#fff",
              border: "none",
              padding: "8px 12px",
              cursor: "pointer",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
              borderRadius: "16px"
            }}
          >
            <img src="/sun-01.png" alt="Light Mode" style={{ width: "20px", height: "20px" }} />
          </button>
          <button
            onClick={toggleTheme}
            style={{
              background: isDarkMode ? "#16a34a" : "transparent",
              color: isDarkMode ? "#fff" : "#666",
              border: "none",
              padding: "8px 12px",
              cursor: "pointer",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
              borderRadius: "16px"
            }}
          >
            <img src="/moon-02.png" alt="Dark Mode" style={{ width: "20px", height: "20px" }} />
          </button>
        </div>

        {/* Notification bell */}
        <div style={{ position: "relative" }}>
          <button
            style={{
              background: "#f5f5f5",
              border: "none",
              fontSize: "18px",
              cursor: "pointer",
              padding: "12px",
              borderRadius: "50%",
              color: "#666",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "40px",
              height: "40px"
            }}
            onClick={() => setShowNotifications((v) => !v)}
            aria-label="Notifications"
          >
            <img src="/notification-01 (1).png" alt="Notifications" style={{ width: "20px", height: "20px" }} />
          </button>
          {showNotifications && (
            <NotificationDropdown onClose={() => setShowNotifications(false)} />
          )}
        </div>

        {/* Vertical separator line */}
        <div style={{ 
          width: "1px", 
          height: "32px", 
          background: "#e5e7eb" 
        }} />

        {/* User profile */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "12px" 
        }}>
          <img
            src="https://randomuser.me/api/portraits/men/32.jpg"
            alt="Profile"
            style={{ 
              width: 40, 
              height: 40, 
              borderRadius: "50%",
              border: "none"
            }}
          />
          <div style={{ textAlign: "left" }}>
            <div style={{ 
              fontSize: "14px", 
              fontWeight: "600", 
              color: "#222",
              margin: 0,
              lineHeight: "1.2"
            }}>
              Super Admin
            </div>
            <div style={{ 
              fontSize: "12px", 
              color: "#666",
              margin: 0,
              lineHeight: "1.2"
            }}>
              superadmin@gmail.com
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;