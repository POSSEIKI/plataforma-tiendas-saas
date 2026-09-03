import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Sparkles, Navigation } from 'lucide-react';
import { loadGoogleMapsScript } from '../../utils/googleMapsLoader';
import { geocodeColombianAddress } from '../../utils/geocoding';

interface GoogleMapsAutocompleteProps {
  ciudad: string;
  initialValue?: string;
  onPlaceSelected: (place: {
    direccionCompleta: string;
    lat: number;
    lng: number;
    barrio?: string;
  }) => void;
}

/**
 * Clean, Seamless Google Maps Places Autocomplete
 * Zero Technical Friction for Merchants:
 * - Powered transparently by the SaaS platform's Master Google Maps Key
 * - Instant debounced map motion & Enter key support
 */
export const GoogleMapsAutocomplete: React.FC<GoogleMapsAutocompleteProps> = ({
  ciudad = 'Cali',
  initialValue = '',
  onPlaceSelected,
}) => {
  const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || localStorage.getItem('google_maps_api_key') || '';
  const [inputVal, setInputVal] = useState(initialValue);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Google Maps SDK with master platform key
  useEffect(() => {
    if (apiKey && apiKey.trim().length > 10) {
      loadGoogleMapsScript(apiKey.trim())
        .then(() => {
          setIsGoogleLoaded(true);
          initNativeAutocomplete();
        })
        .catch((err) => {
          console.warn('Could not load Google Maps SDK:', err);
          setIsGoogleLoaded(false);
        });
    }
  }, [apiKey]);

  // Attach Google Maps Places Autocomplete to the input
  const initNativeAutocomplete = () => {
    if (!inputRef.current || !(window as any).google?.maps?.places) return;

    try {
      const autocomplete = new (window as any).google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: 'co' },
        fields: ['address_components', 'geometry', 'formatted_address', 'name'],
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const formatted = place.formatted_address || place.name || inputRef.current?.value || '';
          setInputVal(formatted);
          onPlaceSelected({
            direccionCompleta: formatted,
            lat,
            lng,
          });
        }
      });

      autocompleteRef.current = autocomplete;
    } catch (e) {
      console.warn('Failed to bind Google Autocomplete:', e);
    }
  };

  // Instant direct geocode fallback
  const handleDirectLocate = async (text: string) => {
    if (!text || text.trim().length < 3) return;
    setIsLoading(true);

    try {
      const result = await geocodeColombianAddress(text, ciudad);
      if (result) {
        onPlaceSelected({
          direccionCompleta: text,
          lat: result.lat,
          lng: result.lng,
        });
      }
    } catch (e) {
      console.warn('Locate error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (val: string) => {
    setInputVal(val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!val || val.length < 3) return;

    // Automatic smooth locate while typing
    debounceTimerRef.current = setTimeout(() => {
      handleDirectLocate(val);
    }, 450);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleDirectLocate(inputVal);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={e => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Escribe la dirección del negocio (ej: Carrera 101 # 48-54 Valle del Lili o Calle 17 # 3-26 San Nicolás)...`}
            className="w-full pl-10 pr-10 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white shadow-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          {isLoading && (
            <div className="absolute right-3 top-3.5 w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          )}
        </div>

        {/* Locate Button */}
        <button
          type="button"
          onClick={() => handleDirectLocate(inputVal)}
          disabled={isLoading || !inputVal}
          className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition whitespace-nowrap"
        >
          <Navigation className="w-4 h-4" />
          <span>Ubicar en Mapa</span>
        </button>
      </div>

      {isGoogleLoaded && (
        <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1.5 px-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Autocompletado Satelital Inteligente Activo</span>
        </div>
      )}
    </div>
  );
};
