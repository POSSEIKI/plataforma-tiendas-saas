import React, { useState } from 'react';
import { 
  Tag, 
  Plus, 
  Trash2, 
  Edit3, 
  Package, 
  Sparkles, 
  UploadCloud, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const CategoriasView: React.FC = () => {
  const { 
    categories, 
    addCategory, 
    updateCategory,
    toggleCategoryStatus, 
    toggleAllCategories, 
    deleteCategory, 
    products, 
    setActiveAdminTab 
  } = useStore();

  const [nuevaCat, setNuevaCat] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'active' | 'inactive'>('all');
  
  // Inline editing state
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const activeCount = categories.filter(c => c.activo !== false).length;
  const inactiveCount = categories.length - activeCount;

  // Filtered categories
  const filteredCategories = categories.filter(cat => {
    const isActiva = cat.activo !== false;
    const matchesSearch = cat.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    if (filterMode === 'active') return isActiva;
    if (filterMode === 'inactive') return !isActiva;
    return true;
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (nuevaCat.trim()) {
      addCategory(nuevaCat.trim());
      setNuevaCat('');
    }
  };

  const handleStartEdit = (cat: { id: string; nombre: string }) => {
    setEditingCatId(cat.id);
    setEditingName(cat.nombre);
  };

  const handleSaveEdit = (id: string) => {
    if (editingName.trim()) {
      updateCategory(id, { nombre: editingName.trim().toUpperCase() });
    }
    setEditingCatId(null);
  };

  const handleCancelEdit = () => {
    setEditingCatId(null);
    setEditingName('');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Categorías de Productos
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Habilita o deshabilita la visibilidad de tus categorías en la tienda web de forma global o individual
          </p>
        </div>

        {/* Global Bulk Toggles */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => toggleAllCategories(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
              title="Habilitar todas las categorías para que sean visibles en la web"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Habilitar Todas</span>
            </button>

            <button
              type="button"
              onClick={() => toggleAllCategories(false)}
              className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer border border-slate-300 dark:border-slate-700"
              title="Deshabilitar todas las categorías (ocultar de la tienda web)"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>Deshabilitar Todas</span>
            </button>
          </div>
        )}
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <span className="text-[11px] font-bold text-slate-400 block uppercase">Total Categorías</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5 block">
            {categories.length}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 shadow-sm text-center">
          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 block uppercase">
            🟢 Habilitadas (Visibles)
          </span>
          <span className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-0.5 block">
            {activeCount}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 shadow-sm text-center">
          <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 block uppercase">
            🔴 Deshabilitadas (Ocultas)
          </span>
          <span className="text-xl sm:text-2xl font-black text-rose-700 dark:text-rose-300 mt-0.5 block">
            {inactiveCount}
          </span>
        </div>
      </div>

      {/* Add Category Form Card */}
      <form onSubmit={handleAdd} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
          Crear Nueva Categoría
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={nuevaCat}
            onChange={e => setNuevaCat(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none uppercase"
            placeholder="Ej: PRIMEROS AUXILIOS, ASEO PERSONAL, MEDICAMENTOS, VELAS..."
            required
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Agregar Categoría</span>
          </button>
        </div>
      </form>

      {/* Search & Filter Bar */}
      {categories.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar categoría..."
              className="w-full pl-9 pr-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filterMode === 'all'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              Todas ({categories.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('active')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filterMode === 'active'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              🟢 Habilitadas ({activeCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('inactive')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filterMode === 'inactive'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              🔴 Deshabilitadas ({inactiveCount})
            </button>
          </div>
        </div>
      )}

      {/* Categories Grid or Empty State */}
      {categories.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
            <Tag className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
            No tienes categorías creadas todavía
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Puedes agregar tus categorías manualmente arriba, o subir un archivo Excel de inventario y el sistema las creará automáticamente.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setActiveAdminTab('importar-excel')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 mx-auto transition cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Importar desde Excel</span>
            </button>
          </div>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
          No se encontraron categorías con el filtro seleccionado.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredCategories.map((cat) => {
            const count = products.filter(p => p.categoriaId === cat.id).length;
            const isActiva = cat.activo !== false;
            const isEditing = editingCatId === cat.id;

            return (
              <div
                key={cat.id}
                className={`p-4 sm:p-5 rounded-2xl border transition shadow-sm space-y-3 ${
                  isActiva
                    ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    : 'bg-slate-50/80 dark:bg-slate-900/60 border-dashed border-slate-300 dark:border-slate-800 opacity-80'
                }`}
              >
                {/* Top Row: Icon + Title/Edit + Actions */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold flex-shrink-0 ${
                      isActiva
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                    }`}>
                      <Tag className="w-5 h-5" />
                    </div>

                    {isEditing ? (
                      <div className="flex items-center gap-1.5 flex-1">
                        <input
                          type="text"
                          value={editingName}
                          onChange={e => setEditingName(e.target.value)}
                          className="px-2.5 py-1 text-xs font-bold uppercase rounded-lg border border-emerald-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white flex-1 focus:outline-none"
                          autoFocus
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleSaveEdit(cat.id);
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(cat.id)}
                          className="p-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
                          title="Guardar cambio"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="p-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 transition"
                          title="Cancelar"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="min-w-0">
                        <h4 className={`text-xs sm:text-sm font-extrabold uppercase truncate ${
                          isActiva ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 line-through'
                        }`}>
                          {cat.nombre}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {count} {count === 1 ? 'producto asociado' : 'productos asociados'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions: Edit & Delete */}
                  {!isEditing && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(cat)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                        title="Editar nombre de la categoría"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`¿Eliminar la categoría "${cat.nombre}"?`)) {
                            deleteCategory(cat.id);
                          }
                        }}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                        title="Eliminar categoría"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Bottom Row: State Toggle Switch & Status Description */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <span className={`text-[11px] font-bold flex items-center gap-1.5 ${
                    isActiva ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
                  }`}>
                    {isActiva ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>Visible en la tienda web</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                        <span>Oculta en la tienda web</span>
                      </>
                    )}
                  </span>

                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isActiva}
                      onChange={() => toggleCategoryStatus(cat.id)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
