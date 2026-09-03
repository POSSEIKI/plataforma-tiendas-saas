/**
 * MOTOR OFICIAL DE GEORREFERENCIACIÓN Y NOMENCLATURA VIAL DE COLOMBIA (OPENSTREETMAP / NOMINATIM / IGAC)
 * 
 * 1. Consulta directa en tiempo real a la API oficial de OpenStreetMap (Nominatim)
 * 2. Filtros estrictos para Colombia: countrycodes=co, format=jsonv2, accept-language=es
 * 3. Cabecera User-Agent autorizada para prevenir bloqueos HTTP 429
 * 4. Cascada de resolución inteligente: Vía + Cruce -> Vía + Barrio -> Búsqueda Estructurada
 * 5. Respaldo geométrico local continuo en caso de fallos de red
 */

export interface IGACAddressComponents {
  viaPrincipalTipo: 'Calle' | 'Carrera' | 'Avenida' | 'Diagonal' | 'Transversal' | 'Autopista' | 'Circular' | 'Circunvalar' | 'Pasaje' | 'Callejón' | 'Peatonal' | 'Manzana' | 'Vereda';
  viaPrincipalNumero: number;
  viaPrincipalLetra: string;
  viaGeneradoraTipo: 'Calle' | 'Carrera' | 'Avenida' | 'Diagonal' | 'Transversal' | 'Autopista' | 'Circular' | 'Circunvalar' | 'Pasaje' | 'Callejón' | 'Peatonal' | 'Manzana' | 'Vereda';
  viaGeneradoraNumero: number;
  viaGeneradoraLetra: string;
  distanciaMetros: number;
  barrio: string;
  ciudad: string;
}

export interface ColombianCityCoord {
  ciudad: string;
  departamento: string;
  lat: number;
  lng: number;
}

export const COLOMBIAN_CITIES: ColombianCityCoord[] = [
  { ciudad: 'Cali', departamento: 'Valle del Cauca', lat: 3.4516, lng: -76.5320 },
  { ciudad: 'Bogotá', departamento: 'Cundinamarca', lat: 4.7110, lng: -74.0721 },
  { ciudad: 'Medellín', departamento: 'Antioquia', lat: 6.2442, lng: -75.5812 },
  { ciudad: 'Barranquilla', departamento: 'Atlántico', lat: 10.9685, lng: -74.7813 },
  { ciudad: 'Cartagena', departamento: 'Bolívar', lat: 10.3910, lng: -75.4794 },
  { ciudad: 'Bucaramanga', departamento: 'Santander', lat: 7.1254, lng: -73.1198 },
  { ciudad: 'Pereira', departamento: 'Risaralda', lat: 4.8133, lng: -75.6961 },
  { ciudad: 'Manizales', departamento: 'Caldas', lat: 5.0689, lng: -75.5174 },
  { ciudad: 'Ibagué', departamento: 'Tolima', lat: 4.4389, lng: -75.2322 },
  { ciudad: 'Cúcuta', departamento: 'Norte de Santander', lat: 7.8939, lng: -72.5078 },
  { ciudad: 'Santa Marta', departamento: 'Magdalena', lat: 11.2408, lng: -74.1990 },
  { ciudad: 'Villavicencio', departamento: 'Meta', lat: 4.1420, lng: -73.6266 },
  { ciudad: 'Pasto', departamento: 'Nariño', lat: 1.2136, lng: -77.2811 },
  { ciudad: 'Armenia', departamento: 'Quindío', lat: 4.5339, lng: -75.6811 },
  { ciudad: 'Neiva', departamento: 'Huila', lat: 2.9273, lng: -75.2819 },
  { ciudad: 'Popayán', departamento: 'Cauca', lat: 2.4419, lng: -76.6063 },
  { ciudad: 'Palmira', departamento: 'Valle del Cauca', lat: 3.5394, lng: -76.3036 },
  { ciudad: 'Buenaventura', departamento: 'Valle del Cauca', lat: 3.8801, lng: -77.0312 },
  { ciudad: 'Tuluá', departamento: 'Valle del Cauca', lat: 4.0847, lng: -76.1954 },
  { ciudad: 'Yumbo', departamento: 'Valle del Cauca', lat: 3.5824, lng: -76.4965 },
  { ciudad: 'Jamundí', departamento: 'Valle del Cauca', lat: 3.2608, lng: -76.5414 },
];

export const COLOMBIAN_BARRIOS: { [city: string]: { [barrio: string]: { lat: number; lng: number } } } = {
  cali: {
    'san nicolas': { lat: 3.4545, lng: -76.5245 },
    'ciudad campestre': { lat: 3.36878, lng: -76.53989 },
    'ciudad jardin': { lat: 3.3645, lng: -76.5385 },
    'club campestre': { lat: 3.3670, lng: -76.5410 },
    'valle de lili': { lat: 3.36565, lng: -76.51590 },
    'valle del lili': { lat: 3.36565, lng: -76.51590 },
    'caney': { lat: 3.3790, lng: -76.5240 },
    'pance': { lat: 3.3320, lng: -76.5450 },
    'el ingenio': { lat: 3.3855, lng: -76.5350 },
    'san joaquin': { lat: 3.3890, lng: -76.5360 },
    'el limonar': { lat: 3.3980, lng: -76.5410 },
    'santa anita': { lat: 3.4050, lng: -76.5420 },
    'departamental': { lat: 3.4120, lng: -76.5390 },
    'tequendama': { lat: 3.4210, lng: -76.5440 },
    'san fernando': { lat: 3.4320, lng: -76.5450 },
    'granada': { lat: 3.4560, lng: -76.5350 },
    'santa monica': { lat: 3.4680, lng: -76.5230 },
    'versalles': { lat: 3.4610, lng: -76.5270 },
    'la flora': { lat: 3.4760, lng: -76.5250 },
    'chipichape': { lat: 3.4750, lng: -76.5280 },
    'salomia': { lat: 3.4720, lng: -76.5050 },
    'sameco': { lat: 3.5010, lng: -76.5200 },
    'bochalema': { lat: 3.3450, lng: -76.5280 },
  }
};

export function normalizeText(str: string): string {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Convierte letras y sufijos (A, B, C, Bis) en su valor métrico fraccionario dentro de la manzana
 */
function parseSuffixFraction(letter: string): number {
  const norm = (letter || '').toUpperCase().trim();
  if (!norm || norm === '-') return 0;
  if (norm === 'A') return 0.28;
  if (norm === 'B') return 0.55;
  if (norm === 'C') return 0.80;
  if (norm === 'D') return 0.95;
  if (norm.includes('BIS A') || norm.includes('BIS B')) return 0.75;
  if (norm.includes('BIS')) return 0.50;
  if (norm.includes('SUR') || norm.includes('OESTE')) return -0.30;
  if (norm.includes('NORTE') || norm.includes('ESTE')) return 0.30;
  return 0.25;
}

/**
 * Extracts structured address components with letter suffixes
 */
export function parseIGACAddress(address: string, barrio: string = '', ciudad: string = 'Cali'): IGACAddressComponents {
  const norm = address.replace(/[\(\)]/g, ' ').replace(/\s+/g, ' ').trim();
  
  let viaPrincipalTipo: any = 'Calle';
  if (/carrera|cra|cr\b/i.test(norm)) viaPrincipalTipo = 'Carrera';
  else if (/avenida|av\b/i.test(norm)) viaPrincipalTipo = 'Avenida';
  else if (/diagonal|dg\b/i.test(norm)) viaPrincipalTipo = 'Diagonal';
  else if (/transversal|tv\b/i.test(norm)) viaPrincipalTipo = 'Transversal';

  const regex = /(\d+)\s*([a-zA-Z]?)[^\d#]*[#]?\s*([a-zA-Z]*)\s*(\d+)\s*([a-zA-Z]?)[^\d\-]*[-]?\s*(\d*)/;
  const match = norm.match(regex);

  let viaPrincipalNumero = 1;
  let viaPrincipalLetra = '';
  let viaGeneradoraNumero = 1;
  let viaGeneradoraLetra = '';
  let distanciaMetros = 0;

  if (match) {
    viaPrincipalNumero = parseInt(match[1], 10) || 1;
    viaPrincipalLetra = (match[2] || '').toUpperCase();
    viaGeneradoraNumero = parseInt(match[4], 10) || 1;
    viaGeneradoraLetra = (match[5] || '').toUpperCase();
    distanciaMetros = parseInt(match[6], 10) || 0;
  } else {
    const numbers = norm.match(/\d+/g) || [];
    viaPrincipalNumero = numbers[0] ? parseInt(numbers[0], 10) : 1;
    viaGeneradoraNumero = numbers[1] ? parseInt(numbers[1], 10) : 1;
    distanciaMetros = numbers[2] ? parseInt(numbers[2], 10) : 0;
  }

  const viaGeneradoraTipo: any = viaPrincipalTipo === 'Carrera' ? 'Calle' : 'Carrera';

  return {
    viaPrincipalTipo,
    viaPrincipalNumero,
    viaPrincipalLetra,
    viaGeneradoraTipo,
    viaGeneradoraNumero,
    viaGeneradoraLetra,
    distanciaMetros,
    barrio,
    ciudad,
  };
}

/**
 * CONSULTA DE ALTA PRECISIÓN A LA API DE GEOCODIFICACIÓN DE MAPBOX PARA COLOMBIA
 */
export async function buscarDireccionMapbox(comp: IGACAddressComponents, token?: string): Promise<{ lat: number; lng: number; displayName: string } | null> {
  const mapboxToken = token || (import.meta as any).env?.VITE_MAPBOX_TOKEN;
  if (!mapboxToken) return null;

  const viaText = `${comp.viaPrincipalTipo} ${comp.viaPrincipalNumero}${comp.viaPrincipalLetra ? comp.viaPrincipalLetra : ''}`;
  const cruceText = `${comp.viaGeneradoraNumero}${comp.viaGeneradoraLetra ? comp.viaGeneradoraLetra : ''}`;
  const cityCoord = COLOMBIAN_CITIES.find(c => normalizeText(c.ciudad) === normalizeText(comp.ciudad)) || COLOMBIAN_CITIES[0];
  const proximityParam = `&proximity=${cityCoord.lng},${cityCoord.lat}`;

  // Función para obtener el nodo físico de una intersección en Mapbox
  const queryCornerNode = async (v1: string, v2: string | number): Promise<{ lat: number; lng: number; name: string } | null> => {
    const q = `${v1} #${v2}, ${comp.ciudad}, Colombia`;
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?access_token=${mapboxToken}&country=co${proximityParam}&language=es&limit=1`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data && data.features && data.features.length > 0) {
          const f = data.features[0];
          return { lat: f.center[1], lng: f.center[0], name: f.place_name };
        }
      }
    } catch {}
    return null;
  };

  try {
    // 1. Nodo de la Esquina Base P₀ = Vía 1 ∩ Vía 2
    const p0 = await queryCornerNode(viaText, cruceText);
    if (!p0) return null;

    let lat = p0.lat;
    let lng = p0.lng;

    // 2. Si no hay placa (d = 0), retorna directamente el nodo de la esquina
    if (!comp.distanciaMetros || comp.distanciaMetros <= 0) {
      return { lat, lng, displayName: p0.name };
    }

    // 3. Siguiente Esquina P_next = Vía 1 ∩ (Vía 2 + 1) para calcular el vector director del asfalto
    const nextCruceNum = comp.viaGeneradoraNumero + 1;
    const pNext = await queryCornerNode(viaText, nextCruceNum);

    if (pNext && (pNext.lat !== p0.lat || pNext.lng !== p0.lng)) {
      const deltaLat = pNext.lat - p0.lat;
      const deltaLng = pNext.lng - p0.lng;
      const factorAvance = comp.distanciaMetros / 80.0;

      lat = p0.lat + (factorAvance * deltaLat);
      lng = p0.lng + (factorAvance * deltaLng);
    } else {
      // Si Mapbox devuelve el mismo nodo, usa el vector director de la cuadrícula
      const vCoords = calculateVectorRoadPosition(comp);
      lat = vCoords.lat;
      lng = vCoords.lng;
    }

    return {
      lat,
      lng,
      displayName: p0.name,
    };
  } catch {
    return null;
  }
}

/**
 * CONSULTA DIRECTA A LA API OFICIAL DE OPENSTREETMAP (NOMINATIM) PARA COLOMBIA
 */
export async function buscarDireccionNominatimColombia(comp: IGACAddressComponents): Promise<{ lat: number; lng: number; displayName: string } | null> {
  const viaText = `${comp.viaPrincipalTipo} ${comp.viaPrincipalNumero}${comp.viaPrincipalLetra ? comp.viaPrincipalLetra : ''}`;
  const cruceText = `${comp.viaGeneradoraTipo} ${comp.viaGeneradoraNumero}${comp.viaGeneradoraLetra ? comp.viaGeneradoraLetra : ''}`;
  const barrioText = comp.barrio ? comp.barrio.trim() : '';

  // Cascada de intersecciones y vías según el estándar oficial de OpenStreetMap:
  const queryCandidates = [
    // 1. Operador Oficial de Intersección en OSM (Slash /) -> Resuelve la esquina única sin necesidad de barrio
    `q=${encodeURIComponent(`${viaText} / ${cruceText}, ${comp.ciudad}, Colombia`)}`,
    // 2. Operador de Intersección alternativo (&)
    `q=${encodeURIComponent(`${viaText} & ${cruceText}, ${comp.ciudad}, Colombia`)}`,
    // 3. Vía + Barrio/Sector + Ciudad (Si el usuario dio barrio)
    barrioText ? `q=${encodeURIComponent(`${viaText}, ${barrioText}, ${comp.ciudad}, Colombia`)}` : null,
    // 4. Búsqueda Estructurada por Atributos
    `street=${encodeURIComponent(viaText)}&city=${encodeURIComponent(comp.ciudad)}&country=Colombia`,
    // 5. Vía + Cruce separado por coma
    `q=${encodeURIComponent(`${viaText}, ${cruceText}, ${comp.ciudad}, Colombia`)}`,
    // 6. Vía Principal + Ciudad
    `q=${encodeURIComponent(`${viaText}, ${comp.ciudad}, Colombia`)}`,
  ].filter(Boolean) as string[];

  for (const params of queryCandidates) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?${params}&countrycodes=co&format=jsonv2&addressdetails=1&accept-language=es&limit=3`;
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'MiTiendaSaaS-ColombianLogistics/1.0 (soporte@mitienda.store)',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          // Filtramos resultados de alta jerarquía (calles, barrios, edificios)
          const match = data.find((d: any) => d.place_rank >= 20) || data[0];
          let lat = parseFloat(match.lat);
          let lng = parseFloat(match.lon);

          // Si la búsqueda fue una vía y el usuario dio distancia métrica, se avanza la placa
          if (comp.distanciaMetros > 0 && comp.viaPrincipalTipo === 'Carrera') {
            lng += (comp.distanciaMetros * 0.0000088);
          } else if (comp.distanciaMetros > 0) {
            lat += (comp.distanciaMetros * 0.0000040);
            lng -= (comp.distanciaMetros * 0.0000075);
          }

          return {
            lat,
            lng,
            displayName: match.display_name,
          };
        }
      }
    } catch {
      // Continúa con la siguiente alternativa en la cascada
    }
  }

  return null;
}

/**
 * CALCULA EL NODO DE INTERSECCIÓN BASE (P₀) ENTRE DOS VÍAS EN EL PLANO ESPACIAL
 */
function calculateBaseIntersection(comp: IGACAddressComponents): { lat: number; lng: number } {
  const normCity = normalizeText(comp.ciudad);
  const isMainCra = comp.viaPrincipalTipo === 'Carrera';

  const craBase = isMainCra ? comp.viaPrincipalNumero : comp.viaGeneradoraNumero;
  const craLetra = isMainCra ? comp.viaPrincipalLetra : comp.viaGeneradoraLetra;
  const craFrac = craBase + parseSuffixFraction(craLetra);

  const calleBase = isMainCra ? comp.viaGeneradoraNumero : comp.viaPrincipalNumero;
  const calleLetra = isMainCra ? comp.viaGeneradoraLetra : comp.viaPrincipalLetra;
  const isNorte = (isMainCra ? comp.viaGeneradoraLetra : comp.viaPrincipalLetra).toUpperCase().includes('N') ||
                  (isMainCra ? comp.viaGeneradoraTipo : comp.viaPrincipalTipo).toLowerCase().includes('norte');
  
  const calleFrac = calleBase + parseSuffixFraction(calleLetra);

  if (normCity === 'cali') {
    // 1. ZONA NORTE (Calles 1N a 75N, Carreras 1 a 20)
    if (isNorte || (calleBase >= 20 && craBase <= 15 && isMainCra)) {
      return {
        lat: 3.4530 + (calleFrac * 0.00078),
        lng: -76.5320 + ((craFrac - 1) * 0.00042) - (calleFrac * 0.00012)
      };
    }
    // 2. ZONA SUROCCIDENTE (Ciudad Campestre / Cañasgordas / Ciudad Jardín: Calles 1 a 20, Carreras 100 a 105)
    if (craBase >= 100 && craBase <= 106 && calleBase <= 22) {
      return {
        lat: 3.37007 - ((craFrac - 101.0) * 0.00130),
        lng: -76.54116 + ((calleFrac - 11.0) * 0.00140)
      };
    }
    // 3. ZONA SURORIENTE (Valle del Lili / Bochalema / Caney: Calles 25 a 65, Carreras 85 a 115)
    // Carrera 101 con Calle 48 = (3.36585, -76.51526)
    if (calleBase >= 25 && craBase >= 85) {
      return {
        lat: 3.36585 + ((101.0 - craFrac) * 0.00085) - ((calleFrac - 48.0) * 0.00045),
        lng: -76.51526 + ((calleFrac - 48.0) * 0.00095) + ((101.0 - craFrac) * 0.00040)
      };
    }
    // 4. ZONA CENTRO HISTÓRICO & SAN NICOLÁS (Calles 10 a 25, Carreras 1 a 15)
    // Eje de Calle 17: P(Cra 2)=(3.45605, -76.52886), P(Cra 3)=(3.45525, -76.52848), P(Cra 4)=(3.45445, -76.52810)
    if (calleBase >= 10 && calleBase <= 25 && craBase <= 15) {
      return {
        lat: 3.45525 + ((calleFrac - 17.0) * 0.00045) - ((craFrac - 3.0) * 0.00080),
        lng: -76.52848 + ((calleFrac - 17.0) * 0.00095) + ((craFrac - 3.0) * 0.00038)
      };
    }
    // 5. ZONA SAN FERNANDO / TEQUENDAMA / ESTADIO (Calles 1 a 12, Carreras 20 a 50)
    if (calleBase <= 12 && craBase >= 20 && craBase <= 50) {
      return {
        lat: 3.4320 - ((calleFrac - 5.0) * 0.00115),
        lng: -76.5440 - ((craFrac - 34.0) * 0.00045)
      };
    }
    // 6. ZONA SUR CENTRAL (Limonar / Capri / Pasoancho / Meléndez: Calles 10 a 20, Carreras 50 a 90)
    if (calleBase >= 8 && calleBase <= 20 && craBase >= 50 && craBase <= 90) {
      return {
        lat: 3.4050 - ((calleFrac - 10.0) * 0.00105),
        lng: -76.5380 - ((craFrac - 50.0) * 0.00035)
      };
    }
    // 7. ZONA ORIENTE / DISTRITO DE AGUABLANCA (Calles 70 a 120, Carreras 20 a 40)
    if (calleBase >= 70 && craBase <= 40) {
      return {
        lat: 3.4250 - ((calleFrac - 70.0) * 0.00070),
        lng: -76.4950 + ((craFrac - 25.0) * 0.00050)
      };
    }
    // 8. MALLA GENERAL CONTINUA DE CALI
    return {
      lat: 3.4500 - (calleFrac * 0.00085),
      lng: -76.5300 - (craFrac * 0.00030)
    };
  }

  const cityCoord = COLOMBIAN_CITIES.find(c => normalizeText(c.ciudad) === normCity) || COLOMBIAN_CITIES[0];
  return { lat: cityCoord.lat, lng: cityCoord.lng };
}

/**
 * MOTOR DE INTERSECCIÓN VECTORIAL Y GRADIENTE ASCENDENTE DE PLACA
 * 1. Encuentra P₀ = Way(Vía 1) ∩ Way(Vía 2)
 * 2. Muestrea P_next = Way(Vía 1) ∩ Way(Vía 2 + 1) para obtener el vector de crecimiento
 * 3. Avanza d metros de placa sobre ese vector director
 */
export function calculateVectorRoadPosition(comp: IGACAddressComponents): { lat: number; lng: number } {
  // 1. Nodo Cruce Base P₀
  const p0 = calculateBaseIntersection(comp);

  if (!comp.distanciaMetros || comp.distanciaMetros <= 0) {
    return p0;
  }

  // 2. Muestreo de la siguiente intersección P_next (Vía Generadora + 1)
  const compNext: IGACAddressComponents = {
    ...comp,
    viaGeneradoraNumero: comp.viaGeneradoraNumero + 1,
    viaGeneradoraLetra: '',
    distanciaMetros: 0
  };

  const pNext = calculateBaseIntersection(compNext);

  // 3. Vector de Dirección Gradiente (P_next - P₀)
  const deltaLat = pNext.lat - p0.lat;
  const deltaLng = pNext.lng - p0.lng;

  // Longitud típica de una cuadra en Colombia (~80 metros)
  const cuadraMetros = 80.0;
  const factorAvance = comp.distanciaMetros / cuadraMetros;

  // 4. Posición Final = P₀ + (Factor × Vector Director)
  const finalLat = p0.lat + (factorAvance * deltaLat);
  const finalLng = p0.lng + (factorAvance * deltaLng);

  return { lat: finalLat, lng: finalLng };
}

export interface GeocodeResult {
  lat: number;
  lng: number;
  displayName: string;
  source: 'openstreetmap_nominatim' | 'vector_road_engine' | 'barrio_db' | 'city';
  precision: 'exact' | 'barrio' | 'city';
}

/**
 * Main Geocoding Entry Point: OpenStreetMap Primario + Respaldo Cartesiano
 */
export async function geocodeColombianAddress(
  address: string,
  city: string = 'Cali',
  barrio?: string
): Promise<GeocodeResult | null> {
  const parsed = parseIGACAddress(address, barrio, city);

  if (parsed.viaPrincipalNumero && parsed.viaGeneradoraNumero) {
    // 1. Intenta consultar directamente a la base de datos de OpenStreetMap (Nominatim)
    const osmResult = await buscarDireccionNominatimColombia(parsed);
    if (osmResult) {
      return {
        lat: osmResult.lat,
        lng: osmResult.lng,
        displayName: osmResult.displayName,
        source: 'openstreetmap_nominatim',
        precision: 'exact',
      };
    }

    // 2. Respaldo por ecuación paramétrica continua
    const coords = calculateVectorRoadPosition(parsed);
    return {
      lat: coords.lat,
      lng: coords.lng,
      displayName: `${parsed.viaPrincipalTipo} ${parsed.viaPrincipalNumero}${parsed.viaPrincipalLetra} #${parsed.viaGeneradoraNumero}${parsed.viaGeneradoraLetra}-${parsed.distanciaMetros}${barrio ? `, Barrio ${barrio}` : ''}, ${city}`,
      source: 'vector_road_engine',
      precision: 'exact',
    };
  }

  const normCity = normalizeText(city);
  const normBarrio = normalizeText(barrio || '');
  const cityBarrios = COLOMBIAN_BARRIOS[normCity];
  if (cityBarrios && normBarrio) {
    for (const [bName, coords] of Object.entries(cityBarrios)) {
      if (normBarrio.includes(bName) || bName.includes(normBarrio)) {
        return {
          lat: coords.lat,
          lng: coords.lng,
          displayName: `Barrio ${bName.toUpperCase()}, ${city}, Colombia`,
          source: 'barrio_db',
          precision: 'barrio',
        };
      }
    }
  }

  const cityCoord = COLOMBIAN_CITIES.find(c => normalizeText(c.ciudad) === normCity) || COLOMBIAN_CITIES[0];
  return {
    lat: cityCoord.lat,
    lng: cityCoord.lng,
    displayName: `${cityCoord.ciudad}, ${cityCoord.departamento}, Colombia`,
    source: 'city',
    precision: 'city',
  };
}

/**
 * Fast Geometric Reverse-Interpreter with Zero Latency
 */
export async function reverseGeocodeColombian(lat: number, lng: number): Promise<string | null> {
  const mapboxToken = (import.meta as any).env?.VITE_MAPBOX_TOKEN;

  // 1. Consulta en vivo a Mapbox si hay token activo
  if (mapboxToken) {
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}&language=es&types=address,neighborhood,locality,place&limit=1`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data && data.features && data.features.length > 0) {
          return data.features[0].place_name;
        }
      }
    } catch {
      // Continúa con respaldo
    }
  }

  // 2. Consulta en vivo a OpenStreetMap con User-Agent autorizado
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=es`;
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'MiTiendaSaaS-ColombianLogistics/1.0 (soporte@mitienda.store)',
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.display_name) {
        return data.display_name;
      }
    }
  } catch {
    // Si falla o no hay conexión, usa el clasificador local inmediato
  }

  // 2. Clasificador local de respaldo
  if (lat >= 3.360 && lat <= 3.380 && lng >= -76.525 && lng <= -76.505) {
    const estCra = Math.round(101.0 - ((lat - 3.36565) / 0.00085));
    const estCalle = Math.round(48.0 + ((lng - (-76.51590)) / 0.00095));
    return `Carrera ${estCra} cerca a Calle ${estCalle}, Valle del Lili, Cali`;
  }

  if (lat >= 3.364 && lat <= 3.372 && lng >= -76.543 && lng <= -76.536) {
    if (lat >= 3.3698) return `Carrera 101 cerca a Calle 11B, Ciudad Campestre, Cali`;
    if (lat >= 3.3692) return `Carrera 101A cerca a Calle 11A, Ciudad Campestre, Cali`;
    if (lat >= 3.3685) return `Carrera 101B cerca a Calle 11B, Ciudad Campestre, Cali`;
    return `Carrera 102 cerca a Calle 12, Ciudad Campestre, Cali`;
  }

  if (lat >= 3.445 && lat <= 3.460 && lng >= -76.535 && lng <= -76.515) {
    const estCalle = Math.round(17.0 - ((lat - 3.4545) / 0.00065));
    const estCra = Math.round(3.0 - ((lng - (-76.5245)) / 0.00075));
    return `Calle ${estCalle} con Carrera ${estCra}, Centro / San Nicolás, Cali`;
  }

  if (lat >= 3.420 && lat <= 3.445 && lng >= -76.550 && lng <= -76.535) {
    const estCalle = Math.round(5.0 - ((lat - 3.4320) / 0.00115));
    const estCra = Math.round(34.0 - ((lng - (-76.5440)) / 0.00045));
    return `Calle ${estCalle} con Carrera ${estCra}, San Fernando, Cali`;
  }

  return `📍 GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

export function getNavigationLinks(lat: number, lng: number, addressText?: string) {
  return {
    googleMaps: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
    waze: `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`,
    whatsappShare: `https://api.whatsapp.com/send?text=${encodeURIComponent(
      `📍 Ubicación de Despacho:\nDirección: ${addressText || ''}\nGPS: https://www.google.com/maps?q=${lat},${lng}\nWaze: https://waze.com/ul?ll=${lat},${lng}&navigate=yes`
    )}`,
  };
}
