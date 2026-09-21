import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

import WebLandingPage from './pages/customer/WebLandingPage';
import QuickOrderPage from './pages/customer/QuickOrderPage';
import CheckoutPage from './pages/customer/CheckoutPage';

import AdminLayout from './layouts/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import OrdersPage from './pages/admin/OrdersPage';
import TablesPage from './pages/admin/TablesPage';
import ProductsPage from './pages/admin/ProductsPage';
import HighlightsPage from './pages/admin/HighlightsPage';
import CategoriesPage from './pages/admin/CategoriesPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<WebLandingPage />} />
          <Route path="/web" element={<WebLandingPage />} />
          <Route path="/quick-order" element={<QuickOrderPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/scan" element={<QuickOrderPage />} />
          <Route path="/menu" element={<QuickOrderPage />} />

          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="tables" element={<TablesPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="highlights" element={<HighlightsPage />} />
            <Route path="categories" element={<CategoriesPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
