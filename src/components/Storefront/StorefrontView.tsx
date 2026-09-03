import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Phone, 
  MapPin, 
  Clock, 
  Sparkles, 
  Bike, 
  ChevronRight, 
  ChevronLeft, 
  Tag, 
  Calendar, 
  ArrowLeft, 
  MessageCircle, 
  CheckCircle2, 
  Stethoscope, 
  Heart,
  Package,
  UploadCloud
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product, OrderItem, ServiceItem } from '../../types';
import { ProductCard } from './ProductCard';
import { CartDrawer } from './CartDrawer';
import { ServiceBookingModal } from './ServiceBookingModal';
import { OrderTrackingModal } from './OrderTrackingModal';
import { ProductDetailModal } from './ProductDetailModal';
import { formatCOP } from '../../utils/formatters';

export const StorefrontView: React.FC = () => {
  const { 
    store, 
    products, 
    categories, 
    services, 
    banners,
    orders, 
    lastCreatedOrderId, 
    setActiveView,
    setActiveAdminTab 
  } = useStore();

  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState<number | null>(lastCreatedOrderId || (orders[0]?.id ?? null));
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Banner Carousel State
  const activeBanners = banners.filter(b => b.activo);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [isCarouselHovered, setIsCarouselHovered] = useState(false);

  // Auto-rotation timer for banners (every 5 seconds)
  useEffect(() => {
    if (activeBanners.length <= 1 || isCarouselHovered) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex(prev => (prev + 1) % activeBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeBanners.length, isCarouselHovered]);

  const handlePrevBanner = () => {
    setCurrentBannerIndex(prev => (prev === 0 ? activeBanners.length - 1 : prev - 1));
  };

  const handleNextBanner = () => {
    setCurrentBannerIndex(prev => (prev + 1) % activeBanners.length);
  };

  // Cart operations with Fractionated Inventory support
  const handleAddToCart = (
    product: Product, 
    quantity: number = 1,
    options?: {
      presentacion?: string;
      presentacionLabel?: string;
      precioUnitario?: number;
      unidadesADescontar?: number;
    }
  ) => {
    const selectedPrice = options?.precioUnitario ?? product.precio;
    const selectedPres = options?.presentacion ?? product.presentacion ?? 'REGULAR';
    const selectedLabel = options?.presentacionLabel ?? product.presentacion ?? (product.unidadMedida ? `1 ${product.unidadMedida}` : 'Unidad');
    const unidadesBasePorUnidad = options?.unidadesADescontar ? (options.unidadesADescontar / quantity) : 1;
    const itemKey = `${product.id}-${selectedPres}`;

    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => (item as any).itemKey === itemKey || (item.productoId === product.id && item.presentacion === selectedPres));
      if (existingIndex >= 0) {
        return prev.map((item, idx) => {
          if (idx === existingIndex) {
            const newQty = item.cantidad + quantity;
            return {
              ...item,
              cantidad: newQty,
              subtotal: newQty * item.precio,
              unidadesADescontar: newQty * unidadesBasePorUnidad
            };
          }
          return item;
        });
      }

      return [
        ...prev,
        {
          productoId: product.id,
          nombre: product.nombre,
          precio: selectedPrice,
          cantidad: quantity,
          presentacion: selectedPres,
          presentacionLabel: selectedLabel,
          unidadesADescontar: quantity * unidadesBasePorUnidad,
          imagenUrl: product.imagenUrl,
          subtotal: quantity * selectedPrice,
          itemKey
        } as any
      ];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (itemKeyOrId: string, delta: number) => {
    setCartItems(prev => {
      return prev
        .map(item => {
          const match = (item as any).itemKey === itemKeyOrId || item.productoId === itemKeyOrId;
          if (match) {
            const newQty = item.cantidad + delta;
            if (newQty <= 0) return null;
            const singleBaseUnits = (item.unidadesADescontar && item.cantidad) ? (item.unidadesADescontar / item.cantidad) : 1;
            return { 
              ...item, 
              cantidad: newQty,
              subtotal: newQty * item.precio,
              unidadesADescontar: newQty * singleBaseUnits
            };
          }
          return item;
        })
        .filter(Boolean) as OrderItem[];
    });
  };

  const handleRemoveItem = (itemKeyOrId: string) => {
    setCartItems(prev => prev.filter(item => (item as any).itemKey !== itemKeyOrId && item.productoId !== itemKeyOrId));
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.cantidad, 0);
  const totalCartAmount = cartItems.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

  const activeTrackingOrder = orders.find(o => o.id === trackingOrderId) || orders[0] || null;

  const getTemplateTheme = () => {
    const accent = store.temaColor || '#059669';
    switch (store.plantilla) {
      case 'default':
        return {
          icon: '⭐',
          accentColor: accent || '#059669',
          heroImg: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&q=80',
        };
      case 'zen':
        return {
          icon: '🌿',
          accentColor: accent || '#c67139',
          heroImg: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=1200&q=80',
        };
      case 'gastro':
        return {
          icon: '🍔',
          accentColor: accent || '#ea580c',
          heroImg: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80',
        };
      case 'boutique':
        return {
          icon: '👗',
          accentColor: accent || '#4f46e5',
          heroImg: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80',
        };
      case 'veterinaria':
        return {
          icon: '🐾',
          accentColor: accent || '#0891b2',
          heroImg: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=1200&q=80',
        };
      case 'supermercado':
        return {
          icon: '🛒',
          accentColor: accent || '#16a34a',
          heroImg: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1200&q=80',
        };
      case 'farmacia':
        return {
          icon: '💊',
          accentColor: accent || '#059669',
          heroImg: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1200&q=80',
        };
      default:
        return {
          icon: '⭐',
          accentColor: accent || '#059669',
          heroImg: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&q=80',
        };
    }
  };

  const theme = getTemplateTheme();
  const isZenTemplate = store.plantilla === 'zen';
  const isFarmaciaTemplate = store.plantilla === 'farmacia';

  const activeCategories = categories.filter(c => c.activo !== false);

  // Filtered Products
  const getCategoryProducts = (catId: string) => {
    return products.filter(p => {
      if (!p.activo && !store.visibilidadStock.mostrarAgotados) return false;
      const parentCat = categories.find(c => c.id === p.categoriaId);
      if (parentCat && parentCat.activo === false) return false;

      const matchCat = catId === 'todos' || p.categoriaId === catId;
      const matchSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchCat && matchSearch;
    });
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans relative transition-colors ${
      isZenTemplate 
        ? 'bg-[#f5ead8] text-[#201e1d] dark:bg-[#181310] dark:text-[#f5ead8]' 
        : 'bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100'
    }`}>
      {/* Exclusively for Zen / Aromaterapia Template: Botanical Wallpaper Pattern */}
      {isZenTemplate && (
        <div 
          className="fixed inset-0 pointer-events-none z-0 opacity-35 dark:opacity-15 transition-opacity"
          style={{
            backgroundImage: `url('/wallpaper-zen.png')`,
            backgroundRepeat: 'repeat',
            backgroundSize: '360px auto',
            backgroundPosition: 'top left',
          }}
        />
      )}

      {/* Exclusively for Farmacia Template: Soft Pharmacy Interior Wallpaper */}
      {isFarmaciaTemplate && (
        <div 
          className="fixed inset-0 pointer-events-none z-0 opacity-15 dark:opacity-10 transition-opacity bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: `url('/wallpaper-farmacia.jpg')`,
          }}
        />
      )}

      {/* Top Admin Return Bar */}
      <div className="bg-slate-900 text-white px-4 py-2 text-xs flex items-center justify-between z-40 sticky top-0 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-slate-300">
            Vista Previa de Tienda Pública: <strong className="text-white">{store.subdominio}</strong>
          </span>
        </div>
        <div className="flex items-center gap-3">
          {lastCreatedOrderId && (
            <button
              onClick={() => {
                setTrackingOrderId(lastCreatedOrderId);
                setTrackingModalOpen(true);
              }}
              className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
            >
              <Bike className="w-3.5 h-3.5" />
              <span>Ver Rastreo de Mi Pedido (#{lastCreatedOrderId})</span>
            </button>
          )}

          <button
            onClick={() => setActiveView('admin')}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-lg text-white text-xs flex items-center gap-1.5 transition shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al Panel Admin</span>
          </button>
        </div>
      </div>

      {/* Sub-header bar */}
      <div 
        style={{ backgroundColor: isZenTemplate ? '#7a8a5e' : theme.accentColor }}
        className={`px-4 sm:px-6 py-2 text-[11px] font-bold flex flex-col sm:flex-row items-center justify-between gap-2 shadow-md transition-colors duration-300 relative z-30 ${
          isZenTemplate 
            ? 'text-[#f5ead8] dark:bg-[#281e18] dark:text-[#ebddc5] dark:border-b dark:border-[#3e2e25]' 
            : 'text-white'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
          <span>{store.horarios.abierto24Horas ? 'Abierto 24 Horas' : 'Abierto'} — Domicilios & Envíos Express</span>
        </div>
        <div className="flex items-center gap-1.5 opacity-90">
          <MapPin className="w-3.5 h-3.5" />
          <span>{store.direccion.direccionCompleta}</span>
        </div>
      </div>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={() => setCartItems([])}
        onOrderSuccess={(orderId) => {
          setTrackingOrderId(orderId);
          setTrackingModalOpen(true);
        }}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Service Booking Modal */}
      <ServiceBookingModal
        service={selectedService}
        isOpen={!!selectedService}
        onClose={() => setSelectedService(null)}
      />

      {/* Order Tracking Modal */}
      <OrderTrackingModal
        order={activeTrackingOrder}
        isOpen={trackingModalOpen}
        onClose={() => setTrackingModalOpen(false)}
      />

      {/* Main Header */}
      <header className={`backdrop-blur-md border-b shadow-sm sticky top-8 z-30 transition-colors ${
        isZenTemplate
          ? 'bg-[#f5ead8]/92 dark:bg-[#221a14]/92 border-[#ebddc5] dark:border-[#3a2c22]'
          : 'bg-white/95 dark:bg-slate-900/95 border-slate-200 dark:border-slate-800'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Logo & Store Identity */}
            <div className="flex items-center gap-3">
              {store.logoUrl ? (
                <div className={`h-12 w-12 sm:h-14 sm:w-14 rounded-2xl p-1.5 shadow-md border flex items-center justify-center flex-shrink-0 transition-transform hover:scale-105 ${
                  isZenTemplate 
                    ? 'bg-[#ebddc5]/80 dark:bg-[#2e231b] border-[#dfceb3] dark:border-[#47362a]'
                    : 'bg-white dark:bg-slate-800 border-slate-200/80 dark:border-slate-700/80'
                }`}>
                  <img 
                    src={store.logoUrl} 
                    alt={store.nombre} 
                    className="max-h-full max-w-full object-contain" 
                  />
                </div>
              ) : (
                <div 
                  style={{ backgroundColor: isZenTemplate ? '#c67139' : theme.accentColor }}
                  className="w-12 h-12 rounded-2xl text-white flex items-center justify-center font-black text-xl shadow-md flex-shrink-0 uppercase"
                >
                  {store.nombre ? store.nombre.charAt(0) : 'T'}
                </div>
              )}
              <div className="min-w-0">
                <h1 
                  style={isZenTemplate ? { fontFamily: "'Caprasimo', serif" } : undefined}
                  className={`text-sm sm:text-base font-black tracking-tight leading-none truncate ${
                    isZenTemplate ? 'font-caprasimo font-normal normal-case tracking-wide text-base sm:text-xl text-[#201e1d] dark:text-[#f5ead8]' : 'text-slate-900 dark:text-white'
                  }`}
                >
                  {store.nombre}
                </h1>
                <p 
                  style={{ 
                    color: isZenTemplate ? '#c67139' : theme.accentColor,
                    fontFamily: isZenTemplate ? "'Figtree', sans-serif" : undefined 
                  }}
                  className={`text-[10px] tracking-wider font-extrabold mt-0.5 truncate ${
                    isZenTemplate ? 'font-figtree font-semibold normal-case tracking-normal text-xs text-[#c67139] dark:text-[#e28a52]' : ''
                  }`}
                >
                  {store.slogan || store.descripcionCorta || 'Tienda Online Oficial'}
                </p>
              </div>
            </div>

            {/* Center Search Input */}
            <div className="relative flex-1 max-w-lg">
              <Search className={`w-4 h-4 absolute left-3.5 top-3 ${isZenTemplate ? 'text-[#8c7764] dark:text-[#a69280]' : 'text-slate-400'}`} />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-full text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none shadow-inner transition ${
                  isZenTemplate
                    ? 'bg-[#ebddc5]/70 dark:bg-[#2d221b]/90 border border-[#dfceb3] dark:border-[#48372b] text-[#201e1d] dark:text-[#f5ead8] placeholder:text-[#8c7764] dark:placeholder:text-[#a69280] focus:ring-2 focus:ring-[#c67139]'
                    : 'bg-slate-50/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500'
                }`}
                placeholder={`Buscar en ${store.nombre}...`}
              />
            </div>

            {/* Right Buttons: Servicios & Mi Pedido */}
            <div className="flex items-center gap-2.5">
              {services.length > 0 && (
                <button
                  onClick={() => setSelectedService(services[0])}
                  style={{ backgroundColor: isZenTemplate ? '#7a8a5e' : theme.accentColor }}
                  className="px-4 py-2 text-white font-black rounded-full text-xs flex items-center gap-1.5 shadow-md hover:brightness-110 transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Citas & Servicios ({services.length})</span>
                </button>
              )}

              <button
                onClick={() => setIsCartOpen(true)}
                style={{ backgroundColor: isZenTemplate ? '#c67139' : theme.accentColor }}
                className="px-4 py-2 text-white font-black rounded-full text-xs flex items-center gap-1.5 shadow-md hover:brightness-110 transition"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Mi Pedido ({totalCartCount})</span>
              </button>
            </div>
          </div>

          {/* Dynamic Category Navigation Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pt-3 pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('todos')}
              style={selectedCategory === 'todos' ? { backgroundColor: isZenTemplate ? '#c67139' : theme.accentColor, color: '#ffffff' } : {}}
              className={`px-4 py-1.5 rounded-full text-xs font-black whitespace-nowrap transition flex items-center gap-1.5 ${
                selectedCategory === 'todos'
                  ? 'shadow-md text-white'
                  : isZenTemplate
                    ? 'bg-[#ebddc5] dark:bg-[#2d221b] text-[#201e1d] dark:text-[#ebddc5] hover:bg-[#decbb0] dark:hover:bg-[#3d2f25] border border-[#d8c5a6]/60 dark:border-[#45352a]'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <span>⭐</span>
              <span>Todos los Productos ({getCategoryProducts('todos').length})</span>
            </button>

            {activeCategories.map(cat => {
              const catCount = getCategoryProducts(cat.id).length;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={isSelected ? { backgroundColor: isZenTemplate ? '#c67139' : theme.accentColor, color: '#ffffff' } : {}}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-black whitespace-nowrap transition flex items-center gap-1.5 uppercase ${
                    isSelected
                      ? 'shadow-md text-white'
                      : isZenTemplate
                        ? 'bg-[#ebddc5] dark:bg-[#2d221b] text-[#201e1d] dark:text-[#ebddc5] hover:bg-[#decbb0] dark:hover:bg-[#3d2f25] border border-[#d8c5a6]/60 dark:border-[#45352a]'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <span>📁</span>
                  <span>{cat.nombre} {catCount > 0 && `(${catCount})`}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 flex-1 relative z-10">
        {/* Dynamic Interactive Banner Carousel / Hero */}
        {activeBanners.length > 0 ? (
          <div 
            onMouseEnter={() => setIsCarouselHovered(true)}
            onMouseLeave={() => setIsCarouselHovered(false)}
            className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 dark:border-slate-800 min-h-[220px] sm:min-h-[280px] flex items-center text-white bg-slate-950 group"
          >
            {/* Background Slide */}
            <img 
              key={activeBanners[currentBannerIndex]?.id}
              src={activeBanners[currentBannerIndex]?.imagenUrl} 
              alt={activeBanners[currentBannerIndex]?.titulo} 
              className="absolute inset-0 w-full h-full object-cover opacity-55 transition-all duration-700" 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent"></div>
            
            {/* Slide Content */}
            <div className="relative z-10 max-w-2xl p-6 sm:p-10 space-y-3">
              <span 
                style={{ backgroundColor: theme.accentColor }}
                className="px-3.5 py-1 rounded-full text-white text-[10px] sm:text-xs font-black tracking-wider uppercase inline-flex items-center gap-1.5 shadow-lg"
              >
                <span>{store.slogan || 'OFERTA DESTACADA'}</span>
              </span>
              <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                {activeBanners[currentBannerIndex]?.titulo}
              </h2>
              {activeBanners[currentBannerIndex]?.subtitulo && (
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium line-clamp-2 sm:line-clamp-none">
                  {activeBanners[currentBannerIndex]?.subtitulo}
                </p>
              )}

              <div className="pt-2">
                <a 
                  href={activeBanners[currentBannerIndex]?.enlace || '#catalogo'}
                  style={{ backgroundColor: theme.accentColor }}
                  className="px-5 py-2.5 text-white font-black text-xs rounded-xl shadow-lg inline-flex items-center gap-2 hover:brightness-110 transition active:scale-95"
                >
                  <span>{activeBanners[currentBannerIndex]?.textoBoton || 'Ver Productos'}</span>
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Navigation Arrows */}
            {activeBanners.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevBanner}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white backdrop-blur-md flex items-center justify-center transition opacity-80 hover:opacity-100 shadow-md border border-white/20 z-20"
                  title="Banner anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={handleNextBanner}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white backdrop-blur-md flex items-center justify-center transition opacity-80 hover:opacity-100 shadow-md border border-white/20 z-20"
                  title="Siguiente banner"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Bottom Pagination Dots */}
                <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                  {activeBanners.map((b, idx) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setCurrentBannerIndex(idx)}
                      style={idx === currentBannerIndex ? { backgroundColor: theme.accentColor, width: '24px' } : {}}
                      className={`h-2.5 rounded-full transition-all duration-300 ${
                        idx === currentBannerIndex 
                          ? 'shadow-lg' 
                          : 'w-2.5 bg-white/40 hover:bg-white/70'
                      }`}
                      title={`Ir al banner ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          /* Default Storefront Hero (Editable via Slogan & Description in Admin) */
          <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 dark:border-slate-800 min-h-[200px] sm:min-h-[250px] flex items-center p-6 sm:p-10 text-white bg-slate-950">
            <img 
              src={theme.heroImg} 
              alt={store.nombre} 
              className="absolute inset-0 w-full h-full object-cover opacity-40 transform scale-105 transition duration-700" 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent"></div>
            
            <div className="relative z-10 max-w-2xl space-y-3">
              <span 
                style={{ 
                  backgroundColor: theme.accentColor,
                  fontFamily: isZenTemplate ? "'Figtree', sans-serif" : undefined 
                }}
                className={`px-3.5 py-1 rounded-full text-white text-[10px] sm:text-xs font-black tracking-wider uppercase inline-flex items-center gap-1.5 shadow-lg ${
                  isZenTemplate ? 'font-figtree font-bold tracking-normal normal-case' : ''
                }`}
              >
                <span>{store.slogan || 'BIENVENIDOS'}</span>
              </span>
              <h2 
                style={isZenTemplate ? { fontFamily: "'Caprasimo', serif" } : undefined}
                className={`text-xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight ${
                  isZenTemplate ? 'font-caprasimo font-normal tracking-wide normal-case' : ''
                }`}
              >
                {store.nombre}
              </h2>
              <p 
                style={isZenTemplate ? { fontFamily: "'Figtree', sans-serif" } : undefined}
                className={`text-xs sm:text-sm text-slate-200 leading-relaxed font-medium line-clamp-2 sm:line-clamp-none ${
                  isZenTemplate ? 'font-figtree text-stone-200' : ''
                }`}
              >
                {store.descripcionCorta || 'Realiza tus pedidos en línea con entregas a domicilio y atención personalizada.'}
              </p>

              {/* Universal Benefits Badges */}
              <div className="pt-2 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-sm">
                  <span>⚡</span>
                  <span>Envíos a Domicilio</span>
                </span>
                <span className="px-3 py-1 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-sm">
                  <span>🛡️</span>
                  <span>Compra 100% Segura</span>
                </span>
                <span className="px-3 py-1 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-sm">
                  <span>💬</span>
                  <span>Atención por WhatsApp</span>
                </span>
                <span className="px-3 py-1 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-sm">
                  <span>💳</span>
                  <span>Múltiples Formas de Pago</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Services Section if configured */}
        {services.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Atención Inmediata & Citas
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Servicios Disponibles
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {services.map((srv) => (
                <div
                  key={srv.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-extrabold text-[10px]">
                      {srv.categoria}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {srv.nombre}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {srv.descripcion}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                      {srv.precioTexto}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedService(srv)}
                      className="px-3.5 py-1.5 bg-blue-950 hover:bg-blue-900 text-white font-bold rounded-xl text-xs transition"
                    >
                      Agendar Cita
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty Catalog State or Rendered Catalog */}
        {products.length === 0 ? (
          <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 max-w-xl mx-auto p-8">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-inner">
              <Package className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Tienda lista para recibir tu catálogo
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Aún no has cargado productos. Puedes ingresar al Panel de Administración e importar tu archivo Excel o CSV para que aparezcan aquí con sus categorías al instante.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setActiveAdminTab('importar-excel');
                  setActiveView('admin');
                }}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-lg shadow-emerald-600/25 flex items-center gap-2 mx-auto transition"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Ir al Lector de Inventario Excel</span>
              </button>
            </div>
          </div>
        ) : (
          /* Rendered Catalog by Category or Filter */
          <section className="space-y-8">
            {selectedCategory === 'todos' ? (
              activeCategories.length > 0 ? (
                activeCategories.map(cat => {
                  const catProds = getCategoryProducts(cat.id);
                  if (catProds.length === 0) return null;
                  return (
                    <section key={cat.id} className="space-y-4">
                      <div className={`flex items-center justify-between pb-2 border-b-2 ${isZenTemplate ? 'border-[#c67139]' : 'border-slate-900 dark:border-slate-100'}`}>
                        <div className="flex items-center gap-2">
                          <h3 className={`text-base font-black uppercase tracking-tight ${isZenTemplate ? 'text-[#201e1d] dark:text-[#f5ead8] font-figtree' : 'text-slate-950 dark:text-white'}`}>
                            {cat.nombre}
                          </h3>
                          <span className={`text-xs font-semibold ${isZenTemplate ? 'text-[#7a8a5e] dark:text-[#adc08f]' : 'text-slate-400'}`}>{catProds.length} productos</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {catProds.map(prod => (
                          <ProductCard
                            key={prod.id}
                            product={prod}
                            onAddToCart={handleAddToCart}
                            onQuickView={setQuickViewProduct}
                          />
                        ))}
                      </div>
                    </section>
                  );
                })
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {getCategoryProducts('todos').map(prod => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      onAddToCart={handleAddToCart}
                      onQuickView={setQuickViewProduct}
                    />
                  ))}
                </div>
              )
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {getCategoryProducts(selectedCategory).map(prod => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    onAddToCart={handleAddToCart}
                    onQuickView={setQuickViewProduct}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className={`border-t py-6 text-xs mt-12 transition-colors ${
        isZenTemplate 
          ? 'bg-[#ebddc5]/80 dark:bg-[#1f1712] border-[#dfceb3] dark:border-[#382a20] text-[#5c4a3e] dark:text-[#bda896]' 
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className={`font-black ${isZenTemplate ? 'text-[#201e1d] dark:text-[#f5ead8]' : 'text-slate-950 dark:text-white'}`}>{store.nombre}</span>
            <span> · {store.direccion.direccionCompleta} · Despachos y Domicilios</span>
          </div>
          <div>
            <span>Tienda online generada con <strong>TiendasPro</strong></span>
          </div>
        </div>
      </footer>
    </div>
  );
};
