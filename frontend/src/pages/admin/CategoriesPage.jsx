import React, { useState, useEffect } from 'react';
import { Plus, Tag, Inbox, Edit3, Trash2 } from 'lucide-react';
import { categoryService } from '../../services/api';

export default function CategoriesPage() {
  const [categories, setCategories] = useState(() => {
    try {
      const cached = localStorage.getItem('cached_categories');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [name, setName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editName, setEditName] = useState('');

  const fetchCategories = async () => {
    try {
      const res = await categoryService.getAll();
      const catData = res.data.data || [];
      setCategories(catData);
      localStorage.setItem('cached_categories', JSON.stringify(catData));
    } catch (err) {
      console.error('Gagal mengambil kategori dari database:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name) return;
    try {
      await categoryService.create({ name });
      setName('');
      fetchCategories();
    } catch (err) {
      console.error('Error adding category:', err);
      alert(err.response?.data?.message || 'Gagal menambah kategori ke database');
    }
  };

  const handleEditOpen = (cat) => {
    setEditingCategory(cat);
    setEditName(cat.name);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingCategory || !editName) return;
    try {
      await categoryService.update(editingCategory.id, { name: editName });
      setEditingCategory(null);
      setEditName('');
      fetchCategories();
    } catch (err) {
      console.error('Error updating category:', err);
      alert(err.response?.data?.message || 'Gagal memperbarui kategori');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus kategori ini dari database?')) {
      try {
        await categoryService.delete(id);
        fetchCategories();
      } catch (err) {
        console.error('Error deleting category:', err);
        alert('Gagal menghapus kategori');
      }
    }
  };

  return (
    <div className="categories-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Kategori Menu Resto</h1>
          <p className="page-subtitle">Kelola pengelompokan produk yang tersimpan di MySQL (`tb_categories`)</p>
        </div>
      </div>

      {editingCategory && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Edit Kategori Menu</h3>
            <form onSubmit={handleUpdate} className="auth-form mt-4">
              <div className="form-group">
                <label>Nama Kategori</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setEditingCategory(null)} className="btn-secondary">
                  Batal
                </button>
                <button type="submit" className="btn-primary-auth">
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="tables-layout-grid">
        <div className="card-panel">
          <div className="card-header">
            <h3><Plus size={18} /> Tambah Kategori Baru</h3>
          </div>
          <form onSubmit={handleAdd} className="add-table-form">
            <div className="form-group">
              <label>Nama Kategori</label>
              <input
                type="text"
                placeholder="Contoh: Cold Brew Special"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary-auth">
              <Tag size={18} /> Simpan Kategori
            </button>
          </form>
        </div>

        <div className="card-panel">
          <div className="card-header">
            <h3>Daftar Kategori Terdaftar</h3>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Nama Kategori</th>
                <th>Slug URL</th>
                <th>Jumlah Produk</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <tr key={cat.id}>
                    <td className="font-semibold">{cat.name}</td>
                    <td><code className="slug-code">{cat.slug}</code></td>
                    <td>{cat.products_count || 0} Menu</td>
                    <td>
                      <div className="action-buttons">
                        <button onClick={() => handleEditOpen(cat)} className="btn-icon" title="Edit Kategori">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => handleDelete(cat.id)} className="btn-icon danger" title="Hapus Kategori">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-muted">
                    <div className="empty-state">
                      <Inbox size={32} />
                      <p>Belum ada kategori terdaftar di database</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
