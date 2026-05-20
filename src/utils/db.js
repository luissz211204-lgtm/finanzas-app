import localforage from 'localforage';

const store = localforage.createInstance({
  name: 'finanzapp',
  storeName: 'finanzapp_data',
});

const DB_KEY = 'finanzapp_state';

const getDefaultState = () => ({
  ingresos: [],
  gastos: [],
  deudas: [],
  metas: [],
  ahorro: { total: 0, desbloqueado: false, historial: [] },
  config: { pin: '', pinEnabled: false },
  currentWeekId: getCurrentWeekId(),
});

function getCurrentWeekId() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
}

export async function loadState() {
  try {
    const saved = await store.getItem(DB_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      parsed.currentWeekId = getCurrentWeekId();
      return parsed;
    }
  } catch (e) {
    console.warn('Error loading state:', e);
  }
  return getDefaultState();
}

export async function saveState(state) {
  try {
    const toSave = { ...state, currentWeekId: getCurrentWeekId() };
    await store.setItem(DB_KEY, JSON.stringify(toSave));
    return true;
  } catch (e) {
    console.warn('Error saving state:', e);
    return false;
  }
}

export async function exportData(state) {
  const data = JSON.stringify(state, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `finanzapp-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);
        await saveState(data);
        resolve(data);
      } catch (err) {
        reject(new Error('Archivo JSON inválido'));
      }
    };
    reader.onerror = () => reject(new Error('Error al leer archivo'));
    reader.readAsText(file);
  });
}
