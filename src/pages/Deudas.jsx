import { useState, useMemo } from 'react';
import { useFinanzas } from '../store/FinanzasContext';
import { formatCurrency, formatDate, getWeekId, DEBT_PAYOFF_STRATEGIES } from '../utils/helpers';
import Modal from '../components/Modal';
import ProgressBar from '../components/ProgressBar';
import { Plus, Trash2, Pencil, DollarSign } from 'lucide-react';

export default function Deudas() {
  const { state, dispatch } = useFinanzas();
  const [modalOpen, setModalOpen] = useState(false);
  const [pagoModal, setPagoModal] = useState({ open: false, deudaId: null });
  const [editing, setEditing] = useState(null);
  const [strategy, setStrategy] = useState('avalanche');
  const [form, setForm] = useState({ nombre: '', montoInicial: '', saldoRestante: '', interes: '', pagoMinimo: '' });
  const [pagoForm, setPagoForm] = useState({ monto: '' });

  const deudas = state.deudas;

  const sortedDeudas = useMemo(() => {
    const list = [...deudas].filter((d) => Number(d.saldoRestante) > 0);
    if (strategy === 'avalanche') {
      return list.sort((a, b) => (Number(b.interes) || 0) - (Number(a.interes) || 0));
    }
    return list.sort((a, b) => Number(a.saldoRestante) - Number(b.saldoRestante));
  }, [deudas, strategy]);

  const totalDeuda = useMemo(() => deudas.reduce((s, d) => s + Number(d.saldoRestante), 0), [deudas]);
  const totalOriginal = useMemo(() => deudas.reduce((s, d) => s + Number(d.montoInicial), 0), [deudas]);

  const openNew = () => {
    setEditing(null);
    setForm({ nombre: '', montoInicial: '', saldoRestante: '', interes: '', pagoMinimo: '' });
    setModalOpen(true);
  };

  const openEdit = (deuda) => {
    setEditing(deuda);
    setForm({
      nombre: deuda.nombre,
      montoInicial: String(deuda.montoInicial),
      saldoRestante: String(deuda.saldoRestante),
      interes: String(deuda.interes || ''),
      pagoMinimo: String(deuda.pagoMinimo || ''),
    });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      nombre: form.nombre,
      montoInicial: Number(form.montoInicial),
      saldoRestante: Number(form.saldoRestante),
      interes: form.interes ? Number(form.interes) : undefined,
      pagoMinimo: form.pagoMinimo ? Number(form.pagoMinimo) : undefined,
    };
    if (editing) {
      dispatch({ type: 'EDIT_DEUDA', payload: { ...data, id: editing.id } });
    } else {
      dispatch({ type: 'ADD_DEUDA', payload: data });
    }
    setModalOpen(false);
  };

  const registrarPago = (e) => {
    e.preventDefault();
    dispatch({
      type: 'REGISTRAR_PAGO_DEUDA',
      payload: {
        deudaId: pagoModal.deudaId,
        monto: Number(pagoForm.monto),
        weekId: getWeekId(),
        fecha: new Date().toISOString(),
      },
    });
    setPagoModal({ open: false, deudaId: null });
    setPagoForm({ monto: '' });
  };

  const recomendacion = useMemo(() => {
    if (sortedDeudas.length === 0) return null;
    const primera = sortedDeudas[0];
    const strategyName = DEBT_PAYOFF_STRATEGIES[strategy];
    return {
      nombre: primera.nombre,
      monto: primera.saldoRestante,
      strategy: strategyName,
    };
  }, [sortedDeudas, strategy]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-50">Deudas</h1>
          <p className="text-sm text-dark-400">Gestiona y paga tus deudas</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
        >
          <Plus size={16} /> Nueva deuda
        </button>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="glass rounded-xl border border-dark-600 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-dark-400">Deuda total</p>
          <p className="mt-1 text-2xl font-bold text-red-400">{formatCurrency(totalDeuda)}</p>
        </div>
        <div className="glass rounded-xl border border-dark-600 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-dark-400">Pagado</p>
          <p className="mt-1 text-2xl font-bold text-green-400">{formatCurrency(totalOriginal - totalDeuda)}</p>
        </div>
        <div className="glass rounded-xl border border-dark-600 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-dark-400">Deudas activas</p>
          <p className="mt-1 text-2xl font-bold text-dark-50">{deudas.filter((d) => Number(d.saldoRestante) > 0).length}</p>
        </div>
      </div>

      {totalOriginal > 0 && (
        <div className="glass rounded-xl border border-dark-600 p-4">
          <ProgressBar value={totalOriginal - totalDeuda} max={totalOriginal} color="purple" />
        </div>
      )}

      <div className="glass rounded-xl border border-dark-600 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-dark-200">Estrategia de pago</h3>
          <div className="flex gap-1 rounded-lg bg-dark-800 p-0.5 border border-dark-700">
            <button
              onClick={() => setStrategy('avalanche')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                strategy === 'avalanche' ? 'bg-cyan-500/20 text-cyan-400' : 'text-dark-400 hover:text-dark-200'
              }`}
            >
              Avalancha
            </button>
            <button
              onClick={() => setStrategy('snowball')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                strategy === 'snowball' ? 'bg-cyan-500/20 text-cyan-400' : 'text-dark-400 hover:text-dark-200'
              }`}
            >
              Bola de nieve
            </button>
          </div>
        </div>
        {recomendacion && (
          <div className="rounded-lg bg-cyan-500/5 border border-cyan-500/20 p-3">
            <p className="text-xs text-cyan-400 font-medium">
              {recomendacion.strategy} → Paga primero: <strong>{recomendacion.nombre}</strong>
              {' '}({formatCurrency(recomendacion.monto)})
            </p>
          </div>
        )}
      </div>

      {deudas.map((deuda) => {
        const pct = Number(deuda.montoInicial) > 0
          ? ((Number(deuda.montoInicial) - Number(deuda.saldoRestante)) / Number(deuda.montoInicial)) * 100
          : 0;
        return (
          <div key={deuda.id} className="glass rounded-xl border border-dark-600 p-4 animate-slide-up">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-base font-semibold text-dark-50">{deuda.nombre}</h3>
                {deuda.interes && (
                  <span className="text-xs text-red-400">{(deuda.interes)}% interés</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setPagoModal({ open: true, deudaId: deuda.id }); setPagoForm({ monto: '' }); }}
                  className="flex items-center gap-1 rounded-lg bg-green-500/10 border border-green-500/20 px-3 py-1.5 text-xs font-medium text-green-400 hover:bg-green-500/20 transition-colors"
                >
                  <DollarSign size={12} /> Pagar
                </button>
                <button onClick={() => openEdit(deuda)} className="p-1 text-dark-400 hover:text-dark-200"><Pencil size={14} /></button>
                <button onClick={() => dispatch({ type: 'DELETE_DEUDA', payload: deuda.id })} className="p-1 text-dark-400 hover:text-red-400"><Trash2 size={14} /></button>
              </div>
            </div>

            <ProgressBar value={Number(deuda.montoInicial) - Number(deuda.saldoRestante)} max={Number(deuda.montoInicial)} color="accent" />

            <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
              <div>
                <p className="text-dark-400">Saldo restante</p>
                <p className="font-semibold text-dark-100">{formatCurrency(deuda.saldoRestante)}</p>
              </div>
              <div>
                <p className="text-dark-400">Pagado</p>
                <p className="font-semibold text-green-400">{formatCurrency(Number(deuda.montoInicial) - Number(deuda.saldoRestante))}</p>
              </div>
              <div>
                <p className="text-dark-400">Pago mínimo</p>
                <p className="font-semibold text-dark-100">{deuda.pagoMinimo ? formatCurrency(deuda.pagoMinimo) : '—'}</p>
              </div>
            </div>

            {deuda.pagos && deuda.pagos.length > 0 && (
              <div className="mt-3 border-t border-dark-700 pt-3">
                <p className="text-[10px] font-medium uppercase tracking-wider text-dark-500 mb-2">Historial de pagos</p>
                <div className="space-y-1">
                  {[...deuda.pagos].reverse().slice(0, 5).map((pago) => (
                    <div key={pago.id} className="flex items-center justify-between text-xs">
                      <span className="text-dark-400">{formatDate(pago.fecha)}</span>
                      <span className="text-green-400 font-medium">+{formatCurrency(pago.monto)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {deudas.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <DollarSign size={40} className="text-dark-600 mb-3" />
          <p className="text-dark-400 text-sm">Sin deudas registradas</p>
          <p className="text-dark-500 text-xs mt-1">Agrega tus deudas para empezar a gestionarlas</p>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar deuda' : 'Nueva deuda'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-dark-300 mb-1">Nombre (ej: Nu, Stori, Plata)</label>
            <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required
              className="w-full rounded-lg border border-dark-600 bg-dark-800 px-3 py-2 text-sm text-dark-50 outline-none focus:border-cyan-500/50" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-dark-300 mb-1">Monto inicial ($)</label>
              <input type="number" value={form.montoInicial} onChange={(e) => setForm({ ...form, montoInicial: e.target.value })} required min="0"
                className="w-full rounded-lg border border-dark-600 bg-dark-800 px-3 py-2 text-sm text-dark-50 outline-none focus:border-cyan-500/50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-300 mb-1">Saldo restante ($)</label>
              <input type="number" value={form.saldoRestante} onChange={(e) => setForm({ ...form, saldoRestante: e.target.value })} required min="0"
                className="w-full rounded-lg border border-dark-600 bg-dark-800 px-3 py-2 text-sm text-dark-50 outline-none focus:border-cyan-500/50" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-dark-300 mb-1">Interés (%)</label>
              <input type="number" value={form.interes} onChange={(e) => setForm({ ...form, interes: e.target.value })} min="0" step="0.1"
                className="w-full rounded-lg border border-dark-600 bg-dark-800 px-3 py-2 text-sm text-dark-50 outline-none focus:border-cyan-500/50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-300 mb-1">Pago mínimo ($)</label>
              <input type="number" value={form.pagoMinimo} onChange={(e) => setForm({ ...form, pagoMinimo: e.target.value })} min="0"
                className="w-full rounded-lg border border-dark-600 bg-dark-800 px-3 py-2 text-sm text-dark-50 outline-none focus:border-cyan-500/50" />
            </div>
          </div>
          <button type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90">
            {editing ? 'Guardar cambios' : 'Agregar deuda'}
          </button>
        </form>
      </Modal>

      <Modal open={pagoModal.open} onClose={() => setPagoModal({ open: false, deudaId: null })} title="Registrar pago" size="sm">
        <form onSubmit={registrarPago} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-dark-300 mb-1">Monto del pago ($)</label>
            <input type="number" value={pagoForm.monto} onChange={(e) => setPagoForm({ monto: e.target.value })} required min="0"
              className="w-full rounded-lg border border-dark-600 bg-dark-800 px-3 py-2 text-sm text-dark-50 outline-none focus:border-cyan-500/50" autoFocus />
          </div>
          <button type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90">
            Registrar pago
          </button>
        </form>
      </Modal>
    </div>
  );
}
