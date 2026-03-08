const API_BASE_URL = '/api';

export const fetchProducts = async () => {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
};

export const createProduct = async (productData) => {
    const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
    });
    if (!response.ok) throw new Error('Failed to create product');
    return response.json();
};

export const updateProduct = async (productData) => {
    const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST', // Backend uses POST for save/update
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
    });
    if (!response.ok) throw new Error('Failed to update product');
    return response.json();
};

export const deleteProduct = async (productId) => {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete product');
};

export const fetchOrders = async () => {
    const response = await fetch(`${API_BASE_URL}/orders`);
    if (!response.ok) throw new Error('Failed to fetch orders');
    return response.json();
};

export const createOrder = async (orderData) => {
    const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
    });
    if (!response.ok) throw new Error('Failed to create order');
    return response.json();
};

export const fetchInventory = async () => {
    const response = await fetch(`${API_BASE_URL}/inventory`);
    if (!response.ok) throw new Error('Failed to fetch inventory');
    return response.json();
};

export const fetchInventorySnapshots = async () => {
    const response = await fetch(`${API_BASE_URL}/inventory-snapshots`);
    if (!response.ok) throw new Error('Failed to fetch inventory snapshots');
    return response.json();
};

export const updateInventory = async (inventoryData) => {
    const response = await fetch(`${API_BASE_URL}/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inventoryData)
    });
    if (!response.ok) throw new Error('Failed to update inventory');
    return response.json();
};

export const exportInventory = async () => {
    const response = await fetch(`${API_BASE_URL}/export/inventory`);
    if (!response.ok) throw new Error('Failed to export inventory CSV');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
};

export const exportOrders = async () => {
    const response = await fetch(`${API_BASE_URL}/export/orders`);
    if (!response.ok) throw new Error('Failed to export orders CSV');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
};

export const exportInventorySnapshots = async () => {
    const response = await fetch(`${API_BASE_URL}/export/inventory-snapshots`);
    if (!response.ok) throw new Error('Failed to export snapshots CSV');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory_history.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
};

export const exportAllData = async () => {
    const response = await fetch(`${API_BASE_URL}/export/all`);
    if (!response.ok) throw new Error('Failed to export all data');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fittrends_export.zip';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
};

export const loginUser = async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
        throw new Error('Invalid email or password');
    }
    return response.json();
};

export const fetchUsers = async () => {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
};

export const createUser = async (userData) => {
    const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(errorMsg || 'Failed to create user');
    }
    return response.json();
};

export const deleteUser = async (userId) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE'
    });
    
    if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(errorMsg || 'Failed to delete user');
    }
    return response.text();
};

export const fetchForecast = async () => {
    const response = await fetch(`${API_BASE_URL}/forecast`);
    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to fetch forecast data');
    }
    return response.json();
};

