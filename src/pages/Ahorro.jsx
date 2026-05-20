import { useState, useMemo } from 'react';
import { useFinanzas } from '../store/FinanzasContext';
import { formatCurrency, AHORRO_MAX_HIDDEN, AHORRO_PHRASES } from '../utils/helpers';
import ProgressBar from '../components/ProgressBar';
import Modal from '../components/Modal';
import { PiggyBank, Lock, Unlock, Trophy, Plus, ArrowUp, Sparkles } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Ahorro() {
  const { state, dispatch } = useFinanzas();
  const [modalOpen, setModalOpen] = useState(false);
  const [retiroModal, setRetiroModal] = useState(false);
  const [monto, setMonto] = useState('');
  const [retiroMonto, setRetiroMonto] = useState('');

  const ahorro = state.ahorro;
  const total = Number(ahorro.total) || 0;
  const desbloqueado = ahorro.desbloqueado || total >= AHORRO_MAX_HIDDEN;

  const historial = ahorro.historial || [];
  const historialAgrupado = useMemo(() => {
    const weeks = {};
    historial.forEach((h) => {
      if (!weeks[h.weekId]) weeks[h.weekId] = { week: h.weekId, monto: 0 };
      weeks[h.weekId].monto += Number(h.monto);
    });
    return Object.values(weeks).sort((a, b) => a.week.localeCompare(b.week));
  }, [historial]);

  const pct = Math.min(100, (total / AHORRO_MAX_HIDDEN) * 100);
  const randomPhrase = useMemo(() => AHORRO_PHRASES[Math.floor(Math.random() * AHORRO_PHRASES.length)], []);

  const handleAgregar = (e) => {
    e.preventDefault();
    if (Number(monto) <= 0) return;
    const newTotal = total + Number(monto);
    const willUnlock = newTotal >= AHORRO_MAX_HIDDEN && !desbloqueado;
    dispatch({ type: 'AGREGAR_AHORRO', payload: Number(monto) });
    setMonto('');
    setModalOpen(false);
    if (willUnlock) {
      setTimeout(() => {
        alert('🎉 ¡Felicidades! Has alcanzado los $35,000 MXN de ahorro. Tu progreso ahora es visible.');
      }, 300);
    }
  };

  const handleRetirar = (e) => {
    e.preventDefault();
    if (Number(retiroMonto) <= 0 || Number(retiroMonto) > total) return;
    dispatch({ type: 'RETIRAR_AHORRO', payload: Number(retiroMonto) });
    setRetiroMonto('');
    setRetiroModal(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-dark-50">Ahorro</h1>
        <p className="text-sm text-dark-400">Tu ahorro seguro, sin distracciones</p>
      </div>

      <div className={`glass rounded-xl border p-6 text-center ${desbloqueado ? 'border-cyan-500/30 animate-pulse-glow' : 'border-dark-600'}`}>
        {desbloqueado ? (
          <div className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/20">
              <Unlock size={28} className="text-cyan-400" />
            </div>
            <h2 className="text-xl font-bold text-cyan-400">Ahorro desbloqueado</h2>
            <p className="text-4xl font-extrabold text-dark-50">{formatCurrency(total)}</p>
            <ProgressBar value={total} max={AHORRO_MAX_HIDDEN * 2} color="accent" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-dark-700 to-dark-800 border border-dark-600">
              <Lock size={28} className="text-dark-400" />
            </div>
            <h2 className="text-xl font-bold text-dark-200">{randomPhrase}</h2>
            <div className="mx-auto max-w-xs">
              <ProgressBar value={total} max={AHORRO_MAX_HIDDEN} color="accent" showValue={false} />
            </div>
            <p className="text-xs text-dark-500">El monto se mostrará al alcanzar {formatCurrency(AHORRO_MAX_HIDDEN)}</p>
          </div>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <button onClick={() => setModalOpen(true)}
          className="glass rounded-xl border border-dark-600 p-4 text-left transition-all hover:border-cyan-500/30 hover:bg-dark-800/50">
          <Plus size={20} className="text-cyan-400 mb-2" />
          <p className="text-sm font-medium text-dark-200">Agregar ahorro</p>
        </button>
        <button onClick={() => setRetiroModal(true)}
          className="glass rounded-xl border border-dark-600 p-4 text-left transition-all hover:border-orange-500/30 hover:bg-dark-800/50">
          <ArrowUp size={20} className="text-orange-400 mb-2" />
          <p className="text-sm font-medium text-dark-200">Retirar</p>
        </button>
        <div className="glass rounded-xl border border-dark-600 p-4">
          <Sparkles size={20} className="text-yellow-400 mb-2" />
          <p className="text-sm font-medium text-dark-200">Racha</p>
          <p className="text-xs text-dark-400">{historial.length} aportaciones</p>
        </div>
        <div className="glass rounded-xl border border-dark-600 p-4">
          <Trophy size={20} className="text-purple-400 mb-2" />
          <p className="text-sm font-medium text-dark-200">Meta ${formatCurrency(AHORRO_MAX_HIDDEN)}</p>
          <p className="text-xs text-dark-400">{pct.toFixed(0)}% completado</p>
        </div>
      </div>

      {historialAgrupado.length > 0 && (
        <div className="glass rounded-xl border border-dark-600 p-4">
          <h3 className="text-sm font-semibold text-dark-200 mb-4">Historial semanal</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={historialAgrupado}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2f2f35" />
              <XAxis dataKey="week" tick={{ fill: '#71717a', fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fill: '#71717a', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: '#1a1a1e', border: '1px solid #2f2f35', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#d4d4d8' }}
                formatter={(v) => formatCurrency(v)}
              />
              <Line type="monotone" dataKey="monto" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Agregar ahorro" size="sm">
        <form onSubmit={handleAgregar} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-dark-300 mb-1">¿Cuánto quieres ahorrar?</label>
            <input type="number" value={monto} onChange={(e) => setMonto(e.target.value)} required min="1"
              className="w-full rounded-lg border border-dark-600 bg-dark-800 px-3 py-2 text-sm text-dark-50 outline-none focus:border-cyan-500/50" autoFocus />
          </div>
          <p className="text-xs text-dark-400">
            {desbloqueado
              ? `Total actual: ${formatCurrency(total)}`
              : 'El monto total se mantiene oculto hasta alcanzar la meta'}
          </p>
          <button type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90">
            Ahorrar
          </button>
        </form>
      </Modal>

      <Modal open={retiroModal} onClose={() => setRetiroModal(false)} title="Retirar ahorro" size="sm">
        <form onSubmit={handleRetirar} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-dark-300 mb-1">¿Cuánto quieres retirar?</label>
            <input type="number" value={retiroMonto} onChange={(e) => setRetiroMonto(e.target.value)} required min="1" max={total}
              className="w-full rounded-lg border border-dark-600 bg-dark-800 px-3 py-2 text-sm text-dark-50 outline-none focus:border-orange-500/50" autoFocus />
          </div>
          <p className="text-xs text-dark-400">Disponible: {formatCurrency(total)}</p>
          <button type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-red-600 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90">
            Retirar
          </button>
        </form>
      </Modal>
    </div>
  );
}
