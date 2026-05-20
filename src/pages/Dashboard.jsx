import { useMemo, useState } from 'react';
import { useFinanzas } from '../store/FinanzasContext';
import { formatCurrency, getWeekId, CATEGORIAS_GASTOS, AHORRO_MAX_HIDDEN, AHORRO_PHRASES } from '../utils/helpers';
import { generateAlerts } from '../utils/alerts';
import StatCard from '../components/StatCard';
import ProgressBar from '../components/ProgressBar';
import AlertBanner from '../components/AlertBanner';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, PieChart, Pie, Cell,
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, CreditCard, PiggyBank, Target, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { state } = useFinanzas();
  const navigate = useNavigate();
  const [alerts] = useState(() => generateAlerts(state));
  const { ingresos, gastos, deudas, metas, ahorro } = state;
  const weekId = state.currentWeekId;

  const weekData = useMemo(() => {
    const ingSemana = ingresos.filter((i) => i.weekId === weekId);
    const gasSemana = gastos.filter((g) => g.weekId === weekId);
    const totalIng = ingSemana.reduce((s, i) => s + Number(i.total), 0);
    const totalGas = gasSemana.reduce((s, g) => s + Number(g.monto), 0);
    const pagosDeudaSemana = deudas
      .flatMap((d) => d.pagos || [])
      .filter((p) => p.weekId === weekId)
      .reduce((s, p) => s + Number(p.monto), 0);
    const ahorroSemana = (ahorro.historial || [])
      .filter((h) => h.weekId === weekId)
      .reduce((s, h) => s + Number(h.monto), 0);
    const libre = totalIng - totalGas - pagosDeudaSemana - ahorroSemana;
    return { totalIng, totalGas, pagosDeudaSemana, ahorroSemana, libre };
  }, [ingresos, gastos, deudas, ahorro, weekId]);

  const totalDeuda = useMemo(() => deudas.reduce((s, d) => s + Number(d.saldoRestante), 0), [deudas]);
  const totalDeudaOriginal = useMemo(() => deudas.reduce((s, d) => s + Number(d.montoInicial), 0), [deudas]);
  const deudaPct = totalDeudaOriginal > 0 ? ((totalDeudaOriginal - totalDeuda) / totalDeudaOriginal) * 100 : 0;

  const ahorroPhrase = useMemo(() => {
    if (ahorro.desbloqueado) return null;
    return AHORRO_PHRASES[Math.floor(Math.random() * AHORRO_PHRASES.length)];
  }, [ahorro.desbloqueado]);

  const gastosPorCategoria = useMemo(() => {
    const gasSemana = gastos.filter((g) => g.weekId === weekId);
    const total = gasSemana.reduce((s, g) => s + Number(g.monto), 0);
    const cats = CATEGORIAS_GASTOS.map((c) => {
      const monto = gasSemana.filter((g) => g.categoria === c.id).reduce((s, g) => s + Number(g.monto), 0);
      return { name: c.label, value: monto, color: c.color, pct: total > 0 ? (monto / total) * 100 : 0 };
    }).filter((c) => c.value > 0);
    return cats;
  }, [gastos, weekId]);

  const weeklyHistory = useMemo(() => {
    const weeks = {};
    [...ingresos, ...gastos].forEach((item) => {
      const w = item.weekId;
      if (!weeks[w]) weeks[w] = { week: w, ingresos: 0, gastos: 0 };
    });
    ingresos.forEach((i) => {
      if (weeks[i.weekId]) weeks[i.weekId].ingresos += Number(i.total);
    });
    gastos.forEach((g) => {
      if (weeks[g.weekId]) weeks[g.weekId].gastos += Number(g.monto);
    });
    return Object.values(weeks).sort((a, b) => a.week.localeCompare(b.week)).slice(-8);
  }, [ingresos, gastos]);

  const metaProgreso = useMemo(() => {
    return metas.map((m) => ({
      ...m,
      pct: Number(m.costo) > 0 ? (Number(m.ahorrado || 0) / Number(m.costo)) * 100 : 0,
    }));
  }, [metas]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-dark-50">Dashboard</h1>
        <p className="text-sm text-dark-400">Resumen de tu semana financiera</p>
      </div>

      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <AlertBanner key={i} alert={alert} />
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCard
          title="Ganado esta semana"
          value={formatCurrency(weekData.totalIng)}
          icon={<TrendingUp size={28} />}
          color="green"
        />
        <StatCard
          title="Gastado esta semana"
          value={formatCurrency(weekData.totalGas)}
          icon={<TrendingDown size={28} />}
          color="red"
        />
        <StatCard
          title="Dinero libre real"
          value={formatCurrency(weekData.libre)}
          subtitle="Ingresos - Gastos - Deuda - Ahorro"
          icon={<DollarSign size={28} />}
          color={weekData.libre >= 0 ? 'green' : 'red'}
        />
        <StatCard
          title="Pagado en deudas"
          value={formatCurrency(weekData.pagosDeudaSemana)}
          icon={<CreditCard size={28} />}
          color="purple"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass rounded-xl border border-dark-600 p-4 lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold text-dark-200">Ingresos vs Gastos (semanas)</h3>
          {weeklyHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyHistory}>
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
          ) : (
            <p className="py-8 text-center text-sm text-dark-500">Registra ingresos y gastos para ver gráficas</p>
          )}
        </div>

        <div className="glass rounded-xl border border-dark-600 p-4">
          <h3 className="mb-4 text-sm font-semibold text-dark-200">Gastos por categoría</h3>
          {gastosPorCategoria.length > 0 ? (
            <div className="space-y-3">
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie data={gastosPorCategoria} cx="50%" cy="50%" innerRadius={30} outerRadius={55} dataKey="value">
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
              {gastosPorCategoria.slice(0, 4).map((cat) => (
                <div key={cat.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-dark-300">{cat.name}</span>
                  </div>
                  <span className="text-dark-200">{cat.pct.toFixed(0)}%</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-dark-500">Sin gastos esta semana</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass rounded-xl border border-dark-600 p-4">
          <h3 className="mb-3 text-sm font-semibold text-dark-200">Progreso de deudas</h3>
          {deudas.length > 0 ? (
            <div className="space-y-3">
              <ProgressBar value={totalDeudaOriginal - totalDeuda} max={totalDeudaOriginal} color="purple" />
              <p className="text-xs text-dark-400">
                {formatCurrency(totalDeudaOriginal - totalDeuda)} pagado de {formatCurrency(totalDeudaOriginal)}
              </p>
              {deudas.slice(0, 3).map((d) => (
                <div key={d.id} className="flex items-center justify-between text-xs">
                  <span className="text-dark-300">{d.nombre}</span>
                  <span className="text-dark-200">{formatCurrency(d.saldoRestante)}</span>
                </div>
              ))}
              <button
                onClick={() => navigate('/deudas')}
                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Ver todas <ArrowRight size={12} />
              </button>
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-dark-500">Sin deudas registradas</p>
          )}
        </div>

        <div className="glass rounded-xl border border-dark-600 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-dark-200">Ahorro semanal</h3>
            {!ahorro.desbloqueado && (
              <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[10px] text-cyan-400 font-medium">
                {ahorroPhrase}
              </span>
            )}
          </div>
          {Number(ahorro.total) > 0 ? (
            <div className="space-y-3">
              <ProgressBar
                value={ahorro.desbloqueado ? Number(ahorro.total) : Math.min(Number(ahorro.total), AHORRO_MAX_HIDDEN)}
                max={AHORRO_MAX_HIDDEN}
                color="accent"
                label="Progreso"
                showValue={ahorro.desbloqueado}
              />
              <div className="flex items-center justify-between text-xs">
                <span className="text-dark-400">
                  {ahorro.desbloqueado
                    ? formatCurrency(ahorro.total)
                    : 'Meta oculta hasta $35,000'}
                </span>
                <span className="text-dark-400">
                  {ahorro.desbloqueado
                    ? `${Math.min(100, ((Number(ahorro.total) / AHORRO_MAX_HIDDEN) * 100)).toFixed(0)}%`
                    : '???'}
                </span>
              </div>
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-dark-500">Empieza a ahorrar para ver tu progreso</p>
          )}
          <button
            onClick={() => navigate('/ahorro')}
            className="mt-3 flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Ir a ahorro <ArrowRight size={12} />
          </button>
        </div>
      </div>

      {metaProgreso.length > 0 && (
        <div className="glass rounded-xl border border-dark-600 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-dark-200">Metas</h3>
            <button
              onClick={() => navigate('/metas')}
              className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Ver todas <ArrowRight size={12} />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {metaProgreso.slice(0, 3).map((m) => (
              <div key={m.id} className="rounded-lg bg-dark-800 p-3 border border-dark-700">
                <div className="flex items-center gap-2 mb-2">
                  <Target size={14} className="text-cyan-400" />
                  <span className="text-sm font-medium text-dark-200">{m.nombre}</span>
                </div>
                <ProgressBar value={Number(m.ahorrado || 0)} max={Number(m.costo)} color="green" />
                <p className="mt-1 text-[10px] text-dark-500">
                  {formatCurrency(m.ahorrado || 0)} de {formatCurrency(m.costo)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
