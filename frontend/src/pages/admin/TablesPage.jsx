import React, { useState } from 'react';
import { QrCode, Plus, Printer, ExternalLink, Inbox } from 'lucide-react';

export default function TablesPage() {
  const [tables, setTables] = useState([]);
  const [newTableName, setNewTableName] = useState('');

  const handleAddTable = (e) => {
    e.preventDefault();
    if (!newTableName) return;
    const newToken = `tbl-token-${Date.now()}`;
    const newEntry = {
      id: Date.now(),
      table_number: newTableName,
      qr_code_token: newToken,
      status: 'available',
      qrUrl: `http://localhost:5173/scan?table=${newToken}`
    };
    setTables([...tables, newEntry]);
    setNewTableName('');
  };

  return (
    <div className="tables-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Manajemen Meja & QR Code Scan</h1>
          <p className="page-subtitle">Generasi QR Code Unik per meja untuk pemesanan langsung dari smartphone customer</p>
        </div>
      </div>

      <div className="tables-layout-grid">
        {/* Form Tambah Meja Baru */}
        <div className="card-panel">
          <div className="card-header">
            <h3><Plus size={18} /> Tambah Meja Baru</h3>
          </div>
          <form onSubmit={handleAddTable} className="add-table-form">
            <div className="form-group">
              <label>Nomor / Label Meja</label>
              <input
                type="text"
                placeholder="Contoh: Meja 01"
                value={newTableName}
                onChange={(e) => setNewTableName(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary-auth">
              <QrCode size={18} /> Generate QR Code Meja
            </button>
          </form>
        </div>

        {/* Daftar Kartu Meja & QR */}
        <div className="tables-cards-grid">
          {tables.length > 0 ? (
            tables.map((tbl) => (
              <div key={tbl.id} className="table-qr-card">
                <div className="table-card-header">
                  <span className="table-name">{tbl.table_number}</span>
                  <span className={`status-pill ${tbl.status === 'occupied' ? 'processing' : 'completed'}`}>
                    {tbl.status === 'occupied' ? 'Terisi' : 'Kosong'}
                  </span>
                </div>

                <div className="qr-preview-box">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(tbl.qrUrl)}`}
                    alt={`QR Code ${tbl.table_number}`}
                    className="qr-image"
                  />
                  <span className="token-text">{tbl.qr_code_token}</span>
                </div>

                <div className="qr-card-actions">
                  <button className="btn-secondary" title="Cetak Stand Card Meja">
                    <Printer size={16} /> Cetak
                  </button>
                  <a href={tbl.qrUrl} target="_blank" rel="noreferrer" className="btn-secondary" title="Simulasi Scan Customer">
                    <ExternalLink size={16} /> Test Scan
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state-full col-span-3">
              <Inbox size={36} />
              <p>Belum ada data meja. Silakan tambah meja baru di formulir sebelah kiri.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
