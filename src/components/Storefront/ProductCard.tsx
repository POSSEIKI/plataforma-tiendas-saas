import React, { useState } from 'react';
import { Plus, Minus, Check, ShoppingBag, Heart } from 'lucide-react';
import { Product } from '../../types';
import { formatCOP } from '../../utils/formatters';
import { useStore } from '../../context/StoreContext';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity?: number) => void;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onQuickView }) => {
  const { store, categories } = useStore();
  const [qty, setQty] = useState(1);
  const [isFav, setIsFav] = useState(false);
  const isOutOfStock = product.stock <= 0;

  const categoryName = categories.find(c => c.id === product.categoriaId)?.nombre || 'PRODUCTO';
  const isZenTemplate = store.plantilla === 'zen';
  const accent = isZenTemplate ? '#c67139' : (store.temaColor || '#059669');

  if (isOutOfStock && !store.visibilidadStock.mostrarAgotados) {
    return null;
  }

  return (
    <div className={`group backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-xl transition duration-300 flex flex-col justify-between overflow-hidden p-3.5 sm:p-4 space-y-3 ${
      isZenTemplate 
        ? 'bg-[#fcf8f2] dark:bg-[#251e18] border border-[#ebddc5] dark:border-[#3d2f26] hover:border-[#c67139]/50 dark:hover:border-[#c67139]/50' 
        : 'bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800'
    }`}>
      {/* Category Tag Top */}
      <div>
        <div className="flex items-center justify-between">
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
          {isOutOfStock && (
            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
              Agotado
            </span>
          )}
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
            className={`text-xs sm:text-sm font-black uppercase line-clamp-2 leading-tight cursor-pointer hover:opacity-80 transition ${
              isZenTemplate
                ? 'font-figtree text-[#201e1d] dark:text-[#f5ead8]'
                : 'text-slate-900 dark:text-white'
            }`}
          >
            {product.nombre}
          </h3>
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

        {/* Presentación Box */}
        {product.presentacion && (
          <div className={`mt-2 p-2 rounded-lg border flex items-center justify-between text-[10px] font-bold ${
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
          className={`mt-1.5 p-2 rounded-lg border flex items-center justify-between ${
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
          </div>
          <span 
            style={isZenTemplate ? {} : { color: accent }}
            className={`text-[10px] font-extrabold ${isZenTemplate ? 'text-[#7a8a5e] dark:text-[#a8bc8e]' : ''}`}
          >
            ✓ Disponible
          </span>
        </div>
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
            className={`p-1 ${isZenTemplate ? 'text-[#6e5a4c] hover:text-[#201e1d] dark:text-[#bda896] dark:hover:text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className={`px-1.5 text-xs font-bold ${isZenTemplate ? 'text-[#201e1d] dark:text-[#f5ead8]' : 'text-slate-900 dark:text-white'}`}>{qty}</span>
          <button
            type="button"
            onClick={() => setQty(qty + 1)}
            className={`p-1 ${isZenTemplate ? 'text-[#6e5a4c] hover:text-[#201e1d] dark:text-[#bda896] dark:hover:text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        {/* Add Button */}
        <button
          type="button"
          onClick={() => onAddToCart(product, qty)}
          disabled={isOutOfStock}
          style={!isOutOfStock ? { backgroundColor: accent } : {}}
          className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-black flex items-center justify-center gap-1 transition ${
            isOutOfStock
              ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              : 'text-white shadow-md hover:brightness-110 active:scale-95'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Agregar</span>
        </button>

        {/* Heart */}
        <button
          type="button"
          onClick={() => setIsFav(!isFav)}
          className={`p-2 rounded-lg border transition ${
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
