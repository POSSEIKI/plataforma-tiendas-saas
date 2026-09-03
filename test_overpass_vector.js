process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Motor de Intersección Vectorial Real sobre la Base de Datos Topológica de OpenStreetMap
async function findExactVectorIntersection(via1Name, via2Name, cityName = 'Cali') {
  console.log(`\n🔍 Buscando intersección vectorial exacta: [${via1Name}] ∩ [${via2Name}] en ${cityName}...`);
  
  // Overpass QL Query para extraer la geometría vectorial de ambas vías dentro de la ciudad
  const query = `
    [out:json][timeout:8];
    area["name"~"${cityName}",i]["boundary"="administrative"]->.a;
    (
      way["name"~"${via1Name}",i](area.a)->.w1;
      way["name"~"${via2Name}",i](area.a)->.w2;
      node(w.w1)(w.w2);
    );
    out body;
    >;
    out skel qt;
  `;

  const endpoints = [
    'https://overpass-api.de/api/interpreter',
    'https://lz4.overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter'
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, {
        method: 'POST',
        body: 'data=' + encodeURIComponent(query),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      if (res.ok) {
        const data = await res.json();
        const nodes = data.elements.filter(e => e.type === 'node');
        if (nodes.length > 0) {
          console.log(`✅ [NODO COMPARTIDO ENCONTRADO]:`, nodes[0]);
          return { lat: nodes[0].lat, lng: nodes[0].lon, id: nodes[0].id };
        }
      }
    } catch (e) {
      // Intenta siguiente endpoint
    }
  }

  // Si no hay nodo común explícito, obtenemos las geometrías completas de ambas vías y calculamos el cruce geométrico
  const geomQuery = `
    [out:json][timeout:8];
    area["name"~"${cityName}",i]["boundary"="administrative"]->.a;
    way["name"~"${via1Name}",i](area.a);
    out geom;
    way["name"~"${via2Name}",i](area.a);
    out geom;
  `;

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, {
        method: 'POST',
        body: 'data=' + encodeURIComponent(geomQuery),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      if (res.ok) {
        const data = await res.json();
        const ways = data.elements.filter(e => e.type === 'way' && e.geometry);
        console.log(`📐 Geometrías vectoriales descargadas: ${ways.length} segmentos viales.`);
        // Calculamos la intersección matemática de segmentos
        const intersection = calculatePolylineIntersection(ways, via1Name, via2Name);
        if (intersection) {
          console.log(`✅ [CRUCE GEOMÉTRICO 2D CALCULADO]:`, intersection);
          return intersection;
        }
      }
    } catch (e) {
      // Siguiente
    }
  }

  return null;
}

// Intersección matemática entre polilíneas 2D (Segmento A ∩ Segmento B)
function calculatePolylineIntersection(ways, name1, name2) {
  const w1List = ways.filter(w => w.tags?.name && new RegExp(name1, 'i').test(w.tags.name));
  const w2List = ways.filter(w => w.tags?.name && new RegExp(name2, 'i').test(w.tags.name));

  for (const w1 of w1List) {
    for (let i = 0; i < w1.geometry.length - 1; i++) {
      const p1 = w1.geometry[i];
      const p2 = w1.geometry[i + 1];

      for (const w2 of w2List) {
        for (let j = 0; j < w2.geometry.length - 1; j++) {
          const q1 = w2.geometry[j];
          const q2 = w2.geometry[j + 1];

          const hit = lineSegmentIntersection(p1.lat, p1.lon, p2.lat, p2.lon, q1.lat, q1.lon, q2.lat, q2.lon);
          if (hit) return hit;
        }
      }
    }
  }
  return null;
}

function lineSegmentIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
  const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
  if (Math.abs(denom) < 1e-9) return null;

  const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
  const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;

  if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
    return {
      lat: x1 + ua * (x2 - x1),
      lng: y1 + ua * (y2 - y1)
    };
  }
  return null;
}

async function test() {
  await findExactVectorIntersection('Calle 17', 'Carrera 3', 'Cali');
  await findExactVectorIntersection('Carrera 101', 'Calle 48', 'Cali');
  await findExactVectorIntersection('Calle 5', 'Carrera 34', 'Cali');
}

test();
