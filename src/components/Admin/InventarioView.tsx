import React, { useState, useRef, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  FileSpreadsheet, 
  AlertTriangle, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  Eye,
  EyeOff,
  Sparkles,
  UploadCloud,
  Camera,
  CheckCircle2
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import { formatCOP } from '../../utils/formatters';

export const InventarioView: React.FC = () => {
  const { 
    products, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    categories, 
    store, 
    updateStore,
    setActiveAdminTab 
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState<'todos' | 'con_stock' | 'sin_stock'>('todos');
  const [sortBy, setSortBy] = useState<'defecto' | 'precio_menor' | 'precio_mayor' | 'stock_menor'>('defecto');
  const [showAlertsMinimized, setShowAlertsMinimized] = useState(false);

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: 10000,
    precioAnterior: 0,
    stock: 10,
    codigoBarras: '',
    categoriaId: categories[0]?.id || 'cat-general',
    presentacion: 'UNIDAD',
    imagenUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&q=80',
    activo: true,
  });

  // Low stock and out of stock items
  const outOfStockItems = products.filter(p => p.stock <= 2);

  // Filtered & sorted products
  const filteredProducts = products
    .filter(p => {
      const matchSearch = 
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.codigoBarras && p.codigoBarras.includes(searchTerm)) ||
        (p.presentacion && p.presentacion.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchSearch) return false;

      if (stockFilter === 'con_stock') return p.stock > 0;
      if (stockFilter === 'sin_stock') return p.stock <= 0;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'precio_menor') return a.precio - b.precio;
      if (sortBy === 'precio_mayor') return b.precio - a.precio;
      if (sortBy === 'stock_menor') return a.stock - b.stock;
      return 0;
    });

  // 10 Products Pagination
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page to 1 when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, stockFilter, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredProducts.length);
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const handleOpenAdd = () => {
    setEditingProductId(null);
    setShowUrlInput(false);
    setUploadMessage(null);
    setFormData({
      nombre: '',
      descripcion: '',
      precio: 10000,
      precioAnterior: 0,
      stock: 10,
      codigoBarras: '770' + Math.floor(100000000 + Math.random() * 900000000),
      categoriaId: categories[0]?.id || 'cat-general',
      presentacion: 'UNIDAD',
      imagenUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&q=80',
      activo: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProductId(prod.id);
    setShowUrlInput(false);
    setUploadMessage(null);
    setFormData({
      nombre: prod.nombre,
      descripcion: prod.descripcion || '',
      precio: prod.precio,
      precioAnterior: prod.precioAnterior || 0,
      stock: prod.stock,
      codigoBarras: prod.codigoBarras || '',
      categoriaId: prod.categoriaId,
      presentacion: prod.presentacion,
      imagenUrl: prod.imagenUrl,
      activo: prod.activo,
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
      setUploadMessage('✓ Imagen del producto cargada con éxito desde tu dispositivo');
      setTimeout(() => setUploadMessage(null), 3500);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProductId) {
      updateProduct(editingProductId, {
        nombre: formData.nombre.toUpperCase(),
        descripcion: formData.descripcion,
        precio: Number(formData.precio),
        precioAnterior: Number(formData.precioAnterior) || undefined,
        stock: Number(formData.stock),
        codigoBarras: formData.codigoBarras,
        categoriaId: formData.categoriaId,
        presentacion: formData.presentacion.toUpperCase(),
        imagenUrl: formData.imagenUrl,
        activo: formData.activo,
      });
    } else {
      addProduct({
        nombre: formData.nombre.toUpperCase(),
        descripcion: formData.descripcion,
        precio: Number(formData.precio),
        precioAnterior: Number(formData.precioAnterior) || undefined,
        stock: Number(formData.stock),
        codigoBarras: formData.codigoBarras,
        categoriaId: formData.categoriaId,
        presentacion: formData.presentacion.toUpperCase(),
        imagenUrl: formData.imagenUrl,
        activo: formData.activo,
      });
    }
    setModalOpen(false);
  };

  const handleExportCSV = () => {
    if (products.length === 0) {
      alert('Tu inventario está vacío.');
      return;
    }
    const headers = 'ID,Nombre,Presentacion,Precio,Stock,CodigoBarras,Activo\n';
    const rows = products.map(p => 
      `"${p.id}","${p.nombre}","${p.presentacion}",${p.precio},${p.stock},"${p.codigoBarras || ''}",${p.activo}`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventario_${store.slug}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-fadeIn">
          <div className="relative max-w-lg w-full bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-600" />
                <span>{editingProductId ? 'Editar Producto' : 'Agregar Nuevo Producto'}</span>
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="py-4 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre del Producto
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white uppercase font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Ej: PRODUCTO EJEMPLO 500G"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Precio de Venta ($ COP)
                  </label>
                  <input
                    type="number"
                    value={formData.precio}
                    onChange={e => setFormData({ ...formData, precio: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Stock Disponible
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Presentación
                  </label>
                  <input
                    type="text"
                    value={formData.presentacion}
                    onChange={e => setFormData({ ...formData, presentacion: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="UNIDAD, FRASCO, CAJA"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Categoría
                  </label>
                  <select
                    value={formData.categoriaId}
                    onChange={e => setFormData({ ...formData, categoriaId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {categories.length > 0 ? (
                      categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                      ))
                    ) : (
                      <option value="cat-general">GENERAL</option>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Código de Barras / SKU (Opcional)
                </label>
                <input
                  type="text"
                  value={formData.codigoBarras}
                  onChange={e => setFormData({ ...formData, codigoBarras: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  placeholder="770123456789"
                />
              </div>

              {/* Imagen del Producto - Carga Directa desde PC o Celular */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  Imagen del Producto
                </label>

                {/* Input File Oculto */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageFileUpload}
                  className="hidden"
                />

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
                  id="prod-activo"
                  checked={formData.activo}
                  onChange={e => setFormData({ ...formData, activo: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <label htmlFor="prod-activo" className="font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                  Producto activo y visible en la tienda online
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
                  {editingProductId ? 'Guardar Cambios' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
          Inventario
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Control de existencias, precios y visibilidad de productos
        </p>
      </div>

      {/* Low stock alerts (only if exists) */}
      {outOfStockItems.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Alertas de Stock Bajo / Agotados</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 text-[11px] font-extrabold">
                {outOfStockItems.length} productos
              </span>
            </div>
            <button
              onClick={() => setShowAlertsMinimized(!showAlertsMinimized)}
              className="text-xs font-bold text-amber-800 dark:text-amber-300 hover:underline flex items-center gap-1"
            >
              <span>{showAlertsMinimized ? 'Expandir' : 'Minimizar'}</span>
              {showAlertsMinimized ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>

          {!showAlertsMinimized && (
            <div className="space-y-2 pt-1 max-h-48 overflow-y-auto">
              {outOfStockItems.map(item => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between gap-3 text-xs"
                >
                  <span className="font-bold text-slate-900 dark:text-white uppercase">{item.nombre}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    item.stock === 0
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    {item.stock === 0 ? '🔴 Agotado (0)' : `⚠️ Quedan ${item.stock}`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Top Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 transition shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Exportar Excel / CSV</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('importar-excel')}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 flex items-center gap-1.5 transition shadow-sm"
          >
            <UploadCloud className="w-3.5 h-3.5 text-emerald-600" />
            <span>Importar Archivo Excel/POS</span>
          </button>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition transform hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          <span>+ Agregar producto</span>
        </button>
      </div>

      {/* Visibility Controls */}
      <div className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-600" />
            <span>Visibilidad de Inventario en la Web Pública</span>
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Controla cómo ven los clientes tus productos y existencias online
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-700 dark:text-slate-300">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={store.visibilidadStock.mostrarAgotados}
              onChange={e => updateStore({
                visibilidadStock: {
                  ...store.visibilidadStock,
                  mostrarAgotados: e.target.checked,
                }
              })}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span>Mostrar productos sin stock</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={store.visibilidadStock.mostrarCantidadesNumericas}
              onChange={e => updateStore({
                visibilidadStock: {
                  ...store.visibilidadStock,
                  mostrarCantidadesNumericas: e.target.checked,
                }
              })}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span>Mostrar cantidades numéricas</span>
          </label>
        </div>
      </div>

      {/* Product List or Clean Empty State */}
      {products.length === 0 ? (
        <div className="p-12 sm:p-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
            <Package className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Tu inventario está listo y esperando productos
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Puedes cargar tu catálogo completo desde un archivo Excel (.xlsx, .csv) o agregar tus productos manualmente uno por uno.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setActiveAdminTab('importar-excel')}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Importar Archivo Excel (.xlsx / .csv)</span>
            </button>

            <button
              onClick={handleOpenAdd}
              className="px-5 py-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Producto Manual</span>
            </button>
          </div>
        </div>
      ) : (
        /* Products Table */
        <div className="space-y-3">
          {/* Search bar & filter pills */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-sm"
              placeholder="Buscar producto por nombre, marca, código o categoría..."
            />
          </div>

          <div className="space-y-2.5">
            {paginatedProducts.map(prod => (
              <div
                key={prod.id}
                className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-wrap items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3.5 min-w-[240px]">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700">
                    <img src={prod.imagenUrl} alt={prod.nombre} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase">
                        {prod.nombre}
                      </h4>
                      {!prod.activo && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                          inactivo
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">
                      · {prod.presentacion} · {categories.find(c => c.id === prod.categoriaId)?.nombre || 'General'}
                    </p>
                  </div>
                </div>

                <div>
                  {prod.stock === 0 ? (
                    <span className="px-2.5 py-1 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-[11px] font-bold border border-rose-200 dark:border-rose-800">
                      ❌ Agotado
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold border border-emerald-200 dark:border-emerald-800">
                      ✅ {prod.stock} en stock
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {formatCOP(prod.precio)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={prod.activo}
                    onChange={e => updateProduct(prod.id, { activo: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                    title="Activar / Desactivar visibilidad en la web"
                  />

                  <button
                    onClick={() => handleOpenEdit(prod)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    title="Editar producto"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar producto ${prod.nombre}?`)) {
                        deleteProduct(prod.id);
                      }
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                    title="Eliminar producto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls Footer */}
          {filteredProducts.length > 0 && (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-slate-500 dark:text-slate-400 font-medium text-center sm:text-left">
                Mostrando <strong className="text-slate-900 dark:text-white font-bold">{startIndex + 1} - {endIndex}</strong> de <strong className="text-slate-900 dark:text-white font-bold">{filteredProducts.length}</strong> productos
                {totalPages > 1 && (
                  <span className="text-slate-400 ml-1.5">(Página {safeCurrentPage} de {totalPages})</span>
                )}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                  {/* First Page Button */}
                  <button
                    type="button"
                    onClick={() => setCurrentPage(1)}
                    disabled={safeCurrentPage === 1}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                    title="Primera página"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>

                  {/* Previous Page Button */}
                  <button
                    type="button"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={safeCurrentPage === 1}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Anterior</span>
                  </button>

                  {/* Numbered Page Buttons */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        if (totalPages <= 7) return true;
                        if (page === 1 || page === totalPages) return true;
                        if (Math.abs(page - safeCurrentPage) <= 1) return true;
                        return false;
                      })
                      .map((page, index, arr) => {
                        const prevPage = arr[index - 1];
                        const showEllipsis = prevPage && page - prevPage > 1;
                        return (
                          <React.Fragment key={page}>
                            {showEllipsis && (
                              <span className="px-1 text-slate-400 font-bold select-none">...</span>
                            )}
                            <button
                              type="button"
                              onClick={() => setCurrentPage(page)}
                              className={`w-8 h-8 rounded-xl font-bold text-xs transition cursor-pointer ${
                                safeCurrentPage === page
                                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                                  : 'border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                              }`}
                            >
                              {page}
                            </button>
                          </React.Fragment>
                        );
                      })}
                  </div>

                  {/* Next Page Button */}
                  <button
                    type="button"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={safeCurrentPage === totalPages}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer"
                  >
                    <span className="hidden sm:inline">Siguiente</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {/* Last Page Button */}
                  <button
                    type="button"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={safeCurrentPage === totalPages}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                    title="Última página"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
