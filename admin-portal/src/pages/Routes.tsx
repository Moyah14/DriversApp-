import React, { useState, useEffect } from "react";
import Sidebar, { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { api, resolveTenantId } from "../api/client";
import { mapParkRow, mapRouteRow } from "../utils/apiMappers";

const defaultAreas = ["All Areas", "Jos North", "Jos South", "Jos East", "Jos West"];

type RoutesProps = {
  searchModalOpen: boolean;
  setSearchModalOpen: (open: boolean) => void;
  searchValue: string;
  setSearchValue: (v: string) => void;
};

const Routes: React.FC<RoutesProps> = ({ searchModalOpen, setSearchModalOpen, searchValue, setSearchValue }) => {
  const [areas, setAreas] = useState(defaultAreas);
  const [selectedArea, setSelectedArea] = useState(defaultAreas[0]);
  const [filterDropdown, setFilterDropdown] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<any | null>(null);
  const [mapError, setMapError] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [routes, setRoutes] = useState<any[]>([]);
  const [allParks, setAllParks] = useState<any[]>([]);
  const [routeForm, setRouteForm] = useState({ name: "", area: "", parkAId: "", parkBId: "" });
  const [formError, setFormError] = useState("");
  const [formSaving, setFormSaving] = useState(false);

  const loadData = () => {
    api("/api/v1/parks")
      .then((rows) => setAllParks((rows || []).map(mapParkRow)))
      .catch(() => setAllParks([]));
    api("/api/v1/routes")
      .then((rows) => {
        const mapped = (rows || []).map(mapRouteRow);
        setRoutes(mapped);
        const fromApi = Array.from(
          new Set(
            mapped
              .map((r: any) => r.area)
              .filter((a: string): a is string => Boolean(a) && a !== "—")
          )
        ) as string[];
        setAreas(["All Areas", ...fromApi, ...defaultAreas.filter((a) => a !== "All Areas" && !fromApi.includes(a))]);
      })
      .catch(() => setRoutes([]));
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setSidebarCollapsed(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Click-away for filter dropdown
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (filterDropdown && !(e.target as Element).closest('[data-dropdown]')) {
        setFilterDropdown(false);
      }
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [filterDropdown]);

  const isCollapsed = sidebarCollapsed && !sidebarHovered;

  // Filter routes by selected area
  const filteredRoutes = routes.filter(route =>
    selectedArea === "All Areas" || route.area === selectedArea
  );

  const handleAddRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSaving(true);
    try {
      const parkA = allParks.find((p) => String(p.id) === String(routeForm.parkAId));
      const parkB = allParks.find((p) => String(p.id) === String(routeForm.parkBId));
      const tenantId = await resolveTenantId();
      await api("/api/v1/routes", {
        method: "POST",
        body: JSON.stringify({
          name: routeForm.name || `${parkA?.name || "Park A"} - ${parkB?.name || "Park B"}`,
          area: routeForm.area || (selectedArea === "All Areas" ? "Jos North" : selectedArea),
          parkAId: routeForm.parkAId,
          parkBId: routeForm.parkBId,
          tenantId,
        }),
      });
      setAddModalOpen(false);
      setRouteForm({ name: "", area: "", parkAId: "", parkBId: "" });
      loadData();
    } catch (err: any) {
      setFormError(err.message || "Failed to add route");
    } finally {
      setFormSaving(false);
    }
  };

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
        <Topbar pageTitle="Routes" />
        <main style={{ padding: "2rem", background: "#f5f5f5", minHeight: "100vh" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
            {/* Area Filter Dropdown */}
            <div style={{ flex: 1, minWidth: 550, maxWidth: 550, position: "relative" }} data-dropdown>
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
                {selectedArea}
                <img src="/arrow-down-01-black.png" alt="Dropdown" style={{ width: "18px", height: "18px", marginLeft: "auto", marginRight: "1px" }} />
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
                  {areas.map((area) => (
                    <div
                      key={area}
                      onClick={() => { setSelectedArea(area); setFilterDropdown(false); }}
                      style={{
                        padding: "14px 24px",
                        cursor: "pointer",
                        background: selectedArea === area ? "#f3f4f6" : "#fff",
                        fontWeight: selectedArea === area ? 600 : 400,
                      }}
                    >
                      {area}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Add Route Button */}
            <button
              onClick={() => setAddModalOpen(true)}
              style={{
                background: "#16a34a",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "12px 32px",
                fontWeight: 600,
                fontSize: 16,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <img 
                src="/layer-add.png" 
                alt="Add" 
                style={{ 
                  width: "16px", 
                  height: "16px",
                  objectFit: "contain"
                }} 
              />
              Add Route
            </button>
          </div>
          <div style={{ display: "flex", gap: 32 }}>
            {/* Left: Route List */}
            <div style={{ flex: 1, minWidth: 340 }}>
              {/* Route List */}
              
              {/* Route List */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {filteredRoutes.length === 0 ? (
                  <div style={{ color: "#888", textAlign: "center", marginTop: 32 }}>No routes found for this area.</div>
                ) : (
                  filteredRoutes.map((route, idx) => (
                    <div
                      key={route.id}
                      style={{
                        background: "#fff",
                        borderRadius: 16,
                        padding: "1.5rem",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                        display: "flex",
                        flexDirection: "column",
                        cursor: "pointer",
                        border: "1px solid #f1f5f9",
                      }}
                      onClick={() => { setSelectedRoute(route); setDetailsDrawerOpen(true); }}
                    >
                      {/* Top Section with Route Name, Drivers Count, and Arrow */}
                      <div style={{ 
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "center",
                        marginBottom: "16px"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ fontWeight: 600, fontSize: 18, color: "#222" }}>Route {idx + 1}</div>
                        <span style={{
                            background: "transparent",
                            color: "#16a34a",
                            borderRadius: "20px",
                          padding: "4px 12px",
                          fontSize: 13,
                          fontWeight: 500,
                            border: "1px solid #16a34a",
                        }}>{route.driversCount} Drivers</span>
                        </div>
                        <div style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          background: "#f3f4f6",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer"
                        }}>
                          <img 
                            src="/Frame 779.png" 
                            alt="View details" 
                            style={{ 
                              width: "32px", 
                              height: "32px",
                              objectFit: "contain"
                            }} 
                          />
                        </div>
                      </div>
                      
                      {/* Horizontal Separator Line */}
                      <div style={{
                        height: "1px",
                        background: "#e5e7eb",
                        marginBottom: "16px"
                      }}></div>
                      
                      {/* Middle Section - Parks */}
                      <div style={{ 
                        display: "flex", 
                        flexDirection: "column", 
                        gap: "28px",
                        marginBottom: "12px"
                      }}>
                        {route.parks.map((park: string, i: number) => (
                          <div key={i} style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "8px", 
                            fontSize: "14px",
                            color: "#222",
                            position: "relative"
                          }}>
                            <img src="/location.png" alt="Location" style={{ width: "16px", height: "16px" }} />
                            <span>{park}</span>
                            
                            {/* Dotted line connecting parks (except for the last one) */}
                            {i < route.parks.length - 1 && (
                              <div style={{
                                position: "absolute",
                                left: "6px",
                                top: "18px",
                                width: "2px",
                                height: "28px",
                                background: "repeating-linear-gradient(to bottom, #16a34a 0px, #16a34a 2px, transparent 2px, transparent 4px)",
                                zIndex: 1
                              }}></div>
                            )}
                          </div>
                        ))}
                      </div>
                      

                    </div>
                  ))
                )}
              </div>
            </div>
            {/* Right: Map View */}
            <div style={{ 
              flex: 2, 
              minWidth: 400, 
              overflow: "hidden", 
              position: "relative", 
              height: "fit-content"
            }}>
              {/* Map Container */}
              <div style={{ 
                width: "100%", 
                height: "1000px", 
                background: "#f8f9fa", 
                borderRadius: 12,
                position: "relative",
                overflow: "hidden"
              }}>
                <img
                  src="/map.png"
                  alt="Map View"
                  style={{ 
                    width: "100%", 
                    height: "100%", 
                    objectFit: "cover",
                    borderRadius: 12
                  }}
                />
                
                {/* Map Controls */}
              <div style={{ position: "absolute", bottom: 24, right: 24, display: "flex", flexDirection: "column", gap: 8 }}>
                  <button style={{ 
                    background: "#16a34a", 
                    color: "#fff", 
                    border: "none", 
                    borderRadius: "50%", 
                    width: 40, 
                    height: 40, 
                    fontSize: 24, 
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
                  }}>+</button>
                  <button style={{ 
                    background: "#16a34a", 
                    color: "#fff", 
                    border: "none", 
                    borderRadius: "50%", 
                    width: 40, 
                    height: 40, 
                    fontSize: 24, 
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
                  }}>-</button>
                </div>
                
                {/* Full-screen Toggle */}
                <button style={{ 
                  position: "absolute", 
                  top: 24, 
                  right: 24, 
                  background: "#fff", 
                  border: "none", 
                  borderRadius: 8, 
                  padding: "8px", 
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)", 
                  cursor: "pointer",
                  width: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <span role="img" aria-label="expand" style={{ fontSize: "16px" }}>⤢</span>
                </button>
              </div>
            </div>
          </div>
          {/* Add Route Modal */}
          {addModalOpen && (
            <div style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.2)",
              zIndex: 2000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <div style={{
                background: "#fff",
                borderRadius: 16,
                padding: "2.5rem 2.5rem 2rem 2.5rem",
                minWidth: 520,
                maxWidth: "90vw",
                position: "relative",
                boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
              }}>
                <button
                  onClick={() => setAddModalOpen(false)}
                  style={{ 
                    position: "absolute", 
                    top: 24, 
                    right: 24, 
                    background: "#e5e7eb", 
                    border: "none", 
                    fontSize: 24, 
                    cursor: "pointer", 
                    color: "#000",
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                  aria-label="Close"
                >×</button>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 16, marginBottom: 32 }}>
                  <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <img src="/addroute.png" alt="Add Route" style={{ width: "48px", height: "48px" }} />
                  </div>
                  <h3 style={{ margin: 0, marginBottom: 24, fontSize: 22, fontWeight: "bold" }}>Add Route</h3>
                </div>
                <form onSubmit={handleAddRoute}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 42, marginBottom: 32 }}>
                    <div>
                      <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Route Name*</label>
                      <input
                        type="text"
                        placeholder="Type route name"
                        value={routeForm.name}
                        onChange={(e) => setRouteForm((f) => ({ ...f, name: e.target.value }))}
                        style={{ width: "100%", padding: 12, border: "1px solid #ddd", borderRadius: 8, fontSize: 15 }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Area*</label>
                      <select
                        value={routeForm.area}
                        onChange={(e) => setRouteForm((f) => ({ ...f, area: e.target.value }))}
                        style={{ width: "100%", padding: 12, border: "1px solid #ddd", borderRadius: 8, fontSize: 15, background: "#fff" }}
                        required
                      >
                        <option value="">Choose area</option>
                        {areas.filter((a) => a !== "All Areas").map((area) => (
                          <option key={area} value={area}>{area}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Park 1*</label>
                      <select
                        value={routeForm.parkAId}
                        onChange={(e) => setRouteForm((f) => ({ ...f, parkAId: e.target.value }))}
                        style={{ width: "100%", padding: 12, border: "1px solid #ddd", borderRadius: 8, fontSize: 15, background: "#fff" }}
                        required
                      >
                        <option value="">Choose park</option>
                        {allParks.map(park => <option key={park.id} value={park.id}>{park.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Park 2*</label>
                      <select
                        value={routeForm.parkBId}
                        onChange={(e) => setRouteForm((f) => ({ ...f, parkBId: e.target.value }))}
                        style={{ width: "100%", padding: 12, border: "1px solid #ddd", borderRadius: 8, fontSize: 15, background: "#fff" }}
                        required
                      >
                        <option value="">Choose park</option>
                        {allParks.map(park => <option key={park.id} value={park.id}>{park.name}</option>)}
                      </select>
                    </div>
                  </div>
                  {formError && <div style={{ color: "#dc2626", marginBottom: 16 }}>{formError}</div>}
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 16 }}>
                    <button type="button" onClick={() => setAddModalOpen(false)} style={{ 
                      background: "none", 
                      border: "none", 
                      color: "#16a34a", 
                      fontWeight: 500, 
                      fontSize: 16, 
                      cursor: "pointer",
                      textDecoration: "underline"
                    }}>Cancel</button>
                    <button type="submit" disabled={formSaving} style={{ background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, padding: "12px 32px", fontWeight: 600, fontSize: 16, cursor: "pointer" }}>{formSaving ? "Saving..." : "Add Route"}</button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {/* Route Details Drawer */}
          {detailsDrawerOpen && selectedRoute && (
            <>
              {/* Backdrop blur overlay */}
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(0,0,0,0.1)",
                  backdropFilter: "blur(8px)",
                  zIndex: 2000,
                }}
                onClick={() => setDetailsDrawerOpen(false)}
              />
              
            <div style={{
              position: "fixed",
              top: 0,
              right: 0,
              width: 480,
              height: "100vh",
              background: "#fff",
              boxShadow: "-2px 0 16px rgba(0,0,0,0.08)",
              zIndex: 3000,
              padding: "2rem",
              overflowY: "auto",
              transition: "right 0.3s",
                borderTopLeftRadius: 32,
                borderBottomLeftRadius: 32,
            }}>
              <button
                onClick={() => setDetailsDrawerOpen(false)}
                  style={{ 
                    position: "absolute", 
                    top: 24, 
                    right: 24, 
                    background: "#e5e7eb", 
                    border: "none", 
                    fontSize: 24, 
                    cursor: "pointer", 
                    color: "#000",
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                aria-label="Close"
              >×</button>
                <h2 style={{ marginTop: 0, marginBottom: 32, fontSize: 24, fontWeight: 700, color: "#111827" }}>Route Details</h2>
                
                {/* Separator Line */}
                <div style={{
                  height: "1px",
                  background: "#e5e7eb",
                  marginBottom: "24px"
                }}></div>
                
                <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 32, color: "#111827" }}>{selectedRoute.name || `Route ${selectedRoute.id}`}</div>
                
                {/* Route Information Section */}
                <div style={{ display: "flex", flexDirection: "column", gap: 24, marginBottom: 40 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#888", fontSize: 14, fontWeight: 500 }}>Park 1</span>
                    <span style={{ color: "#111827", fontSize: 14, textAlign: "right", flex: 1, marginLeft: "16px" }}>{selectedRoute.details?.park1?.name}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#888", fontSize: 14, fontWeight: 500 }}>Address</span>
                    <span style={{ color: "#111827", fontSize: 14, textAlign: "right", flex: 1, marginLeft: "16px" }}>{selectedRoute.details?.park1?.address}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#888", fontSize: 14, fontWeight: 500 }}>Union Head</span>
                    <span style={{ color: "#111827", fontSize: 14, textAlign: "right", flex: 1, marginLeft: "16px" }}>{selectedRoute.details?.park1?.unionHead}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#888", fontSize: 14, fontWeight: 500 }}>Park 2</span>
                    <span style={{ color: "#111827", fontSize: 14, textAlign: "right", flex: 1, marginLeft: "16px" }}>{selectedRoute.details?.park2?.name}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#888", fontSize: 14, fontWeight: 500 }}>Address</span>
                    <span style={{ color: "#111827", fontSize: 14, textAlign: "right", flex: 1, marginLeft: "16px" }}>{selectedRoute.details?.park2?.address}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#888", fontSize: 14, fontWeight: 500 }}>Union Head</span>
                    <span style={{ color: "#111827", fontSize: 14, textAlign: "right", flex: 1, marginLeft: "16px" }}>{selectedRoute.details?.park2?.unionHead}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#888", fontSize: 14, fontWeight: 500 }}>Date Registered</span>
                    <span style={{ color: "#111827", fontSize: 14, textAlign: "right", flex: 1, marginLeft: "16px" }}>{selectedRoute.details?.dateRegistered}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#888", fontSize: 14, fontWeight: 500 }}>Registered By</span>
                    <span style={{ color: "#111827", fontSize: 14, textAlign: "right", flex: 1, marginLeft: "16px" }}>{selectedRoute.details?.registeredBy}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#888", fontSize: 14, fontWeight: 500 }}>Status</span>
                    <span style={{ color: "#16a34a", background: "#dcfce7", padding: "4px 12px", borderRadius: "20px", fontWeight: 500, fontSize: 13 }}>Active</span>
                  </div>
                </div>
                
                {/* Separator Line above Drivers Section */}
                <div style={{
                  height: "1px",
                  background: "#e5e7eb",
                  marginBottom: "24px"
                }}></div>
                
                {/* Drivers Registered Section */}
                <div style={{ marginBottom: 32 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <div style={{ fontWeight: 600, fontSize: 16, color: "#111827" }}>Drivers Registered ({selectedRoute.driversCount})</div>
                    <button style={{ 
                      background: "none", 
                      border: "none", 
                      color: "#16a34a", 
                      fontWeight: 500, 
                      fontSize: 15, 
                      cursor: "pointer",
                      textDecoration: "underline"
                    }}>View all</button>
              </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 32 }}>
                {selectedRoute.details?.drivers?.map((driver: any, idx: number) => (
                      <div key={idx} style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: 16, 
                        padding: "16px 20px",
                        background: "transparent",
                        borderRadius: 12,
                        border: "1px solid #e5e7eb"
                      }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#16a34a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 14 }}>
                      {driver.name.split(" ").map((n: string) => n[0]).join("")}
                    </div>
                    <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500, color: "#111827", fontSize: 14 }}>{driver.name} | {driver.idNumber}</div>
                        </div>
                        <button style={{ 
                          background: "transparent", 
                          border: "1px solid #16a34a", 
                          color: "#16a34a", 
                          borderRadius: 20, 
                          padding: "8px 16px", 
                          fontWeight: 500, 
                          fontSize: 13, 
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px"
                        }}>
                          View Profile
                          <img 
                            src="/link-forward.png" 
                            alt="View profile" 
                            style={{ 
                              width: "14px", 
                              height: "14px",
                              objectFit: "contain"
                            }} 
                          />
                        </button>
                    </div>
                    ))}
                  </div>
                </div>
                
                {/* Delete Route Button */}
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "2rem" }}>
                  <button style={{ 
                    background: "#16a34a", 
                    color: "#fff", 
                    border: "none", 
                    borderRadius: 8, 
                    padding: "12px 24px", 
                    fontWeight: 600, 
                    fontSize: 14, 
                    cursor: "pointer",
                    marginTop: "auto"
                  }}>
                    Delete Route
                  </button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Routes; 