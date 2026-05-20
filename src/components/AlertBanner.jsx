import { useState } from 'react';
import { AlertTriangle, Info, CheckCircle, Trophy, X } from 'lucide-react';

const iconMap = {
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle,
  achievement: Trophy,
};

const colorMap = {
  warning: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
  info: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400',
  success: 'border-green-500/30 bg-green-500/10 text-green-400',
  achievement: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
};

export default function AlertBanner({ alert, onDismiss }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const Icon = iconMap[alert.type] || Info;

  return (
    <div className={`animate-slide-up flex items-start gap-3 rounded-lg border p-3 ${colorMap[alert.type] || colorMap.info}`}>
      <Icon size={18} className="mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{alert.title}</p>
        <p className="mt-0.5 text-xs opacity-80">{alert.message}</p>
      </div>
      <button
        onClick={() => { setDismissed(true); onDismiss?.(); }}
        className="shrink-0 rounded p-0.5 opacity-60 hover:opacity-100 transition-opacity"
      >
        <X size={14} />
      </button>
    </div>
  );
}
