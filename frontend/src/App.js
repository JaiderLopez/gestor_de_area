import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import DashboardHome from './pages/DashboardHome';
import DiscosDashboardPage from './modules/discos/DiscosDashboardPage';
// Placeholders
import { InventarioProvider } from './modules/inventario/InventarioContext';
import InventarioDashboardPage from './modules/inventario/InventarioDashboardPage';
import { MantenimientoProvider } from './modules/mantenimiento/MantenimientoContext';
import PublicReporteForm from './modules/reportes/PublicReporteForm';
import AdminReportesPage from './modules/reportes/AdminReportesPage';
import MantenimientoDashboardPage from './modules/mantenimiento/MantenimientoDashboardPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta Pública fuera del Layout principal? o dentro? 
            Si queremos que usuarios normales la vean sin menú lateral, debería ser fuera.
            Pero para simplicidad, podemos dejarla dentro o crear una ruta específica sin layout.
            Dado el requerimiento de "facilidad", tal vez una ruta externa sea mejor.
        */}
        <Route path="/reportar" element={<PublicReporteForm />} />

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

          <Route path="reportes" element={<AdminReportesPage />} />

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
