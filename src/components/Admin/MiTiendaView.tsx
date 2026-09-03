import React, { useState } from 'react';
import { 
  CreditCard, 
  MapPin, 
  Clock, 
  Navigation, 
  Save, 
  Building2, 
  CheckCircle2,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Trash2,
  Camera,
  Check,
  ChevronDown,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  ShieldAlert,
  UserCheck
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { InteractiveMap } from '../Common/InteractiveMap';
import { ColombianNomenclatureForm } from '../Common/ColombianNomenclatureForm';
import { GoogleMapsAutocomplete } from '../Common/GoogleMapsAutocomplete';
import { COLOMBIAN_CITIES } from '../../utils/geocoding';
import { RubroType } from '../../types';
import { StoreQRSection } from './StoreQRSection';

export const MiTiendaView: React.FC = () => {
  const { store, updateStore, setActiveAdminTab, currentUser, updateAccountSecurity } = useStore();

  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isNomenclaturaOpen, setIsNomenclaturaOpen] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);

  const [adminPassInput, setAdminPassInput] = useState(currentUser?.passwordHash || 'Ancee674');
  const [sellerPassInput, setSellerPassInput] = useState(store.claveVendedor || currentUser?.vendedorPasswordHash || 'Ventas123');
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [showSellerPass, setShowSellerPass] = useState(false);
  const [securityMessage, setSecurityMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    nombre: store.nombre,
    whatsapp: store.whatsapp,
    slogan: store.slogan || '',
    logoUrl: store.logoUrl || '',
    rubro: store.rubro,
    subdominio: store.slug,
    descripcionCorta: store.descripcionCorta,
    abierto24Horas: store.horarios.abierto24Horas,
    horaApertura: store.horarios.horaApertura,
    horaCierre: store.horarios.horaCierre,
    viaTipo: store.direccion.viaTipo || 'Carrera',
    viaNumero: store.direccion.viaNumero || '101',
    viaLetra: store.direccion.viaLetraBis || 'B',
    cruceTipo: store.direccion.cruceTipo || 'Calle',
    cruceNumero: store.direccion.cruceNumero || '11',
    cruceLetra: store.direccion.cruceLetraBis || 'B',
    placa: store.direccion.placa || '28',
    barrio: store.direccion.barrio || 'Ciudad Campestre',
    complemento: store.direccion.complemento || 'APTO 718 - 5',
    ciudad: store.ubicacion.ciudad || 'Cali',
    departamento: store.ubicacion.departamento || 'Valle del Cauca',
    coberturaKm: store.ubicacion.coberturaKm || 3.5,
    lat: store.ubicacion.lat || 3.3688,
    lng: store.ubicacion.lng || -76.5395,
    direccionCompleta: store.direccion.direccionCompleta || '',
    claveVendedor: store.claveVendedor || 'Ventas123',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [geocodeMessage, setGeocodeMessage] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const logoInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen seleccionada supera los 5 MB. Por favor elige una imagen más liviana.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setFormData(prev => ({ ...prev, logoUrl: base64 }));
      // Persist to store and localStorage immediately
      updateStore({ logoUrl: base64 });
      setGeocodeMessage('✓ Logo PNG cargado y guardado con éxito en tu tienda.');
      setTimeout(() => setGeocodeMessage(null), 3500);
    };
    reader.readAsDataURL(file);
  };

  const handleCityChange = (newCity: string) => {
    const cityObj = COLOMBIAN_CITIES.find(c => c.ciudad === newCity);
    if (cityObj) {
      setFormData(prev => ({
        ...prev,
        ciudad: cityObj.ciudad,
        departamento: cityObj.departamento,
        lat: cityObj.lat,
        lng: cityObj.lng,
      }));
      setGeocodeMessage(`Mapa centrado en ${cityObj.ciudad}`);
      setTimeout(() => setGeocodeMessage(null), 3000);
    }
  };

  const handleUseCurrentGPS = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData(prev => ({
            ...prev,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }));
          setGeocodeMessage('✓ GPS de tu dispositivo aplicado al mapa.');
          setTimeout(() => setGeocodeMessage(null), 3000);
        },
        () => {
          setGeocodeMessage('Permiso de GPS no concedido. Puedes mover el marcador en el mapa.');
          setTimeout(() => setGeocodeMessage(null), 3000);
        }
      );
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const fullAddress = `${formData.viaTipo} ${formData.viaNumero}${formData.viaLetra !== '-' ? formData.viaLetra : ''} # ${formData.cruceNumero}${formData.cruceLetra !== '-' ? formData.cruceLetra : ''}${formData.placa ? ` - ${formData.placa}` : ''}${formData.barrio ? `, ${formData.barrio}` : ''}, ${formData.ciudad}`;

    updateStore({
      nombre: formData.nombre,
      whatsapp: formData.whatsapp,
      slogan: formData.slogan,
      logoUrl: formData.logoUrl,
      rubro: formData.rubro as RubroType,
      slug: formData.subdominio,
      subdominio: `${formData.subdominio}.mitienda.store`,
      descripcionCorta: formData.descripcionCorta,
      claveVendedor: formData.claveVendedor,
      horarios: {
        ...store.horarios,
        abierto24Horas: formData.abierto24Horas,
        horaApertura: formData.horaApertura,
        horaCierre: formData.horaCierre,
      },
      direccion: {
        ...store.direccion,
        viaTipo: formData.viaTipo,
        viaNumero: formData.viaNumero,
        viaLetraBis: formData.viaLetra,
        cruceTipo: formData.viaTipo.includes('Carrera') ? 'Calle' : 'Carrera',
        cruceNumero: formData.cruceNumero,
        cruceLetraBis: formData.cruceLetra,
        placa: formData.placa,
        barrio: formData.barrio,
        complemento: formData.complemento,
        direccionCompleta: fullAddress,
      },
      ubicacion: {
        lat: formData.lat,
        lng: formData.lng,
        ciudad: formData.ciudad,
        departamento: formData.departamento,
        coberturaKm: Number(formData.coberturaKm),
      }
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSaveSecurity = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSecurityMessage(null);

    const result = updateAccountSecurity(adminPassInput, sellerPassInput);
    if (result.success) {
      setSecurityMessage({ type: 'success', text: result.message || '¡Claves de acceso actualizadas con éxito!' });
      setFormData(prev => ({ ...prev, claveVendedor: sellerPassInput }));
      setTimeout(() => setSecurityMessage(null), 4000);
    } else {
      setSecurityMessage({ type: 'error', text: result.message || 'Error al actualizar contraseñas.' });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* View Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
          Mi Tienda
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Configura los datos del negocio, dirección de despacho, domicilios y pasarelas de pago
        </p>
      </div>

      {/* Payment Banner Callout */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-900 to-teal-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">¿Quieres configurar tus Métodos de Pago y Cuentas?</h4>
            <p className="text-xs text-emerald-200">
              Configura Nequi, Daviplata, Bancolombia, Wompi, Redeban y Efectivo en su pestaña dedicada.
            </p>
          </div>
        </div>
        <button
          onClick={() => setActiveAdminTab('metodos-pago')}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition flex-shrink-0 shadow-sm cursor-pointer"
        >
          Ir a Métodos de Pago →
        </button>
      </div>

      {/* Official Store QR Code Section (Download & Table Tents) */}
      <StoreQRSection />

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">

        {/* ======================================================== */}
        {/* BLOQUE 2: INFORMACIÓN DE MI NEGOCIO & DIRECCIÓN DESPACHO */}
        {/* ======================================================== */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all">
          {/* Collapsible Bar Header */}
          <div
            onClick={() => setIsInfoOpen(!isInfoOpen)}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 sm:p-6 cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition select-none"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center flex-shrink-0 shadow-xs">
                <Building2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Información de mi negocio & Dirección de Despacho</span>
                    <span className="text-slate-400 font-normal">&gt;</span>
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Nombre, WhatsApp, eslogan, logo PNG, horarios 24h, rubro comercial y ubicación física en mapa
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <span className="text-xs font-bold text-slate-400 hidden sm:inline">
                {isInfoOpen ? 'Ocultar' : 'Editar Datos'}
              </span>
              <div className={`p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-transform duration-200 ${isInfoOpen ? 'rotate-180' : ''}`}>
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Collapsible Body */}
          {isInfoOpen && (
            <div className="p-5 sm:p-7 pt-4 sm:pt-4 border-t border-slate-100 dark:border-slate-800 space-y-6 animate-fadeIn">
              {/* Business Name & WhatsApp */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Nombre del negocio
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none uppercase"
                    placeholder="NOMBRE NEGOCIO"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    WhatsApp Oficial
                  </label>
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="3001234567"
                    required
                  />
                </div>
              </div>

              {/* Slogan / Subtitle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Eslogan / Frase del Negocio (Texto debajo del Nombre)
                </label>
                <input
                  type="text"
                  value={formData.slogan}
                  onChange={e => setFormData({ ...formData, slogan: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="ej: Bienestar, Aromaterapia & Esencias Naturales..."
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Aparecerá directamente debajo del nombre de tu negocio en la cabecera de la tienda.
                </p>
              </div>

              {/* Direct PNG Logo Upload Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border-2 border-dashed border-slate-300 dark:border-slate-700 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Camera className="w-4 h-4 text-emerald-600" />
                      <span>Logo Oficial del Negocio (PNG Transparente / JPG)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Carga tu logo directamente desde tus archivos. Se acoplará automáticamente al área del logo en la página web.
                    </p>
                  </div>

                  {formData.logoUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, logoUrl: '' });
                        updateStore({ logoUrl: '' });
                      }}
                      className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Quitar Logo</span>
                    </button>
                  )}
                </div>

                <input
                  type="file"
                  ref={logoInputRef}
                  onChange={handleLogoFileUpload}
                  accept="image/png, image/jpeg, image/webp, image/svg+xml"
                  className="hidden"
                />

                <div className="flex flex-col sm:flex-row items-center gap-5 pt-1">
                  {/* Logo Preview on Checkered / Grid Pattern for Transparent PNGs */}
                  <div 
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center p-2 relative shadow-inner overflow-hidden flex-shrink-0 bg-white"
                    style={{
                      backgroundImage: `linear-gradient(45deg, #f1f5f9 25%, transparent 25%), linear-gradient(-45deg, #f1f5f9 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f1f5f9 75%), linear-gradient(-45deg, transparent 75%, #f1f5f9 75%)`,
                      backgroundSize: '14px 14px',
                      backgroundPosition: '0 0, 0 7px, 7px -7px, -7px 0px'
                    }}
                  >
                    {formData.logoUrl ? (
                      <img
                        src={formData.logoUrl}
                        alt="Logo Preview"
                        className="max-h-full max-w-full object-contain drop-shadow-sm"
                      />
                    ) : (
                      <div className="text-center p-2">
                        <ImageIcon className="w-7 h-7 text-slate-400 mx-auto mb-1" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase leading-none block">Sin Logo</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Actions & Instructions */}
                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                        <span>{formData.logoUrl ? 'Cambiar Imagen de Logo PNG' : 'Cargar Logo PNG desde mi Dispositivo'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowUrlInput(!showUrlInput)}
                        className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                      >
                        {showUrlInput ? 'Ocultar opción URL' : 'O usar enlace URL web'}
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Formato recomendado: <strong>PNG con fondo transparente</strong> (cuadrado o rectangular horizontal).
                    </p>

                    {showUrlInput && (
                      <div className="pt-2 animate-fadeIn">
                        <input
                          type="url"
                          value={formData.logoUrl}
                          onChange={e => setFormData({ ...formData, logoUrl: e.target.value })}
                          className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                          placeholder="https://ejemplo.com/logo.png"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Rubro & Subdomain */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Rubro / Tipo de negocio
                  </label>
                  <select
                    value={formData.rubro}
                    onChange={e => setFormData({ ...formData, rubro: e.target.value as RubroType })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="farmacia">💊 Farmacia / Droguería</option>
                    <option value="restaurante">🍔 Restaurante / Comidas Rápidas</option>
                    <option value="veterinaria">🐶 Veterinaria / Pet Shop</option>
                    <option value="retail">👗 Moda / Tienda de Ropa</option>
                    <option value="supermercado">🛒 Minimarket / Supermercado</option>
                    <option value="aromaterapia">🌿 Aromaterapia / Esencias Zen</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Subdominio / Enlace Web de la tienda
                  </label>
                  <div className="flex items-center rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3 py-2.5 focus-within:ring-2 focus-within:ring-emerald-500">
                    <input
                      type="text"
                      value={formData.subdominio}
                      onChange={e => setFormData({ ...formData, subdominio: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') })}
                      className="w-full bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white font-medium focus:outline-none"
                    />
                    <span className="text-xs font-bold text-slate-400 pl-1">.mitienda.store</span>
                  </div>
                </div>
              </div>

              {/* Schedule 24h & Hours */}
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 space-y-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="check-24h"
                    checked={formData.abierto24Horas}
                    onChange={e => setFormData({ ...formData, abierto24Horas: e.target.checked })}
                    className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <label htmlFor="check-24h" className="cursor-pointer">
                    <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <span>Servicio 24 Horas (Abierto Todo el Día y la Noche)</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Activa esta opción si tu negocio atiende las 24 horas del día. Tus clientes verán el badge de "🟢 Abierto 24 Horas" en la web.
                    </p>
                  </label>
                </div>

                {!formData.abierto24Horas && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-emerald-200/40 dark:border-emerald-800/30">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Hora de apertura
                      </label>
                      <input
                        type="text"
                        value={formData.horaApertura}
                        onChange={e => setFormData({ ...formData, horaApertura: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                        placeholder="08:00 a. m."
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Hora de cierre
                      </label>
                      <input
                        type="text"
                        value={formData.horaCierre}
                        onChange={e => setFormData({ ...formData, horaCierre: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                        placeholder="10:00 p. m."
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Descripción corta del negocio
                </label>
                <textarea
                  rows={3}
                  value={formData.descripcionCorta}
                  onChange={e => setFormData({ ...formData, descripcionCorta: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Droguería y farmacia con servicio de domicilio express..."
                />
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* BLOQUE 3: NOMENCLATURA VIAL OFICIAL DE COLOMBIA (IGAC)   */}
        {/* ======================================================== */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all">
          {/* Collapsible Bar Header */}
          <div
            onClick={() => setIsNomenclaturaOpen(!isNomenclaturaOpen)}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 sm:p-6 cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition select-none"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center flex-shrink-0 shadow-xs">
                <MapPin className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Nomenclatura Vial Oficial de Colombia & Ubicación GPS</span>
                    <span className="text-slate-400 font-normal">&gt;</span>
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                    Estandarizado IGAC
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Ciudad de operación, radio de cobertura, buscador inteligente, vías oficiales colombianas y mapa satelital
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <span className="text-xs font-bold text-slate-400 hidden sm:inline">
                {isNomenclaturaOpen ? 'Ocultar' : 'Configurar Ubicación'}
              </span>
              <div className={`p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-transform duration-200 ${isNomenclaturaOpen ? 'rotate-180' : ''}`}>
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Collapsible Body */}
          {isNomenclaturaOpen && (
            <div className="p-5 sm:p-7 pt-4 sm:pt-4 border-t border-slate-100 dark:border-slate-800 space-y-6 animate-fadeIn">
              
              {/* City Selector & Coverage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Ciudad de Operación
                  </label>
                  <select
                    value={formData.ciudad}
                    onChange={e => handleCityChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {COLOMBIAN_CITIES.map(c => (
                      <option key={c.ciudad} value={c.ciudad}>
                        📍 {c.ciudad} ({c.departamento})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Radio de cobertura de domicilios (km)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="25"
                    value={formData.coberturaKm}
                    onChange={e => setFormData({ ...formData, coberturaKm: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* BUSCADOR INTELIGENTE DIRECTO */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="text-rose-500">🔍</span>
                    <span>Buscador Inteligente Directo (Autocompletado de Direcciones)</span>
                  </span>
                  <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    ✨ BÚSQUEDA RÁPIDA
                  </span>
                </label>
                <GoogleMapsAutocomplete
                  ciudad={formData.ciudad}
                  initialValue={formData.direccionCompleta}
                  onPlaceSelected={(place) => {
                    setFormData(prev => ({
                      ...prev,
                      lat: place.lat,
                      lng: place.lng,
                      direccionCompleta: place.direccionCompleta,
                      barrio: place.barrio || prev.barrio,
                    }));
                    setGeocodeMessage(`✓ Ubicado con precisión: ${place.direccionCompleta}`);
                    setTimeout(() => setGeocodeMessage(null), 4000);
                  }}
                />
              </div>

              {/* FORMULARIO DE NOMENCLATURA VIAL OFICIAL */}
              <div className="space-y-2">
                <ColombianNomenclatureForm
                  ciudad={formData.ciudad}
                  viaTipo={formData.viaTipo}
                  viaNumero={formData.viaNumero}
                  viaLetra={formData.viaLetra}
                  cruceTipo={formData.cruceTipo}
                  cruceNumero={formData.cruceNumero}
                  cruceLetra={formData.cruceLetra}
                  placa={formData.placa}
                  barrio={formData.barrio}
                  complemento={formData.complemento}
                  hideHeader={true}
                  onChange={(fields) => {
                    setFormData(prev => ({
                      ...prev,
                      ...fields,
                    }));
                    if (fields.direccionCompleta) {
                      setGeocodeMessage(`✓ Ubicado con precisión: ${fields.direccionCompleta}`);
                      setTimeout(() => setGeocodeMessage(null), 4000);
                    }
                  }}
                />
              </div>

              {/* Interactive GPS Map Section */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <span className="text-rose-500">📍</span>
                      <span>Ubicación GPS Satelital (Arrastra el marcador a tu local físico)</span>
                    </label>
                    {geocodeMessage && (
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                        {geocodeMessage}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleUseCurrentGPS}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Usar mi GPS actual</span>
                  </button>
                </div>

                <InteractiveMap
                  lat={formData.lat}
                  lng={formData.lng}
                  coberturaKm={formData.coberturaKm}
                  ciudad={formData.ciudad}
                  onLocationChange={(newLat, newLng) => setFormData(prev => ({ ...prev, lat: newLat, lng: newLng }))}
                />
              </div>

            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* BLOQUE 4: SEGURIDAD & CLAVES DE ACCESO (ADMIN & VENDEDOR) */}
        {/* ======================================================== */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all">
          {/* Collapsible Bar Header */}
          <div
            onClick={() => setIsSecurityOpen(!isSecurityOpen)}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 sm:p-6 cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition select-none"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center flex-shrink-0 shadow-xs">
                <KeyRound className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Seguridad & Claves de Acceso (Administrador & Vendedores)</span>
                    <span className="text-slate-400 font-normal">&gt;</span>
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                    Privacidad
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Cambia tu clave maestra de Administrador y define la clave secundaria de Vendedores para atender pedidos online
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <span className="text-xs font-bold text-slate-400 hidden sm:inline">
                {isSecurityOpen ? 'Ocultar' : 'Gestionar Claves'}
              </span>
              <div className={`p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-transform duration-200 ${isSecurityOpen ? 'rotate-180' : ''}`}>
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Collapsible Body */}
          {isSecurityOpen && (
            <div className="p-5 sm:p-7 pt-4 sm:pt-4 border-t border-slate-100 dark:border-slate-800 space-y-6 animate-fadeIn">
              
              {/* Alert Feedback */}
              {securityMessage && (
                <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-3 animate-shake ${
                  securityMessage.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                }`}>
                  {securityMessage.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0" />
                  )}
                  <span>{securityMessage.text}</span>
                </div>
              )}

              {/* Email in use badge */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <UserCheck className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Correo de acceso de tu cuenta:</span>
                </div>
                <span className="text-xs font-mono font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  {currentUser?.email || 'admin@mitienda.store'}
                </span>
              </div>

              {/* Grid with 2 Passwords */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* 1. Clave Principal de Administrador */}
                <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-50 to-white dark:from-slate-800/80 dark:to-slate-900 border border-slate-200 dark:border-slate-700 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
                        👑
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                          Clave de Administrador (Dueño)
                        </h4>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                          Control Total
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Contraseña Maestra de Administrador
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showAdminPass ? 'text' : 'password'}
                        value={adminPassInput}
                        onChange={e => setAdminPassInput(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none pr-10"
                        placeholder="Contraseña de Administrador"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPass(!showAdminPass)}
                        className="absolute right-2.5 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                        title={showAdminPass ? 'Ocultar contraseña' : 'Ver contraseña'}
                      >
                        {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    🛡️ <strong>Solo tú debes conocerla.</strong> Si alguien descubrió tu clave actual, escribe aquí una nueva clave y haz clic en guardar para que solo tú tengas acceso total a finanzas, inventario, categorías y configuración.
                  </p>
                </div>

                {/* 2. Clave Secundaria de Vendedores */}
                <div className="p-5 rounded-2xl bg-gradient-to-b from-amber-50/60 to-white dark:from-amber-950/30 dark:to-slate-900 border border-amber-200/80 dark:border-amber-800/60 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black">
                        📦
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                          Clave Secundaria para Vendedores
                        </h4>
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">
                          Solo Pedidos Online
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Clave de Vendedor / Despacho
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showSellerPass ? 'text' : 'password'}
                        value={sellerPassInput}
                        onChange={e => setSellerPassInput(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none pr-10"
                        placeholder="Clave para Vendedores"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowSellerPass(!showSellerPass)}
                        className="absolute right-2.5 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                        title={showSellerPass ? 'Ocultar clave' : 'Ver clave'}
                      >
                        {showSellerPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-amber-900/80 dark:text-amber-300/80 leading-relaxed">
                    💡 <strong>Para tus empleados o domiciliarios.</strong> Ellos inician sesión con tu <strong>mismo correo</strong> pero usando esta clave. Al entrar solo podrán gestionar y despachar pedidos online, sin acceso a tus finanzas ni productos.
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleSaveSecurity}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-md shadow-amber-600/20 flex items-center gap-2 transition cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Actualizar y Guardar Claves de Acceso</span>
                </button>
              </div>

            </div>
          )}
        </div>

        {/* Global Save Button */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition transform hover:-translate-y-0.5 cursor-pointer"
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>¡Información Guardada Exitosamente!</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Guardar Información y Dirección de Despacho</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
