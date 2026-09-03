import React, { useState } from 'react';
import { 
  Store, 
  ShoppingBag, 
  Bike, 
  Bell, 
  Smartphone, 
  CheckCircle, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  CreditCard, 
  ShieldCheck, 
  Zap, 
  MapPin, 
  FileSpreadsheet, 
  Eye, 
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { LoginModal } from './LoginModal';
import { CreateStoreModal } from './CreateStoreModal';
import { RubroType } from '../../types';

interface LandingPageProps {
  forceLogin?: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ forceLogin = false }) => {
  const { setActiveView, setActiveAdminTab, landingThemeMode, setLandingThemeMode } = useStore();
  const [isLoginOpen, setIsLoginOpen] = useState(forceLogin);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedRubroDemo, setSelectedRubroDemo] = useState<RubroType>('farmacia');

  const rubros = [
    {
      type: 'farmacia' as RubroType,
      name: 'Farmacias & Droguerías',
      icon: '💊',
      badge: 'Servicio 24 Horas',
      headline: 'Vende medicamentos, inyectología y cotiza recetas por WhatsApp',
      features: ['Control 24/7 y horarios', 'Servicios de inyectología/citas', 'Filtro por medicamentos y primeros auxilios', 'Despacho express Rappi'],
      previewImg: 'https://images.unsplash.com/photo-1586015555751-63c252a16d00?w=600&q=80',
    },
    {
      type: 'restaurante' as RubroType,
      name: 'Restaurantes & Comidas',
      icon: '🍔',
      badge: 'Comandas con Sonido',
      headline: 'Menú digital ultra rápido con timbre de alerta en cocina',
      features: ['Timbre sonoro al llegar pedido', 'Despacho directo a motorizados Rappi', 'Modificadores de plato e ingredientes', 'Efectivo con cambio exacto'],
      previewImg: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80',
    },
    {
      type: 'veterinaria' as RubroType,
      name: 'Veterinarias & Pet Shops',
      icon: '🐶',
      badge: 'Agendamiento de Baños',
      headline: 'Catálogo de alimentos, accesorios y citas médicas',
      features: ['Mini-app de agendamiento de baño canino', 'Urgencias veterinarias', 'Control de stock de alimentos', 'Pagos por Nequi y Daviplata'],
      previewImg: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600&q=80',
    },
    {
      type: 'retail' as RubroType,
      name: 'Moda & Boutiques',
      icon: '👗',
      badge: 'Catálogo Minimalista',
      headline: 'Muestra tus colecciones con fotos en alta definición',
      features: ['Plantilla limpia tipo boutique', 'Gestión de banners de temporada', 'Ventas por WhatsApp y Wompi', 'Mapeo de inventario con Excel'],
      previewImg: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80',
    }
  ];

  const currentRubro = rubros.find(r => r.type === selectedRubroDemo) || rubros[0];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Modals */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <CreateStoreModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 bg-clip-text text-transparent">
                TiendasPro
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                Plataforma SaaS Colombia
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <a href="#rubros" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Rubros</a>
            <a href="#funciones" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Funcionalidades</a>
            <a href="#domicilios" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Domicilios Rappi</a>
            <a href="#pagos" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Pagos Colombia</a>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle (Independent from Admin Panel) */}
            <button
              onClick={() => setLandingThemeMode(landingThemeMode === 'dark' ? 'light' : 'dark')}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Cambiar tema de la página de inicio"
            >
              {landingThemeMode === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            <button
              onClick={() => setIsLoginOpen(true)}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              INGRESAR
            </button>

            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>CREA MI TIENDA</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        {/* Decorative Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-emerald-500/10 dark:bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold shadow-sm">
              <Zap className="w-3.5 h-3.5" />
              <span>Arquitectura Cloud Reactiva · 0% Caídas · Tiempo Real</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Crea la Tienda Online de tu Negocio con{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 bg-clip-text text-transparent">
                Despachos Rappi
              </span>{' '}
              y Pagos en Tiempo Real
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Vende las 24 horas con comandas sonoras, sincronización de inventario desde Excel/POS y cobros directos por <strong>Nequi, Daviplata, Bancolombia y Wompi</strong> sin intermediarios.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setIsCreateOpen(true)}
                className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-3 transition transform hover:-translate-y-1"
              >
                <span>¡CREA TU TIENDA AHORA!</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => {
                  setActiveAdminTab('mi-tienda');
                  setActiveView('admin');
                }}
                className="w-full sm:w-auto px-7 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 text-slate-800 dark:text-slate-200 font-bold rounded-2xl shadow-sm flex items-center justify-center gap-2.5 transition"
              >
                <Eye className="w-5 h-5 text-emerald-600" />
                <span>Explorar Panel Admin en Vivo</span>
              </button>
            </div>

            {/* Micro badges */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Sonido de alerta en pedidos</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Nomenclatura colombiana de vías</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Copia de seguridad en 1 clic</span>
              </div>
            </div>
          </div>

          {/* Interactive Rubros Demo Card */}
          <div id="rubros" className="mt-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 md:p-8 overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Adaptado a tu Tipo de Negocio
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Elige tu rubro y mira cómo funciona tu plataforma
                </h3>
              </div>

              {/* Rubro Tabs */}
              <div className="flex flex-wrap gap-2">
                {rubros.map((item) => (
                  <button
                    key={item.type}
                    onClick={() => setSelectedRubroDemo(item.type)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                      selectedRubroDemo === item.type
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Rubro Preview Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 items-center">
              <div className="lg:col-span-6 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{currentRubro.badge}</span>
                </div>
                <h4 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {currentRubro.headline}
                </h4>
                <div className="space-y-2.5 pt-2">
                  {currentRubro.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-3.5 h-3.5" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex items-center gap-4">
                  <button
                    onClick={() => {
                      setActiveAdminTab('mi-tienda');
                      setActiveView('admin');
                    }}
                    className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl text-xs flex items-center gap-2 hover:opacity-90 transition"
                  >
                    <span>Ver Panel Admin</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setActiveView('storefront')}
                    className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Ver Tienda del Cliente</span>
                  </button>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 aspect-video group">
                  <img
                    src={currentRubro.previewImg}
                    alt={currentRubro.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex items-end p-6">
                    <div className="text-white space-y-1">
                      <div className="text-xs font-semibold text-emerald-400">Demostración en vivo</div>
                      <div className="text-lg font-bold">SAN JUAN DE DIOS DROGUERIAS</div>
                      <div className="text-xs text-slate-300">Cali, Valle · Abierto 24 Horas · Despachos Rappi</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section id="funciones" className="py-20 bg-slate-100/70 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              ¿Por qué es superior a otras soluciones?
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Herramientas diseñadas para la operación real del comercio
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
              Todo lo que necesitas para atender clientes físicos, virtuales y domicilios en un solo tablero reactivo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Pedidos con sonido y Rappi */}
            <div className="bg-white dark:bg-slate-900 p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Bell className="w-6 h-6 animate-bounce-short" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Comandas con Alerta Sonora & Despacho Rappi
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Cuando un cliente hace un pedido, el panel suena de inmediato. Acepta, alista y notifica al domiciliario de Rappi o moto propia con un solo clic.
              </p>
            </div>

            {/* Card 2: Nomenclatura Colombiana y GPS */}
            <div className="bg-white dark:bg-slate-900 p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Direcciones Colombianas & Radio GPS
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Asistente de vías (Calle, Carrera, Transversal, Placa y Barrio). Mapa interactivo con radio de cobertura máxima en kilómetros para evitar pedidos fuera de zona.
              </p>
            </div>

            {/* Card 3: Importador de Excel y Backup */}
            <div className="bg-white dark:bg-slate-900 p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Sincronización POS & Excel Masivo
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Sube tu catálogo completo desde Siigo, Alegra o Excel en segundos. Copias de seguridad completas descargables con un clic para no perder datos nunca.
              </p>
            </div>

            {/* Card 4: Pagos Colombia */}
            <div className="bg-white dark:bg-slate-900 p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Nequi, Daviplata, Bancolombia & Wompi
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Recibe pagos digitales con visor de comprobantes adjuntos, pagos contra entrega con solicitud de cambio exacto, o pasarelas automáticas Redeban y Wompi.
              </p>
            </div>

            {/* Card 5: Modo Día / Modo Noche */}
            <div className="bg-white dark:bg-slate-900 p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Moon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Plantillas & Modo Noche Cómodo
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Elige entre 3 plantillas optimizadas para no abrumarte configurando 20 palancas de colores. Incluye tema oscuro para descansar la vista en turnos de noche.
              </p>
            </div>

            {/* Card 6: Servicios y Agendamiento */}
            <div className="bg-white dark:bg-slate-900 p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Mini-App de Agendamiento & Citas
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Ofrece servicios adicionales como inyectología, toma de presión, baño de mascotas o citas especiales con selector de horario y botón de urgencia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="py-16 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            ¿Listo para llevar tu negocio al siguiente nivel?
          </h2>
          <p className="text-emerald-100 max-w-xl mx-auto text-sm sm:text-base">
            Crea tu tienda en menos de 2 minutos, activa tus métodos de pago colombianos y empieza a recibir pedidos hoy mismo.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-8 py-4 bg-white text-emerald-800 hover:bg-emerald-50 font-extrabold rounded-2xl shadow-xl transition transform hover:-translate-y-0.5"
            >
              Comenzar Ahora Gratis
            </button>
            <button
              onClick={() => {
                setActiveAdminTab('mi-tienda');
                setActiveView('admin');
              }}
              className="px-6 py-4 bg-emerald-900/60 hover:bg-emerald-900 text-white font-bold rounded-2xl border border-emerald-500/40 transition"
            >
              Ver Demostración del Administrador
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-slate-700 dark:text-slate-300">TiendasPro Colombia</span>
            <span>· Plataforma SaaS para Comercios Locales</span>
          </div>
          <div>
            <span>Hecho con arquitectura moderna · React, Web Audio & TailwindCSS</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
