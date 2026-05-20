export const generateAlerts = (state) => {
  const alerts = [];
  const { gastos, deudas, ingresos, metas, ahorro } = state;

  const totalGastosSemana = gastos
    .filter(g => g.weekId === state.currentWeekId)
    .reduce((s, g) => s + Number(g.monto), 0);

  const totalIngresosSemana = ingresos
    .filter(i => i.weekId === state.currentWeekId)
    .reduce((s, i) => s + Number(i.total), 0);

  const totalDeuda = deudas.reduce((s, d) => s + Number(d.saldoRestante), 0);
  const totalDeudaSemana = deudas
    .flatMap(d => d.pagos || [])
    .filter(p => p.weekId === state.currentWeekId)
    .reduce((s, p) => s + Number(p.monto), 0);

  const gastoComida = gastos
    .filter(g => g.weekId === state.currentWeekId && g.categoria === 'comida')
    .reduce((s, g) => s + Number(g.monto), 0);

  if (gastoComida > 500) {
    alerts.push({
      type: 'warning',
      title: 'Gasto elevado en comida',
      message: `Esta semana gastaste ${formatAlertCurrency(gastoComida)} en comida. Intenta llevar comida de casa.`,
      icon: '🍽️',
    });
  }

  if (gastoComida > totalGastosSemana * 0.5 && totalGastosSemana > 0) {
    alerts.push({
      type: 'info',
      title: 'Más de la mitad en comida',
      message: 'Más del 50% de tus gastos fueron en comida. Revisa tus hábitos.',
      icon: '📊',
    });
  }

  if (totalIngresosSemana > 0 && totalDeuda > 0) {
    const semanasParaLiquidar = totalDeuda / Math.max(totalIngresosSemana * 0.3, 1);
    if (semanasParaLiquidar > 0 && semanasParaLiquidar < 52) {
      alerts.push({
        type: 'info',
        title: 'Proyección de deuda',
        message: `Si mantienes este ritmo, podrías salir de deuda en aproximadamente ${Math.ceil(semanasParaLiquidar)} semanas.`,
        icon: '📈',
      });
    }
  }

  const totalAhorro = Number(ahorro.total) || 0;
  const gastoMensualEstimado = totalGastosSemana * 4.33;
  if (totalAhorro > gastoMensualEstimado && gastoMensualEstimado > 0) {
    alerts.push({
      type: 'success',
      title: 'Ahorro sólido',
      message: 'Tu ahorro ya supera tus gastos mensuales estimados. Bien hecho.',
      icon: '🛡️',
    });
  }

  if (totalIngresosSemana > 0) {
    const libre = totalIngresosSemana - totalGastosSemana - totalDeudaSemana;
    if (libre > totalIngresosSemana * 0.3) {
      alerts.push({
        type: 'success',
        title: 'Semana fuerte',
        message: 'Esta semana tienes buen margen. Aprovecha para adelantar deuda o ahorrar más.',
        icon: '💪',
      });
    }
  }

  const semanaPasadaGastos = gastos
    .filter(g => {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      const prevWeek = getWeekId(d);
      return g.weekId === prevWeek;
    })
    .reduce((s, g) => s + Number(g.monto), 0);

  if (totalGastosSemana > semanaPasadaGastos * 1.3 && semanaPasadaGastos > 0) {
    alerts.push({
      type: 'warning',
      title: 'Gastos al alza',
      message: `Gastaste ${Math.round((totalGastosSemana / semanaPasadaGastos - 1) * 100)}% más que la semana pasada.`,
      icon: '📈',
    });
  }

  const deudaAlta = deudas.filter(d => Number(d.saldoRestante) > 0);
  if (deudaAlta.length > 3) {
    alerts.push({
      type: 'info',
      title: 'Muchas deudas activas',
      message: `Tienes ${deudaAlta.length} deudas activas. Considera consolidarlas.`,
      icon: '📋',
    });
  }

  if (ahorro && ahorro.desbloqueado) {
    alerts.push({
      type: 'achievement',
      title: '¡Ahorro desbloqueado!',
      message: 'Has alcanzado los $35,000 de ahorro. Ahora puedes ver tu progreso completo.',
      icon: '🏆',
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      type: 'info',
      title: 'Todo en orden',
      message: 'No hay alertas por ahora. Sigue así.',
      icon: '✅',
    });
  }

  return alerts.slice(0, 5);
};

const getWeekId = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
};

const formatAlertCurrency = (amount) => {
  return '$' + Math.round(amount).toLocaleString('es-MX') + ' MXN';
};
