import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// Mock data for demonstration
const MOCK_RESULTS = [
  {
    group: "Accounts",
    items: [
      { label: "Peter Jackson", type: "Driver", path: "/accounts?search=Peter+Jackson" },
      { label: "Timothy Kolapo", type: "Agent", path: "/accounts?search=Timothy+Kolapo" },
    ],
  },
  {
    group: "Payments",
    items: [
      { label: "Payment #12345", type: "Card Payment", path: "/payments?search=12345" },
      { label: "Payment #67890", type: "Deposit", path: "/payments?search=67890" },
    ],
  },
  {
    group: "Routes",
    items: [
      { label: "Jos Bus Park", type: "Route", path: "/routes?search=Jos+Bus+Park" },
    ],
  },
];

interface GlobalSearchModalProps {
  open: boolean;
  onClose: () => void;
  onOpen?: () => void; // Optional, for keyboard shortcut
  searchValue: string;
  setSearchValue: (v: string) => void;
}

const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ open, onClose, onOpen, searchValue, setSearchValue }) => {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Filter results by query
  const filteredResults = MOCK_RESULTS.map(group => ({
    ...group,
    items: group.items.filter(item =>
      item.label.toLowerCase().includes(searchValue.toLowerCase()) ||
      item.type.toLowerCase().includes(searchValue.toLowerCase())
    ),
  })).filter(group => group.items.length > 0);

  // Flattened list for keyboard navigation
  const flatResults = filteredResults.flatMap(group => group.items);

  // Keyboard shortcut: Cmd+K or Ctrl+K to open
  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        if (!open && onOpen) {
          e.preventDefault();
          onOpen();
        }
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [open, onOpen]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
    setActiveIndex(0);
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        setActiveIndex(i => Math.min(i + 1, flatResults.length - 1));
        e.preventDefault();
      } else if (e.key === "ArrowUp") {
        setActiveIndex(i => Math.max(i - 1, 0));
        e.preventDefault();
      } else if (e.key === "Enter" && flatResults[activeIndex]) {
        navigate(flatResults[activeIndex].path);
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, flatResults, activeIndex, navigate, onClose]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.18)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          minWidth: 420,
          maxWidth: 540,
          width: "100%",
          padding: 32,
          position: "relative",
        }}
        onClick={e => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          placeholder="Search across the app..."
          style={{
            width: "100%",
            padding: "16px 18px",
            fontSize: 18,
            borderRadius: 8,
            border: "1px solid #eee",
            marginBottom: 24,
            outline: "none",
          }}
        />
        <div style={{ maxHeight: 320, overflowY: "auto" }}>
          {filteredResults.length === 0 && (
            <div style={{ color: "#888", textAlign: "center", padding: 32 }}>
              No results found.
            </div>
          )}
          {filteredResults.map((group, groupIdx) => (
            <div key={group.group} style={{ marginBottom: 18 }}>
              <div style={{ fontWeight: 600, color: "#16a34a", fontSize: 15, marginBottom: 8 }}>{group.group}</div>
              {group.items.map((item, idx) => {
                const flatIdx = filteredResults.slice(0, groupIdx).reduce((acc, g) => acc + g.items.length, 0) + idx;
                return (
                  <div
                    key={item.label}
                    onClick={() => { navigate(item.path); onClose(); }}
                    style={{
                      padding: "12px 16px",
                      borderRadius: 8,
                      background: flatIdx === activeIndex ? "#f0fdf4" : "#fff",
                      color: "#222",
                      cursor: "pointer",
                      marginBottom: 4,
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                    onMouseEnter={() => setActiveIndex(flatIdx)}
                  >
                    <span style={{ fontWeight: 500 }}>{item.label}</span>
                    <span style={{ color: "#888", fontSize: 14 }}>{item.type}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchModal; 