import React, { useState } from 'react';
import { Search, Filter, Download, Plus, MoreHorizontal } from 'lucide-react';

const ProductCatalog = () => {
    // Empty initial state ready for backend integration
    const [products] = useState([]);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'In Stock': return 'badge-success-light';
            case 'Low Stock': return 'badge-warning-light';
            case 'Critical': return 'badge-danger-light';
            case 'Out of Stock': return 'badge-neutral';
            default: return 'badge-neutral';
        }
    };

    return (
        <div className="page-wrapper">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Product Catalog</h1>
                    <p className="page-subtitle">Manage your inventory items and view stock levels</p>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary">
                        <Download size={16} /> Export
                    </button>
                    <button className="btn-primary">
                        <Plus size={16} /> Add Product
                    </button>
                </div>
            </div>

            <div className="card table-card">
                {/* Table Toolbar */}
                <div className="table-toolbar">
                    <div className="search-wrapper">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search by name or SKU..."
                        />
                    </div>
                    <button className="btn-outline">
                        <Filter size={16} /> Filters
                    </button>
                </div>

                {/* Data Table */}
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th width="80">ID</th>
                                <th>Product Details</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock Level</th>
                                <th>Status</th>
                                <th width="50"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center text-muted" style={{ padding: '48px 0' }}>
                                        No products found. Start by adding a new product.
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.id}>
                                        <td className="text-muted">{product.id}</td>
                                        <td>
                                            <div className="product-details-cell">
                                                <span className="product-name">{product.name}</span>
                                                <span className="product-sku">{product.sku}</span>
                                            </div>
                                        </td>
                                        <td className="text-muted">{product.category}</td>
                                        <td className="font-medium">₱{product.price.toFixed(2)}</td>
                                        <td className="font-medium">{product.stock}</td>
                                        <td>
                                            <span className={`badge ${getStatusBadge(product.status)}`}>
                                                {product.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="icon-btn">
                                                <MoreHorizontal size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Table Pagination */}
                <div className="table-pagination">
                    <div className="pagination-info">
                        Showing <span className="font-medium">1</span> to <span className="font-medium">6</span> of <span className="font-medium">6</span> results
                    </div>
                    <div className="pagination-controls">
                        <button className="btn-page" disabled>Previous</button>
                        <button className="btn-page" disabled>Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCatalog;
