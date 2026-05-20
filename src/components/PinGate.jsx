import { useState } from 'react';
import { useFinanzas } from '../store/FinanzasContext';
import { Wallet, Lock } from 'lucide-react';

export default function PinGate({ children }) {
  const { state, pinVerified, setPinVerified } = useFinanzas();
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState(false);

  if (!state.config.pinEnabled || pinVerified) {
    return children;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pinInput === state.config.pin) {
      setPinVerified(true);
      setError(false);
    } else {
      setError(true);
      setPinInput('');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-dark-950 p-4">
      <div className="w-full max-w-sm animate-scale-in">
        <div className="glass rounded-2xl border border-dark-600 p-8 text-center shadow-2xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/20">
            <Wallet size={28} className="text-cyan-400" />
          </div>
          <h1 className="text-xl font-bold text-dark-50">FinanzApp</h1>
          <p className="mt-1 text-sm text-dark-400">Ingresa tu PIN para acceder</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pinInput}
                onChange={(e) => { setPinInput(e.target.value.replace(/\D/g, '')); setError(false); }}
                className={`w-full rounded-xl border bg-dark-800 py-3 pl-10 pr-4 text-center text-lg tracking-[0.5em] text-dark-50 placeholder-dark-500 outline-none transition-colors ${
                  error ? 'border-red-500/50' : 'border-dark-600 focus:border-cyan-500/50'
                }`}
                placeholder="••••••"
                autoFocus
              />
            </div>
            {error && <p className="text-xs text-red-400">PIN incorrecto. Intenta de nuevo.</p>}
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
            >
              Desbloquear
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
