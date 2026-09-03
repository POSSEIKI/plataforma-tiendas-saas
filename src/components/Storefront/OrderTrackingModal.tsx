import React from 'react';
import { X, Bike, CheckCircle2, Clock, MapPin, Store as StoreIcon, ShieldCheck, Phone } from 'lucide-react';
import { Order } from '../../types';
import { formatCOP } from '../../utils/formatters';
import { useStore } from '../../context/StoreContext';

interface OrderTrackingModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({ order, isOpen, onClose }) => {
  const { store } = useStore();
  if (!isOpen || !order) return null;

  const isZenTemplate = store.plantilla === 'zen';
  const accent = isZenTemplate ? '#c67139' : (store.temaColor || '#059669');

  const stages = [
    { key: 'nuevo', label: 'Pedido Recibido', desc: 'Esperando confirmación de la tienda' },
    { key: 'preparando', label: 'En Preparación', desc: 'Alistando tus productos y empaque' },
    { key: 'domicilio_rappi', label: 'Rappi Asignado', desc: 'Domiciliario dirigiéndose al local' },
    { key: 'en_camino', label: 'En Camino', desc: 'El repartidor va hacia tu dirección' },
    { key: 'entregado', label: 'Entregado', desc: '¡Pedido finalizado con éxito!' },
  ];

  const getStageIndex = (status: string) => {
    switch (status) {
      case 'nuevo': return 0;
      case 'preparando': return 1;
      case 'domicilio_rappi':
      case 'listo': return 2;
      case 'en_camino': return 3;
      case 'entregado': return 4;
      default: return 0;
    }
  };

  const currentStageIdx = getStageIndex(order.estado);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-fadeIn">
      <div className={`relative max-w-lg w-full rounded-3xl p-6 sm:p-7 shadow-2xl border space-y-6 transition-colors ${
        isZenTemplate
          ? 'bg-[#fcf8f2] dark:bg-[#201813] border-[#ebddc5] dark:border-[#382b22] text-[#201e1d] dark:text-[#f5ead8]'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between pb-4 border-b ${isZenTemplate ? 'border-[#ebddc5] dark:border-[#382b22]' : 'border-slate-100 dark:border-slate-800'}`}>
          <div>
            <div className="flex items-center gap-2">
              <span 
                style={isZenTemplate ? {} : { backgroundColor: `${accent}18`, color: accent }}
                className={`px-2.5 py-0.5 rounded-full font-extrabold text-xs ${
                  isZenTemplate ? 'bg-[#7a8a5e]/20 text-[#7a8a5e] dark:text-[#adc08f]' : ''
                }`}
              >
                Orden {order.codigo}
              </span>
              <span className="text-xs opacity-60">{order.fechaHora}</span>
            </div>
            <h3 
              style={isZenTemplate ? { fontFamily: "'Caprasimo', serif" } : undefined}
              className={`text-lg font-extrabold mt-1 ${isZenTemplate ? 'font-normal normal-case text-[#201e1d] dark:text-[#f5ead8]' : 'text-slate-900 dark:text-white'}`}
            >
              Seguimiento de tu Pedido en Vivo
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Rappi Live Card */}
        {order.tipoEntrega === 'domicilio' && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-600/30">
                <Bike className="w-6 h-6 animate-bounce-short" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  Despacho con Rappi / Domicilio Express
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {order.rappiTracking?.domiciliarioNombre || 'Asignando motorizado más cercano...'}
                </p>
              </div>
            </div>
            {order.rappiTracking?.placaMoto && (
              <span className="px-2 py-1 bg-white dark:bg-slate-800 rounded-lg text-xs font-black text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700">
                {order.rappiTracking.placaMoto}
              </span>
            )}
          </div>
        )}

        {/* Vertical Timeline */}
        <div className="space-y-4 py-2">
          {stages.map((stage, idx) => {
            const isCompleted = idx <= currentStageIdx;
            const isCurrent = idx === currentStageIdx;
            return (
              <div key={stage.key} className="flex items-start gap-3.5 relative">
                {idx < stages.length - 1 && (
                  <div
                    className={`absolute left-4 top-8 w-0.5 h-8 transition-colors ${
                      idx < currentStageIdx 
                        ? (isZenTemplate ? 'bg-[#7a8a5e]' : 'bg-emerald-500') 
                        : (isZenTemplate ? 'bg-[#ebddc5] dark:bg-[#382b22]' : 'bg-slate-200 dark:bg-slate-800')
                    }`}
                  />
                )}

                <div
                  style={isCurrent || isCompleted ? { backgroundColor: isZenTemplate ? (isCurrent ? '#c67139' : '#7a8a5e') : (isCurrent ? accent : '#10b981') } : {}}
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition font-bold text-xs ${
                    isCurrent
                      ? 'text-white ring-4 ring-current/20 shadow-md'
                      : isCompleted
                      ? 'text-white'
                      : isZenTemplate 
                        ? 'bg-[#ebddc5] dark:bg-[#251e18] text-[#6e5a4c] dark:text-[#baa896]'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <h4
                    style={isCurrent ? { color: isZenTemplate ? '#c67139' : accent } : {}}
                    className={`text-xs sm:text-sm font-bold ${
                      isCurrent
                        ? ''
                        : isCompleted
                        ? (isZenTemplate ? 'text-[#201e1d] dark:text-[#f5ead8]' : 'text-slate-900 dark:text-white')
                        : 'opacity-50'
                    }`}
                  >
                    {stage.label}
                  </h4>
                  <p className="text-[11px] opacity-75">
                    {stage.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Details Brief */}
        <div className={`p-4 rounded-2xl border space-y-2 text-xs ${
          isZenTemplate
            ? 'bg-[#ebddc5]/40 dark:bg-[#251e18] border-[#decca8] dark:border-[#382b22]'
            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800'
        }`}>
          <div className="flex justify-between opacity-80">
            <span>Destino:</span>
            <strong className="truncate max-w-[220px]">
              {order.clienteDireccion || 'Entrega en tienda'}
            </strong>
          </div>
          <div className="flex justify-between opacity-80">
            <span>Total a pagar:</span>
            <strong style={{ color: isZenTemplate ? '#c67139' : accent }} className="font-extrabold text-sm">
              {formatCOP(order.total)}
            </strong>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{ backgroundColor: isZenTemplate ? '#c67139' : undefined }}
          className={`w-full py-3 font-bold rounded-xl text-xs transition hover:brightness-110 active:scale-98 ${
            isZenTemplate
              ? 'text-white shadow-lg'
              : 'bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900'
          }`}
        >
          Cerrar Seguimiento
        </button>
      </div>
    </div>
  );
};
