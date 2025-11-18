import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DiscosDashboardPage from './modules/discos/DiscosDashboardPage';
import DiscoNewPage from './modules/discos/DiscoNewPage';
import DiscoEditPage from './modules/discos/DiscoEditPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/discos" />} />
        <Route path="/discos" element={<DiscosDashboardPage />} />
        <Route path="/discos/new" element={<DiscoNewPage />} />
        <Route path="/discos/:id/edit" element={<DiscoEditPage />} />
      </Routes>
    </Router>
  );
}

export default App;
