import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { APIProvider, Map, AdvancedMarker, InfoWindow, Pin } from '@vis.gl/react-google-maps';
import { Search, Navigation, MapPin, ExternalLink, RefreshCw, Locate, X, Filter } from 'lucide-react';
import { towersApi } from '../services/api';
import { Tower, TowerStatus } from '../types';
import './TowerMap.css';

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyB8JkFIRM2yg4rAxsUP6_EPZZ-K8qZ0v7Q';

const STATUS_COLORS: Record<TowerStatus, string> = {
  ACTIVE: '#00ff88',
  MAINTENANCE: '#f59e0b',
  OFFLINE: '#64748b',
  CRITICAL: '#ff4757',
};

const TowerMap = () => {
  const navigate = useNavigate();
  const [towers, setTowers] = useState<Tower[]>([]);
  const [filteredTowers, setFilteredTowers] = useState<Tower[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTower, setSelectedTower] = useState<Tower | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'pending' | 'granted' | 'denied' | 'unavailable'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TowerStatus | 'ALL'>('ALL');
  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 }); // India center

  // Get user location
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus('unavailable');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus('granted');
      },
      () => setLocationStatus('denied'),
      { timeout: 10000 }
    );
  }, []);

  // Fetch towers
  const fetchTowers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await towersApi.getAll();
      setTowers(res.data.data || []);
    } catch {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTowers(); }, [fetchTowers]);

  // Filter towers
  useEffect(() => {
    let filtered = towers;
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.towerId.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.location.city.toLowerCase().includes(q) ||
        t.location.state.toLowerCase().includes(q)
      );
    }
    setFilteredTowers(filtered);
  }, [towers, searchQuery, statusFilter]);

  const handleNavigateToTower = (tower: Tower) => {
    const { latitude, longitude } = tower.location;
    const origin = userLocation
      ? `${userLocation.lat},${userLocation.lng}`
      : '';
    const destination = `${latitude},${longitude}`;
    const url = origin
      ? `https://www.google.com/maps/dir/${origin}/${destination}`
      : `https://www.google.com/maps/search/?api=1&query=${destination}`;
    window.open(url, '_blank');
  };

  const handleLocateMe = () => {
    if (userLocation) {
      setMapCenter(userLocation);
    }
  };

  const handleTowerSelect = (tower: Tower) => {
    setSelectedTower(tower);
    setMapCenter({ lat: tower.location.latitude, lng: tower.location.longitude });
  };

  // If Google Maps API key is not provided, use full interactive OpenStreetMap fallback
  const isGoogleMapsConfigured = MAPS_API_KEY && MAPS_API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE';

  return (
    <div className="map-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Tower Map</h1>
          <p className="page-subtitle">
            {filteredTowers.length} of {towers.length} towers •{' '}
            {locationStatus === 'granted' ? '📍 Location active' : locationStatus === 'denied' ? '📍 Location denied' : '📍 Requesting location...'}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <button className="btn btn-secondary btn-sm" onClick={fetchTowers} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spin-icon' : ''} /> Refresh
          </button>
          {userLocation && (
            <button className="btn btn-secondary btn-sm" onClick={handleLocateMe}>
              <Locate size={14} /> My Location
            </button>
          )}
        </div>
      </div>

      <div className="map-container">
        {/* Sidebar */}
        <div className="map-sidebar">
          {/* Search */}
          <div className="map-search">
            <div className="input-wrapper">
              <Search size={14} className="input-icon" />
              <input
                type="text"
                className="form-input input-with-icon"
                placeholder="Search towers..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="input-icon-right" onClick={() => setSearchQuery('')}>
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Status Filter */}
          <div className="map-filters">
            {(['ALL', 'ACTIVE', 'MAINTENANCE', 'OFFLINE', 'CRITICAL'] as const).map(status => (
              <button
                key={status}
                className={`filter-btn ${statusFilter === status ? 'active' : ''}`}
                style={statusFilter === status && status !== 'ALL' ? { borderColor: STATUS_COLORS[status as TowerStatus], color: STATUS_COLORS[status as TowerStatus] } : undefined}
                onClick={() => setStatusFilter(status)}
              >
                {status !== 'ALL' && (
                  <span className="filter-dot" style={{ background: STATUS_COLORS[status as TowerStatus] }} />
                )}
                {status}
              </button>
            ))}
          </div>

          {/* Location status */}
          {locationStatus === 'denied' && (
            <div className="location-notice">
              <MapPin size={14} />
              Location access denied. Navigation will use tower coordinates as destination only.
            </div>
          )}

          {/* Tower list */}
          <div className="tower-list">
            {loading ? (
              <div className="loading-container" style={{ height: '200px' }}>
                <div className="spinner" />
                <p className="text-sm text-muted">Loading towers...</p>
              </div>
            ) : filteredTowers.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <MapPin size={24} />
                <p>No towers found</p>
              </div>
            ) : (
              filteredTowers.map(tower => (
                <div
                  key={tower._id}
                  className={`tower-list-item ${selectedTower?._id === tower._id ? 'selected' : ''}`}
                  onClick={() => handleTowerSelect(tower)}
                >
                  <div
                    className="tower-status-dot"
                    style={{ background: STATUS_COLORS[tower.status] }}
                  />
                  <div className="tower-list-info">
                    <span className="tower-list-id">{tower.towerId}</span>
                    <span className="tower-list-name">{tower.name}</span>
                    <span className="tower-list-city">{tower.location.city}, {tower.location.state}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Legend */}
          <div className="map-legend">
            <div className="legend-title">Legend</div>
            {Object.entries(STATUS_COLORS).map(([status, color]) => (
              <div key={status} className="legend-item">
                <span className="legend-dot" style={{ background: color }} />
                <span>{status}</span>
              </div>
            ))}
            <div className="legend-item">
              <span className="legend-dot" style={{ background: '#00d4ff' }} />
              <span>Current Location</span>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="map-wrapper" style={{ position: 'relative', flex: 1, minHeight: '500px' }}>
          {isGoogleMapsConfigured ? (
            <APIProvider apiKey={MAPS_API_KEY}>
              <Map
                mapId="telecom-tower-map"
                center={mapCenter}
                zoom={5}
                style={{ width: '100%', height: '100%' }}
                colorScheme="DARK"
                gestureHandling="greedy"
                disableDefaultUI={false}
              >
                {/* User location marker */}
                {userLocation && (
                  <AdvancedMarker position={userLocation} title="Your Location">
                    <div className="user-marker">
                      <Locate size={16} color="#00d4ff" />
                    </div>
                  </AdvancedMarker>
                )}

                {/* Tower markers */}
                {filteredTowers.map(tower => (
                  <AdvancedMarker
                    key={tower._id}
                    position={{ lat: tower.location.latitude, lng: tower.location.longitude }}
                    onClick={() => setSelectedTower(tower)}
                    title={tower.name}
                  >
                    <Pin
                      background={STATUS_COLORS[tower.status]}
                      borderColor={STATUS_COLORS[tower.status]}
                      glyphColor="#000"
                    />
                  </AdvancedMarker>
                ))}

                {/* Info window */}
                {selectedTower && (
                  <InfoWindow
                    position={{
                      lat: selectedTower.location.latitude,
                      lng: selectedTower.location.longitude,
                    }}
                    onCloseClick={() => setSelectedTower(null)}
                  >
                    <div className="info-window">
                      <div className="info-header">
                        <span className="info-tower-id">{selectedTower.towerId}</span>
                        <span
                          className="info-status"
                          style={{
                            background: `${STATUS_COLORS[selectedTower.status]}25`,
                            color: STATUS_COLORS[selectedTower.status],
                          }}
                        >
                          {selectedTower.status}
                        </span>
                      </div>
                      <h3 className="info-name">{selectedTower.name}</h3>
                      <div className="info-details">
                        <div><strong>Location:</strong> {selectedTower.location.city}, {selectedTower.location.state}</div>
                        <div><strong>Operator:</strong> {selectedTower.operator}</div>
                        <div><strong>Type:</strong> {selectedTower.towerType}</div>
                        <div><strong>Coordinates:</strong> {selectedTower.location.latitude.toFixed(4)}, {selectedTower.location.longitude.toFixed(4)}</div>
                        {selectedTower.lastInspectionDate && (
                          <div><strong>Last Inspection:</strong> {new Date(selectedTower.lastInspectionDate).toLocaleDateString()}</div>
                        )}
                      </div>
                      <div className="info-actions">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => navigate(`/towers?id=${selectedTower._id}`)}
                        >
                          <ExternalLink size={12} /> View Details
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleNavigateToTower(selectedTower)}
                        >
                          <Navigation size={12} /> Navigate
                        </button>
                      </div>
                    </div>
                  </InfoWindow>
                )}
              </Map>
            </APIProvider>
          ) : (
            /* Interactive OpenStreetMap Fallback View */
            <div className="osm-map-container" style={{ width: '100%', height: '100%', position: 'relative' }}>
              <iframe
                title="Telecom Towers Interactive Map"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapCenter.lng - 4}%2C${mapCenter.lat - 4}%2C${mapCenter.lng + 4}%2C${mapCenter.lat + 4}&layer=mapnik&marker=${mapCenter.lat}%2C${mapCenter.lng}`}
                style={{ border: 'none', filter: 'brightness(0.85) contrast(1.1) invert(0.9) hue-rotate(180deg)' }}
              />

              {/* Selected Tower Floating Card Overlay */}
              {selectedTower && (
                <div
                  className="card p-3 shadow-lg"
                  style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    width: '320px',
                    zIndex: 20,
                    background: 'rgba(15, 23, 42, 0.95)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid var(--color-border-active)',
                  }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="badge badge-info">{selectedTower.towerId}</span>
                    <button className="btn-icon" onClick={() => setSelectedTower(null)}>
                      <X size={14} />
                    </button>
                  </div>
                  <h3 className="text-base font-bold mb-1">{selectedTower.name}</h3>
                  <p className="text-xs text-muted mb-2">
                    📍 {selectedTower.location.address}, {selectedTower.location.city}, {selectedTower.location.state}
                  </p>

                  <div className="text-xs grid grid-cols-2 gap-1 mb-3 bg-slate-900 p-2 rounded">
                    <div><strong>Type:</strong> {selectedTower.towerType}</div>
                    <div><strong>Status:</strong> <span style={{ color: STATUS_COLORS[selectedTower.status] }}>{selectedTower.status}</span></div>
                    <div><strong>Height:</strong> {selectedTower.height || 45}m</div>
                    <div><strong>Operator:</strong> {selectedTower.operator}</div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      className="btn btn-primary btn-sm w-full"
                      onClick={() => navigate(`/towers?id=${selectedTower._id}`)}
                    >
                      <ExternalLink size={12} /> Details
                    </button>
                    <button
                      className="btn btn-secondary btn-sm w-full"
                      onClick={() => handleNavigateToTower(selectedTower)}
                    >
                      <Navigation size={12} /> Navigate
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TowerMap;
