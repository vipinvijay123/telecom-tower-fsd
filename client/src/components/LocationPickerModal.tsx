import React, { useState, useEffect, useCallback, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { Search, Locate, MapPin, X, Check, Loader2, Navigation, ZoomIn, ZoomOut } from 'lucide-react';
import './LocationPickerModal.css';

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  country: string;
}

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLocation?: {
    latitude?: number;
    longitude?: number;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  onSelectLocation: (data: LocationData) => void;
}

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  lat: number;
  lng: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
  initialLocation,
  onSelectLocation,
}) => {
  const defaultLat = initialLocation?.latitude && !isNaN(initialLocation.latitude) ? initialLocation.latitude : 20.5937;
  const defaultLng = initialLocation?.longitude && !isNaN(initialLocation.longitude) ? initialLocation.longitude : 78.9629;

  const [lat, setLat] = useState<number>(defaultLat);
  const [lng, setLng] = useState<number>(defaultLng);
  const [zoom, setZoom] = useState<number>(13);
  const [address, setAddress] = useState<string>(initialLocation?.address || '');
  const [city, setCity] = useState<string>(initialLocation?.city || '');
  const [state, setState] = useState<string>(initialLocation?.state || '');
  const [country, setCountry] = useState<string>(initialLocation?.country || 'India');

  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: defaultLat,
    lng: defaultLng,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [locationError, setLocationError] = useState('');
  
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      const curLat = initialLocation?.latitude && !isNaN(initialLocation.latitude) ? initialLocation.latitude : 20.5937;
      const curLng = initialLocation?.longitude && !isNaN(initialLocation.longitude) ? initialLocation.longitude : 78.9629;
      setLat(curLat);
      setLng(curLng);
      setZoom(13);
      setAddress(initialLocation?.address || '');
      setCity(initialLocation?.city || '');
      setState(initialLocation?.state || '');
      setCountry(initialLocation?.country || 'India');
      setMapCenter({ lat: curLat, lng: curLng });
      setLocationError('');
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [isOpen, initialLocation]);

  // Reverse geocode lat/lng to get address details
  const reverseGeocode = useCallback(async (latitude: number, longitude: number) => {
    setIsReverseGeocoding(true);
    try {
      // 1. Try Photon reverse geocoding first (fast, open CORS)
      const res = await fetch(
        `https://photon.komoot.io/reverse?lat=${latitude}&lon=${longitude}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.features && data.features.length > 0) {
          const props = data.features[0].properties;
          const detectedCity = props.city || props.town || props.village || props.county || props.district || '';
          const detectedState = props.state || '';
          const detectedCountry = props.country || 'India';
          const road = props.name || props.street || props.district || '';

          if (road) setAddress(road);
          if (detectedCity) setCity(detectedCity);
          if (detectedState) setState(detectedState);
          if (detectedCountry) setCountry(detectedCountry);
          return;
        }
      }

      // 2. Fallback to Nominatim reverse geocoding
      const nomRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
      );
      if (nomRes.ok) {
        const data = await nomRes.json();
        if (data && data.address) {
          const addr = data.address;
          const detectedCity = addr.city || addr.town || addr.village || addr.suburb || addr.county || '';
          const detectedState = addr.state || addr.state_district || '';
          const detectedCountry = addr.country || 'India';
          const roadParts = [addr.road, addr.suburb, addr.neighbourhood].filter(Boolean);
          const streetAddr = roadParts.length > 0 ? roadParts.join(', ') : (data.display_name?.split(',')[0] || '');

          if (streetAddr) setAddress(streetAddr);
          if (detectedCity) setCity(detectedCity);
          if (detectedState) setState(detectedState);
          if (detectedCountry) setCountry(detectedCountry);
        }
      }
    } catch {
      // Ignore geocoding errors silently
    } finally {
      setIsReverseGeocoding(false);
    }
  }, []);

  // Search places using multi-provider search (Photon + Nominatim)
  const performSearch = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const results: SearchResultItem[] = [];

    try {
      // Provider 1: Photon API (Komoot OpenStreetMap index - reliable CORS, instant search)
      const res = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=6`
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.features) {
          data.features.forEach((feat: any, idx: number) => {
            const props = feat.properties;
            const coords = feat.geometry.coordinates; // [lng, lat]
            const name = props.name || props.street || query;
            const sub = [props.city || props.town, props.state, props.country].filter(Boolean).join(', ');
            
            results.push({
              id: `photon-${idx}-${props.osm_id || Math.random()}`,
              title: name,
              subtitle: sub || name,
              lat: coords[1],
              lng: coords[0],
              address: props.street || props.name || '',
              city: props.city || props.town || props.county || '',
              state: props.state || '',
              country: props.country || 'India',
            });
          });
        }
      }
    } catch {
      // Ignore photon error
    }

    // Provider 2: Nominatim fallback if photon returned no results
    if (results.length === 0) {
      try {
        const nomRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query
          )}&addressdetails=1&limit=5`
        );
        if (nomRes.ok) {
          const nomData = await nomRes.json();
          nomData.forEach((item: any, idx: number) => {
            const addr = item.address || {};
            results.push({
              id: `nom-${idx}-${item.place_id}`,
              title: item.display_name.split(',')[0],
              subtitle: item.display_name,
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon),
              address: [addr.road, addr.suburb].filter(Boolean).join(', ') || item.display_name.split(',')[0],
              city: addr.city || addr.town || addr.village || addr.county || '',
              state: addr.state || '',
              country: addr.country || 'India',
            });
          });
        }
      } catch {
        // Ignore nominatim error
      }
    }

    setSearchResults(results);
    setIsSearching(false);
  };

  // Debounce search query input
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!val.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(val);
    }, 300);
  };

  // Handle selecting a search recommendation
  const handleSelectSearchResult = (result: SearchResultItem) => {
    const newLat = Number(result.lat.toFixed(6));
    const newLng = Number(result.lng.toFixed(6));

    setLat(newLat);
    setLng(newLng);
    setZoom(15);
    setMapCenter({ lat: newLat, lng: newLng });

    if (result.address) setAddress(result.address);
    if (result.city) setCity(result.city);
    if (result.state) setState(result.state);
    if (result.country) setCountry(result.country);

    setSearchResults([]);
    setSearchQuery('');
  };

  // Get user's current GPS location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLat = Number(position.coords.latitude.toFixed(6));
        const newLng = Number(position.coords.longitude.toFixed(6));

        setLat(newLat);
        setLng(newLng);
        setZoom(15);
        setMapCenter({ lat: newLat, lng: newLng });
        setIsLocating(false);

        reverseGeocode(newLat, newLng);
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location access denied by user.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information unavailable.');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timed out.');
            break;
          default:
            setLocationError('Could not retrieve current location.');
            break;
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Handle map click
  const handleMapClick = (event: { detail?: { latLng?: { lat: number; lng: number } } }) => {
    if (event?.detail?.latLng) {
      const clickLat = Number(event.detail.latLng.lat.toFixed(6));
      const clickLng = Number(event.detail.latLng.lng.toFixed(6));
      setLat(clickLat);
      setLng(clickLng);
      reverseGeocode(clickLat, clickLng);
    }
  };

  const handleConfirm = () => {
    onSelectLocation({
      latitude: lat,
      longitude: lng,
      address,
      city,
      state,
      country,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="location-picker-modal modal" style={{ maxWidth: '800px', width: '95%' }}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title flex items-center gap-2">
              <MapPin size={20} className="text-accent" />
              Pick & Plot Tower Location
            </h2>
            <p className="text-xs text-muted">
              Search a place, use GPS, or click on the map to set tower coordinates.
            </p>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Toolbar: Search + GPS */}
        <div className="location-toolbar">
          <div className="search-container">
            <div className="input-wrapper" style={{ position: 'relative' }}>
              <Search size={16} className="search-icon text-muted" />
              <input
                type="text"
                className="form-input search-input"
                placeholder="Type any place (e.g. Chennai, MG Road, Connaught Place)..."
                value={searchQuery}
                onChange={handleSearchInputChange}
              />
              {isSearching && (
                <Loader2 size={16} className="spin-icon search-loader text-accent" />
              )}
            </div>

            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="search-results-dropdown">
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    className="search-result-item"
                    onClick={() => handleSelectSearchResult(result)}
                  >
                    <Navigation size={14} className="text-accent flex-shrink-0" />
                    <div className="search-result-text">
                      <span className="search-result-title">{result.title}</span>
                      <span className="search-result-sub text-xs text-muted truncate">
                        {result.subtitle}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-locate"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
          >
            {isLocating ? (
              <Loader2 size={16} className="spin-icon" />
            ) : (
              <Locate size={16} className="text-accent" />
            )}
            <span>Use My Location</span>
          </button>
        </div>

        {locationError && (
          <div className="location-error-alert text-xs text-danger mb-2">
            ⚠️ {locationError}
          </div>
        )}

        {/* Map Container */}
        <div className="location-picker-map-wrapper">
          {MAPS_API_KEY && MAPS_API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE' ? (
            <APIProvider apiKey={MAPS_API_KEY}>
              <Map
                mapId="location-picker-map"
                defaultCenter={mapCenter}
                defaultZoom={13}
                center={mapCenter}
                zoom={zoom}
                onCameraChanged={(ev) => {
                  setMapCenter(ev.detail.center);
                  setZoom(ev.detail.zoom);
                }}
                style={{ width: '100%', height: '100%' }}
                colorScheme="DARK"
                gestureHandling="greedy"
                disableDefaultUI={false}
                zoomControl={true}
                scrollwheel={true}
                onClick={handleMapClick}
              >
                <AdvancedMarker
                  position={{ lat, lng }}
                  draggable={true}
                  onDragEnd={(e) => {
                    if (e.latLng) {
                      const newLat = Number(e.latLng.lat().toFixed(6));
                      const newLng = Number(e.latLng.lng().toFixed(6));
                      setLat(newLat);
                      setLng(newLng);
                      reverseGeocode(newLat, newLng);
                    }
                  }}
                  title="Tower Location"
                >
                  <Pin background="#00d4ff" borderColor="#00d4ff" glyphColor="#000" />
                </AdvancedMarker>
              </Map>
            </APIProvider>
          ) : (
            /* Interactive OpenStreetMap iframe with interactive zoom & drag fallback */
            <div className="interactive-osm-wrapper" style={{ width: '100%', height: '100%', position: 'relative' }}>
              <iframe
                title="Interactive Tower Location Map"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.03}%2C${lat - 0.03}%2C${lng + 0.03}%2C${lat + 0.03}&layer=mapnik&marker=${lat}%2C${lng}`}
                style={{ border: 'none' }}
              />
              <div className="osm-zoom-controls">
                <button
                  type="button"
                  className="btn-icon zoom-btn"
                  onClick={() => setZoom((z) => Math.min(z + 1, 18))}
                  title="Zoom In"
                >
                  <ZoomIn size={16} />
                </button>
                <button
                  type="button"
                  className="btn-icon zoom-btn"
                  onClick={() => setZoom((z) => Math.max(z - 1, 3))}
                  title="Zoom Out"
                >
                  <ZoomOut size={16} />
                </button>
              </div>
            </div>
          )}

          <div className="map-instruction-overlay">
            💡 Click or drag marker to set precise coordinates ({lat.toFixed(4)}, {lng.toFixed(4)})
          </div>
        </div>

        {/* Form Inputs Preview */}
        <div className="location-details-form grid grid-cols-2 gap-3 mt-3">
          <div className="form-group">
            <label className="form-label">Latitude</label>
            <input
              type="number"
              step="any"
              className="form-input"
              value={lat}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val)) {
                  setLat(val);
                  setMapCenter((c) => ({ ...c, lat: val }));
                }
              }}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Longitude</label>
            <input
              type="number"
              step="any"
              className="form-input"
              value={lng}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val)) {
                  setLng(val);
                  setMapCenter((c) => ({ ...c, lng: val }));
                }
              }}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Address / Landmark</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. MG Road, Near Central Station"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">City</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Bengaluru"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">State</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Karnataka"
              value={state}
              onChange={(e) => setState(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Country</label>
            <input
              type="text"
              className="form-input"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>
        </div>

        {isReverseGeocoding && (
          <div className="text-xs text-accent mt-2 flex items-center gap-1">
            <Loader2 size={12} className="spin-icon" /> Fetching location details...
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex gap-2 justify-between mt-4">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleConfirm}>
            <Check size={16} /> Confirm Location & Coordinates
          </button>
        </div>
      </div>
    </div>
  );
};
