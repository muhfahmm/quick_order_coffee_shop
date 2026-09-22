import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Coffee,
  LayoutDashboard,
  QrCode,
  UtensilsCrossed,
  Layers,
  ShoppingBag,
  LogOut,
  Search,
  ExternalLink,
  Store,
  Flame,
  Home,
  Menu,
  X
} from 'lucide-react';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const titleMap = {
      '/admin/dashboard': 'Dashboard Overview - Admin Control',
      '/admin/orders': 'Daftar Live Orders - Admin Control',
      '/admin/tables': 'Kelola Meja & QR Token - Admin Control',
      '/admin/products': 'Kelola Menu Produk - Admin Control',
      '/admin/highlights': 'Highlight Menu Resto - Admin Control',
      '/admin/categories': 'Kategori Menu Cafe - Admin Control'
    };
    document.title = titleMap[location.pathname] || 'Panel Admin Dashboard - Resto Control';
    setIsSidebarOpen(false);
  }, [location.pathname]);

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Live Orders', path: '/admin/orders', icon: ShoppingBag, badge: 'Live' },
    { label: 'Kelola Meja & QR', path: '/admin/tables', icon: QrCode },
    { label: 'Daftar Menu Produk', path: '/admin/products', icon: UtensilsCrossed },
    { label: 'Highlight Menu', path: '/admin/highlights', icon: Flame },
    { label: 'Kategori Menu', path: '/admin/categories', icon: Layers },
  ];

  return (
    <div className="admin-layout">
      {/* Mobile Sidebar Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`admin-sidebar ${isSidebarOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="brand-badge-small">
              <Coffee size={22} />
            </div>
            <div className="brand-info">
              <h2>CoffeeShop</h2>
              <span>Quick Order Admin</span>
            </div>
          </div>
          <button
            type="button"
            className="mobile-sidebar-close-btn"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">UTAMA</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile-card">
            <div className="user-details">
              <h4>{user.name}</h4>
              <span>{user.role.toUpperCase()}</span>
            </div>
          </div>
          <button onClick={logout} className="btn-logout" title="Keluar">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-navbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              className="mobile-menu-toggle-btn"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Toggle Sidebar Navigation"
            >
              <Menu size={22} />
            </button>

            <div className="search-bar">
              <Search size={18} className="search-icon" />
              <input type="text" placeholder="Cari pesanan, meja, atau menu..." />
            </div>
          </div>

          <div className="navbar-actions">
            <Link to="/menu" target="_blank" className="btn-customer-redirect">
              <Store size={18} />
              <span className="btn-redirect-text">Order Customer</span>
              <ExternalLink size={14} />
            </Link>

            <Link to="/web" target="_blank" className="btn-customer-redirect btn-web-resto" style={{ background: '#FAF6F0', color: '#7C4012', border: '1px solid #E8DFD5' }}>
              <Home size={18} />
              <span className="btn-redirect-text">Web Resto</span>
              <ExternalLink size={14} />
            </Link>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
