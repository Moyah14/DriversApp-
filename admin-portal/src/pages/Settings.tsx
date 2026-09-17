import React, { useState, useEffect } from "react";
import Sidebar, { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from "../components/Sidebar";
import Topbar from "../components/Topbar";
import LogoutModal from "../components/LogoutModal";
import { useNavigate } from "react-router-dom";
import { api, clearSession } from "../api/client";

const TABS = [
  { key: "profile", label: "Profile Settings", icon: "/user-03 (1).png" },
  { key: "notifications", label: "Notifications", icon: "/notification-01.png" },
  { key: "security", label: "Password & Security", icon: "/security-lock.png" },
  { key: "logout", label: "Logout", icon: "/logout-01 (1).png" },
];

const initialProfile = {
  name: "Super Admin",
  email: "superadmin@gmail.com",
  phone: "",
  location: "",
  photo: "https://randomuser.me/api/portraits/men/32.jpg",
};

const initialNotifications = {
  accounts: true,
  payments: true,
  routes: true,
  support: true,
};

type SettingsProps = {
  searchModalOpen: boolean;
  setSearchModalOpen: (open: boolean) => void;
  searchValue: string;
  setSearchValue: (v: string) => void;
};

const Settings: React.FC<SettingsProps> = ({ searchModalOpen, setSearchModalOpen, searchValue, setSearchValue }) => {
  const [activeTab, setActiveTab] = useState("profile");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [previousTab, setPreviousTab] = useState("profile");
  const [profile, setProfile] = useState(initialProfile);
  const [profileEdit, setProfileEdit] = useState(false);
  const [profileDraft, setProfileDraft] = useState(profile);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [notifEdit, setNotifEdit] = useState(false);
  const [notifDraft, setNotifDraft] = useState(notifications);
  const [notifMsg, setNotifMsg] = useState<string | null>(null);
  const [securityEdit, setSecurityEdit] = useState(false);
  const [securityDraft, setSecurityDraft] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [securityMsg, setSecurityMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setSidebarCollapsed(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    api("/api/v1/auth/me")
      .then((u: any) => {
        const next = {
          name: u.full_name || u.name || initialProfile.name,
          email: u.email || initialProfile.email,
          phone: u.phone || "",
          location: u.address || u.location || "",
          photo: initialProfile.photo,
        };
        setProfile(next);
        setProfileDraft(next);
      })
      .catch(() => {});
  }, []);

  const isCollapsed = sidebarCollapsed && !sidebarHovered;

  // Profile photo change
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setProfileDraft({ ...profileDraft, photo: ev.target?.result as string });
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // Profile update
  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(profileDraft);
    setProfileEdit(false);
    setProfileMsg("Profile updated!");
    setTimeout(() => setProfileMsg(null), 2000);
  };
  const profileChanged = profile.phone !== profileDraft.phone || profile.location !== profileDraft.location || profile.photo !== profileDraft.photo;
  const profileValid = profileDraft.phone.trim() !== "" && profileDraft.location.trim() !== "";

  // Notifications update
  const handleNotifUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setNotifications(notifDraft);
    setNotifEdit(false);
    setNotifMsg("Notification settings updated!");
    setTimeout(() => setNotifMsg(null), 2000);
  };
  const notifChanged = JSON.stringify(notifications) !== JSON.stringify(notifDraft);

  // Security update
  const handleSecurityUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!securityDraft.current || !securityDraft.new || !securityDraft.confirm) {
      setSecurityMsg("All fields are required.");
      return;
    }
    if (securityDraft.new !== securityDraft.confirm) {
      setSecurityMsg("New passwords do not match.");
      return;
    }
    try {
      await api("/api/v1/users/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: securityDraft.current,
          newPassword: securityDraft.new,
        }),
      });
      setSecurityEdit(false);
      setSecurityDraft({ current: "", new: "", confirm: "" });
      setSecurityMsg("Password updated!");
      setTimeout(() => setSecurityMsg(null), 2000);
    } catch (err: any) {
      setSecurityMsg(err.message || "Failed to update password");
    }
  };
  const securityValid = securityDraft.current && securityDraft.new && securityDraft.confirm && securityDraft.new === securityDraft.confirm;

  // Tab click handler
  const handleTabClick = (tabKey: string) => {
    if (tabKey === "logout") {
      setPreviousTab(activeTab);
      setShowLogoutModal(true);
    } else {
      setActiveTab(tabKey);
    }
  };

  // Logout modal handlers
  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
    setActiveTab(previousTab);
  };
  const handleLogoutConfirm = () => {
    clearSession();
    navigate("/");
  };

  // Tab content renderers
  const renderProfile = () => (
    <div style={{ background: "#fff", borderRadius: 16, padding: 60, width: "100%", maxWidth: "none" }}>
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between", 
        marginBottom: 40,
        background: "#f6fef9",
        padding: "20px 24px",
        borderRadius: 12,
        border: "1px solid #e0f2e1"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ 
            width: 48, 
            height: 48, 
            borderRadius: "50%", 
            background: "#16a34a", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center" 
          }}>
            <img src="/user-03 (1).png" alt="Profile" style={{ width: 24, height: 24, filter: "brightness(0) invert(1)" }} />
          </div>
          <h1 style={{ 
            margin: 0, 
            fontSize: 32, 
            fontWeight: 400, 
            color: "#111827" 
          }}>
            Profile Settings
          </h1>
        </div>
        <button
          style={{ border: "1px dashed #16a34a", color: "#16a34a", background: "#f6fef9", borderRadius: 20, padding: "8px 20px", fontWeight: 500, cursor: "pointer" }}
          onClick={() => {
            setProfileEdit(true);
            setProfileDraft(profile);
          }}
          disabled={profileEdit}
        >
          Edit Details <img src="/pencil-edit-01.png" alt="Edit" style={{ width: "16px", height: "16px", marginLeft: "6px" }} />
        </button>
      </div>
      {profileMsg && <div style={{ color: "#16a34a", marginBottom: 16, fontWeight: 500 }}>{profileMsg}</div>}
      <div style={{ display: "flex", alignItems: "center", gap: 32, marginBottom: 48 }}>
        <div style={{ position: "relative" }}>
          <img src={profileDraft.photo} alt="Profile" style={{ width: 100, height: 100, borderRadius: "50%" }} />
          <label htmlFor="profile-photo-upload" style={{ position: "absolute", bottom: 0, right: 0, background: "#16a34a", color: "#fff", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff", cursor: "pointer" }}>
            <img src="/pencil-edit-01-white.png" alt="Edit" style={{ width: "16px", height: "16px" }} />
            <input id="profile-photo-upload" type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoChange} />
          </label>
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 18 }}>Profile Photo</div>
          <div style={{ color: "#888", fontSize: 15 }}>Set your display picture</div>
        </div>
      </div>
      <form
        onSubmit={handleProfileUpdate}
        style={{ display: "flex", flexDirection: "column", gap: 36 }}
      >
        <div style={{ display: "flex", gap: 60 }}>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#888", fontSize: 15, marginBottom: 8 }}>Name</div>
            <input
              value={profileDraft.name}
              disabled
              style={{ width: "100%", padding: 16, borderRadius: 8, border: "1px solid #eee", background: "#f6f6f6", fontWeight: 500, fontSize: 16 }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#888", fontSize: 15, marginBottom: 8 }}>Email Address</div>
            <input
              value={profileDraft.email}
              disabled
              style={{ width: "100%", padding: 16, borderRadius: 8, border: "1px solid #eee", background: "#f6f6f6", fontWeight: 500, fontSize: 16 }}
            />
          </div>
        </div>
        <div style={{ display: "flex", gap: 60 }}>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#888", fontSize: 15, marginBottom: 8 }}>Phone Number</div>
            <input
              value={profileDraft.phone}
              onChange={e => setProfileDraft({ ...profileDraft, phone: e.target.value })}
              disabled={!profileEdit}
              placeholder="Type phone number"
              style={{ width: "100%", padding: 16, borderRadius: 8, border: "1px solid #eee", background: "#fff", fontWeight: 500, fontSize: 16 }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#888", fontSize: 14, marginBottom: 8 }}>Location</div>
            <input
              value={profileDraft.location}
              onChange={e => setProfileDraft({ ...profileDraft, location: e.target.value })}
              disabled={!profileEdit}
              placeholder="Type location"
              style={{ width: "100%", padding: 16, borderRadius: 8, border: "1px solid #eee", background: "#fff", fontWeight: 500, fontSize: 16 }}
            />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
          <button
            type="submit"
            disabled={!profileEdit || !profileChanged || !profileValid}
            style={{ background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, padding: "16px 48px", fontWeight: 600, fontSize: 16, cursor: profileEdit && profileChanged && profileValid ? "pointer" : "not-allowed", opacity: profileEdit && profileChanged && profileValid ? 1 : 0.7 }}
          >
            Update
          </button>
        </div>
      </form>
    </div>
  );

  const renderNotifications = () => (
    <div style={{ background: "#fff", borderRadius: 16, padding: 60, width: "100%", maxWidth: "none" }}>
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between", 
        marginBottom: 40,
        background: "#f6fef9",
        padding: "20px 24px",
        borderRadius: 12,
        border: "1px solid #e0f2e1"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ 
            width: 48, 
            height: 48, 
            borderRadius: "50%", 
            background: "#16a34a", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center" 
          }}>
            <span style={{ fontSize: 24, filter: "brightness(0) invert(1)" }}>🔔</span>
          </div>
          <h1 style={{ 
            margin: 0, 
            fontSize: 32, 
            fontWeight: 400, 
            color: "#111827" 
          }}>
            Notifications
          </h1>
        </div>
        <button
          style={{ border: "1px dashed #16a34a", color: "#16a34a", background: "#f6fef9", borderRadius: 20, padding: "8px 20px", fontWeight: 500, cursor: "pointer" }}
          onClick={() => {
            setNotifEdit(true);
            setNotifDraft(notifications);
          }}
          disabled={notifEdit}
        >
          Edit Details <img src="/pencil-edit-01.png" alt="Edit" style={{ width: "16px", height: "16px", marginLeft: "6px" }} />
        </button>
      </div>
      {notifMsg && <div style={{ color: "#16a34a", marginBottom: 12, fontWeight: 500 }}>{notifMsg}</div>}
      <form
        onSubmit={handleNotifUpdate}
        style={{ display: "flex", flexDirection: "column", gap: 36 }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 0" }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>New Accounts</div>
              <div style={{ color: "#888", fontSize: 14 }}>Receive email notifications when a new account is added</div>
            </div>
            <label style={{ display: "flex", alignItems: "center", cursor: notifEdit ? "pointer" : "not-allowed" }}>
              <input
                type="checkbox"
                checked={notifDraft.accounts}
                onChange={e => setNotifDraft({ ...notifDraft, accounts: e.target.checked })}
                disabled={!notifEdit}
                style={{ width: 0, height: 0, opacity: 0 }}
              />
              <span style={{ width: 38, height: 22, background: notifDraft.accounts ? "#16a34a" : "#e5e7eb", borderRadius: 12, position: "relative", display: "inline-block", transition: "background 0.2s" }}>
                <span style={{ position: "absolute", left: notifDraft.accounts ? 18 : 2, top: 2, width: 18, height: 18, background: "#fff", borderRadius: 9, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", transition: "left 0.2s" }} />
              </span>
            </label>
          </div>
          <div style={{ height: "1px", background: "#e5e7eb", margin: "0 0 24px 0" }} />
          
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 0" }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Payments</div>
              <div style={{ color: "#888", fontSize: 14 }}>Receive email notifications when payment is made</div>
            </div>
            <label style={{ display: "flex", alignItems: "center", cursor: notifEdit ? "pointer" : "not-allowed" }}>
              <input
                type="checkbox"
                checked={notifDraft.payments}
                onChange={e => setNotifDraft({ ...notifDraft, payments: e.target.checked })}
                disabled={!notifEdit}
                style={{ width: 0, height: 0, opacity: 0 }}
              />
              <span style={{ width: 38, height: 22, background: notifDraft.payments ? "#16a34a" : "#e5e7eb", borderRadius: 12, position: "relative", display: "inline-block", transition: "background 0.2s" }}>
                <span style={{ position: "absolute", left: notifDraft.payments ? 18 : 2, top: 2, width: 18, height: 18, background: "#fff", borderRadius: 9, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", transition: "left 0.2s" }} />
              </span>
            </label>
          </div>
          <div style={{ height: "1px", background: "#e5e7eb", margin: "0 0 24px 0" }} />
          
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 0" }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Routes</div>
              <div style={{ color: "#888", fontSize: 14 }}>Receive email notifications when a new route is added</div>
            </div>
            <label style={{ display: "flex", alignItems: "center", cursor: notifEdit ? "pointer" : "not-allowed" }}>
              <input
                type="checkbox"
                checked={notifDraft.routes}
                onChange={e => setNotifDraft({ ...notifDraft, routes: e.target.checked })}
                disabled={!notifEdit}
                style={{ width: 0, height: 0, opacity: 0 }}
              />
              <span style={{ width: 38, height: 22, background: notifDraft.routes ? "#16a34a" : "#e5e7eb", borderRadius: 12, position: "relative", display: "inline-block", transition: "background 0.2s" }}>
                <span style={{ position: "absolute", left: notifDraft.routes ? 18 : 2, top: 2, width: 18, height: 18, background: "#fff", borderRadius: 9, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", transition: "left 0.2s" }} />
              </span>
            </label>
          </div>
          <div style={{ height: "1px", background: "#e5e7eb", margin: "0 0 24px 0" }} />
          
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 0" }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Customer Support</div>
              <div style={{ color: "#888", fontSize: 14 }}>Receive email notifications when a message is received</div>
            </div>
            <label style={{ display: "flex", alignItems: "center", cursor: notifEdit ? "pointer" : "not-allowed" }}>
              <input
                type="checkbox"
                checked={notifDraft.support}
                onChange={e => setNotifDraft({ ...notifDraft, support: e.target.checked })}
                disabled={!notifEdit}
                style={{ width: 0, height: 0, opacity: 0 }}
              />
              <span style={{ width: 38, height: 22, background: notifDraft.support ? "#16a34a" : "#e5e7eb", borderRadius: 12, position: "relative", display: "inline-block", transition: "background 0.2s" }}>
                <span style={{ position: "absolute", left: notifDraft.support ? 18 : 2, top: 2, width: 18, height: 18, background: "#fff", borderRadius: 9, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", transition: "left 0.2s" }} />
              </span>
            </label>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="submit"
            disabled={!notifEdit || !notifChanged}
            style={{ background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, padding: "12px 36px", fontWeight: 600, fontSize: 16, cursor: notifEdit && notifChanged ? "pointer" : "not-allowed", opacity: notifEdit && notifChanged ? 1 : 0.7 }}
          >
            Update
          </button>
        </div>
      </form>
    </div>
  );

  const renderSecurity = () => (
    <div style={{ background: "#fff", borderRadius: 16, padding: 60, width: "100%", maxWidth: "none" }}>
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between", 
        marginBottom: 40,
        background: "#f6fef9",
        padding: "20px 24px",
        borderRadius: 12,
        border: "1px solid #e0f2e1"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ 
            width: 48, 
            height: 48, 
            borderRadius: "50%", 
            background: "#16a34a", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center" 
          }}>
            <span style={{ fontSize: 24, filter: "brightness(0) invert(1)" }}>🛡️</span>
          </div>
          <h1 style={{ 
            margin: 0, 
            fontSize: 32, 
            fontWeight: 400, 
            color: "#111827" 
          }}>
            Password & Security
          </h1>
        </div>
        <button
          style={{ border: "1px dashed #16a34a", color: "#16a34a", background: "#f6fef9", borderRadius: 20, padding: "8px 20px", fontWeight: 500, cursor: "pointer" }}
          onClick={() => setSecurityEdit(true)}
          disabled={securityEdit}
        >
          Edit Details <img src="/pencil-edit-01.png" alt="Edit" style={{ width: "16px", height: "16px", marginLeft: "6px" }} />
        </button>
      </div>
      {securityMsg && <div style={{ color: securityMsg === "Password updated!" ? "#16a34a" : "#dc2626", marginBottom: 12, fontWeight: 500 }}>{securityMsg}</div>}
      <form
        onSubmit={handleSecurityUpdate}
        style={{ display: "flex", flexDirection: "column", gap: 36 }}
      >
        <div style={{ display: "flex", gap: 48 }}>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#888", fontSize: 16, marginBottom: 8, fontWeight: 600 }}>Current Password</div>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword.current ? "text" : "password"}
                value={securityDraft.current}
                onChange={e => setSecurityDraft({ ...securityDraft, current: e.target.value })}
                disabled={!securityEdit}
                placeholder="Enter current password"
                style={{ width: "100%", padding: 16, borderRadius: 8, border: "1px solid #eee", background: "#fff", fontWeight: 500, fontSize: 16 }}
              />
              <img 
                src="/key-01.png" 
                alt="Key" 
                style={{ 
                  position: "absolute", 
                  right: 12, 
                  top: 12, 
                  width: "20px", 
                  height: "20px" 
                }} 
              />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#888", fontSize: 16, marginBottom: 8, fontWeight: 600 }}>New Password</div>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword.new ? "text" : "password"}
                value={securityDraft.new}
                onChange={e => setSecurityDraft({ ...securityDraft, new: e.target.value })}
                disabled={!securityEdit}
                placeholder="Enter new password"
                style={{ width: "100%", padding: 16, borderRadius: 8, border: "1px solid #eee", background: "#fff", fontWeight: 500, fontSize: 16 }}
              />
              <img 
                src="/key-01.png" 
                alt="Key" 
                style={{ 
                  position: "absolute", 
                  right: 12, 
                  top: 12, 
                  width: "20px", 
                  height: "20px" 
                }} 
              />
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 32 }}>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#888", fontSize: 16, marginBottom: 8, fontWeight: 600 }}>Confirm New Password</div>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword.confirm ? "text" : "password"}
                value={securityDraft.confirm}
                onChange={e => setSecurityDraft({ ...securityDraft, confirm: e.target.value })}
                disabled={!securityEdit}
                placeholder="Enter new password"
                style={{ width: "100%", padding: 16, borderRadius: 8, border: "1px solid #eee", background: "#fff", fontWeight: 500, fontSize: 16 }}
              />
              <img 
                src="/key-01.png" 
                alt="Key" 
                style={{ 
                  position: "absolute", 
                  right: 12, 
                  top: 12, 
                  width: "20px", 
                  height: "20px" 
                }} 
              />
            </div>
          </div>
          <div style={{ flex: 1 }} />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="submit"
            disabled={!securityEdit || !securityValid}
            style={{ background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, padding: "12px 36px", fontWeight: 600, fontSize: 16, cursor: securityEdit && securityValid ? "pointer" : "not-allowed", opacity: securityEdit && securityValid ? 1 : 0.7 }}
          >
            Update
          </button>
        </div>
      </form>
    </div>
  );

  // Main render
  return (
    <div style={{ display: "flex" }}>
      <Sidebar
        collapsed={sidebarCollapsed}
        hovered={sidebarHovered}
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
        onSearchOpen={() => setSearchModalOpen(true)}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
      />
      <div
        style={{
          marginLeft: isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
          paddingLeft: 32,
          transition: "margin-left 0.25s cubic-bezier(.4,0,.2,1)",
          width: "100%",
        }}
      >
        <Topbar pageTitle="Settings" />
        <main style={{ padding: "2rem", background: "#f5f5f5", minHeight: "100vh" }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, boxShadow: "0 2px 8px rgba(0,0,0,0.03)", marginTop: "2rem", marginBottom: "2rem", minHeight: "950px" }}>
            <div style={{ display: "flex", gap: 32 }}>
              {/* Left: Tabs - 25% width */}
              <div style={{ width: "25%", minWidth: 280, background: "#fff", borderRadius: 16, padding: 32, display: "flex", flexDirection: "column", gap: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    placeholder="Search specific setting..."
                    style={{ width: "80%", padding: "18px 14px 18px 44px", borderRadius: 8, border: "1px solid #eee", marginBottom: 16, fontSize: 15, background: "#fff" }}
                    disabled
                  />
                  <img 
                    src="/search-02.png" 
                    alt="Search" 
                    style={{ 
                      position: "absolute", 
                      left: 16, 
                      top: "50%", 
                      transform: "translateY(-90%)", 
                      width: "20px", 
                      height: "20px",
                      opacity: 0.6
                    }} 
                  />
                </div>
                <div style={{ 
                  height: "1px", 
                  background: "#e5e7eb", 
                  marginBottom: 24,
                  width: "100%" 
                }} />
                {TABS.map(tab => (
                  <div
                    key={tab.key}
                    onClick={() => handleTabClick(tab.key)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "16px 14px",
                      borderRadius: 8,
                      background: "#fff",
                      color: activeTab === tab.key ? "#16a34a" : "#222",
                      fontWeight: activeTab === tab.key ? 600 : 500,
                      cursor: "pointer",
                      fontSize: 15,
                      position: "relative",
                    }}
                  >
                    {activeTab === tab.key && (
                      <div style={{
                        position: "absolute",
                        left: 0,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 16,
                        height: 2,
                        background: "#16a34a",
                        borderRadius: 1,
                      }} />
                    )}
                    <img src={tab.icon} alt={tab.label} style={{ width: 22, height: 22 }} />
                    {tab.label}
                  </div>
                ))}
              </div>
              {/* Right: Content - 75% width */}
              <div style={{ width: "75%", display: "flex", justifyContent: "flex-start", alignItems: "flex-start" }}>
                {activeTab === "profile" && renderProfile()}
                {activeTab === "notifications" && renderNotifications()}
                {activeTab === "security" && renderSecurity()}
                {/* No content for logout tab, modal will show */}
              </div>
            </div>
          </div>
          <LogoutModal
            isOpen={showLogoutModal}
            onCancel={handleLogoutCancel}
            onConfirm={handleLogoutConfirm}
          />
        </main>
      </div>
    </div>
  );
};

export default Settings;