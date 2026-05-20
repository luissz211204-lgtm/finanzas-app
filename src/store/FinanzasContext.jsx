import { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { loadState, saveState } from '../utils/db';
import { getWeekId, generateId, AHORRO_MAX_HIDDEN } from '../utils/helpers';

const FinanzasContext = createContext();

const initialState = {
  ingresos: [],
  gastos: [],
  deudas: [],
  metas: [],
  ahorro: { total: 0, desbloqueado: false, historial: [] },
  config: { pin: '', pinEnabled: false },
  currentWeekId: getWeekId(),
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD_STATE':
      return { ...state, ...action.payload, currentWeekId: getWeekId() };

    case 'ADD_INGRESO': {
      const ingreso = { id: generateId(), ...action.payload };
      return { ...state, ingresos: [...state.ingresos, ingreso] };
    }
    case 'EDIT_INGRESO':
      return {
        ...state,
        ingresos: state.ingresos.map((i) => (i.id === action.payload.id ? { ...i, ...action.payload } : i)),
      };
    case 'DELETE_INGRESO':
      return { ...state, ingresos: state.ingresos.filter((i) => i.id !== action.payload) };

    case 'ADD_GASTO': {
      const gasto = { id: generateId(), ...action.payload };
      return { ...state, gastos: [...state.gastos, gasto] };
    }
    case 'DELETE_GASTO':
      return { ...state, gastos: state.gastos.filter((g) => g.id !== action.payload) };

    case 'ADD_DEUDA': {
      const deuda = { id: generateId(), pagos: [], ...action.payload };
      return { ...state, deudas: [...state.deudas, deuda] };
    }
    case 'REGISTRAR_PAGO_DEUDA': {
      const { deudaId, monto, weekId, fecha } = action.payload;
      const pago = { id: generateId(), monto, weekId, fecha: fecha || new Date().toISOString() };
      return {
        ...state,
        deudas: state.deudas.map((d) => {
          if (d.id !== deudaId) return d;
          const saldoRestante = Math.max(0, Number(d.saldoRestante) - Number(monto));
          return { ...d, saldoRestante, pagos: [...(d.pagos || []), pago] };
        }),
      };
    }
    case 'DELETE_DEUDA':
      return { ...state, deudas: state.deudas.filter((d) => d.id !== action.payload) };
    case 'EDIT_DEUDA':
      return {
        ...state,
        deudas: state.deudas.map((d) => (d.id === action.payload.id ? { ...d, ...action.payload } : d)),
      };

    case 'ADD_META': {
      const meta = { id: generateId(), ...action.payload };
      return { ...state, metas: [...state.metas, meta] };
    }
    case 'UPDATE_META_PROGRESS':
      return {
        ...state,
        metas: state.metas.map((m) =>
          m.id === action.payload.id
            ? { ...m, ahorrado: Math.min(Number(m.costo), Number(action.payload.ahorrado)) }
            : m
        ),
      };
    case 'DELETE_META':
      return { ...state, metas: state.metas.filter((m) => m.id !== action.payload) };

    case 'AGREGAR_AHORRO': {
      const nuevoTotal = Number(state.ahorro.total) + Number(action.payload);
      const nuevoHistorial = [
        ...(state.ahorro.historial || []),
        { fecha: new Date().toISOString(), monto: Number(action.payload), weekId: getWeekId() },
      ];
      const desbloqueado = nuevoTotal >= AHORRO_MAX_HIDDEN;
      return {
        ...state,
        ahorro: {
          total: nuevoTotal,
          desbloqueado: desbloqueado || state.ahorro.desbloqueado,
          historial: nuevoHistorial,
        },
      };
    }
    case 'RETIRAR_AHORRO': {
      const restar = Math.min(Number(state.ahorro.total), Number(action.payload));
      return {
        ...state,
        ahorro: {
          ...state.ahorro,
          total: Number(state.ahorro.total) - restar,
        },
      };
    }

    case 'UPDATE_CONFIG':
      return { ...state, config: { ...state.config, ...action.payload } };

    default:
      return state;
  }
}

export function FinanzasProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [loaded, setLoaded] = useState(false);
  const [pinVerified, setPinVerified] = useState(!initialState.config.pinEnabled);

  useEffect(() => {
    loadState().then((saved) => {
      if (saved) {
        dispatch({ type: 'LOAD_STATE', payload: saved });
      }
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) {
      const timer = setTimeout(() => {
        saveState(state);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [state, loaded]);

  const value = { state, dispatch, loaded, pinVerified, setPinVerified };

  return <FinanzasContext.Provider value={value}>{children}</FinanzasContext.Provider>;
}

export function useFinanzas() {
  const context = useContext(FinanzasContext);
  if (!context) throw new Error('useFinanzas must be used within FinanzasProvider');
  return context;
}
