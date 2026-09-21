import React from 'react';
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
  Home
} from 'lucide-react';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

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
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="brand-badge-small">
            <Coffee size={22} />
          </div>
          <div className="brand-info">
            <h2>CoffeeShop</h2>
            <span>Quick Order Admin</span>
          </div>
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
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Cari kode pesanan, meja, atau menu..." />
          </div>

          <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link to="/menu" target="_blank" className="btn-customer-redirect">
              <Store size={18} />
              <span>Halaman Order Customer</span>
              <ExternalLink size={14} />
            </Link>

            <Link to="/web" target="_blank" className="btn-customer-redirect" style={{ background: '#FAF6F0', color: '#7C4012', border: '1px solid #E8DFD5' }}>
              <Home size={18} />
              <span>Web Resto User</span>
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
