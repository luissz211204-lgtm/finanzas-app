export default function ProgressBar({ value, max, label, color = 'accent', showValue = true, className = '', animated = true }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;

  const colors = {
    accent: 'bg-cyan-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="text-dark-300">{label}</span>}
          {showValue && <span className="text-dark-200 font-medium">{Math.round(pct)}%</span>}
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-dark-700">
        <div
          className={`h-full rounded-full ${colors[color] || colors.accent} ${
            animated ? 'animate-progress' : ''
          }`}
          style={{ width: `${pct}%`, transition: 'width 0.8s ease-out' }}
        />
      </div>
    </div>
  );
}
