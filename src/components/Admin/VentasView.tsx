import React, { useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  CreditCard, 
  Download, 
  Bike, 
  Store as StoreIcon, 
  Calendar, 
  Award,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCOP } from '../../utils/formatters';

export const VentasView: React.FC = () => {
  const { orders, store } = useStore();
  const [timeFilter, setTimeFilter] = useState<'hoy' | 'semana' | 'mes' | 'todos'>('hoy');

  const todayISO = new Date().toISOString().split('T')[0];

  // Helper: get last 7 days labels and ISOs
  const getLast7Days = () => {
    const days = [];
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const name = i === 0 ? 'Hoy' : dayNames[d.getDay()];
      days.push({ iso, name, fullDate: d.toLocaleDateString('es-CO') });
    }
    return days;
  };

  const last7Days = getLast7Days();

  // Filter orders based on active time filter
  const filteredOrders = orders.filter(o => {
    if (o.estado === 'cancelado') return false;
    const orderISO = o.fechaISO || (o.fechaHora ? o.fechaHora.split('·')[1]?.trim() : '');
    
    if (timeFilter === 'hoy') {
      return orderISO === todayISO;
    }
    if (timeFilter === 'semana') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const isoThreshold = sevenDaysAgo.toISOString().split('T')[0];
      return orderISO >= isoThreshold;
    }
    if (timeFilter === 'mes') {
      const currentMonth = todayISO.slice(0, 7);
      return orderISO.startsWith(currentMonth);
    }
    return true; // 'todos'
  });

  // KPI Calculations
  const totalSold = filteredOrders.reduce((sum, o) => sum + o.total, 0);
  const salesCount = filteredOrders.length;

  const cashTotal = filteredOrders
    .filter(o => o.metodoPago === 'efectivo')
    .reduce((sum, o) => sum + o.total, 0);

  const transferTotal = filteredOrders
    .filter(o => o.metodoPago === 'nequi' || o.metodoPago === 'daviplata' || o.metodoPago === 'bancolombia')
    .reduce((sum, o) => sum + o.total, 0);

  const onlineTotal = filteredOrders
    .filter(o => o.metodoPago === 'wompi' || o.metodoPago === 'redeban')
    .reduce((sum, o) => sum + o.total, 0);

  // Dynamic Weekly Bar Chart Data
  const weeklyChartData = last7Days.map(day => {
    const dayOrders = orders.filter(o => {
      if (o.estado === 'cancelado') return false;
      const orderISO = o.fechaISO || (o.fechaHora ? o.fechaHora.split('·')[1]?.trim() : '');
      return orderISO === day.iso;
    });
    const dayTotal = dayOrders.reduce((sum, o) => sum + o.total, 0);
    return {
      ...day,
      total: dayTotal,
      count: dayOrders.length,
    };
  });

  const maxWeeklyVal = Math.max(...weeklyChartData.map(d => d.total), 1);

  // Dynamic Top Selling Products calculation
  const topProductsMap = new Map<string, { name: string; sold: number; revenue: number }>();

  orders.filter(o => o.estado !== 'cancelado').forEach(o => {
    o.items.forEach(item => {
      const current = topProductsMap.get(item.nombre) || { name: item.nombre, sold: 0, revenue: 0 };
      current.sold += item.cantidad;
      current.revenue += item.precio * item.cantidad;
      topProductsMap.set(item.nombre, current);
    });
  });

  const topProducts = Array.from(topProductsMap.values())
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5);

  const handleDownloadCSV = () => {
    if (filteredOrders.length === 0) {
      alert('No hay ventas registradas para exportar.');
      return;
    }
    const headers = 'Codigo,Cliente,Telefono,Fecha,MetodoPago,TipoEntrega,Total\n';
    const rows = filteredOrders.map(o => 
      `"${o.codigo}","${o.clienteNombre}","${o.clienteTelefono || ''}","${o.fechaHora}","${o.metodoPago}","${o.tipoEntrega}",${o.total}`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ventas_${store.slug}_${timeFilter}_${todayISO}.csv`;
    link.click();
  };

  const handleDownloadTXT = () => {
    if (filteredOrders.length === 0) {
      alert('No hay ventas registradas para exportar.');
      return;
    }
    let report = `REPORTE DE VENTAS - ${store.nombre.toUpperCase()}\n`;
    report += `Filtro: ${timeFilter.toUpperCase()} | Fecha Reporte: ${new Date().toLocaleString('es-CO')}\n`;
    report += `Total Ventas: ${formatCOP(totalSold)} (${salesCount} transacciones)\n`;
    report += `Efectivo: ${formatCOP(cashTotal)}\n`;
    report += `Transferencias (Nequi/Daviplata/Banco): ${formatCOP(transferTotal)}\n`;
    report += `Pasarela Online: ${formatCOP(onlineTotal)}\n`;
    report += `------------------------------------------------------------\n`;
    filteredOrders.forEach(o => {
      report += `${o.codigo} | ${o.clienteNombre} | ${o.fechaHora} | ${o.metodoPago.toUpperCase()} | ${formatCOP(o.total)}\n`;
    });

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte_ventas_${store.slug}_${todayISO}.txt`;
    link.click();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Panel de Ventas & Analítica
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Métricas financieras, medios de pago y rendimiento comercial en tiempo real
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Time Filter Pills */}
          <div className="p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center text-xs font-bold">
            <button
              onClick={() => setTimeFilter('hoy')}
              className={`px-3 py-1.5 rounded-lg transition ${
                timeFilter === 'hoy'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Hoy
            </button>
            <button
              onClick={() => setTimeFilter('semana')}
              className={`px-3 py-1.5 rounded-lg transition ${
                timeFilter === 'semana'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setTimeFilter('mes')}
              className={`px-3 py-1.5 rounded-lg transition ${
                timeFilter === 'mes'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Mes
            </button>
            <button
              onClick={() => setTimeFilter('todos')}
              className={`px-3 py-1.5 rounded-lg transition ${
                timeFilter === 'todos'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Histórico
            </button>
          </div>

          <button
            onClick={handleDownloadTXT}
            className="px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>TXT</span>
          </button>

          <button
            onClick={handleDownloadCSV}
            className="px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total vendido */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            TOTAL VENDIDO ({timeFilter.toUpperCase()})
          </span>
          <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatCOP(totalSold)}
          </div>
        </div>

        {/* Numero de ventas */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            NÚMERO DE VENTAS
          </span>
          <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            {salesCount}
          </div>
        </div>

        {/* Breakdown de Metodos de Pago */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">
            ¿CÓMO TE PAGARON?
          </span>
          <div className="space-y-1.5 text-xs font-semibold">
            <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
                <span>Efectivo</span>
              </span>
              <span className="font-bold text-slate-900 dark:text-white">{formatCOP(cashTotal)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-purple-500"></span>
                <span>Transferencias</span>
              </span>
              <span className="font-bold text-slate-900 dark:text-white">{formatCOP(transferTotal)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-blue-500"></span>
                <span>Pago online</span>
              </span>
              <span className="font-bold text-slate-900 dark:text-white">{formatCOP(onlineTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Weekly Chart & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Chart */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>📊</span>
              <span>¿Cuánto vendí esta semana?</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Últimos 7 días</span>
          </div>

          <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 px-2">
            {weeklyChartData.map((d, idx) => {
              const heightPercent = d.total > 0 ? Math.max(15, Math.round((d.total / maxWeeklyVal) * 100)) : 6;
              const isToday = idx === weeklyChartData.length - 1;

              return (
                <div key={d.iso} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-8 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-20">
                    {d.fullDate}: {formatCOP(d.total)} ({d.count} ventas)
                  </div>

                  <div className="w-full h-32 flex items-end justify-center">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full max-w-[34px] rounded-t-lg transition-all duration-500 ${
                        isToday
                          ? 'bg-blue-600 dark:bg-blue-500'
                          : d.total > 0
                          ? 'bg-slate-700 dark:bg-slate-600'
                          : 'bg-slate-200 dark:bg-slate-800/80'
                      }`}
                    />
                  </div>
                  <span className={`text-[11px] font-bold ${
                    isToday ? 'text-blue-600 dark:text-blue-400 font-extrabold' : 'text-slate-400'
                  }`}>
                    {d.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>🏆</span>
              <span>Lo más vendido</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Acumulado</span>
          </div>

          {topProducts.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400 space-y-2">
              <ShoppingBag className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
              <p>No hay ventas registradas aún</p>
              <p className="text-[10px]">A medida que se despachen productos aparecerá aquí el ranking de los más vendidos.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 dark:border-slate-800/60 last:border-0">
                  <div className="flex items-center gap-2.5 truncate max-w-[70%]">
                    <span className="font-mono text-[11px] text-slate-400 font-bold w-4">
                      {idx + 1}.
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white uppercase truncate">
                      {p.name}
                    </span>
                  </div>
                  <span className="font-black text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    — {p.sold} vendidos
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Historial de Transacciones */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Historial de ventas y transacciones ({filteredOrders.length})
        </h3>

        {filteredOrders.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 space-y-2">
            <Clock className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
            <p className="font-bold">No hay transacciones registradas en este período</p>
            <p className="text-[11px]">Las ventas realizadas desde la tienda pública o el botón "Simular Pedido" se registrarán automáticamente aquí.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold border-y border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Fecha / Hora</th>
                  <th className="py-3 px-4">Método de Pago</th>
                  <th className="py-3 px-4">Entrega</th>
                  <th className="py-3 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {order.codigo}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {order.clienteNombre}
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                      {order.fechaHora}
                    </td>
                    <td className="py-3 px-4 uppercase font-bold text-slate-700 dark:text-slate-300">
                      {order.metodoPago}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 capitalize">
                      {order.tipoEntrega}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-900 dark:text-white">
                      {formatCOP(order.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
