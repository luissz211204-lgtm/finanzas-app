import { useState, useMemo } from 'react';
import { useFinanzas } from '../store/FinanzasContext';
import { formatCurrency, formatDate, getWeekId, CATEGORIAS_GASTOS } from '../utils/helpers';
import Modal from '../components/Modal';
import { Plus, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Gastos() {
  const { state, dispatch } = useFinanzas();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ fecha: '', categoria: 'comida', monto: '', descripcion: '' });

  const weekId = state.currentWeekId;
  const gastos = state.gastos;

  const weekGastos = useMemo(() => gastos.filter((g) => g.weekId === weekId), [gastos, weekId]);
  const totalSemana = useMemo(() => weekGastos.reduce((s, g) => s + Number(g.monto), 0), [weekGastos]);

  const gastosPorCategoria = useMemo(() => {
    const cats = CATEGORIAS_GASTOS.map((c) => {
      const monto = weekGastos.filter((g) => g.categoria === c.id).reduce((s, g) => s + Number(g.monto), 0);
      return { ...c, monto, pct: totalSemana > 0 ? (monto / totalSemana) * 100 : 0 };
    }).filter((c) => c.monto > 0);
    return cats;
  }, [weekGastos, totalSemana]);

  const gastosRecientes = useMemo(() => [...gastos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)), [gastos]);

  const historyData = useMemo(() => {
    const weeks = {};
    gastos.forEach((g) => {
      if (!weeks[g.weekId]) weeks[g.weekId] = { week: g.weekId, total: 0 };
      weeks[g.weekId].total += Number(g.monto);
    });
    return Object.values(weeks).sort((a, b) => a.week.localeCompare(b.week)).slice(-12);
  }, [gastos]);

  const openNew = () => {
    setForm({ fecha: new Date().toISOString().split('T')[0], categoria: 'comida', monto: '', descripcion: '' });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch({
      type: 'ADD_GASTO',
      payload: {
        fecha: form.fecha,
        weekId: getWeekId(form.fecha),
        categoria: form.categoria,
        monto: Number(form.monto),
        descripcion: form.descripcion,
      },
    });
    setModalOpen(false);
  };

  const getCatInfo = (id) => CATEGORIAS_GASTOS.find((c) => c.id === id);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-50">Gastos</h1>
          <p className="text-sm text-dark-400">Lleva el control de tus gastos</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
        >
          <Plus size={16} /> Nuevo gasto
        </button>
      </div>

      <div className="glass rounded-xl border border-dark-600 p-4">
        <h3 className="text-sm font-semibold text-dark-200 mb-3">Esta semana: {formatCurrency(totalSemana)}</h3>
        {gastosPorCategoria.length > 0 ? (
          <div className="space-y-3">
            {gastosPorCategoria.map((cat) => (
              <div key={cat.id}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <span>{cat.icon}</span>
                    <span className="text-dark-300">{cat.label}</span>
                  </div>
                  <span className="text-dark-200 font-medium">{formatCurrency(cat.monto)} ({cat.pct.toFixed(0)}%)</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-dark-700">
                  <div className="h-full rounded-full" style={{ width: `${cat.pct}%`, backgroundColor: cat.color, transition: 'width 0.5s ease' }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-dark-500">Sin gastos esta semana</p>
        )}
      </div>

      {historyData.length > 0 && (
        <div className="glass rounded-xl border border-dark-600 p-4">
          <h3 className="text-sm font-semibold text-dark-200 mb-4">Tendencia semanal</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={historyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2f2f35" />
              <XAxis dataKey="week" tick={{ fill: '#71717a', fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fill: '#71717a', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: '#1a1a1e', border: '1px solid #2f2f35', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#d4d4d8' }}
                formatter={(v) => formatCurrency(v)}
              />
              <Bar dataKey="total" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {gastosRecientes.length > 0 && (
        <div className="glass rounded-xl border border-dark-600 p-4">
          <h3 className="text-sm font-semibold text-dark-200 mb-3">Historial de gastos</h3>
          <div className="space-y-2">
            {gastosRecientes.slice(0, 50).map((g) => {
              const cat = getCatInfo(g.categoria);
              return (
                <div key={g.id} className="flex items-center justify-between rounded-lg bg-dark-800 p-3 border border-dark-700">
                  <div className="flex items-center gap-3">
                    <span>{cat?.icon || '📦'}</span>
                    <div>
                      <p className="text-sm text-dark-100">{g.descripcion || cat?.label || g.categoria}</p>
                      <p className="text-xs text-dark-400">{formatDate(g.fecha)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-red-400">{formatCurrency(g.monto)}</span>
                    <button onClick={() => dispatch({ type: 'DELETE_GASTO', payload: g.id })} className="p-1 text-dark-400 hover:text-red-400"><Trash2 size={14} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo gasto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-dark-300 mb-1">Fecha</label>
            <input type="date" name="fecha" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} required
              className="w-full rounded-lg border border-dark-600 bg-dark-800 px-3 py-2 text-sm text-dark-50 outline-none focus:border-cyan-500/50" />
          </div>
          <div>
            <label className="block text-xs font-medium text-dark-300 mb-1">Categoría</label>
            <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              className="w-full rounded-lg border border-dark-600 bg-dark-800 px-3 py-2 text-sm text-dark-50 outline-none focus:border-cyan-500/50">
              {CATEGORIAS_GASTOS.map((c) => (
                <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-dark-300 mb-1">Monto ($)</label>
            <input type="number" name="monto" value={form.monto} onChange={(e) => setForm({ ...form, monto: e.target.value })} required min="0"
              className="w-full rounded-lg border border-dark-600 bg-dark-800 px-3 py-2 text-sm text-dark-50 outline-none focus:border-cyan-500/50" />
          </div>
          <div>
            <label className="block text-xs font-medium text-dark-300 mb-1">Descripción (opcional)</label>
            <input type="text" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              className="w-full rounded-lg border border-dark-600 bg-dark-800 px-3 py-2 text-sm text-dark-50 outline-none focus:border-cyan-500/50" />
          </div>
          <button type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90">
            Registrar gasto
          </button>
        </form>
      </Modal>
    </div>
  );
}
