import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import DashboardHome from './pages/DashboardHome';
import DiscosDashboardPage from './modules/discos/DiscosDashboardPage';
// Placeholders
import { InventarioProvider } from './modules/inventario/InventarioContext';
import InventarioDashboardPage from './modules/inventario/InventarioDashboardPage';
import ReportesPlaceholder from './modules/reportes/ReportesPlaceholder';
import { MantenimientoProvider } from './modules/mantenimiento/MantenimientoContext';
import MantenimientoDashboardPage from './modules/mantenimiento/MantenimientoDashboardPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardHome />} />

          {/* Módulo de Discos */}
          <Route path="discos" element={<DiscosDashboardPage />} />

          {/* Módulos Futuros */}
          {/* Módulo de Inventario */}
          <Route path="inventario" element={
            <InventarioProvider>
              <InventarioDashboardPage />
            </InventarioProvider>
          } />
          <Route path="reportes" element={<ReportesPlaceholder />} />
          {/* Módulo de Mantenimiento */}
          <Route path="mantenimiento" element={
            <InventarioProvider> {/* Nested InventarioProvider because Form needs devices */}
              <MantenimientoProvider>
                <MantenimientoDashboardPage />
              </MantenimientoProvider>
            </InventarioProvider>
          } />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
