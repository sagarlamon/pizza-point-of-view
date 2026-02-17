import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { STORE_CONFIG, calculateDistance } from '../data/mockData';
import { ArrowLeftIcon, LocationIcon, CheckIcon } from './Icons';
import { cn } from '../utils/cn';

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number }, distance: number) => void;
  onClose: () => void;
  initialLocation?: { lat: number; lng: number } | null;
}

export function LocationPicker({ onLocationSelect, onClose, initialLocation }: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(
    initialLocation || null
  );
  const [distance, setDistance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate distance whenever location changes
  useEffect(() => {
    if (selectedLocation) {
      const dist = calculateDistance(
        STORE_CONFIG.location.lat,
        STORE_CONFIG.location.lng,
        selectedLocation.lat,
        selectedLocation.lng
      );
      setDistance(dist);
    }
  }, [selectedLocation]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Default center - store location or initial location
    const defaultCenter = initialLocation || STORE_CONFIG.location;

    const map = L.map(mapRef.current, {
      center: [defaultCenter.lat, defaultCenter.lng],
      zoom: 15,
      zoomControl: false,
    });

    // Add zoom control to bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Store marker (fixed)
    const storeIcon = L.divIcon({
      html: `
        <div style="
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #f97316, #ea580c);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
          border: 3px solid white;
        ">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C7.58 2 4 5.58 4 10c0 5.25 8 12 8 12s8-6.75 8-12c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
          </svg>
        </div>
      `,
      className: 'store-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    });

    L.marker([STORE_CONFIG.location.lat, STORE_CONFIG.location.lng], { icon: storeIcon })
      .addTo(map)
      .bindPopup('<strong>Flash Pizza Store</strong><br/>Your order ships from here');

    // Delivery radius circle
    L.circle([STORE_CONFIG.location.lat, STORE_CONFIG.location.lng], {
      color: '#f97316',
      fillColor: '#f97316',
      fillOpacity: 0.1,
      radius: STORE_CONFIG.maxDeliveryRadius * 1000, // Convert km to meters
      weight: 2,
      dashArray: '10, 10',
    }).addTo(map);

    // User marker (draggable)
    const userIcon = L.divIcon({
      html: `
        <div style="
          width: 36px;
          height: 36px;
          background: #3b82f6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
          border: 3px solid white;
          cursor: grab;
        ">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
      `,
      className: 'user-marker',
      iconSize: [36, 36],
      iconAnchor: [18, 36],
    });

    if (initialLocation) {
      const marker = L.marker([initialLocation.lat, initialLocation.lng], {
        icon: userIcon,
        draggable: true,
      }).addTo(map);

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        setSelectedLocation({ lat: pos.lat, lng: pos.lng });
      });

      markerRef.current = marker;
      setSelectedLocation(initialLocation);
    }

    // Click to place/move marker
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        const marker = L.marker([lat, lng], {
          icon: userIcon,
          draggable: true,
        }).addTo(map);

        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          setSelectedLocation({ lat: pos.lat, lng: pos.lng });
        });

        markerRef.current = marker;
      }

      setSelectedLocation({ lat, lng });
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [initialLocation]);

  // Get current location
  const handleGetCurrentLocation = () => {
    setIsLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation = { lat: latitude, lng: longitude };

        // Update marker position
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 17);

          const userIcon = L.divIcon({
            html: `
              <div style="
                width: 36px;
                height: 36px;
                background: #3b82f6;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
                border: 3px solid white;
                cursor: grab;
              ">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
            `,
            className: 'user-marker',
            iconSize: [36, 36],
            iconAnchor: [18, 36],
          });

          if (markerRef.current) {
            markerRef.current.setLatLng([latitude, longitude]);
          } else {
            const marker = L.marker([latitude, longitude], {
              icon: userIcon,
              draggable: true,
            }).addTo(mapInstanceRef.current);

            marker.on('dragend', () => {
              const pos = marker.getLatLng();
              setSelectedLocation({ lat: pos.lat, lng: pos.lng });
            });

            markerRef.current = marker;
          }
        }

        setSelectedLocation(newLocation);
        setIsLoading(false);
      },
      (err) => {
        console.error(err);
        setError('Unable to get your location. Please tap on the map to select manually.');
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleConfirmLocation = () => {
    if (selectedLocation && distance !== null) {
      onLocationSelect(selectedLocation, distance);
    }
  };

  const isWithinRange = distance !== null && distance <= STORE_CONFIG.maxDeliveryRadius;

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeftIcon size={24} className="text-gray-900 dark:text-white" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Select Delivery Location</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Tap on map or drag the pin</p>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="absolute inset-0" />

        {/* Current Location Button */}
        <button
          onClick={handleGetCurrentLocation}
          disabled={isLoading}
          className={cn(
            'absolute top-4 right-4 z-[1000]',
            'flex items-center gap-2 px-4 py-2.5 rounded-full',
            'bg-white dark:bg-gray-800 shadow-lg',
            'border border-gray-200 dark:border-gray-700',
            'text-gray-900 dark:text-white font-medium text-sm',
            'hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors',
            isLoading && 'opacity-70 cursor-wait'
          )}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              <span>Locating...</span>
            </>
          ) : (
            <>
              <LocationIcon size={18} className="text-blue-500" />
              <span>Use My Location</span>
            </>
          )}
        </button>

        {/* Error Message */}
        {error && (
          <div className="absolute top-4 left-4 right-20 z-[1000] bg-red-500 text-white px-4 py-2 rounded-lg text-sm shadow-lg">
            {error}
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-24 left-4 z-[1000] bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 text-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 border-2 border-white shadow" />
            <span className="text-gray-700 dark:text-gray-300">Flash Pizza Store</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow" />
            <span className="text-gray-700 dark:text-gray-300">Your Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-orange-500 border-dashed bg-orange-100" />
            <span className="text-gray-700 dark:text-gray-300">{STORE_CONFIG.maxDeliveryRadius} km delivery zone</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 pb-safe">
        {selectedLocation ? (
          <div className="space-y-3">
            {/* Distance Info */}
            <div
              className={cn(
                'flex items-center justify-between p-3 rounded-xl',
                isWithinRange
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              )}
            >
              <div className="flex items-center gap-2">
                <LocationIcon
                  size={20}
                  className={isWithinRange ? 'text-green-600' : 'text-red-500'}
                />
                <span className={cn(
                  'font-medium',
                  isWithinRange ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                )}>
                  {distance?.toFixed(1)} km from store
                </span>
              </div>
              {isWithinRange ? (
                <span className="text-green-600 dark:text-green-400 text-sm font-medium flex items-center gap-1">
                  <CheckIcon size={16} />
                  Deliverable
                </span>
              ) : (
                <span className="text-red-500 text-sm font-medium">
                  Out of range
                </span>
              )}
            </div>

            {/* Confirm Button */}
            <button
              onClick={handleConfirmLocation}
              disabled={!isWithinRange}
              className={cn(
                'w-full py-4 rounded-2xl font-bold text-lg transition-all',
                isWithinRange
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 active:scale-[0.98]'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              )}
            >
              {isWithinRange ? 'Confirm Location' : `Delivery available within ${STORE_CONFIG.maxDeliveryRadius} km only`}
            </button>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 dark:text-gray-400">
              Tap on the map to select your delivery location
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
