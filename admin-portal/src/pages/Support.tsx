import React, { useState, useRef, useEffect } from "react";
import Sidebar, { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { api } from "../api/client";
import { formatDate } from "../utils/apiMappers";

const filters = [
  "Recent Requests",
  "Resolved Requests",
  "Pending Requests",
  "All Requests",
];

type Reply = { text: string; date: string };

type AgentRequest = {
  id: number | string;
  name: string;
  avatar: string;
  subject: string;
  preview: string;
  date: string;
  time: string;
  message: string;
  attachments: { name: string; size: string }[];
  dateFull: string;
  status: string;
  replies: Reply[];
};

function mapTicket(t: any): AgentRequest {
  const created = t.created_at ? new Date(t.created_at) : new Date();
  const statusRaw = (t.status || "").toLowerCase();
  let status = "Recent Requests";
  if (statusRaw === "resolved" || statusRaw === "closed") status = "Resolved Requests";
  else if (statusRaw === "pending" || statusRaw === "open") status = "Pending Requests";
  const message = t.message || t.body || "";
  return {
    id: t.id,
    name: t.requester_name || t.user_name || "User",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    subject: t.subject || "Support Request",
    preview: message.slice(0, 120),
    date: formatDate(t.created_at),
    time: created.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    message,
    attachments: [],
    dateFull: formatDate(t.created_at),
    status,
    replies: (t.replies || []).map((r: any) => ({
      text: r.message || r.text || "",
      date: formatDate(r.created_at) || "Now",
    })),
  };
}

const statusColors: Record<string, { color: string; bg: string }> = {
  "Resolved Requests": { color: "#16a34a", bg: "#dcfce7" },
  "Pending Requests": { color: "#f59e0b", bg: "#fef3c7" },
  "Recent Requests": { color: "#2563eb", bg: "#dbeafe" },
};

type SupportProps = {
  searchModalOpen: boolean;
  setSearchModalOpen: (open: boolean) => void;
  searchValue: string;
  setSearchValue: (v: string) => void;
};

const Support: React.FC<SupportProps> = ({ searchModalOpen, setSearchModalOpen, searchValue, setSearchValue }) => {
  const [selectedFilter, setSelectedFilter] = useState(filters[0]);
  const [filterDropdown, setFilterDropdown] = useState(false);
  const [requests, setRequests] = useState<AgentRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<AgentRequest | null>(null);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [reply, setReply] = useState("");
  const actionsRef = useRef<HTMLDivElement | null>(null);
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
    api("/api/v1/support")
      .then((rows) => {
        const mapped = (rows || []).map(mapTicket);
        setRequests(mapped);
        if (mapped.length) setSelectedRequest(mapped[0]);
      })
      .catch(() => setRequests([]));
  }, []);

  const isCollapsed = sidebarCollapsed && !sidebarHovered;

  // Filtered requests
  const filteredRequests = selectedFilter === "All Requests"
    ? requests
    : requests.filter(r => r.status === selectedFilter);

  // Click-away for actions dropdown
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) {
        setActionsOpen(false);
      }
    }
    if (actionsOpen) {
      document.addEventListener("mousedown", handleClick);
    } else {
      document.removeEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [actionsOpen]);

  // Handle agent actions
  const handleAgentAction = (action: string) => {
    if (!selectedRequest) return;
    if (action === "profile") {
      alert(`Show profile for ${selectedRequest.name}`);
    } else if (action === "close") {
      setRequests(reqs => reqs.map(r => r.id === selectedRequest.id ? { ...r, status: "Resolved Requests" } : r));
      setActionsOpen(false);
    } else if (action === "delete") {
      const newReqs = requests.filter(r => r.id !== selectedRequest.id);
      setRequests(newReqs);
      setActionsOpen(false);
      if (newReqs.length > 0) setSelectedRequest(newReqs[0]);
      else setSelectedRequest(null);
    }
  };

  // Handle reply
  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !selectedRequest) return;
    const text = reply.trim();
    try {
      await api(`/api/v1/support/${selectedRequest.id}/replies`, {
        method: "POST",
        body: JSON.stringify({ message: text }),
      });
      setRequests(reqs => reqs.map(r =>
        r.id === selectedRequest.id
          ? { ...r, replies: [...r.replies, { text, date: "Now" }], status: "Resolved Requests" }
          : r
      ));
      setSelectedRequest(r => r ? { ...r, replies: [...r.replies, { text, date: "Now" }], status: "Resolved Requests" } : r);
      setReply("");
    } catch (err: any) {
      alert(err.message || "Failed to send reply");
    }
  };

  // Keep selectedRequest in sync with requests
  useEffect(() => {
    if (!selectedRequest) return;
    const updated = requests.find(r => r.id === selectedRequest.id);
    if (updated) setSelectedRequest(updated);
  }, [requests]);

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
        <Topbar pageTitle="Support" />
        <main style={{ padding: "2rem", background: "#f5f5f5", minHeight: "100vh" }}>
          <div style={{ display: "flex", gap: 32, minHeight: "calc(100vh - 4rem)" }}>
                        {/* Left: Request List */}
            <div style={{ flex: 1, minWidth: 340 }}>
              {/* Filter Dropdown */}
              <div style={{ marginBottom: 24, position: "relative" }}>
                <button
                  onClick={() => setFilterDropdown((v) => !v)}
                  style={{
                    padding: "12px 24px",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    fontSize: 16,
                    background: "#fff",
                    fontWeight: 500,
                    width: "100%",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                  }}
                >
                  {selectedFilter}
                  <img src="/arrow-down-01-black.png" alt="Dropdown" style={{ width: "18px", height: "18px", marginLeft: 8 }} />
                </button>
                {filterDropdown && (
                  <div style={{
                    position: "absolute",
                    top: 48,
                    left: 0,
                    width: "100%",
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                    zIndex: 10,
                  }}>
                    {filters.map((f) => (
                      <div
                        key={f}
                        onClick={() => { setSelectedFilter(f); setFilterDropdown(false); }}
                        style={{
                          padding: "14px 24px",
                          cursor: "pointer",
                          background: selectedFilter === f ? "#f3f4f6" : "#fff",
                          fontWeight: selectedFilter === f ? 600 : 400,
                        }}
                      >
                        {f}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Request List */}
              <div style={{ 
                background: "#fff", 
                borderRadius: 16, 
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                overflow: "hidden"
              }}>
                {filteredRequests.length === 0 ? (
                  <div style={{ color: "#888", textAlign: "center", marginTop: 32, padding: "2rem" }}>No requests found for this filter.</div>
                ) : (
                  filteredRequests.map((agent, index) => (
                    <div key={agent.id}>
                      <div
                        onClick={() => setSelectedRequest(agent)}
                        style={{
                          background: selectedRequest?.id === agent.id ? "#f3f4f6" : "#fff",
                          padding: "2.5rem 2.5rem",
                          display: "flex",
                          flexDirection: "column",
                          gap: 16,
                          cursor: "pointer",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
                          <img src={agent.avatar} alt={agent.name} style={{ width: 40, height: 40, borderRadius: "50%" }} />
                          <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                            <div style={{ fontWeight: 600 }}>{agent.name}</div>
                            <span style={{ color: "#888", fontSize: 14, marginBottom: 8 }}>to: me</span>
                            <div style={{ fontWeight: 500, fontSize: 16 }}>{agent.subject}</div>
                            <div style={{ 
                              color: "#888", 
                              fontSize: 14,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              lineHeight: "1.4"
                            }}>{agent.preview}</div>
                          </div>
                          <span style={{ color: "#888", fontSize: 14 }}>{agent.date}</span>
                        </div>
                      </div>
                      {/* Separator line - don't show after the last item */}
                      {index < filteredRequests.length - 1 && (
                        <div style={{ 
                          height: "1px", 
                          background: "#e5e7eb", 
                          margin: "0 1.5rem" 
                        }} />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
            {/* Right: Request Details */}
            <div style={{ flex: 2, minWidth: 400, background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.03)", padding: "2rem", position: "relative", minHeight: "90vh" }}>
              {!selectedRequest ? (
                <div style={{ color: "#888", textAlign: "center", marginTop: 80 }}>No support tickets loaded.</div>
              ) : (
              <>
              {/* Header with title and actions */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
                <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "600", color: "#111827" }}>Request Details</h2>
                <button
                  onClick={() => setActionsOpen((v) => !v)}
                  style={{ 
                    background: "#f3f4f6", 
                    border: "none", 
                    borderRadius: "50%", 
                    width: "40px", 
                    height: "40px", 
                    fontSize: "18px", 
                    color: "#6b7280", 
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                  aria-label="Actions"
                >
                  ⋮
                </button>
                {actionsOpen && (
                  <div style={{
                    position: "absolute",
                    top: 64,
                    right: 32,
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                    zIndex: 20,
                    minWidth: 180,
                  }}>
                    <button onClick={() => handleAgentAction("profile")}
                      style={{ width: "100%", padding: "12px 20px", background: "none", border: "none", textAlign: "left", fontSize: 15, cursor: "pointer" }}>Agent Profile</button>
                    <button onClick={() => handleAgentAction("close")}
                      style={{ width: "100%", padding: "12px 20px", background: "none", border: "none", textAlign: "left", fontSize: 15, cursor: "pointer" }}>Close Request</button>
                    <button onClick={() => handleAgentAction("delete")}
                      style={{ width: "100%", padding: "12px 20px", background: "none", border: "none", textAlign: "left", fontSize: 15, color: "#dc2626", cursor: "pointer" }}>Delete Request</button>
                  </div>
                )}
              </div>
                            {/* Details header */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32, paddingBottom: 32, borderBottom: "1px solid #e5e7eb" }}>
                <img src={selectedRequest.avatar} alt={selectedRequest.name} style={{ width: 40, height: 40, borderRadius: "50%" }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ fontWeight: 600, fontSize: "16px" }}>{selectedRequest.name}</div>
                  <span style={{ color: "#6b7280", fontSize: "14px" }}>to: me</span>
                </div>
                <span style={{ marginLeft: "auto", color: "#333", fontSize: "15px", fontWeight: "500" }}>{selectedRequest.dateFull}</span>
              </div>
                <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 24 }}>{selectedRequest.subject}</div>
                <div style={{ color: "#222", fontSize: 15, marginBottom: 40, whiteSpace: "pre-line", lineHeight: "1.6" }}>{selectedRequest.message}</div>
              {/* Attachments */}
              {selectedRequest.attachments.length > 0 && (
                <div style={{ marginBottom: 200 }}>
                  <div style={{ 
                    fontWeight: 500, 
                    marginBottom: 20, 
                    paddingTop: 20, 
                    borderTop: "1px solid #e5e7eb" 
                  }}>Attachments</div>
                  <div style={{ display: "flex", gap: 20 }}>
                    {selectedRequest.attachments.map((att, idx) => (
                      <div key={idx} style={{ background: "#fff", borderRadius: 8, padding: "20px 28px", display: "flex", alignItems: "center", gap: 16, border: "1px solid #e5e7eb" }}>
                        <div style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center",
                          width: "32px", 
                          height: "32px",
                          background: "#f3f4f6",
                          borderRadius: "50%"
                        }}>
                          <img src="/download-03.png" alt="Download" style={{ width: "24px", height: "24px" }} />
                        </div>
                        <div>
                          <div>{att.name}</div>
                          <div style={{ color: "#888", fontSize: 13 }}>{att.size}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Replies */}
              {selectedRequest.replies && selectedRequest.replies.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontWeight: 500, marginBottom: 8 }}>Replies</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {selectedRequest.replies.map((rep: any, idx: number) => (
                      <div key={idx} style={{ background: "#f3f4f6", borderRadius: 8, padding: "10px 16px", fontSize: 15 }}>
                        <span style={{ color: "#16a34a", fontWeight: 600 }}>You:</span> {rep.text}
                        <span style={{ float: "right", color: "#888", fontSize: 13, marginLeft: 12 }}>{rep.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Reply box */}
              <form onSubmit={handleReply} style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 16 }}>
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  background: "#fff", 
                  borderRadius: "24px", 
                  padding: "8px 16px", 
                  flex: 1,
                  gap: 12,
                  border: "1px solid #e5e7eb"
                }}>
                  {/* Emoji button */}
                  <button 
                    type="button" 
                    onClick={() => {
                      // Add emoji picker functionality here
                      console.log("Emoji button clicked");
                    }}
                    style={{ 
                      background: "none", 
                      border: "none", 
                      cursor: "pointer", 
                      padding: "8px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "background-color 0.2s ease"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f3f4f6"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="#9ca3af" strokeWidth="1.5" fill="none"/>
                      <circle cx="9" cy="10" r="1" fill="#9ca3af"/>
                      <circle cx="15" cy="10" r="1" fill="#9ca3af"/>
                      <path d="M9 15.5C9 15.5 10.5 17 12 17C13.5 17 15 15.5 15 15.5" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                  
                  {/* Message input */}
                  <input
                    type="text"
                    placeholder="Reply message..."
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    style={{ 
                      flex: 1, 
                      padding: "12px 8px", 
                      border: "none", 
                      background: "transparent", 
                      fontSize: 15,
                      outline: "none"
                    }}
                  />
                  
                  {/* Attachment button */}
                  <button 
                    type="button" 
                    onClick={() => {
                      // Add file attachment functionality here
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*,.pdf,.doc,.docx';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          console.log("File selected:", file.name);
                          // Handle file attachment here
                        }
                      };
                      input.click();
                    }}
                    style={{ 
                      background: "none", 
                      border: "none", 
                      cursor: "pointer", 
                      padding: "8px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "background-color 0.2s ease"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f3f4f6"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <img src="/link-04.png" alt="Attachment" style={{ width: "20px", height: "20px" }} />
                  </button>
                  
                                      {/* Send button */}
                    <button type="submit" style={{
                      background: "#16a34a",
                      color: "#fff",
                      border: "none",
                      borderRadius: "50%",
                      width: "36px",
                      height: "36px",
                      fontSize: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer"
                    }}>
                      <img src="/sent.png" alt="Send" style={{ width: "18px", height: "18px" }} />
                    </button>
                </div>
              </form>
              </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Support;