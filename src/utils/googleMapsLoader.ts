/**
 * Google Maps Platform SDK Dynamic Loader
 * Loads the official Google Maps JavaScript API with Places library
 */

let googleScriptLoadingPromise: Promise<void> | null = null;

export function loadGoogleMapsScript(apiKey: string): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();

  if ((window as any).google && (window as any).google.maps && (window as any).google.maps.places) {
    return Promise.resolve();
  }

  if (!apiKey || apiKey.trim().length === 0) {
    return Promise.reject(new Error('No Google Maps API Key provided'));
  }

  if (googleScriptLoadingPromise) {
    return googleScriptLoadingPromise;
  }

  googleScriptLoadingPromise = new Promise((resolve, reject) => {
    // Check if already injected
    const existing = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', (e) => reject(e));
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey.trim())}&libraries=places,marker&language=es&region=CO`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (e) => {
      googleScriptLoadingPromise = null;
      reject(e);
    };
    document.head.appendChild(script);
  });

  return googleScriptLoadingPromise;
}
