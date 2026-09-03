import { ColombianAddress } from '../types';

export const formatCOP = (amount: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const buildStandardColombianAddress = (addr: Partial<ColombianAddress>): string => {
  const via = addr.viaTipo || 'Calle';
  const num = addr.viaNumero ? `${addr.viaNumero}` : '';
  const letra = addr.viaLetraBis && addr.viaLetraBis !== '-' ? ` ${addr.viaLetraBis}` : '';
  const cruceTipo = addr.cruceTipo ? ` ${addr.cruceTipo}` : '';
  const cruceNum = addr.cruceNumero ? ` ${addr.cruceNumero}` : '';
  const cruceLetra = addr.cruceLetraBis && addr.cruceLetraBis !== '-' ? ` ${addr.cruceLetraBis}` : '';
  const placa = addr.placa ? ` - ${addr.placa}` : '';
  const barrio = addr.barrio ? `, ${addr.barrio}` : '';

  if (!num) return '';
  return `${via} ${num}${letra} #${cruceNum || ''}${cruceLetra}${placa}${barrio}`.trim();
};

export const formatRelativeTime = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch {
    return isoString;
  }
};
