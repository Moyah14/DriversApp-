import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiMapPin, FiPlus, FiMinus, FiMaximize2 } from "react-icons/fi";
import Sidebar from "./Sidebar";
import RoutesTwo from "./RoutesTwo";
import mapImage from "../Media/image.png";
import locationUpdateIcon from "../Media/location-update-02.png";
import locationIcon from "../Media/location-04.png";
import arrowRightIcon from "../Media/arrow-right-01.png";
import "./Routes.css";
import { api } from "../api/client";

const MaximizeIcon = FiMaximize2 as unknown as React.ComponentType;
const PlusIcon = FiPlus as unknown as React.ComponentType;
const MinusIcon = FiMinus as unknown as React.ComponentType;

const Routes: React.FC = () => {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState<any[]>([]);
  const [showRouteDetails, setShowRouteDetails] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    api("/api/v1/routes")
      .then((rows) => {
        const mapped = (rows || []).map((r: any, idx: number) => ({
          id: r.id,
          name: r.name || `Route ${idx + 1}`,
          drivers: r.drivers_count ?? 0,
          parks: [r.park_a_name, r.park_b_name].filter(Boolean),
          raw: r,
        }));
        setRoutes(mapped);
        if (mapped.length) setSelectedRoute(mapped[0]);
      })
      .catch(() => setRoutes([]));
  }, []);

  const handleNavigation = (view: string) => {
    navigate(`/${view}`);
  };

  const handleViewRoute = (route: any) => {
    setSelectedRoute(route);
    setShowRouteDetails(true);
  };

  const filteredRoutes = routes.filter(route =>
    route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.parks.some((park: string) => park.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="routes-container">
      <Sidebar activeView={'routes'} onNavigate={handleNavigation} />
      <main className="routes-main">
                 {/* Top Header */}
         <div className="routes-top-header">
           <div className="routes-header-left">
             <h1 className="routes-main-title">Routes</h1>
           </div>
                       <div className="routes-header-right">
              <div className="routes-header-icons">
            <div className="routes-search-box">
                  <img src="/Media/search-02.png" alt="Search" className="routes-search-icon" />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="routes-search-input"
                  />
                </div>
                <div className="routes-theme-toggle-container">
                  <button 
                    className={`routes-theme-toggle-btn ${!darkMode ? 'active' : ''}`}
                    onClick={() => setDarkMode(false)}
                  >
                    <img src="/Media/LIGHT CIRCLE.png" alt="Light Mode" className="routes-theme-icon" />
                  </button>
                  <button 
                    className={`routes-theme-toggle-btn ${darkMode ? 'active' : ''}`}
                    onClick={() => setDarkMode(true)}
                  >
                    <img src="/Media/vector.png" alt="Dark Mode" className="routes-theme-icon" />
                  </button>
                </div>
                <img src="/Media/Notification bell.png" alt="Notifications" className="routes-notification-bell" />
              </div>
             <div className="routes-profile-section">
               <div className="routes-profile-avatar">
                 <img src="/Media/Profile Image.png" alt="Profile" className="routes-profile-image" />
               </div>
               <div className="routes-profile-info">
                 <span className="routes-profile-name">Ibrahim Musa</span>
                 <span className="routes-profile-email">ibrahim.Musa@gmail.com</span>
               </div>
             </div>
            </div>
          </div>

        {/* Main White Container */}
        <div className="routes-content-container">
          {/* Left Panel */}
          <div className="routes-left-panel">
            <select className="routes-select">
              <option>Jos North</option>
            </select>
            <div className="routes-list">
              {filteredRoutes.map((route, idx) => (
                <div 
                  className="route-card" 
                  key={idx}
                  onClick={() => handleViewRoute(route)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="route-card-header">
                    <div className="route-name-section">
                    <span className="route-name">{route.name}</span>
                    <span className="route-drivers">{route.drivers} Drivers</span>
                    </div>
                  </div>
                  <div className="route-card-parks">
                    {route.parks.map((park: string, i: number) => (
                      <div className="route-park" key={i}>
                        <img src={locationIcon} alt="Location" className="route-park-icon" />
                        {park}
                      </div>
                    ))}
                  </div>
                  <button className="route-card-arrow">
                    <img src={arrowRightIcon} alt="Arrow Right" className="arrow-right-icon" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          {/* Map Panel */}
          <div className="routes-map-panel">
            <div className="routes-map">
              <img
                src={mapImage}
                alt="Map"
                className="routes-map-img"
              />
              <button className="routes-map-plus"><MaximizeIcon /></button>
              
              {/* Map Controls */}
              <div className="routes-map-controls">
                <button className="routes-map-control-btn routes-location-btn">
                  <img src={locationUpdateIcon} alt="Location Update" className="location-update-icon" />
                </button>
                <div className="zoom-controls-container">
                  <button className="routes-map-control-btn routes-zoom-in-btn">
                    <PlusIcon />
                  </button>
                  <button className="routes-map-control-btn routes-zoom-out-btn">
                    <MinusIcon />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Route Details Modal */}
      {showRouteDetails && selectedRoute && (
        <RoutesTwo
          isOpen={showRouteDetails}
          onClose={() => setShowRouteDetails(false)}
          routeData={{
            routeNumber: selectedRoute.id,
            driverCount: selectedRoute.drivers,
            parks: [
              {
                parkNumber: 1,
                name: selectedRoute.parks[0] || "—",
                address: selectedRoute.raw?.park_a_address || "—",
                unionHead: selectedRoute.raw?.park_a_union_head || "—"
              },
              {
                parkNumber: 2,
                name: selectedRoute.parks[1] || "—",
                address: selectedRoute.raw?.park_b_address || "—",
                unionHead: selectedRoute.raw?.park_b_union_head || "—"
              }
            ],
            registration: {
              date: selectedRoute.raw?.created_at || "—",
              agent: selectedRoute.raw?.registered_by_name || "—",
              status: selectedRoute.raw?.status === "active" ? "Active" : "Inactive"
            },
            drivers: [
              { initials: "PJ", name: "Peter Jackson", plateNumber: "KJA145CK" },
              { initials: "TM", name: "Tunde Musa", plateNumber: "PL-233-ABC" },
              { initials: "SA", name: "Sani Abdullahi", plateNumber: "PL-765-KJA" },
              { initials: "FO", name: "Femi Oladipo", plateNumber: "PL-600-AFR" },
              { initials: "TO", name: "Tema Omuguga", plateNumber: "PL-330-KDH" }
            ]
          }}
        />
      )}
    </div>
  );
};

export default Routes;
