import React, { useState } from 'react';
import { X, Sparkles, CheckCircle, ArrowRight, Store as StoreIcon, MapPin, Phone, Globe, Palette } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '../../context/StoreContext';
import { RubroType, TemplateType } from '../../types';
import { COLOMBIAN_CITIES } from '../../utils/geocoding';

interface CreateStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateStoreModal: React.FC<CreateStoreModalProps> = ({ isOpen, onClose }) => {
  const { createNewTenantStore, store, setActiveView, setActiveAdminTab } = useStore();
  const [step, setStep] = useState(1);
  const [rubro, setRubro] = useState<RubroType>('farmacia');
  const [nombre, setNombre] = useState('');
  const [subdominio, setSubdominio] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [ciudad, setCiudad] = useState('Cali');
  const [plantilla, setPlantilla] = useState<TemplateType>('farmacia');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const rubrosList: { type: RubroType; label: string; icon: string; desc: string; defaultTemplate: TemplateType }[] = [
    { type: 'farmacia', label: 'Farmacia / Droguería', icon: '💊', desc: 'Recetas, inyectología, 24h y medicamentos', defaultTemplate: 'farmacia' },
    { type: 'restaurante', label: 'Restaurante / Comidas', icon: '🍔', desc: 'Menú digital, combos y despachos rápidos', defaultTemplate: 'gastro' },
    { type: 'veterinaria', label: 'Veterinaria & Pet Shop', icon: '🐶', desc: 'Alimentos, citas médicas y baño canino', defaultTemplate: 'farmacia' },
    { type: 'retail', label: 'Moda & Boutique', icon: '👗', desc: 'Ropa, calzado y accesorios con catálogo limpio', defaultTemplate: 'boutique' },
    { type: 'supermercado', label: 'Minimarket & Abarrotes', icon: '🛒', desc: 'Despensa, frutas, licores y aseo del hogar', defaultTemplate: 'farmacia' },
  ];

  const handleRubroSelect = (r: RubroType, defaultTemp: TemplateType) => {
    setRubro(r);
    setPlantilla(defaultTemp);
  };

  const handleNameChange = (val: string) => {
    setNombre(val);
    const slug = val
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 20);
    setSubdominio(slug);
  };

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const selectedRubroObj = rubrosList.find(r => r.type === rubro);
      const cleanSlug = subdominio || 'mitienda';
      const cityObj = COLOMBIAN_CITIES.find(c => c.ciudad === ciudad) || COLOMBIAN_CITIES[0];
      
      createNewTenantStore({
        ...store,
        id: `store-${cleanSlug}`,
        nombre: nombre || 'Mi Nuevo Negocio',
        slug: cleanSlug,
        subdominio: `${cleanSlug}.mitienda.store`,
        rubro,
        rubroEtiqueta: `${selectedRubroObj?.icon} ${selectedRubroObj?.label}`,
        whatsapp: whatsapp || '3001234567',
        plantilla,
        ubicacion: {
          lat: cityObj.lat,
          lng: cityObj.lng,
          ciudad: cityObj.ciudad,
          departamento: cityObj.departamento,
          coberturaKm: 3.5,
        }
      });

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      setLoading(false);
      onClose();
      setActiveAdminTab('mi-tienda');
      setActiveView('admin');
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Paso {step} de 2 · Creación Asistida
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Crea Tu Tienda Online</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          {step === 1 ? (
            <div className="space-y-6">
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  1. ¿Cuál es el rubro de tu negocio?
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Configuraremos automáticamente el catálogo inicial, horarios y módulos acordes a tu actividad.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {rubrosList.map((item) => (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => handleRubroSelect(item.type, item.defaultTemplate)}
                      className={`p-4 rounded-2xl border text-left transition flex items-start gap-3.5 ${
                        rubro === item.type
                          ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
                      }`}
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <div className="flex-1">
                        <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                          <span>{item.label}</span>
                          {rubro === item.type && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition"
                >
                  <span>Continuar al Paso 2</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleComplete} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre Comercial del Negocio
                </label>
                <div className="relative">
                  <StoreIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={nombre}
                    onChange={e => handleNameChange(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold"
                    placeholder="Ej: Droguería La Economía"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    WhatsApp Oficial de Pedidos
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="tel"
                      value={whatsapp}
                      onChange={e => setWhatsapp(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="3043538814"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ciudad de Operación
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <select
                      value={ciudad}
                      onChange={e => setCiudad(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      {COLOMBIAN_CITIES.map(c => (
                        <option key={c.ciudad} value={c.ciudad}>
                          {c.ciudad} ({c.departamento})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Enlace Web / Subdominio de Tu Tienda
                </label>
                <div className="flex items-center rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2.5 focus-within:ring-2 focus-within:ring-emerald-500">
                  <Globe className="w-4 h-4 text-slate-400 mr-2" />
                  <input
                    type="text"
                    value={subdominio}
                    onChange={e => setSubdominio(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                    className="w-full bg-transparent text-sm text-slate-900 dark:text-white font-medium focus:outline-none"
                    placeholder="misitio"
                    required
                  />
                  <span className="text-xs font-semibold text-slate-400 pl-1">.mitienda.store</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Plantilla de Diseño Inicial
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'farmacia' as TemplateType, name: 'Salud & Botica', color: 'bg-emerald-600' },
                    { id: 'gastro' as TemplateType, name: 'Gastro & Delivery', color: 'bg-amber-600' },
                    { id: 'boutique' as TemplateType, name: 'Boutique Minimal', color: 'bg-indigo-600' },
                  ].map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setPlantilla(tpl.id)}
                      className={`p-3 rounded-xl border text-center text-xs font-semibold transition ${
                        plantilla === tpl.id
                          ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full ${tpl.color} mx-auto mb-1.5`}></div>
                      {tpl.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Atrás
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition"
                >
                  {loading ? (
                    <span>Alistando tu tienda...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>¡Crear Mi Tienda Ahora!</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
