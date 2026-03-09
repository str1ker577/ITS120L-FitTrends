import React, { useState, useEffect } from 'react';
import { Brain, ArrowRight, RefreshCw, AlertTriangle } from 'lucide-react';
import { fetchForecast, fetchProducts, fetchInventory, updateInventory } from '../../api';
import './restocking.css';

const OptimalStockList = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processingPO, setProcessingPO] = useState(null);

    const loadRecommendations = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchForecast();

            // Only show SKUs where the ML model recommends purchasing more units
            const recs = data
                .filter(f => f.reorderQty > 0)
                .map(f => ({
                    id: `${f.productName}-${f.size}`,
                    productName: f.productName,
                    size: f.size,
                    collection: f.collection,
                    color: f.color,
                    currentStock: f.currentStock,
                    predictedDemand: f.predictedDemand,
                    reorderQty: f.reorderQty,
                    confidence: f.confidence,
                    lostSales: f.lostSales,
                    reason: f.reorderQty > 30
                        ? `High demand forecasted (${f.predictedDemand} units next month). Current stock will likely run out — immediate restock advised.`
                        : `Predicted demand (${f.predictedDemand} units) may exceed current stock. Reorder to maintain service level.`
                }));

            setRecommendations(recs);
        } catch (err) {
            setError(err.message || 'Failed to load ML recommendations.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePO = async (rec) => {
        try {
            setProcessingPO(rec.id);
            const products = await fetchProducts();
            const invData = await fetchInventory();

            const targetProduct = products.find(p => p.productName === rec.productName && p.size === rec.size);
            if (!targetProduct) throw new Error("Product data mismatch: not found in DB.");

            const targetInv = invData.find(inv => inv.productId === targetProduct.id);
            if (!targetInv) throw new Error("Inventory record not found for this product.");

            const updatedInv = {
                ...targetInv,
                runningInventory: targetInv.runningInventory + rec.reorderQty
            };

            await updateInventory(updatedInv);
            alert(`Purchase Order created! Added ${rec.reorderQty} units to ${rec.productName} (${rec.size}).`);
            
            // Reload recommendations after successful update
            await loadRecommendations();
        } catch (err) {
            alert("Failed to create Purchase Order: " + err.message);
        } finally {
            setProcessingPO(null);
        }
    };

    useEffect(() => {
        loadRecommendations();
    }, []);

    return (
        <div className="page-wrapper" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div className="page-header" style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="metric-icon bg-purple-light" style={{ width: 48, height: 48, borderRadius: 12 }}>
                        <Brain size={24} className="text-purple" />
                    </div>
                    <div>
                        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            AI Restocking Recommendations
                        </h1>
                        <p className="page-subtitle">Units to buy — powered by VotingRegressor ML model on live data</p>
                    </div>
                </div>
                <button
                    className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: 13, alignSelf: 'flex-end' }}
                    onClick={loadRecommendations}
                    disabled={loading}
                >
                    <RefreshCw size={14} className={loading ? 'spin' : ''} />
                    {loading ? 'Running Model…' : 'Refresh'}
                </button>
            </div>

            {/* ML server offline error */}
            {error && (
                <div className="card" style={{ marginBottom: 24, borderLeft: '4px solid #f7685b', background: '#fff5f5' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <AlertTriangle size={20} color="#f7685b" style={{ flexShrink: 0, marginTop: 2 }} />
                        <div>
                            <p style={{ fontWeight: 600, color: '#c0392b', marginBottom: 4 }}>Could not load ML recommendations</p>
                            <p style={{ fontSize: 13, color: '#6b2d2d' }}>{error}</p>
                            {(error.includes('ML server') || error.includes('503') || error.includes('fetch')) && (
                                <p style={{ fontSize: 12, color: '#6b2d2d', marginTop: 6 }}>
                                    💡 Make sure the Flask ML server is running:&nbsp;
                                    <code style={{ background: '#f9e3e3', padding: '2px 6px', borderRadius: 4 }}>
                                        cd ml &amp;&amp; python forecast.py
                                    </code>
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="recommendations-list">
                {loading ? (
                    <div className="card text-center" style={{ padding: '64px 24px' }}>
                        <div className="loading-spinner" style={{ margin: '0 auto 16px' }} />
                        <h3 style={{ fontSize: 16, color: 'var(--text-muted)', marginBottom: 4 }}>Running ML model on live data…</h3>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>This may take a few seconds.</p>
                    </div>
                ) : !error && recommendations.length === 0 ? (
                    <div className="card text-center" style={{ padding: '64px 24px' }}>
                        <div style={{
                            width: 64, height: 64, borderRadius: '50%',
                            backgroundColor: '#f3e8ff', margin: '0 auto 16px auto',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Brain size={32} color="#9b51e0" />
                        </div>
                        <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-main)', marginBottom: 8 }}>
                            No Restocking Needed Right Now
                        </h3>
                        <p style={{ color: 'var(--text-muted)', maxWidth: 400, margin: '0 auto' }}>
                            The ML model does not detect any immediate restocking needs based on current stock and forecasted demand.
                        </p>
                    </div>
                ) : !error && (
                    recommendations.map((rec) => (
                        <div key={rec.id} className="card recommendation-card">
                            <div className="rec-header">
                                <div className="rec-title-group">
                                    <h3 className="rec-product-name">{rec.productName}</h3>
                                    <span className="badge badge-neutral">Size: {rec.size}</span>
                                    {rec.collection && <span className="badge badge-neutral">{rec.collection}</span>}
                                    <span className={`badge ${rec.confidence >= 90 ? 'badge-success-light' : 'badge-warning-light'}`}>
                                        {rec.confidence}% Confidence
                                    </span>
                                    {rec.reorderQty > 30 && (
                                        <span className="badge badge-danger-light">⚠ High Risk</span>
                                    )}
                                </div>
                                <p className="rec-reason">{rec.reason}</p>
                            </div>

                            <div className="rec-body">
                                <div className="stock-compare-row">
                                    <div className="stock-metric">
                                        <span className="stock-label">Current Stock</span>
                                        <span className="stock-value" style={{ color: rec.currentStock === 0 ? '#f7685b' : undefined }}>
                                            {rec.currentStock}
                                        </span>
                                    </div>

                                    <ArrowRight size={20} className="text-muted mx-4" />

                                    <div className="stock-metric">
                                        <span className="stock-label text-blue">Forecasted Demand</span>
                                        <span className="stock-value text-blue">{rec.predictedDemand}</span>
                                    </div>

                                    <div className="stock-divider"></div>

                                    <div className="stock-metric">
                                        <span className="stock-label" style={{ fontWeight: 700, color: '#f2994a' }}>Units to Buy</span>
                                        <span className="stock-value font-bold" style={{ color: '#f2994a', fontSize: '1.4rem' }}>
                                            +{rec.reorderQty}
                                        </span>
                                    </div>
                                </div>

                                <div className="rec-actions">
                                    <button className="btn-outline text-muted" onClick={() => {
                                        setRecommendations(prev => prev.filter(r => r.id !== rec.id));
                                    }}>Ignore</button>
                                    <button 
                                        className="btn-primary" 
                                        onClick={() => handleCreatePO(rec)}
                                        disabled={processingPO === rec.id}
                                    >
                                        {processingPO === rec.id ? 'Processing...' : 'Create Purchase Order'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default OptimalStockList;
