import { useState, useRef } from 'react';
import { useFinanzas } from '../store/FinanzasContext';
import { exportData, importData } from '../utils/db';
import { Shield, Download, Upload, Key, Trash2 } from 'lucide-react';

export default function Configuracion() {
  const { state, dispatch } = useFinanzas();
  const fileInput = useRef();
  const [pinForm, setPinForm] = useState({ enabled: state.config.pinEnabled, pin: state.config.pin, confirmPin: '' });
  const [pinSaved, setPinSaved] = useState(false);
  const [importError, setImportError] = useState('');

  const handleSavePin = (e) => {
    e.preventDefault();
    if (pinForm.enabled && pinForm.pin.length < 4) {
      alert('El PIN debe tener al menos 4 dígitos');
      return;
    }
    if (pinForm.enabled && pinForm.pin !== pinForm.confirmPin) {
      alert('Los PIN no coinciden');
      return;
    }
    dispatch({
      type: 'UPDATE_CONFIG',
      payload: {
        pinEnabled: pinForm.enabled,
        pin: pinForm.enabled ? pinForm.pin : '',
      },
    });
    setPinSaved(true);
    setTimeout(() => setPinSaved(false), 2000);
  };

  const handleExport = () => {
    exportData(state);
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await importData(file);
      dispatch({ type: 'LOAD_STATE', payload: data });
      setImportError('');
      alert('Datos importados correctamente. Recarga la página para ver los cambios.');
    } catch (err) {
      setImportError(err.message);
    }
    e.target.value = '';
  };

  const handleClearData = () => {
    if (window.confirm('¿Estás seguro? Se borrarán TODOS tus datos financieros. Esta acción no se puede deshacer.')) {
      if (window.confirm('¿Realmente quieres borrar todo? Exporta tus datos antes si quieres respaldarlos.')) {
        dispatch({
          type: 'LOAD_STATE',
          payload: {
            ingresos: [],
            gastos: [],
            deudas: [],
            metas: [],
            ahorro: { total: 0, desbloqueado: false, historial: [] },
            config: state.config,
            currentWeekId: state.currentWeekId,
          },
        });
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-dark-50">Configuración</h1>
        <p className="text-sm text-dark-400">Seguridad y datos</p>
      </div>

      <div className="glass rounded-xl border border-dark-600 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-dark-700">
            <Key size={20} className="text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-dark-200">PIN de acceso</h3>
            <p className="text-xs text-dark-400">Protege la app con un PIN numérico</p>
          </div>
        </div>

        <form onSubmit={handleSavePin} className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={pinForm.enabled}
              onChange={(e) => setPinForm({ ...pinForm, enabled: e.target.checked })}
              className="rounded border-dark-500 bg-dark-700 text-cyan-500 focus:ring-cyan-500/50"
            />
            <span className="text-dark-200">Activar PIN</span>
          </label>

          {pinForm.enabled && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-dark-300 mb-1">PIN (4-6 dígitos)</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={pinForm.pin}
                  onChange={(e) => setPinForm({ ...pinForm, pin: e.target.value.replace(/\D/g, '') })}
                  className="w-full rounded-lg border border-dark-600 bg-dark-800 px-3 py-2 text-sm text-dark-50 outline-none focus:border-cyan-500/50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-dark-300 mb-1">Confirmar PIN</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={pinForm.confirmPin}
                  onChange={(e) => setPinForm({ ...pinForm, confirmPin: e.target.value.replace(/\D/g, '') })}
                  className="w-full rounded-lg border border-dark-600 bg-dark-800 px-3 py-2 text-sm text-dark-50 outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>
          )}

          <button type="submit"
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90">
            {pinSaved ? '✓ Guardado' : 'Guardar PIN'}
          </button>
        </form>
      </div>

      <div className="glass rounded-xl border border-dark-600 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-dark-700">
            <Shield size={20} className="text-green-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-dark-200">Respaldos</h3>
            <p className="text-xs text-dark-400">Exporta o importa tus datos en JSON</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={handleExport}
            className="flex items-center gap-2 rounded-xl border border-dark-600 bg-dark-800 px-4 py-2.5 text-sm font-medium text-dark-200 transition-all hover:border-cyan-500/30 hover:text-cyan-400">
            <Download size={16} /> Exportar datos
          </button>

          <button onClick={() => fileInput.current?.click()}
            className="flex items-center gap-2 rounded-xl border border-dark-600 bg-dark-800 px-4 py-2.5 text-sm font-medium text-dark-200 transition-all hover:border-cyan-500/30 hover:text-cyan-400">
            <Upload size={16} /> Importar datos
          </button>
          <input ref={fileInput} type="file" accept=".json" onChange={handleImport} className="hidden" />
        </div>
        {importError && <p className="mt-2 text-xs text-red-400">{importError}</p>}
      </div>

      <div className="glass rounded-xl border border-red-500/20 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
            <Trash2 size={20} className="text-red-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-dark-200">Zona de peligro</h3>
            <p className="text-xs text-dark-400">Borrar todos los datos (irreversible)</p>
          </div>
        </div>
        <button onClick={handleClearData}
          className="rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90">
          Borrar todos los datos
        </button>
      </div>

      <div className="text-center text-[10px] text-dark-500">
        <p>FinanzApp v1.0</p>
        <p>Todos los datos se almacenan localmente en tu navegador.</p>
        <p>No se envía información a servidores externos.</p>
      </div>
    </div>
  );
}
