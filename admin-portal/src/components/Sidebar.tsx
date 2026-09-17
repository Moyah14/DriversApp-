import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import searchIcon from "../pages/Dashboard Icons/search.png";
import LogoutModal from "./LogoutModal";

export const SIDEBAR_WIDTH = 220;
export const SIDEBAR_COLLAPSED_WIDTH = 72;

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: "/icons/dashboard-square-01.png" },
  { label: "Tenants", path: "/tenants", icon: "/icons/user-group-03.png" },
  { label: "Accounts", path: "/accounts", icon: "/icons/user-group-03.png" },
  { label: "Payments", path: "/payments", icon: "/icons/money-bag-02.png" },
  { label: "Parks", path: "/parks", icon: "/icons/car-parking-01.png" },
  { label: "Routes", path: "/routes", icon: "/icons/road.png" },
  { label: "Audit Logs", path: "/audit", icon: "/icons/analytics-02.png" },
  { label: "Customer Support", path: "/support", icon: "/icons/customer-service-02.png" },
  { label: "Analytics", path: "/analytics", icon: "/icons/analytics-02.png" },
  { label: "Settings", path: "/settings", icon: "/icons/settings-01.png" },
];

interface SidebarProps {
  collapsed: boolean;
  hovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onSearchOpen?: () => void;
  searchValue: string;
  setSearchValue: (v: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, hovered, onMouseEnter, onMouseLeave, onSearchOpen, searchValue, setSearchValue }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem("superadmin_signed_in");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // Sidebar is collapsed only if collapsed && !hovered
  const isCollapsed = collapsed && !hovered;

  return (
    <aside
      style={{
        width: isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
        background: "#fafbfc",
        minHeight: "100vh",
        padding: isCollapsed ? "2rem 0.5rem 1rem 0.5rem" : "2rem 1rem 1rem 1rem",
        borderRight: "1px solid #eee",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        transition: "width 0.25s cubic-bezier(.4,0,.2,1)",
        zIndex: 100,
        alignItems: "center"
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Government Logo - always visible, centered */}
      <div style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", marginBottom: 32 }}>
        <img src="/logo192.png" alt="Logo" style={{ width: 48, height: 48, borderRadius: "50%" }} />
      </div>
      {/* Search Bar/Icon */}
      <div style={{ width: "70%", marginBottom: 24, padding: "0 1rem", boxSizing: "border-box", display: "flex", justifyContent: "center", alignItems: "center" }}>
        {isCollapsed ? (
          <button
            style={{
              background: "#f3f4f6",
              border: "none",
              borderRadius: "50%",
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              padding: 0
            }}
            aria-label="Search"
            onClick={onSearchOpen}
          >
            <img src={searchIcon} alt="Search" style={{ width: 20, height: 20 }} />
          </button>
        ) : (
          <div style={{ position: "relative", width: "100%" }}>
            <input
              type="text"
              placeholder="Search..."
              style={{
                width: "100%",
                padding: "12px 14px 12px 42px",
                border: "1px solid #eee",
                borderRadius: 8,
                fontSize: 16,
                background: "#fff"
              }}
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              onFocus={onSearchOpen}
            />
            <img
              src={searchIcon}
              alt="Search"
              style={{
                position: "absolute",
                left: 15,
                top: "50%",
                transform: "translateY(-50%)",
                width: 22,
                height: 22,
                opacity: 0.7
              }}
            />
          </div>
        )}
      </div>
      <nav style={{ flex: 1, width: "100%" }}>
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              display: "flex",
              alignItems: "center",
              gap: isCollapsed ? 0 : 14,
              justifyContent: isCollapsed ? "center" : "flex-start",
              padding: "0.75rem 1rem",
              marginBottom: 8,
              borderRadius: 8,
              textDecoration: "none",
              color: location.pathname === item.path ? "#fff" : "#222",
              background: location.pathname === item.path ? "#16a34a" : "transparent",
              fontWeight: location.pathname === item.path ? 600 : 400,
              transition: "background 0.2s, color 0.2s",
            }}
          >
            <img src={item.icon} alt={item.label + " icon"} style={{ width: 22, height: 22, objectFit: "contain", filter: location.pathname === item.path ? "brightness(0) invert(1)" : "none" }} />
            {!isCollapsed && item.label}
          </Link>
        ))}
        <button 
          onClick={handleLogout}
          style={{
            width: "100%",
            background: "none",
            border: "none",
            color: "#888",
            cursor: "pointer",
            textAlign: isCollapsed ? "center" : "left",
            padding: "0.75rem 1rem",
            display: "flex",
            alignItems: "center",
            gap: isCollapsed ? 0 : 8,
            borderRadius: "8px",
            fontSize: "14px",
            marginTop: 70
          }}
        >
          <img src="/icons/logout-01.png" alt="Logout icon" style={{ width: 20, height: 20, objectFit: "contain", margin: isCollapsed ? "0 auto" : undefined }} />
          {!isCollapsed && "Logout"}
        </button>
      </nav>
      <LogoutModal
        isOpen={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
      />
    </aside>
  );
};

export default Sidebar;