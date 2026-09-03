import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { Layers, MapPin, ZoomIn, ZoomOut, Crosshair } from 'lucide-react';
import { reverseGeocodeColombian } from '../../utils/geocoding';

interface InteractiveMapProps {
  lat: number;
  lng: number;
  coberturaKm: number;
  ciudad?: string;
  onLocationChange?: (lat: number, lng: number) => void;
  editable?: boolean;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  lat,
  lng,
  coberturaKm,
  ciudad = 'Cali',
  onLocationChange,
  editable = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [mapType, setMapType] = useState<'streets' | 'satellite'>('streets');
  const [addressPreview, setAddressPreview] = useState<string | null>(null);

  const mapboxToken = (import.meta as any).env?.VITE_MAPBOX_TOKEN;

  // High-DPI 512px Retina tiles with large, crisp, high-contrast street names
  const TILES = {
    streets: mapboxToken
      ? `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/512/{z}/{x}/{y}@2x?access_token=${mapboxToken}`
      : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: mapboxToken
      ? `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/512/{z}/{x}/{y}@2x?access_token=${mapboxToken}`
      : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  };

  const updatePreviewText = useCallback(async (targetLat: number, targetLng: number) => {
    try {
      const rev = await reverseGeocodeColombian(targetLat, targetLng);
      if (rev) {
        setAddressPreview(rev.split(',').slice(0, 3).join(', '));
      } else {
        setAddressPreview(`📍 GPS: ${targetLat.toFixed(5)}, ${targetLng.toFixed(5)}`);
      }
    } catch {
      setAddressPreview(`📍 GPS: ${targetLat.toFixed(5)}, ${targetLng.toFixed(5)}`);
    }
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Custom Map Marker Icon with glowing radar pulse
    const customIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="position: relative; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 42px; height: 42px; background: rgba(16, 185, 129, 0.4); border-radius: 50%; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 34px; height: 34px; background-color: #059669; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 4px 14px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; color: white;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
        </div>
      `,
      iconSize: [42, 42],
      iconAnchor: [21, 38],
    });

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([lat, lng], 17);

      const tileLayer = L.tileLayer(TILES[mapType], {
        maxZoom: 20,
        tileSize: mapboxToken ? 512 : 256,
        zoomOffset: mapboxToken ? -1 : 0,
      }).addTo(map);

      const marker = L.marker([lat, lng], {
        draggable: editable,
        icon: customIcon,
      }).addTo(map);

      const circle = L.circle([lat, lng], {
        color: '#059669',
        fillColor: '#34d399',
        fillOpacity: 0.16,
        weight: 2,
        radius: coberturaKm * 1000,
      }).addTo(map);

      if (editable) {
        marker.on('dragend', () => {
          const newPos = marker.getLatLng();
          circle.setLatLng(newPos);
          if (onLocationChange) {
            onLocationChange(newPos.lat, newPos.lng);
          }
          updatePreviewText(newPos.lat, newPos.lng);
        });

        map.on('click', (e) => {
          marker.setLatLng(e.latlng);
          circle.setLatLng(e.latlng);
          if (onLocationChange) {
            onLocationChange(e.latlng.lat, e.latlng.lng);
          }
          updatePreviewText(e.latlng.lat, e.latlng.lng);
        });
      }

      mapInstanceRef.current = map;
      markerRef.current = marker;
      circleRef.current = circle;
      tileLayerRef.current = tileLayer;

      updatePreviewText(lat, lng);
    } else {
      const currentCenter = mapInstanceRef.current.getCenter();
      const dist = Math.sqrt(Math.pow(currentCenter.lat - lat, 2) + Math.pow(currentCenter.lng - lng, 2));
      
      if (dist < 0.008) {
        mapInstanceRef.current.panTo([lat, lng], { animate: true, duration: 0.4 });
      } else {
        mapInstanceRef.current.flyTo([lat, lng], 16, { duration: 0.6 });
      }

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      }
      if (circleRef.current) {
        circleRef.current.setLatLng([lat, lng]);
        circleRef.current.setRadius(coberturaKm * 1000);
      }
      updatePreviewText(lat, lng);
    }
  }, [lat, lng, coberturaKm, editable, onLocationChange, updatePreviewText]);

  // Handle map type change
  useEffect(() => {
    if (mapInstanceRef.current && tileLayerRef.current) {
      tileLayerRef.current.setUrl(TILES[mapType]);
    }
  }, [mapType]);

  const handleZoom = (delta: number) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() + delta);
    }
  };

  return (
    <div className="space-y-2">
      {/* Map Viewport */}
      <div className="relative w-full h-80 md:h-[420px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner z-0 group">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Map Controls (Top Right) */}
        <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 z-[400]">
          {/* Layer Selector */}
          <div className="flex bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl p-1 shadow-lg border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setMapType('streets')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                mapType === 'streets'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Calles</span>
            </button>
            <button
              type="button"
              onClick={() => setMapType('satellite')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                mapType === 'satellite'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Satélite HD</span>
            </button>
          </div>
        </div>

        {/* Zoom Controls (Top Left) */}
        <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 z-[400]">
          <button
            type="button"
            onClick={() => handleZoom(1)}
            className="w-8 h-8 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-700 dark:text-slate-200 flex items-center justify-center shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            title="Acercar mapa"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleZoom(-1)}
            className="w-8 h-8 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-700 dark:text-slate-200 flex items-center justify-center shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            title="Alejar mapa"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Real-time Address Badge (Bottom Left) */}
        <div className="absolute bottom-3.5 left-3.5 z-[400] max-w-[85%] sm:max-w-md">
          <div className="px-3.5 py-2 rounded-xl bg-slate-900/90 backdrop-blur-md text-white border border-slate-700/80 shadow-xl flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0"></span>
            <div className="text-[11px] truncate">
              <span className="font-bold text-slate-300">Radio de despacho: {coberturaKm} km</span>
              {addressPreview && (
                <span className="text-emerald-300 font-bold block truncate mt-0.5">
                  • {addressPreview}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Coordinates Pill (Bottom Right) */}
        <div className="absolute bottom-3.5 right-3.5 z-[400] hidden sm:block">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/85 backdrop-blur-md text-white border border-slate-700 text-[10px] font-mono shadow-md flex items-center gap-1.5">
            <Crosshair className="w-3 h-3 text-emerald-400" />
            <span>GPS: {lat.toFixed(5)}, {lng.toFixed(5)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
