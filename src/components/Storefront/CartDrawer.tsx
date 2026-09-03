import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  Bike, 
  Store as StoreIcon, 
  MapPin, 
  Phone, 
  User, 
  CreditCard, 
  DollarSign, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  MessageSquare,
  AlertCircle,
  Navigation,
  Check,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '../../context/StoreContext';
import { OrderItem, PaymentMethodType, DeliveryType } from '../../types';
import { formatCOP, buildStandardColombianAddress } from '../../utils/formatters';
import { InteractiveMap } from '../Common/InteractiveMap';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: OrderItem[];
  onUpdateQuantity: (productoId: string, delta: number) => void;
  onRemoveItem: (productoId: string) => void;
  onClearCart: () => void;
  onOrderSuccess: (orderId: number) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderSuccess,
}) => {
  const { store, createOrder } = useStore();

  const [deliveryMode, setDeliveryMode] = useState<'rappi' | 'estandar' | 'recoger'>('rappi');
  const [nombre, setNombre] = useState('Carlos Ramírez');
  const [telefono, setTelefono] = useState('3152203399');
  
  // Colombian Address state
  const [viaTipo, setViaTipo] = useState('Calle');
  const [viaNumero, setViaNumero] = useState('15');
  const [viaLetra, setViaLetra] = useState('-');
  const [cruceTipo, setCruceTipo] = useState('Calle');
  const [cruceNumero, setCruceNumero] = useState('11');
  const [cruceLetra, setCruceLetra] = useState('-');
  const [placa, setPlaca] = useState('20');
  const [barrioRef, setBarrioRef] = useState('Barrio San Fernando, Apto 302, Torre B');
  const [instrucciones, setInstrucciones] = useState('Casa de rejas blancas, timbre 201...');
  
  // Available payment methods configured in Admin > Métodos de Pago
  const allPaymentMethods = [
    { id: 'whatsapp' as PaymentMethodType, label: 'WhatsApp', icon: '📲', activo: store.pagos?.whatsapp?.activo ?? true },
    { id: 'nequi' as PaymentMethodType, label: 'Nequi', icon: '🟣', activo: store.pagos?.nequi?.activo ?? true },
    { id: 'daviplata' as PaymentMethodType, label: 'Daviplata', icon: '🔴', activo: store.pagos?.daviplata?.activo ?? true },
    { id: 'bancolombia' as PaymentMethodType, label: 'Bancolombia', icon: '🟡', activo: store.pagos?.bancolombia?.activo ?? true },
    { id: 'efectivo' as PaymentMethodType, label: 'Efectivo', icon: '💵', activo: store.pagos?.efectivo?.activo ?? true },
    { id: 'redeban' as PaymentMethodType, label: 'Redeban / Datáfono', icon: '💳', activo: store.pagos?.redeban?.activo ?? false },
    { id: 'wompi' as PaymentMethodType, label: 'Wompi / Tarjeta', icon: '⚡', activo: store.pagos?.wompi?.activo ?? false },
  ];

  const availablePaymentMethods = allPaymentMethods.filter(pm => pm.activo);

  // Map coordinates
  const [coords, setCoords] = useState({ lat: 3.4350, lng: -76.5350 });
  const [showPaymentStep, setShowPaymentStep] = useState(false);
  const [metodoPago, setMetodoPago] = useState<PaymentMethodType>(availablePaymentMethods[0]?.id || 'efectivo');
  const [cambioConCuanto, setCambioConCuanto] = useState('50000');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (availablePaymentMethods.length > 0 && !availablePaymentMethods.some(pm => pm.id === metodoPago)) {
      setMetodoPago(availablePaymentMethods[0].id);
    }
  }, [store.pagos]);

  if (!isOpen) return null;

  const standardizedAddr = buildStandardColombianAddress({
    viaTipo,
    viaNumero,
    viaLetraBis: viaLetra,
    cruceTipo,
    cruceNumero,
    cruceLetraBis: cruceLetra,
    placa,
    barrio: barrioRef,
  });

  const subtotal = cartItems.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  const costoEnvio = deliveryMode === 'rappi' ? 6100 : deliveryMode === 'estandar' ? 3500 : 0;
  const total = subtotal + costoEnvio;

  const handleUseGPS = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
  };

  const handleFinalOrder = () => {
    setIsSubmitting(true);

    setTimeout(() => {
      const newOrder = createOrder({
        clienteNombre: nombre,
        clienteTelefono: telefono,
        clienteDireccion: deliveryMode !== 'recoger' ? standardizedAddr : undefined,
        tipoEntrega: deliveryMode === 'recoger' ? 'recoger' : 'domicilio',
        items: cartItems,
        subtotal,
        costoEnvio,
        total,
        estado: 'nuevo',
        metodoPago,
        pagoEstado: metodoPago === 'wompi' ? 'pagado' : 'pendiente',
        cambioConCuanto: metodoPago === 'efectivo' ? Number(cambioConCuanto) : undefined,
        rappiTracking: deliveryMode === 'rappi' ? {
          etapa: 'asignando',
          domiciliarioNombre: 'Rappi Cargo Express',
          horaEstimada: '20-35 min',
        } : undefined,
        notas: instrucciones,
      });

      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.5 }
      });

      // Format WhatsApp order message
      let msg = `*NUEVO PEDIDO - ${store.nombre}*\n`;
      msg += `*Orden:* ${newOrder.codigo}\n\n`;
      msg += `👤 *Cliente:* ${nombre}\n`;
      msg += `📱 *WhatsApp:* ${telefono}\n`;
      msg += `🚚 *Modalidad:* ${deliveryMode === 'rappi' ? 'Envío Flash (Rappi Cargo 20-35 min)' : deliveryMode === 'estandar' ? 'Domicilio Estándar' : 'Recoger en Tienda'}\n`;
      if (deliveryMode !== 'recoger') {
        msg += `📍 *Dirección:* ${standardizedAddr}\n`;
        msg += `🗺️ *Ruta GPS Domiciliario:* https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(standardizedAddr + ', ' + store.ubicacion.ciudad + ', Colombia')}\n`;
      }
      if (instrucciones) {
        msg += `📝 *Instrucciones:* ${instrucciones}\n`;
      }
      msg += `💳 *Pago:* ${metodoPago.toUpperCase()}\n\n`;
      msg += `*PRODUCTOS:*\n`;
      cartItems.forEach(i => {
        msg += `• ${i.cantidad}x ${i.nombre} (${i.presentacion}) = ${formatCOP(i.precio * i.cantidad)}\n`;
      });
      msg += `\n*Subtotal:* ${formatCOP(subtotal)}\n`;
      msg += `*Envío:* ${formatCOP(costoEnvio)}\n`;
      msg += `*TOTAL:* ${formatCOP(total)}\n`;

      if (metodoPago === 'efectivo') {
        msg += `💵 *Paga con:* $ ${cambioConCuanto} (Llevar cambio exacto)\n`;
      }

      setIsSubmitting(false);
      onClearCart();
      onClose();
      onOrderSuccess(newOrder.id);

      const whatsappUrl = `https://wa.me/57${store.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
      window.open(whatsappUrl, '_blank');
    }, 600);
  };

  const isZenTemplate = store.plantilla === 'zen';
  const isFarmaciaTemplate = store.plantilla === 'farmacia';
  const isGastroTemplate = store.plantilla === 'gastro';
  const isBoutiqueTemplate = store.plantilla === 'boutique';

  const accent = isZenTemplate 
    ? '#c67139' 
    : isFarmaciaTemplate 
    ? '#059669' 
    : isGastroTemplate 
    ? '#ea580c' 
    : isBoutiqueTemplate 
    ? '#4f46e5' 
    : (store.temaColor || '#059669');

  const getHeaderGradient = () => {
    if (isZenTemplate) return 'from-[#7a8a5e] to-[#c67139]';
    if (isFarmaciaTemplate) return 'from-emerald-800 to-teal-900';
    if (isGastroTemplate) return 'from-orange-700 to-amber-800';
    if (isBoutiqueTemplate) return 'from-indigo-800 to-purple-900';
    return 'from-slate-900 to-slate-800';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn font-sans">
      <div onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className={`w-screen max-w-lg shadow-2xl border-l flex flex-col justify-between overflow-y-auto transition-colors ${
          isZenTemplate
            ? 'bg-[#f5ead8] dark:bg-[#181310] border-[#ebddc5] dark:border-[#382b22] text-[#201e1d] dark:text-[#f5ead8]'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100'
        }`}>
          {/* Header */}
          <div className={`p-4 sm:p-5 bg-gradient-to-r ${getHeaderGradient()} text-white flex items-center justify-between sticky top-0 z-20 shadow-md`}>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center font-bold">
                🛒
              </div>
              <div>
                <h3 
                  style={isZenTemplate ? { fontFamily: "'Caprasimo', serif" } : undefined}
                  className="text-sm sm:text-base font-black tracking-tight"
                >
                  Tu Pedido · {store.nombre}
                </h3>
                <p className="text-[11px] opacity-90">{cartItems.length} productos en lista</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-6 space-y-5 flex-1">
            {cartItems.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                  <StoreIcon className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No hay productos en el carrito</h4>
              </div>
            ) : showPaymentStep ? (
              /* Step 2: Payment Selector */
              <div className="space-y-5 animate-fadeIn">
                <div className={`flex items-center justify-between pb-2 border-b ${isZenTemplate ? 'border-[#ebddc5] dark:border-[#382b22]' : 'border-slate-100 dark:border-slate-800'}`}>
                  <h4 className={`text-sm font-black flex items-center gap-2 ${isZenTemplate ? 'text-[#201e1d] dark:text-[#f5ead8]' : 'text-slate-900 dark:text-white'}`}>
                    <CreditCard style={{ color: accent }} className="w-4 h-4" />
                    <span>Selecciona tu Método de Pago</span>
                  </h4>
                  <button
                    onClick={() => setShowPaymentStep(false)}
                    style={{ color: accent }}
                    className="text-xs font-bold hover:underline"
                  >
                    ← Volver a Dirección
                  </button>
                </div>

                {/* Methods (Only those enabled by the merchant in Admin) */}
                {availablePaymentMethods.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 space-y-1">
                    <p className="font-bold">⚠️ Acuerda tu medio de pago por WhatsApp</p>
                    <p className="text-[11px] text-amber-700 dark:text-amber-300">
                      Al presionar confirmar pedido, podrás coordinar la forma de pago directamente con el comercio.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {availablePaymentMethods.map((pm) => (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setMetodoPago(pm.id)}
                        className={`p-3 rounded-xl border text-left font-bold flex items-center gap-2 transition ${
                          metodoPago === pm.id
                            ? isZenTemplate
                              ? 'border-[#c67139] bg-[#c67139]/15 text-[#c67139] dark:text-[#e28a52] ring-2 ring-[#c67139]/30 shadow-sm'
                              : 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 ring-2 ring-blue-500/20 shadow-sm'
                            : isZenTemplate
                              ? 'border-[#ebddc5] dark:border-[#382b22] bg-[#fcf8f2] dark:bg-[#251e18] text-[#4a392c] dark:text-[#d4c1ad] hover:border-[#c67139]/50'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-base">{pm.icon}</span>
                        <span className="truncate">{pm.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Account Details Box */}
                {metodoPago === 'nequi' && store.pagos?.nequi && (
                  <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 text-xs space-y-2">
                    {store.pagos.nequi.tipoIntegracion === 'api' ? (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-purple-950 dark:text-purple-200 flex items-center gap-1.5">
                            <span>⚡ Pago Automático con API Nequi</span>
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-200 uppercase">
                            {store.pagos.nequi.entorno === 'produccion' ? 'En Vivo' : 'Sandbox'}
                          </span>
                        </div>
                        <p className="text-purple-800 dark:text-purple-300 text-[11px] leading-relaxed">
                          Al confirmar tu pedido, {store.pagos.nequi.tipoCobro === 'qr_dinamico' 
                            ? 'se generará tu código QR dinámico de Nequi con el monto exacto para pagar.'
                            : 'recibirás una notificación Push en tu celular para aprobar el pago directamente en tu App Nequi.'}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-bold text-purple-900 dark:text-purple-200">
                          Transferir a Nequi: <strong>{store.pagos.nequi.celular}</strong>
                        </p>
                        <p className="text-purple-700 dark:text-purple-300">
                          Titular: {store.pagos.nequi.titular}
                        </p>
                        {store.pagos.nequi.qrUrl && (
                          <div className="pt-2 flex items-center gap-3">
                            <img src={store.pagos.nequi.qrUrl} alt="QR Nequi" className="w-20 h-20 rounded-xl border border-purple-200 dark:border-purple-700 object-contain bg-white p-1" />
                            <span className="text-[10px] text-purple-600 dark:text-purple-300">Escanea el código QR desde tu App Nequi</span>
                          </div>
                        )}
                        <p className="text-[10px] text-slate-400 pt-1">
                          Podrás enviar el comprobante directamente por WhatsApp tras confirmar.
                        </p>
                      </>
                    )}
                  </div>
                )}

                {metodoPago === 'daviplata' && store.pagos?.daviplata && (
                  <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-xs space-y-1">
                    <p className="font-bold text-rose-900 dark:text-rose-200">
                      Transferir a Daviplata: <strong>{store.pagos.daviplata.celular}</strong>
                    </p>
                    <p className="text-rose-700 dark:text-rose-300">
                      Titular: {store.pagos.daviplata.titular}
                    </p>
                    <p className="text-[10px] text-slate-400 pt-1">
                      Podrás enviar el comprobante directamente por WhatsApp tras confirmar.
                    </p>
                  </div>
                )}

                {metodoPago === 'bancolombia' && store.pagos?.bancolombia && (
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs space-y-1">
                    <p className="font-bold text-amber-900 dark:text-amber-200">
                      Transferir a Bancolombia ({store.pagos.bancolombia.tipoCuenta}): <strong>{store.pagos.bancolombia.numeroCuenta}</strong>
                    </p>
                    <p className="text-amber-700 dark:text-amber-300">
                      Titular: {store.pagos.bancolombia.titular}
                    </p>
                    <p className="text-[10px] text-slate-400 pt-1">
                      Podrás enviar el comprobante o soporte por WhatsApp tras confirmar.
                    </p>
                  </div>
                )}

                {metodoPago === 'efectivo' && (
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs space-y-2">
                    <label className="block font-bold text-slate-900 dark:text-white">
                      ¿Con cuánto vas a pagar en efectivo?
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-500">$</span>
                      <input
                        type="number"
                        value={cambioConCuanto}
                        onChange={e => setCambioConCuanto(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                        placeholder="50000"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500">
                      El domiciliario llevará el cambio exacto.
                    </span>
                  </div>
                )}

                {metodoPago === 'redeban' && (
                  <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs space-y-1">
                    <p className="font-bold text-blue-900 dark:text-blue-200">
                      💳 Datáfono Contra Entrega / Redeban
                    </p>
                    <p className="text-blue-700 dark:text-blue-300">
                      El domiciliario llevará el datáfono físico para tarjetas Débito, Crédito o Contactless.
                    </p>
                  </div>
                )}

                {metodoPago === 'wompi' && (
                  <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 text-xs space-y-1">
                    <p className="font-bold text-indigo-900 dark:text-indigo-200">
                      ⚡ Pago en Línea Wompi (Bancolombia / Tarjeta / PSE)
                    </p>
                    <p className="text-indigo-700 dark:text-indigo-300">
                      Pago seguro con acreditación instantánea.
                    </p>
                  </div>
                )}

                {metodoPago === 'whatsapp' && (
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
                    <p className="font-bold text-emerald-900 dark:text-emerald-200">
                      📲 Acordar Pago por WhatsApp
                    </p>
                    <p className="text-emerald-700 dark:text-emerald-300">
                      Tu pedido se enviará al chat de WhatsApp del negocio para coordinar tu pago.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Step 1: Items & Delivery Details */
              <>
                {/* Items List */}
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div
                      key={item.productoId}
                      className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs ${
                        isZenTemplate
                          ? 'bg-[#fcf8f2] dark:bg-[#251e18] border border-[#ebddc5] dark:border-[#382b22]'
                          : 'bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl overflow-hidden border flex items-center justify-center flex-shrink-0 ${
                        isZenTemplate ? 'bg-[#f5ead8]/60 dark:bg-[#1c1510] border-[#decca8] dark:border-[#382b22]' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                      }`}>
                        <img src={item.imagenUrl} alt={item.nombre} className="max-h-full max-w-full object-contain p-1" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className={`font-black uppercase truncate ${isZenTemplate ? 'text-[#201e1d] dark:text-[#f5ead8] font-figtree' : 'text-slate-900 dark:text-white'}`}>
                          {item.nombre}
                        </h4>
                        <p className={`text-[11px] ${isZenTemplate ? 'text-[#6e5a4c] dark:text-[#baa896]' : 'text-slate-400'}`}>
                          Presentación: {item.presentacion} · {formatCOP(item.precio)}
                        </p>

                        <div className={`flex items-center gap-1 mt-1.5 rounded-lg p-0.5 border w-fit ${
                          isZenTemplate 
                            ? 'bg-[#ebddc5]/50 dark:bg-[#1d1612] border-[#decca8] dark:border-[#382b22] text-[#201e1d] dark:text-[#f5ead8]' 
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                        }`}>
                          <button
                            onClick={() => onUpdateQuantity(item.productoId, -1)}
                            className="p-1 hover:opacity-75"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 font-bold">{item.cantidad}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.productoId, 1)}
                            className="p-1 hover:opacity-75"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`font-black text-sm ${isZenTemplate ? 'text-[#c67139] dark:text-[#e28a52]' : 'text-slate-900 dark:text-white'}`}>
                          {formatCOP(item.precio * item.cantidad)}
                        </span>
                        <button
                          onClick={() => onRemoveItem(item.productoId)}
                          className="block text-slate-400 hover:text-rose-600 mt-1 ml-auto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 3 Delivery Selection Tabs */}
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryMode('rappi')}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs flex flex-col items-center gap-1 transition ${
                        deliveryMode === 'rappi'
                          ? 'border-red-500 bg-red-500 text-white shadow-md shadow-red-500/25'
                          : isZenTemplate
                            ? 'border-[#ebddc5] dark:border-[#382b22] text-[#4a392c] dark:text-[#d4c1ad] bg-[#fcf8f2] dark:bg-[#251e18]'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span className="text-sm">🔴</span>
                      <span>Envío Flash</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryMode('estandar')}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs flex flex-col items-center gap-1 transition ${
                        deliveryMode === 'estandar'
                          ? isZenTemplate
                            ? 'border-[#c67139] bg-[#c67139] text-white shadow-md shadow-[#c67139]/25'
                            : 'border-emerald-600 bg-emerald-600 text-white shadow-md'
                          : isZenTemplate
                            ? 'border-[#ebddc5] dark:border-[#382b22] text-[#4a392c] dark:text-[#d4c1ad] bg-[#fcf8f2] dark:bg-[#251e18]'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Bike className="w-4 h-4" />
                      <span>Estándar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryMode('recoger')}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs flex flex-col items-center gap-1 transition ${
                        deliveryMode === 'recoger'
                          ? isZenTemplate
                            ? 'border-[#7a8a5e] bg-[#7a8a5e] text-white shadow-md shadow-[#7a8a5e]/25'
                            : 'border-purple-600 bg-purple-600 text-white shadow-md'
                          : isZenTemplate
                            ? 'border-[#ebddc5] dark:border-[#382b22] text-[#4a392c] dark:text-[#d4c1ad] bg-[#fcf8f2] dark:bg-[#251e18]'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <StoreIcon className="w-4 h-4" />
                      <span>Recoger</span>
                    </button>
                  </div>

                  {/* Rappi banner callout */}
                  {deliveryMode === 'rappi' && (
                    <div className="p-3 rounded-xl bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-[11px] space-y-0.5">
                      <div className="font-extrabold text-red-700 dark:text-red-300 flex items-center justify-between">
                        <span>Rappi Cargo — Última Milla Express</span>
                        <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-black">25min</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400">
                        Repartidores oficiales Rappi · Despachos express en 20-35 min
                      </p>
                    </div>
                  )}
                </div>

                {/* Customer Name */}
                <div className="space-y-1 text-xs">
                  <label className={`block font-bold ${isZenTemplate ? 'text-[#201e1d] dark:text-[#f5ead8]' : 'text-slate-700 dark:text-slate-300'}`}>
                    Tu Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-xl font-medium focus:outline-none ${
                      isZenTemplate
                        ? 'bg-white dark:bg-[#251e18] border-[#decca8] dark:border-[#3e2f26] text-[#201e1d] dark:text-[#f5ead8] focus:ring-2 focus:ring-[#c67139]'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
                    }`}
                    placeholder="Ej: Carlos Ramírez"
                    required
                  />
                </div>

                {/* Colombian Address Wizard */}
                {deliveryMode !== 'recoger' && (
                  <div className={`p-4 rounded-2xl border space-y-3 text-xs ${
                    isZenTemplate
                      ? 'bg-[#fcf8f2] dark:bg-[#251e18] border-[#ebddc5] dark:border-[#382b22]'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`font-bold flex items-center gap-1.5 ${isZenTemplate ? 'text-[#201e1d] dark:text-[#f5ead8]' : 'text-slate-900 dark:text-white'}`}>
                        <span className="text-rose-500">📍</span>
                        <span>Dirección de Entrega (Nomenclatura)</span>
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        isZenTemplate ? 'bg-[#7a8a5e]/20 text-[#7a8a5e] dark:text-[#adc08f]' : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                      }`}>
                        Guiado
                      </span>
                    </div>

                    {/* Row 1: Via */}
                    <div className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-4">
                        <label className="text-[10px] text-slate-500 font-bold block mb-1">Vía</label>
                        <select
                          value={viaTipo}
                          onChange={e => setViaTipo(e.target.value)}
                          className={`w-full px-2 py-1.5 border rounded-lg text-xs font-semibold ${
                            isZenTemplate ? 'bg-white dark:bg-[#1c1510] border-[#decca8] dark:border-[#382b22] text-[#201e1d] dark:text-[#f5ead8]' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <option value="Calle">Calle</option>
                          <option value="Carrera">Carrera</option>
                          <option value="Avenida">Avenida</option>
                          <option value="Diagonal">Diagonal</option>
                          <option value="Transversal">Transversal</option>
                        </select>
                      </div>

                      <div className="col-span-3">
                        <label className="text-[10px] text-slate-500 font-bold block mb-1">N°</label>
                        <input
                          type="text"
                          value={viaNumero}
                          onChange={e => setViaNumero(e.target.value)}
                          className={`w-full px-2 py-1.5 border rounded-lg text-xs text-center font-bold ${
                            isZenTemplate ? 'bg-white dark:bg-[#1c1510] border-[#decca8] dark:border-[#382b22] text-[#201e1d] dark:text-[#f5ead8]' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                          }`}
                          placeholder="15"
                        />
                      </div>

                      <div className="col-span-4">
                        <label className="text-[10px] text-slate-500 font-bold block mb-1">Letra</label>
                        <select
                          value={viaLetra}
                          onChange={e => setViaLetra(e.target.value)}
                          className={`w-full px-2 py-1.5 border rounded-lg text-xs text-center font-semibold ${
                            isZenTemplate ? 'bg-white dark:bg-[#1c1510] border-[#decca8] dark:border-[#382b22] text-[#201e1d] dark:text-[#f5ead8]' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <option value="-">-</option>
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="Bis">Bis</option>
                        </select>
                      </div>

                      <div className="col-span-1 text-center font-bold text-slate-400">#</div>
                    </div>

                    {/* Row 2: Cruce & Placa */}
                    <div className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-4">
                        <label className="text-[10px] text-slate-500 font-bold block mb-1">Tipo Cruce:</label>
                        <select
                          value={cruceTipo}
                          onChange={e => setCruceTipo(e.target.value)}
                          className={`w-full px-2 py-1.5 border rounded-lg text-xs font-semibold ${
                            isZenTemplate ? 'bg-white dark:bg-[#1c1510] border-[#decca8] dark:border-[#382b22] text-[#201e1d] dark:text-[#f5ead8]' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <option value="Calle">Calle</option>
                          <option value="Carrera">Carrera</option>
                        </select>
                      </div>

                      <div className="col-span-3">
                        <label className="text-[10px] text-slate-500 font-bold block mb-1">Cruce #:</label>
                        <input
                          type="text"
                          value={cruceNumero}
                          onChange={e => setCruceNumero(e.target.value)}
                          className={`w-full px-2 py-1.5 border rounded-lg text-xs text-center font-bold ${
                            isZenTemplate ? 'bg-white dark:bg-[#1c1510] border-[#decca8] dark:border-[#382b22] text-[#201e1d] dark:text-[#f5ead8]' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                          }`}
                          placeholder="11"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="text-[10px] text-slate-500 font-bold block mb-1">Letra:</label>
                        <select
                          value={cruceLetra}
                          onChange={e => setCruceLetra(e.target.value)}
                          className={`w-full px-2 py-1.5 border rounded-lg text-xs text-center font-semibold ${
                            isZenTemplate ? 'bg-white dark:bg-[#1c1510] border-[#decca8] dark:border-[#382b22] text-[#201e1d] dark:text-[#f5ead8]' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <option value="-">-</option>
                          <option value="A">A</option>
                          <option value="B">B</option>
                        </select>
                      </div>

                      <div className="col-span-3">
                        <label className="text-[10px] text-slate-500 font-bold block mb-1">Placa / N°:</label>
                        <input
                          type="text"
                          value={placa}
                          onChange={e => setPlaca(e.target.value)}
                          className={`w-full px-2 py-1.5 border rounded-lg text-xs text-center font-bold ${
                            isZenTemplate ? 'bg-white dark:bg-[#1c1510] border-[#decca8] dark:border-[#382b22] text-[#201e1d] dark:text-[#f5ead8]' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                          }`}
                          placeholder="20"
                        />
                      </div>
                    </div>

                    {/* Barrio Ref */}
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block mb-1">
                        Barrio, Apto, Torre o Referencia:
                      </label>
                      <input
                        type="text"
                        value={barrioRef}
                        onChange={e => setBarrioRef(e.target.value)}
                        className={`w-full px-3 py-1.5 border rounded-lg text-xs font-medium ${
                          isZenTemplate ? 'bg-white dark:bg-[#1c1510] border-[#decca8] dark:border-[#382b22] text-[#201e1d] dark:text-[#f5ead8]' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                        }`}
                        placeholder="Ej: Barrio San Fernando, Apto 302, Torre B"
                      />
                    </div>

                    {/* Address Destino button */}
                    <div 
                      style={{ backgroundColor: isZenTemplate ? '#7a8a5e' : (accent || '#2563eb') }}
                      className="p-2.5 rounded-xl text-white font-extrabold text-xs flex items-center justify-between shadow-sm"
                    >
                      <span className="truncate">{standardizedAddr || 'Ingresa los datos de tu dirección'}</span>
                      <span className="px-2 py-0.5 bg-white/20 rounded text-[10px] uppercase font-black">📍 Destino</span>
                    </div>
                  </div>
                )}

                {/* Mini Map Location check */}
                {deliveryMode !== 'recoger' && (
                  <div className={`p-3.5 rounded-2xl border space-y-2 text-xs ${
                    isZenTemplate
                      ? 'bg-[#fcf8f2] dark:bg-[#251e18] border-[#ebddc5] dark:border-[#382b22]'
                      : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`font-bold flex items-center gap-1 ${isZenTemplate ? 'text-[#201e1d] dark:text-[#f5ead8]' : 'text-slate-700 dark:text-slate-300'}`}>
                        <span className="text-rose-500">📍</span>
                        <span>Ubicación en el Mapa</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleUseGPS}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] border ${
                          isZenTemplate
                            ? 'bg-[#7a8a5e]/15 text-[#7a8a5e] dark:text-[#adc08f] border-[#7a8a5e]/30'
                            : 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                        }`}
                      >
                        Usar mi GPS
                      </button>
                    </div>

                    <div className="h-32 rounded-xl overflow-hidden">
                      <InteractiveMap
                        lat={coords.lat}
                        lng={coords.lng}
                        coberturaKm={store.ubicacion.coberturaKm}
                        onLocationChange={(nLat, nLng) => setCoords({ lat: nLat, lng: nLng })}
                      />
                    </div>

                    <div className={`p-2 rounded-lg font-bold text-[10px] text-center border ${
                      isZenTemplate
                        ? 'bg-[#7a8a5e]/15 text-[#7a8a5e] dark:text-[#adc08f] border-[#7a8a5e]/30'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    }`}>
                      ✓ Dentro de cobertura express ({store.ubicacion.coberturaKm} km de {store.ubicacion.ciudad})
                    </div>
                  </div>
                )}

                {/* Special instructions */}
                <div className="space-y-1 text-xs">
                  <label className={`block font-bold ${isZenTemplate ? 'text-[#201e1d] dark:text-[#f5ead8]' : 'text-slate-700 dark:text-slate-300'}`}>
                    Instrucciones o Notas Especiales
                  </label>
                  <textarea
                    rows={2}
                    value={instrucciones}
                    onChange={e => setInstrucciones(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-xl font-medium focus:outline-none ${
                      isZenTemplate
                        ? 'bg-white dark:bg-[#251e18] border-[#decca8] dark:border-[#3e2f26] text-[#201e1d] dark:text-[#f5ead8]'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
                    }`}
                    placeholder="Ej: Casa de rejas blancas, timbre 201..."
                  />
                </div>
              </>
            )}
          </div>

          {/* Footer Summary & Next / Final Button */}
          {cartItems.length > 0 && (
            <div className={`p-4 sm:p-5 border-t space-y-3 sticky bottom-0 z-20 ${
              isZenTemplate
                ? 'bg-[#ebddc5]/90 dark:bg-[#201813]/95 border-[#dfceb3] dark:border-[#382a20]'
                : 'bg-slate-50 dark:bg-slate-900/90 border-slate-100 dark:border-slate-800'
            }`}>
              <div className="space-y-1 text-xs">
                <div className={`flex justify-between ${isZenTemplate ? 'text-[#6e5a4c] dark:text-[#baa896]' : 'text-slate-500 dark:text-slate-400'}`}>
                  <span>Subtotal Productos:</span>
                  <span>{formatCOP(subtotal)}</span>
                </div>
                <div className={`flex justify-between ${isZenTemplate ? 'text-[#6e5a4c] dark:text-[#baa896]' : 'text-slate-500 dark:text-slate-400'}`}>
                  <span>Domicilio:</span>
                  <span>
                    {deliveryMode === 'rappi'
                      ? `${formatCOP(costoEnvio)} · Rappi Cargo (20-35 min)`
                      : deliveryMode === 'estandar'
                      ? `${formatCOP(costoEnvio)} · Estándar`
                      : 'Gratis en Tienda'}
                  </span>
                </div>
                <div className={`flex justify-between font-black text-base pt-1 border-t ${
                  isZenTemplate
                    ? 'border-[#dfceb3] dark:border-[#382a20] text-[#201e1d] dark:text-[#f5ead8]'
                    : 'border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white'
                }`}>
                  <span>Total a Pagar:</span>
                  <span style={{ color: accent }}>{formatCOP(total)}</span>
                </div>
              </div>

              {!showPaymentStep ? (
                <button
                  type="button"
                  onClick={() => setShowPaymentStep(true)}
                  style={{ backgroundColor: accent }}
                  className="w-full py-3.5 text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-98 transition"
                >
                  <span>Proceder al Pago & Opciones →</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinalOrder}
                  disabled={isSubmitting}
                  style={{ backgroundColor: isZenTemplate ? '#7a8a5e' : '#059669' }}
                  className="w-full py-3.5 text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-98 transition"
                >
                  {isSubmitting ? (
                    <span>Generando comanda...</span>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4" />
                      <span>Confirmar Pedido ({formatCOP(total)})</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
