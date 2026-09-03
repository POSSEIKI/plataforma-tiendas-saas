import React, { useState, useMemo, useEffect } from 'react';
import { X, Calendar, Clock, AlertCircle, Phone, User, CheckCircle2, MessageSquare, Sparkles, Ban, Users } from 'lucide-react';
import { ServiceItem } from '../../types';
import { useStore } from '../../context/StoreContext';

interface ServiceBookingModalProps {
  service: ServiceItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const TIME_SLOTS = [
  '08:00 AM',
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
  '06:00 PM',
  '08:00 PM'
];

export const ServiceBookingModal: React.FC<ServiceBookingModalProps> = ({ service, isOpen, onClose }) => {
  const { store, createBooking, serviceBookings } = useStore();

  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [fecha, setFecha] = useState(() => new Date().toISOString().split('T')[0]);
  const [hora, setHora] = useState('10:00 AM');
  const [esUrgente, setEsUrgente] = useState(false);
  const [notas, setNotas] = useState('');
  const [completed, setCompleted] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const isZenTemplate = store.plantilla === 'zen';
  const accent = isZenTemplate ? '#c67139' : (store.temaColor || '#059669');

  const capacidad = service?.capacidadSimultanea || 1;

  // Real-time slot availability for the selected service and date
  const slotsInfo = useMemo(() => {
    if (!service) return [];

    return TIME_SLOTS.map(slot => {
      const occupied = (serviceBookings || []).filter(
        b => b.servicioId === service.id &&
             b.fecha === fecha &&
             b.hora === slot &&
             b.estado !== 'cancelada'
      ).length;

      const remaining = Math.max(0, capacidad - occupied);
      const isFull = remaining === 0;

      return {
        slot,
        occupied,
        remaining,
        isFull
      };
    });
  }, [service, serviceBookings, fecha, capacidad]);

  const totalAvailableInDay = useMemo(() => {
    return slotsInfo.filter(s => !s.isFull).length;
  }, [slotsInfo]);

  // Auto-switch to first available slot if current selected slot is full on this date
  useEffect(() => {
    const current = slotsInfo.find(s => s.slot === hora);
    if (!current || current.isFull) {
      const firstAvailable = slotsInfo.find(s => !s.isFull);
      if (firstAvailable) {
        setHora(firstAvailable.slot);
        setValidationError(null);
      } else {
        setValidationError(`Todos los horarios para el día ${fecha} están llenos. Por favor selecciona otra fecha.`);
      }
    } else {
      setValidationError(null);
    }
  }, [fecha, slotsInfo, hora]);

  if (!isOpen || !service) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Verify slot capacity before booking
    const selectedSlotInfo = slotsInfo.find(s => s.slot === hora);
    if (!selectedSlotInfo || selectedSlotInfo.isFull) {
      setValidationError('Este horario ya no tiene cupos disponibles. Por favor selecciona otro horario o fecha.');
      return;
    }

    createBooking({
      servicioId: service.id,
      servicioNombre: service.nombre,
      clienteNombre: nombre,
      clienteTelefono: telefono,
      fecha,
      hora,
      esUrgente,
      notas,
    });

    // Format WhatsApp message
    const msg = `*SOLICITUD DE SERVICIO / CITA - ${store.nombre}*\n\n` +
      `✨ *Servicio:* ${service.nombre}\n` +
      `👤 *Cliente:* ${nombre}\n` +
      `📱 *Teléfono:* ${telefono}\n` +
      `📅 *Fecha:* ${fecha}\n` +
      `⏰ *Hora:* ${hora}\n` +
      (esUrgente ? `🚨 *PRIORIDAD:* ¡URGENTE / INMEDIATO!\n` : '') +
      (notas ? `📝 *Observaciones:* ${notas}\n` : '') +
      `\n_Por favor confirmar disponibilidad. Gracias!_`;

    const whatsappUrl = `https://wa.me/57${store.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
    window.open(whatsappUrl, '_blank');

    setCompleted(true);
    setTimeout(() => {
      setCompleted(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-fadeIn">
      <div className={`relative max-w-lg w-full rounded-3xl p-6 sm:p-7 shadow-2xl border space-y-4 max-h-[92vh] overflow-y-auto transition-colors ${
        isZenTemplate 
          ? 'bg-[#fcf8f2] dark:bg-[#201813] border-[#ebddc5] dark:border-[#382b22] text-[#201e1d] dark:text-[#f5ead8]'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between pb-4 border-b ${isZenTemplate ? 'border-[#ebddc5] dark:border-[#382b22]' : 'border-slate-100 dark:border-slate-800'}`}>
          <div>
            <div className="flex items-center gap-2">
              <span 
                style={isZenTemplate ? {} : { color: accent }}
                className={`text-[10px] font-extrabold uppercase tracking-wider ${isZenTemplate ? 'text-[#7a8a5e] dark:text-[#adc08f]' : ''}`}
              >
                Agendamiento de Servicio
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                👥 {capacidad} {capacidad === 1 ? 'cupo / turno' : 'cupos / turno'}
              </span>
            </div>
            <h3 
              style={isZenTemplate ? { fontFamily: "'Caprasimo', serif" } : undefined}
              className={`text-base sm:text-lg font-bold ${isZenTemplate ? 'text-[#201e1d] dark:text-[#f5ead8] font-normal normal-case' : 'text-slate-900 dark:text-white'}`}
            >
              {service.nombre}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {completed ? (
          <div className="py-8 text-center space-y-3 animate-fadeIn">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto shadow-md ${
              isZenTemplate 
                ? 'bg-[#7a8a5e]/20 text-[#7a8a5e] dark:text-[#adc08f]'
                : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
            }`}>
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold">¡Cita Solicitada con Éxito!</h4>
            <p className="text-xs opacity-80 max-w-xs mx-auto">
              Te hemos redirigido a WhatsApp para la confirmación inmediata con el personal de la tienda.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
            {/* Service Brief */}
            <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
              isZenTemplate
                ? 'bg-[#ebddc5]/40 dark:bg-[#251e18] border-[#decca8] dark:border-[#382b22]'
                : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/40'
            }`}>
              <span className="text-xs font-semibold">
                Tarifa: <strong style={{ color: isZenTemplate ? '#c67139' : accent }}>{service.precioTexto}</strong>
              </span>
              <span className="text-[11px] opacity-75">
                Duración: ~{service.duracionMinutos || 15} min
              </span>
            </div>

            {/* Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold mb-1 opacity-90">
                  Nombre Completo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2 border rounded-xl font-medium focus:outline-none ${
                      isZenTemplate
                        ? 'bg-white dark:bg-[#251e18] border-[#decca8] dark:border-[#3e2f26] text-[#201e1d] dark:text-[#f5ead8] focus:ring-2 focus:ring-[#c67139]'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500'
                    }`}
                    placeholder="Ej: Laura Castro"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1 opacity-90">
                  Teléfono / WhatsApp
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={telefono}
                    onChange={e => setTelefono(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2 border rounded-xl font-medium focus:outline-none ${
                      isZenTemplate
                        ? 'bg-white dark:bg-[#251e18] border-[#decca8] dark:border-[#3e2f26] text-[#201e1d] dark:text-[#f5ead8] focus:ring-2 focus:ring-[#c67139]'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500'
                    }`}
                    placeholder="3151234567"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Date Selection */}
            <div>
              <label className="block font-bold mb-1 opacity-90 flex items-center justify-between">
                <span>Fecha Deseada</span>
                <span className="text-[11px] font-normal opacity-70">
                  {totalAvailableInDay > 0 ? `🟢 ${totalAvailableInDay} turnos con cupo` : '🔴 Sin cupos este día'}
                </span>
              </label>
              <input
                type="date"
                min={todayStr}
                value={fecha}
                onChange={e => setFecha(e.target.value)}
                className={`w-full px-3 py-2 border rounded-xl font-medium focus:outline-none ${
                  isZenTemplate
                    ? 'bg-white dark:bg-[#251e18] border-[#decca8] dark:border-[#3e2f26] text-[#201e1d] dark:text-[#f5ead8]'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
                }`}
                required
              />
            </div>

            {/* Time Slots Grid with Capacity and Blocking */}
            <div className="space-y-1.5">
              <label className="block font-bold opacity-90 flex items-center justify-between">
                <span>Horario Disponible</span>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  Capacidad: {capacidad} personas / horario
                </span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {slotsInfo.map((s) => {
                  const isSelected = hora === s.slot && !s.isFull;

                  if (s.isFull) {
                    return (
                      <div
                        key={s.slot}
                        className="p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 text-slate-400 dark:text-slate-500 opacity-60 flex flex-col items-center justify-center text-center cursor-not-allowed select-none"
                        title={`Horario agotado (Capacidad: ${capacidad}/${capacidad} ocupados)`}
                      >
                        <span className="font-bold line-through text-xs">{s.slot}</span>
                        <span className="text-[9px] font-black text-rose-600 dark:text-rose-400 uppercase mt-0.5 flex items-center gap-1">
                          <Ban className="w-2.5 h-2.5" />
                          <span>Agotado (0/{capacidad})</span>
                        </span>
                      </div>
                    );
                  }

                  return (
                    <button
                      key={s.slot}
                      type="button"
                      onClick={() => {
                        setHora(s.slot);
                        setValidationError(null);
                      }}
                      style={isSelected ? { borderColor: isZenTemplate ? '#7a8a5e' : accent } : {}}
                      className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center cursor-pointer ${
                        isSelected
                          ? isZenTemplate
                            ? 'bg-[#7a8a5e]/15 border-2 shadow-sm font-black'
                            : 'bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-600 shadow-sm font-black'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                      }`}
                    >
                      <span className="text-xs font-bold">{s.slot}</span>
                      {s.remaining === 1 ? (
                        <span className="text-[9px] font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">
                          🟡 ¡Último cupo!
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                          🟢 {s.remaining} cupos libres
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Validation Error Message */}
            {validationError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-bold flex items-start gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Urgent Switch */}
            {service.permiteUrgente && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={esUrgente}
                    onChange={e => setEsUrgente(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-rose-800 dark:text-rose-300 block">
                      🚨 ¿Es un servicio de carácter prioritario / urgente?
                    </span>
                    <span className="text-[11px] text-rose-600/80 dark:text-rose-400">
                      Priorizaremos tu solicitud para atención inmediata o en domicilio express.
                    </span>
                  </div>
                </label>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block font-bold mb-1 opacity-90">
                Detalles u Observaciones de la Cita / Servicio
              </label>
              <textarea
                rows={2}
                value={notas}
                onChange={e => setNotas(e.target.value)}
                className={`w-full px-3 py-2 border rounded-xl font-medium focus:outline-none ${
                  isZenTemplate
                    ? 'bg-white dark:bg-[#251e18] border-[#decca8] dark:border-[#3e2f26] text-[#201e1d] dark:text-[#f5ead8]'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
                }`}
                placeholder="Indica detalles, indicaciones previas o preferencias..."
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2.5 rounded-xl border font-bold cursor-pointer ${
                  isZenTemplate
                    ? 'border-[#decca8] dark:border-[#3e2f26] text-[#6e5a4c] dark:text-[#baa896]'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={totalAvailableInDay === 0}
                style={{ backgroundColor: isZenTemplate ? '#7a8a5e' : accent }}
                className="px-6 py-2.5 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 hover:brightness-110 active:scale-98 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Agendar por WhatsApp</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

