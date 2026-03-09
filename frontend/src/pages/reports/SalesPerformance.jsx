import React, { useState, useEffect } from 'react';
import { Calendar, Download } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchOrders, exportAllData } from '../../api';
import './reports.css';

const SalesPerformance = () => {
    const [revenueData, setRevenueData] = useState([]);
    const [profitData, setProfitData] = useState([]);
    const [totalUnits, setTotalUnits] = useState(0);
    const [timeRange, setTimeRange] = useState(30); // 7 or 30 days

    useEffect(() => {
        const loadReportData = async () => {
            try {
                const orders = await fetchOrders();
                
                // Track total units across all orders
                let units = 0;
                orders.forEach(o => {
                    if (o.items && o.items.length > 0) {
                        units += o.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
                    } else {
                        units += 1; // default to 1 if no items array
                    }
                });
                setTotalUnits(units);

                const dateMap = {};
                
                // Group orders by date
                orders.forEach(o => {
                    let dateObj;
                    if (Array.isArray(o.orderDate)) {
                        dateObj = new Date(o.orderDate[0], o.orderDate[1] - 1, o.orderDate[2]);
                    } else if (o.orderDate) {
                        dateObj = new Date(o.orderDate);
                    } else {
                        return; // skip if no date
                    }

                    // Format as YYYY-MM-DD for sorting reliably
                    const sortKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
                    const displayDay = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    
                    if (!dateMap[sortKey]) {
                        dateMap[sortKey] = { name: displayDay, value: 0, sortKey, dateObj };
                    }
                    dateMap[sortKey].value += (o.netSales || 0);
                });
                
                // Convert Map to array and explicitly sort by date
                let chartData = Object.values(dateMap).sort((a, b) => a.dateObj - b.dateObj);

                // Filter based on timeRange state
                setRevenueData(chartData.slice(-timeRange));

                // Reuse the sorted chartData for profit (demo: profit is ~30% of revenue)
                const mappedProfitData = chartData.map(d => ({
                    name: d.name,
                    value: d.value * 0.3
                }));
                setProfitData(mappedProfitData.slice(-timeRange));

            } catch (error) {
                console.error("Error loading sales performance data", error);
            }
        };

        loadReportData();
    }, [timeRange]); // Re-run when timeRange changes

    const toggleTimeRange = () => {
        setTimeRange(prev => prev === 30 ? 7 : 30);
    };

    return (
        <div className="page-wrapper">
            <div className="page-header" style={{ marginBottom: 24 }}>
                <div>
                    <h1 className="page-title">Sales Performance</h1>
                    <p className="page-subtitle">Analytics dashboard for revenue and growth tracking</p>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary" onClick={toggleTimeRange}>
                        <Calendar size={16} /> {timeRange === 30 ? 'Last 30 Days' : 'Last 7 Days'}
                    </button>
                    <button className="btn-secondary" onClick={() => exportAllData()}>
                        <Download size={16} /> Download All Data
                    </button>
                    <button className="btn-secondary" onClick={() => window.print()}>
                        <Download size={16} /> Export PDF
                    </button>
                </div>
            </div>

            <div className="chart-card mb-4" style={{ padding: 24, background: 'white', borderRadius: 8, border: '1px solid var(--border)' }}>
                <h3 className="section-title mb-4">Revenue Overview</h3>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4b62f5" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#4b62f5" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f4f8" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#627d98', fontSize: 12 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#627d98', fontSize: 12 }} dx={-10} />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                itemStyle={{ color: '#4b62f5', fontWeight: 600 }}
                            />
                            <Area type="monotone" dataKey="value" stroke="#4b62f5" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="chart-card mb-4" style={{ padding: 24, background: 'white', borderRadius: 8, border: '1px solid var(--border)' }}>
                <h3 className="section-title mb-4">Monthly Profit</h3>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <BarChart data={profitData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f4f8" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#627d98', fontSize: 12 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#627d98', fontSize: 12 }} dx={-10} />
                            <Tooltip
                                cursor={{ fill: '#f0f4f8' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                itemStyle={{ color: '#1f9d55', fontWeight: 600 }}
                            />
                            <Bar dataKey="value" fill="#1f9d55" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="chart-card" style={{ padding: 24, background: 'white', borderRadius: 8, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h3 className="section-title mb-0">Top Categories by Volume</h3>
                </div>

                <div className="progress-list">
                    <div className="progress-item mb-4">
                        <div className="progress-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span className="font-medium text-main" style={{ fontSize: 13 }}>Apparel</span>
                            <span className="font-medium text-muted" style={{ fontSize: 13 }}>45%</span>
                        </div>
                        <div className="progress-bar-bg">
                            <div className="progress-bar-fill" style={{ width: '45%', backgroundColor: '#4b62f5' }}></div>
                        </div>
                    </div>

                    <div className="progress-item mb-4">
                        <div className="progress-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span className="font-medium text-main" style={{ fontSize: 13 }}>Footwear</span>
                            <span className="font-medium text-muted" style={{ fontSize: 13 }}>30%</span>
                        </div>
                        <div className="progress-bar-bg">
                            <div className="progress-bar-fill" style={{ width: '30%', backgroundColor: '#9b51e0' }}></div>
                        </div>
                    </div>

                    <div className="progress-item mb-4">
                        <div className="progress-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span className="font-medium text-main" style={{ fontSize: 13 }}>Accessories</span>
                            <span className="font-medium text-muted" style={{ fontSize: 13 }}>25%</span>
                        </div>
                        <div className="progress-bar-bg">
                            <div className="progress-bar-fill" style={{ width: '25%', backgroundColor: '#f7685b' }}></div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                    <span className="text-muted" style={{ fontSize: 12 }}>Total Units Sold</span>
                    <span className="font-medium text-main" style={{ fontSize: 14 }}>{totalUnits}</span>
                </div>
            </div>
        </div>
    );
};

export default SalesPerformance;
