export default function StatCard({ title, value, subtitle, icon, color = 'accent', trend, onClick, hidden }) {
  const colorMap = {
    accent: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/20 text-cyan-400',
    green: 'from-green-500/20 to-green-500/5 border-green-500/20 text-green-400',
    red: 'from-red-500/20 to-red-500/5 border-red-500/20 text-red-400',
    yellow: 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/20 text-yellow-400',
    purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/20 text-purple-400',
    orange: 'from-orange-500/20 to-orange-500/5 border-orange-500/20 text-orange-400',
  };

  const iconMap = {
    accent: 'text-cyan-400',
    green: 'text-green-400',
    red: 'text-red-400',
    yellow: 'text-yellow-400',
    purple: 'text-purple-400',
    orange: 'text-orange-400',
  };

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border bg-gradient-to-br ${colorMap[color] || colorMap.accent} p-4 transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/10' : ''
      }`}
    >
      {icon && (
        <div className={`absolute right-3 top-3 opacity-20 ${iconMap[color] || iconMap.accent}`}>
          {icon}
        </div>
      )}
      <p className="text-xs font-medium uppercase tracking-wider text-dark-300">{title}</p>
      <p className={`mt-1 text-2xl font-bold ${hidden ? 'blur-sm select-none' : ''}`}>
        {hidden ? '••••' : value}
      </p>
      {subtitle && <p className="mt-1 text-xs text-dark-400">{subtitle}</p>}
      {trend !== undefined && (
        <div className={`mt-1 flex items-center gap-1 text-xs ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          <span>{trend >= 0 ? '↑' : '↓'}</span>
          <span>{Math.abs(trend).toFixed(1)}%</span>
        </div>
      )}
    </div>
  );
}
