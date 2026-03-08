import React, { useState, useEffect } from 'react';
import { Brain, RefreshCw, TrendingUp, AlertTriangle, Package, CheckCircle } from 'lucide-react';
import { fetchForecast } from '../../api';
import './restocking.css';

const ForecastDashboard = () => {
    const [forecasts, setForecasts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    const loadForecast = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchForecast();
            setForecasts(data);
            setLastUpdated(new Date());
        } catch (err) {
            setError(err.message || 'Failed to load forecast data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadForecast();
    }, []);

    // ── Summary stats ──────────────────────────────────────────────────────────
    const totalSKUs        = forecasts.length;
    const avgPredicted     = totalSKUs > 0
        ? Math.round(forecasts.reduce((s, f) => s + f.predictedDemand, 0) / totalSKUs)
        : 0;
    const stockoutRiskCount = forecasts.filter(f => f.reorderQty > 0).length;
    const noActionCount     = forecasts.filter(f => f.reorderQty === 0).length;

    // ── Risk badge ─────────────────────────────────────────────────────────────
    const getRiskBadge = (f) => {
        if (f.reorderQty > 30)  return { label: 'High Risk',   cls: 'badge-high-risk' };
        if (f.reorderQty > 0)   return { label: 'Restock',     cls: 'badge-restock' };
        return                           { label: 'OK',          cls: 'badge-ok' };
    };

    const formatDate = (d) => d
        ? d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        : '—';

    return (
        <div className="page-wrapper">
            {/* ── Header ──────────────────────────────────────────────────────── */}
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="metric-icon bg-purple-light" style={{ width: 48, height: 48, borderRadius: 12 }}>
                        <Brain size={24} className="text-purple" />
                    </div>
                    <div>
                        <h1 className="page-title">ML Sales Forecast</h1>
                        <p className="page-subtitle">
                            VotingRegressor ensemble (Linear + KNN + Decision Tree) trained on live inventory data
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {lastUpdated && (
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            Last updated: {formatDate(lastUpdated)}
                        </span>
                    )}
                    <button
                        className="btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: 13 }}
                        onClick={loadForecast}
                        disabled={loading}
                    >
                        <RefreshCw size={14} className={loading ? 'spin' : ''} />
                        {loading ? 'Running Model…' : 'Refresh Forecast'}
                    </button>
                </div>
            </div>

            {/* ── Error state ─────────────────────────────────────────────────── */}
            {error && (
                <div className="card" style={{ marginBottom: 24, borderLeft: '4px solid #f7685b', background: '#fff5f5' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <AlertTriangle size={20} color="#f7685b" />
                        <div>
                            <p style={{ fontWeight: 600, color: '#c0392b', marginBottom: 4 }}>Could not load forecast</p>
                            <p style={{ fontSize: 13, color: '#6b2d2d' }}>{error}</p>
                            {error.includes('ML server') && (
                                <p style={{ fontSize: 12, color: '#6b2d2d', marginTop: 6 }}>
                                    💡 Make sure the Flask server is running:&nbsp;
                                    <code style={{ background: '#f9e3e3', padding: '2px 6px', borderRadius: 4 }}>
                                        cd ml &amp;&amp; python forecast.py
                                    </code>
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Summary cards ───────────────────────────────────────────────── */}
            {!loading && !error && (
                <div className="metrics-grid" style={{ marginBottom: 32 }}>
                    <div className="metric-card border-purple">
                        <div className="metric-header">
                            <span className="metric-title">Total SKUs Analysed</span>
                            <div className="metric-icon bg-purple-light">
                                <Package size={18} className="text-purple" />
                            </div>
                        </div>
                        <div className="metric-value">{totalSKUs}</div>
                        <div className="metric-trend">Unique product + size combinations</div>
                    </div>

                    <div className="metric-card border-blue">
                        <div className="metric-header">
                            <span className="metric-title">Avg Predicted Demand</span>
                            <div className="metric-icon bg-blue-light">
                                <TrendingUp size={18} className="text-blue" />
                            </div>
                        </div>
                        <div className="metric-value">{avgPredicted}</div>
                        <div className="metric-trend">Units per SKU next month</div>
                    </div>

                    <div className="metric-card border-orange">
                        <div className="metric-header">
                            <span className="metric-title">Restock Needed</span>
                            <div className="metric-icon bg-orange-light">
                                <AlertTriangle size={18} className="text-orange" />
                            </div>
                        </div>
                        <div className="metric-value">{stockoutRiskCount}</div>
                        <div className="metric-trend">SKUs below base-stock level</div>
                    </div>

                    <div className="metric-card border-green">
                        <div className="metric-header">
                            <span className="metric-title">No Action Required</span>
                            <div className="metric-icon bg-green-light">
                                <CheckCircle size={18} className="text-green" />
                            </div>
                        </div>
                        <div className="metric-value">{noActionCount}</div>
                        <div className="metric-trend">SKUs with sufficient stock</div>
                    </div>
                </div>
            )}

            {/* ── Table ───────────────────────────────────────────────────────── */}
            <div className="card">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '64px 24px' }}>
                        <div className="loading-spinner" style={{ margin: '0 auto 16px' }} />
                        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                            Running ML model on live data…
                        </p>
                        <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>
                            This may take a few seconds on first load.
                        </p>
                    </div>
                ) : !error && forecasts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '64px 24px' }}>
                        <Brain size={48} color="#9b51e0" style={{ margin: '0 auto 16px' }} />
                        <h3 style={{ fontWeight: 600, marginBottom: 8 }}>No forecast data</h3>
                        <p style={{ color: 'var(--text-muted)' }}>
                            Make sure inventory snapshots exist (at least 2 months of data per SKU).
                        </p>
                    </div>
                ) : !error && (
                    <>
                        <div className="card-header-flex" style={{ marginBottom: 20 }}>
                            <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--primary)' }}>
                                Per-SKU Forecast Results
                            </h2>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                Sorted by restock urgency
                            </span>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="forecast-table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Size</th>
                                        <th>Collection</th>
                                        <th style={{ textAlign: 'right' }}>Current Stock</th>
                                        <th style={{ textAlign: 'right' }}>Predicted Demand</th>
                                        <th style={{ textAlign: 'right' }}>Reorder Qty</th>
                                        <th style={{ textAlign: 'right' }}>Lost Sales</th>
                                        <th style={{ textAlign: 'right' }}>Total Cost</th>
                                        <th style={{ textAlign: 'center' }}>Confidence</th>
                                        <th style={{ textAlign: 'center' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {forecasts.map((f, i) => {
                                        const risk = getRiskBadge(f);
                                        return (
                                            <tr key={i} className={f.reorderQty > 30 ? 'row-high-risk' : ''}>
                                                <td>
                                                    <span className="product-name-cell">{f.productName}</span>
                                                </td>
                                                <td>
                                                    <span className="badge badge-neutral">{f.size}</span>
                                                </td>
                                                <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{f.collection}</td>
                                                <td style={{ textAlign: 'right', fontWeight: 600 }}>{f.currentStock}</td>
                                                <td style={{ textAlign: 'right', color: '#4b62f5', fontWeight: 600 }}>
                                                    {f.predictedDemand}
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <span style={{
                                                        fontWeight: 700,
                                                        color: f.reorderQty > 0 ? '#f2994a' : 'var(--text-muted)'
                                                    }}>
                                                        {f.reorderQty > 0 ? `+${f.reorderQty}` : '—'}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: 'right', color: f.lostSales > 0 ? '#f7685b' : 'var(--text-muted)' }}>
                                                    {f.lostSales > 0 ? f.lostSales : '—'}
                                                </td>
                                                <td style={{ textAlign: 'right', fontSize: 13 }}>
                                                    ₱{f.totalCost.toFixed(2)}
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <div className="confidence-bar-wrap">
                                                        <div className="confidence-bar-bg">
                                                            <div
                                                                className="confidence-bar-fill"
                                                                style={{ width: `${f.confidence}%` }}
                                                            />
                                                        </div>
                                                        <span className="confidence-label">{f.confidence}%</span>
                                                    </div>
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <span className={`badge forecast-badge ${risk.cls}`}>
                                                        {risk.label}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ForecastDashboard;
