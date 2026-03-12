import React, { useState } from 'react';
import { RefreshCw, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { retrainModel } from '../../api';
import './restocking.css';

// Relative feature weights for the VotingRegressor ensemble
const FEATURE_DATA = [
    { name: 'Sales Velocity', value: 42 },
    { name: 'Sales Lag (1mo)', value: 28 },
    { name: 'Current Stock', value: 15 },
    { name: 'Seasonality', value: 10 },
    { name: 'Product / Size', value: 5 },
];

const ModelDecision = () => {
    const [trainingHistory, setTrainingHistory] = useState([]);
    const [isRetraining, setIsRetraining] = useState(false);
    const [lastResult, setLastResult] = useState(null);
    const [retrainError, setRetrainError] = useState(null);

    const handleRetrain = async () => {
        try {
            setIsRetraining(true);
            setRetrainError(null);
            const response = await retrainModel();

            setLastResult(response);
            setTrainingHistory(prev => [
                {
                    date: response.date || new Date().toLocaleString(),
                    mae: response.mae,
                    records: response.recordsProcessed,
                    status: 'Success',
                },
                ...prev,
            ]);

            // Scroll training history into view after state update
            setTimeout(() => {
                document.getElementById('training-history')?.scrollIntoView({ behavior: 'smooth' });
            }, 300);
        } catch (error) {
            console.error('Retrain error', error);
            setRetrainError(error.message || 'Failed to retrain the model.');
        } finally {
            setIsRetraining(false);
        }
    };

    return (
        <div className="page-wrapper" style={{ maxWidth: '900px', margin: '0 auto', gap: 32 }}>

            {/* Header */}
            <div className="page-header" style={{ marginBottom: 0 }}>
                <div>
                    <h1 className="page-title">Model Decision Insights</h1>
                    <p className="page-subtitle">Understand how AI recommendations are generated</p>
                </div>
                <div className="header-actions">
                    <button className="btn-primary" onClick={handleRetrain} disabled={isRetraining}>
                        <RefreshCw size={16} className={isRetraining ? 'spin' : ''} />
                        {isRetraining ? 'Retraining…' : 'Retrain Model'}
                    </button>
                </div>
            </div>

            {/* Success banner */}
            {lastResult && !isRetraining && (
                <div className="card" style={{ padding: '16px 24px', borderLeft: '4px solid #27ae60', background: '#f0fff4', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <CheckCircle2 size={20} color="#27ae60" />
                    <div>
                        <p style={{ fontWeight: 600, color: '#1a7a3c', marginBottom: 2 }}>
                            Model retrained successfully
                        </p>
                        <p style={{ fontSize: 13, color: '#2d6a4f' }}>
                            MAE: <strong>{lastResult.mae}</strong> &nbsp;·&nbsp;
                            Records used: <strong>{lastResult.recordsProcessed}</strong> &nbsp;·&nbsp;
                            Run at: {lastResult.date}
                        </p>
                    </div>
                </div>
            )}

            {/* Error banner */}
            {retrainError && (
                <div className="card" style={{ padding: '16px 24px', borderLeft: '4px solid #f7685b', background: '#fff5f5', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <AlertTriangle size={20} color="#f7685b" />
                    <div>
                        <p style={{ fontWeight: 600, color: '#c0392b', marginBottom: 2 }}>Retrain failed</p>
                        <p style={{ fontSize: 13, color: '#6b2d2d' }}>{retrainError}</p>
                    </div>
                </div>
            )}

            {/* Feature Importance */}
            <div className="card" style={{ padding: 32 }}>
                <h3 className="section-title mb-4">Feature Importance</h3>
                <p className="text-muted mb-4" style={{ fontSize: 13 }}>
                    Relative weight of each input in the VotingRegressor ensemble (Polynomial + KNN + Decision Tree).
                </p>
                <div style={{ width: '100%', height: 280, marginTop: 24 }}>
                    <ResponsiveContainer>
                        <BarChart data={FEATURE_DATA} layout="vertical" margin={{ top: 0, right: 30, left: 100, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f4f8" />
                            <XAxis type="number" domain={[0, 50]} tickFormatter={v => `${v}%`} hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#627d98', fontSize: 12 }}
                                width={110}
                            />
                            <Tooltip
                                cursor={{ fill: '#f0f4f8' }}
                                formatter={v => [`${v}%`, 'Importance']}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                itemStyle={{ color: '#4b62f5', fontWeight: 600 }}
                            />
                            <Bar dataKey="value" fill="#4b62f5" radius={[0, 4, 4, 0]} barSize={24} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Model Parameters */}
            <div className="card" style={{ padding: 32 }}>
                <h3 className="section-title mb-4">Model Parameters</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, padding: 24, backgroundColor: '#f9fbfd', borderRadius: 8, border: '1px solid var(--border)' }}>
                    <div>
                        <div className="text-muted mb-2" style={{ fontSize: 13 }}>Algorithm</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--primary)' }}>
                            VotingRegressor (Poly + KNN + Tree)
                        </div>
                    </div>
                    <div>
                        <div className="text-muted mb-2" style={{ fontSize: 13 }}>Forecast Horizon</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--primary)' }}>
                            1 month ahead
                        </div>
                    </div>
                    <div>
                        <div className="text-muted mb-2" style={{ fontSize: 13 }}>Safety Stock (z-score)</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--primary)' }}>
                            1.28 (90th percentile)
                        </div>
                    </div>
                    <div>
                        <div className="text-muted mb-2" style={{ fontSize: 13 }}>Last MAE</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: lastResult ? '#27ae60' : 'var(--text-muted)' }}>
                            {lastResult ? lastResult.mae : '— retrain to calculate'}
                        </div>
                    </div>
                    <div>
                        <div className="text-muted mb-2" style={{ fontSize: 13 }}>Records Used</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: lastResult ? 'var(--primary)' : 'var(--text-muted)' }}>
                            {lastResult ? `${lastResult.recordsProcessed} training rows` : '— retrain to calculate'}
                        </div>
                    </div>
                    <div>
                        <div className="text-muted mb-2" style={{ fontSize: 13 }}>Last Trained</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: lastResult ? 'var(--primary)' : 'var(--text-muted)' }}>
                            {lastResult ? lastResult.date : '— not yet run'}
                        </div>
                    </div>
                </div>
            </div>

            {/* How it works + Training History */}
            <div className="card" style={{ padding: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <Info size={18} className="text-purple" />
                    <h3 className="section-title mb-0" style={{ color: 'var(--primary)' }}>How it works</h3>
                </div>
                <p className="text-muted mb-4" style={{ fontSize: 14, lineHeight: 1.6 }}>
                    The model analyzes historical inventory snapshots and total sales per SKU (product + size). A{' '}
                    <strong>VotingRegressor</strong> ensemble of Polynomial Regression, K-Nearest Neighbours, and a
                    Decision Tree predicts next-month demand, then a base-stock policy (z = 1.28) calculates reorder quantities.
                </p>
                <ul className="text-muted" style={{ fontSize: 14, lineHeight: 1.6, paddingLeft: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <li>Needs at least <strong>2 months</strong> of snapshots per SKU to train</li>
                    <li>Lower MAE = more accurate demand predictions</li>
                    <li>Retrain after adding new stock or sales data for best results</li>
                </ul>

                <h3 className="section-title mb-4" id="training-history" style={{ marginTop: 32 }}>Training History</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {trainingHistory.length === 0 ? (
                        <div className="text-center text-muted" style={{ padding: '24px 0', fontSize: 14 }}>
                            No training history yet — click <strong>Retrain Model</strong> above.
                        </div>
                    ) : (
                        trainingHistory.map((run, idx) => (
                            <div
                                key={idx}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    paddingBottom: 16,
                                    borderBottom: idx !== trainingHistory.length - 1 ? '1px solid var(--border)' : 'none',
                                }}
                            >
                                <span className="text-muted" style={{ fontSize: 13 }}>{run.date}</span>
                                <span style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, color: '#27ae60', fontWeight: 600 }}>
                                    <CheckCircle2 size={14} />
                                    {run.status} · MAE {run.mae} · {run.records} records
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>

        </div>
    );
};

export default ModelDecision;
