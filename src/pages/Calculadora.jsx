import { useState } from 'react';
import { formatCurrency } from '../utils/helpers';
import { Calculator, TrendingUp, CreditCard, PiggyBank } from 'lucide-react';

export default function Calculadora() {
  const [tab, setTab] = useState('deuda');
  const [deudaForm, setDeudaForm] = useState({ monto: '', pagoSemanal: '', interes: '' });
  const [ahorroForm, setAhorroForm] = useState({ meta: '', ahorroSemanal: '', actual: '' });
  const [resultado, setResultado] = useState(null);

  const calcularDeuda = (e) => {
    e.preventDefault();
    const monto = Number(deudaForm.monto);
    const pago = Number(deudaForm.pagoSemanal);
    const interes = Number(deudaForm.interes) / 100;

    if (monto <= 0 || pago <= 0) return;

    let saldo = monto;
    let semanas = 0;
    const maxSemanas = 520;
    const pagoMensual = interes > 0 ? (monto * (interes / 12) * Math.pow(1 + interes / 12, 12 * 10)) / (Math.pow(1 + interes / 12, 12 * 10) - 1) : pago * 4.33;

    while (saldo > 0 && semanas < maxSemanas) {
      if (interes > 0) {
        saldo = saldo * (1 + interes / 52) - pago;
      } else {
        saldo -= pago;
      }
      semanas++;
    }

    const totalPagado = semanas * pago;
    const totalInteres = totalPagado - monto;

    setResultado({
      type: 'deuda',
      semanas,
      meses: Math.ceil(semanas / 4.33),
      totalPagado,
      totalInteres,
      pagoMensual: pago * 4.33,
      pagoSemanal: pago,
    });
  };

  const calcularAhorro = (e) => {
    e.preventDefault();
    const meta = Number(ahorroForm.meta);
    const semanal = Number(ahorroForm.ahorroSemanal);
    const actual = Number(ahorroForm.actual || 0);

    if (meta <= 0 || semanal <= 0) return;

    const restante = meta - actual;
    const semanas = Math.ceil(restante / semanal);
    const meses = Math.ceil(semanas / 4.33);

    setResultado({
      type: 'ahorro',
      semanas,
      meses,
      restante,
      semanal,
      totalFinal: actual + semanas * semanal,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-dark-50">Calculadora financiera</h1>
        <p className="text-sm text-dark-400">Simula pagos y proyecciones</p>
      </div>

      <div className="flex gap-1 rounded-xl bg-dark-800 p-1 border border-dark-700 w-fit">
        <button
          onClick={() => setTab('deuda')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            tab === 'deuda' ? 'bg-cyan-500/20 text-cyan-400' : 'text-dark-400 hover:text-dark-200'
          }`}
        >
          <CreditCard size={16} /> Liquidar deuda
        </button>
        <button
          onClick={() => setTab('ahorro')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            tab === 'ahorro' ? 'bg-cyan-500/20 text-cyan-400' : 'text-dark-400 hover:text-dark-200'
          }`}
        >
          <PiggyBank size={16} /> Meta de ahorro
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-xl border border-dark-600 p-5">
          <h3 className="text-base font-semibold text-dark-200 mb-4">
            {tab === 'deuda' ? 'Simular pago de deuda' : ' calcular meta de ahorro'}
          </h3>

          <form onSubmit={tab === 'deuda' ? calcularDeuda : calcularAhorro} className="space-y-4">
            {tab === 'deuda' ? (
              <>
                <div>
                  <label className="block text-xs font-medium text-dark-300 mb-1">Saldo actual de la deuda ($)</label>
                  <input type="number" value={deudaForm.monto} onChange={(e) => setDeudaForm({ ...deudaForm, monto: e.target.value })} required min="0"
                    className="w-full rounded-lg border border-dark-600 bg-dark-800 px-3 py-2 text-sm text-dark-50 outline-none focus:border-cyan-500/50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-dark-300 mb-1">Pago semanal ($)</label>
                  <input type="number" value={deudaForm.pagoSemanal} onChange={(e) => setDeudaForm({ ...deudaForm, pagoSemanal: e.target.value })} required min="0"
                    className="w-full rounded-lg border border-dark-600 bg-dark-800 px-3 py-2 text-sm text-dark-50 outline-none focus:border-cyan-500/50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-dark-300 mb-1">Interés anual (%) — opcional</label>
                  <input type="number" value={deudaForm.interes} onChange={(e) => setDeudaForm({ ...deudaForm, interes: e.target.value })} min="0" step="0.1"
                    className="w-full rounded-lg border border-dark-600 bg-dark-800 px-3 py-2 text-sm text-dark-50 outline-none focus:border-cyan-500/50" />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-medium text-dark-300 mb-1">Meta de ahorro ($)</label>
                  <input type="number" value={ahorroForm.meta} onChange={(e) => setAhorroForm({ ...ahorroForm, meta: e.target.value })} required min="0"
                    className="w-full rounded-lg border border-dark-600 bg-dark-800 px-3 py-2 text-sm text-dark-50 outline-none focus:border-cyan-500/50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-dark-300 mb-1">Ahorro semanal ($)</label>
                  <input type="number" value={ahorroForm.ahorroSemanal} onChange={(e) => setAhorroForm({ ...ahorroForm, ahorroSemanal: e.target.value })} required min="0"
                    className="w-full rounded-lg border border-dark-600 bg-dark-800 px-3 py-2 text-sm text-dark-50 outline-none focus:border-cyan-500/50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-dark-300 mb-1">Ahorro actual ($) — opcional</label>
                  <input type="number" value={ahorroForm.actual} onChange={(e) => setAhorroForm({ ...ahorroForm, actual: e.target.value })} min="0"
                    className="w-full rounded-lg border border-dark-600 bg-dark-800 px-3 py-2 text-sm text-dark-50 outline-none focus:border-cyan-500/50" />
                </div>
              </>
            )}

            <button type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90">
              Calcular
            </button>
          </form>
        </div>

        {resultado && (
          <div className="glass rounded-xl border border-dark-600 p-5 animate-slide-up">
            <h3 className="text-base font-semibold text-dark-200 mb-4">Resultado</h3>

            {resultado.type === 'deuda' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-dark-800 p-3 border border-dark-700">
                    <p className="text-[10px] text-dark-400 uppercase tracking-wider">Semanas</p>
                    <p className="text-xl font-bold text-cyan-400">{resultado.semanas}</p>
                  </div>
                  <div className="rounded-lg bg-dark-800 p-3 border border-dark-700">
                    <p className="text-[10px] text-dark-400 uppercase tracking-wider">Meses aprox</p>
                    <p className="text-xl font-bold text-purple-400">{resultado.meses}</p>
                  </div>
                </div>
                <div className="rounded-lg bg-dark-800 p-3 border border-dark-700">
                  <p className="text-xs text-dark-400">Pago semanal</p>
                  <p className="text-lg font-bold text-dark-50">{formatCurrency(resultado.pagoSemanal)}</p>
                </div>
                <div className="rounded-lg bg-dark-800 p-3 border border-dark-700">
                  <p className="text-xs text-dark-400">Total a pagar</p>
                  <p className="text-lg font-bold text-red-400">{formatCurrency(resultado.totalPagado)}</p>
                </div>
                {resultado.totalInteres > 0 && (
                  <div className="rounded-lg bg-dark-800 p-3 border border-dark-700">
                    <p className="text-xs text-dark-400">Intereses totales</p>
                    <p className="text-lg font-bold text-yellow-400">{formatCurrency(resultado.totalInteres)}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-dark-800 p-3 border border-dark-700">
                    <p className="text-[10px] text-dark-400 uppercase tracking-wider">Semanas</p>
                    <p className="text-xl font-bold text-cyan-400">{resultado.semanas}</p>
                  </div>
                  <div className="rounded-lg bg-dark-800 p-3 border border-dark-700">
                    <p className="text-[10px] text-dark-400 uppercase tracking-wider">Meses aprox</p>
                    <p className="text-xl font-bold text-purple-400">{resultado.meses}</p>
                  </div>
                </div>
                <div className="rounded-lg bg-dark-800 p-3 border border-dark-700">
                  <p className="text-xs text-dark-400">Ahorro semanal necesario</p>
                  <p className="text-lg font-bold text-dark-50">{formatCurrency(resultado.semanal)}</p>
                </div>
                <div className="rounded-lg bg-dark-800 p-3 border border-dark-700">
                  <p className="text-xs text-dark-400">Total al final</p>
                  <p className="text-lg font-bold text-green-400">{formatCurrency(resultado.totalFinal)}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {!resultado && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-dark-600 p-8 text-center">
            <Calculator size={40} className="text-dark-600 mb-3" />
            <p className="text-dark-400 text-sm">Ingresa los datos y presiona Calcular</p>
          </div>
        )}
      </div>
    </div>
  );
}
