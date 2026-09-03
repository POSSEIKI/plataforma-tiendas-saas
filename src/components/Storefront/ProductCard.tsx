import React, { useState, useMemo } from 'react';
import { Plus, Minus, Check, ShoppingBag, Heart, Package, Sparkles } from 'lucide-react';
import { Product, ProductPresentationType } from '../../types';
import { formatCOP } from '../../utils/formatters';
import { useStore } from '../../context/StoreContext';

interface ProductCardProps {
  product: Product;
  onAddToCart: (
    product: Product, 
    quantity?: number, 
    options?: {
      presentacion?: string;
      presentacionLabel?: string;
      precioUnitario?: number;
      unidadesADescontar?: number;
    }
  ) => void;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onQuickView }) => {
  const { store, categories } = useStore();
  const isZenTemplate = store.plantilla === 'zen';
  const accent = isZenTemplate ? '#c67139' : (store.temaColor || '#059669');

  const [isFav, setIsFav] = useState(false);
  const [qty, setQty] = useState(1);

  // Multipliers & Available stock per presentation
  const cajaSize = product.contenidoCaja || 24;
  const blisterSize = product.contenidoBlister || 6;
  const cajaStock = Math.floor(product.stock / cajaSize);
  const blisterStock = Math.floor(product.stock / blisterSize);
  const unidadStock = product.stock;

  // 🔹 Fractionated Inventory Presentations ('CAJA' | 'BLISTER' | 'UNIDAD')
  // Automatically selects the highest available presentation with stock >= 1
  const [selectedPres, setSelectedPres] = useState<ProductPresentationType>(() => {
    if (product.manejaFracciones) {
      if (product.precioCaja && cajaStock >= 1) return 'CAJA';
      if (product.precioBlister && blisterStock >= 1) return 'BLISTER';
      if (product.precioUnidad && unidadStock >= 1) return 'UNIDAD';
      return 'CAJA';
    }
    return 'REGULAR';
  });

  const categoryName = categories.find(c => c.id === product.categoriaId)?.nombre || 'PRODUCTO';

  // Current active unit price and presentation label
  const { activePrice, activeLabel, maxAvailable, unidadesPorItem } = useMemo(() => {
    if (product.manejaFracciones) {
      if (selectedPres === 'CAJA') {
        return {
          activePrice: product.precioCaja || product.precio,
          activeLabel: `Caja x${cajaSize}`,
          maxAvailable: cajaStock,
          unidadesPorItem: cajaSize
        };
      }
      if (selectedPres === 'BLISTER') {
        return {
          activePrice: product.precioBlister || Math.round((product.precioCaja || product.precio) / 4),
          activeLabel: `Blíster x${blisterSize}`,
          maxAvailable: blisterStock,
          unidadesPorItem: blisterSize
        };
      }
      if (selectedPres === 'UNIDAD') {
        return {
          activePrice: product.precioUnidad || Math.round((product.precioCaja || product.precio) / cajaSize),
          activeLabel: `Pastilla individual`,
          maxAvailable: unidadStock,
          unidadesPorItem: 1
        };
      }
    }

    return {
      activePrice: product.precio,
      activeLabel: product.presentacion || (product.unidadMedida ? `1 ${product.unidadMedida}` : 'Unidad'),
      maxAvailable: product.stock,
      unidadesPorItem: 1
    };
  }, [product, selectedPres, cajaSize, blisterSize, cajaStock, blisterStock, unidadStock]);

  const isProductOutOfStock = product.stock <= 0;
  const isSelectionOutOfStock = isProductOutOfStock || maxAvailable <= 0;

  if (isProductOutOfStock && !store.visibilidadStock.mostrarAgotados) {
    return null;
  }

  const handleAdd = () => {
    onAddToCart(product, qty, {
      presentacion: product.manejaFracciones ? selectedPres : (product.presentacion || 'REGULAR'),
      presentacionLabel: activeLabel,
      precioUnitario: activePrice,
      unidadesADescontar: qty * unidadesPorItem
    });
  };

  return (
    <div className={`group backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-xl transition duration-300 flex flex-col justify-between overflow-hidden p-3.5 sm:p-4 space-y-3 ${
      isZenTemplate 
        ? 'bg-[#fcf8f2] dark:bg-[#251e18] border border-[#ebddc5] dark:border-[#3d2f26] hover:border-[#c67139]/50 dark:hover:border-[#c67139]/50' 
        : 'bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800'
    }`}>
      {/* Category Tag Top & Stock Badge */}
      <div>
        <div className="flex items-center justify-between gap-1">
          <span 
            style={isZenTemplate ? {} : { color: accent, backgroundColor: `${accent}18` }}
            className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg border ${
              isZenTemplate
                ? 'bg-[#7a8a5e]/15 text-[#7a8a5e] dark:bg-[#7a8a5e]/25 dark:text-[#a8bc8e] border-[#7a8a5e]/30'
                : 'border-current/10'
            }`}
          >
            {categoryName}
          </span>
          {isProductOutOfStock ? (
            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-900">
              Agotado
            </span>
          ) : product.manejaFracciones ? (
            <span className="text-[9px] font-black text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/60 px-2 py-0.5 rounded-md">
              ⚡ Fraccionable
            </span>
          ) : null}
        </div>

        {/* Product Image Clickable */}
        <div
          onClick={() => onQuickView && onQuickView(product)}
          className={`relative h-36 sm:h-40 my-2 rounded-xl overflow-hidden flex items-center justify-center cursor-pointer group-hover:scale-102 transition duration-300 ${
            isZenTemplate
              ? 'bg-[#f5ead8]/60 dark:bg-[#1b1511]'
              : 'bg-slate-50 dark:bg-slate-800/60'
          }`}
        >
          <img
            src={product.imagenUrl}
            alt={product.nombre}
            className="max-h-full max-w-full object-contain p-2 group-hover:scale-105 transition duration-500"
          />
        </div>

        {/* Titles and Subtitles */}
        <div className="space-y-1">
          <h3
            onClick={() => onQuickView && onQuickView(product)}
            className={`text-xs sm:text-sm font-black line-clamp-2 leading-tight cursor-pointer hover:opacity-80 transition ${
              isZenTemplate
                ? 'font-figtree text-[#201e1d] dark:text-[#f5ead8]'
                : 'text-slate-900 dark:text-white'
            }`}
          >
            {product.nombre}
          </h3>

          {/* Principle Active / Laboratory */}
          {(product.principioActivo || product.laboratorio) && (
            <p className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 truncate">
              {product.principioActivo && <span>💊 {product.principioActivo}</span>}
              {product.laboratorio && <span className="opacity-80"> · Lab: {product.laboratorio}</span>}
            </p>
          )}

          {product.descripcion && (
            <p className={`text-[11px] font-medium line-clamp-1 ${
              isZenTemplate
                ? 'text-[#6e5a4c] dark:text-[#bda896]'
                : 'text-slate-500 dark:text-slate-400'
            }`}>
              {product.descripcion}
            </p>
          )}
        </div>

        {/* 🔹 FRACTION SELECTOR CHIPS (CAJA / BLÍSTER / PASTILLA SUELTA) */}
        {product.manejaFracciones ? (
          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">
              Selecciona Presentación:
            </span>
            <div className="grid grid-cols-3 gap-1">
              {/* Opción Caja */}
              <button
                type="button"
                onClick={() => setSelectedPres('CAJA')}
                disabled={cajaStock === 0}
                className={`p-1.5 rounded-xl border text-center transition flex flex-col items-center justify-center cursor-pointer ${
                  selectedPres === 'CAJA'
                    ? isZenTemplate
                      ? 'bg-[#c67139]/15 border-2 border-[#c67139] text-[#c67139] dark:text-[#f5ead8] font-black shadow-xs'
                      : 'bg-emerald-50 dark:bg-emerald-950/50 border-2 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-black shadow-xs'
                    : cajaStock === 0
                      ? 'opacity-40 bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 cursor-not-allowed'
                      : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <span className="text-[10px] font-bold leading-tight">📦 Caja x{cajaSize}</span>
                <span className="text-[10px] font-black text-slate-900 dark:text-white mt-0.5">
                  {formatCOP(product.precioCaja || product.precio)}
                </span>
              </button>

              {/* Opción Blíster */}
              <button
                type="button"
                onClick={() => setSelectedPres('BLISTER')}
                disabled={blisterStock === 0}
                className={`p-1.5 rounded-xl border text-center transition flex flex-col items-center justify-center cursor-pointer ${
                  selectedPres === 'BLISTER'
                    ? isZenTemplate
                      ? 'bg-[#c67139]/15 border-2 border-[#c67139] text-[#c67139] dark:text-[#f5ead8] font-black shadow-xs'
                      : 'bg-emerald-50 dark:bg-emerald-950/50 border-2 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-black shadow-xs'
                    : blisterStock === 0
                      ? 'opacity-40 bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 cursor-not-allowed'
                      : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <span className="text-[10px] font-bold leading-tight">💊 Blíster x{blisterSize}</span>
                <span className="text-[10px] font-black text-slate-900 dark:text-white mt-0.5">
                  {formatCOP(product.precioBlister || Math.round((product.precioCaja || product.precio) / 4))}
                </span>
              </button>

              {/* Opción Pastilla / Unidad Suelta */}
              <button
                type="button"
                onClick={() => setSelectedPres('UNIDAD')}
                disabled={unidadStock === 0}
                className={`p-1.5 rounded-xl border text-center transition flex flex-col items-center justify-center cursor-pointer ${
                  selectedPres === 'UNIDAD'
                    ? isZenTemplate
                      ? 'bg-[#c67139]/15 border-2 border-[#c67139] text-[#c67139] dark:text-[#f5ead8] font-black shadow-xs'
                      : 'bg-emerald-50 dark:bg-emerald-950/50 border-2 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-black shadow-xs'
                    : unidadStock === 0
                      ? 'opacity-40 bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 cursor-not-allowed'
                      : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <span className="text-[10px] font-bold leading-tight">⚪ Pastilla</span>
                <span className="text-[10px] font-black text-slate-900 dark:text-white mt-0.5">
                  {formatCOP(product.precioUnidad || Math.round((product.precioCaja || product.precio) / cajaSize))}
                </span>
              </button>
            </div>

            {/* Disponibilidad calculada en vivo */}
            <div className="flex items-center justify-between text-[10px] font-bold pt-0.5">
              <span className="text-slate-400">Disponibilidad:</span>
              <span className={maxAvailable > 0 ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' : 'text-rose-500 font-extrabold'}>
                {selectedPres === 'CAJA' && `${cajaStock} Cajas`}
                {selectedPres === 'BLISTER' && `${blisterStock} Blísters`}
                {selectedPres === 'UNIDAD' && `${unidadStock} Pastillas`}
                {' '}({product.stock} un. base)
              </span>
            </div>
          </div>
        ) : (
          /* Producto Regular / Granel */
          <div className="mt-2 space-y-1">
            {product.presentacion && (
              <div className={`p-2 rounded-lg border flex items-center justify-between text-[10px] font-bold ${
                isZenTemplate
                  ? 'bg-[#ebddc5]/45 dark:bg-[#1d1612] border-[#e2d2ba] dark:border-[#382b22] text-[#4a392c] dark:text-[#d4c1ad]'
                  : 'bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}>
                <span>PRESENTACIÓN:</span>
                <span className={isZenTemplate ? 'text-[#7a8a5e] dark:text-[#a8bc8e]' : 'text-emerald-600 dark:text-emerald-400'}>
                  ✓ {product.presentacion}
                </span>
              </div>
            )}

            {/* Precio Box */}
            <div 
              style={isZenTemplate ? {} : { backgroundColor: `${accent}0c`, borderColor: `${accent}25` }}
              className={`p-2 rounded-lg border flex items-center justify-between ${
                isZenTemplate
                  ? 'bg-[#c67139]/10 border-[#c67139]/25 dark:bg-[#c67139]/20 dark:border-[#c67139]/40'
                  : ''
              }`}
            >
              <div className="flex items-baseline gap-1">
                <span className={`text-[10px] font-bold ${isZenTemplate ? 'text-[#6e5a4c] dark:text-[#bda896]' : 'text-slate-500'}`}>PRECIO:</span>
                <span className={`text-sm font-black ${isZenTemplate ? 'text-[#201e1d] dark:text-[#f5ead8]' : 'text-slate-900 dark:text-white'}`}>
                  {formatCOP(product.precio)}
                </span>
                {product.unidadMedida && product.unidadMedida !== 'UNIDAD' && (
                  <span className="text-[10px] text-slate-400 font-bold">/ {product.unidadMedida}</span>
                )}
              </div>
              <span 
                style={isZenTemplate ? {} : { color: accent }}
                className={`text-[10px] font-extrabold ${isZenTemplate ? 'text-[#7a8a5e] dark:text-[#a8bc8e]' : ''}`}
              >
                {product.stock > 0 ? `✓ ${product.stock} disp.` : 'Agotado'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Counter & Add Button & Heart */}
      <div className={`pt-2 flex items-center gap-1.5 border-t ${
        isZenTemplate ? 'border-[#ebddc5] dark:border-[#382b22]' : 'border-slate-100 dark:border-slate-800'
      }`}>
        {/* Counter */}
        <div className={`flex items-center border rounded-lg p-0.5 ${
          isZenTemplate
            ? 'bg-[#ebddc5]/50 dark:bg-[#2b211a] border-[#decca8] dark:border-[#45352a]'
            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
        }`}>
          <button
            type="button"
            onClick={() => setQty(Math.max(1, qty - 1))}
            className={`p-1 cursor-pointer ${isZenTemplate ? 'text-[#6e5a4c] hover:text-[#201e1d] dark:text-[#bda896] dark:hover:text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className={`px-1.5 text-xs font-bold ${isZenTemplate ? 'text-[#201e1d] dark:text-[#f5ead8]' : 'text-slate-900 dark:text-white'}`}>{qty}</span>
          <button
            type="button"
            onClick={() => setQty(qty + 1)}
            className={`p-1 cursor-pointer ${isZenTemplate ? 'text-[#6e5a4c] hover:text-[#201e1d] dark:text-[#bda896] dark:hover:text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        {/* Add Button */}
        <button
          type="button"
          onClick={handleAdd}
          disabled={isSelectionOutOfStock}
          style={!isSelectionOutOfStock ? { backgroundColor: accent } : {}}
          className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-black flex items-center justify-center gap-1 transition cursor-pointer ${
            isSelectionOutOfStock
              ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              : 'text-white shadow-md hover:brightness-110 active:scale-95'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>
            {isSelectionOutOfStock 
              ? (isProductOutOfStock ? 'Agotado' : 'Agotado en esta opción')
              : `Agregar (${formatCOP(activePrice * qty)})`}
          </span>
        </button>

        {/* Heart */}
        <button
          type="button"
          onClick={() => setIsFav(!isFav)}
          className={`p-2 rounded-lg border transition cursor-pointer ${
            isFav
              ? 'border-rose-300 bg-rose-50 dark:bg-rose-950 text-rose-500'
              : isZenTemplate
                ? 'border-[#decca8] dark:border-[#45352a] text-[#8c7764] hover:text-rose-500'
                : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
        </button>
      </div>
    </div>
  );
};

