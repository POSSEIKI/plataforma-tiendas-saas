import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  QrCode, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  Printer, 
  Sparkles, 
  Palette, 
  Image as ImageIcon, 
  Share2, 
  Store as StoreIcon,
  Phone,
  Clock,
  MapPin,
  X,
  FileDown,
  ChevronDown
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const StoreQRSection: React.FC = () => {
  const { store } = useStore();

  const [isOpen, setIsOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const printContentRef = useRef<HTMLDivElement | null>(null);

  const [copied, setCopied] = useState(false);
  const [qrColor, setQrColor] = useState('#0f172a');
  const [includeLogo, setIncludeLogo] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [printModalOpen, setPrintModalOpen] = useState(false);

  // Compute public store URL
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://mitienda.store';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const basePath = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  
  // Public URL that opens storefront
  const publicUrl = `${origin}${basePath}/?tienda=${store.slug || 'tienda'}`;
  const displayUrl = `${store.slug || 'mitienda'}.mitienda.store`;

  // Predefined QR color palettes
  const colorOptions = [
    { label: 'Negro Clásico', value: '#0f172a', bg: 'bg-slate-900' },
    { label: 'Esmeralda / Verde', value: '#059669', bg: 'bg-emerald-600' },
    { label: 'Terracota / Cálido', value: '#c67139', bg: 'bg-[#c67139]' },
    { label: 'Azul Profesional', value: '#2563eb', bg: 'bg-blue-600' },
    { label: 'Violeta / Boutique', value: '#7c3aed', bg: 'bg-purple-600' },
  ];

  // Generate QR Code on canvas reliably
  useEffect(() => {
    let isCancelled = false;

    const generateQR = async () => {
      const size = 600; // High-res canvas for crisp scanning
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;

      try {
        await QRCode.toCanvas(canvas, publicUrl, {
          width: size,
          margin: 2,
          color: {
            dark: qrColor,
            light: '#ffffff',
          },
          errorCorrectionLevel: 'H', // High error correction level (allows logo overlay)
        });

        const hasValidLogo = Boolean(store.logoUrl && store.logoUrl.trim().length > 0);

        // Overlay store logo in the center ONLY IF store.logoUrl is present and includeLogo is true
        if (includeLogo && hasValidLogo) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const logoImg = new Image();
            if (!store.logoUrl.startsWith('data:')) {
              logoImg.crossOrigin = 'anonymous';
            }
            logoImg.onload = () => {
              if (isCancelled) return;
              const center = size / 2;
              const logoBoxSize = size * 0.22; // 22% of QR code size
              const padding = 8;
              const halfBox = logoBoxSize / 2;

              // White background with smooth rounded corners for logo contrast
              ctx.save();
              ctx.fillStyle = '#ffffff';
              ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
              ctx.shadowBlur = 14;
              ctx.shadowOffsetX = 0;
              ctx.shadowOffsetY = 4;

              const radius = 16;
              ctx.beginPath();
              ctx.moveTo(center - halfBox - padding + radius, center - halfBox - padding);
              ctx.lineTo(center + halfBox + padding - radius, center - halfBox - padding);
              ctx.quadraticCurveTo(center + halfBox + padding, center - halfBox - padding, center + halfBox + padding, center - halfBox - padding + radius);
              ctx.lineTo(center + halfBox + padding, center + halfBox + padding - radius);
              ctx.quadraticCurveTo(center + halfBox + padding, center + halfBox + padding, center + halfBox + padding - radius, center + halfBox + padding);
              ctx.lineTo(center - halfBox - padding + radius, center + halfBox + padding);
              ctx.quadraticCurveTo(center - halfBox - padding, center + halfBox + padding, center - halfBox - padding, center + halfBox + padding - radius);
              ctx.lineTo(center - halfBox - padding, center - halfBox - padding + radius);
              ctx.quadraticCurveTo(center - halfBox - padding, center - halfBox - padding, center - halfBox - padding + radius, center - halfBox - padding);
              ctx.closePath();
              ctx.fill();
              ctx.restore();

              // Draw subtle inner border
              ctx.strokeStyle = '#cbd5e1';
              ctx.lineWidth = 2.5;
              ctx.stroke();

              // Draw image centered and scaled with clipped inner rounded box
              ctx.save();
              ctx.beginPath();
              const innerRadius = 12;
              ctx.moveTo(center - halfBox + innerRadius, center - halfBox);
              ctx.lineTo(center + halfBox - innerRadius, center - halfBox);
              ctx.quadraticCurveTo(center + halfBox, center - halfBox, center + halfBox, center - halfBox + innerRadius);
              ctx.lineTo(center + halfBox, center + halfBox - innerRadius);
              ctx.quadraticCurveTo(center + halfBox, center + halfBox, center + halfBox - innerRadius, center + halfBox);
              ctx.lineTo(center - halfBox + innerRadius, center + halfBox);
              ctx.quadraticCurveTo(center - halfBox, center + halfBox, center - halfBox, center + halfBox - innerRadius);
              ctx.lineTo(center - halfBox, center - halfBox + innerRadius);
              ctx.quadraticCurveTo(center - halfBox, center - halfBox, center - halfBox + innerRadius, center - halfBox);
              ctx.closePath();
              ctx.clip();

              ctx.drawImage(
                logoImg,
                center - halfBox,
                center - halfBox,
                logoBoxSize,
                logoBoxSize
              );
              ctx.restore();

              // Update data URL
              setQrDataUrl(canvas.toDataURL('image/png'));
            };
            logoImg.onerror = () => {
              if (isCancelled) return;
              // Fallback to clean QR without logo
              setQrDataUrl(canvas.toDataURL('image/png'));
            };
            logoImg.src = store.logoUrl;
          }
        } else {
          // No logo requested or no logoUrl: clean QR
          if (!isCancelled) {
            setQrDataUrl(canvas.toDataURL('image/png'));
          }
        }
      } catch (err) {
        console.error('Error generating QR Code:', err);
      }
    };

    generateQR();

    return () => {
      isCancelled = true;
    };
  }, [publicUrl, qrColor, includeLogo, store.logoUrl]);

  // Copy Store URL
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Download High-Res PNG
  const handleDownloadPNG = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    const safeName = (store.nombre || 'mi-tienda').toLowerCase().replace(/[^a-z0-9]/g, '-');
    link.download = `QR-${safeName}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  // Download SVG Vector
  const handleDownloadSVG = async () => {
    try {
      const svgString = await QRCode.toString(publicUrl, {
        type: 'svg',
        margin: 2,
        color: {
          dark: qrColor,
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      });

      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const safeName = (store.nombre || 'mi-tienda').toLowerCase().replace(/[^a-z0-9]/g, '-');
      link.download = `QR-${safeName}.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading SVG:', err);
    }
  };

  // Trigger Native Print Dialog for Poster
  const handlePrintPoster = () => {
    window.print();
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all">
      {/* Collapsible Bar Header */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 sm:p-6 cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition select-none"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 flex-shrink-0">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Código QR de Tu Tienda Online</span>
                <span className="text-slate-400 font-normal">&gt;</span>
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                Para Clientes
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Descarga en PNG/SVG, personaliza colores e imprime afiches y habladores para tu local comercial.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setPrintModalOpen(true);
            }}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Hablador Imprimible</span>
          </button>

          <div className={`p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main Grid: QR Display + Controls */}
      {isOpen && (
        <div className="p-5 sm:p-7 pt-4 sm:pt-4 border-t border-slate-100 dark:border-slate-800 animate-fadeIn space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Column: QR Card & Live Canvas */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 text-center space-y-4">
              <div className="p-4 bg-white rounded-2xl shadow-lg border border-slate-200/80 relative group">
                {/* Hidden High-Res Canvas */}
                <canvas ref={canvasRef} className="hidden" />

            {/* Displayed Image */}
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`Código QR ${store.nombre}`}
                className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-xl"
              />
            ) : (
              <div className="w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center bg-slate-100 rounded-xl">
                <QrCode className="w-12 h-12 text-slate-400 animate-pulse" />
              </div>
            )}

            <div className="mt-2 text-center">
              <span className="text-[10px] font-black tracking-widest text-slate-400">
                {store.nombre} · Escanea y Pide
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              Escaneable con cualquier smartphone
            </p>
            <p className="text-[11px] text-slate-400">
              Abre el catálogo público de tu tienda directamente sin necesidad de instalar apps.
            </p>
          </div>
        </div>

        {/* Right Column: Customization & Download Options */}
        <div className="lg:col-span-7 space-y-5">
          {/* Public Store URL Display & Copy */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Enlace Web Oficial de tu Tienda
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-mono text-slate-900 dark:text-white truncate">
                {publicUrl}
              </div>
              <button
                type="button"
                onClick={handleCopyUrl}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition border border-slate-200 dark:border-slate-700 flex-shrink-0 cursor-pointer"
                title="Copiar enlace al portapapeles"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-600 font-extrabold">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
              <a
                href={publicUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-800 transition flex-shrink-0"
                title="Abrir tienda en nueva pestaña"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Color Picker & Logo in Center Toggle */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3.5">
            <div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-emerald-600" />
                <span>Color del Código QR</span>
              </span>
              <div className="flex items-center gap-2 pt-2 flex-wrap">
                {colorOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setQrColor(opt.value)}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                      qrColor === opt.value
                        ? 'border-emerald-600 ring-2 ring-emerald-500/20 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-white'
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full ${opt.bg}`}></span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Logo in Center Switch */}
            {store.logoUrl ? (
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Incluir Logo de {store.nombre} en el centro del QR
                  </span>
                </div>
                <input
                  type="checkbox"
                  id="qr-include-logo"
                  checked={includeLogo}
                  onChange={e => setIncludeLogo(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                />
              </div>
            ) : (
              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700 text-[11px] text-slate-400 flex items-center gap-2">
                <ImageIcon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span>Sin logo cargado. El código QR se genera limpio en alta resolución. Si cargas el logo de tu negocio en "Información de mi negocio", se integrará automáticamente en el centro.</span>
              </div>
            )}
          </div>

          {/* Action Buttons: Download Options */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleDownloadPNG}
              className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 active:scale-98 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Imagen PNG (Alta Calidad)</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadSVG}
              className="py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
              title="Formato vectorial para imprentas o diseñadores gráficos"
            >
              <FileDown className="w-4 h-4" />
              <span>SVG Vectorial</span>
            </button>
          </div>

          {/* Use Suggestions Banner */}
          <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60 text-xs text-teal-900 dark:text-teal-200 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <strong className="font-extrabold">💡 Ideas para usar tu código QR:</strong>
              <p className="text-[11px] text-teal-800 dark:text-teal-300 leading-relaxed">
                Colócalo en un hablador acrílico en tu mostrador o mesas, agrégalo a tus bolsas de entrega o envíalo por WhatsApp para que tus clientes guarden tu tienda en su pantalla de inicio.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )}

      {/* ========================================================= */}
      {/* MODAL: AFICHE / HABLADOR DE MESA IMPRIMIBLE               */}
      {/* ========================================================= */}
      {printModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative max-w-2xl w-full bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 max-h-[92vh] overflow-y-auto">
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 print:hidden">
              <div className="flex items-center gap-2.5">
                <Printer className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Afiche / Hablador de Mostrador Imprimible
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPrintModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Poster Preview Content (Printable Sheet) */}
            <div 
              ref={printContentRef}
              id="printable-poster-area"
              className="p-8 sm:p-10 rounded-3xl border-4 border-dashed border-emerald-600/30 bg-gradient-to-b from-emerald-50/40 via-white to-slate-50 text-center space-y-6 shadow-inner text-slate-900"
            >
              {/* Poster Header */}
              <div className="space-y-2">
                {store.logoUrl ? (
                  <img
                    src={store.logoUrl}
                    alt={store.nombre}
                    className="h-16 mx-auto object-contain drop-shadow-sm"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto font-black text-xl shadow-md">
                    {store.nombre.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                  {store.nombre}
                </h1>
                {store.slogan && (
                  <p className="text-xs sm:text-sm font-semibold text-slate-600 italic max-w-md mx-auto">
                    "{store.slogan}"
                  </p>
                )}
              </div>

              {/* Poster CTA Banner */}
              <div className="py-2 px-6 rounded-2xl bg-emerald-600 text-white inline-block shadow-md">
                <span className="text-sm sm:text-base font-extrabold uppercase tracking-wider">
                  ¡Escanea y Haz Tu Pedido Aquí! 📲
                </span>
              </div>

              {/* Poster Big QR Code */}
              <div className="p-5 bg-white rounded-3xl shadow-xl inline-block border-2 border-slate-200">
                {qrDataUrl && (
                  <img
                    src={qrDataUrl}
                    alt={`QR de ${store.nombre}`}
                    className="w-56 h-56 sm:w-64 sm:h-64 object-contain mx-auto"
                  />
                )}
                <p className="mt-2 text-xs font-mono font-bold text-slate-600">
                  {displayUrl}
                </p>
              </div>

              {/* Poster 3 Value Steps */}
              <div className="grid grid-cols-3 gap-3 text-center pt-2 max-w-lg mx-auto">
                <div className="p-2.5 rounded-xl bg-white/80 border border-slate-200/80 shadow-xs space-y-1">
                  <span className="text-lg">📷</span>
                  <p className="text-[11px] font-black text-slate-900">1. Escanea</p>
                  <p className="text-[10px] text-slate-500">Con la cámara de tu celular</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/80 border border-slate-200/80 shadow-xs space-y-1">
                  <span className="text-lg">🛒</span>
                  <p className="text-[11px] font-black text-slate-900">2. Elige</p>
                  <p className="text-[10px] text-slate-500">Tus productos favoritos</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/80 border border-slate-200/80 shadow-xs space-y-1">
                  <span className="text-lg">💬</span>
                  <p className="text-[11px] font-black text-slate-900">3. Pide</p>
                  <p className="text-[10px] text-slate-500">Directo por WhatsApp</p>
                </div>
              </div>

              {/* Poster Footer Info */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-2">
                <div className="flex items-center gap-1.5 font-bold">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp: {store.whatsapp}</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    {store.horarios.abierto24Horas
                      ? 'Abierto 24 Horas'
                      : `${store.horarios.horaApertura} - ${store.horarios.horaCierre}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Bottom Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 print:hidden">
              <span className="text-xs text-slate-500">
                Tip: En la ventana de impresión, selecciona <strong>"Guardar como PDF"</strong> o envía a tu impresora en tamaño Carta o A4.
              </span>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setPrintModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex-1 sm:flex-none cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={handlePrintPoster}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 flex-1 sm:flex-none transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir / Guardar Afiche PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
