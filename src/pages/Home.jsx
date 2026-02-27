import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, TrendingUp, ShoppingCart, AlertCircle, ArrowRight, Activity, Database, CheckCircle2 } from 'lucide-react';
import '../components/dashboard.css';
import './home.css';

const Home = () => {
    const navigate = useNavigate();

    // Get current date for the header
    const today = new Date();
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = today.toLocaleDateString('en-US', dateOptions);

    return (
        <div className="home-dashboard">
            {/* Welcome Header */}
            <div className="welcome-header">
                <div>
                    <h1 className="page-title">Welcome back, Manager</h1>
                    <p className="page-subtitle">
                        <Activity size={14} className="inline-icon" /> {formattedDate}
                    </p>
                </div>
                <div className="system-status-badges">
                    <span className="badge badge-success">System Online</span>
                    <span className="badge badge-neutral">v2.4.0</span>
                </div>
            </div>

            {/* Summary Metrics Grid */}
            <div className="metrics-grid">
                <div className="metric-card">
                    <div className="metric-header">
                        <span className="metric-title">Total Products</span>
                        <div className="metric-icon bg-blue-light">
                            <Package size={20} className="text-blue" />
                        </div>
                    </div>
                    <div className="metric-value">0</div>
                    <div className="metric-trend text-muted" style={{ fontSize: 13 }}>
                        No data available
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-header">
                        <span className="metric-title">Low Stock Alerts</span>
                        <div className="metric-icon bg-orange-light">
                            <AlertCircle size={20} className="text-orange" />
                        </div>
                    </div>
                    <div className="metric-value">0</div>
                    <div className="metric-trend text-muted" style={{ fontSize: 13 }}>
                        No data available
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-header">
                        <span className="metric-title">Monthly Revenue</span>
                        <div className="metric-icon bg-green-light">
                            <TrendingUp size={20} className="text-green" />
                        </div>
                    </div>
                    <div className="metric-value">₱0.00</div>
                    <div className="metric-trend text-muted" style={{ fontSize: 13 }}>
                        No data available
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-header">
                        <span className="metric-title">Pending Orders</span>
                        <div className="metric-icon bg-purple-light">
                            <ShoppingCart size={20} className="text-purple" />
                        </div>
                    </div>
                    <div className="metric-value">0</div>
                    <div className="metric-trend text-muted" style={{ fontSize: 13 }}>
                        No data available
                    </div>
                </div>
            </div>

            {/* Quick Access Modules */}
            <div className="section-container">
                <h2 className="section-title">Quick Access Modules</h2>
                <div className="modules-grid">

                    {/* Inventory Module Card */}
                    <div className="module-card border-blue" onClick={() => navigate('/inventory/catalog')}>
                        <div className="module-icon-large bg-blue-light mb-4">
                            <Package size={24} className="text-blue" />
                        </div>
                        {/* Visual background element placeholder */}
                        <div className="module-bg-graphic graphic-box"></div>

                        <h3 className="module-title">Inventory Management</h3>
                        <p className="module-desc">Manage your product catalog, track sales, and adjustments.</p>
                        <div className="module-link text-blue">
                            Open Module <ArrowRight size={16} />
                        </div>
                    </div>

                    {/* Reports Module Card */}
                    <div className="module-card border-green" onClick={() => navigate('/reports/sales')}>
                        <div className="module-icon-large bg-green-light mb-4">
                            <Activity size={24} className="text-green" />
                        </div>
                        {/* Visual background element placeholder */}
                        <div className="module-bg-graphic graphic-chart"></div>

                        <h3 className="module-title">Report Visualization</h3>
                        <p className="module-desc">View detailed sales performance dashboards and analytics.</p>
                        <div className="module-link text-green">
                            Open Module <ArrowRight size={16} />
                        </div>
                    </div>

                    {/* Restocking Module Card */}
                    <div className="module-card border-orange" onClick={() => navigate('/restocking/optimal')}>
                        <div className="module-icon-large bg-orange-light mb-4">
                            <Database size={24} className="text-orange" />
                        </div>
                        {/* Visual background element placeholder */}
                        <div className="module-bg-graphic graphic-brain"></div>

                        <h3 className="module-title">Restocking Suggestions</h3>
                        <p className="module-desc">AI-powered restocking recommendations and insights.</p>
                        <div className="module-link text-orange">
                            Open Module <ArrowRight size={16} />
                        </div>
                    </div>

                </div>
            </div>

            {/* Recent Alerts & System Status */}
            <div className="dashboard-bottom-grid">
                <div className="card alerts-card">
                    <div className="card-header-flex">
                        <h3 className="section-title mb-0">Recent Alerts</h3>
                        <button className="text-link">View All</button>
                    </div>

                    <div className="alerts-list">
                        <div className="p-4 text-center text-muted" style={{ padding: '32px 16px', fontSize: 14 }}>
                            No recent alerts. Everything looks good!
                        </div>
                    </div>
                </div>

                <div className="card status-card">
                    <div className="card-header-flex">
                        <h3 className="section-title mb-0">System Status</h3>
                        <div className="status-indicator">
                            <span className="status-dot green"></span> All Systems Operational
                        </div>
                    </div>

                    <div className="status-list">
                        <div className="status-item">
                            <span className="status-label">Database Sync</span>
                            <span className="badge badge-success-light">Active</span>
                        </div>
                        <div className="status-item">
                            <span className="status-label">AI Model Status</span>
                            <span className="badge badge-success-light">Ready</span>
                        </div>

                        <div className="status-progress-container mt-4">
                            <div className="status-time-row">
                                <span className="status-label">Last Model Training</span>
                                <span className="status-value">Feb 5, 2026 02:00 AM</span>
                            </div>
                            <div className="progress-bar-bg">
                                <div className="progress-bar-fill" style={{ width: '99.9%' }}></div>
                            </div>
                            <div className="progress-subtext text-right mt-2">99.9% Uptime</div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Home;
