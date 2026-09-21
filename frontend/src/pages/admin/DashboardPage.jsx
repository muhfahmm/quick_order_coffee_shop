import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  DollarSign,
  Coffee,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Inbox
} from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    todayRevenue: 'Rp 0',
    totalOrders: '0 Pesanan',
    occupiedTables: '0 / 0 Meja',
    avgTime: '0 Mins'
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [tables, setTables] = useState([]);

  return (
    <div className="dashboard-page">
      {/* Header Halaman */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard Ikhtisar Resto</h1>
          <p className="page-subtitle">Pantau aktivitas transaksi cepat dan statistik meja secara real-time</p>
        </div>
        <button className="btn-action-primary">
          <span>Unduh Laporan Hari Ini</span>
        </button>
      </div>

      {/* Grid Statistik / KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-emerald">
          <div className="stat-header">
            <span className="stat-title">Pendapatan Hari Ini</span>
            <div className="stat-icon-wrapper"><DollarSign size={20} /></div>
          </div>
          <div className="stat-body">
            <h3 className="stat-value">{stats.todayRevenue}</h3>
          </div>
        </div>

        <div className="stat-card stat-amber">
          <div className="stat-header">
            <span className="stat-title">Total Pesanan Masuk</span>
            <div className="stat-icon-wrapper"><ShoppingBag size={20} /></div>
          </div>
          <div className="stat-body">
            <h3 className="stat-value">{stats.totalOrders}</h3>
          </div>
        </div>

        <div className="stat-card stat-blue">
          <div className="stat-header">
            <span className="stat-title">Meja Terisi Saat Ini</span>
            <div className="stat-icon-wrapper"><Coffee size={20} /></div>
          </div>
          <div className="stat-body">
            <h3 className="stat-value">{stats.occupiedTables}</h3>
          </div>
        </div>

        <div className="stat-card stat-purple">
          <div className="stat-header">
            <span className="stat-title">Waktu Rata-rata Masak</span>
            <div className="stat-icon-wrapper"><Clock size={20} /></div>
          </div>
          <div className="stat-body">
            <h3 className="stat-value">{stats.avgTime}</h3>
          </div>
        </div>
      </div>

      {/* Grid Konten Utama Dashboard */}
      <div className="dashboard-content-grid">
        {/* Pesanan Terbaru */}
        <div className="card-panel">
          <div className="card-header">
            <h3>Pesanan Masuk Terbaru (Scan QR Meja)</h3>
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
                  <th>Nama Pemesan</th>
                  <th>Detail Item</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length > 0 ? (
                  recentOrders.map((ord) => (
                    <tr key={ord.id}>
                      <td className="font-medium text-amber-500">{ord.order_code}</td>
                      <td><span className="table-tag">{ord.table_number}</span></td>
                      <td>{ord.customer_name}</td>
                      <td className="text-muted">{ord.items}</td>
                      <td className="font-semibold">Rp {ord.total_amount}</td>
                      <td><span className={`status-pill ${ord.order_status}`}>{ord.order_status}</span></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-6 text-muted">
                      <div className="empty-state">
                        <Inbox size={32} />
                        <p>Belum ada pesanan masuk</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ringkasan Status Meja Live */}
        <div className="card-panel">
          <div className="card-header">
            <h3>Status Okupansi Meja</h3>
          </div>
          <div className="table-status-list">
            {tables.length > 0 ? (
              tables.map((tbl) => (
                <div key={tbl.id} className={`table-status-item ${tbl.status === 'occupied' ? 'occupied' : 'free'}`}>
                  <div className="table-number-box">{tbl.table_number}</div>
                  <div className="table-info">
                    <span className="status-label">{tbl.status === 'occupied' ? 'Sedang Terisi' : 'Kosong'}</span>
                    <span className="token-hint">QR Code Active</span>
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
