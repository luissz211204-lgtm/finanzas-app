import { useState, useMemo } from 'react';
import { useFinanzas } from '../store/FinanzasContext';
import { formatCurrency, formatDate, getWeekId, groupBy } from '../utils/helpers';
import Modal from '../components/Modal';
import { Plus, Pencil, Trash2, TrendingUp, TrendingDown, Calendar } from 'lucide-react';

export default function Ingresos() {
  const { state, dispatch } = useFinanzas();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ fecha: '', horas: '', pagoHora: '', horasExtra: '', pagoExtra: '', total: '' });

  const ingresos = state.ingresos;
  const weekId = state.currentWeekId;

  const weekIngresos = useMemo(() => ingresos.filter((i) => i.weekId === weekId), [ingresos, weekId]);
  const allIngresos = useMemo(() => [...ingresos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)), [ingresos]);

  const stats = useMemo(() => {
    if (ingresos.length === 0) return { promedio: 0, max: 0, min: 0, mensual: 0, buena: 0, mala: 0 };
    const totals = ingresos.map((i) => Number(i.total));
    const promedio = totals.reduce((s, v) => s + v, 0) / totals.length;
    const max = Math.max(...totals);
    const min = Math.min(...totals);
    const buena = totals.filter((v) => v >= promedio).length;
    const mala = totals.filter((v) => v < promedio).length;
    const mensual = promedio * 4.33;
    return { promedio, max, min, mensual, buena, mala };
  }, [ingresos]);

  const openNew = () => {
    setEditing(null);
    const today = new Date().toISOString().split('T')[0];
    setForm({ fecha: today, horas: '', pagoHora: '', horasExtra: '0', pagoExtra: '', total: '' });
    setModalOpen(true);
  };

  const openEdit = (ingreso) => {
    setEditing(ingreso);
    setForm({
      fecha: ingreso.fecha?.split('T')[0] || '',
      horas: String(ingreso.horas || ''),
      pagoHora: String(ingreso.pagoHora || ''),
      horasExtra: String(ingreso.horasExtra || '0'),
      pagoExtra: String(ingreso.pagoExtra || ''),
      total: String(ingreso.total || ''),
    });
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newForm = { ...form, [name]: value };
    const horas = Number(newForm.horas) || 0;
    const pagoHora = Number(newForm.pagoHora) || 0;
    const horasExtra = Number(newForm.horasExtra) || 0;
    const pagoExtra = Number(newForm.pagoExtra) || 0;
    const total = horas * pagoHora + horasExtra * (pagoExtra || pagoHora);
    newForm.total = total > 0 ? String(Math.round(total)) : '';
    setForm(newForm);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      fecha: form.fecha,
      weekId: getWeekId(form.fecha),
      horas: Number(form.horas),
      pagoHora: Number(form.pagoHora),
      horasExtra: Number(form.horasExtra) || 0,
      pagoExtra: Number(form.pagoExtra) || Number(form.pagoHora),
      total: Number(form.total),
    };
    if (editing) {
      dispatch({ type: 'EDIT_INGRESO', payload: { ...data, id: editing.id } });
    } else {
      dispatch({ type: 'ADD_INGRESO', payload: data });
    }
    setModalOpen(false);
  };

  const ingresosAgrupados = useMemo(() => groupBy(allIngresos, 'weekId'), [allIngresos]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-50">Ingresos</h1>
          <p className="text-sm text-dark-400">Registra tus ingresos semanales</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
        >
          <Plus size={16} /> Nuevo ingreso
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <div className="glass rounded-xl border border-dark-600 p-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-dark-400">Promedio semanal</p>
          <p className="mt-1 text-lg font-bold text-cyan-400">{formatCurrency(stats.promedio)}</p>
        </div>
        <div className="glass rounded-xl border border-dark-600 p-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-dark-400">Mejor semana</p>
          <p className="mt-1 text-lg font-bold text-green-400">{formatCurrency(stats.max)}</p>
        </div>
        <div className="glass rounded-xl border border-dark-600 p-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-dark-400">Semana más baja</p>
          <p className="mt-1 text-lg font-bold text-red-400">{formatCurrency(stats.min)}</p>
        </div>
        <div className="glass rounded-xl border border-dark-600 p-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-dark-400">Mensual aprox</p>
          <p className="mt-1 text-lg font-bold text-purple-400">{formatCurrency(stats.mensual)}</p>
        </div>
        <div className="glass rounded-xl border border-dark-600 p-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-dark-400">Semanas</p>
          <p className="mt-1 text-lg font-bold text-dark-50">
            {stats.buena}B / {stats.mala}M
          </p>
        </div>
      </div>

      {weekIngresos.length > 0 && (
        <div className="glass rounded-xl border border-dark-600 p-4">
          <h3 className="text-sm font-semibold text-dark-200 mb-3">Esta semana</h3>
          {weekIngresos.map((ing) => (
            <div key={ing.id} className="flex items-center justify-between rounded-lg bg-dark-800 p-3 border border-dark-700">
              <div>
                <p className="text-sm font-medium text-dark-100">
                  {ing.horas}h × ${ing.pagoHora}/h
                  {ing.horasExtra > 0 && ` + ${ing.horasExtra}h extra`}
                </p>
                <p className="text-xs text-dark-400">{formatDate(ing.fecha)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-green-400">{formatCurrency(ing.total)}</span>
                <button onClick={() => openEdit(ing)} className="p-1 text-dark-400 hover:text-dark-200"><Pencil size={14} /></button>
                <button onClick={() => dispatch({ type: 'DELETE_INGRESO', payload: ing.id })} className="p-1 text-dark-400 hover:text-red-400"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {Object.entries(ingresosAgrupados).map(([week, ings]) => (
        <div key={week} className="glass rounded-xl border border-dark-600 p-4">
          <h3 className="text-sm font-semibold text-dark-200 mb-3">
            Semana del {formatDate(week)}
            <span className="ml-2 text-dark-400 font-normal">
              ({ings.reduce((s, i) => s + Number(i.total), 0).toLocaleString()} MXN)
            </span>
          </h3>
          <div className="space-y-2">
            {ings.map((ing) => (
              <div key={ing.id} className="flex items-center justify-between rounded-lg bg-dark-800 p-3 border border-dark-700">
                <div>
                  <p className="text-sm text-dark-100">
                    {ing.horas}h × ${ing.pagoHora}/h
                    {ing.horasExtra > 0 && ` + ${ing.horasExtra}h extra`}
                  </p>
                  <p className="text-xs text-dark-400">{formatDate(ing.fecha)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-dark-50">{formatCurrency(ing.total)}</span>
                  <button onClick={() => openEdit(ing)} className="p-1 text-dark-400 hover:text-dark-200"><Pencil size={14} /></button>
                  <button onClick={() => dispatch({ type: 'DELETE_INGRESO', payload: ing.id })} className="p-1 text-dark-400 hover:text-red-400"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {ingresos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <TrendingUp size={40} className="text-dark-600 mb-3" />
          <p className="text-dark-400 text-sm">No hay ingresos registrados aún</p>
          <p className="text-dark-500 text-xs mt-1">Registra tu primer ingreso semanal</p>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar ingreso' : 'Nuevo ingreso'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-dark-300 mb-1">Fecha</label>
            <input type="date" name="fecha" value={form.fecha} onChange={handleChange} required
              className="w-full rounded-lg border border-dark-600 bg-dark-800 px-3 py-2 text-sm text-dark-50 outline-none focus:border-cyan-500/50" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-dark-300 mb-1">Horas trabajadas</label>
              <input type="number" name="horas" value={form.horas} onChange={handleChange} required min="0" step="0.5"
                className="w-full rounded-lg border border-dark-600 bg-dark-800 px-3 py-2 text-sm text-dark-50 outline-none focus:border-cyan-500/50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-300 mb-1">Pago por hora ($)</label>
              <input type="number" name="pagoHora" value={form.pagoHora} onChange={handleChange} required min="0"
                className="w-full rounded-lg border border-dark-600 bg-dark-800 px-3 py-2 text-sm text-dark-50 outline-none focus:border-cyan-500/50" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-dark-300 mb-1">Horas extra</label>
              <input type="number" name="horasExtra" value={form.horasExtra} onChange={handleChange} min="0" step="0.5"
                className="w-full rounded-lg border border-dark-600 bg-dark-800 px-3 py-2 text-sm text-dark-50 outline-none focus:border-cyan-500/50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-300 mb-1">Pago extra/h ($)</label>
              <input type="number" name="pagoExtra" value={form.pagoExtra} onChange={handleChange} min="0"
                className="w-full rounded-lg border border-dark-600 bg-dark-800 px-3 py-2 text-sm text-dark-50 outline-none focus:border-cyan-500/50" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-dark-300 mb-1">Total (auto-calculado)</label>
            <input type="number" name="total" value={form.total} readOnly
              className="w-full rounded-lg border border-dark-600 bg-dark-700 px-3 py-2 text-sm text-cyan-400 font-bold outline-none cursor-not-allowed" />
          </div>
          <button type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90">
            {editing ? 'Guardar cambios' : 'Registrar ingreso'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
