import React, { useState } from 'react';
import { Download, Calendar, DollarSign, ShoppingBag, TrendingUp, Filter } from 'lucide-react';
import './inventory.css'; // Shared inventory styles

const Sales = () => {
    // Empty initial state ready for backend integration
    const [transactions] = useState([]);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Completed': return 'badge-success-light';
            case 'Processing': return 'badge-warning-light';
            case 'Shipped': return 'badge-info-light';
            default: return 'badge-neutral';
        }
    };

    return (
        <div className="page-wrapper">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Sales Records</h1>
                    <p className="page-subtitle">View recent transactions and daily summaries</p>
                </div>
            </div>

            {/* Summary Metrics */}
            <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="metric-card">
                    <div className="metric-header" style={{ marginBottom: 0 }}>
                        <div className="metric-icon bg-blue-light" style={{ width: 48, height: 48, borderRadius: '50%' }}>
                            <DollarSign size={24} className="text-blue" />
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <span className="metric-title" style={{ fontSize: 13 }}>Today's Revenue</span>
                            <div className="metric-value" style={{ fontSize: '1.5rem', marginBottom: 0 }}>₱ 0.00</div>
                        </div>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-header" style={{ marginBottom: 0 }}>
                        <div className="metric-icon bg-green-light" style={{ width: 48, height: 48, borderRadius: '50%' }}>
                            <ShoppingBag size={24} className="text-green" />
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <span className="metric-title" style={{ fontSize: 13 }}>Orders Today</span>
                            <div className="metric-value" style={{ fontSize: '1.5rem', marginBottom: 0 }}>0</div>
                        </div>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-header" style={{ marginBottom: 0 }}>
                        <div className="metric-icon bg-orange-light" style={{ width: 48, height: 48, borderRadius: '50%' }}>
                            <TrendingUp size={24} className="text-orange" />
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <span className="metric-title" style={{ fontSize: 13 }}>Avg. Order Value</span>
                            <div className="metric-value" style={{ fontSize: '1.5rem', marginBottom: 0 }}>₱ 0.00</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card table-card mt-2">
                {/* Table Toolbar */}
                <div className="table-toolbar">
                    <h3 className="section-title mb-0">Recent Transactions</h3>
                    <button className="text-link" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={16} /> Filter by Date
                    </button>
                </div>

                {/* Data Table */}
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Date</th>
                                <th>Customer</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center text-muted" style={{ padding: '48px 0' }}>
                                        No recent transactions.
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((tx) => (
                                    <tr key={tx.id}>
                                        <td className="text-blue font-medium">{tx.id}</td>
                                        <td className="text-muted">{tx.date}</td>
                                        <td className="font-medium">{tx.customer}</td>
                                        <td className="text-muted">{tx.items}</td>
                                        <td className="font-medium">₱{tx.total.toFixed(2)}</td>
                                        <td>
                                            <span className={`badge ${getStatusBadge(tx.status)}`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Sales;
