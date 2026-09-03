import React, { useState, useRef } from 'react';
import { 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  X, 
  CheckCircle2, 
  UploadCloud, 
  Camera, 
  Link, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Banner } from '../../types';

export const BannersView: React.FC = () => {
  const { banners, addBanner, updateBanner, deleteBanner } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    titulo: '',
    subtitulo: '',
    imagenUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1200&q=80',
    textoBoton: 'Ver Ofertas',
    enlace: '#catalogo',
    activo: true,
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setShowUrlInput(false);
    setUploadMessage(null);
    setFormData({
      titulo: 'Nueva Promoción de Temporada',
      subtitulo: 'Aprovecha descuentos exclusivos por tiempo limitado.',
      imagenUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1200&q=80',
      textoBoton: 'Comprar Ahora',
      enlace: '#catalogo',
      activo: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (ban: Banner) => {
    setEditingId(ban.id);
    setShowUrlInput(false);
    setUploadMessage(null);
    setFormData({
      titulo: ban.titulo,
      subtitulo: ban.subtitulo || '',
      imagenUrl: ban.imagenUrl,
      textoBoton: ban.textoBoton || 'Ver Más',
      enlace: ban.enlace || '#catalogo',
      activo: ban.activo,
    });
    setModalOpen(true);
  };

  // Image Upload Handler from PC or Mobile Phone
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
      setUploadMessage('✓ Imagen de banner cargada exitosamente');
      setTimeout(() => setUploadMessage(null), 3500);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateBanner(editingId, formData);
    } else {
      addBanner(formData);
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Modal Crear / Editar Banner */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="relative max-w-lg w-full bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-emerald-600" />
                <span>{editingId ? 'Editar Banner' : 'Crear Nuevo Banner'}</span>
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              {/* Título */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Título del Banner
                </label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Ej: Gran Promoción de Temporada"
                  required
                />
              </div>

              {/* Subtítulo */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subtítulo / Descripción
                </label>
                <input
                  type="text"
                  value={formData.subtitulo}
                  onChange={e => setFormData({ ...formData, subtitulo: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Ej: Aprovecha descuentos exclusivos por tiempo limitado."
                />
              </div>

              {/* Imagen del Banner - Carga Directa desde Celular o PC */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">
                    Imagen de Fondo del Banner
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Link className="w-3 h-3" />
                    <span>{showUrlInput ? 'Ocultar URL' : 'O usar URL externa'}</span>
                  </button>
                </div>

                {/* Input de archivo nativo oculto (Funciona en PC y Celular) */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageFileUpload}
                  className="hidden"
                />

                {/* Caja de Carga de Imagen */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-98 transition cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Cargar Imagen desde PC o Celular</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 text-center">
                    Formatos: JPG, PNG, WebP (Recomendado 1200×500 px) · Máx 5 MB
                  </p>

                  {uploadMessage && (
                    <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-1.5 animate-fadeIn">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{uploadMessage}</span>
                    </div>
                  )}

                  {/* Campo de URL opcional desplegable */}
                  {showUrlInput && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1">
                      <label className="block text-[11px] font-bold text-slate-500">
                        O pega una URL directa de imagen:
                      </label>
                      <input
                        type="url"
                        value={formData.imagenUrl}
                        onChange={e => setFormData({ ...formData, imagenUrl: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        placeholder="https://..."
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Botón y Enlace */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Texto del Botón
                  </label>
                  <input
                    type="text"
                    value={formData.textoBoton}
                    onChange={e => setFormData({ ...formData, textoBoton: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
                    placeholder="Ej: Comprar Ahora"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Enlace / Destino
                  </label>
                  <input
                    type="text"
                    value={formData.enlace}
                    onChange={e => setFormData({ ...formData, enlace: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                    placeholder="Ej: #catalogo"
                  />
                </div>
              </div>

              {/* Vista Previa en Vivo del Banner */}
              <div className="pt-1">
                <span className="block text-[11px] font-bold text-slate-500 mb-1.5">
                  Vista Previa en Tiempo Real:
                </span>
                <div className="relative h-32 rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-700 bg-slate-950 flex items-center">
                  <img 
                    src={formData.imagenUrl} 
                    alt="Preview" 
                    className="w-full h-full object-cover opacity-60" 
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1200&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-transparent p-4 flex flex-col justify-center text-white">
                    <h4 className="font-black text-sm sm:text-base leading-tight drop-shadow-sm">
                      {formData.titulo || 'Título del Banner'}
                    </h4>
                    <p className="text-[11px] text-slate-200 line-clamp-1 mt-0.5">
                      {formData.subtitulo || 'Subtítulo o descripción'}
                    </p>
                    {formData.textoBoton && (
                      <div className="mt-2">
                        <span className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-lg text-[10px] inline-flex items-center gap-1 shadow-sm">
                          <span>{formData.textoBoton}</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="pt-3 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/25 cursor-pointer"
                >
                  Guardar Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header Principal */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
          Banners de publicidad
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Los banners que aparecen en el carrusel principal de tu tienda web
        </p>
      </div>

      {/* Contenedor de Banners */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Tus banners</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Puedes cargar banners desde tu celular o computadora. Cada banner rota automáticamente en el carrusel con su imagen, texto y botón de acción.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nuevo banner</span>
          </button>
        </div>

        {/* Lista de Banners */}
        {banners.length === 0 ? (
          <div className="p-10 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center mx-auto">
              <ImageIcon className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">No tienes banners activos</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Crea tu primer banner publicitario para destacar promociones, novedades o productos estrella en la cabecera de tu tienda.
            </p>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Primer Banner</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className="p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition"
              >
                {/* Thumbnail & Title */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-24 sm:w-32 h-14 sm:h-16 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-200 dark:bg-slate-800 flex-shrink-0">
                    <img 
                      src={banner.imagenUrl} 
                      alt={banner.titulo} 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&q=80';
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                      {banner.titulo}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate hidden sm:block">
                      {banner.subtitulo || 'Sin subtítulo'} · Botón: "{banner.textoBoton}"
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleOpenEdit(banner)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                    title="Editar banner"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar este banner?`)) {
                        deleteBanner(banner.id);
                      }
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                    title="Eliminar banner"
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
  );
};
