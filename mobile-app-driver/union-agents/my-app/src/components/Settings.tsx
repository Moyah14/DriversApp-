import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import {
  FiSun,
  FiMoon,
} from "react-icons/fi";
import "./Settings.css";
import { api } from "../api/client";

// Import images
import plateauLogo from "../Media/image0 (1) 2.png";
import profileImage from "../Media/image0 (1) 2.png";
import editIcon from "../Media/Edit.png";
import dashboardIcon from "../Media/dashboard-square-01.png";
import accountsIcon from "../Media/user-group-03.png";
import paymentsIcon from "../Media/money-bag-02.png";
import routesIcon from "../Media/road.png";
import analyticsIcon from "../Media/analytics-02.png";
import settingsIcon from "../Media/settings-01.png";
import logoutIcon from "../Media/logout-01.png";
import searchIcon from "../Media/search-02.png";
import searchButtonIcon from "../Media/search-02.png";
import notificationBell from "../Media/Notification bell.png";

const MoonIcon = FiMoon as unknown as React.ComponentType<{ size?: number }>;
const SunIcon = FiSun as unknown as React.ComponentType<{ size?: number }>;

const sidebarIcons = [
  { icon: dashboardIcon, label: "Dashboard", route: "/dashboard" },
  { icon: accountsIcon, label: "Accounts", route: "/accounts" },
  { icon: paymentsIcon, label: "Payments", route: "/payments" },
  { icon: routesIcon, label: "Routes", route: "/routes" },
  { icon: analyticsIcon, label: "Analytics", route: "/analytics" },
];

const sectionTabs = [
  "My Profile",
  "Security",
  "Notifications",
  "Customer Support",
  "Delete Account",
];

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState("My Profile");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    fullName: "Ibrahim Musa",
    email: "Ibrahim.4Musa@gmail.com",
    phone: "",
    role: "Admin",
    address: "Plateau, Nigeria",
  });
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [passwordMsg, setPasswordMsg] = useState("");

  useEffect(() => {
    api("/api/v1/auth/me")
      .then((u: any) => {
        setProfile({
          fullName: u.full_name || u.name || "—",
          email: u.email || "—",
          phone: u.phone || "—",
          role: u.role || "Admin",
          address: u.address || "Plateau, Nigeria",
        });
      })
      .catch(() => {});
  }, []);

  const toggleTheme = () => setIsDarkMode((d) => !d);

  const handleNavigation = (route: string) => {
    navigate(route);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.current || !passwordForm.next) {
      setPasswordMsg("All fields are required.");
      return;
    }
    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordMsg("New passwords do not match.");
      return;
    }
    try {
      await api("/api/v1/users/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: passwordForm.current,
          newPassword: passwordForm.next,
        }),
      });
      setPasswordMsg("Password updated!");
      setPasswordForm({ current: "", next: "", confirm: "" });
    } catch (err: any) {
      setPasswordMsg(err.message || "Failed to update password");
    }
  };

  const nameParts = profile.fullName.split(" ");
  const firstName = nameParts[0] || "—";
  const lastName = nameParts.slice(1).join(" ") || "—";

  return (
    <div className="settings-wrapper-root">
      {/* Sidebar */}
      <aside className="settings-side-panel">
        <div className="settings-logo-container">
          <img src={plateauLogo} alt="Plateau State Logo" />
        </div>
        <nav className="settings-nav-icons">
          <div className="settings-icon-btn">
            <img src={searchButtonIcon} alt="Search" />
          </div>
          {sidebarIcons.map((item, idx) => (
            <div 
              className="settings-icon-btn" 
              key={idx}
              onClick={() => handleNavigation(item.route)}
              style={{ cursor: 'pointer' }}
            >
              <img src={item.icon} alt={item.label} />
            </div>
          ))}
          <div className="settings-icon-btn settings-icon-active">
            <img src={settingsIcon} alt="Settings" />
          </div>
        </nav>
        <div className="settings-logout-btn">
          <img src={logoutIcon} alt="Logout" />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="settings-main-area">
        {/* Header */}
        <header className="settings-header-bar">
          <h1 className="settings-title-text">Settings</h1>
          <div className="settings-toolbar-actions">
            <div className="settings-search-container">
              <img src={searchIcon} alt="Search" className="settings-search-img" />
              <input
                type="text"
                placeholder="Search..."
                className="settings-search-input"
              />
            </div>
            <button 
              onClick={toggleTheme}
              style={{
                padding: '6px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isDarkMode ? <MoonIcon size={18} /> : <SunIcon size={18} />}
            </button>
            <div className="settings-notification-bell">
              <img src={notificationBell} alt="Notifications" />
              <div className="settings-notify-badge"></div>
            </div>
            <div className="settings-user-profile">
              <img
                src={profileImage}
                alt="Ibrahim Musa"
                className="settings-user-avatar"
              />
              <div className="settings-user-info">
                <div className="settings-user-name">Ibrahim Musa</div>
                <div className="settings-user-email">{profile.email}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Section */}
        <div className="settings-content-area">
          {/* Section Tabs */}
          <nav className="settings-tabs-nav">
            {sectionTabs.map((tab) => (
              <button
                key={tab}
                className={`settings-tab-btn${activeTab === tab ? " settings-tab-selected" : ""}${
                  tab === "Delete Account" ? " settings-tab-danger" : ""
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </nav>

          {/* Cards */}
          <div className="settings-cards-wrapper">
            {activeTab === "Security" ? (
              <div className="settings-card-item">
                <div className="settings-card-top">
                  <h2 className="settings-card-heading">Password & Security</h2>
                </div>
                <form onSubmit={handlePasswordChange} style={{ display: "grid", gap: 12, maxWidth: 420 }}>
                  <div>
                    <div className="settings-field-label">Current Password</div>
                    <input
                      type="password"
                      className="settings-search-input"
                      value={passwordForm.current}
                      onChange={(e) => setPasswordForm((f) => ({ ...f, current: e.target.value }))}
                      style={{ width: "100%" }}
                    />
                  </div>
                  <div>
                    <div className="settings-field-label">New Password</div>
                    <input
                      type="password"
                      className="settings-search-input"
                      value={passwordForm.next}
                      onChange={(e) => setPasswordForm((f) => ({ ...f, next: e.target.value }))}
                      style={{ width: "100%" }}
                    />
                  </div>
                  <div>
                    <div className="settings-field-label">Confirm Password</div>
                    <input
                      type="password"
                      className="settings-search-input"
                      value={passwordForm.confirm}
                      onChange={(e) => setPasswordForm((f) => ({ ...f, confirm: e.target.value }))}
                      style={{ width: "100%" }}
                    />
                  </div>
                  {passwordMsg && <div style={{ color: passwordMsg.includes("updated") ? "#16a34a" : "#dc2626" }}>{passwordMsg}</div>}
                  <button type="submit" style={{ background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, padding: "10px 16px", cursor: "pointer" }}>
                    Update Password
                  </button>
                </form>
              </div>
            ) : (
            <>
            {/* My Profile Card */}
            <div className="settings-card-item">
              <div className="settings-card-top">
                <h2 className="settings-card-heading">My Profile</h2>
                <button className="settings-edit-btn">
                  <span>Edit</span>
                  <img src={editIcon} alt="Edit" className="settings-edit-img" />
                </button>
              </div>
              <div className="settings-profile-section">
                <div className="settings-profile-pic">
                  <img
                    src={profileImage}
                    alt={profile.fullName}
                    className="settings-pic-img"
                  />
                </div>
                <div className="settings-profile-details">
                  <h3 className="settings-profile-fullname">{profile.fullName}</h3>
                  <p className="settings-profile-position">{profile.role}</p>
                  <p className="settings-profile-place">{profile.address || "Plateau, Nigeria"}</p>
                </div>
              </div>
            </div>

            {/* Personal Information Card */}
            <div className="settings-card-item">
              <div className="settings-card-top">
                <h2 className="settings-card-heading">Personal Information</h2>
                <button className="settings-edit-btn">
                  <span>Edit</span>
                  <img src={editIcon} alt="Edit" className="settings-edit-img" />
                </button>
              </div>
              <div className="settings-info-grid">
                <div>
                  <div className="settings-field-label">First Name</div>
                  <div className="settings-field-text">{firstName}</div>
                </div>
                <div>
                  <div className="settings-field-label">Last Name</div>
                  <div className="settings-field-text">{lastName}</div>
                </div>
                <div>
                  <div className="settings-field-label">Email address</div>
                  <div className="settings-field-text">{profile.email}</div>
                </div>
                <div>
                  <div className="settings-field-label">Phone</div>
                  <div className="settings-field-text">{profile.phone || "—"}</div>
                </div>
                <div>
                  <div className="settings-field-label">Bio</div>
                  <div className="settings-field-text">{profile.role}</div>
                </div>
              </div>
            </div>

            {/* Address Card */}
            <div className="settings-card-item">
              <div className="settings-card-top">
                <h2 className="settings-card-heading">Address</h2>
                <button className="settings-edit-btn">
                  <span>Edit</span>
                  <img src={editIcon} alt="Edit" className="settings-edit-img" />
                </button>
              </div>
              <div className="settings-info-grid">
                <div>
                  <div className="settings-field-label">Country</div>
                  <div className="settings-field-text">Nigeria</div>
                </div>
                <div>
                  <div className="settings-field-label">City/State</div>
                  <div className="settings-field-text">Plateau, Northern Nigeria</div>
                </div>
                <div>
                  <div className="settings-field-label">Postal Code</div>
                  <div className="settings-field-text">200426</div>
                </div>
                <div>
                  <div className="settings-field-label">TAX ID</div>
                  <div className="settings-field-text">B24BASK4GY</div>
                </div>
              </div>
            </div>
            </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
