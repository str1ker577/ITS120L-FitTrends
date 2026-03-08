import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, LogOut, User } from 'lucide-react';
import './dashboard.css';

// ── Roles ──────────────────────────────────────────────────────────────────
// The backend returns role as a string e.g. "SUPER_ADMIN", "OWNER", "ADMIN", "STAFF"
// ADMIN_ROLES can see everything. STAFF can only see inventory + reports.
const ADMIN_ROLES = ['SUPER_ADMIN', 'OWNER', 'ADMIN'];

// ── Session helpers ────────────────────────────────────────────────────────
function getSession() {
    try {
        return JSON.parse(localStorage.getItem('fittrends_user')) || {};
    } catch {
        return {};
    }
}

function getInitials(name = '') {
    return name
        .split(' ')
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'FT';
}

const Layout = () => {
    const navigate = useNavigate();
    const session  = getSession();
    const isAdmin  = ADMIN_ROLES.includes(session.role);

    const [activeDropdown, setActiveDropdown] = useState(null);
    const [showUserMenu,   setShowUserMenu]   = useState(false);

    const toggleDropdown = (menu) => {
        setActiveDropdown(prev => prev === menu ? null : menu);
        setShowUserMenu(false);
    };

    const closeAll = () => {
        setActiveDropdown(null);
        setShowUserMenu(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('fittrends_user');
        navigate('/login');
    };

    return (
        <div className="dashboard-layout" onClick={closeAll}>
            {/* Top Header */}
            <header className="top-nav">
                <div className="nav-container">
                    {/* Logo */}
                    <div className="nav-logo" onClick={() => navigate('/home')}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="3" y="3" width="18" height="18" rx="4" fill="var(--primary)" />
                            <path d="M7 8L17 8M7 12L17 12M7 16L13 16" stroke="white" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <span className="logo-text">FitTrends</span>
                    </div>

                    {/* Navigation Links */}
                    <nav className="nav-links" onClick={e => e.stopPropagation()}>
                        <NavLink to="/home" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')} onClick={closeAll}>
                            Home
                        </NavLink>

                        {/* Inventory Dropdown */}
                        <div className="nav-dropdown-wrapper">
                            <button
                                className={`nav-item ${activeDropdown === 'inventory' ? 'active-dropdown' : ''}`}
                                onClick={(e) => { e.stopPropagation(); toggleDropdown('inventory'); }}
                            >
                                Inventory <ChevronDown size={14} className="dropdown-icon" />
                            </button>
                            {activeDropdown === 'inventory' && (
                                <div className="dropdown-menu">
                                    <NavLink to="/inventory/catalog" className="dropdown-link" onClick={closeAll}>Product Catalog</NavLink>
                                    <NavLink to="/inventory/sales" className="dropdown-link" onClick={closeAll}>Sales</NavLink>
                                    <NavLink to="/inventory/adjustments" className="dropdown-link" onClick={closeAll}>Stock Adjustment</NavLink>
                                </div>
                            )}
                        </div>

                        {/* Reports Dropdown */}
                        <div className="nav-dropdown-wrapper">
                            <button
                                className={`nav-item ${activeDropdown === 'reports' ? 'active-dropdown' : ''}`}
                                onClick={(e) => { e.stopPropagation(); toggleDropdown('reports'); }}
                            >
                                Reports <ChevronDown size={14} className="dropdown-icon" />
                            </button>
                            {activeDropdown === 'reports' && (
                                <div className="dropdown-menu">
                                    <NavLink to="/reports/sales" className="dropdown-link" onClick={closeAll}>Sales Performance</NavLink>
                                    <NavLink to="/reports/aging" className="dropdown-link" onClick={closeAll}>Overstocking &amp; Aging</NavLink>
                                </div>
                            )}
                        </div>

                        {/* Restocking Dropdown */}
                        <div className="nav-dropdown-wrapper">
                            <button
                                className={`nav-item ${activeDropdown === 'restocking' ? 'active-dropdown' : ''}`}
                                onClick={(e) => { e.stopPropagation(); toggleDropdown('restocking'); }}
                            >
                                Restocking <ChevronDown size={14} className="dropdown-icon" />
                            </button>
                            {activeDropdown === 'restocking' && (
                                <div className="dropdown-menu">
                                    <NavLink to="/restocking/optimal" className="dropdown-link" onClick={closeAll}>Optimal Stock List</NavLink>
                                    {/* Admin-only restocking pages */}
                                    {isAdmin && (
                                        <>
                                            <NavLink to="/restocking/model" className="dropdown-link" onClick={closeAll}>Model Decision</NavLink>
                                            <NavLink to="/restocking/forecast" className="dropdown-link" onClick={closeAll}>ML Forecast</NavLink>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Settings Dropdown — admin only */}
                        {isAdmin && (
                            <div className="nav-dropdown-wrapper">
                                <button
                                    className={`nav-item ${activeDropdown === 'settings' ? 'active-dropdown' : ''}`}
                                    onClick={(e) => { e.stopPropagation(); toggleDropdown('settings'); }}
                                >
                                    Settings <ChevronDown size={14} className="dropdown-icon" />
                                </button>
                                {activeDropdown === 'settings' && (
                                    <div className="dropdown-menu">
                                        <NavLink to="/settings/users" className="dropdown-link" onClick={closeAll}>User Management</NavLink>
                                    </div>
                                )}
                            </div>
                        )}
                    </nav>

                    {/* User Profile & Actions */}
                    <div className="nav-actions" onClick={e => e.stopPropagation()}>
                        <button className="icon-btn notification-btn" style={{ flexShrink: 0 }}>
                            <Bell size={20} />
                            <span className="badge"></span>
                        </button>

                        {/* Avatar with dropdown */}
                        <div className="nav-dropdown-wrapper" style={{ position: 'relative' }}>
                            <div
                                className="user-profile"
                                style={{ cursor: 'pointer' }}
                                onClick={() => { setShowUserMenu(prev => !prev); setActiveDropdown(null); }}
                            >
                                <div className="user-info">
                                    <span className="user-name">{session.name || 'User'}</span>
                                    <span className="user-role">{session.role || '—'}</span>
                                </div>
                                <div className="user-avatar" title="Account menu">
                                    {getInitials(session.name)}
                                </div>
                            </div>

                            {showUserMenu && (
                                <div className="dropdown-menu" style={{ right: 0, left: 'auto', minWidth: 160 }}>
                                    <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', fontSize: 12, color: 'var(--text-muted)' }}>
                                        <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: 2 }}>{session.name}</div>
                                        <div>{session.email}</div>
                                    </div>
                                    <button
                                        className="dropdown-link"
                                        style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', border: 'none', background: 'none', cursor: 'pointer', color: '#f7685b' }}
                                        onClick={handleLogout}
                                    >
                                        <LogOut size={14} />
                                        Sign out
                                    </button>
                                </div>
                            )}
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
