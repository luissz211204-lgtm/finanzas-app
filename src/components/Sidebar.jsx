import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Wallet, Receipt, CreditCard, PiggyBank,
  Target, Calculator, History, Settings, X, TrendingUp,
} from 'lucide-react';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/ingresos', label: 'Ingresos', icon: TrendingUp },
  { to: '/gastos', label: 'Gastos', icon: Receipt },
  { to: '/deudas', label: 'Deudas', icon: CreditCard },
  { to: '/ahorro', label: 'Ahorro', icon: PiggyBank },
  { to: '/metas', label: 'Metas', icon: Target },
  { to: '/calculadora', label: 'Calculadora', icon: Calculator },
  { to: '/historial', label: 'Historial', icon: History },
  { to: '/configuracion', label: 'Configuración', icon: Settings },
];

export default function Sidebar({ onClose }) {
  return (
    <aside className="flex h-full flex-col border-r border-dark-800 bg-dark-900">
      <div className="flex items-center justify-between border-b border-dark-800 px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
            <Wallet size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-dark-50">FinanzApp</h1>
            <p className="text-[10px] text-dark-400">Control financiero</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-dark-400 hover:bg-dark-700 hover:text-dark-100 transition-colors lg:hidden"
        >
          <X size={16} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  : 'text-dark-300 hover:bg-dark-800 hover:text-dark-100 border border-transparent'
              }`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-dark-800 p-4">
        <p className="text-[10px] text-dark-500 leading-relaxed">
          FinanzApp v1.0<br />
          Todos tus datos están locales
        </p>
      </div>
    </aside>
  );
}
