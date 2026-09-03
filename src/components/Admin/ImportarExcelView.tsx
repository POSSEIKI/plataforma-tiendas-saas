import React, { useState, useRef } from 'react';
import { 
  FileSpreadsheet, 
  UploadCloud, 
  Download, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Sparkles,
  ArrowRight,
  Layers,
  FileCheck2,
  SlidersHorizontal
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { excelReader, ParsedInventoryItem, InventoryReadResult, ColumnMapping } from '../../utils/excelReader';
import { formatCOP } from '../../utils/formatters';

export const ImportarExcelView: React.FC = () => {
  const { 
    products, 
    bulkImportCatalog, 
    store, 
    exportFullBackupJSON, 
    importFullBackupJSON,
    resetToCleanState
  } = useStore();

  const [dragActive, setDragActive] = useState(false);
  const [readResult, setReadResult] = useState<InventoryReadResult | null>(null);
  const [currentMapping, setCurrentMapping] = useState<ColumnMapping | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadCSV = () => {
    if (products.length === 0) {
      alert('Tu inventario está vacío. Primero agrega o importa productos.');
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
    link.download = `catalogo_${store.slug}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleDownloadBackupJSON = () => {
    const jsonStr = exportFullBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `copia_seguridad_${store.slug}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setStatusMessage(null);
    try {
      const result = await excelReader.readFile(file);
      setReadResult(result);
      setCurrentMapping(result.mapping);
      setStatusMessage({
        type: 'success',
        text: `✓ Se leyeron ${result.totalProductosValidos} productos válidos en formato ${result.formatoArchivo}.`
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Error leyendo el archivo. Asegúrate que sea .xlsx, .xls, .csv o .txt válido.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMappingChange = (field: keyof ColumnMapping, columnIndex: number) => {
    if (!readResult || !currentMapping) return;
    const newMapping = { ...currentMapping, [field]: columnIndex };
    setCurrentMapping(newMapping);

    const { productos, categoriasExtraidas } = excelReader.processRowsWithMapping(
      readResult.rawRows, 
      0, 
      newMapping
    );

    setReadResult({
      ...readResult,
      mapping: newMapping,
      productos,
      categoriasExtraidas,
      totalProductosValidos: productos.length,
    });
  };

  const handleConfirmImport = () => {
    if (readResult && readResult.productos.length > 0) {
      const { products: storeProducts, categories: storeCategories } = excelReader.toStoreProducts(readResult.productos);
      bulkImportCatalog(storeProducts, storeCategories);
      setReadResult(null);
      setCurrentMapping(null);
      setStatusMessage({
        type: 'success',
        text: `¡Catálogo cargado con éxito! Se cargaron ${storeProducts.length} productos y ${storeCategories.length} categorías en tu tienda.`
      });
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const handleBackupRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const success = importFullBackupJSON(text);
      if (success) {
        setStatusMessage({ type: 'success', text: '¡Copia de seguridad restaurada exitosamente!' });
      } else {
        setStatusMessage({ type: 'error', text: 'Archivo de copia de seguridad JSON corrupto o inválido.' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Lector & Importador de Inventario
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Lee automáticamente todas las filas y columnas de archivos Excel (.xlsx, .xls) o Texto (.txt, .csv) y crea las categorías
          </p>
        </div>

        <button
          onClick={() => {
            if (confirm('¿Deseas dejar la tienda completamente limpia y vacía?')) {
              resetToCleanState();
              setStatusMessage({ type: 'success', text: 'Tienda restablecida a plantilla limpia vacía.' });
            }
          }}
          className="px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center gap-1.5 hover:bg-rose-100 transition self-start sm:self-auto"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Vaciar / Dejar en Blanco</span>
        </button>
      </div>

      {/* Notification */}
      {statusMessage && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 text-xs sm:text-sm font-bold ${
          statusMessage.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
            : 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
        }`}>
          {statusMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Top Box: Exportar & Backup */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-emerald-600" />
              <span>Descargar Catálogo Completo & Copia de Seguridad</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Exporta tu base de datos actual con códigos de barra, marcas, categorías y stock.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold uppercase self-start sm:self-auto">
            {products.length} productos en tienda
          </span>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={handleDownloadCSV}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Descargar Excel / CSV</span>
          </button>

          <button
            onClick={handleDownloadBackupJSON}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition"
          >
            <Database className="w-4 h-4" />
            <span>Copia de Seguridad Completa (JSON)</span>
          </button>

          <input
            type="file"
            ref={backupInputRef}
            onChange={handleBackupRestore}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => backupInputRef.current?.click()}
            className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold rounded-xl text-xs flex items-center gap-2 transition"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Restaurar Copia JSON</span>
          </button>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".xlsx,.xls,.xlsm,.xlsb,.xml,.csv,.txt,.tsv,.prn"
        className="hidden"
      />

      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={async (e) => {
          e.preventDefault();
          setDragActive(false);
          const file = e.dataTransfer.files?.[0];
          if (file) await processFile(file);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`p-10 sm:p-14 rounded-3xl border-2 border-dashed text-center cursor-pointer transition flex flex-col items-center justify-center space-y-3 ${
          dragActive
            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
            : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500 bg-slate-50/50 dark:bg-slate-800/30'
        }`}
      >
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
          <UploadCloud className="w-8 h-8" />
        </div>
        <div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white">
            {isProcessing ? 'Leyendo archivo con ExcelReader...' : 'Arrastra tu archivo Excel (.xlsx, .xls) o Texto (.txt, .csv) aquí'}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Compatible con: <strong>Excel 97-2004 (.xls), Excel (.xlsx), Texto plano (.txt con |, ;, tab), CSV, Siigo, Alegra, POS</strong>
          </p>
        </div>
      </div>

      {/* Reader Results / Preview if loaded */}
      {readResult && currentMapping && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-fadeIn">
          {/* Header & Confirm Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Lector de Inventario Ejecutado
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 text-[10px] font-black">
                  {readResult.formatoArchivo}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
                Total Productos Válidos: {readResult.totalProductosValidos}
              </h3>
            </div>

            <button
              onClick={handleConfirmImport}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-xs shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition transform hover:-translate-y-0.5"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Cargar Todo el Catálogo y Categorías ({readResult.totalProductosValidos})</span>
            </button>
          </div>

          {/* Interactive Column Mapper */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
              <SlidersHorizontal className="w-4 h-4 text-blue-600" />
              <span>Mapeo Inteligente de Columnas (Puedes ajustar si tu archivo tiene otro orden):</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Nombre / Descripción:</label>
                <select
                  value={currentMapping.colNombre}
                  onChange={e => handleMappingChange('colNombre', Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-blue-600 dark:text-blue-400"
                >
                  {readResult.columnasDetectadas.map((col, idx) => (
                    <option key={idx} value={idx}>Col {idx}: {col || `Columna ${idx + 1}`}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Precio de Venta:</label>
                <select
                  value={currentMapping.colPrecio}
                  onChange={e => handleMappingChange('colPrecio', Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-emerald-600 dark:text-emerald-400"
                >
                  <option value={-1}>-- No asignar (0) --</option>
                  {readResult.columnasDetectadas.map((col, idx) => (
                    <option key={idx} value={idx}>Col {idx}: {col || `Columna ${idx + 1}`}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Existencia / Stock:</label>
                <select
                  value={currentMapping.colStock}
                  onChange={e => handleMappingChange('colStock', Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-purple-600 dark:text-purple-400"
                >
                  <option value={-1}>-- Por defecto (10) --</option>
                  {readResult.columnasDetectadas.map((col, idx) => (
                    <option key={idx} value={idx}>Col {idx}: {col || `Columna ${idx + 1}`}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Categoría / Grupo:</label>
                <select
                  value={currentMapping.colCategoria}
                  onChange={e => handleMappingChange('colCategoria', Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-amber-600 dark:text-amber-400"
                >
                  <option value={-1}>-- GENERAL --</option>
                  {readResult.columnasDetectadas.map((col, idx) => (
                    <option key={idx} value={idx}>Col {idx}: {col || `Columna ${idx + 1}`}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Código de Barras / Ref Interna:</label>
                <select
                  value={currentMapping.colCodigo}
                  onChange={e => handleMappingChange('colCodigo', Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-slate-700 dark:text-slate-300"
                >
                  <option value={-1}>-- Dejar en blanco --</option>
                  {readResult.columnasDetectadas.map((col, idx) => (
                    <option key={idx} value={idx}>Col {idx}: {col || `Columna ${idx + 1}`}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Marca / Laboratorio:</label>
                <select
                  value={currentMapping.colMarca}
                  onChange={e => handleMappingChange('colMarca', Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-slate-700 dark:text-slate-300"
                >
                  <option value={-1}>-- Ninguna --</option>
                  {readResult.columnasDetectadas.map((col, idx) => (
                    <option key={idx} value={idx}>Col {idx}: {col || `Columna ${idx + 1}`}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Presentación / Unidad:</label>
                <select
                  value={currentMapping.colPresentacion}
                  onChange={e => handleMappingChange('colPresentacion', Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-slate-700 dark:text-slate-300"
                >
                  <option value={-1}>-- UNIDAD --</option>
                  {readResult.columnasDetectadas.map((col, idx) => (
                    <option key={idx} value={idx}>Col {idx}: {col || `Columna ${idx + 1}`}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Extracted Categories Pills */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Categorías Detectadas Automáticamente ({readResult.categoriasExtraidas.length}):
            </span>
            <div className="flex flex-wrap gap-2">
              {readResult.categoriasExtraidas.map((cat, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-200 text-xs font-bold border border-blue-200 dark:border-blue-800"
                >
                  📁 {cat}
                </span>
              ))}
            </div>
          </div>

          {/* Sample Products Table (first 10) */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Previsualización de los Primeros 10 Productos:
            </span>

            <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden text-xs">
              <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 font-bold text-[11px] text-slate-600 dark:text-slate-400 grid grid-cols-12">
                <span className="col-span-1">Fila</span>
                <span className="col-span-4">Nombre / Producto</span>
                <span className="col-span-2">Código/EAN</span>
                <span className="col-span-2">Categoría</span>
                <span className="col-span-2 text-right">Precio</span>
                <span className="col-span-1 text-center">Stock</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-64 overflow-y-auto">
                {readResult.productos.slice(0, 10).map((p) => (
                  <div key={p.row_number} className="px-4 py-2.5 grid grid-cols-12 items-center">
                    <span className="col-span-1 font-mono text-slate-400">[{p.row_number}]</span>
                    <div className="col-span-4 font-bold text-slate-900 dark:text-white uppercase truncate">
                      {p.nombre}
                      {p.marca && <span className="text-[10px] text-slate-400 block font-normal">{p.marca}</span>}
                    </div>
                    <span className="col-span-2 font-mono text-slate-500 truncate">{p.codigo_barras || '-'}</span>
                    <span className="col-span-2 font-semibold text-blue-600 dark:text-blue-400 truncate">{p.categoria}</span>
                    <span className="col-span-2 text-right font-bold text-slate-900 dark:text-white">
                      {formatCOP(p.precio)}
                    </span>
                    <div className="col-span-1 text-center">
                      {p.tiene_inventario ? (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold text-[10px]">
                          {p.existencia_total}
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-bold text-[10px]">
                          0
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {readResult.totalProductosValidos > 10 && (
              <p className="text-[11px] text-slate-400 text-center">
                ... y {readResult.totalProductosValidos - 10} productos más listos para cargarse con sus nombres reales.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
