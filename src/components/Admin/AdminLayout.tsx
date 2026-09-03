import React from 'react';
import { 
  Store as StoreIcon, 
  ShoppingBag, 
  Package, 
  Tag, 
  Image as ImageIcon, 
  PlusCircle, 
  FileSpreadsheet, 
  TrendingUp, 
  CreditCard, 
  Palette, 
  ExternalLink, 
  LogOut, 
  Volume2, 
  VolumeX, 
  Sun, 
  Moon, 
  Monitor, 
  BellRing, 
  CheckCircle2, 
  XCircle,
  Menu,
  X
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { soundManager } from '../../utils/audio';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { 
    currentUser,
    logout,
    store, 
    updateStore, 
    orders, 
    products, 
    themeMode, 
    setThemeMode, 
    isSoundMuted, 
    setIsSoundMuted, 
    activeAdminTab, 
    setActiveAdminTab, 
    setActiveView,
    simulateIncomingOrder,
    allStores,
    currentSlug,
    switchTenant,
    serviceBookings
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const newOrdersCount = orders.filter(o => o.estado === 'nuevo').length;
  const lowStockCount = products.filter(p => p.stock <= 0).length;
  const pendingBookingsCount = (serviceBookings || []).filter(b => b.estado === 'pendiente').length;

  const isVendedor = currentUser?.role === 'vendedor';

  const navItemsPrincipal = isVendedor
    ? [
        { 
          id: 'pedidos', 
          label: 'Gestión de Pedidos & Domicilios', 
          icon: ShoppingBag, 
          badge: newOrdersCount > 0 ? newOrdersCount : undefined, 
          badgeColor: 'bg-rose-500 text-white' 
        }
      ]
    : [
        { id: 'mi-tienda', label: 'Mi Tienda', icon: StoreIcon },
        { id: 'pedidos', label: 'Pedidos', icon: ShoppingBag, badge: newOrdersCount > 0 ? newOrdersCount : undefined, badgeColor: 'bg-rose-500 text-white' },
        { id: 'inventario', label: 'Inventario', icon: Package, badge: lowStockCount > 0 ? `${lowStockCount}` : undefined, badgeColor: 'bg-amber-500 text-white' },
        { id: 'categorias', label: 'Categorías', icon: Tag },
        { id: 'banners', label: 'Banners', icon: ImageIcon },
        { id: 'servicios', label: 'Servicios', icon: PlusCircle, badge: pendingBookingsCount > 0 ? `${pendingBookingsCount}` : undefined, badgeColor: 'bg-teal-600 text-white' },
      ];

  const navItemsFinanzas = isVendedor ? [] : [
    { id: 'importar-excel', label: 'Importar Excel', icon: FileSpreadsheet },
    { id: 'ventas', label: 'Ventas', icon: TrendingUp },
    { id: 'metodos-pago', label: 'Métodos de Pago', icon: CreditCard },
    { id: 'colores-plantillas', label: 'Colores & Marca', icon: Palette },
  ];

  const handleTestSound = () => {
    soundManager.playNewOrderChime();
  };

  const toggleStoreStatus = () => {
    const isCurrentlyOpen = store.horarios.estaAbiertaActualmente;
    updateStore({
      horarios: {
        ...store.horarios,
        estaAbiertaActualmente: !isCurrentlyOpen,
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Left: Mobile Toggle & Store Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {store.logoUrl ? (
              <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center flex-shrink-0">
                <img 
                  src={store.logoUrl} 
                  alt={store.nombre} 
                  className="max-h-full max-w-full object-contain" 
                />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-extrabold text-sm shadow-md shadow-emerald-600/20 flex-shrink-0">
                {store.nombre ? store.nombre.charAt(0) : '🏢'}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                  {store.nombre}
                </h1>
                {/* Live Status Toggle */}
                <button
                  onClick={toggleStoreStatus}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide transition ${
                    store.horarios.estaAbiertaActualmente
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-200'
                      : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 hover:bg-rose-200'
                  }`}
                  title="Haz clic para cambiar el estado de la tienda"
                >
                  <span className={`w-2 h-2 rounded-full ${store.horarios.estaAbiertaActualmente ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                  <span>{store.horarios.estaAbiertaActualmente ? 'Abierta' : 'Cerrada'}</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 truncate hidden sm:flex">
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                  {store.subdominio || `${store.slug}.mitienda.store`}
                </span>
                {store.ubicacion?.ciudad && (
                  <>
                    <span>·</span>
                    <span>📍 {store.ubicacion.ciudad}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Simulate Order Button */}
            <button
              onClick={simulateIncomingOrder}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 text-xs font-bold hover:bg-amber-100 transition shadow-sm"
              title="Crea un pedido de prueba y activa la alerta audible"
            >
              <BellRing className="w-3.5 h-3.5 animate-bounce-short text-amber-600" />
              <span>Simular Pedido</span>
            </button>

            {/* Sound Mute / Test */}
            <button
              onClick={() => setIsSoundMuted(!isSoundMuted)}
              className={`p-2 rounded-xl border text-xs font-semibold transition ${
                isSoundMuted
                  ? 'border-rose-200 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
              title={isSoundMuted ? 'Sonido desactivado' : 'Sonido activado'}
            >
              {isSoundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
            </button>

            {/* Theme Toggle */}
            <div className="hidden sm:flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setThemeMode('light')}
                className={`p-1.5 rounded-lg text-xs transition ${themeMode === 'light' ? 'bg-white dark:bg-slate-700 shadow-sm text-amber-600 font-bold' : 'text-slate-500'}`}
                title="Modo Día"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setThemeMode('dark')}
                className={`p-1.5 rounded-lg text-xs transition ${themeMode === 'dark' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-400 font-bold' : 'text-slate-500'}`}
                title="Modo Noche (Descanso visual)"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setThemeMode('system')}
                className={`p-1.5 rounded-lg text-xs transition ${themeMode === 'system' ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 font-bold' : 'text-slate-500'}`}
                title="Automático / Sistema"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Ver mi Tienda */}
            <button
              onClick={() => setActiveView('storefront')}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition shadow-sm"
            >
              <span>Ver mi tienda</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            {/* Salir / Logout Seguro */}
            <button
              onClick={logout}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition flex items-center gap-1.5 border border-rose-200 dark:border-rose-900"
              title="Cerrar sesión de forma segura"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 gap-6">
        {/* Sidebar Navigation */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 lg:z-0 lg:rounded-2xl lg:shadow-sm lg:border lg:p-4 flex flex-col justify-between ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="space-y-6">
            {/* Panel Principal */}
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-2">
                PANEL PRINCIPAL
              </div>
              <nav className="space-y-1">
                {navItemsPrincipal.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeAdminTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveAdminTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-extrabold border border-emerald-500/20'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Gestión & Finanzas (Solo visible para Administradores) */}
            {!isVendedor && (
              <div>
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-2">
                  GESTIÓN & FINANZAS
                </div>
                <nav className="space-y-1">
                  {navItemsFinanzas.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeAdminTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveAdminTab(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                          isActive
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-extrabold border border-emerald-500/20'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                          <span>{item.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>
            )}
          </div>

          {/* User Profile in Sidebar */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-[11px] space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl text-white font-black flex items-center justify-center text-xs shadow-sm flex-shrink-0 ${
                isVendedor ? 'bg-amber-600' : 'bg-emerald-600'
              }`}>
                {currentUser?.nombre ? currentUser.nombre.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-extrabold text-slate-900 dark:text-white truncate">
                  {currentUser?.nombre || (isVendedor ? 'Vendedor / Despacho' : 'Administrador')}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {currentUser?.email || 'admin@mitienda.store'}
                </div>
                <div className="mt-1">
                  {isVendedor ? (
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 inline-block">
                      📦 Rol: Vendedor (Solo Pedidos)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 inline-block">
                      👑 Rol: Administrador
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full py-1.5 px-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 font-bold rounded-lg text-[10px] flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </aside>

        {/* Backdrop for mobile */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          />
        )}

        {/* Center Content View */}
        <main className="flex-1 min-w-0 bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
