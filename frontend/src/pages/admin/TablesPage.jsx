import React, { useState, useEffect } from 'react';
import { QrCode, Plus, Printer, ExternalLink, Inbox, Trash2, Wifi, Globe } from 'lucide-react';
import { tableService } from '../../services/api';
import QRCodeImage from '../../components/common/QRCodeImage';

export default function TablesPage() {
  const [tables, setTables] = useState(() => {
    try {
      const cached = localStorage.getItem('cached_tables');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [newTableName, setNewTableName] = useState('');
  const [customHostIp, setCustomHostIp] = useState(() => {
    const saved = localStorage.getItem('qr_host_ip');
    if (saved && !saved.includes('localhost') && !saved.includes('127.0.0.1')) {
      return saved;
    }
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return window.location.origin;
    }
    return 'http://192.168.117.254:5173';
  });

  const fetchTables = async () => {
    try {
      const res = await tableService.getAll();
      const tblData = res.data.data || [];
      setTables(tblData);
      localStorage.setItem('cached_tables', JSON.stringify(tblData));
    } catch (err) {
      console.error('Gagal mengambil data meja dari database:', err);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleAddTable = async (e) => {
    e.preventDefault();
    if (!newTableName) return;
    try {
      await tableService.create({ table_number: newTableName });
      setNewTableName('');
      fetchTables();
    } catch (err) {
      console.error('Error adding table:', err);
      alert(err.response?.data?.message || 'Gagal menyimpan data meja ke database');
    }
  };

  const handleToggleStatus = async (tbl) => {
    const nextStatus = tbl.status === 'occupied' ? 'available' : 'occupied';
    try {
      await tableService.updateStatus(tbl.id, nextStatus);
      fetchTables();
    } catch (err) {
      console.error('Error updating table status:', err);
    }
  };

  const handleDeleteTable = async (id) => {
    if (window.confirm('Hapus data meja ini dari database?')) {
      try {
        await tableService.delete(id);
        fetchTables();
      } catch (err) {
        console.error('Error deleting table:', err);
        alert('Gagal menghapus meja');
      }
    }
  };

  return (
    <div className="tables-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Manajemen Meja & QR Code Scan</h1>
          <p className="page-subtitle">Generasi QR Code Unik per meja tersimpan di database MySQL (`tb_tables`)</p>
        </div>
      </div>

      {/* Network IP QR Code Config Bar */}
      <div
        style={{
          background: 'linear-gradient(135deg, #FFF8F0, #FEF3C7)',
          border: '1.5px solid #FED7AA',
          borderRadius: '16px',
          padding: '12px 18px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 2px 8px rgba(217, 119, 6, 0.08)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: '#7C4012', color: '#FFF', width: '34px', height: '34px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wifi size={18} />
          </div>
          <div>
            <strong style={{ fontSize: '13px', color: '#2D1A10', display: 'block' }}>
              URL Host QR Code (Akses HP Fisik):
            </strong>
            <span style={{ fontSize: '11px', color: '#7C4012' }}>
              Gunakan IP Komputer agar kamera HP fisik dapat membuka webpage saat di-scan
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Globe size={16} style={{ color: '#D97706' }} />
          <input
            type="text"
            value={customHostIp}
            onChange={(e) => {
              const val = e.target.value;
              setCustomHostIp(val);
              localStorage.setItem('qr_host_ip', val);
            }}
            placeholder="http://192.168.117.254:5173"
            style={{
              padding: '7px 12px',
              borderRadius: '10px',
              border: '1.5px solid #D97706',
              fontSize: '12px',
              fontWeight: 700,
              width: '240px',
              color: '#2D1A10',
              background: '#FFFFFF',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
            }}
          />
        </div>
      </div>

      <div className="tables-layout-grid">
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
              <QrCode size={18} /> Simpan Ke Database
            </button>
          </form>
        </div>

        <div className="tables-cards-grid">
          {tables.length > 0 ? (
            tables.map((tbl) => {
              let targetHost = (customHostIp || '').trim().replace(/\/$/, '');
              if (!targetHost || targetHost.includes('localhost') || targetHost.includes('127.0.0.1')) {
                targetHost = 'http://192.168.117.254:5173';
              } else if (!targetHost.startsWith('http')) {
                targetHost = `http://${targetHost}`;
              }
              const scanUrl = `${targetHost}/scan?table=${encodeURIComponent(tbl.table_number)}&token=${tbl.qr_code_token}`;
              return (
                <div key={tbl.id} className="table-qr-card">
                  <div className="table-card-header">
                    <span className="table-name">{tbl.table_number}</span>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleToggleStatus(tbl)}
                        className={`status-pill ${tbl.status === 'occupied' ? 'processing' : 'completed'}`}
                        title="Klik untuk ubah status meja"
                        style={{ cursor: 'pointer' }}
                      >
                        {tbl.status === 'occupied' ? 'Terisi' : 'Kosong'}
                      </button>
                      <button onClick={() => handleDeleteTable(tbl.id)} className="btn-icon danger" title="Hapus Meja">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="qr-preview-box">
                    <QRCodeImage
                      value={scanUrl}
                      size={150}
                      alt={`QR Code ${tbl.table_number}`}
                      className="qr-image"
                    />
                    <span className="token-text">{tbl.qr_code_token}</span>
                  </div>

                  <div className="qr-card-actions">
                    <button className="btn-secondary" title="Cetak Stand Card Meja" onClick={() => window.print()}>
                      <Printer size={16} /> Cetak
                    </button>
                    <a href={scanUrl} target="_blank" rel="noreferrer" className="btn-secondary" title="Simulasi Scan Customer">
                      <ExternalLink size={16} /> Test Scan
                    </a>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-state-full col-span-3">
              <Inbox size={36} />
              <p>Belum ada data meja di database. Silakan tambah meja baru di formulir sebelah kiri.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
