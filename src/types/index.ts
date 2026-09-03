export type RubroType = 
  | 'farmacia' 
  | 'restaurante' 
  | 'veterinaria' 
  | 'retail' 
  | 'supermercado' 
  | 'aromaterapia'
  | 'otro';

export type TemplateType = 'default' | 'zen' | 'boutique' | 'gastro' | 'farmacia' | 'veterinaria' | 'supermercado';

export type ThemeMode = 'light' | 'dark' | 'system';

export type OrderStatus = 
  | 'nuevo' 
  | 'preparando' 
  | 'domicilio_rappi' 
  | 'listo' 
  | 'en_camino' 
  | 'entregado' 
  | 'cancelado';

export type DeliveryType = 'domicilio' | 'recoger';

export type PaymentMethodType = 
  | 'whatsapp' 
  | 'nequi' 
  | 'daviplata' 
  | 'bancolombia' 
  | 'efectivo' 
  | 'redeban' 
  | 'wompi';

export interface ColombianAddress {
  viaTipo: string;      // Calle, Carrera, Diagonal, Transversal, Avenida, etc.
  viaNumero: string;    // ej: 17
  viaLetraBis: string;  // -, A, B, Bis, etc.
  cruceTipo: string;    // Calle, Carrera, etc.
  cruceNumero: string;  // ej: 3
  cruceLetraBis: string;// -, A, B, etc.
  placa: string;        // ej: 26
  barrio: string;       // ej: San Nicolás
  complemento?: string; // ej: Apto 718-5, Local 102
  direccionCompleta: string; // ej: Calle 17 # 3 - 26, San Nicolás
}

export interface StoreLocation {
  lat: number;
  lng: number;
  ciudad: string;
  departamento: string;
  coberturaKm: number;
}

export interface StoreSchedule {
  abierto24Horas: boolean;
  horaApertura: string;
  horaCierre: string;
  estaAbiertaActualmente: boolean;
}

export interface NequiPaymentConfig {
  activo: boolean;
  tipoIntegracion?: 'api' | 'manual';
  // Manual / Transferencia Directa
  celular: string;
  titular: string;
  qrUrl?: string;
  // API Oficial Nequi Conecta
  apiKey?: string;
  clientId?: string;
  clientSecret?: string;
  celularComercio?: string;
  entorno?: 'sandbox' | 'produccion';
  tipoCobro?: 'push' | 'qr_dinamico' | 'ambos';
}

export interface PaymentAccounts {
  whatsapp: { activo: boolean; numero: string };
  nequi: NequiPaymentConfig;
  daviplata: { activo: boolean; celular: string; titular: string; qrUrl?: string };
  bancolombia: { activo: boolean; tipoCuenta: 'Ahorros' | 'Corriente'; numeroCuenta: string; titular: string; qrUrl?: string };
  efectivo: { activo: boolean; solicitarCambio: boolean };
  redeban: { activo: boolean; merchantId: string; terminalId: string; apiKey: string; entorno: 'sandbox' | 'produccion' };
  wompi: { activo: boolean; publicKey: string };
}

export type UnidadMedidaType = 'UNIDAD' | 'KG' | 'LB' | 'GRAMO' | 'METRO' | 'LITRO' | 'PAQUETE';

export type ProductPresentationType = 'CAJA' | 'BLISTER' | 'UNIDAD' | 'REGULAR';

export interface Product {
  id: string;
  codigo?: string;
  nombre: string;
  descripcion?: string;
  principioActivo?: string;       // ej: "Acetaminofén 500mg + Cafeína"
  laboratorio?: string;           // ej: "GSK", "Genfar", "Bayer"
  precio: number;                 // Precio de venta estándar / base
  precioAnterior?: number;
  stock: number;                  // 🔹 STOCK TOTAL ALMACENADO EN UNIDADES MÍNIMAS BASE
  codigoBarras?: string;          // Código de barras de la caja / empaque principal
  categoriaId: string;
  presentacion: string;           // ej: UNIDAD, CAJA, BLISTER, KG, etc.
  imagenUrl: string;
  activo: boolean;
  destacado?: boolean;

  // 🔹 BANDERAS Y MULTIPLICADORES DE FRACCIONAMIENTO:
  manejaFracciones?: boolean;     // ¿Se vende por caja, blíster o suelto?
  contenidoCaja?: number;         // 1 Caja trae N unidades base (ej: 24)
  contenidoBlister?: number;      // 1 Blíster trae N unidades base (ej: 6)

  // 🔹 PRECIOS DE VENTA AL PÚBLICO:
  precioCaja?: number;            // Precio llevando la caja completa (ej: 28000)
  precioBlister?: number;         // Precio llevando 1 blíster (ej: 8000)
  precioUnidad?: number;          // Precio llevando 1 pastilla/unidad suelta (ej: 1500)

  // 🔹 CÓDIGOS DE BARRAS POR PRESENTACIÓN:
  codigoBarrasBlister?: string;   // Código de barras del blíster
  codigoBarrasUnidad?: string;    // Código de barras de la unidad / tira / sobre

  // 🔹 VENTA POR PESO / GRANEL DECIMAL:
  unidadMedida?: UnidadMedidaType;// 'UNIDAD' | 'KG' | 'LB' | 'GRAMO' | 'METRO' | 'LITRO'
  permiteDecimal?: boolean;       // Soporte para decimales (ej: 0.500 kg = 1 lb)
  pasoDecimal?: number;           // Incremento decimal (ej: 0.1, 0.25, 0.5)

  ivaPorcentaje?: number;
}

export interface Category {
  id: string;
  nombre: string;
  icono?: string;
  descripcion?: string;
  activo?: boolean;
}

export interface Banner {
  id: string;
  titulo: string;
  subtitulo?: string;
  imagenUrl: string;
  textoBoton?: string;
  enlace?: string;
  activo: boolean;
  colorFondo?: string;
}

export interface ServiceItem {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  precioTexto: string; // ej: "Consultar" o "$ 15.000"
  duracionMinutos: number;
  imagenUrl: string;
  activo: boolean;
  permiteUrgente?: boolean;
  capacidadSimultanea?: number; // Capacidad de atención simultánea / cupos por horario (1 a 10)
}

export interface ServiceBooking {
  id: string;
  servicioId: string;
  servicioNombre: string;
  clienteNombre: string;
  clienteTelefono: string;
  fecha: string;
  hora: string;
  esUrgente: boolean;
  notas?: string;
  estado: 'pendiente' | 'confirmada' | 'atendida' | 'cancelada';
  creadoEn: string;
}

export interface OrderItem {
  productoId: string;
  nombre: string;
  precio: number;
  cantidad: number;               // Soporta decimales para peso (ej: 0.5 kg) o enteros
  presentacion: string;           // 'CAJA' | 'BLISTER' | 'UNIDAD' | 'REGULAR' | 'KG' | 'LB'
  presentacionLabel?: string;     // ej: "Caja x24", "Blíster x6", "Pastilla individual"
  unidadesADescontar?: number;    // 🔹 Unidades base a descontar del stock (ej: 2 blísters * 6 = 12)
  imagenUrl?: string;
  subtotal?: number;
}

export interface Order {
  id: number;
  codigo: string; // ej: #41
  clienteNombre: string;
  clienteTelefono: string;
  clienteDireccion?: string;
  tipoEntrega: DeliveryType;
  items: OrderItem[];
  subtotal: number;
  costoEnvio: number;
  total: number;
  estado: OrderStatus;
  metodoPago: PaymentMethodType;
  pagoEstado: 'pendiente' | 'pagado';
  comprobanteUrl?: string;
  cambioConCuanto?: number;
  fechaHora: string;
  fechaISO?: string; // YYYY-MM-DD format
  rappiTracking?: {
    domiciliarioNombre?: string;
    domiciliarioTelefono?: string;
    placaMoto?: string;
    etapa: 'asignando' | 'hacia_tienda' | 'en_mostrador' | 'en_camino' | 'entregado';
    horaEstimada?: string;
  };
  notas?: string;
}

export interface Store {
  id: string;
  slug: string; // ej: sanjuan
  nombre: string;
  subdominio: string; // sanjuan.mitienda.store
  rubro: RubroType;
  rubroEtiqueta: string;
  whatsapp: string;
  slogan?: string;
  descripcionCorta: string;
  logoUrl: string;
  
  horarios: StoreSchedule;
  direccion: ColombianAddress;
  ubicacion: StoreLocation;
  
  plantilla: TemplateType;
  temaColor: string; // color primario hex
  temaModo: ThemeMode;
  
  visibilidadStock: {
    mostrarAgotados: boolean;
    mostrarCantidadesNumericas: boolean;
  };
  
  pagos: PaymentAccounts;
  categorias: Category[];
  banners: Banner[];
  servicios: ServiceItem[];
  categoriasServicios: string[];
  claveVendedor?: string;
}

export interface TenantStoreData {
  store: Store;
  products: Product[];
  orders: Order[];
  services: ServiceItem[];
  serviceBookings: ServiceBooking[];
  banners: Banner[];
  categories: Category[];
}

export type MultiTenantRegistry = Record<string, TenantStoreData>;

export interface UserAccount {
  id: string;
  email: string;
  passwordHash: string;
  vendedorPasswordHash?: string;
  nombre: string;
  storeSlug: string;
  role: 'superadmin' | 'merchant' | 'vendedor';
  creadoEn: string;
}
