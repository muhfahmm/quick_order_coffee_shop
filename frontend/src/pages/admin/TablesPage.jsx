import React, { useState, useEffect } from 'react';
import { Plus, Trash2, MapPin, Inbox } from 'lucide-react';
import { tableService } from '../../services/api';

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
    const interval = setInterval(fetchTables, 5000);
    return () => clearInterval(interval);
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
          <h1 className="page-title">Kelola Meja Resto</h1>
          <p className="page-subtitle">Daftar meja aktif yang dapat dipilih oleh customer saat melakukan pemesanan</p>
        </div>
      </div>

      <div className="tables-layout-grid">
        <div className="card-panel">
          <div className="card-header">
            <h3><Plus size={18} /> Tambah Meja Baru</h3>
          </div>
          <form onSubmit={handleAddTable} className="add-table-form">
            <div className="form-group">
              <label>Nomor / Nama Meja</label>
              <input
                type="text"
                placeholder="Contoh: Meja 01"
                value={newTableName}
                onChange={(e) => setNewTableName(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary-auth">
              <Plus size={18} /> Simpan Meja Ke Database
            </button>
          </form>
        </div>

        <div className="tables-cards-grid">
          {tables.length > 0 ? (
            tables.map((tbl) => {
              return (
                <div key={tbl.id} className="table-qr-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div className="table-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ background: '#F4ECE1', color: '#7C4012', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <MapPin size={20} />
                      </div>
                      <span className="table-name" style={{ fontSize: '16px', fontWeight: 800 }}>{tbl.table_number}</span>
                    </div>

                    <div className="action-buttons">
                      <button onClick={() => handleDeleteTable(tbl.id)} className="btn-icon danger" title="Hapus Meja">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #F4ECE1' }}>
                    <span style={{ fontSize: '12px', color: '#7A695C', fontWeight: 600 }}>Status Meja:</span>
                    <button
                      onClick={() => handleToggleStatus(tbl)}
                      className={`status-pill ${tbl.status === 'occupied' ? 'processing' : 'completed'}`}
                      title="Klik untuk ubah status meja"
                      style={{ cursor: 'pointer' }}
                    >
                      {tbl.status === 'occupied' ? 'Terisi' : 'Kosong'}
                    </button>
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
