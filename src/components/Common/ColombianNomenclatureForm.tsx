import React from 'react';
import { MapPin, Navigation, Sparkles } from 'lucide-react';
import { IGACAddressComponents, calculateVectorRoadPosition, buscarDireccionNominatimColombia, buscarDireccionMapbox, COLOMBIAN_BARRIOS, normalizeText } from '../../utils/geocoding';

export const COLOMBIAN_VIA_TIPOS = [
  { id: 'Carrera', label: 'Carrera' },
  { id: 'Calle', label: 'Calle' },
  { id: 'Avenida', label: 'Avenida' },
  { id: 'Avenida Calle', label: 'Avenida Calle' },
  { id: 'Avenida Carrera', label: 'Avenida Carrera' },
  { id: 'Diagonal', label: 'Diagonal' },
  { id: 'Transversal', label: 'Transversal' },
  { id: 'Autopista', label: 'Autopista' },
  { id: 'Circular', label: 'Circular' },
  { id: 'Circunvalar', label: 'Circunvalar' },
  { id: 'Pasaje', label: 'Pasaje' },
  { id: 'Callejón', label: 'Callejón' },
  { id: 'Peatonal', label: 'Peatonal' },
  { id: 'Manzana', label: 'Manzana' },
  { id: 'Vereda', label: 'Vereda' },
];

export const LETRA_BIS_OPTIONS = [
  '-', 'A', 'B', 'C', 'D', 'E', 'F',
  'Bis', 'Bis A', 'Bis B',
  'Norte', 'Sur', 'Este', 'Oeste'
];

interface ColombianNomenclatureFormProps {
  ciudad: string;
  viaTipo: string;
  viaNumero: string;
  viaLetra: string;
  cruceTipo: string;
  cruceNumero: string;
  cruceLetra: string;
  placa: string;
  barrio: string;
  complemento: string;
  hideHeader?: boolean;
  onChange: (fields: {
    viaTipo?: string;
    viaNumero?: string;
    viaLetra?: string;
    cruceTipo?: string;
    cruceNumero?: string;
    cruceLetra?: string;
    placa?: string;
    barrio?: string;
    complemento?: string;
    direccionCompleta?: string;
    lat?: number;
    lng?: number;
  }) => void;
}

export const ColombianNomenclatureForm: React.FC<ColombianNomenclatureFormProps> = ({
  ciudad,
  viaTipo,
  viaNumero,
  viaLetra,
  cruceTipo = 'Calle',
  cruceNumero,
  cruceLetra,
  placa,
  barrio,
  complemento,
  hideHeader = false,
  onChange,
}) => {
  const cleanViaLetra = viaLetra !== '-' ? viaLetra : '';
  const cleanCruceLetra = cruceLetra !== '-' ? cruceLetra : '';
  const cleanPlaca = placa ? ` - ${placa}` : '';
  const cleanBarrio = barrio ? `, Barrio ${barrio.toUpperCase()}` : '';

  const standardizedAddress = `${viaTipo} ${viaNumero}${cleanViaLetra} # ${cruceTipo} ${cruceNumero}${cleanCruceLetra}${cleanPlaca}${cleanBarrio}, ${ciudad}`;

  const triggerRecalculate = (updated: any) => {
    const nextState = {
      viaTipo,
      viaNumero,
      viaLetra,
      cruceTipo,
      cruceNumero,
      cruceLetra,
      placa,
      barrio,
      complemento,
      ...updated,
    };

    const viaNum = parseInt(nextState.viaNumero, 10) || 1;
    const cruceNum = parseInt(nextState.cruceNumero, 10) || 1;
    const placaNum = parseInt(nextState.placa, 10) || 0;

    const comp: IGACAddressComponents = {
      viaPrincipalTipo: (nextState.viaTipo.includes('Carrera') ? 'Carrera' : nextState.viaTipo.includes('Avenida') ? 'Avenida' : nextState.viaTipo.includes('Diagonal') ? 'Diagonal' : nextState.viaTipo.includes('Transversal') ? 'Transversal' : 'Calle') as any,
      viaPrincipalNumero: viaNum,
      viaPrincipalLetra: nextState.viaLetra !== '-' ? nextState.viaLetra : '',
      viaGeneradoraTipo: (nextState.cruceTipo.includes('Carrera') ? 'Carrera' : nextState.cruceTipo.includes('Avenida') ? 'Avenida' : nextState.cruceTipo.includes('Diagonal') ? 'Diagonal' : nextState.cruceTipo.includes('Transversal') ? 'Transversal' : 'Calle') as any,
      viaGeneradoraNumero: cruceNum,
      viaGeneradoraLetra: nextState.cruceLetra !== '-' ? nextState.cruceLetra : '',
      distanciaMetros: placaNum,
      barrio: nextState.barrio,
      ciudad: ciudad,
    };

    const coords = calculateVectorRoadPosition(comp);
    const fullAddr = `${nextState.viaTipo} ${nextState.viaNumero}${nextState.viaLetra !== '-' ? nextState.viaLetra : ''} # ${nextState.cruceTipo} ${nextState.cruceNumero}${nextState.cruceLetra !== '-' ? nextState.cruceLetra : ''}${nextState.placa ? ` - ${nextState.placa}` : ''}${nextState.barrio ? `, Barrio ${nextState.barrio.toUpperCase()}` : ''}${nextState.complemento ? ` (${nextState.complemento})` : ''}, ${ciudad}`;

    onChange({
      ...updated,
      direccionCompleta: fullAddr,
      lat: coords.lat,
      lng: coords.lng,
    });

    // Try precise geocoding in background
    buscarDireccionMapbox(comp).then(mb => {
      if (mb) {
        onChange({
          ...updated,
          direccionCompleta: fullAddr,
          lat: mb.lat,
          lng: mb.lng,
        });
      }
    });
  };

  const normCity = normalizeText(ciudad);
  const cityBarrios = Object.keys(COLOMBIAN_BARRIOS[normCity] || {});

  return (
    <div className={hideHeader ? "space-y-4" : "p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-5"}>
      {/* Header */}
      {!hideHeader && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-rose-500 font-bold text-lg">📍</span>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                Nomenclatura Vial Oficial de Colombia (IGAC)
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Configura la vía principal y la vía generadora de cruce con sus tipos oficiales
              </p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center gap-1 shadow-sm">
            <Sparkles className="w-3 h-3" />
            <span>Estandarizado</span>
          </span>
        </div>
      )}

      {/* Row 1: Vía Principal + Símbolo # + Vía de Cruce */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
        {/* 1. Tipo Vía Principal */}
        <div className="sm:col-span-3">
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
            1. Vía Principal
          </label>
          <select
            value={viaTipo}
            onChange={e => triggerRecalculate({ viaTipo: e.target.value })}
            className="w-full px-2.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white shadow-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            {COLOMBIAN_VIA_TIPOS.map(t => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Número Vía Principal */}
        <div className="sm:col-span-1">
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
            N°
          </label>
          <input
            type="text"
            value={viaNumero}
            onChange={e => triggerRecalculate({ viaNumero: e.target.value.replace(/\D/g, '') })}
            placeholder="101"
            className="w-full px-2 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-center font-extrabold text-slate-900 dark:text-white shadow-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        {/* Letra Vía Principal */}
        <div className="sm:col-span-1">
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
            Letra
          </label>
          <select
            value={viaLetra}
            onChange={e => triggerRecalculate({ viaLetra: e.target.value })}
            className="w-full px-1.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-center font-bold text-slate-900 dark:text-white shadow-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            {LETRA_BIS_OPTIONS.map(opt => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Símbolo # */}
        <div className="sm:col-span-1 text-center font-extrabold text-slate-400 text-lg hidden sm:block pb-2">
          #
        </div>

        {/* 2. Tipo Vía de Cruce */}
        <div className="sm:col-span-3">
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
            2. Vía de Cruce (Generadora)
          </label>
          <select
            value={cruceTipo}
            onChange={e => triggerRecalculate({ cruceTipo: e.target.value })}
            className="w-full px-2.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white shadow-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            {COLOMBIAN_VIA_TIPOS.map(t => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Número Vía de Cruce */}
        <div className="sm:col-span-1">
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
            N°
          </label>
          <input
            type="text"
            value={cruceNumero}
            onChange={e => triggerRecalculate({ cruceNumero: e.target.value.replace(/\D/g, '') })}
            placeholder="11"
            className="w-full px-2 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-center font-extrabold text-slate-900 dark:text-white shadow-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        {/* Letra Vía de Cruce */}
        <div className="sm:col-span-2">
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
            Letra Cruce
          </label>
          <select
            value={cruceLetra}
            onChange={e => triggerRecalculate({ cruceLetra: e.target.value })}
            className="w-full px-2 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-center font-bold text-slate-900 dark:text-white shadow-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            {LETRA_BIS_OPTIONS.map(opt => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 2: Placa, Barrio, Complemento */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
        {/* Placa / Distancia en metros */}
        <div className="sm:col-span-3">
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
            3. Placa / Métrica (- N°)
          </label>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-bold text-base">-</span>
            <input
              type="text"
              value={placa}
              onChange={e => triggerRecalculate({ placa: e.target.value.replace(/\D/g, '') })}
              placeholder="28"
              className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-center font-extrabold text-slate-900 dark:text-white shadow-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Barrio / Sector */}
        <div className="sm:col-span-4">
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
            4. Barrio / Sector <span className="text-slate-400 font-normal">(Referencial)</span>
          </label>
          <div className="relative">
            <input
              type="text"
              list="barrios-list"
              value={barrio}
              onChange={e => triggerRecalculate({ barrio: e.target.value })}
              placeholder="Ej: Ciudad Campestre, Ciudad Jardín..."
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white shadow-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none uppercase"
            />
            <datalist id="barrios-list">
              {cityBarrios.map(b => (
                <option key={b} value={b.toUpperCase()} />
              ))}
            </datalist>
          </div>
        </div>

        {/* Complemento / Referencias */}
        <div className="sm:col-span-5">
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
            5. Complemento (Apto, Local, Torre, Referencias)
          </label>
          <input
            type="text"
            value={complemento}
            onChange={e => triggerRecalculate({ complemento: e.target.value })}
            placeholder="Ej: Local 102, frente al parque, reja blanca..."
            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white shadow-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Standardized Address Banner */}
      <div 
        onClick={() => triggerRecalculate({})}
        className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-950/60 transition shadow-sm"
        title="Haz clic para re-centrar el mapa en esta dirección"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 block">
              DIRECCIÓN ESTANDARIZADA EN {ciudad.toUpperCase()}:
            </span>
            <strong className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
              {standardizedAddress}
            </strong>
          </div>
        </div>

        <span className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition whitespace-nowrap">
          <Navigation className="w-3.5 h-3.5" />
          <span>Localizar</span>
        </span>
      </div>
    </div>
  );
};
