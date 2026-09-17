import React, { useEffect, useState } from 'react';
import './DashboardAddDriver.css';
import { api, getStoredUser } from '../api/client';

interface DashboardAddDriverProps {
  isOpen: boolean;
  onClose: () => void;
  onPreviousStep: () => void;
  onSkipForNow: () => void;
  onSaveDetails: () => void;
  driverDraft?: {
    fullName: string;
    phoneNumber: string;
    homeAddress: string;
    nin: string;
    licenseFileName?: string;
  } | null;
}

const DashboardAddDriver: React.FC<DashboardAddDriverProps> = ({
  isOpen,
  onClose,
  onPreviousStep,
  onSkipForNow,
  onSaveDetails,
  driverDraft
}) => {
  const [plateNumber, setPlateNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [routePlied, setRoutePlied] = useState('');
  const [park, setPark] = useState('');
  const [routes, setRoutes] = useState<any[]>([]);
  const [parks, setParks] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const vehicleTypes = [
    'Bus',
    'Taxi',
    'Tricycle',
    'Motorcycle',
    'Truck',
    'Car'
  ];

  useEffect(() => {
    if (!isOpen) return;
    api('/api/v1/parks')
      .then((rows) => setParks(rows || []))
      .catch(() => setParks([]));
    api('/api/v1/routes')
      .then((rows) => setRoutes(rows || []))
      .catch(() => setRoutes([]));
  }, [isOpen]);

  const handleSave = async () => {
    setError('');
    setSaving(true);
    try {
      const me = getStoredUser<any>();
      let tenantId = me?.tenantId || me?.tenant_id;
      if (!tenantId) {
        try {
          const tenants = await api('/api/v1/tenants');
          tenantId = (tenants || []).find((t: any) => t.status === 'active')?.id || (tenants || [])[0]?.id;
        } catch {
          /* ignore */
        }
      }
      const fullName = driverDraft?.fullName || 'New Driver';
      const emailSlug = fullName.toLowerCase().replace(/\s+/g, '.') || 'driver';
      await api('/api/v1/users', {
        method: 'POST',
        body: JSON.stringify({
          email: `${emailSlug}.${Date.now()}@drivers.local`,
          password: 'ChangeMe123!',
          fullName,
          role: 'DRIVER',
          phone: driverDraft?.phoneNumber,
          nin: driverDraft?.nin,
          address: driverDraft?.homeAddress,
          licenseRef: driverDraft?.licenseFileName,
          plateNumber,
          vehicleType,
          parkId: park || undefined,
          routeId: routePlied || undefined,
          tenantId,
        }),
      });
      onSaveDetails();
    } catch (err: any) {
      setError(err.message || 'Failed to add driver');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="adddriver-modal-overlay">
      <div className="adddriver-modal-container">
        <div className="adddriver-modal-header">
          <div className="adddriver-icon-header">
            <img src="/Media/bus-03.png" alt="Bus" className="adddriver-icon-img adddriver-bus-icon" />
          </div>
          <button className="adddriver-close-button" onClick={onClose}>
            <span>×</span>
          </button>
        </div>

        <div className="adddriver-modal-content">
          <div className="adddriver-title-section">
            <h2 className="adddriver-modal-title">Add Driver Vehicle</h2>
            <div className="adddriver-progress-indicator">
              <img src="/Media/Group 204.png" alt="Step 2/2" className="adddriver-progress-icon-img" />
            </div>
          </div>

          <div className="adddriver-form">
            <div className="adddriver-form-row">
              <div className="adddriver-form-group">
                <label className="adddriver-form-label">Plate Number*</label>
                <input
                  type="text"
                  className="adddriver-form-input"
                  placeholder="Type plate number"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                />
              </div>

              <div className="adddriver-form-group">
                <label className="adddriver-form-label">Vehicle Type*</label>
                <select
                  className="adddriver-form-select"
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                >
                  <option value="">Choose vehicle type</option>
                  {vehicleTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="adddriver-form-row">
              <div className="adddriver-form-group">
                <label className="adddriver-form-label">Route Plied*</label>
                <select
                  className="adddriver-form-select"
                  value={routePlied}
                  onChange={(e) => setRoutePlied(e.target.value)}
                >
                  <option value="">Choose route</option>
                  {routes.map((route) => (
                    <option key={route.id} value={route.id}>
                      {route.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="adddriver-form-group">
                <label className="adddriver-form-label">Park*</label>
                <select
                  className="adddriver-form-select"
                  value={park}
                  onChange={(e) => setPark(e.target.value)}
                >
                  <option value="">Choose park</option>
                  {parks.map((parkOption) => (
                    <option key={parkOption.id} value={parkOption.id}>
                      {parkOption.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {error && <div style={{ color: '#dc2626', marginTop: 8 }}>{error}</div>}
          </div>

          <div className="adddriver-modal-actions">
            <button className="adddriver-action-button adddriver-previous" onClick={onPreviousStep}>
              Previous step
            </button>
            <button className="adddriver-action-button adddriver-skip" onClick={onSkipForNow}>
              Skip for now
            </button>
            <button className="adddriver-action-button adddriver-save" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Details'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAddDriver;
