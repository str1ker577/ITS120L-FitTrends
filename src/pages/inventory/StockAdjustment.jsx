import React, { useState } from 'react';
import { History, Upload, Save, AlertTriangle } from 'lucide-react';
import './inventory.css'; // Shared inventory styles

const StockAdjustment = () => {
    // Empty initial state ready for backend integration
    const [adjustments] = useState([]);

    return (
        <div className="page-wrapper" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="page-header" style={{ marginBottom: 32 }}>
                <div>
                    <h1 className="page-title">Stock Adjustment</h1>
                    <p className="page-subtitle">Manually update inventory levels or upload bulk changes</p>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary">
                        <History size={16} /> View History
                    </button>
                    <button className="btn-secondary">
                        <Upload size={16} /> Upload CSV
                    </button>
                </div>
            </div>

            <div className="card" style={{ marginBottom: 24, padding: 32 }}>
                <h3 className="section-title mb-4">New Adjustment</h3>

                <form>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                        <div className="form-group mb-0">
                            <label className="label font-medium mb-2">Product SKU</label>
                            <input type="text" className="input" placeholder="e.g. SKU-1001" />
                        </div>
                        <div className="form-group mb-0">
                            <label className="label font-medium mb-2">Quantity Change</label>
                            <input type="text" className="input" placeholder="+10 or -5" />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 24 }}>
                        <label className="label font-medium mb-2">Reason</label>
                        <select className="input" style={{ appearance: 'none', backgroundColor: 'white' }}>
                            <option>Restock Shipment</option>
                            <option>Damage/Loss</option>
                            <option>Inventory Count Correction</option>
                            <option>Return</option>
                        </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: 32 }}>
                        <label className="label font-medium mb-2">Notes (Optional)</label>
                        <textarea
                            className="input"
                            placeholder="Add any additional details..."
                            style={{ minHeight: 80, resize: 'vertical' }}
                        ></textarea>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn-primary">
                            <Save size={16} /> Save Adjustment
                        </button>
                    </div>
                </form>
            </div>

            <div className="card" style={{
                marginBottom: 24,
                padding: '16px 20px',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: 8
            }}>
                <div style={{ display: 'flex', gap: 12 }}>
                    <AlertTriangle size={20} className="text-blue" style={{ flexShrink: 0 }} />
                    <div>
                        <h4 style={{ fontSize: 13, fontWeight: 600, color: '#1e3a8a', marginBottom: 4 }}>Important Note</h4>
                        <p style={{ fontSize: 13, color: '#1e40af', lineHeight: 1.5 }}>
                            Stock adjustments are permanent and affect financial reporting. Please ensure all manual adjustments are verified by a supervisor.
                        </p>
                    </div>
                </div>
            </div>

            <div className="card">
                <h3 className="section-title mb-4">Recent Adjustments</h3>

                <div className="alerts-list">
                    {adjustments.length === 0 ? (
                        <div className="p-4 text-center text-muted" style={{ padding: '32px 16px', fontSize: 14 }}>
                            No recent stock adjustments.
                        </div>
                    ) : (
                        adjustments.map((adj) => (
                            <div key={adj.id} className="alert-item border-bottom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div className="font-medium" style={{ color: 'var(--primary)', marginBottom: 4 }}>{adj.sku}</div>
                                    <div className="text-muted" style={{ fontSize: 13 }}>{adj.reason}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div className="font-medium text-green">{adj.amount}</div>
                                    <div className="text-muted" style={{ fontSize: 12 }}>{adj.time}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

        </div>
    );
};

export default StockAdjustment;
