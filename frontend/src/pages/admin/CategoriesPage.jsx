import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Tag, Inbox } from 'lucide-react';
import { categoryService } from '../../services/api';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await categoryService.getAll();
      setCategories(res.data.data || []);
    } catch (err) {
      console.error('Gagal mengambil kategori:', err);
    } finally {
      setIsLoading(false);
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
      alert('Gagal menambah kategori ke database');
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
              <Tag size={18} /> Simpan Ke MySQL
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
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="3" className="text-center py-4">Memuat data...</td></tr>
              ) : categories.length > 0 ? (
                categories.map((cat) => (
                  <tr key={cat.id}>
                    <td className="font-semibold">{cat.name}</td>
                    <td><code className="slug-code">{cat.slug}</code></td>
                    <td>{cat.products_count || 0} Menu</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center py-6 text-muted">
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
