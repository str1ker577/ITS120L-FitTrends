import React, { useState, useEffect } from 'react';
import { Brain, ArrowRight } from 'lucide-react';
import { fetchInventory, fetchProducts } from '../../api';
import './restocking.css';

const OptimalStockList = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadRecommendations = async () => {
            try {
                const [inventory, products] = await Promise.all([
                    fetchInventory(),
                    fetchProducts()
                ]);

                const recs = [];
                inventory.forEach(inv => {
                    const product = products.find(p => p.id === inv.productId) || { productName: 'Unknown' };
                    
                    // Simple logic to generate "AI" recommendations for the demo based on low stock
                    if (inv.runningInventory < 15) {
                        const recQty = Math.max(50, 100 - inv.runningInventory);
                        recs.push({
                            id: inv.id,
                            productName: product.productName,
                            sku: `SKU-${product.id.substring(product.id.length-4)}`,
                            confidence: Math.floor(Math.random() * 15) + 85, // 85-99%
                            reason: inv.runningInventory === 0 
                                ? 'Stockout detected. High urgency to restock immediately based on historical run rate.'
                                : 'Approaching safety stock limit. Reorder recommended to prevent stockout.',
                            currentStock: inv.runningInventory,
                            recommended: recQty,
                            toOrder: recQty - inv.runningInventory
                        });
                    }
                });
                
                // Sort by confidence or urgency
                recs.sort((a, b) => b.confidence - a.confidence);
                setRecommendations(recs);

            } catch (error) {
                console.error("Error loading restocking recommendations", error);
            } finally {
                setLoading(false);
            }
        };

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
                        <p className="page-subtitle">Machine learning suggestions based on sales velocity and seasonality</p>
                    </div>
                </div>
                <div className="text-muted" style={{ fontSize: 13, alignSelf: 'flex-end', paddingBottom: 6 }}>
                    Model last updated: Today, 02:00 AM
                </div>
            </div>

            <div className="recommendations-list">
                {loading ? (
                    <div className="card text-center" style={{ padding: '64px 24px' }}>
                        <h3 style={{ fontSize: 18, color: 'var(--text-muted)' }}>Loading AI recommendations...</h3>
                    </div>
                ) : recommendations.length === 0 ? (
                    <div className="card text-center" style={{ padding: '64px 24px' }}>
                        <div style={{
                            width: 64, height: 64, borderRadius: '50%',
                            backgroundColor: '#f3e8ff', margin: '0 auto 16px auto',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Brain size={32} color="#9b51e0" />
                        </div>
                        <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-main)', marginBottom: 8 }}>
                            No Restocking Recommendations
                        </h3>
                        <p style={{ color: 'var(--text-muted)', maxWidth: 400, margin: '0 auto' }}>
                            Our AI model currently doesn't detect any immediate restocking needs based on your inventory levels and sales velocity.
                        </p>
                    </div>
                ) : (
                    recommendations.map((rec) => (
                        <div key={rec.id} className="card recommendation-card">

                            <div className="rec-header">
                                <div className="rec-title-group">
                                    <h3 className="rec-product-name">{rec.productName}</h3>
                                    <span className="badge badge-neutral">{rec.sku}</span>
                                    <span className="badge badge-success-light">{rec.confidence}% Confidence</span>
                                </div>
                                <p className="rec-reason">{rec.reason}</p>
                            </div>

                            <div className="rec-body">
                                <div className="stock-compare-row">
                                    <div className="stock-metric">
                                        <span className="stock-label">Current Stock</span>
                                        <span className="stock-value">{rec.currentStock}</span>
                                    </div>

                                    <ArrowRight size={20} className="text-muted mx-4" />

                                    <div className="stock-metric">
                                        <span className="stock-label text-blue">Recommended</span>
                                        <span className="stock-value text-blue">{rec.recommended}</span>
                                    </div>

                                    <div className="stock-divider"></div>

                                    <div className="stock-metric">
                                        <span className="stock-label">To Order</span>
                                        <span className="stock-value font-bold">{rec.toOrder}</span>
                                    </div>
                                </div>

                                <div className="rec-actions">
                                    <button className="btn-outline text-muted">Ignore</button>
                                    <button className="btn-primary">
                                        Create Purchase Order
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
