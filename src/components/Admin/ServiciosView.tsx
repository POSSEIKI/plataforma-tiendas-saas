import React, { useState, useRef } from 'react';
import { 
  PlusCircle, 
  Plus, 
  Trash2, 
  Edit3, 
  X, 
  Sparkles, 
  Clock, 
  Check, 
  Phone,
  Upload,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  Calendar,
  User,
  AlertCircle,
  MessageSquare,
  Search,
  Filter,
  ShieldCheck,
  CalendarDays,
  CheckCheck,
  XCircle,
  Clock3
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ServiceItem, ServiceBooking } from '../../types';

export const ServiciosView: React.FC = () => {
  const { 
    services, 
    addService, 
    updateService, 
    deleteService, 
    store, 
    updateStore,
    serviceBookings,
    updateBookingStatus,
    deleteBooking
  } = useStore();

  const [activeSubTab, setActiveSubTab] = useState<'catalogo' | 'agenda'>('catalogo');

  // Category State
  const [nuevaCat, setNuevaCat] = useState('');
  
  // Modal State for Add / Edit Service
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Agenda Filters State
  const [agendaSearch, setAgendaSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<'todos' | 'pendiente' | 'confirmada' | 'atendida' | 'cancelada' | 'urgentes'>('todos');
  const [fechaFilter, setFechaFilter] = useState<'todas' | 'hoy' | 'semana'>('todas');

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoria: store.categoriasServicios[0] || 'General',
    precioTexto: 'Consultar · 10:00',
    duracionMinutos: 15,
    capacidadSimultanea: 1,
    imagenUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=300&q=80',
    activo: true,
    permiteUrgente: true,
  });

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (nuevaCat.trim() && !store.categoriasServicios.includes(nuevaCat.trim())) {
      updateStore({
        categoriasServicios: [...store.categoriasServicios, nuevaCat.trim()],
      });
      setNuevaCat('');
    }
  };

  const handleRemoveCategory = (catToRemove: string) => {
    updateStore({
      categoriasServicios: store.categoriasServicios.filter(c => c !== catToRemove),
    });
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setShowUrlInput(false);
    setUploadMessage(null);
    setFormData({
      nombre: '',
      descripcion: '',
      categoria: store.categoriasServicios[0] || 'General',
      precioTexto: 'Consultar · 10:00',
      duracionMinutos: 15,
      capacidadSimultanea: 1,
      imagenUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500&q=80',
      activo: true,
      permiteUrgente: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (srv: ServiceItem) => {
    setEditingId(srv.id);
    setShowUrlInput(false);
    setUploadMessage(null);
    setFormData({
      nombre: srv.nombre,
      descripcion: srv.descripcion,
      categoria: srv.categoria,
      precioTexto: srv.precioTexto,
      duracionMinutos: srv.duracionMinutos,
      capacidadSimultanea: srv.capacidadSimultanea || 1,
      imagenUrl: srv.imagenUrl,
      activo: srv.activo,
      permiteUrgente: srv.permiteUrgente ?? true,
    });
    setModalOpen(true);
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen seleccionada supera los 5 MB. Por favor elige una imagen más liviana.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setFormData(prev => ({ ...prev, imagenUrl: base64 }));
      setUploadMessage('✓ Imagen cargada exitosamente desde tu dispositivo');
      setTimeout(() => setUploadMessage(null), 3500);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateService(editingId, formData);
    } else {
      addService(formData);
    }
    setModalOpen(false);
  };


  // Agenda Metrics
  const totalBookings = serviceBookings?.length || 0;
  const pendingBookings = (serviceBookings || []).filter(b => b.estado === 'pendiente').length;
  const confirmedBookings = (serviceBookings || []).filter(b => b.estado === 'confirmada').length;
  const completedBookings = (serviceBookings || []).filter(b => b.estado === 'atendida').length;
  const urgentBookings = (serviceBookings || []).filter(b => b.esUrgente).length;

  const todayStr = new Date().toISOString().split('T')[0];

  // Agenda Filtering
  const filteredBookings = (serviceBookings || []).filter(b => {
    // Search filter
    const query = agendaSearch.toLowerCase().trim();
    if (query) {
      const matchName = b.clienteNombre.toLowerCase().includes(query);
      const matchPhone = b.clienteTelefono.toLowerCase().includes(query);
      const matchService = b.servicioNombre.toLowerCase().includes(query);
      const matchNotes = (b.notas || '').toLowerCase().includes(query);
      if (!matchName && !matchPhone && !matchService && !matchNotes) return false;
    }

    // Status filter
    if (estadoFilter === 'urgentes') {
      if (!b.esUrgente) return false;
    } else if (estadoFilter !== 'todos') {
      if (b.estado !== estadoFilter) return false;
    }

    // Date filter
    if (fechaFilter === 'hoy') {
      if (b.fecha !== todayStr) return false;
    } else if (fechaFilter === 'semana') {
      const bDate = new Date(b.fecha).getTime();
      const now = new Date().getTime();
      const diffDays = (bDate - now) / (1000 * 3600 * 24);
      if (diffDays < -1 || diffDays > 7) return false;
    }

    return true;
  });

  const getStatusBadge = (estado: ServiceBooking['estado']) => {
    switch (estado) {
      case 'pendiente':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <Clock3 className="w-3.5 h-3.5" />
            <span>Pendiente</span>
          </span>
        );
      case 'confirmada':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            <Calendar className="w-3.5 h-3.5" />
            <span>Confirmada</span>
          </span>
        );
      case 'atendida':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Atendida</span>
          </span>
        );
      case 'cancelada':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancelada</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Modal Add/Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-fadeIn">
          <div className="relative max-w-lg w-full bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-600" />
                <span>{editingId ? 'Editar Servicio' : 'Nuevo Servicio'}</span>
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre del Servicio
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Ej: Masajes Terapéuticos, Consulta Especializada, etc."
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Descripción Detallada
                </label>
                <textarea
                  rows={3}
                  value={formData.descripcion}
                  onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Describe en qué consiste el servicio, beneficios o preparación..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Categoría del Servicio
                  </label>
                  <select
                    value={formData.categoria}
                    onChange={e => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {store.categoriasServicios.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Precio / Formato
                  </label>
                  <input
                    type="text"
                    value={formData.precioTexto}
                    onChange={e => setFormData({ ...formData, precioTexto: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
                    placeholder="Consultar · 10:00 o $ 50.000"
                  />
                </div>
              </div>

              {/* Capacidad Simultánea & Duración */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    👥 Capacidad por Horario
                  </label>
                  <select
                    value={formData.capacidadSimultanea}
                    onChange={e => setFormData({ ...formData, capacidadSimultanea: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs sm:text-sm"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <option key={num} value={num}>
                        {num === 1 ? '1 persona a la vez (Individual)' : `${num} personas / pacientes a la vez`}
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Bloquea el horario en la web cuando se llenen los cupos.
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ⏱️ Duración Estimada
                  </label>
                  <select
                    value={formData.duracionMinutos}
                    onChange={e => setFormData({ ...formData, duracionMinutos: parseInt(e.target.value, 10) || 15 })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs sm:text-sm"
                  >
                    <option value={15}>15 minutos</option>
                    <option value={30}>30 minutos</option>
                    <option value={45}>45 minutos</option>
                    <option value={60}>1 hora (60 min)</option>
                    <option value={90}>1 hora y media (90 min)</option>
                    <option value={120}>2 horas (120 min)</option>
                  </select>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Tiempo promedio de atención por cliente.
                  </span>
                </div>
              </div>

              {/* Imagen del Servicio - Carga Directa desde PC o Celular */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  Imagen del Servicio
                </label>

                {/* Input File Oculto para PC o Celular */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageFileUpload}
                  className="hidden"
                />

                {/* Caja de Vista Previa & Botón de Carga */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center gap-3.5">
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-700 border-2 border-dashed border-emerald-500/40 hover:border-emerald-500 flex items-center justify-center flex-shrink-0 cursor-pointer group relative shadow-inner"
                      title="Haz clic para seleccionar foto desde tu dispositivo"
                    >
                      {formData.imagenUrl ? (
                        <>
                          <img src={formData.imagenUrl} alt="Vista previa" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white">
                            <Camera className="w-6 h-6" />
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center text-slate-400 group-hover:text-emerald-600 transition">
                          <Camera className="w-6 h-6" />
                          <span className="text-[9px] font-bold mt-1">Subir</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-98 transition"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Cargar desde PC o Celular</span>
                      </button>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400">
                          PNG, JPG, WebP (Máx. 5MB)
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowUrlInput(!showUrlInput)}
                          className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                        >
                          {showUrlInput ? 'Ocultar URL' : 'O ingresar URL'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {uploadMessage && (
                    <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 animate-fadeIn">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{uploadMessage}</span>
                    </div>
                  )}

                  {showUrlInput && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1 animate-fadeIn">
                      <label className="text-[11px] font-bold text-slate-500 block">
                        URL Externa de la Imagen
                      </label>
                      <input
                        type="url"
                        value={formData.imagenUrl}
                        onChange={e => setFormData({ ...formData, imagenUrl: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        placeholder="https://..."
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="srv-urgente"
                  checked={formData.permiteUrgente}
                  onChange={e => setFormData({ ...formData, permiteUrgente: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <label htmlFor="srv-urgente" className="font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                  Permite solicitud urgente / prioritaria desde la tienda
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/25"
                >
                  Guardar Servicio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Header & Subtab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Servicios & Citas
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Administra los servicios que ofreces y gestiona la agenda privada de citas agendadas por tus clientes
          </p>
        </div>

        {/* Tab Selector */}
        <div className="inline-flex p-1 rounded-2xl bg-slate-200/80 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('catalogo')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
              activeSubTab === 'catalogo'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-emerald-600" />
            <span>Catálogo de Servicios ({services.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('agenda')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 relative ${
              activeSubTab === 'agenda'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4 text-teal-600" />
            <span>AGENDA SERVICIOS</span>
            {pendingBookings > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white animate-pulse">
                {pendingBookings}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SUBTAB 1: CATALOGO DE SERVICIOS                          */}
      {/* ========================================================= */}
      {activeSubTab === 'catalogo' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Card 1: Categorías de servicios */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Categorías de servicios</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Crea categorías (Consulta, Masajes, Terapias, Baño, Estética...) para agrupar tus servicios en la tienda.
              </p>
            </div>

            <form onSubmit={handleAddCategory} className="flex gap-2">
              <input
                type="text"
                value={nuevaCat}
                onChange={e => setNuevaCat(e.target.value)}
                className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="Nueva categoría (ej: Terapias, Consulta, Masajes)"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition"
              >
                <Plus className="w-4 h-4" />
                <span>+ Agregar</span>
              </button>
            </form>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              {store.categoriasServicios.map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-slate-700"
                >
                  <span>{cat}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCategory(cat)}
                    className="text-slate-400 hover:text-rose-600 transition"
                    title="Eliminar categoría"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Card 2: Tus servicios */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Tus servicios disponibles</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Los servicios que ofreces al público. Tus clientes pueden consultarlos y solicitar una cita con el formulario de agendamiento.
                </p>
              </div>

              <button
                onClick={handleOpenAdd}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>+ Nuevo servicio</span>
              </button>
            </div>

            {/* Services List */}
            {services.length === 0 ? (
              <div className="p-8 text-center space-y-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <Sparkles className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                  No tienes servicios registrados todavía.
                </p>
                <button
                  onClick={handleOpenAdd}
                  className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl"
                >
                  Crear primer servicio
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {services.map((srv) => (
                  <div
                    key={srv.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition"
                  >
                    <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-200 dark:bg-slate-800 flex-shrink-0">
                        <img src={srv.imagenUrl} alt={srv.nombre} className="w-full h-full object-cover" />
                      </div>
                      <div className="space-y-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                          {srv.nombre}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {srv.descripcion}
                        </p>
                        <div className="flex items-center gap-2 pt-0.5 flex-wrap">
                          <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                            {srv.precioTexto}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[10px]">
                            {srv.categoria}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-bold text-[10px]">
                            👥 {srv.capacidadSimultanea || 1} {(srv.capacidadSimultanea || 1) === 1 ? 'cupo / turno' : 'cupos / turno'}
                          </span>
                          {srv.duracionMinutos && (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px]">
                              ⏱️ {srv.duracionMinutos} min
                            </span>
                          )}
                          {srv.permiteUrgente && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-[10px]">
                              Urgente disponible
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center flex-shrink-0">
                      <button
                        onClick={() => handleOpenEdit(srv)}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition"
                        title="Editar servicio"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar el servicio "${srv.nombre}"?`)) {
                            deleteService(srv.id);
                          }
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700 transition"
                        title="Eliminar servicio"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUBTAB 2: AGENDA SERVICIOS (CITAS AGENDADAS PRIVADAS)     */}
      {/* ========================================================= */}
      {activeSubTab === 'agenda' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Privacy Security Banner */}
          <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-teal-600 text-white shadow-md">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-teal-950 dark:text-teal-200">
                  Agenda de Citas Privada (Solo Visible en tu Panel Admin)
                </h4>
                <p className="text-[11px] text-teal-800 dark:text-teal-400">
                  Tus clientes nunca verán esta lista ni datos de otras personas en la página web pública.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-teal-200/60 dark:bg-teal-900 text-teal-900 dark:text-teal-200 text-[11px] font-black uppercase tracking-wider">
              🔒 100% Confidencial
            </span>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Total Citas</span>
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{totalBookings}</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase">Pendientes</span>
              <p className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">{pendingBookings}</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase">Confirmadas</span>
              <p className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400">{confirmedBookings}</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Atendidas</span>
              <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">{completedBookings}</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 shadow-sm space-y-1 col-span-2 sm:col-span-1">
              <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase">🚨 Urgentes</span>
              <p className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400">{urgentBookings}</p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={agendaSearch}
                  onChange={e => setAgendaSearch(e.target.value)}
                  placeholder="Buscar por cliente, teléfono, servicio o notas..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
                {agendaSearch && (
                  <button
                    onClick={() => setAgendaSearch('')}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Date quick filter */}
              <div className="flex items-center gap-1.5 self-start sm:self-auto w-full sm:w-auto">
                <button
                  onClick={() => setFechaFilter('todas')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    fechaFilter === 'todas'
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  Todas las Fechas
                </button>
                <button
                  onClick={() => setFechaFilter('hoy')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    fechaFilter === 'hoy'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  Hoy
                </button>
                <button
                  onClick={() => setFechaFilter('semana')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    fechaFilter === 'semana'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  Próximos 7 días
                </button>
              </div>
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 scrollbar-none">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 pl-1">
                <Filter className="w-3 h-3" /> Estado:
              </span>
              {(['todos', 'pendiente', 'confirmada', 'atendida', 'cancelada', 'urgentes'] as const).map(est => {
                const isSelected = estadoFilter === est;
                const labels: Record<string, string> = {
                  todos: 'Todas',
                  pendiente: '⏳ Pendientes',
                  confirmada: '📅 Confirmadas',
                  atendida: '✅ Atendidas',
                  cancelada: '❌ Canceladas',
                  urgentes: '🚨 Solo Urgentes',
                };
                return (
                  <button
                    key={est}
                    onClick={() => setEstadoFilter(est)}
                    className={`px-3 py-1 rounded-full text-xs font-black whitespace-nowrap transition ${
                      isSelected
                        ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {labels[est]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bookings List */}
          {filteredBookings.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-950 flex items-center justify-center mx-auto text-teal-600 dark:text-teal-400 shadow-inner">
                <CalendarDays className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {totalBookings === 0
                    ? 'No hay citas registradas en la agenda'
                    : 'No hay citas que coincidan con los filtros aplicados'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  {totalBookings === 0
                    ? 'Cuando tus clientes agenden citas desde tu tienda online, se guardarán aquí automáticamente para que puedas gestionarlas y escribirles por WhatsApp.'
                    : 'Intenta limpiar el buscador o seleccionar otro filtro de estado o fecha.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredBookings.map((booking) => {
                const whatsappMsg = `Hola *${booking.clienteNombre}*, te escribimos de *${store.nombre}* con relación a tu solicitud del servicio *${booking.servicioNombre}* para el día *${booking.fecha}* a las *${booking.hora}*. ¿Cómo estás?`;
                const whatsappUrl = `https://wa.me/57${booking.clienteTelefono.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMsg)}`;

                return (
                  <div
                    key={booking.id}
                    className={`p-5 rounded-3xl border transition shadow-sm bg-white dark:bg-slate-900 space-y-4 ${
                      booking.esUrgente 
                        ? 'border-rose-300 dark:border-rose-900/80 bg-rose-50/20 dark:bg-rose-950/10' 
                        : booking.estado === 'pendiente'
                          ? 'border-amber-300 dark:border-amber-900/60'
                          : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {/* Top Row: Date/Time + Urgency + Status Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold text-xs">
                          <Calendar className="w-3.5 h-3.5 text-teal-600" />
                          <span>{booking.fecha}</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold text-xs">
                          <Clock className="w-3.5 h-3.5 text-teal-600" />
                          <span>{booking.hora}</span>
                        </span>
                        {booking.esUrgente && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-rose-600 text-white shadow-md shadow-rose-600/30 animate-pulse">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>PRIORIDAD URGENTE</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        {getStatusBadge(booking.estado)}
                        <span className="text-[10px] text-slate-400">
                          Recibida: {new Date(booking.creadoEn).toLocaleDateString('es-CO')}
                        </span>
                      </div>
                    </div>

                    {/* Middle Row: Client info & Service details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Client Info */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                          Datos del Solicitante
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-teal-700 dark:text-teal-300 font-bold text-xs flex-shrink-0">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-slate-900 dark:text-white">
                              {booking.clienteNombre}
                            </h4>
                            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-emerald-600" />
                              <span>{booking.clienteTelefono}</span>
                            </p>
                          </div>
                        </div>

                        {booking.notas && (
                          <div className="mt-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
                            <strong className="text-slate-900 dark:text-white font-bold">Observaciones: </strong>
                            <span>{booking.notas}</span>
                          </div>
                        )}
                      </div>

                      {/* Service Details */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                          Servicio Solicitado
                        </span>
                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
                          <div className="space-y-0.5">
                            <h5 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                              {booking.servicioNombre}
                            </h5>
                            <p className="text-[11px] text-teal-600 dark:text-teal-400 font-bold">
                              {store.nombre}
                            </p>
                          </div>
                          <span className="p-2 rounded-xl bg-teal-600/10 text-teal-600 dark:text-teal-400">
                            <Sparkles className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row: Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                      {/* Change Status Dropdown */}
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-500">Cambiar estado:</label>
                        <select
                          value={booking.estado}
                          onChange={e => updateBookingStatus(booking.id, e.target.value as ServiceBooking['estado'])}
                          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        >
                          <option value="pendiente">⏳ Pendiente</option>
                          <option value="confirmada">📅 Confirmada</option>
                          <option value="atendida">✅ Atendida</option>
                          <option value="cancelada">❌ Cancelada</option>
                        </select>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Escribir por WhatsApp</span>
                        </a>

                        {booking.estado === 'pendiente' && (
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'confirmada')}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 transition shadow-sm"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Confirmar</span>
                          </button>
                        )}

                        {booking.estado === 'confirmada' && (
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'atendida')}
                            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 transition shadow-sm"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            <span>Marcar Atendida</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar la cita de "${booking.clienteNombre}"?`)) {
                              deleteBooking(booking.id);
                            }
                          }}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700 transition"
                          title="Eliminar cita"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
