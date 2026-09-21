import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Coffee, Check, X, Inbox } from 'lucide-react';
import { productService, categoryService } from '../../services/api';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    category_id: '',
    name: '',
    description: '',
    price: '',
    is_available: true
  });

  const fetchProductsAndCategories = async () => {
    try {
      const [resProd, resCat] = await Promise.all([
        productService.getAll(),
        categoryService.getAll()
      ]);
      setProducts(resProd.data.data || []);
      const cats = resCat.data.data || [];
      setCategories(cats);
      if (cats.length > 0 && !formData.category_id) {
        setFormData(prev => ({ ...prev, category_id: cats[0].id }));
      }
    } catch (error) {
      console.error('Gagal mengambil data dari database MySQL:', error);
    }
  };

  useEffect(() => {
    fetchProductsAndCategories();
  }, []);

  const handleChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: val });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await productService.create(formData);
      setShowModal(false);
      setFormData({ category_id: categories[0]?.id || '', name: '', description: '', price: '', is_available: true });
      fetchProductsAndCategories();
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menyimpan menu ke database.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus menu produk ini dari database?')) {
      try {
        await productService.delete(id);
        fetchProductsAndCategories();
      } catch (error) {
        alert('Gagal menghapus produk');
      }
    }
  };

  const toggleAvailability = async (prod) => {
    try {
      await productService.update(prod.id, { is_available: !prod.is_available });
      fetchProductsAndCategories();
    } catch (error) {
      alert('Gagal memperbarui status ketersediaan');
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="products-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Daftar Produk & Menu Kopi</h1>
          <p className="page-subtitle">Data produk langsung tersimpan & terambil dari database MySQL (`tb_products`)</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-action-primary">
          <Plus size={16} /> Tambah Menu Ke Database
        </button>
      </div>

      {/* Modal Tambah Produk Baru */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Tambah Menu Makanan / Minuman</h3>
            <form onSubmit={handleAddProduct} className="auth-form mt-4">
              <div className="form-group">
                <label>Kategori Menu</label>
                <select name="category_id" value={formData.category_id} onChange={handleChange} required className="input-wrapper">
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Nama Menu</label>
                <input type="text" name="name" placeholder="Contoh: Espresso Single" value={formData.name} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Harga (Rp)</label>
                <input type="number" name="price" placeholder="15000" value={formData.price} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Deskripsi</label>
                <textarea name="description" placeholder="Penjelasan singkat menu..." value={formData.description} onChange={handleChange} />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Batal</button>
                <button type="submit" className="btn-primary-auth">Simpan Ke MySQL</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card-panel">
        <div className="card-header">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Cari nama menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Nama Menu</th>
              <th>Kategori</th>
              <th>Harga</th>
              <th>Status Stok</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((prod) => (
                <tr key={prod.id}>
                  <td className="font-semibold">
                    <div className="product-title-cell">
                      <Coffee size={18} className="text-amber-500" />
                      <span>{prod.name}</span>
                    </div>
                  </td>
                  <td><span className="table-tag">{prod.category?.name || '-'}</span></td>
                  <td className="font-semibold">Rp {Number(prod.price).toLocaleString('id-ID')}</td>
                  <td>
                    <button
                      onClick={() => toggleAvailability(prod)}
                      className={`btn-toggle-stock ${prod.is_available ? 'available' : 'empty'}`}
                    >
                      {prod.is_available ? <Check size={14} /> : <X size={14} />}
                      <span>{prod.is_available ? 'Tersedia' : 'Stok Habis'}</span>
                    </button>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => handleDelete(prod.id)} className="btn-icon danger" title="Hapus Dari MySQL"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-6 text-muted">
                  <div className="empty-state">
                    <Inbox size={32} />
                    <p>Belum ada produk di database. Klik tombol "Tambah Menu Ke Database".</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
