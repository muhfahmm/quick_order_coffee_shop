import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Clock,
  DollarSign,
  Coffee,
  ArrowUpRight,
  Inbox,
  CupSoda
} from 'lucide-react';
import { orderService, tableService, productService, categoryService } from '../../services/api';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    todayRevenue: 'Rp 0',
    totalOrders: '0 Pesanan',
    occupiedTables: '0 / 0 Meja',
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [tables, setTables] = useState([]);

  const fetchDashboardData = async () => {
    try {
      const [resOrders, resTables, resProd, resCat] = await Promise.all([
        orderService.getAll(),
        tableService.getAll(),
        productService.getAll(),
        categoryService.getAll()
      ]);

      const ordersData = resOrders.data.data || [];
      const tablesData = resTables.data.data || [];
      const prodData = resProd.data.data || [];
      const catData = resCat.data.data || [];

      setRecentOrders(ordersData.slice(0, 5));
      setTables(tablesData);

      localStorage.setItem('cached_tables', JSON.stringify(tablesData));
      localStorage.setItem('cached_products', JSON.stringify(prodData));
      localStorage.setItem('cached_categories', JSON.stringify(catData));

      const totalRev = ordersData.reduce((acc, curr) => acc + Number(curr.total_amount || 0), 0);
      const occupiedCount = tablesData.filter(t => t.status === 'occupied').length;

      setStats({
        todayRevenue: `Rp ${totalRev.toLocaleString('id-ID')}`,
        totalOrders: `${ordersData.length} Pesanan`,
        occupiedTables: `${occupiedCount} / ${tablesData.length} Meja`,
      });
    } catch (err) {
      console.error('Gagal mengambil data dashboard:', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Ikhtisar Coffee Shop & Bar</h1>
          <p className="page-subtitle">Pantau transaksi pesanan kopi, status meja, dan pendapatan kedai secara real-time</p>
        </div>
        <button onClick={fetchDashboardData} className="btn-action-primary">
          <CupSoda size={18} />
          <span>Refresh Data Dashboard</span>
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Pendapatan Hari Ini</span>
            <div className="stat-icon-wrapper"><DollarSign size={20} /></div>
          </div>
          <div className="stat-body">
            <h3 className="stat-value">{stats.todayRevenue}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Total Pesanan Kopi</span>
            <div className="stat-icon-wrapper"><ShoppingBag size={20} /></div>
          </div>
          <div className="stat-body">
            <h3 className="stat-value">{stats.totalOrders}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Meja Terisi Saat Ini</span>
            <div className="stat-icon-wrapper"><Coffee size={20} /></div>
          </div>
          <div className="stat-body">
            <h3 className="stat-value">{stats.occupiedTables}</h3>
          </div>
        </div>
      </div>

      <div className="dashboard-content-grid">
        <div className="card-panel">
          <div className="card-header">
            <h3>Pesanan Masuk Terbaru (Quick Order Meja)</h3>
            <a href="/admin/orders" className="link-more">
              Lihat Semua Live Orders <ArrowUpRight size={16} />
            </a>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>No. Order</th>
                  <th>Meja</th>
                  <th>Nama Pelanggan</th>
                  <th>Total Transaksi</th>
                  <th>Status Pesanan</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length > 0 ? (
                  recentOrders.map((ord) => (
                    <tr key={ord.id}>
                      <td className="font-semibold text-amber-700">{ord.order_code}</td>
                      <td><span className="table-tag">{ord.table_number || 'General'}</span></td>
                      <td className="font-medium">{ord.customer_name}</td>
                      <td className="font-semibold">Rp {Number(ord.total_amount).toLocaleString('id-ID')}</td>
                      <td><span className={`status-pill ${ord.status}`}>{ord.status}</span></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-6 text-muted">
                      <div className="empty-state">
                        <Inbox size={32} />
                        <p>Belum ada pesanan masuk di database</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card-panel">
          <div className="card-header">
            <h3>Status Okupansi Meja Kedai</h3>
          </div>
          <div className="table-status-list">
            {tables.length > 0 ? (
              tables.map((tbl) => (
                <div key={tbl.id} className={`table-status-item ${tbl.status === 'occupied' ? 'occupied' : 'free'}`}>
                  <div className="table-number-box">{tbl.table_number}</div>
                  <div className="table-info">
                    <span className="status-label">{tbl.status === 'occupied' ? 'Sedang Terisi' : 'Kosong'}</span>
                    <span className="token-hint">QR Token: {tbl.qr_code_token}</span>
                  </div>
                  <span className={`badge-status ${tbl.status === 'occupied' ? 'active' : 'idle'}`}>
                    {tbl.status === 'occupied' ? 'Terisi' : 'Kosong'}
                  </span>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <Inbox size={28} />
                <p>Belum ada data meja terdaftar</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
