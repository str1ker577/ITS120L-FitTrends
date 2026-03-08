import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
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
import ForecastDashboard from './pages/restocking/ForecastDashboard';

// Admin Settings
import UserManagement from './pages/admin/UserManagement';

// ── Route Guards ───────────────────────────────────────────────────────────
const ProtectedRoute = ({ allowedRoles }) => {
    try {
        const session = JSON.parse(localStorage.getItem('fittrends_user')) || {};
        if (!session.role) {
            return <Navigate to="/login" replace />;
        }
        if (allowedRoles && !allowedRoles.includes(session.role)) {
            return <Navigate to="/home" replace />;
        }
        return <Outlet />;
    } catch {
        return <Navigate to="/login" replace />;
    }
};

const ADMIN_ROLES = ['SUPER_ADMIN', 'OWNER', 'ADMIN'];

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Route */}
                <Route path="/login" element={<LoginPage />} />

                {/* Main Layout containing both public and protected dashboard routes */}
                <Route element={<Layout />}>
                    
                    {/* Basic routes accessible by ANY logged in user (Staff, Admin, Owner) */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/home" element={<Home />} />
                        <Route path="/inventory/catalog" element={<ProductCatalog />} />
                        <Route path="/inventory/sales" element={<Sales />} />
                        <Route path="/inventory/adjustments" element={<StockAdjustment />} />
                        <Route path="/reports/sales" element={<SalesPerformance />} />
                        <Route path="/reports/aging" element={<OverstockingAging />} />
                        <Route path="/restocking/optimal" element={<OptimalStockList />} />
                    </Route>

                    {/* Admin-only routes */}
                    <Route element={<ProtectedRoute allowedRoles={ADMIN_ROLES} />}>
                        <Route path="/restocking/model" element={<ModelDecision />} />
                        <Route path="/restocking/forecast" element={<ForecastDashboard />} />
                        <Route path="/settings/users" element={<UserManagement />} />
                    </Route>
                </Route>

                {/* Catch-all to redirect to login */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
