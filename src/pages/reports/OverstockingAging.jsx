import React, { useState } from 'react';
import { Download, AlertTriangle, Clock, Package } from 'lucide-react';
import './reports.css';

const OverstockingAging = () => {
    // Empty initial state ready for backend integration
    const [reportData] = useState([]);

    const getHealthBadge = (status) => {
        switch (status) {
            case 'Overstock': return 'badge-danger-light';
            case 'Stagnant': return 'badge-warning-light';
            case 'Aging': return 'badge-neutral';
            case 'Healthy': return 'badge-success-light';
            default: return 'badge-neutral';
        }
    };

    return (
        <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div className="page-header" style={{ marginBottom: 0 }}>
                <div>
                    <h1 className="page-title">Overstock & Inventory Aging</h1>
                    <p className="page-subtitle">Identify slow-moving items and optimize warehouse space</p>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary">
                        <Download size={16} /> Download Report
                    </button>
                </div>
            </div>

            {/* Summary Metrics */}
            <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                <div className="metric-card" style={{ borderTop: '4px solid #f7685b' }}>
                    <div className="metric-header" style={{ marginBottom: 16 }}>
                        <span className="metric-title" style={{ fontSize: 13, color: '#f7685b', fontWeight: 600 }}>Total Overstock Value</span>
                        <AlertTriangle size={20} className="text-orange" color="#f7685b" />
                    </div>
                    <div className="metric-value" style={{ fontSize: '1.8rem', color: '#102a43' }}>₱0.00</div>
                </div>

                <div className="metric-card" style={{ borderTop: '4px solid #f2994a' }}>
                    <div className="metric-header" style={{ marginBottom: 16 }}>
                        <span className="metric-title" style={{ fontSize: 13, color: '#f2994a', fontWeight: 600 }}>Items &gt; 90 Days Old</span>
                        <Clock size={20} className="text-orange" color="#f2994a" />
                    </div>
                    <div className="metric-value" style={{ fontSize: '1.8rem', color: '#102a43' }}>0 <span style={{ fontSize: '1rem', color: '#627d98', fontWeight: 500 }}>SKUs</span></div>
                </div>

                <div className="metric-card" style={{ borderTop: '4px solid #627d98' }}>
                    <div className="metric-header" style={{ marginBottom: 16 }}>
                        <span className="metric-title" style={{ fontSize: 13, color: '#627d98', fontWeight: 600 }}>Dead Stock (0 Sales)</span>
                        <Package size={20} color="#627d98" />
                    </div>
                    <div className="metric-value" style={{ fontSize: '1.8rem', color: '#102a43' }}>0 <span style={{ fontSize: '1rem', color: '#627d98', fontWeight: 500 }}>SKUs</span></div>
                </div>
            </div>

            <div className="card table-card" style={{ padding: '0 0 24px 0', border: 'none', boxShadow: 'none' }}>
                <h3 className="section-title mb-4" style={{ padding: '0 24px' }}>Inventory Health Report</h3>

                {/* Data Table reusing classes from inventory.css if applicable, else inline for speed */}
                <div className="table-responsive">
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: '#f9fbfd' }}>
                                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Product</th>
                                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Days in Stock</th>
                                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Quantity</th>
                                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Total Value</th>
                                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Health Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center text-muted" style={{ padding: '48px 0' }}>
                                        No health issues or aging stock currently identified.
                                    </td>
                                </tr>
                            ) : (
                                reportData.map((item) => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                <span className="font-medium text-main" style={{ fontSize: 13 }}>{item.product}</span>
                                                <span className="text-muted" style={{ fontSize: 12 }}>{item.sku}</span>
                                            </div>
                                        </td>
                                        <td className="text-muted" style={{ padding: '16px 24px', fontSize: 13 }}>{item.daysInStock} days</td>
                                        <td className="font-medium" style={{ padding: '16px 24px', fontSize: 13 }}>{item.quantity}</td>
                                        <td className="font-medium text-main" style={{ padding: '16px 24px', fontSize: 13 }}>₱{item.value.toFixed(2)}</td>
                                        <td style={{ padding: '16px 24px' }}>
                                            {/* Badge logic expects the global classes defined earlier */}
                                            <span className={`badge ${getHealthBadge(item.status)}`} style={{ display: 'inline-flex', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                                                {item.status}
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

export default OverstockingAging;
