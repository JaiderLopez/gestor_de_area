import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import './Layout.css';

const Layout = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    return (
        <div className="app-layout">
            <Sidebar
                isCollapsed={isSidebarCollapsed}
                toggleSidebar={toggleSidebar}
            />
            <div className={`main-content-wrapper ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
                <header className="top-bar">
                    <div className="search-bar">
                        {/* Placeholder for global search if needed */}
                    </div>
                    <div className="top-actions">
                        {/* Placeholders for notifications, etc */}
                    </div>
                </header>
                <main className="main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
