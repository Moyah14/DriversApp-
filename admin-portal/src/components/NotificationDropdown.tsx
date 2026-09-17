import React, { useState, useRef, useEffect } from "react";

type Notification = {
  id: number;
  group: string;
  avatar: string;
  message: string;
  details: string;
  time: string;
  unread: boolean;
};

const mockNotifications: Notification[] = [
  {
    id: 1,
    group: "Today",
    avatar: "A1",
    message: "Agent 1 added a new driver account",
    details: "Agent 1 added Peter Jackson as a new driver.",
    time: "Now",
    unread: true,
  },
  {
    id: 2,
    group: "Today",
    avatar: "PJ",
    message: "Peter Jackson made a payment",
    details: "Peter Jackson paid ₦1,000 for his daily ticket.",
    time: "10m ago",
    unread: true,
  },
  {
    id: 3,
    group: "Today",
    avatar: "A1",
    message: "Agent 1 added a new driver account",
    details: "Agent 1 added Samuel Yahaya as a new driver.",
    time: "2h ago",
    unread: false,
  },
  {
    id: 4,
    group: "Yesterday",
    avatar: "A1",
    message: "Agent 1 added a new driver account",
    details: "Agent 1 added David Iwowari as a new driver.",
    time: "7 June 11:08 PM",
    unread: false,
  },
];

function groupNotifications(notifications: Notification[]): Record<string, Notification[]> {
  const groups: Record<string, Notification[]> = {};
  notifications.forEach((n) => {
    if (!groups[n.group]) groups[n.group] = [];
    groups[n.group].push(n);
  });
  return groups;
}

interface NotificationDropdownProps {
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
  const [selected, setSelected] = useState<Notification | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const handleViewDetails = (n: Notification) => {
    setSelected(n);
    setShowModal(true);
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const groups = groupNotifications(notifications);

  return (
    <>
      <div
        ref={ref}
        style={{
          position: "fixed",
          top: 80,
          right: 24,
          width: 550,
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          zIndex: 2000,
          padding: "0.5rem 0 0.5rem 0",
        }}
      >
        <div style={{ padding: "2rem 2rem 1rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontWeight: 700, fontSize: 20 }}>Notifications</div>
          <button onClick={handleMarkAllRead} style={{ background: "none", border: "none", color: "#16a34a", fontWeight: 500, fontSize: 15, cursor: "pointer", textDecoration: "underline" }}>Mark all as read</button>
        </div>
        <div style={{ borderTop: "1px solid #f0f0f0", margin: "0 2rem" }}></div>
        <div style={{ maxHeight: 400, overflowY: "auto", padding: "0 2rem" }}>
          {Object.keys(groups).map((group) => (
            <div key={group} style={{ marginBottom: 24 }}>
              <div style={{ color: "#888", fontWeight: 600, fontSize: 13, margin: "16px 0 12px 0" }}>{group.toUpperCase()}</div>
              {groups[group].map((n, index) => (
                <div key={n.id}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 24, position: "relative" }}>
                    {n.unread && (
                      <div style={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: "50%", 
                        background: "#16a34a", 
                        position: "absolute", 
                        left: -12, 
                        top: 16 
                      }} />
                    )}
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#16a34a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 16, fontFamily: "'Segoe UI', sans-serif" }}>{n.avatar}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 8 }}>{n.message}</div>
                      <button onClick={() => handleViewDetails(n)} style={{ background: "none", border: "none", color: "#16a34a", fontSize: 14, fontWeight: 500, cursor: "pointer", padding: 0, marginTop: 0, display: "flex", alignItems: "center", gap: "4px" }}>View Details <img src="/arrow-up-right.png" alt="arrow" style={{ width: "12px", height: "12px" }} /></button>
                    </div>
                    <div style={{ color: "#888", fontSize: 13, minWidth: 60, textAlign: "right" }}>{n.time}</div>
                  </div>
                  {index < groups[group].length - 1 && (
                    <div style={{ borderBottom: "1px solid #f0f0f0", margin: "0 0 24px 0" }}></div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ padding: "1rem 2rem 2rem 2rem", textAlign: "center" }}>
          <button style={{ background: "none", border: "none", color: "#16a34a", fontWeight: 500, fontSize: 15, cursor: "pointer", textDecoration: "underline" }}>View more notifications</button>
        </div>
      </div>
      {showModal && selected && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.2)",
          zIndex: 3000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
          onClick={() => setShowModal(false)}
        >
          <div style={{ background: "#fff", borderRadius: 16, padding: "2rem 2.5rem", minWidth: 340, maxWidth: 400, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", position: "relative" }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowModal(false)} style={{ position: "absolute", top: 18, right: 18, background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#888" }}>×</button>
            <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 18 }}>Notification Details</div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#16a34a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 16, fontFamily: "'Segoe UI', sans-serif" }}>{selected.avatar}</div>
              <div style={{ fontWeight: 500, fontSize: 16 }}>{selected.message}</div>
            </div>
            <div style={{ color: "#444", fontSize: 15, marginBottom: 18 }}>{selected.details}</div>
            <div style={{ color: "#888", fontSize: 13 }}>Received: {selected.time}</div>
          </div>
        </div>
      )}
    </>
  );
};

export default NotificationDropdown; 