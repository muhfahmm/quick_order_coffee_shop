import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit3, Coffee, Check, X, Inbox, Upload, Image as ImageIcon } from 'lucide-react';
import { productService, categoryService } from '../../services/api';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    category_id: '',
    name: '',
    description: '',
    price: '',
    is_available: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [editFormData, setEditFormData] = useState({
    category_id: '',
    name: '',
    description: '',
    price: '',
    is_available: true
  });
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleEditChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setEditFormData({ ...editFormData, [e.target.name]: val });
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditImageFile(file);
      setEditImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = new FormData();
      payload.append('category_id', formData.category_id);
      payload.append('name', formData.name);
      payload.append('price', formData.price);
      payload.append('description', formData.description || '');
      payload.append('is_available', formData.is_available ? 1 : 0);
      if (imageFile) {
        payload.append('image', imageFile);
      }

      await productService.create(payload);
      setShowAddModal(false);
      setFormData({ category_id: categories[0]?.id || '', name: '', description: '', price: '', is_available: true });
      setImageFile(null);
      setImagePreview(null);
      fetchProductsAndCategories();
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menyimpan menu ke database.');
    }
  };

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setEditFormData({
      category_id: prod.category_id,
      name: prod.name,
      description: prod.description || '',
      price: prod.price,
      is_available: prod.is_available
    });
    setEditImageFile(null);
    setEditImagePreview(prod.image || null);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      const payload = new FormData();
      payload.append('category_id', editFormData.category_id);
      payload.append('name', editFormData.name);
      payload.append('price', editFormData.price);
      payload.append('description', editFormData.description || '');
      payload.append('is_available', editFormData.is_available ? 1 : 0);
      if (editImageFile) {
        payload.append('image', editImageFile);
      }

      await productService.update(editingProduct.id, payload);
      setEditingProduct(null);
      setEditImageFile(null);
      setEditImagePreview(null);
      fetchProductsAndCategories();
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal memperbarui menu produk.');
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
          <p className="page-subtitle">Upload foto produk dan kelola data menu tersimpan di MySQL (`tb_products`)</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-action-primary">
          <Plus size={16} /> Tambah Produk
        </button>
      </div>

      {showAddModal && (
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
                <label>Upload Foto / Gambar Produk</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <label htmlFor="upload-add-image" style={{ background: '#F4ECE1', border: '1px dashed #D97706', padding: '10px 16px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: '#7C4012' }}>
                    <Upload size={16} /> Pilih File Foto
                  </label>
                  <input id="upload-add-image" type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #E8DFD5' }} />
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Deskripsi</label>
                <textarea name="description" placeholder="Penjelasan singkat menu..." value={formData.description} onChange={handleChange} />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">Batal</button>
                <button type="submit" className="btn-primary-auth">Upload & Simpan Ke MySQL</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingProduct && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Edit Menu Makanan / Minuman</h3>
            <form onSubmit={handleUpdateProduct} className="auth-form mt-4">
              <div className="form-group">
                <label>Kategori Menu</label>
                <select name="category_id" value={editFormData.category_id} onChange={handleEditChange} required className="input-wrapper">
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Nama Menu</label>
                <input type="text" name="name" value={editFormData.name} onChange={handleEditChange} required />
              </div>

              <div className="form-group">
                <label>Harga (Rp)</label>
                <input type="number" name="price" value={editFormData.price} onChange={handleEditChange} required />
              </div>

              <div className="form-group">
                <label>Upload Foto / Gambar Produk Baru</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <label htmlFor="upload-edit-image" style={{ background: '#F4ECE1', border: '1px dashed #D97706', padding: '10px 16px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: '#7C4012' }}>
                    <Upload size={16} /> Ganti File Foto
                  </label>
                  <input id="upload-edit-image" type="file" accept="image/*" onChange={handleEditFileChange} style={{ display: 'none' }} />
                  {editImagePreview && (
                    <img src={editImagePreview} alt="Preview" style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #E8DFD5' }} />
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Deskripsi</label>
                <textarea name="description" value={editFormData.description} onChange={handleEditChange} />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setEditingProduct(null)} className="btn-secondary">Batal</button>
                <button type="submit" className="btn-primary-auth">Simpan Perubahan</button>
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
              <th>Foto & Nama Menu</th>
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
                      {prod.image ? (
                        <img
                          src={prod.image}
                          alt={prod.name}
                          style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #E8DFD5' }}
                        />
                      ) : (
                        <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#F4ECE1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Coffee size={20} className="text-amber-700" />
                        </div>
                      )}
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
                      <button onClick={() => handleOpenEdit(prod)} className="btn-icon" title="Edit Produk"><Edit3 size={16} /></button>
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
                    <p>Belum ada produk di database. Klik tombol "Tambah Produk".</p>
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
