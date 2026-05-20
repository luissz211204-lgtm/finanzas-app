export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
};

export const formatDateShort = (date) => {
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(date));
};

export const getWeekId = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
};

export const getWeekRange = (weekId) => {
  const monday = new Date(weekId);
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  return { monday, sunday };
};

export const getMonthId = (date = new Date()) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export const daysBetween = (a, b) => {
  const diff = Math.abs(new Date(b) - new Date(a));
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const weeksBetween = (a, b) => {
  return Math.ceil(daysBetween(a, b) / 7);
};

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const groupBy = (arr, key) => {
  return arr.reduce((acc, item) => {
    const k = item[key];
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {});
};

export const sumBy = (arr, key) => {
  return arr.reduce((acc, item) => acc + (Number(item[key]) || 0), 0);
};

export const AHORRO_MAX_HIDDEN = 35000;
export const AHORRO_PHRASES = [
  'Ahorro creciendo',
  'Meta en progreso',
  'Sigue así',
  'Vas construyendo tu futuro',
  'Cada peso cuenta',
  'Disciplina financiera',
  'Esto es constancia',
  'Buen ritmo',
  'Sigue firme',
  'Tú puedes',
];

export const DEBT_PAYOFF_STRATEGIES = {
  avalanche: 'Avalancha',
  snowball: 'Bola de nieve',
};

export const CATEGORIAS_GASTOS = [
  { id: 'transporte', label: 'Transporte', icon: '🚌', color: '#f97316' },
  { id: 'comida', label: 'Comida', icon: '🍽️', color: '#10b981' },
  { id: 'cafe-snacks', label: 'Café / Snacks', icon: '☕', color: '#eab308' },
  { id: 'escuela', label: 'Escuela', icon: '📚', color: '#8b5cf6' },
  { id: 'herramientas', label: 'Herramientas', icon: '🔧', color: '#06b6d4' },
  { id: 'ocio', label: 'Ocio', icon: '🎮', color: '#ec4899' },
  { id: 'imprevistos', label: 'Imprevistos', icon: '⚠️', color: '#ef4444' },
  { id: 'otros', label: 'Otros', icon: '📦', color: '#71717a' },
];

export const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
