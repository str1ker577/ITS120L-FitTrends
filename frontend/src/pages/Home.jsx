import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Package, TrendingUp, ShoppingCart, AlertCircle, ArrowRight, Activity, Database, CheckCircle2, X } from 'lucide-react';
import { fetchProducts, fetchInventory, fetchOrders } from '../api';
import '../components/dashboard.css';
import './home.css';

const Home = () => {
    const navigate = useNavigate();

    // Get current date for the header
    const today = new Date();
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = today.toLocaleDateString('en-US', dateOptions);

    const [metrics, setMetrics] = useState({
        totalProducts: 0,
        lowStockAlerts: 0,
        monthlyRevenue: 0,
        pendingOrders: 0
    });
    
    const [loading, setLoading] = useState(true);
    const [lowStockItems, setLowStockItems] = useState([]);
    const [showAlertModal, setShowAlertModal] = useState(false);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const [products, inventory, orders] = await Promise.all([
                    fetchProducts(),
                    fetchInventory(),
                    fetchOrders()
                ]);

                // Calculate metrics securely from data
                const lowStockList = inventory
                    .filter(inv => inv.runningInventory <= 10)
                    .map(inv => {
                        const product = products.find(p => p.id === inv.productId);
                        return {
                            ...inv,
                            productName: product ? `${product.productName} (${product.size})` : 'Unknown Product'
                        };
                    });
                
                setLowStockItems(lowStockList);
                if (lowStockList.length > 0) {
                    setShowAlertModal(true);
                }
                
                // Calculate current month's revenue
                const currentMonth = new Date().getMonth();
                const currentYear = new Date().getFullYear();
                
                const monthOrders = orders.filter(o => {
                    const orderDate = new Date(o.orderDate);
                    return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
                });
                
                const revenue = monthOrders.reduce((sum, order) => sum + order.netSales, 0);
                
                // Estimate pending orders
                const pendingCount = orders.filter(o => {
                    // Simulating pending logic for demo based on delivery date
                    const deliveryDate = new Date(o.deliveryDate);
                    return deliveryDate > new Date();
                }).length;

                setMetrics({
                    totalProducts: products.length,
                    lowStockAlerts: lowStockList.length,
                    monthlyRevenue: revenue,
                    pendingOrders: pendingCount
                });
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    return (
        <div className="home-dashboard">
            {/* Low Stock Alert Modal */}
            {showAlertModal && lowStockItems.length > 0 && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '500px' }}>
                        <div className="modal-header" style={{ borderBottom: '1px solid #fee2e2', backgroundColor: '#fef2f2', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
                            <h2 className="modal-title" style={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <AlertCircle size={24} /> Low Stock Alert
                            </h2>
                            <button className="modal-close" onClick={() => setShowAlertModal(false)} style={{ color: '#ef4444' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <p className="mb-4 text-muted">The following products are running low on stock and may need immediate action:</p>
                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {lowStockItems.map((item, index) => (
                                        <li key={index} style={{ padding: '12px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 500 }}>{item.productName}</span>
                                            <span className="badge badge-danger-light">{item.runningInventory} left</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn-primary" onClick={() => { setShowAlertModal(false); navigate('/inventory/catalog'); }}>
                                Go to Inventory
                            </button>
                            <button type="button" className="btn-outline" onClick={() => setShowAlertModal(false)}>
                                Dismiss
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                    <div className="metric-value">{loading ? '...' : metrics.totalProducts}</div>
                    <div className="metric-trend text-muted" style={{ fontSize: 13 }}>
                        All active SKUs
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-header">
                        <span className="metric-title">Low Stock Alerts</span>
                        <div className="metric-icon bg-orange-light">
                            <AlertCircle size={20} className="text-orange" />
                        </div>
                    </div>
                    <div className="metric-value">{loading ? '...' : metrics.lowStockAlerts}</div>
                    <div className="metric-trend text-muted" style={{ fontSize: 13 }}>
                        Requires attention
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-header">
                        <span className="metric-title">Monthly Revenue</span>
                        <div className="metric-icon bg-green-light">
                            <TrendingUp size={20} className="text-green" />
                        </div>
                    </div>
                    <div className="metric-value">{loading ? '...' : `₱${metrics.monthlyRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</div>
                    <div className="metric-trend text-muted" style={{ fontSize: 13 }}>
                        Current month net sales
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-header">
                        <span className="metric-title">Pending Orders</span>
                        <div className="metric-icon bg-purple-light">
                            <ShoppingCart size={20} className="text-purple" />
                        </div>
                    </div>
                    <div className="metric-value">{loading ? '...' : metrics.pendingOrders}</div>
                    <div className="metric-trend text-muted" style={{ fontSize: 13 }}>
                        Awaiting delivery
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
                <div className="card alerts-card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="card-header-flex">
                        <h3 className="section-title mb-0">Recent Alerts</h3>
                        <button className="text-link" onClick={() => navigate('/inventory/catalog')}>View Catalog</button>
                    </div>

                    <div className="alerts-list" style={{ flex: 1, overflowY: 'auto' }}>
                        {lowStockItems.length === 0 ? (
                            <div className="p-4 text-center text-muted" style={{ padding: '32px 16px', fontSize: 14 }}>
                                No recent alerts. Everything looks good!
                            </div>
                        ) : (
                            <div className="recent-alert-items" style={{ padding: '16px' }}>
                                {lowStockItems.slice(0, 5).map((item, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px', borderBottom: i < Math.min(lowStockItems.length, 5) - 1 ? '1px solid #f3f4f6' : 'none', paddingBottom: i < Math.min(lowStockItems.length, 5) - 1 ? '16px' : '0' }}>
                                        <div style={{ padding: '8px', backgroundColor: '#fef2f2', borderRadius: '50%', color: '#ef4444' }}>
                                            <AlertCircle size={16} />
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontWeight: 500, fontSize: '14px', color: '#111827' }}>Restock Needed</p>
                                            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b7280' }}>
                                                {item.productName} is running low ({item.runningInventory} in stock).
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {lowStockItems.length > 5 && (
                                    <div className="text-center" style={{ marginTop: '8px' }}>
                                        <span className="text-link" style={{ fontSize: '13px' }}>+ {lowStockItems.length - 5} more</span>
                                    </div>
                                )}
                            </div>
                        )}
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
