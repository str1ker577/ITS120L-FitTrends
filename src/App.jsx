import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../loginpage';
import Layout from './components/Layout';
import Home from './pages/Home';

// Inventory
import ProductCatalog from './pages/inventory/ProductCatalog';
import Sales from './pages/inventory/Sales';
import StockAdjustment from './pages/inventory/StockAdjustment';

// Reports
import SalesPerformance from './pages/reports/SalesPerformance';
import OverstockingAging from './pages/reports/OverstockingAging';

// Restocking
import OptimalStockList from './pages/restocking/OptimalStockList';
import ModelDecision from './pages/restocking/ModelDecision';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Route */}
                <Route path="/login" element={<LoginPage />} />

                {/* Dashboard Routes wrapped in Layout */}
                <Route element={<Layout />}>
                    <Route path="/home" element={<Home />} />

                    {/* Inventory Routes */}
                    <Route path="/inventory/catalog" element={<ProductCatalog />} />
                    <Route path="/inventory/sales" element={<Sales />} />
                    <Route path="/inventory/adjustments" element={<StockAdjustment />} />

                    {/* Reports Routes */}
                    <Route path="/reports/sales" element={<SalesPerformance />} />
                    <Route path="/reports/aging" element={<OverstockingAging />} />

                    {/* Restocking Routes */}
                    <Route path="/restocking/optimal" element={<OptimalStockList />} />
                    <Route path="/restocking/model" element={<ModelDecision />} />
                </Route>

                {/* Catch-all to redirect to login */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
