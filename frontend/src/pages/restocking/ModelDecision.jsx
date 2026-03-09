import React, { useState } from 'react';
import { RefreshCw, Info, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { retrainModel } from '../../api';
import './restocking.css';

const ModelDecision = () => {
    // Dummy data for Feature Importance chart (zeros for empty state)
    const featureData = [
        { name: 'Sales Velocity', value: 0 },
        { name: 'Seasonality', value: 0 },
        { name: 'Lead Time', value: 0 },
        { name: 'Current Stock', value: 0 },
        { name: 'Price Elasticity', value: 0 },
    ];

    // Empty initial state ready for backend integration
    const [trainingHistory, setTrainingHistory] = useState([]);
    const [isRetraining, setIsRetraining] = useState(false);

    const handleRetrain = async () => {
        try {
            setIsRetraining(true);
            const response = await retrainModel();
            
            setTrainingHistory(prev => [
                { date: response.date, status: `Success (MAE: ${response.mae})` },
                ...prev
            ]);
            
            alert(response.status + ` Processed ${response.recordsProcessed} records.`);
        } catch (error) {
            console.error("Retrain error", error);
            alert("Failed to retrain: " + error.message);
        } finally {
            setIsRetraining(false);
        }
    };

    return (
        <div className="page-wrapper" style={{ maxWidth: '900px', margin: '0 auto', gap: 32 }}>
            <div className="page-header" style={{ marginBottom: 0 }}>
                <div>
                    <h1 className="page-title">Model Decision Insights</h1>
                    <p className="page-subtitle">Understand how AI recommendations are generated</p>
                </div>
                <div className="header-actions">
                    <button className="btn-primary" onClick={handleRetrain} disabled={isRetraining}>
                        <RefreshCw size={16} className={isRetraining ? "spin" : ""} /> {isRetraining ? 'Retraining...' : 'Retrain Model'}
                    </button>
                </div>
            </div>

            <div className="card" style={{ padding: 32 }}>
                <h3 className="section-title mb-4">Feature Importance</h3>
                <p className="text-muted mb-4" style={{ fontSize: 13 }}>Which factors are currently driving the restocking recommendations?</p>

                <div style={{ width: '100%', height: 300, marginTop: 24 }}>
                    <ResponsiveContainer>
                        <BarChart data={featureData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f4f8" />
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#627d98', fontSize: 12 }}
                                width={120}
                            />
                            <Tooltip
                                cursor={{ fill: '#f0f4f8' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                itemStyle={{ color: '#4b62f5', fontWeight: 600 }}
                            />
                            <Bar dataKey="value" fill="#4b62f5" radius={[0, 4, 4, 0]} barSize={24} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="card" style={{ padding: 32 }}>
                <h3 className="section-title mb-4">Model Parameters</h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, padding: 24, backgroundColor: '#f9fbfd', borderRadius: 8, border: '1px solid var(--border)' }}>
                    <div>
                        <div className="text-muted mb-2" style={{ fontSize: 13 }}>Lookback Period</div>
                        <div className="font-medium" style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>-</div>
                    </div>
                    <div>
                        <div className="text-muted mb-2" style={{ fontSize: 13 }}>Forecast Horizon</div>
                        <div className="font-medium" style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>-</div>
                    </div>
                    <div>
                        <div className="text-muted mb-2" style={{ fontSize: 13 }}>Safety Stock Level</div>
                        <div className="font-medium" style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>-</div>
                    </div>
                    <div>
                        <div className="text-muted mb-2" style={{ fontSize: 13 }}>Algorithm</div>
                        <div className="font-medium" style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>-</div>
                    </div>
                </div>
            </div>

            <div className="card" style={{ padding: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <Info size={18} className="text-purple" />
                    <h3 className="section-title mb-0" style={{ color: 'var(--primary)' }}>How it works</h3>
                </div>
                <p className="text-muted mb-4" style={{ fontSize: 14, lineHeight: 1.6 }}>
                    Our model analyzes historical sales data, seasonal trends, and current stock levels to predict future demand. It then calculates the optimal reorder quantity to minimize both stockouts and holding costs.
                </p>
                <ul className="text-muted mb-8" style={{ fontSize: 14, lineHeight: 1.6, paddingLeft: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <li>Updates daily at 02:00 AM</li>
                    <li>Adapts to sudden demand spikes</li>
                    <li>Considers vendor lead times</li>
                </ul>

                <h3 className="section-title mb-4">Training History</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {trainingHistory.length === 0 ? (
                        <div className="text-center text-muted" style={{ padding: '24px 0', fontSize: 14 }}>
                            No training history available.
                        </div>
                    ) : (
                        trainingHistory.map((run, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottom: idx !== trainingHistory.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                <span className="text-muted" style={{ fontSize: 13 }}>{run.date}</span>
                                <span className="text-green font-medium" style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    {run.status}
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
