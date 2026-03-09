import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Plus, MoreHorizontal, Edit, Trash2, X } from 'lucide-react';
import { fetchProducts, fetchInventory, createProduct, updateProduct, deleteProduct, updateInventory, exportInventory } from '../../api';

const ProductCatalog = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        productName: '',
        collection: 'Urban Active',
        color: '',
        size: 'M',
        price: 399,
        initialStock: 0,
        description: ''
    });

    const loadCatalog = async () => {
        try {
            setLoading(true);
            const [productData, inventoryData] = await Promise.all([
                fetchProducts(),
                fetchInventory()
            ]);

            // Map inventory data to products
            const mappedProducts = productData.map((prod) => {
                const inv = inventoryData.find(i => i.productId === prod.id) || { runningInventory: 0 };
                let stockStatus = 'In Stock';
                if (inv.runningInventory === 0) stockStatus = 'Out of Stock';
                else if (inv.runningInventory <= 5) stockStatus = 'Critical';
                else if (inv.runningInventory <= 15) stockStatus = 'Low Stock';

                return {
                    id: prod.id,
                    name: prod.productName,
                    sku: `${prod.collection.substring(0,3).toUpperCase()}-${prod.id.substring(prod.id.length-4)}`,
                    category: prod.collection,
                    price: prod.price || 399.0,
                    stock: inv.runningInventory,
                    status: stockStatus,
                    rawProduct: prod,
                    rawInventory: inv
                };
            });
            
            setProducts(mappedProducts);
        } catch (error) {
            console.error("Error loading product catalog", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCatalog();
    }, []);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'In Stock': return 'badge-success-light';
            case 'Low Stock': return 'badge-warning-light';
            case 'Critical': return 'badge-danger-light';
            case 'Out of Stock': return 'badge-neutral';
            default: return 'badge-neutral';
        }
    };

    const handleOpenModal = (product = null) => {
        if (product) {
            setIsEditMode(true);
            setFormData({
                id: product.rawProduct.id,
                productName: product.rawProduct.productName,
                collection: product.rawProduct.collection,
                color: product.rawProduct.color,
                size: product.rawProduct.size,
                price: product.rawProduct.price || 399,
                initialStock: product.rawInventory.runningInventory || 0,
                description: ''
            });
        } else {
            setIsEditMode(false);
            setFormData({
                id: '',
                productName: '',
                collection: 'Urban Active',
                color: '',
                size: 'M',
                price: 399,
                initialStock: 0,
                description: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const productPayload = {
                id: formData.id ? formData.id : undefined,
                productName: formData.productName,
                collection: formData.collection,
                color: formData.color,
                size: formData.size,
                price: parseFloat(formData.price) || 0
            };

            let savedProduct;

            if (isEditMode) {
                savedProduct = await updateProduct(productPayload);
            } else {
                savedProduct = await createProduct(productPayload);

                // Always create an inventory record (even at 0) so order recording never fails
                await updateInventory({
                    productId: savedProduct.id,
                    totalSold: 0,
                    runningInventory: parseInt(formData.initialStock, 10) || 0
                });
            }

            handleCloseModal();
            loadCatalog();
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Failed to save product. Check console.');
        }
    };

    const handleDelete = async (productId) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await deleteProduct(productId);
                loadCatalog();
            } catch (error) {
                console.error("Error deleting product:", error);
                alert("Failed to delete product.");
            }
        }
    };

    const handleExport = async () => {
        try {
            await exportInventory();
        } catch (error) {
            console.error("Export failed", error);
            alert("Failed to export data.");
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
                    <button className="btn-secondary" onClick={handleExport}>
                        <Download size={16} /> Export
                    </button>
                    <button className="btn-primary" onClick={() => handleOpenModal()}>
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
                                <th width="80" className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center text-muted" style={{ padding: '48px 0' }}>
                                        Loading catalog...
                                    </td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center text-muted" style={{ padding: '48px 0' }}>
                                        No products found. Start by adding a new product.
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.id}>
                                        <td className="text-muted">{product.id.substring(0, 8)}...</td>
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
                                        <td className="text-right">
                                            <button className="icon-btn text-blue-500" onClick={() => handleOpenModal(product)} title="Edit">
                                                <Edit size={16} />
                                            </button>
                                            <button className="icon-btn text-red-500" onClick={() => handleDelete(product.id)} title="Delete">
                                                <Trash2 size={16} />
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
                        Showing <span className="font-medium">1</span> to <span className="font-medium">{products.length}</span> of <span className="font-medium">{products.length}</span> results
                    </div>
                    <div className="pagination-controls">
                        <button className="btn-page" disabled>Previous</button>
                        <button className="btn-page" disabled>Next</button>
                    </div>
                </div>
            </div>

            {/* Add/Edit Product Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">{isEditMode ? 'Edit Product' : 'Add New Product'}</h2>
                            <button className="modal-close" onClick={handleCloseModal}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group mb-4">
                                    <label className="form-label">Product Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="productName"
                                        value={formData.productName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group mb-4">
                                    <label className="form-label">Collection/Category</label>
                                    <select
                                        className="form-control"
                                        name="collection"
                                        value={formData.collection}
                                        onChange={handleInputChange}
                                    >
                                        <option value="Urban Active">Urban Active</option>
                                        <option value="Pro Performance">Pro Performance</option>
                                        <option value="Yoga Essentials">Yoga Essentials</option>
                                        <option value="Lounge Comfort">Lounge Comfort</option>
                                    </select>
                                </div>
                                <div className="form-group mb-4">
                                    <label className="form-label">Selling Price (₱)</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="form-group">
                                        <label className="form-label">Color</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="color"
                                            value={formData.color}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Size</label>
                                        <select
                                            className="form-control"
                                            name="size"
                                            value={formData.size}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="XS">XS</option>
                                            <option value="S">S</option>
                                            <option value="M">M</option>
                                            <option value="L">L</option>
                                            <option value="XL">XL</option>
                                            <option value="XXL">XXL</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group mb-4">
                                    <label className="form-label">Optional Description</label>
                                    <textarea
                                        className="form-control"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows="2"
                                        placeholder="Will not be saved to ML backend schema, pure UI feature"
                                    ></textarea>
                                </div>
                                {!isEditMode && (
                                    <div className="form-group mb-4">
                                        <label className="form-label">Initial Stock in Hand</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="initialStock"
                                            value={formData.initialStock}
                                            onChange={handleInputChange}
                                            min="0"
                                            required
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-outline" onClick={handleCloseModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    {isEditMode ? 'Save Changes' : 'Create Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductCatalog;
