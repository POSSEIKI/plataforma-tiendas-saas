import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  RefreshCw, 
  Bike, 
  Store as StoreIcon, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Image as ImageIcon, 
  Phone, 
  MapPin, 
  DollarSign, 
  AlertCircle, 
  UserCheck, 
  Check, 
  X, 
  Sparkles,
  Volume2,
  Bell
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Order, OrderStatus } from '../../types';
import { formatCOP } from '../../utils/formatters';

export const PedidosView: React.FC = () => {
  const { orders, updateOrderStatus, simulateIncomingOrder } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('todos');
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(41);
  const [selectedComprobanteUrl, setSelectedComprobanteUrl] = useState<string | null>(null);

  // Counters
  const counts = {
    todos: orders.length,
    nuevos: orders.filter(o => o.estado === 'nuevo').length,
    preparando: orders.filter(o => o.estado === 'preparando').length,
    domicilios_rappi: orders.filter(o => o.tipoEntrega === 'domicilio').length,
    recoger_tienda: orders.filter(o => o.tipoEntrega === 'recoger').length,
    listos: orders.filter(o => o.estado === 'listo' || o.estado === 'domicilio_rappi').length,
    entregados: orders.filter(o => o.estado === 'entregado').length,
    cancelados: orders.filter(o => o.estado === 'cancelado').length,
  };

  // Filtered orders
  const filteredOrders = orders.filter(ord => {
    // Search filter
    const matchesSearch = 
      ord.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.clienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.clienteTelefono.includes(searchTerm) ||
      (ord.clienteDireccion && ord.clienteDireccion.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    // Tab filter
    if (activeFilter === 'todos') return true;
    if (activeFilter === 'nuevos') return ord.estado === 'nuevo';
    if (activeFilter === 'preparando') return ord.estado === 'preparando';
    if (activeFilter === 'domicilios_rappi') return ord.tipoEntrega === 'domicilio';
    if (activeFilter === 'recoger_tienda') return ord.tipoEntrega === 'recoger';
    if (activeFilter === 'listos') return ord.estado === 'listo' || ord.estado === 'domicilio_rappi';
    if (activeFilter === 'entregados') return ord.estado === 'entregado';
    if (activeFilter === 'cancelados') return ord.estado === 'cancelado';
    return true;
  });

  const toggleExpand = (id: number) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'nuevo':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-extrabold text-[11px] border border-rose-300 dark:border-rose-800 animate-pulse">
            <Bell className="w-3 h-3" /> Nuevo Pedido
          </span>
        );
      case 'preparando':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-extrabold text-[11px] border border-amber-300 dark:border-amber-800">
            <Clock className="w-3 h-3" /> Preparando
          </span>
        );
      case 'domicilio_rappi':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 font-extrabold text-[11px] border border-orange-300 dark:border-orange-800">
            <Bike className="w-3 h-3" /> Rappi Asignado
          </span>
        );
      case 'listo':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-extrabold text-[11px] border border-teal-300 dark:border-teal-800">
            <CheckCircle2 className="w-3 h-3" /> Listo en Ventanilla
          </span>
        );
      case 'en_camino':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-extrabold text-[11px] border border-blue-300 dark:border-blue-800">
            <Bike className="w-3 h-3" /> En Camino (Rappi)
          </span>
        );
      case 'entregado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-extrabold text-[11px] border border-emerald-300 dark:border-emerald-800">
            <Check className="w-3 h-3" /> Entregado
          </span>
        );
      case 'cancelado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-extrabold text-[11px] border border-slate-300 dark:border-slate-700">
            <X className="w-3 h-3" /> Cancelado
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Comprobante Modal */}
      {selectedComprobanteUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-fadeIn">
          <div className="relative max-w-lg w-full bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-emerald-600" />
                <span>Comprobante de Transferencia Adjunto</span>
              </h3>
              <button
                onClick={() => setSelectedComprobanteUrl(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-4">
              <img
                src={selectedComprobanteUrl}
                alt="Comprobante"
                className="w-full max-h-96 object-contain rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedComprobanteUrl(null)}
                className="px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 transition"
              >
                Cerrar Visor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Panel de Pedidos & Domicilios
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Control en tiempo real de despachos, pagos y entregas con alertas sonoras
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={simulateIncomingOrder}
            className="px-3.5 py-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 hover:bg-amber-100 text-amber-800 dark:text-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
            title="Crea una orden simulada y suena la campana"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Simular Pedido Entrante</span>
          </button>

          <button
            onClick={() => window.location.reload()}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-slate-200 dark:border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-sm"
          placeholder="Buscar por cliente, teléfono, dirección o # de pedido..."
        />
      </div>

      {/* Filter Tabs / Badges */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'todos', label: `Todos (${counts.todos})`, color: 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' },
          { id: 'nuevos', label: `🔴 Nuevos (${counts.nuevos})`, color: 'bg-rose-600 text-white' },
          { id: 'preparando', label: `🟡 Preparando (${counts.preparando})`, color: 'bg-amber-600 text-white' },
          { id: 'domicilios_rappi', label: `🛵 Domicilios Rappi (${counts.domicilios_rappi})`, color: 'bg-red-500 text-white' },
          { id: 'recoger_tienda', label: `🏪 Recoger en Tienda (${counts.recoger_tienda})`, color: 'bg-purple-600 text-white' },
          { id: 'listos', label: `🟢 Listos (${counts.listos})`, color: 'bg-teal-600 text-white' },
          { id: 'entregados', label: `✅ Entregados (${counts.entregados})`, color: 'bg-emerald-600 text-white' },
          { id: 'cancelados', label: `❌ Cancelados (${counts.cancelados})`, color: 'bg-slate-600 text-white' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              activeFilter === tab.id
                ? `${tab.color} shadow-sm ring-2 ring-emerald-500/30`
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <ShoppingBag className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No hay pedidos con este filtro</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Los nuevos pedidos que hagan los clientes en la tienda pública aparecerán aquí al instante con sonido.
            </p>
          </div>
        ) : (
          filteredOrders.map((ord) => {
            const isExpanded = expandedOrderId === ord.id;
            return (
              <div
                key={ord.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition overflow-hidden"
              >
                {/* Main Card Header */}
                <div
                  onClick={() => toggleExpand(ord.id)}
                  className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition"
                >
                  {/* Left: Code & Client info */}
                  <div className="flex items-center gap-3">
                    <div className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-black text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700">
                      {ord.codigo}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{ord.clienteNombre}</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 font-medium">{ord.fechaHora}</p>
                    </div>
                  </div>

                  {/* Middle: Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Delivery type */}
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px] border border-slate-200 dark:border-slate-700">
                      {ord.tipoEntrega === 'domicilio' ? (
                        <>
                          <Bike className="w-3 h-3 text-red-500" />
                          <span>Domicilio</span>
                        </>
                      ) : (
                        <>
                          <StoreIcon className="w-3 h-3 text-purple-500" />
                          <span>Recoger</span>
                        </>
                      )}
                    </span>

                    {/* Status Badge */}
                    {getStatusBadge(ord.estado)}

                    {/* Payment Status */}
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-bold text-[11px] border ${
                      ord.pagoEstado === 'pagado'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                    }`}>
                      <DollarSign className="w-3 h-3" />
                      <span>{ord.pagoEstado === 'pagado' ? 'Pagado' : 'Pago Pendiente'}</span>
                    </span>

                    {/* Comprobante if exists */}
                    {ord.comprobanteUrl && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedComprobanteUrl(ord.comprobanteUrl || null);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-bold text-[11px] border border-teal-300 dark:border-teal-800 hover:bg-teal-100 transition"
                      >
                        <ImageIcon className="w-3 h-3" />
                        <span>Con Comprobante</span>
                      </button>
                    )}
                  </div>

                  {/* Right: Price & Toggle */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                      {formatCOP(ord.total)}
                    </span>
                    <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Accordion Details */}
                {isExpanded && (
                  <div className="p-4 sm:p-6 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 space-y-5">
                    {/* Customer & Address Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                        <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Contacto del Cliente</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400">
                          <strong>Nombre:</strong> {ord.clienteNombre}
                        </p>
                        <p className="text-slate-600 dark:text-slate-400">
                          <strong>WhatsApp/Tel:</strong> {ord.clienteTelefono}
                        </p>
                        <p className="text-slate-600 dark:text-slate-400">
                          <strong>Método de Pago:</strong> <span className="uppercase font-bold text-emerald-600">{ord.metodoPago}</span>
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                        <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-rose-600" />
                          <span>Destino de Entrega</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400">
                          <strong>Dirección:</strong> {ord.clienteDireccion || 'Recoger en establecimiento'}
                        </p>
                        <p className="text-slate-600 dark:text-slate-400">
                          <strong>Despacho:</strong> {ord.tipoEntrega === 'domicilio' ? '🛵 Motorizado Rappi / Domiciliario Express' : '🏪 Entrega en mostrador'}
                        </p>
                      </div>
                    </div>

                    {/* Items Table */}
                    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 font-bold text-[11px] text-slate-600 dark:text-slate-400 grid grid-cols-12">
                        <span className="col-span-6">Producto</span>
                        <span className="col-span-2 text-center">Cant.</span>
                        <span className="col-span-2 text-right">Precio</span>
                        <span className="col-span-2 text-right">Subtotal</span>
                      </div>
                      <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                        {ord.items.map((item, idx) => (
                          <div key={idx} className="px-4 py-2.5 grid grid-cols-12 items-center">
                            <div className="col-span-6 font-semibold text-slate-900 dark:text-white">
                              {item.nombre} <span className="text-[10px] text-slate-400 block font-normal">{item.presentacion}</span>
                            </div>
                            <div className="col-span-2 text-center font-bold text-slate-700 dark:text-slate-300">
                              x{item.cantidad}
                            </div>
                            <div className="col-span-2 text-right text-slate-500">
                              {formatCOP(item.precio)}
                            </div>
                            <div className="col-span-2 text-right font-bold text-slate-900 dark:text-white">
                              {formatCOP(item.precio * item.cantidad)}
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* Subtotal & Delivery Summary */}
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-6 text-xs">
                        <span className="text-slate-500">Subtotal: <strong>{formatCOP(ord.subtotal)}</strong></span>
                        <span className="text-slate-500">Costo Domicilio: <strong>{formatCOP(ord.costoEnvio)}</strong></span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">Total: {formatCOP(ord.total)}</span>
                      </div>
                    </div>

                    {/* Rappi Dispatch Workflow Buttons */}
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <Bike className="w-4 h-4 text-red-500" />
                          <span>Paso a Paso de Despacho (Rappi / Ventanilla)</span>
                        </span>
                        <span className="text-[11px] text-slate-400">Actualiza el estado para alertar al cliente</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {ord.estado === 'nuevo' && (
                          <>
                            <button
                              onClick={() => updateOrderStatus(ord.id, 'preparando')}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>1. Aceptar Pedido (Preparar)</span>
                            </button>
                            <button
                              onClick={() => updateOrderStatus(ord.id, 'cancelado')}
                              className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-rose-200 dark:border-rose-800 transition"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Rechazar</span>
                            </button>
                          </>
                        )}

                        {ord.estado === 'preparando' && (
                          <>
                            <button
                              onClick={() => updateOrderStatus(ord.id, 'domicilio_rappi', {
                                rappiTracking: {
                                  domiciliarioNombre: 'Rappi Repartidor #104',
                                  placaMoto: 'STW-88E',
                                  etapa: 'hacia_tienda',
                                  horaEstimada: '15 mins',
                                }
                              })}
                              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
                            >
                              <Bike className="w-3.5 h-3.5" />
                              <span>2. Notificar a Domiciliario Rappi</span>
                            </button>
                            <button
                              onClick={() => updateOrderStatus(ord.id, 'listo')}
                              className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Marcar Listo en Mostrador</span>
                            </button>
                          </>
                        )}

                        {ord.estado === 'domicilio_rappi' && (
                          <button
                            onClick={() => updateOrderStatus(ord.id, 'en_camino')}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>3. Entregado al Repartidor (En Camino)</span>
                          </button>
                        )}

                        {(ord.estado === 'en_camino' || ord.estado === 'listo') && (
                          <button
                            onClick={() => updateOrderStatus(ord.id, 'entregado', { pagoEstado: 'pagado' })}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>4. Confirmar Entrega Finalizada</span>
                          </button>
                        )}

                        {ord.estado === 'entregado' && (
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Pedido Completado con Éxito</span>
                          </span>
                        )}

                        {ord.estado === 'cancelado' && (
                          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                            <XCircle className="w-4 h-4" />
                            <span>Pedido Cancelado</span>
                          </span>
                        )}

                        {/* Toggle Payment State */}
                        <button
                          type="button"
                          onClick={() => updateOrderStatus(ord.id, ord.estado, {
                            pagoEstado: ord.pagoEstado === 'pagado' ? 'pendiente' : 'pagado'
                          })}
                          className="ml-auto px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[11px] hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                          Marcar como {ord.pagoEstado === 'pagado' ? 'Pendiente' : 'Pagado'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
