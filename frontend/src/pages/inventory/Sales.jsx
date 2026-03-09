import React, { useState, useEffect } from 'react';
import { Download, Calendar, DollarSign, ShoppingBag, TrendingUp, Plus, X } from 'lucide-react';
import { fetchOrders, fetchProducts, createOrder, exportOrders } from '../../api';
import './inventory.css'; // Shared inventory styles

const Sales = () => {
    const [transactions, setTransactions] = useState([]);
    const [allOrders, setAllOrders] = useState([]); // full list for filtering
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState({ revenue: 0, orders: 0, avgValue: 0 });
    const [productsList, setProductsList] = useState([]);

    // Date filter state
    const [filterDate, setFilterDate] = useState('');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        orderDate: new Date().toISOString().split('T')[0],
        buyerName: '',
        buyerAddress: '',
        platform: 'SHOPEE',
        productId: '',
        quantity: 1,
        grossAmount: 0,
        platformDiscount: 0,
        modeOfPayment: 'Cash',
        deliveryDate: new Date().toISOString().split('T')[0]
    });

    const mapOrders = (orders) => {
        // getAllOrders() already returns newest first from the backend
        return orders.slice(0, 20).map(o => ({
            id: o.id ? o.id.substring(Math.max(0, o.id.length - 8)) : '—',
            date: o.orderDate ? new Date(o.orderDate).toLocaleDateString() : '—',
            rawDate: o.orderDate || '',
            customer: o.buyerName || `Customer #${o.buyerId ? o.buyerId.substring(Math.max(0, o.buyerId.length - 4)) : '?'}`,
            items: o.items && o.items.length > 0 ? `${o.items[0].quantity} item(s)` : '1 item(s)',
            total: o.netSales || 0,
            status: o.deliveryDate && new Date(o.deliveryDate) < new Date() ? 'Completed' : 'Processing'
        }));
    };

    const loadData = async () => {
        try {
            setLoading(true);
            const [orders, products] = await Promise.all([
                fetchOrders(),
                fetchProducts()
            ]);

            setProductsList(products);
            setAllOrders(orders);
            setTransactions(mapOrders(orders));

            // Calculate today's metrics
            const todayStr = new Date().toISOString().split('T')[0];
            const todaysOrders = orders.filter(o => o.orderDate && o.orderDate.startsWith(todayStr));
            const totalRevenue = orders.reduce((sum, o) => sum + (o.netSales || 0), 0);

            setMetrics({
                revenue: todaysOrders.reduce((sum, o) => sum + (o.netSales || 0), 0),
                orders: todaysOrders.length,
                avgValue: orders.length > 0 ? totalRevenue / orders.length : 0
            });
        } catch (error) {
            console.error('Error fetching sales data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Apply date filter whenever filterDate or allOrders changes
    useEffect(() => {
        if (!filterDate) {
            setTransactions(mapOrders(allOrders));
        } else {
            const filtered = allOrders.filter(o => o.orderDate && o.orderDate.startsWith(filterDate));
            setTransactions(mapOrders(filtered));
        }
    }, [filterDate, allOrders]);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Completed': return 'badge-success-light';
            case 'Processing': return 'badge-warning-light';
            case 'Shipped': return 'badge-info-light';
            default: return 'badge-neutral';
        }
    };

    // Get the selected product's price
    const getSelectedProductPrice = (productId) => {
        const prod = productsList.find(p => p.id === productId);
        return prod ? (prod.price || 399) : 0;
    };

    const handleOpenModal = () => {
        const defaultProductId = productsList.length > 0 ? productsList[0].id : '';
        const defaultPrice = getSelectedProductPrice(defaultProductId);
        setFormData({
            orderDate: new Date().toISOString().split('T')[0],
            buyerName: '',
            buyerAddress: '',
            platform: 'SHOPEE',
            productId: defaultProductId,
            quantity: 1,
            grossAmount: defaultPrice * 1,
            platformDiscount: 0,
            modeOfPayment: 'Cash',
            deliveryDate: new Date().toISOString().split('T')[0]
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => {
            const updated = { ...prev, [name]: value };

            // Auto-calculate gross amount when product or quantity changes
            if (name === 'productId') {
                const price = getSelectedProductPrice(value);
                updated.grossAmount = price * (parseInt(prev.quantity, 10) || 1);
            }
            if (name === 'quantity') {
                const price = getSelectedProductPrice(prev.productId);
                updated.grossAmount = price * (parseInt(value, 10) || 1);
            }

            return updated;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const gross = parseFloat(formData.grossAmount) || 0;
        const discount = parseFloat(formData.platformDiscount) || 0;
        const netSale = gross - discount;

        const orderPayload = {
            buyerId: `buyer-${Date.now()}`,
            buyerName: formData.buyerName,
            buyerAddress: formData.buyerAddress,
            platform: formData.platform,
            orderDate: formData.orderDate,
            deliveryDate: formData.deliveryDate,
            grossAmount: gross,
            platformDiscount: discount,
            netSales: netSale,
            modeOfPayment: formData.modeOfPayment,
            items: [
                {
                    productId: formData.productId,
                    quantity: parseInt(formData.quantity, 10)
                }
            ]
        };

        try {
            await createOrder(orderPayload);
            handleCloseModal();
            loadData(); // Refresh list
        } catch (error) {
            console.error('Error creating order:', error);
            alert(`Failed to record order: ${error.message}\n\nPlease check that the product has enough stock.`);
        }
    };

    // Clear date filter
    const handleClearFilter = () => setFilterDate('');

    return (
        <div className="page-wrapper">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Sales Records</h1>
                    <p className="page-subtitle">View recent transactions and daily summaries</p>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary" onClick={() => exportOrders()}>
                        <Download size={16} /> Export CSV
                    </button>
                    <button className="btn-primary" onClick={handleOpenModal}>
                        <Plus size={16} /> Record Order
                    </button>
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
                            <div className="metric-value" style={{ fontSize: '1.5rem', marginBottom: 0 }}>
                                ₱ {metrics.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
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
                            <div className="metric-value" style={{ fontSize: '1.5rem', marginBottom: 0 }}>{metrics.orders}</div>
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
                            <div className="metric-value" style={{ fontSize: '1.5rem', marginBottom: 0 }}>
                                ₱ {metrics.avgValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card table-card mt-2">
                {/* Table Toolbar */}
                <div className="table-toolbar">
                    <h3 className="section-title mb-0">Recent Transactions</h3>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
                            <input
                                type="date"
                                className="form-control"
                                style={{ width: 160, padding: '6px 10px', fontSize: 13 }}
                                value={filterDate}
                                onChange={e => setFilterDate(e.target.value)}
                                placeholder="Filter by date"
                            />
                            {filterDate && (
                                <button
                                    className="text-link"
                                    style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}
                                    onClick={handleClearFilter}
                                >
                                    <X size={12} /> Clear
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {filterDate && (
                    <div style={{ padding: '6px 24px', backgroundColor: '#f0f4ff', fontSize: 13, color: '#4b62f5', borderBottom: '1px solid #e8ecff' }}>
                        Showing transactions for: <strong>{new Date(filterDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                        &nbsp;—&nbsp; {transactions.length} result(s)
                    </div>
                )}

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
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center text-muted" style={{ padding: '48px 0' }}>
                                        Loading sales data...
                                    </td>
                                </tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center text-muted" style={{ padding: '48px 0' }}>
                                        {filterDate ? `No transactions found for ${filterDate}.` : 'No recent transactions.'}
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((tx, idx) => (
                                    <tr key={tx.id + idx}>
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

            {/* Record Order Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">Record Order Details</h2>
                            <button className="modal-close" onClick={handleCloseModal}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="form-group">
                                        <label className="form-label">Order Date</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            name="orderDate"
                                            value={formData.orderDate}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Delivery Date</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            name="deliveryDate"
                                            value={formData.deliveryDate}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="form-group">
                                        <label className="form-label">Buyer Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="buyerName"
                                            value={formData.buyerName}
                                            onChange={handleInputChange}
                                            placeholder="John Doe"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Shop/Platform</label>
                                        <select
                                            className="form-control"
                                            name="platform"
                                            value={formData.platform}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="SHOPEE">SHOPEE</option>
                                            <option value="LAZADA">LAZADA</option>
                                            <option value="DIRECT">DIRECT</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group mb-4">
                                    <label className="form-label">Buyer Address</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="buyerAddress"
                                        value={formData.buyerAddress}
                                        onChange={handleInputChange}
                                        placeholder="123 Main St, City, Province"
                                        required
                                    />
                                </div>

                                <div className="form-group mb-4">
                                    <label className="form-label">Product</label>
                                    <select
                                        className="form-control"
                                        name="productId"
                                        value={formData.productId}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        {productsList.length === 0 && <option value="">No products available</option>}
                                        {productsList.map(prod => (
                                            <option key={prod.id} value={prod.id}>
                                                {prod.productName} ({prod.color} - {prod.size}) — ₱{(prod.price || 399).toFixed(2)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    <div className="form-group">
                                        <label className="form-label">Quantity</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="quantity"
                                            value={formData.quantity}
                                            onChange={handleInputChange}
                                            min="1"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Gross Amount (₱)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="grossAmount"
                                            value={formData.grossAmount}
                                            onChange={handleInputChange}
                                            min="0"
                                            step="0.01"
                                            required
                                        />
                                        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, display: 'block' }}>
                                            Auto-calculated from price × qty
                                        </span>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Discount (₱)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="platformDiscount"
                                            value={formData.platformDiscount}
                                            onChange={handleInputChange}
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="form-group">
                                        <label className="form-label">Mode of Payment</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="modeOfPayment"
                                            value={formData.modeOfPayment}
                                            onChange={handleInputChange}
                                            placeholder="GCash, COD, etc."
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label" style={{ fontWeight: 'bold' }}>Net Sale (Calculated)</label>
                                        <div className="form-control" style={{ backgroundColor: '#f0f4ff', color: '#1a2d8c', fontWeight: 'bold' }}>
                                            ₱ {((parseFloat(formData.grossAmount) || 0) - (parseFloat(formData.platformDiscount) || 0)).toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-outline" onClick={handleCloseModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Record Order
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sales;
