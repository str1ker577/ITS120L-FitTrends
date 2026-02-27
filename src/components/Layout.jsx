import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown } from 'lucide-react';
import './dashboard.css';

const Layout = () => {
    const navigate = useNavigate();

    // Dropdown states
    const [activeDropdown, setActiveDropdown] = useState(null);

    const toggleDropdown = (menu) => {
        if (activeDropdown === menu) {
            setActiveDropdown(null);
        } else {
            setActiveDropdown(menu);
        }
    };

    const closeDropdown = () => {
        setActiveDropdown(null);
    };

    const handleLogout = () => {
        navigate('/login');
    };

    return (
        <div className="dashboard-layout">
            {/* Top Header */}
            <header className="top-nav">
                <div className="nav-container">
                    {/* Logo */}
                    <div className="nav-logo" onClick={() => navigate('/home')}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            {/* Simple placeholder logo resembling a box */}
                            <rect x="3" y="3" width="18" height="18" rx="4" fill="var(--primary)" />
                            <path d="M7 8L17 8M7 12L17 12M7 16L13 16" stroke="white" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <span className="logo-text">FitTrends</span>
                    </div>

                    {/* Navigation Links */}
                    <nav className="nav-links">
                        <NavLink to="/home" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')} onClick={closeDropdown}>
                            Home
                        </NavLink>

                        {/* Inventory Dropdown */}
                        <div className="nav-dropdown-wrapper">
                            <button
                                className={`nav-item ${activeDropdown === 'inventory' ? 'active-dropdown' : ''}`}
                                onClick={(e) => { e.preventDefault(); toggleDropdown('inventory'); }}
                            >
                                Inventory <ChevronDown size={14} className="dropdown-icon" />
                            </button>
                            {activeDropdown === 'inventory' && (
                                <div className="dropdown-menu">
                                    <NavLink to="/inventory/catalog" className="dropdown-link" onClick={closeDropdown}>Product Catalog</NavLink>
                                    <NavLink to="/inventory/sales" className="dropdown-link" onClick={closeDropdown}>Sales</NavLink>
                                    <NavLink to="/inventory/adjustments" className="dropdown-link" onClick={closeDropdown}>Stock Adjustment</NavLink>
                                </div>
                            )}
                        </div>

                        {/* Reports Dropdown */}
                        <div className="nav-dropdown-wrapper">
                            <button
                                className={`nav-item ${activeDropdown === 'reports' ? 'active-dropdown' : ''}`}
                                onClick={(e) => { e.preventDefault(); toggleDropdown('reports'); }}
                            >
                                Reports <ChevronDown size={14} className="dropdown-icon" />
                            </button>
                            {activeDropdown === 'reports' && (
                                <div className="dropdown-menu">
                                    <NavLink to="/reports/sales" className="dropdown-link" onClick={closeDropdown}>Sales Performance</NavLink>
                                    <NavLink to="/reports/aging" className="dropdown-link" onClick={closeDropdown}>Overstocking & Aging</NavLink>
                                </div>
                            )}
                        </div>

                        {/* Restocking Dropdown */}
                        <div className="nav-dropdown-wrapper">
                            <button
                                className={`nav-item ${activeDropdown === 'restocking' ? 'active-dropdown' : ''}`}
                                onClick={(e) => { e.preventDefault(); toggleDropdown('restocking'); }}
                            >
                                Restocking <ChevronDown size={14} className="dropdown-icon" />
                            </button>
                            {activeDropdown === 'restocking' && (
                                <div className="dropdown-menu">
                                    <NavLink to="/restocking/optimal" className="dropdown-link" onClick={closeDropdown}>Optimal Stock List</NavLink>
                                    <NavLink to="/restocking/model" className="dropdown-link" onClick={closeDropdown}>Model Decision</NavLink>
                                </div>
                            )}
                        </div>
                    </nav>

                    {/* User Profile & Actions */}
                    <div className="nav-actions">
                        <button className="icon-btn notification-btn" style={{ flexShrink: 0 }}>
                            <Bell size={20} />
                            <span className="badge"></span>
                        </button>
                        <div className="user-profile">
                            <div className="user-info">
                                <span className="user-name">Retail Manager</span>
                                <span className="user-role">Admin</span>
                            </div>
                            <div className="user-avatar" onClick={handleLogout} title="Logout">
                                RM
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="main-content">
                <div className="page-container">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
