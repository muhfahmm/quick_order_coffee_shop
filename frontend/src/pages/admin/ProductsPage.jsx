import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit3, Coffee, Check, X, Inbox, Upload, Image as ImageIcon, Flame, ChefHat, Snowflake, Target, Sparkles, Info } from 'lucide-react';
import { productService, categoryService } from '../../services/api';

export default function ProductsPage() {
  const [products, setProducts] = useState(() => {
    try {
      const cached = localStorage.getItem('cached_products');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [categories, setCategories] = useState(() => {
    try {
      const cached = localStorage.getItem('cached_categories');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [activeImageTarget, setActiveImageTarget] = useState('main'); // 'main', 'hot', 'ice'

  const [formData, setFormData] = useState({
    category_id: '',
    name: '',
    description: '',
    price: '',
    temperature_type: 'both',
    hot_name: '',
    ice_name: '',
    is_available: true,
    is_best_seller: false,
    is_chef_pick: false
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [hotImageFile, setHotImageFile] = useState(null);
  const [hotImagePreview, setHotImagePreview] = useState(null);
  const [iceImageFile, setIceImageFile] = useState(null);
  const [iceImagePreview, setIceImagePreview] = useState(null);

  const [editFormData, setEditFormData] = useState({
    category_id: '',
    name: '',
    description: '',
    price: '',
    temperature_type: 'both',
    hot_name: '',
    ice_name: '',
    is_available: true,
    is_best_seller: false,
    is_chef_pick: false
  });
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [editHotImageFile, setEditHotImageFile] = useState(null);
  const [editHotImagePreview, setEditHotImagePreview] = useState(null);
  const [editIceImageFile, setEditIceImageFile] = useState(null);
  const [editIceImagePreview, setEditIceImagePreview] = useState(null);

  const fetchProductsAndCategories = async () => {
    try {
      const [resProd, resCat] = await Promise.all([
        productService.getAll(),
        categoryService.getAll()
      ]);
      const prodData = resProd.data.data || [];
      const catData = resCat.data.data || [];
      setProducts(prodData);
      setCategories(catData);
      localStorage.setItem('cached_products', JSON.stringify(prodData));
      localStorage.setItem('cached_categories', JSON.stringify(catData));
      if (catData.length > 0 && !formData.category_id) {
        setFormData(prev => ({ ...prev, category_id: catData[0].id }));
      }
    } catch (error) {
      console.error('Gagal mengambil data dari database MySQL:', error);
    }
  };

  useEffect(() => {
    const handlePaste = (e) => {
      if (!showAddModal && !editingProduct) return;

      const assignImage = (fileOrUrl) => {
        const isFile = fileOrUrl instanceof File;
        const previewUrl = isFile ? URL.createObjectURL(fileOrUrl) : fileOrUrl;

        if (showAddModal) {
          if (activeImageTarget === 'hot') {
            setHotImageFile(fileOrUrl);
            setHotImagePreview(previewUrl);
          } else if (activeImageTarget === 'ice') {
            setIceImageFile(fileOrUrl);
            setIceImagePreview(previewUrl);
          } else {
            setImageFile(fileOrUrl);
            setImagePreview(previewUrl);
          }
        } else if (editingProduct) {
          if (activeImageTarget === 'hot') {
            setEditHotImageFile(fileOrUrl);
            setEditHotImagePreview(previewUrl);
          } else if (activeImageTarget === 'ice') {
            setEditIceImageFile(fileOrUrl);
            setEditIceImagePreview(previewUrl);
          } else {
            setEditImageFile(fileOrUrl);
            setEditImagePreview(previewUrl);
          }
        }
      };

      const items = e.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.type.indexOf('image') !== -1) {
            const blob = item.getAsFile();
            if (blob) {
              const file = new File([blob], `pasted_${activeImageTarget}_${Date.now()}.png`, { type: blob.type });
              assignImage(file);
            }
            return;
          }
        }
      }

      const pastedText = e.clipboardData?.getData('text');
      if (pastedText && (pastedText.startsWith('http://') || pastedText.startsWith('https://') || pastedText.startsWith('data:image/'))) {
        assignImage(pastedText);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [showAddModal, editingProduct, activeImageTarget]);

  const handleChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: val });
  };

  const handleFileChange = (e, target = 'main') => {
    const file = e.target.files[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      if (target === 'hot') {
        setHotImageFile(file);
        setHotImagePreview(preview);
      } else if (target === 'ice') {
        setIceImageFile(file);
        setIceImagePreview(preview);
      } else {
        setImageFile(file);
        setImagePreview(preview);
      }
    }
  };

  const handleEditChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setEditFormData({ ...editFormData, [e.target.name]: val });
  };

  const handleEditFileChange = (e, target = 'main') => {
    const file = e.target.files[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      if (target === 'hot') {
        setEditHotImageFile(file);
        setEditHotImagePreview(preview);
      } else if (target === 'ice') {
        setEditIceImageFile(file);
        setEditIceImagePreview(preview);
      } else {
        setEditImageFile(file);
        setEditImagePreview(preview);
      }
    }
  };

  const handleOpenAddModal = () => {
    const defaultCatId = categories[0]?.id || '';
    setFormData({
      category_id: defaultCatId,
      name: '',
      description: '',
      price: '',
      temperature_type: 'both',
      hot_name: '',
      ice_name: '',
      is_available: true,
      is_best_seller: false,
      is_chef_pick: false
    });
    setImageFile(null);
    setImagePreview(null);
    setHotImageFile(null);
    setHotImagePreview(null);
    setIceImageFile(null);
    setIceImagePreview(null);
    setActiveImageTarget('main');
    setShowAddModal(true);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const selectedCatId = formData.category_id || categories[0]?.id;
      if (!selectedCatId) {
        alert('Silakan pilih atau tambahkan Kategori Menu terlebih dahulu di halaman Kategori.');
        return;
      }

      const payload = new FormData();
      payload.append('category_id', selectedCatId);
      payload.append('name', formData.name);
      payload.append('price', formData.price);
      payload.append('description', formData.description || '');
      payload.append('temperature_type', formData.temperature_type || 'both');
      payload.append('hot_name', formData.hot_name || '');
      payload.append('ice_name', formData.ice_name || '');
      payload.append('is_available', formData.is_available ? 1 : 0);
      payload.append('is_best_seller', formData.is_best_seller ? 1 : 0);
      payload.append('is_chef_pick', formData.is_chef_pick ? 1 : 0);
      if (imageFile) payload.append('image', imageFile);
      if (hotImageFile) payload.append('hot_image', hotImageFile);
      if (iceImageFile) payload.append('ice_image', iceImageFile);

      await productService.create(payload);
      setShowAddModal(false);
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
      temperature_type: prod.temperature_type || 'both',
      hot_name: prod.hot_name || '',
      ice_name: prod.ice_name || '',
      is_available: prod.is_available,
      is_best_seller: Boolean(prod.is_best_seller),
      is_chef_pick: Boolean(prod.is_chef_pick)
    });
    setEditImageFile(null);
    setEditImagePreview(prod.image || null);
    setEditHotImageFile(null);
    setEditHotImagePreview(prod.hot_image || null);
    setEditIceImageFile(null);
    setEditIceImagePreview(prod.ice_image || null);
    setActiveImageTarget('main');
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
      payload.append('temperature_type', editFormData.temperature_type || 'both');
      payload.append('hot_name', editFormData.hot_name || '');
      payload.append('ice_name', editFormData.ice_name || '');
      payload.append('is_available', editFormData.is_available ? 1 : 0);
      payload.append('is_best_seller', editFormData.is_best_seller ? 1 : 0);
      payload.append('is_chef_pick', editFormData.is_chef_pick ? 1 : 0);
      if (editImageFile) payload.append('image', editImageFile);
      if (editHotImageFile) payload.append('hot_image', editHotImageFile);
      if (editIceImageFile) payload.append('ice_image', editIceImageFile);

      await productService.update(editingProduct.id, payload);
      setEditingProduct(null);
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
        <button onClick={handleOpenAddModal} className="btn-action-primary">
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
                <label>Pilihan Varian Suhu (Panas / Dingin)</label>
                <select name="temperature_type" value={formData.temperature_type} onChange={handleChange} className="input-wrapper">
                  <option value="both">Panas & Dingin (Customer Bisa Pilih)</option>
                  <option value="hot_only">Hanya Panas (Hot Only)</option>
                  <option value="ice_only">Hanya Dingin / Es (Ice Only)</option>
                  <option value="none">Tidak Ada Varian (Makanan / Snack / General)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Harga (Rp)</label>
                <input type="number" name="price" placeholder="15000" value={formData.price} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Highlight Status Menu</label>
                <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', color: '#2D1A10' }}>
                    <input type="checkbox" name="is_best_seller" checked={formData.is_best_seller} onChange={handleChange} />
                    <Flame size={14} className="text-red-500" /> Tampilkan di Best Seller
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', color: '#2D1A10' }}>
                    <input type="checkbox" name="is_chef_pick" checked={formData.is_chef_pick} onChange={handleChange} />
                    <ChefHat size={14} className="text-amber-700" /> Rekomendasi Chef/Barista
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Foto Utama Produk (Bisa Upload atau Paste / Ctrl+V Gambar)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} onClick={() => setActiveImageTarget('main')}>
                  <label htmlFor="upload-add-image" style={{ background: activeImageTarget === 'main' ? '#FEE2E2' : '#F4ECE1', border: activeImageTarget === 'main' ? '2px solid #DC2626' : '1px dashed #D97706', padding: '10px 16px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: '#7C4012' }}>
                    <Upload size={16} /> Pilih File / Paste Utama {activeImageTarget === 'main' && <Target size={14} className="text-red-600 ml-1 inline" />}
                  </label>
                  <input id="upload-add-image" type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'main')} style={{ display: 'none' }} />
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview Utama" style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover', border: '2px solid #D97706' }} />
                  )}
                </div>
              </div>

              {formData.temperature_type === 'both' && (
                <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#92400E', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Coffee size={14} /> / <Snowflake size={14} /> Varian Khusus Panas & Dingin (Gambar & Nama Berbeda)
                  </h4>

                  <div className="form-group mb-3">
                    <label style={{ fontSize: '12px', color: '#9A3412', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Coffee size={14} /> Nama & Gambar Varian Panas (Hot)
                    </label>
                    <input
                      type="text"
                      name="hot_name"
                      placeholder="Contoh: Espresso Hot / Single Panas"
                      value={formData.hot_name}
                      onChange={handleChange}
                      style={{ marginBottom: '8px' }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} onClick={() => setActiveImageTarget('hot')}>
                      <label htmlFor="upload-add-hot-image" style={{ background: activeImageTarget === 'hot' ? '#FED7AA' : '#FFFFFF', border: activeImageTarget === 'hot' ? '2px solid #C2410C' : '1px dashed #F97316', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#9A3412' }}>
                        <Upload size={14} /> Upload / Paste Foto Panas {activeImageTarget === 'hot' && <Target size={14} className="text-orange-600 ml-1 inline" />}
                      </label>
                      <input id="upload-add-hot-image" type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'hot')} style={{ display: 'none' }} />
                      {hotImagePreview && (
                        <img src={hotImagePreview} alt="Preview Hot" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', border: '2px solid #EA580C' }} />
                      )}
                    </div>
                  </div>

                  <div className="form-group mb-0">
                    <label style={{ fontSize: '12px', color: '#0369A1', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Snowflake size={14} /> Nama & Gambar Varian Dingin (Ice)
                    </label>
                    <input
                      type="text"
                      name="ice_name"
                      placeholder="Contoh: Espresso Ice Blend"
                      value={formData.ice_name}
                      onChange={handleChange}
                      style={{ marginBottom: '8px' }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} onClick={() => setActiveImageTarget('ice')}>
                      <label htmlFor="upload-add-ice-image" style={{ background: activeImageTarget === 'ice' ? '#BAE6FD' : '#FFFFFF', border: activeImageTarget === 'ice' ? '2px solid #0284C7' : '1px dashed #0EA5E9', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#0369A1' }}>
                        <Upload size={14} /> Upload / Paste Foto Dingin {activeImageTarget === 'ice' && <Target size={14} className="text-sky-600 ml-1 inline" />}
                      </label>
                      <input id="upload-add-ice-image" type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'ice')} style={{ display: 'none' }} />
                      {iceImagePreview && (
                        <img src={iceImagePreview} alt="Preview Ice" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', border: '2px solid #0284C7' }} />
                      )}
                    </div>
                  </div>
                </div>
              )}

              <span style={{ fontSize: '11px', color: '#7A695C', marginTop: '-6px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Info size={12} /> Tips: Klik area file target (Utama / Hot / Ice) lalu tekan <strong>Ctrl + V (Paste)</strong> untuk memasukkan gambar Clipboard langsung.
              </span>

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
                <label>Pilihan Varian Suhu (Panas / Dingin)</label>
                <select name="temperature_type" value={editFormData.temperature_type} onChange={handleEditChange} className="input-wrapper">
                  <option value="both">Panas & Dingin (Customer Bisa Pilih)</option>
                  <option value="hot_only">Hanya Panas (Hot Only)</option>
                  <option value="ice_only">Hanya Dingin / Es (Ice Only)</option>
                  <option value="none">Tidak Ada Varian (Makanan / Snack / General)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Harga (Rp)</label>
                <input type="number" name="price" value={editFormData.price} onChange={handleEditChange} required />
              </div>

              <div className="form-group">
                <label>Highlight Status Menu</label>
                <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', color: '#2D1A10' }}>
                    <input type="checkbox" name="is_best_seller" checked={editFormData.is_best_seller} onChange={handleEditChange} />
                    <Flame size={14} className="text-red-500" /> Tampilkan di Best Seller
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', color: '#2D1A10' }}>
                    <input type="checkbox" name="is_chef_pick" checked={editFormData.is_chef_pick} onChange={handleEditChange} />
                    <ChefHat size={14} className="text-amber-700" /> Rekomendasi Chef/Barista
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Foto Produk Utama (Bisa Upload atau Paste / Ctrl+V Gambar)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} onClick={() => setActiveImageTarget('main')}>
                  <label htmlFor="upload-edit-image" style={{ background: activeImageTarget === 'main' ? '#FEE2E2' : '#F4ECE1', border: activeImageTarget === 'main' ? '2px solid #DC2626' : '1px dashed #D97706', padding: '10px 16px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: '#7C4012' }}>
                    <Upload size={16} /> Ganti File / Paste Utama {activeImageTarget === 'main' && <Target size={14} className="text-red-600 ml-1 inline" />}
                  </label>
                  <input id="upload-edit-image" type="file" accept="image/*" onChange={(e) => handleEditFileChange(e, 'main')} style={{ display: 'none' }} />
                  {editImagePreview && (
                    <img src={editImagePreview} alt="Preview Edit Utama" style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover', border: '2px solid #D97706' }} />
                  )}
                </div>
              </div>

              {editFormData.temperature_type === 'both' && (
                <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#92400E', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Coffee size={14} /> / <Snowflake size={14} /> Varian Khusus Panas & Dingin (Gambar & Nama Berbeda)
                  </h4>

                  <div className="form-group mb-3">
                    <label style={{ fontSize: '12px', color: '#9A3412', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Coffee size={14} /> Nama & Gambar Varian Panas (Hot)
                    </label>
                    <input
                      type="text"
                      name="hot_name"
                      placeholder="Contoh: Espresso Hot / Single Panas"
                      value={editFormData.hot_name}
                      onChange={handleEditChange}
                      style={{ marginBottom: '8px' }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} onClick={() => setActiveImageTarget('hot')}>
                      <label htmlFor="upload-edit-hot-image" style={{ background: activeImageTarget === 'hot' ? '#FED7AA' : '#FFFFFF', border: activeImageTarget === 'hot' ? '2px solid #C2410C' : '1px dashed #F97316', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#9A3412' }}>
                        <Upload size={14} /> Upload / Paste Foto Panas {activeImageTarget === 'hot' && <Target size={14} className="text-orange-600 ml-1 inline" />}
                      </label>
                      <input id="upload-edit-hot-image" type="file" accept="image/*" onChange={(e) => handleEditFileChange(e, 'hot')} style={{ display: 'none' }} />
                      {editHotImagePreview && (
                        <img src={editHotImagePreview} alt="Preview Edit Hot" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', border: '2px solid #EA580C' }} />
                      )}
                    </div>
                  </div>

                  <div className="form-group mb-0">
                    <label style={{ fontSize: '12px', color: '#0369A1', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Snowflake size={14} /> Nama & Gambar Varian Dingin (Ice)
                    </label>
                    <input
                      type="text"
                      name="ice_name"
                      placeholder="Contoh: Espresso Ice Blend"
                      value={editFormData.ice_name}
                      onChange={handleEditChange}
                      style={{ marginBottom: '8px' }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} onClick={() => setActiveImageTarget('ice')}>
                      <label htmlFor="upload-edit-ice-image" style={{ background: activeImageTarget === 'ice' ? '#BAE6FD' : '#FFFFFF', border: activeImageTarget === 'ice' ? '2px solid #0284C7' : '1px dashed #0EA5E9', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#0369A1' }}>
                        <Upload size={14} /> Upload / Paste Foto Dingin {activeImageTarget === 'ice' && <Target size={14} className="text-sky-600 ml-1 inline" />}
                      </label>
                      <input id="upload-edit-ice-image" type="file" accept="image/*" onChange={(e) => handleEditFileChange(e, 'ice')} style={{ display: 'none' }} />
                      {editIceImagePreview && (
                        <img src={editIceImagePreview} alt="Preview Edit Ice" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', border: '2px solid #0284C7' }} />
                      )}
                    </div>
                  </div>
                </div>
              )}

              <span style={{ fontSize: '11px', color: '#7A695C', marginTop: '-6px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Info size={12} /> Tips: Klik area file target (Utama / Hot / Ice) lalu tekan <strong>Ctrl + V (Paste)</strong> untuk memasukkan gambar Clipboard langsung.
              </span>

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
              <th>Suhu / Varian</th>
              <th>Highlight Menu</th>
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
                  <td>
                    <span className="table-tag">
                      {prod.temperature_type === 'both' && <><Coffee size={12} className="inline mr-1" /> Panas / <Snowflake size={12} className="inline mr-1" /> Dingin</>}
                      {prod.temperature_type === 'hot_only' && <><Coffee size={12} className="inline mr-1" /> Hanya Panas</>}
                      {prod.temperature_type === 'ice_only' && <><Snowflake size={12} className="inline mr-1" /> Hanya Dingin</>}
                      {(!prod.temperature_type || prod.temperature_type === 'none') && 'Makanan / General'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {prod.is_best_seller && <span className="table-tag" style={{ background: '#FEF2F2', color: '#DC2626' }}><Flame size={12} className="inline mr-1" /> Best Seller</span>}
                      {prod.is_chef_pick && <span className="table-tag" style={{ background: '#FEF3C7', color: '#92400E' }}><ChefHat size={12} className="inline mr-1" /> Rekomendasi</span>}
                      {!prod.is_best_seller && !prod.is_chef_pick && <span className="text-xs text-slate-400">-</span>}
                    </div>
                  </td>
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
                <td colSpan="6" className="text-center py-6 text-muted">
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
