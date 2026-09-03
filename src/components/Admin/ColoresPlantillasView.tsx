import React, { useState } from 'react';
import { 
  Palette, 
  Sun, 
  Moon, 
  Monitor, 
  Check, 
  Sparkles, 
  Eye, 
  CheckCircle2, 
  Layers, 
  LayoutTemplate 
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { TemplateType, ThemeMode } from '../../types';

export const ColoresPlantillasView: React.FC = () => {
  const { store, updateStore, themeMode, setThemeMode, setActiveView, setActiveAdminTab } = useStore();
  const [activeTemplate, setActiveTemplate] = useState<TemplateType>(store.plantilla);
  const [accentColor, setAccentColor] = useState<string>(store.temaColor || '#059669');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const templates: {
    id: TemplateType;
    name: string;
    tag: string;
    desc: string;
    color: string;
    previewImg: string;
    features: string[];
    suggestedColor: string;
  }[] = [
    {
      id: 'default',
      name: 'Clásica Estándar (Default)',
      tag: '⭐ Plantilla Original de Inicio',
      desc: 'La plantilla universal equilibrada y limpia. Con diseño moderno, adaptable a cualquier tipo de catálogo, producto y servicio.',
      color: '#059669',
      suggestedColor: '#059669',
      previewImg: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&q=80',
      features: ['Estructura universal de máxima conversión', 'Compatible con cualquier rubro comercial', 'Carrusel dinámico con rotación de banners', 'Filtros rápidos de categorías'],
    },
    {
      id: 'zen',
      name: 'Zen & Aromaterapia (Colores Tierra)',
      tag: '🌿 Bienestar, Esencias & Velas',
      desc: 'Estética relajante inspirada en la naturaleza con tonos tierra, maderas y salvia. Ideal para aceites esenciales, velas botánicas, difusores y terapias.',
      color: '#c2704e',
      suggestedColor: '#c2704e',
      previewImg: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&q=80',
      features: ['Fuentes Caprasimo (Título) & Figtree (Slogan)', 'Papel tapiz botánico relajante', 'Paleta orgánica en tonos tierra & salvia', 'Módulo de citas para bienestar & aromaterapia'],
    },
    {
      id: 'farmacia',
      name: 'Salud & Farmacia Pro',
      tag: '💊 Droguerías & Medicamentos',
      desc: 'Diseño clínico limpio con acceso rápido a servicios de inyectología, badge de 24 horas y cotizador de fórmulas médicas.',
      color: '#059669',
      suggestedColor: '#059669',
      previewImg: '/wallpaper-farmacia.jpg',
      features: ['Fondo clínico tenue y profesional', 'Badge 24 Horas destacado', 'Buscador instantáneo de medicamentos', 'Cálculo de radio de despacho'],
    },
    {
      id: 'gastro',
      name: 'Gastro & Delivery Express',
      tag: '🍔 Restaurantes & Comidas',
      desc: 'Enfoque en apetito con fotos amplias, combos destacados, tiempos de cocción y llamado directo a Rappi.',
      color: '#ea580c',
      suggestedColor: '#ea580c',
      previewImg: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80',
      features: ['Fotos de platos de alta resolución', 'Tiempo estimado de despacho', 'Comandas con sonido audible', 'Cobro en efectivo con cambio'],
    },
    {
      id: 'boutique',
      name: 'Boutique & Retail Elegance',
      tag: '👗 Moda & Cosméticos',
      desc: 'Estilo editorial minimalista con cuadrícula de productos limpia, filtros por categoría y checkout rápido.',
      color: '#4f46e5',
      suggestedColor: '#4f46e5',
      previewImg: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80',
      features: ['Cuadrícula visual de productos', 'Banners promocionales', 'Pago por Wompi y Nequi', 'Organización por colecciones'],
    },
    {
      id: 'veterinaria',
      name: 'Pet Shop & Veterinaria Vital',
      tag: '🐾 Mascotas & Cuidados',
      desc: 'Diseño alegre para el cuidado de mascotas, alimentos por bulto/kilo, accesorios y reservas para baño y peluquería.',
      color: '#0891b2',
      suggestedColor: '#0891b2',
      previewImg: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&q=80',
      features: ['Reserva de baño y consulta veterinaria', 'Selector de peso por bulto/kilo', 'Badge de despacho express', 'WhatsApp directo con médico'],
    },
    {
      id: 'supermercado',
      name: 'Supermercado & Minimarket',
      tag: '🛒 Abarrotes & Despensa',
      desc: 'Optimizado para compras de alto volumen de productos, despensa, lácteos, aseo del hogar y ofertas 2x1.',
      color: '#16a34a',
      suggestedColor: '#16a34a',
      previewImg: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&q=80',
      features: ['Barra flotante de canasta de mercado', 'Filtros rápidos por pasillos del hogar', 'Ofertas 2x1 y promociones', 'Despachos locales programados'],
    }
  ];

  const colorPresets = [
    { name: 'Terracota Zen (Tierra Cálida)', hex: '#c2704e' },
    { name: 'Verde Salvia (Botánico)', hex: '#52796f' },
    { name: 'Madera & Canela (Orgánico)', hex: '#7f4f24' },
    { name: 'Lino & Arena (Natural)', hex: '#b08968' },
    { name: 'Verde Esmeralda (Salud)', hex: '#059669' },
    { name: 'Naranja Gastro (Delivery)', hex: '#ea580c' },
    { name: 'Índigo Real (Boutique)', hex: '#4f46e5' },
    { name: 'Azul Cyan (Pet Shop)', hex: '#0891b2' },
    { name: 'Púrpura Lavanda (Aroma)', hex: '#9333ea' },
    { name: 'Rojo Pasión (Droguería)', hex: '#dc2626' },
  ];

  const handleSelectTemplate = (tpl: typeof templates[0]) => {
    setActiveTemplate(tpl.id);
    setAccentColor(tpl.suggestedColor);
  };

  const handleSave = () => {
    updateStore({
      plantilla: activeTemplate,
      temaColor: accentColor,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
          Plantillas & Apariencia
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Personaliza la experiencia visual de tu tienda y el descanso visual del panel administrativo
        </p>
      </div>

      {/* Card 1: Tema del Panel (Modo Día / Noche) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Moon className="w-4 h-4 text-indigo-500" />
              <span>Tema & Apariencia del Panel Administrativo</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Elige el modo visual para trabajar cómodamente sin fatiga visual en la noche.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Day mode */}
          <button
            type="button"
            onClick={() => setThemeMode('light')}
            className={`p-4 rounded-xl border text-left transition flex items-center gap-3.5 ${
              themeMode === 'light'
                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Modo Día</span>
                {themeMode === 'light' && <Check className="w-4 h-4 text-emerald-600" />}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Fondo blanco luminoso</p>
            </div>
          </button>

          {/* Night mode */}
          <button
            type="button"
            onClick={() => setThemeMode('dark')}
            className={`p-4 rounded-xl border text-left transition flex items-center gap-3.5 ${
              themeMode === 'dark'
                ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-900/60 text-indigo-300 flex items-center justify-center flex-shrink-0">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Modo Noche</span>
                {themeMode === 'dark' && <Check className="w-4 h-4 text-indigo-400" />}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Oscuro para descansar la vista</p>
            </div>
          </button>

          {/* System mode */}
          <button
            type="button"
            onClick={() => setThemeMode('system')}
            className={`p-4 rounded-xl border text-left transition flex items-center gap-3.5 ${
              themeMode === 'system'
                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center flex-shrink-0">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Automático / Sistema</span>
                {themeMode === 'system' && <Check className="w-4 h-4 text-emerald-600" />}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Sigue el horario de tu equipo</p>
            </div>
          </button>
        </div>
      </div>

      {/* Card 2: Selector de Plantillas Profesionales */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <LayoutTemplate className="w-4 h-4 text-emerald-600" />
              <span>Selecciona la Plantilla de Tu Tienda Pública</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Elige la atmósfera y paleta que mejor represente a tu marca. Son 100% universales y adaptables a cualquier rubro.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveAdminTab('mi-tienda')}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-[11px] font-bold text-slate-700 dark:text-slate-300 transition"
            >
              ✏️ Editar Logo & Eslogan
            </button>
            <button
              onClick={() => setActiveAdminTab('banners')}
              className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition"
            >
              🖼️ Subir Banners
            </button>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
          <span className="text-base flex-shrink-0">💡</span>
          <div>
            <p className="font-bold">Plantillas universales y libres de condicionamiento</p>
            <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80 mt-0.5">
              Cualquier negocio puede usar la plantilla Zen/Tierra, Boutique o Gastro. Los textos que se muestran en tu tienda (Nombre, Eslogan, Banners y Productos) son los que tú configures libremente en el panel.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              onClick={() => handleSelectTemplate(tpl)}
              className={`rounded-2xl border overflow-hidden cursor-pointer transition flex flex-col justify-between ${
                activeTemplate === tpl.id
                  ? 'border-emerald-500 shadow-xl ring-2 ring-emerald-500/30 dark:border-emerald-500 bg-emerald-50/10'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 opacity-85 hover:opacity-100'
              }`}
            >
              <div>
                {/* Image header */}
                <div className="relative h-40 overflow-hidden">
                  <img src={tpl.previewImg} alt={tpl.name} className="w-full h-full object-cover transition duration-300 hover:scale-105" />
                  <div className="absolute top-2.5 right-2.5">
                    {activeTemplate === tpl.id ? (
                      <span className="px-3 py-1 bg-emerald-600 text-white font-black text-[10px] rounded-full flex items-center gap-1 shadow-lg">
                        <Check className="w-3 h-3" /> Plantilla Activa
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-slate-900/70 backdrop-blur-md text-white text-[10px] font-bold rounded-full border border-white/20">
                        Seleccionar
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-2.5 left-2.5">
                    <span 
                      style={{ backgroundColor: tpl.suggestedColor }}
                      className="px-2.5 py-0.5 text-white font-extrabold text-[10px] rounded-lg shadow-md flex items-center gap-1"
                    >
                      <span className="w-2 h-2 rounded-full bg-white"></span>
                      {tpl.name.split(' ')[0]}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 space-y-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      {tpl.tag}
                    </span>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {tpl.name}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {tpl.desc}
                  </p>

                  <div className="pt-2 space-y-1">
                    {tpl.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0"></span>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0 space-y-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectTemplate(tpl);
                    updateStore({
                      plantilla: tpl.id,
                      temaColor: tpl.suggestedColor,
                    });
                    setActiveView('storefront');
                  }}
                  className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition border border-slate-200 dark:border-slate-700"
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Ver Tienda con esta Plantilla</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Card 3: Color de Acento Principal */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Palette className="w-4 h-4 text-emerald-600" />
            <span>Color de Acento de la Tienda</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Selecciona el color corporativo que te identifica sin tener que configurar decenas de palancas complicadas.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-1">
          {colorPresets.map((preset) => (
            <button
              key={preset.hex}
              type="button"
              onClick={() => setAccentColor(preset.hex)}
              className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-2 ${
                accentColor === preset.hex
                  ? 'border-slate-900 dark:border-white ring-2 ring-slate-900/20 dark:ring-white/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div
                style={{ backgroundColor: preset.hex }}
                className="w-8 h-8 rounded-full shadow flex items-center justify-center text-white"
              >
                {accentColor === preset.hex && <Check className="w-4 h-4" />}
              </div>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 leading-tight">
                {preset.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Save Action */}
      <div className="pt-2 flex items-center justify-end gap-3">
        <button
          onClick={() => setActiveView('storefront')}
          className="px-5 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold rounded-xl text-xs flex items-center gap-2 transition"
        >
          <Eye className="w-4 h-4 text-emerald-600" />
          <span>Ver Tienda Pública Ahora</span>
        </button>

        <button
          onClick={handleSave}
          className="px-7 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition"
        >
          {savedSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>¡Plantilla Aplicada Exitosamente!</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Guardar y Aplicar Plantilla</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
