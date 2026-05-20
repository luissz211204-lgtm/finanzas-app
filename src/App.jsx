import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FinanzasProvider } from './store/FinanzasContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Ingresos from './pages/Ingresos';
import Gastos from './pages/Gastos';
import Deudas from './pages/Deudas';
import Ahorro from './pages/Ahorro';
import Metas from './pages/Metas';
import Calculadora from './pages/Calculadora';
import Historial from './pages/Historial';
import Configuracion from './pages/Configuracion';
import PinGate from './components/PinGate';

export default function App() {
  return (
    <BrowserRouter>
      <FinanzasProvider>
        <PinGate>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/ingresos" element={<Ingresos />} />
              <Route path="/gastos" element={<Gastos />} />
              <Route path="/deudas" element={<Deudas />} />
              <Route path="/ahorro" element={<Ahorro />} />
              <Route path="/metas" element={<Metas />} />
              <Route path="/calculadora" element={<Calculadora />} />
              <Route path="/historial" element={<Historial />} />
              <Route path="/configuracion" element={<Configuracion />} />
            </Routes>
          </Layout>
        </PinGate>
      </FinanzasProvider>
    </BrowserRouter>
  );
}
