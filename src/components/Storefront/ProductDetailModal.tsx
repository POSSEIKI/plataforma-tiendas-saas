import React, { useState, useMemo } from 'react';
import { 
  X, 
  Plus, 
  Minus, 
  ShieldCheck, 
  Sparkles, 
  Bike, 
  MessageSquare, 
  Heart, 
  Check, 
  ShoppingBag,
  CreditCard,
  Package,
  Barcode
} from 'lucide-react';
import { Product, ProductPresentationType } from '../../types';
import { formatCOP } from '../../utils/formatters';
import { useStore } from '../../context/StoreContext';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (
    product: Product, 
    quantity: number,
    options?: {
      presentacion?: string;
      presentacionLabel?: string;
      precioUnitario?: number;
      unidadesADescontar?: number;
    }
  ) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const { store, categories } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [addedToast, setAddedToast] = useState(false);

  const [selectedPres, setSelectedPres] = useState<ProductPresentationType>(() => {
    if (product?.manejaFracciones) {
      if (product.precioCaja && product.stock >= (product.contenidoCaja || 24)) return 'CAJA';
      if (product.precioBlister && product.stock >= (product.contenidoBlister || 6)) return 'BLISTER';
      if (product.precioUnidad) return 'UNIDAD';
      return 'CAJA';
    }
    return 'REGULAR';
  });

  if (!isOpen || !product) return null;

  const isZenTemplate = store.plantilla === 'zen';
  const categoryName = categories.find(c => c.id === product.categoriaId)?.nombre || 'PRODUCTO';
  const accent = isZenTemplate ? '#c67139' : (store.temaColor || '#059669');

  // Multipliers
  const cajaSize = product.contenidoCaja || 24;
  const blisterSize = product.contenidoBlister || 6;

  // Stock per presentation
  const cajaStock = Math.floor(product.stock / cajaSize);
  const blisterStock = Math.floor(product.stock / blisterSize);
  const unidadStock = product.stock;

  // Active price, label, and availability
  const { activePrice, activeLabel, maxAvailable, unidadesPorItem, activeBarcode } = useMemo(() => {
    if (product.manejaFracciones) {
      if (selectedPres === 'CAJA') {
        return {
          activePrice: product.precioCaja || product.precio,
          activeLabel: `Caja x${cajaSize}`,
          maxAvailable: cajaStock,
          unidadesPorItem: cajaSize,
          activeBarcode: product.codigoBarras || product.codigo
        };
      }
      if (selectedPres === 'BLISTER') {
        return {
          activePrice: product.precioBlister || Math.round((product.precioCaja || product.precio) / 4),
          activeLabel: `Blíster x${blisterSize}`,
          maxAvailable: blisterStock,
          unidadesPorItem: blisterSize,
          activeBarcode: product.codigoBarrasBlister || product.codigoBarras || product.codigo
        };
      }
      if (selectedPres === 'UNIDAD') {
        return {
          activePrice: product.precioUnidad || Math.round((product.precioCaja || product.precio) / cajaSize),
          activeLabel: `Pastilla individual`,
          maxAvailable: unidadStock,
          unidadesPorItem: 1,
          activeBarcode: product.codigoBarrasUnidad || product.codigoBarras || product.codigo
        };
      }
    }

    return {
      activePrice: product.precio,
      activeLabel: product.presentacion || (product.unidadMedida ? `1 ${product.unidadMedida}` : 'Unidad'),
      maxAvailable: product.stock,
      unidadesPorItem: 1,
      activeBarcode: product.codigoBarras || product.codigo
    };
  }, [product, selectedPres, cajaSize, blisterSize, cajaStock, blisterStock, unidadStock]);

  const isOutOfStock = product.stock <= 0 || (product.manejaFracciones && maxAvailable <= 0);

  const handleAdd = () => {
    onAddToCart(product, quantity, {
      presentacion: product.manejaFracciones ? selectedPres : (product.presentacion || 'REGULAR'),
      presentacionLabel: activeLabel,
      precioUnitario: activePrice,
      unidadesADescontar: quantity * unidadesPorItem
    });
    setAddedToast(true);
    setTimeout(() => {
      setAddedToast(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-sm animate-fadeIn">
      {/* Added confirmation toast top floating */}
      {addedToast && (
        <div className="fixed top-6 z-50 px-5 py-2.5 rounded-full bg-slate-950 text-white font-extrabold text-xs shadow-2xl flex items-center gap-2 animate-bounce border border-slate-700">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>¡{product.nombre} ({activeLabel}) agregado al carrito!</span>
        </div>
      )}

      <div className={`relative max-w-xl w-full rounded-3xl p-5 sm:p-7 shadow-2xl border space-y-4 max-h-[92vh] overflow-y-auto transition-colors ${
        isZenTemplate
          ? 'bg-[#fcf8f2] dark:bg-[#201813] border-[#ebddc5] dark:border-[#3d2f26] text-[#201e1d] dark:text-[#f5ead8]'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100'
      }`}>
        {/* Top Tag & Close */}
        <div className="flex items-center justify-between">
          <span 
            style={isZenTemplate ? {} : { color: accent, backgroundColor: `${accent}18` }}
            className={`px-3 py-1 rounded-full font-extrabold text-[11px] border flex items-center gap-1.5 ${
              isZenTemplate
                ? 'bg-[#7a8a5e]/15 text-[#7a8a5e] dark:bg-[#7a8a5e]/25 dark:text-[#adc08f] border-[#7a8a5e]/30'
                : 'border-current/10'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
            <span>{categoryName}</span>
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Image */}
        <div className={`relative h-48 sm:h-56 rounded-2xl overflow-hidden flex items-center justify-center border ${
          isZenTemplate
            ? 'bg-[#f5ead8]/70 dark:bg-[#18130f] border-[#decca8] dark:border-[#382b22]'
            : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
        }`}>
          <img
            src={product.imagenUrl}
            alt={product.nombre}
            className="max-h-full max-w-full object-contain p-4 transition-transform hover:scale-105 duration-300"
          />
        </div>

        {/* Details */}
        <div className="space-y-3">
          <div>
            <h2 
              style={isZenTemplate ? { fontFamily: "'Caprasimo', serif" } : undefined}
              className={`text-lg sm:text-xl font-black leading-tight ${
                isZenTemplate ? 'font-caprasimo font-normal text-xl sm:text-2xl text-[#201e1d] dark:text-[#f5ead8]' : 'text-slate-900 dark:text-white'
              }`}
            >
              {product.nombre}
            </h2>

            {/* Principle Active / Laboratory Badges */}
            {(product.principioActivo || product.laboratorio) && (
              <div className="flex flex-wrap items-center gap-2 pt-1.5">
                {product.principioActivo && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    💊 {product.principioActivo}
                  </span>
                )}
                {product.laboratorio && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    🏢 Lab: {product.laboratorio}
                  </span>
                )}
              </div>
            )}

            <div className={`flex flex-wrap items-center gap-2 pt-1 text-xs font-medium ${
              isZenTemplate ? 'text-[#6e5a4c] dark:text-[#baa896]' : 'text-slate-500 dark:text-slate-400'
            }`}>
              <span className={`flex items-center gap-1 font-bold ${isZenTemplate ? 'text-[#7a8a5e] dark:text-[#adc08f]' : 'text-emerald-600 dark:text-emerald-400'}`}>
                <Check className="w-3.5 h-3.5" />
                <span>Calidad 100% Garantizada</span>
              </span>
              {activeBarcode && (
                <>
                  <span>·</span>
                  <span className="font-mono text-[11px] flex items-center gap-1">
                    <Barcode className="w-3 h-3 text-slate-400" />
                    <span>{activeBarcode}</span>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          {product.descripcion && (
            <p className={`text-xs leading-relaxed ${isZenTemplate ? 'text-[#6e5a4c] dark:text-[#baa896]' : 'text-slate-600 dark:text-slate-400'}`}>
              {product.descripcion}
            </p>
          )}

          {/* 🔹 FRACTION SELECTOR IN MODAL */}
          {product.manejaFracciones ? (
            <div className={`p-3.5 rounded-2xl border space-y-2.5 ${
              isZenTemplate
                ? 'bg-[#ebddc5]/40 dark:bg-[#251e18] border-[#decca8] dark:border-[#382b22]'
                : 'bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700'
            }`}>
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className={isZenTemplate ? 'text-[#4a392c] dark:text-[#d4c1ad]' : 'text-slate-700 dark:text-slate-300'}>
                  SELECCIONA LA PRESENTACIÓN DE COMPRA:
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px]">
                  Inventario Sincronizado
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* Caja Completa */}
                <button
                  type="button"
                  onClick={() => setSelectedPres('CAJA')}
                  disabled={cajaStock === 0}
                  className={`p-2.5 rounded-xl border-2 text-center transition flex flex-col items-center justify-center cursor-pointer ${
                    selectedPres === 'CAJA'
                      ? isZenTemplate
                        ? 'bg-[#fcf8f2] dark:bg-[#1d1612] border-[#c67139] shadow-sm'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-sm'
                      : cajaStock === 0
                        ? 'opacity-40 bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 cursor-not-allowed'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-bold">📦 Caja x{cajaSize}</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                    {formatCOP(product.precioCaja || product.precio)}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    {cajaStock > 0 ? `${cajaStock} disp.` : 'Agotada'}
                  </span>
                </button>

                {/* Blíster */}
                <button
                  type="button"
                  onClick={() => setSelectedPres('BLISTER')}
                  disabled={blisterStock === 0}
                  className={`p-2.5 rounded-xl border-2 text-center transition flex flex-col items-center justify-center cursor-pointer ${
                    selectedPres === 'BLISTER'
                      ? isZenTemplate
                        ? 'bg-[#fcf8f2] dark:bg-[#1d1612] border-[#c67139] shadow-sm'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-sm'
                      : blisterStock === 0
                        ? 'opacity-40 bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 cursor-not-allowed'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-bold">💊 Blíster x{blisterSize}</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                    {formatCOP(product.precioBlister || Math.round((product.precioCaja || product.precio) / 4))}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    {blisterStock > 0 ? `${blisterStock} disp.` : 'Agotado'}
                  </span>
                </button>

                {/* Pastilla Suelta */}
                <button
                  type="button"
                  onClick={() => setSelectedPres('UNIDAD')}
                  disabled={unidadStock === 0}
                  className={`p-2.5 rounded-xl border-2 text-center transition flex flex-col items-center justify-center cursor-pointer ${
                    selectedPres === 'UNIDAD'
                      ? isZenTemplate
                        ? 'bg-[#fcf8f2] dark:bg-[#1d1612] border-[#c67139] shadow-sm'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-sm'
                      : unidadStock === 0
                        ? 'opacity-40 bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 cursor-not-allowed'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-bold">⚪ Pastilla Suelta</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                    {formatCOP(product.precioUnidad || Math.round((product.precioCaja || product.precio) / cajaSize))}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    {unidadStock > 0 ? `${unidadStock} disp.` : 'Agotada'}
                  </span>
                </button>
              </div>

              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 pt-1 flex items-center justify-between">
                <span>Stock Base en Droguería:</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                  {product.stock} pastillas ({cajaStock} Cajas o {blisterStock} Blísters disponibles)
                </span>
              </div>
            </div>
          ) : (
            product.presentacion && (
              <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold ${
                isZenTemplate
                  ? 'bg-[#ebddc5]/40 dark:bg-[#251e18] border-[#decca8] dark:border-[#382b22]'
                  : 'bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700'
              }`}>
                <span>PRESENTACIÓN:</span>
                <span className={isZenTemplate ? 'text-[#7a8a5e] dark:text-[#adc08f]' : 'text-emerald-600 dark:text-emerald-400'}>
                  ✓ {product.presentacion}
                </span>
              </div>
            )
          )}

          {/* Price & Stock status */}
          <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
            isZenTemplate
              ? 'bg-[#c67139]/10 border-[#c67139]/25 dark:bg-[#c67139]/20 dark:border-[#c67139]/40'
              : 'bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800'
          }`}>
            <div>
              <span className={`text-[10px] font-bold block ${isZenTemplate ? 'text-[#6e5a4c] dark:text-[#baa896]' : 'text-slate-400'}`}>
                PRECIO {product.manejaFracciones ? `(${activeLabel})` : ''}:
              </span>
              <span className={`text-2xl font-black ${isZenTemplate ? 'text-[#201e1d] dark:text-[#f5ead8]' : 'text-slate-900 dark:text-white'}`}>
                {formatCOP(activePrice)}
              </span>
            </div>
            <span 
              style={{ backgroundColor: isZenTemplate ? '#7a8a5e' : accent }}
              className="px-3.5 py-1.5 rounded-xl text-white font-extrabold text-xs shadow-sm flex items-center gap-1"
            >
              <Check className="w-4 h-4" />
              <span>{maxAvailable > 0 ? `${maxAvailable} Disponibles` : 'Agotado'}</span>
            </span>
          </div>

          {/* 4 Universal Trust Badges */}
          <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold">
            <div className={`p-2 rounded-lg border flex items-center gap-2 ${
              isZenTemplate
                ? 'bg-white/60 dark:bg-[#231c16] border-[#decca8] dark:border-[#382b22] text-[#4a392c] dark:text-[#baa896]'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}>
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Garantía & Autenticidad</span>
            </div>
            <div className={`p-2 rounded-lg border flex items-center gap-2 ${
              isZenTemplate
                ? 'bg-white/60 dark:bg-[#231c16] border-[#decca8] dark:border-[#382b22] text-[#4a392c] dark:text-[#baa896]'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}>
              <Bike className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Despacho a Domicilio</span>
            </div>
          </div>
        </div>

        {/* Bottom Actions: Counter & Add Button & Favorite */}
        <div className={`pt-2 flex items-center gap-3 border-t ${isZenTemplate ? 'border-[#ebddc5] dark:border-[#382b22]' : 'border-slate-100 dark:border-slate-800'}`}>
          {/* Quantity Stepper */}
          <div className={`flex items-center border rounded-xl p-1 ${
            isZenTemplate
              ? 'bg-[#ebddc5]/50 dark:bg-[#251e18] border-[#decca8] dark:border-[#382b22]'
              : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
          }`}>
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-1.5 rounded-lg hover:opacity-75 cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className={`px-3 font-bold text-xs sm:text-sm ${isZenTemplate ? 'text-[#201e1d] dark:text-[#f5ead8]' : 'text-slate-900 dark:text-white'}`}>
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="p-1.5 rounded-lg hover:opacity-75 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add Button */}
          <button
            type="button"
            onClick={handleAdd}
            disabled={isOutOfStock}
            style={!isOutOfStock ? { backgroundColor: accent } : {}}
            className="flex-1 py-3 px-4 text-white font-extrabold rounded-xl text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 hover:brightness-110 active:scale-98 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Añadir al Pedido · {formatCOP(activePrice * quantity)}</span>
          </button>

          {/* Favorite Button */}
          <button
            type="button"
            onClick={() => setIsFavorite(!isFavorite)}
            className={`p-3 rounded-xl border transition ${
              isFavorite
                ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-600'
                : isZenTemplate
                  ? 'border-[#decca8] dark:border-[#382b22] text-[#6e5a4c] hover:text-rose-500'
                  : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};
