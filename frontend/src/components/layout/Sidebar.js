import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ isCollapsed, toggleSidebar, isMobileOpen, closeMobileMenu }) => {
  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        {!isCollapsed && <h2>Gestor IT</h2>}
        <button className="collapse-btn desktop-only" onClick={toggleSidebar} title={isCollapsed ? "Expandir" : "Contraer"}>
          {isCollapsed ? '➡' : '⬅'}
        </button>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink to="/" onClick={closeMobileMenu} className={({ isActive }) => (isActive ? 'active' : '')} end title="Dashboard">
              <span className="icon">🏠</span>
              {!isCollapsed && <span className="link-text">Dashboard</span>}
            </NavLink>
          </li>
          <li className="nav-section-title">
            {!isCollapsed ? 'Módulos' : '...'}
          </li>
          <li>
            <NavLink to="/discos" onClick={closeMobileMenu} className={({ isActive }) => (isActive ? 'active' : '')} title="Gestor de Discos">
              <span className="icon">💾</span>
              {!isCollapsed && <span className="link-text">Gestor de Discos</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/inventario" onClick={closeMobileMenu} className={({ isActive }) => (isActive ? 'active' : '')} title="Inventario">
              <span className="icon">🖥️</span>
              {!isCollapsed && <span className="link-text">Inventario</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/reportes" onClick={closeMobileMenu} className={({ isActive }) => (isActive ? 'active' : '')} title="Reportes">
              <span className="icon">📊</span>
              {!isCollapsed && <span className="link-text">Reportes</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/mantenimiento" onClick={closeMobileMenu} className={({ isActive }) => (isActive ? 'active' : '')} title="Mantenimiento">
              <span className="icon">🛠️</span>
              {!isCollapsed && <span className="link-text">Mantenimiento</span>}
            </NavLink>
          </li>
        </ul>
      </nav>
      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">AD</div>
          {!isCollapsed && (
            <div className="user-details">
              <span className="user-name">Admin</span>
              <span className="user-role">Sistemas</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
