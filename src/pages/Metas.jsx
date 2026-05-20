import { useState, useMemo } from 'react';
import { useFinanzas } from '../store/FinanzasContext';
import { formatCurrency, formatDate, getWeekId } from '../utils/helpers';
import Modal from '../components/Modal';
import ProgressBar from '../components/ProgressBar';
import { Plus, Trash2, Target, Car, Smartphone, Plane, Shield, Wrench } from 'lucide-react';

const META_ICONS = { celular: Smartphone, vacaciones: Plane, carro: Car, herramientas: Wrench, emergencia: Shield };

const META_OPTIONS = [
  { id: 'celular', label: 'Celular', icon: Smartphone },
  { id: 'vacaciones', label: 'Vacaciones', icon: Plane },
  { id: 'carro', label: 'Carro', icon: Car },
  { id: 'herramientas', label: 'Herramientas', icon: Wrench },
  { id: 'emergencia', label: 'Fondo de emergencia', icon: Shield },
  { id: 'otro', label: 'Otro', icon: Target },
];

export default function Metas() {
  const { state, dispatch } = useFinanzas();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ nombre: '', tipo: 'celular', costo: '', fechaDeseada: '' });

  const metas = state.metas;
  const { ingresos } = state;

  const metasConProgreso = useMemo(() => {
    return metas.map((m) => {
      const ahorrado = Number(m.ahorrado || 0);
      const costo = Number(m.costo);
      const pct = costo > 0 ? (ahorrado / costo) * 100 : 0;
      const restante = costo - ahorrado;
      const semanasRestantes = m.fechaDeseada
        ? Math.max(1, Math.ceil((new Date(m.fechaDeseada) - new Date()) / (7 * 86400000)))
        : 52;
      const sugerenciaSemanal = semanasRestantes > 0 ? restante / semanasRestantes : restante;
      return { ...m, ahorrado, costo, pct, restante, semanasRestantes, sugerenciaSemanal };
    });
  }, [metas]);

  const openNew = () => {
    const futuro = new Date();
    futuro.setMonth(futuro.getMonth() + 6);
    setForm({ nombre: '', tipo: 'celular', costo: '', fechaDeseada: futuro.toISOString().split('T')[0] });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const tipoInfo = META_OPTIONS.find((o) => o.id === form.tipo);
    dispatch({
      type: 'ADD_META',
      payload: {
        nombre: form.nombre || tipoInfo?.label || form.tipo,
        tipo: form.tipo,
        costo: Number(form.costo),
        fechaDeseada: form.fechaDeseada,
        ahorrado: 0,
      },
    });
    setModalOpen(false);
  };

  const updateAhorroMeta = (meta, monto) => {
    dispatch({
      type: 'UPDATE_META_PROGRESS',
      payload: { id: meta.id, ahorrado: monto },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-50">Metas</h1>
          <p className="text-sm text-dark-400">Tus objetivos financieros</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
        >
          <Plus size={16} /> Nueva meta
        </button>
      </div>

      {metasConProgreso.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Target size={40} className="text-dark-600 mb-3" />
          <p className="text-dark-400 text-sm">No tienes metas aún</p>
          <p className="text-dark-500 text-xs mt-1">Crea tu primera meta financiera</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {metasConProgreso.map((meta) => {
          const Icon = META_ICONS[meta.tipo] || Target;
          const completada = meta.pct >= 100;
          return (
            <div
              key={meta.id}
              className={`glass rounded-xl border p-4 transition-all ${
                completada ? 'border-green-500/30' : 'border-dark-600'
              } ${completada ? 'animate-pulse-glow' : ''}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    completada ? 'bg-green-500/20' : 'bg-dark-700'
                  }`}>
                    <Icon size={20} className={completada ? 'text-green-400' : 'text-cyan-400'} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-dark-50">{meta.nombre}</h3>
                    <p className="text-xs text-dark-400">
                      {completada ? '¡Completada!' : `${meta.semanasRestantes} semanas restantes`}
                    </p>
                  </div>
                </div>
                <button onClick={() => dispatch({ type: 'DELETE_META', payload: meta.id })} className="p-1 text-dark-400 hover:text-red-400"><Trash2 size={14} /></button>
              </div>

              <ProgressBar value={meta.ahorrado} max={meta.costo} color={completada ? 'green' : 'accent'} />

              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-dark-400">Meta</p>
                  <p className="font-semibold text-dark-100">{formatCurrency(meta.costo)}</p>
                </div>
                <div>
                  <p className="text-dark-400">Ahorrado</p>
                  <p className={`font-semibold ${completada ? 'text-green-400' : 'text-dark-100'}`}>{formatCurrency(meta.ahorrado)}</p>
                </div>
                <div>
                  <p className="text-dark-400">Sugerencia/sem</p>
                  <p className="font-semibold text-cyan-400">{formatCurrency(Math.round(meta.sugerenciaSemanal))}</p>
                </div>
              </div>

              {!completada && (
                <div className="mt-3 flex gap-2">
                  <input
                    type="number"
                    placeholder="Añadir ahorro"
                    className="flex-1 rounded-lg border border-dark-600 bg-dark-800 px-3 py-1.5 text-xs text-dark-50 outline-none focus:border-cyan-500/50"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = Number(e.target.value);
                        if (val > 0) updateAhorroMeta(meta, meta.ahorrado + val);
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nueva meta">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-dark-300 mb-1">Tipo de meta</label>
            <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              className="w-full rounded-lg border border-dark-600 bg-dark-800 px-3 py-2 text-sm text-dark-50 outline-none focus:border-cyan-500/50">
              {META_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-dark-300 mb-1">Nombre personalizado</label>
            <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Deja vacío para usar el nombre del tipo"
              className="w-full rounded-lg border border-dark-600 bg-dark-800 px-3 py-2 text-sm text-dark-50 outline-none focus:border-cyan-500/50" />
          </div>
          <div>
            <label className="block text-xs font-medium text-dark-300 mb-1">Costo objetivo ($)</label>
            <input type="number" value={form.costo} onChange={(e) => setForm({ ...form, costo: e.target.value })} required min="0"
              className="w-full rounded-lg border border-dark-600 bg-dark-800 px-3 py-2 text-sm text-dark-50 outline-none focus:border-cyan-500/50" />
          </div>
          <div>
            <label className="block text-xs font-medium text-dark-300 mb-1">Fecha deseada</label>
            <input type="date" value={form.fechaDeseada} onChange={(e) => setForm({ ...form, fechaDeseada: e.target.value })}
              className="w-full rounded-lg border border-dark-600 bg-dark-800 px-3 py-2 text-sm text-dark-50 outline-none focus:border-cyan-500/50" />
          </div>
          <button type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90">
            Crear meta
          </button>
        </form>
      </Modal>
    </div>
  );
}
