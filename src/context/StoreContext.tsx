import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Store, 
  Product, 
  Order, 
  Category, 
  Banner, 
  ServiceItem, 
  ServiceBooking,
  OrderStatus, 
  ThemeMode,
  TenantStoreData,
  MultiTenantRegistry,
  UserAccount
} from '../types';
import { 
  INITIAL_STORE, 
  INITIAL_EMPTY_PRODUCTS, 
  INITIAL_EMPTY_ORDERS, 
  INITIAL_EMPTY_SERVICES, 
  INITIAL_EMPTY_BANNERS, 
  INITIAL_EMPTY_CATEGORIES 
} from '../data/initialStores';
import { soundManager } from '../utils/audio';

interface StoreContextType {
  // Authentication & Security
  currentUser: UserAccount | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; message?: string };
  logout: () => void;
  registerAccount: (email: string, password: string, nombre: string, storeSlug: string) => { success: boolean; message?: string };
  updateAccountSecurity: (newAdminPass?: string, newSellerPass?: string) => { success: boolean; message?: string };

  // Multi-tenant info
  currentSlug: string;
  allStores: MultiTenantRegistry;
  switchTenant: (slug: string) => void;
  createNewTenantStore: (newStore: Store) => void;
  
  // Current active store data
  store: Store;
  updateStore: (updated: Partial<Store>) => void;
  
  products: Product[];
  addProduct: (p: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, p: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  bulkImportProducts: (newProducts: Product[]) => void;
  bulkImportCatalog: (newProducts: Product[], newCategories: Category[]) => void;
  
  orders: Order[];
  createOrder: (newOrder: Omit<Order, 'id' | 'codigo' | 'fechaHora'>) => Order;
  updateOrderStatus: (id: number, status: OrderStatus, extra?: Partial<Order>) => void;
  simulateIncomingOrder: () => void;
  
  services: ServiceItem[];
  addService: (s: Omit<ServiceItem, 'id'>) => void;
  updateService: (id: string, s: Partial<ServiceItem>) => void;
  deleteService: (id: string) => void;
  
  serviceBookings: ServiceBooking[];
  createBooking: (b: Omit<ServiceBooking, 'id' | 'creadoEn' | 'estado'>) => ServiceBooking;
  updateBookingStatus: (id: string, status: ServiceBooking['estado']) => void;
  deleteBooking: (id: string) => void;
  
  banners: Banner[];
  addBanner: (b: Omit<Banner, 'id'>) => void;
  updateBanner: (id: string, b: Partial<Banner>) => void;
  deleteBanner: (id: string) => void;
  
  categories: Category[];
  addCategory: (nombre: string, icono?: string) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  toggleCategoryStatus: (id: string) => void;
  toggleAllCategories: (active: boolean) => void;
  deleteCategory: (id: string) => void;
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  adminThemeMode: ThemeMode;
  setAdminThemeMode: (mode: ThemeMode) => void;
  landingThemeMode: ThemeMode;
  setLandingThemeMode: (mode: ThemeMode) => void;
  
  isSoundMuted: boolean;
  setIsSoundMuted: (muted: boolean) => void;
  
  activeView: 'landing' | 'admin' | 'storefront';
  setActiveView: (view: 'landing' | 'admin' | 'storefront') => void;
  
  activeAdminTab: string;
  setActiveAdminTab: (tab: string) => void;
  
  lastCreatedOrderId: number | null;
  setLastCreatedOrderId: (id: number | null) => void;
  
  exportFullBackupJSON: () => string;
  importFullBackupJSON: (jsonData: string) => boolean;
  resetToCleanState: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const MULTITENANT_DB_KEY = 'tiendas_saas_multitenant_db_v3';
const ACTIVE_SLUG_KEY = 'tiendas_saas_active_slug_v3';
const ACCOUNTS_DB_KEY = 'tiendas_saas_accounts_db_v1';
const AUTH_SESSION_KEY = 'tiendas_saas_auth_session_v1';
const ACTIVE_VIEW_KEY = 'tiendas_saas_active_view_v1';
const ACTIVE_TAB_KEY = 'tiendas_saas_active_tab_v1';
const LAST_ACTIVITY_KEY = 'tiendas_saas_last_activity_v1';
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes in milliseconds

function isSessionValid(): boolean {
  if (typeof window === 'undefined') return false;
  const session = localStorage.getItem(AUTH_SESSION_KEY);
  if (!session) return false;

  const lastActivityStr = localStorage.getItem(LAST_ACTIVITY_KEY);
  if (!lastActivityStr) return false;

  const lastActivity = parseInt(lastActivityStr, 10);
  if (isNaN(lastActivity)) return false;

  if (Date.now() - lastActivity > INACTIVITY_TIMEOUT_MS) {
    localStorage.removeItem(AUTH_SESSION_KEY);
    localStorage.removeItem(LAST_ACTIVITY_KEY);
    localStorage.setItem(ACTIVE_VIEW_KEY, 'landing');
    return false;
  }

  return true;
}

const INITIAL_ACCOUNTS: UserAccount[] = [
  {
    id: 'usr-felipe',
    email: 'felipeposada1990@hotmail.com',
    passwordHash: 'Ancee674',
    vendedorPasswordHash: 'Ventas123',
    nombre: 'Felipe Posada',
    storeSlug: 'mitienda',
    role: 'superadmin',
    creadoEn: new Date().toISOString(),
  }
];

// Extracts subdomain or URL param for testing
function resolveInitialSlug(): string {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const paramTienda = urlParams.get('tienda');
    if (paramTienda) return paramTienda.toLowerCase();

    const host = window.location.hostname;
    // e.g. sanjuan.mitienda.store -> 'sanjuan'
    const parts = host.split('.');
    if (parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'app' && parts[0] !== 'localhost') {
      return parts[0].toLowerCase();
    }
  }
  return localStorage.getItem(ACTIVE_SLUG_KEY) || 'mitienda';
}

function createDefaultTenantData(slug: string = 'mitienda', name: string = 'NOMBRE NEGOCIO'): TenantStoreData {
  return {
    store: {
      ...INITIAL_STORE,
      id: `store-${slug}`,
      slug,
      nombre: name,
      subdominio: `${slug}.mitienda.store`,
    },
    products: INITIAL_EMPTY_PRODUCTS,
    orders: INITIAL_EMPTY_ORDERS,
    services: INITIAL_EMPTY_SERVICES,
    serviceBookings: [],
    banners: INITIAL_EMPTY_BANNERS,
    categories: INITIAL_EMPTY_CATEGORIES,
  };
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Multi-tenant database registry in local state
  const [registry, setRegistry] = useState<MultiTenantRegistry>(() => {
    const saved = localStorage.getItem(MULTITENANT_DB_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading multitenant DB:', e);
      }
    }
    const defaultData = createDefaultTenantData('mitienda', 'NOMBRE NEGOCIO');
    return { mitienda: defaultData };
  });

  const [currentSlug, setCurrentSlug] = useState<string>(resolveInitialSlug);

  // User Accounts & Authentication
  const [accounts, setAccounts] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem(ACCOUNTS_DB_KEY);
    if (saved) {
      try {
        const parsed: UserAccount[] = JSON.parse(saved);
        const hasFelipe = parsed.find(a => a.email.toLowerCase() === 'felipeposada1990@hotmail.com');
        if (!hasFelipe) {
          parsed.push(INITIAL_ACCOUNTS[0]);
        } else {
          hasFelipe.passwordHash = 'Ancee674';
          hasFelipe.vendedorPasswordHash = hasFelipe.vendedorPasswordHash || 'Ventas123';
          hasFelipe.role = 'superadmin';
        }
        return parsed;
      } catch {}
    }
    return INITIAL_ACCOUNTS;
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    if (isSessionValid()) {
      try {
        const session = localStorage.getItem(AUTH_SESSION_KEY);
        if (session) {
          localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
          return JSON.parse(session);
        }
      } catch {}
    }
    return null;
  });

  const isAuthenticated = !!currentUser;

  useEffect(() => {
    localStorage.setItem(ACCOUNTS_DB_KEY, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(AUTH_SESSION_KEY);
    }
  }, [currentUser]);

  const [activeView, setActiveViewState] = useState<'landing' | 'admin' | 'storefront'>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('tienda')) return 'storefront';
    }

    if (isSessionValid()) {
      const savedView = localStorage.getItem(ACTIVE_VIEW_KEY) as 'landing' | 'admin' | 'storefront' | null;
      if (savedView === 'admin' || savedView === 'storefront') {
        return savedView;
      }
      return 'admin';
    }

    const savedView = localStorage.getItem(ACTIVE_VIEW_KEY) as 'landing' | 'admin' | 'storefront' | null;
    return savedView === 'storefront' ? 'storefront' : 'landing';
  });

  const setActiveView = (view: 'landing' | 'admin' | 'storefront') => {
    setActiveViewState(view);
    localStorage.setItem(ACTIVE_VIEW_KEY, view);
    localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
  };

  const [activeAdminTab, setActiveAdminTabState] = useState<string>(() => {
    return localStorage.getItem(ACTIVE_TAB_KEY) || 'mi-tienda';
  });

  const setActiveAdminTab = (tab: string) => {
    setActiveAdminTabState(tab);
    localStorage.setItem(ACTIVE_TAB_KEY, tab);
    localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
  };

  const login = (emailInput: string, passInput: string): { success: boolean; message?: string } => {
    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanPass = passInput.trim();

    const user = accounts.find(a => a.email.toLowerCase() === cleanEmail);
    if (!user) {
      return { success: false, message: 'El correo ingresado no está registrado en la plataforma.' };
    }

    const tenantStore = user.storeSlug && registry[user.storeSlug] ? registry[user.storeSlug].store : null;
    const sellerPass = user.vendedorPasswordHash || tenantStore?.claveVendedor || 'Ventas123';

    let loggedInUser: UserAccount;

    if (user.passwordHash === cleanPass) {
      // Clave Principal de Administrador (Acceso Completo)
      loggedInUser = {
        ...user,
        role: user.role === 'vendedor' ? 'merchant' : user.role,
      };
    } else if (sellerPass === cleanPass) {
      // Clave Secundaria de Vendedor / Despachador (Acceso Exclusivo a Pedidos)
      loggedInUser = {
        ...user,
        role: 'vendedor',
      };
    } else {
      return { success: false, message: 'Contraseña incorrecta. Acceso denegado.' };
    }

    const now = Date.now();
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(loggedInUser));
    localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
    localStorage.setItem(ACTIVE_VIEW_KEY, 'admin');

    if (loggedInUser.role === 'vendedor') {
      localStorage.setItem(ACTIVE_TAB_KEY, 'pedidos');
      setActiveAdminTabState('pedidos');
    }

    setCurrentUser(loggedInUser);
    setActiveViewState('admin');

    if (user.storeSlug && registry[user.storeSlug]) {
      setCurrentSlug(user.storeSlug);
    }
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(AUTH_SESSION_KEY);
    localStorage.removeItem(LAST_ACTIVITY_KEY);
    localStorage.setItem(ACTIVE_VIEW_KEY, 'landing');
    setActiveViewState('landing');
  };

  const registerAccount = (email: string, pass: string, nombre: string, storeSlug: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const existing = accounts.find(a => a.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { success: false, message: 'Ya existe una cuenta registrada con este correo.' };
    }

    const newAcc: UserAccount = {
      id: `usr-${Date.now()}`,
      email: cleanEmail,
      passwordHash: pass.trim(),
      nombre: nombre.trim(),
      storeSlug,
      role: 'merchant',
      creadoEn: new Date().toISOString(),
    };

    const now = Date.now();
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(newAcc));
    localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
    localStorage.setItem(ACTIVE_VIEW_KEY, 'admin');

    setAccounts(prev => [...prev, newAcc]);
    setCurrentUser(newAcc);
    setActiveViewState('admin');
    return { success: true };
  };

  const updateAccountSecurity = (newAdminPass?: string, newSellerPass?: string): { success: boolean; message?: string } => {
    if (!currentUser) return { success: false, message: 'No hay una sesión activa.' };

    const cleanAdminPass = newAdminPass !== undefined ? newAdminPass.trim() : undefined;
    const cleanSellerPass = newSellerPass !== undefined ? newSellerPass.trim() : undefined;

    if (cleanAdminPass !== undefined && cleanAdminPass !== '' && cleanAdminPass.length < 4) {
      return { success: false, message: 'La contraseña de Administrador debe tener al menos 4 caracteres.' };
    }
    if (cleanSellerPass !== undefined && cleanSellerPass !== '' && cleanSellerPass.length < 4) {
      return { success: false, message: 'La clave de Vendedor debe tener al menos 4 caracteres.' };
    }

    const finalAdminPass = (cleanAdminPass !== undefined && cleanAdminPass !== '') ? cleanAdminPass : currentUser.passwordHash;
    const finalSellerPass = (cleanSellerPass !== undefined && cleanSellerPass !== '') ? cleanSellerPass : (currentUser.vendedorPasswordHash || 'Ventas123');

    // 1. Update currentUser
    const updatedUser: UserAccount = {
      ...currentUser,
      passwordHash: finalAdminPass,
      vendedorPasswordHash: finalSellerPass,
    };
    setCurrentUser(updatedUser);
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(updatedUser));

    // 2. Update accounts array in state and storage
    setAccounts(prev => {
      const nextAccounts = prev.map(acc => {
        if (acc.email.toLowerCase() === currentUser.email.toLowerCase() || acc.id === currentUser.id) {
          return {
            ...acc,
            passwordHash: finalAdminPass,
            vendedorPasswordHash: finalSellerPass,
          };
        }
        return acc;
      });
      localStorage.setItem(ACCOUNTS_DB_KEY, JSON.stringify(nextAccounts));
      return nextAccounts;
    });

    // 3. Update store.claveVendedor in tenant store
    updateCurrentTenant(prev => ({
      ...prev,
      store: {
        ...prev.store,
        claveVendedor: finalSellerPass,
      }
    }));

    return { success: true, message: '¡Claves de acceso actualizadas con éxito!' };
  };

  // 30-Minute Inactivity Auto-Logout Manager
  useEffect(() => {
    if (!currentUser) return;

    let lastRecorded = Date.now();
    localStorage.setItem(LAST_ACTIVITY_KEY, String(lastRecorded));

    const handleUserActivity = () => {
      const now = Date.now();
      // Throttle storage updates to every 30 seconds
      if (now - lastRecorded > 30000) {
        lastRecorded = now;
        localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
      }
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(evt => window.addEventListener(evt, handleUserActivity, { passive: true }));

    // Periodic check every 30 seconds for 30-minute inactivity
    const interval = setInterval(() => {
      const lastActStr = localStorage.getItem(LAST_ACTIVITY_KEY);
      if (lastActStr) {
        const lastAct = parseInt(lastActStr, 10);
        if (!isNaN(lastAct) && Date.now() - lastAct > INACTIVITY_TIMEOUT_MS) {
          console.warn('Sesión cerrada automáticamente por 30 minutos de inactividad.');
          logout();
        }
      }
    }, 30000);

    return () => {
      events.forEach(evt => window.removeEventListener(evt, handleUserActivity));
      clearInterval(interval);
    };
  }, [currentUser]);

  // Fallback if currentSlug doesn't exist in registry
  const currentTenantData: TenantStoreData = registry[currentSlug] || registry['mitienda'] || createDefaultTenantData(currentSlug);

  // Sync active tenant state
  const store = currentTenantData.store;
  const products = currentTenantData.products;
  const orders = currentTenantData.orders;
  const services = currentTenantData.services;
  const serviceBookings = currentTenantData.serviceBookings;
  const banners = currentTenantData.banners;
  const categories = currentTenantData.categories;

  // Independent Themes: Admin Theme vs Landing Theme
  const [adminThemeMode, setAdminThemeModeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('tiendas_saas_admin_theme_v1') as ThemeMode;
    return saved || store.temaModo || 'light';
  });

  const [landingThemeMode, setLandingThemeModeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('tiendas_saas_landing_theme_v1') as ThemeMode;
    return saved || 'light';
  });

  const [isSoundMuted, setIsSoundMutedState] = useState<boolean>(false);
  const [lastCreatedOrderId, setLastCreatedOrderId] = useState<number | null>(null);

  // Save to multi-tenant DB
  useEffect(() => {
    localStorage.setItem(MULTITENANT_DB_KEY, JSON.stringify(registry));
  }, [registry]);

  useEffect(() => {
    localStorage.setItem(ACTIVE_SLUG_KEY, currentSlug);
  }, [currentSlug]);

  // Update helper for active tenant data
  const updateCurrentTenant = (updater: (prev: TenantStoreData) => TenantStoreData) => {
    setRegistry(prev => {
      const current = prev[currentSlug] || createDefaultTenantData(currentSlug);
      const updated = updater(current);
      return { ...prev, [currentSlug]: updated };
    });
  };

  const switchTenant = (slug: string) => {
    if (!registry[slug]) {
      // create if not exists
      setRegistry(prev => ({
        ...prev,
        [slug]: createDefaultTenantData(slug, slug.toUpperCase())
      }));
    }
    setCurrentSlug(slug);
  };

  const createNewTenantStore = (newStore: Store) => {
    const slug = newStore.slug || newStore.nombre.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const newTenant: TenantStoreData = {
      store: {
        ...newStore,
        slug,
        subdominio: `${slug}.mitienda.store`,
      },
      products: [],
      orders: [],
      services: [],
      serviceBookings: [],
      banners: [],
      categories: [],
    };

    setRegistry(prev => ({ ...prev, [slug]: newTenant }));
    setCurrentSlug(slug);
  };

  // Theme Handlers
  const setAdminThemeMode = (mode: ThemeMode) => {
    setAdminThemeModeState(mode);
    localStorage.setItem('tiendas_saas_admin_theme_v1', mode);
    updateStore({ temaModo: mode });
  };

  const setLandingThemeMode = (mode: ThemeMode) => {
    setLandingThemeModeState(mode);
    localStorage.setItem('tiendas_saas_landing_theme_v1', mode);
  };

  // Sync active root dark class depending on which view is active (Landing vs Admin vs Storefront)
  useEffect(() => {
    const root = document.documentElement;
    let targetMode: ThemeMode = 'light';

    if (activeView === 'landing') {
      targetMode = landingThemeMode;
    } else if (activeView === 'admin') {
      targetMode = adminThemeMode;
    } else {
      // storefront
      targetMode = adminThemeMode || store.temaModo || 'light';
    }

    if (targetMode === 'dark') {
      root.classList.add('dark');
    } else if (targetMode === 'light') {
      root.classList.remove('dark');
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [activeView, adminThemeMode, landingThemeMode, store.temaModo]);

  const setIsSoundMuted = (muted: boolean) => {
    setIsSoundMutedState(muted);
    soundManager.setMuted(muted);
  };

  // Mutators for current active tenant
  const updateStore = (updated: Partial<Store>) => {
    updateCurrentTenant(prev => ({
      ...prev,
      store: { ...prev.store, ...updated }
    }));
  };

  const addProduct = (p: Omit<Product, 'id'>) => {
    const newProd: Product = { ...p, id: 'prod-' + Date.now() };
    updateCurrentTenant(prev => ({
      ...prev,
      products: [newProd, ...prev.products]
    }));
  };

  const updateProduct = (id: string, p: Partial<Product>) => {
    updateCurrentTenant(prev => ({
      ...prev,
      products: prev.products.map(item => item.id === id ? { ...item, ...p } : item)
    }));
  };

  const deleteProduct = (id: string) => {
    updateCurrentTenant(prev => ({
      ...prev,
      products: prev.products.filter(item => item.id !== id)
    }));
  };

  const bulkImportProducts = (newProducts: Product[]) => {
    updateCurrentTenant(prev => ({ ...prev, products: newProducts }));
  };

  const bulkImportCatalog = (newProducts: Product[], newCategories: Category[]) => {
    updateCurrentTenant(prev => {
      const existingNames = new Set(prev.categories.map(c => c.nombre.toUpperCase()));
      const toAdd = newCategories.filter(c => !existingNames.has(c.nombre.toUpperCase()));
      return {
        ...prev,
        products: newProducts,
        categories: [...prev.categories, ...toAdd],
      };
    });
  };

  const createOrder = (orderData: Omit<Order, 'id' | 'codigo' | 'fechaHora'>): Order => {
    const nextId = orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1;
    const now = new Date();
    const timeStr = now.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit', hour12: true });
    const dateStr = now.toISOString().split('T')[0];

    const newOrder: Order = {
      ...orderData,
      id: nextId,
      codigo: `#${nextId}`,
      fechaHora: `${timeStr} · ${dateStr}`,
      fechaISO: dateStr,
    };

    updateCurrentTenant(prev => ({
      ...prev,
      orders: [newOrder, ...prev.orders]
    }));

    setLastCreatedOrderId(nextId);
    soundManager.playNewOrderChime();
    return newOrder;
  };

  const updateOrderStatus = (id: number, status: OrderStatus, extra?: Partial<Order>) => {
    updateCurrentTenant(prev => ({
      ...prev,
      orders: prev.orders.map(ord => ord.id === id ? { ...ord, estado: status, ...extra } : ord)
    }));

    if (status === 'domicilio_rappi' || status === 'listo') {
      soundManager.playRappiAlert();
    } else {
      soundManager.playSuccessSound();
    }
  };

  const simulateIncomingOrder = () => {
    if (products.length === 0) {
      alert('Primero agrega productos o importa tu catálogo Excel para simular pedidos.');
      return;
    }

    const randomNames = ['Valeria Gómez', 'Mauricio Delgado', 'Daniela Restrepo', 'Santiago Herrera'];
    const randomAddrs = ['Calle 15 # 4 - 30, Centro', 'Carrera 1 # 10 - 20, San Fernando'];
    const name = randomNames[Math.floor(Math.random() * randomNames.length)];
    const addr = randomAddrs[Math.floor(Math.random() * randomAddrs.length)];
    const selectedProd = products[0];

    createOrder({
      clienteNombre: name,
      clienteTelefono: '315' + Math.floor(1000000 + Math.random() * 9000000),
      clienteDireccion: addr,
      tipoEntrega: 'domicilio',
      items: [
        {
          productoId: selectedProd.id,
          nombre: selectedProd.nombre,
          precio: selectedProd.precio,
          cantidad: 1,
          presentacion: selectedProd.presentacion,
          imagenUrl: selectedProd.imagenUrl,
        }
      ],
      subtotal: selectedProd.precio,
      costoEnvio: 3500,
      total: selectedProd.precio + 3500,
      estado: 'nuevo',
      metodoPago: 'nequi',
      pagoEstado: 'pendiente',
    });
  };

  const addService = (s: Omit<ServiceItem, 'id'>) => {
    const newService: ServiceItem = { ...s, id: 'srv-' + Date.now() };
    updateCurrentTenant(prev => ({
      ...prev,
      services: [...prev.services, newService]
    }));
  };

  const updateService = (id: string, s: Partial<ServiceItem>) => {
    updateCurrentTenant(prev => ({
      ...prev,
      services: prev.services.map(item => item.id === id ? { ...item, ...s } : item)
    }));
  };

  const deleteService = (id: string) => {
    updateCurrentTenant(prev => ({
      ...prev,
      services: prev.services.filter(item => item.id !== id)
    }));
  };

  const createBooking = (b: Omit<ServiceBooking, 'id' | 'creadoEn' | 'estado'>): ServiceBooking => {
    const newBooking: ServiceBooking = {
      ...b,
      id: 'bk-' + Date.now(),
      estado: 'pendiente',
      creadoEn: new Date().toISOString(),
    };
    updateCurrentTenant(prev => ({
      ...prev,
      serviceBookings: [newBooking, ...(prev.serviceBookings || [])]
    }));
    soundManager.playNewOrderChime();
    return newBooking;
  };

  const updateBookingStatus = (id: string, status: ServiceBooking['estado']) => {
    updateCurrentTenant(prev => ({
      ...prev,
      serviceBookings: (prev.serviceBookings || []).map(bk => bk.id === id ? { ...bk, estado: status } : bk)
    }));
    soundManager.playSuccessSound();
  };

  const deleteBooking = (id: string) => {
    updateCurrentTenant(prev => ({
      ...prev,
      serviceBookings: (prev.serviceBookings || []).filter(bk => bk.id !== id)
    }));
  };

  const addBanner = (b: Omit<Banner, 'id'>) => {
    const newBanner: Banner = { ...b, id: 'ban-' + Date.now() };
    updateCurrentTenant(prev => ({
      ...prev,
      banners: [...prev.banners, newBanner]
    }));
  };

  const updateBanner = (id: string, b: Partial<Banner>) => {
    updateCurrentTenant(prev => ({
      ...prev,
      banners: prev.banners.map(item => item.id === id ? { ...item, ...b } : item)
    }));
  };

  const deleteBanner = (id: string) => {
    updateCurrentTenant(prev => ({
      ...prev,
      banners: prev.banners.filter(item => item.id !== id)
    }));
  };

  const addCategory = (nombre: string, icono: string = 'Tag') => {
    const id = 'cat-' + nombre.toLowerCase().replace(/[^a-z0-9]/g, '-');
    updateCurrentTenant(prev => {
      if (prev.categories.some(c => c.id === id)) return prev;
      return {
        ...prev,
        categories: [...prev.categories, { id, nombre: nombre.toUpperCase(), icono, activo: true }]
      };
    });
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    updateCurrentTenant(prev => ({
      ...prev,
      categories: prev.categories.map(c => c.id === id ? { ...c, ...updates } : c)
    }));
  };

  const toggleCategoryStatus = (id: string) => {
    updateCurrentTenant(prev => ({
      ...prev,
      categories: prev.categories.map(c => c.id === id ? { ...c, activo: !(c.activo !== false) } : c)
    }));
  };

  const toggleAllCategories = (active: boolean) => {
    updateCurrentTenant(prev => ({
      ...prev,
      categories: prev.categories.map(c => ({ ...c, activo: active }))
    }));
  };

  const deleteCategory = (id: string) => {
    updateCurrentTenant(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c.id !== id)
    }));
  };

  const setCategories: React.Dispatch<React.SetStateAction<Category[]>> = (action) => {
    updateCurrentTenant(prev => ({
      ...prev,
      categories: typeof action === 'function' ? action(prev.categories) : action
    }));
  };

  const exportFullBackupJSON = (): string => {
    return JSON.stringify(currentTenantData, null, 2);
  };

  const importFullBackupJSON = (jsonData: string): boolean => {
    try {
      const data: TenantStoreData = JSON.parse(jsonData);
      if (data.store) {
        updateCurrentTenant(() => data);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const resetToCleanState = () => {
    updateCurrentTenant(() => createDefaultTenantData(currentSlug));
  };

  return (
    <StoreContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        login,
        logout,
        registerAccount,
        currentSlug,
        allStores: registry,
        switchTenant,
        createNewTenantStore,
        store,
        updateStore,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        bulkImportProducts,
        bulkImportCatalog,
        orders,
        createOrder,
        updateOrderStatus,
        simulateIncomingOrder,
        services,
        addService,
        updateService,
        deleteService,
        serviceBookings,
        createBooking,
        updateBookingStatus,
        deleteBooking,
        banners,
        addBanner,
        updateBanner,
        deleteBanner,
        categories,
        addCategory,
        updateCategory,
        toggleCategoryStatus,
        toggleAllCategories,
        deleteCategory,
        setCategories,
        themeMode: adminThemeMode,
        setThemeMode: setAdminThemeMode,
        adminThemeMode,
        setAdminThemeMode,
        landingThemeMode,
        setLandingThemeMode,
        isSoundMuted,
        setIsSoundMuted,
        activeView,
        setActiveView,
        activeAdminTab,
        setActiveAdminTab,
        updateAccountSecurity,
        lastCreatedOrderId,
        setLastCreatedOrderId,
        exportFullBackupJSON,
        importFullBackupJSON,
        resetToCleanState,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
