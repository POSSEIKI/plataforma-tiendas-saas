import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Sparkles, Navigation } from 'lucide-react';
import { geocodeColombianAddress, COLOMBIAN_BARRIOS, normalizeText } from '../../utils/geocoding';

interface SmartAddressSearchProps {
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
 * 100% FREE SMART ADDRESS SEARCH ENGINE FOR COLOMBIA
 * Zero API keys, Zero cost, High Precision Vector & Satellite Mapping
 */
export const SmartAddressSearch: React.FC<SmartAddressSearchProps> = ({
  ciudad = 'Cali',
  initialValue = '',
  onPlaceSelected,
}) => {
  const [inputVal, setInputVal] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<{ title: string; subtitle: string; lat: number; lng: number }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (initialValue && !inputVal) {
      setInputVal(initialValue);
    }
  }, [initialValue]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Execute location search
  const executeLocate = async (text: string) => {
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
      console.warn('Geocoding error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (val: string) => {
    setInputVal(val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!val || val.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    // Build smart local suggestions based on Colombian barrios & road geometry
    const normCity = normalizeText(ciudad);
    const normVal = normalizeText(val);
    const cityBarrios = COLOMBIAN_BARRIOS[normCity] || {};

    const localMatches: { title: string; subtitle: string; lat: number; lng: number }[] = [];

    // Check matching neighborhoods
    for (const [bName, coords] of Object.entries(cityBarrios)) {
      if (bName.includes(normVal) || normVal.includes(bName)) {
        localMatches.push({
          title: `Barrio ${bName.toUpperCase()}`,
          subtitle: `${ciudad}, Colombia`,
          lat: coords.lat,
          lng: coords.lng,
        });
      }
    }

    // If it's a structured address (contains numbers), calculate vector coords
    if (/\d+/.test(val)) {
      geocodeColombianAddress(val, ciudad).then(res => {
        if (res) {
          const directMatch = {
            title: val,
            subtitle: `${res.displayName} (${ciudad})`,
            lat: res.lat,
            lng: res.lng,
          };
          setSuggestions([directMatch, ...localMatches].slice(0, 5));
          setShowDropdown(true);

          // Auto-move map gently
          onPlaceSelected({
            direccionCompleta: val,
            lat: res.lat,
            lng: res.lng,
          });
        }
      });
    } else if (localMatches.length > 0) {
      setSuggestions(localMatches.slice(0, 5));
      setShowDropdown(true);
    }

    // Real-time debounced locate
    debounceTimerRef.current = setTimeout(() => {
      executeLocate(val);
    }, 400);
  };

  const handleSelectSuggestion = (item: { title: string; subtitle: string; lat: number; lng: number }) => {
    setInputVal(item.title);
    setShowDropdown(false);
    onPlaceSelected({
      direccionCompleta: item.title,
      lat: item.lat,
      lng: item.lng,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions.length > 0 && showDropdown) {
        handleSelectSuggestion(suggestions[0]);
      } else {
        executeLocate(inputVal);
        setShowDropdown(false);
      }
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={inputVal}
            onChange={e => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Escribe la dirección en ${ciudad} (ej: Cr 101b # 11b-28 Ciudad Campestre, Calle 17 # 3-26 San Nicolás)...`}
            className="w-full pl-10 pr-10 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white shadow-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          {isLoading && (
            <div className="absolute right-3 top-3.5 w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          )}
        </div>

        {/* Locate Action Button */}
        <button
          type="button"
          onClick={() => executeLocate(inputVal)}
          disabled={isLoading || !inputVal}
          className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition whitespace-nowrap"
        >
          <Navigation className="w-4 h-4" />
          <span>Ubicar en Mapa</span>
        </button>
      </div>

      {/* Smart Suggestions Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-14 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 divide-y divide-slate-100 dark:divide-slate-800">
          <div className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>Sugerencias de Ubicación en {ciudad}</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              100% Gratuito & Preciso
            </span>
          </div>

          {suggestions.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectSuggestion(item)}
              className="w-full px-4 py-3 text-left text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-start gap-3 transition"
            >
              <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 truncate">
                <span className="font-bold text-slate-900 dark:text-white block truncate">
                  {item.title}
                </span>
                <span className="text-[10px] text-slate-400 block truncate">
                  {item.subtitle}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
