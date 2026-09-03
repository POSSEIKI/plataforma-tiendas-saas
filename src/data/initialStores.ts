import { Store, Product, Order, Category, Banner, ServiceItem } from '../types';

export const INITIAL_EMPTY_CATEGORIES: Category[] = [];

export const INITIAL_EMPTY_PRODUCTS: Product[] = [];

export const INITIAL_EMPTY_SERVICES: ServiceItem[] = [];

export const INITIAL_EMPTY_BANNERS: Banner[] = [];

export const INITIAL_EMPTY_ORDERS: Order[] = [];

export const INITIAL_STORE: Store = {
  id: 'store-default-1',
  slug: 'mitienda',
  nombre: 'NOMBRE NEGOCIO',
  subdominio: 'mitienda.mitienda.store',
  rubro: 'farmacia',
  rubroEtiqueta: '🏬 Comercio General',
  whatsapp: '3001234567',
  descripcionCorta: 'Venta y despacho de productos locales con servicio a domicilio y atención en línea.',
  logoUrl: '',
  
  horarios: {
    abierto24Horas: true,
    horaApertura: '08:00 a. m.',
    horaCierre: '10:00 p. m.',
    estaAbiertaActualmente: true,
  },
  
  direccion: {
    viaTipo: 'Calle (Cl)',
    viaNumero: '10',
    viaLetraBis: '-',
    cruceTipo: 'Carrera',
    cruceNumero: '5',
    cruceLetraBis: '-',
    placa: '12',
    barrio: 'Centro',
    direccionCompleta: 'Calle 10 # 5 - 12, Centro',
  },
  
  ubicacion: {
    lat: 3.4516,
    lng: -76.5320,
    ciudad: 'Cali',
    departamento: 'Valle del Cauca',
    coberturaKm: 3.0,
  },
  
  plantilla: 'default',
  temaColor: '#059669',
  temaModo: 'light',
  
  visibilidadStock: {
    mostrarAgotados: false,
    mostrarCantidadesNumericas: true,
  },
  
  pagos: {
    whatsapp: { activo: true, numero: '3001234567' },
    nequi: { 
      activo: true, 
      tipoIntegracion: 'manual',
      celular: '3001234567', 
      titular: 'NOMBRE NEGOCIO',
      apiKey: '',
      clientId: '',
      clientSecret: '',
      celularComercio: '3001234567',
      entorno: 'sandbox',
      tipoCobro: 'ambos'
    },
    daviplata: { 
      activo: true, 
      tipoIntegracion: 'manual',
      celular: '3001234567', 
      titular: 'NOMBRE NEGOCIO',
      apiKey: '',
      clientId: '',
      clientSecret: '',
      idComercio: '3001234567',
      entorno: 'sandbox',
      tipoCobro: 'ambos'
    },
    bancolombia: { activo: true, tipoCuenta: 'Ahorros', numeroCuenta: '000-000000-00', titular: 'NOMBRE NEGOCIO' },
    efectivo: { activo: true, solicitarCambio: true },
    redeban: { activo: false, merchantId: '', terminalId: '', apiKey: '', entorno: 'sandbox' },
    wompi: { activo: false, publicKey: '' },
  },
  
  categorias: INITIAL_EMPTY_CATEGORIES,
  banners: INITIAL_EMPTY_BANNERS,
  servicios: INITIAL_EMPTY_SERVICES,
  categoriasServicios: [],
  claveVendedor: 'Ventas123',
};
