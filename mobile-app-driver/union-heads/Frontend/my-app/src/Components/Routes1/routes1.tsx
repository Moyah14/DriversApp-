import React, { useEffect, useState } from 'react';
import './routes1.css';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../header/header';
import { useNavigate } from 'react-router-dom';
import viewArrow from '../media/Frame 779.png';
import location from '../media/Frame 57294.png';
import mapImage from '../media/mapImage.png';
import RouteDetails from './RouteDetails';
import expand from '../media/expand.png';
import { api } from '../../api/client';

interface Route {
  id: number | string;
  name: string;
  driverCount: number;
  startLocation: string;
  endLocation: string;
  raw?: any;
}

const Routes1: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Jos North');
  const [isRouteDetailsOpen, setIsRouteDetailsOpen] = useState(false);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [routeDetailsData, setRouteDetailsData] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api('/api/v1/routes')
      .then((rows) => {
        setRoutes(
          (rows || []).map((r: any, idx: number) => ({
            id: r.id ?? idx + 1,
            name: r.name || `Route ${idx + 1}`,
            driverCount: r.drivers_count ?? 0,
            startLocation: r.park_a_name || r.start_park || '—',
            endLocation: r.park_b_name || r.end_park || '—',
            raw: r,
          }))
        );
      })
      .catch(() => setRoutes([]));
  }, []);

  const handleRouteClick = (route: Route) => {
    const r = route.raw || {};
    setRouteDetailsData({
      id: route.id,
      name: route.name,
      park1: {
        name: route.startLocation,
        address: r.park_a_address || '',
        unionHead: r.union_head_name || '—',
      },
      park2: {
        name: route.endLocation,
        address: r.park_b_address || '',
        unionHead: r.union_head_name || '—',
      },
      dateRegistered: r.created_at || '—',
      registeredBy: r.created_by_name || '—',
      status: r.status || 'Active',
      drivers: (r.drivers || []).map((d: any, i: number) => ({
        id: String(d.id || i),
        name: d.full_name || d.name || '—',
        license: d.license_ref || d.plate_number || '—',
        avatar: (d.full_name || d.name || 'D').slice(0, 2).toUpperCase(),
      })),
    });
    setIsRouteDetailsOpen(true);
  };

  return (
    <div className={`routes-page${darkMode ? ' dark' : ''}`}>
      <Sidebar activeView={'routes'} onNavigate={(view) => navigate(`/${view}`)} />
      <main className="routes-main-content">
        <Header
          title="Routes"
          darkMode={darkMode}
          onToggleTheme={() => setDarkMode(dm => !dm)}
          showThemeSwitch={true}
          rightContent={
            <div className="profile">
              <div className="profile-avatar">
                <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="avatar" />
              </div>
              <div className="profile-info">
                <span className="profile-name">Ibrahim Musa</span>
                <span className="profile-email">Ibrahim.4Musa@gmail.com</span>
              </div>
            </div>
          }
        />
        
        <div className="routes-content">
          {/* Left Column - Routes List */}
          <div className="routes-left-column">
            <div className="routes-header">
              
              <div className="location-filter">
                <select 
                  value={selectedLocation} 
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="location-select"
                >
                  <option value="Jos North">Jos North</option>
                  <option value="Jos South">Jos South</option>
                  <option value="Jos East">Jos East</option>
                  <option value="Jos West">Jos West</option>
                </select>
              </div>
            </div>
            
            <div className="routes-list">
              {routes.map((route) => (
                <div key={route.id} className="route-card" onClick={() => handleRouteClick(route)}>
                  <div className="route-header">
                    <div className="route-info">
                      <h3 className="route-name">{route.name}</h3>
                      <span className="driver-count">{route.driverCount} Drivers</span>
                    </div>
                    <div className="route-arrow">
                      <img src={viewArrow} alt="arrow" className="arrow-icon" />
                    </div>
                  </div>
                  <div className="route-locations">
                    <div className="location-pin-container">
                      <img src={location} alt="route path" className="location-pin-full" />
                      <div className="location-texts">
                        <span className="location-text start-text">{route.startLocation}</span>
                        <span className="location-text end-text">{route.endLocation}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Map */}
          <div className="routes-right-column">
            <div className="map-container">
              <div className="map-controls">
                <button className="map-control-btn fullscreen-btn1">
                  <img src={expand} alt="fullscreen" className="control-icon1" />
                </button>
                <button className="map-control-btn locate-btn">
                  <img src={mapImage} alt="locate" className="control-icon" />
                </button>
              </div>
              <div className="map-placeholder">
                <img src={mapImage} alt="map" className="map-background" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Route Details Modal */}
      <RouteDetails
        isOpen={isRouteDetailsOpen && !!routeDetailsData}
        onClose={() => setIsRouteDetailsOpen(false)}
        route={routeDetailsData}
      />
    </div>
  );
};

export default Routes1;
