import { useMemo } from 'react';
import { useFinanzas } from '../store/FinanzasContext';
import { formatCurrency, formatDate, groupBy, CATEGORIAS_GASTOS, getWeekId } from '../utils/helpers';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';

export default function Historial() {
  const { state } = useFinanzas();
  const { ingresos, gastos, deudas } = state;

  const semanas = useMemo(() => {
    const weeks = new Set();
    ingresos.forEach((i) => weeks.add(i.weekId));
    gastos.forEach((g) => weeks.add(g.weekId));
    return Array.from(weeks).sort().reverse();
  }, [ingresos, gastos]);

  const weeklySummary = useMemo(() => {
    return semanas.map((week) => {
      const ing = ingresos.filter((i) => i.weekId === week).reduce((s, i) => s + Number(i.total), 0);
      const gas = gastos.filter((g) => g.weekId === week).reduce((s, g) => s + Number(g.monto), 0);
      const pagosDeuda = deudas
        .flatMap((d) => d.pagos || [])
        .filter((p) => p.weekId === week)
        .reduce((s, p) => s + Number(p.monto), 0);
      return { week, ingresos: ing, gastos: gas, pagosDeuda: pagosDeuda, balance: ing - gas - pagosDeuda };
    });
  }, [semanas, ingresos, gastos, deudas]);

  const mejorSemana = useMemo(() => {
    if (weeklySummary.length === 0) return null;
    return weeklySummary.reduce((best, w) => (w.ingresos > (best?.ingresos || 0) ? w : best), weeklySummary[0]);
  }, [weeklySummary]);

  const peorSemanaGastos = useMemo(() => {
    if (weeklySummary.length === 0) return null;
    return weeklySummary.reduce((worst, w) => (w.gastos > (worst?.gastos || 0) ? w : worst), weeklySummary[0]);
  }, [weeklySummary]);

  const gastosPorCategoria = useMemo(() => {
    const cats = {};
    gastos.forEach((g) => {
      cats[g.categoria] = (cats[g.categoria] || 0) + Number(g.monto);
    });
    return CATEGORIAS_GASTOS.map((c) => ({
      name: c.label,
      value: cats[c.id] || 0,
      color: c.color,
    })).filter((c) => c.value > 0);
  }, [gastos]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-dark-50">Historial</h1>
        <p className="text-sm text-dark-400">Analítica y tendencias semanales</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass rounded-xl border border-dark-600 p-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-dark-400">Semanas registradas</p>
          <p className="mt-1 text-xl font-bold text-dark-50">{semanas.length}</p>
        </div>
        <div className="glass rounded-xl border border-dark-600 p-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-dark-400">Mejor semana (ingresos)</p>
          <p className="mt-1 text-xl font-bold text-green-400">
            {mejorSemana ? formatCurrency(mejorSemana.ingresos) : '—'}
          </p>
          {mejorSemana && <p className="text-[10px] text-dark-500">{formatDate(mejorSemana.week)}</p>}
        </div>
        <div className="glass rounded-xl border border-dark-600 p-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-dark-400">Peor semana (gastos)</p>
          <p className="mt-1 text-xl font-bold text-red-400">
            {peorSemanaGastos ? formatCurrency(peorSemanaGastos.gastos) : '—'}
          </p>
          {peorSemanaGastos && <p className="text-[10px] text-dark-500">{formatDate(peorSemanaGastos.week)}</p>}
        </div>
        <div className="glass rounded-xl border border-dark-600 p-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-dark-400">Balance total</p>
          <p className="mt-1 text-xl font-bold text-cyan-400">
            {formatCurrency(weeklySummary.reduce((s, w) => s + w.balance, 0))}
          </p>
        </div>
      </div>

      {weeklySummary.length > 0 && (
        <div className="glass rounded-xl border border-dark-600 p-4">
          <h3 className="text-sm font-semibold text-dark-200 mb-4">Ingresos vs Gastos por semana</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={[...weeklySummary].reverse()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2f2f35" />
              <XAxis dataKey="week" tick={{ fill: '#71717a', fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fill: '#71717a', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: '#1a1a1e', border: '1px solid #2f2f35', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#d4d4d8' }}
                formatter={(v) => formatCurrency(v)}
              />
              <Bar dataKey="ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="gastos" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {gastosPorCategoria.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="glass rounded-xl border border-dark-600 p-4">
            <h3 className="text-sm font-semibold text-dark-200 mb-4">Distribución de gastos</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={gastosPorCategoria} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {gastosPorCategoria.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1a1a1e', border: '1px solid #2f2f35', borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => formatCurrency(v)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="glass rounded-xl border border-dark-600 p-4">
            <h3 className="text-sm font-semibold text-dark-200 mb-4">Balance semanal</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={[...weeklySummary].reverse()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2f2f35" />
                <XAxis dataKey="week" tick={{ fill: '#71717a', fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fill: '#71717a', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ background: '#1a1a1e', border: '1px solid #2f2f35', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#d4d4d8' }}
                  formatter={(v) => formatCurrency(v)}
                />
                <Line type="monotone" dataKey="balance" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="glass rounded-xl border border-dark-600 p-4">
        <h3 className="text-sm font-semibold text-dark-200 mb-3">Desglose semanal</h3>
        <div className="space-y-2">
          {weeklySummary.slice(0, 20).map((w) => (
            <div key={w.week} className="flex items-center justify-between rounded-lg bg-dark-800 p-3 border border-dark-700 text-xs">
              <div className="flex items-center gap-2">
                <Calendar size={12} className="text-dark-500" />
                <span className="text-dark-300">{formatDate(w.week)}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-green-400">+{formatCurrency(w.ingresos)}</span>
                <span className="text-red-400">-{formatCurrency(w.gastos)}</span>
                <span className={w.balance >= 0 ? 'text-cyan-400' : 'text-red-400'}>
                  {w.balance >= 0 ? '+' : ''}{formatCurrency(w.balance)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
