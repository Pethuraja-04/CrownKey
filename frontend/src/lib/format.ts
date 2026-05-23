export const formatINR = (raw: string | number, listingType?: 'SALE' | 'RENT'): string => {
  const n = typeof raw === 'string' ? parseFloat(raw) : raw;
  if (!isFinite(n)) return '—';

  if (listingType === 'RENT') {
    return `₹${n.toLocaleString('en-IN')}/mo`;
  }
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
  return `₹${n.toLocaleString('en-IN')}`;
};

export const formatArea = (sqft: number) => `${sqft.toLocaleString('en-IN')} sq.ft`;

export const titleCaseType = (t: string) =>
  t.replace('_', ' ').toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase());

const ROOM_LABELS: Record<string, string> = {
  SINGLE: 'Single occupancy',
  DOUBLE: 'Double sharing',
  TRIPLE: 'Triple sharing',
  QUAD: 'Quad sharing',
  DORMITORY: 'Dormitory',
};
export const roomTypeLabel = (rt?: string | null) => (rt ? ROOM_LABELS[rt] || rt : '');

// Short form for compact card UI: "1 BHK" for normal homes, "Single" for PG.
export const occupancyShort = (p: { type: string; bedrooms: number; roomType?: string | null }) => {
  if (p.type === 'PG' && p.roomType) {
    const short: Record<string, string> = {
      SINGLE: 'Single', DOUBLE: 'Double', TRIPLE: 'Triple', QUAD: 'Quad', DORMITORY: 'Dorm',
    };
    return short[p.roomType] || p.roomType;
  }
  return p.bedrooms ? `${p.bedrooms} BHK` : '';
};

export const relativeTime = (iso: string) => {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const cn = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(' ');
