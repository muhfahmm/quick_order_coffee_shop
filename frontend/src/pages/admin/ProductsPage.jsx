import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit3, Coffee, Check, X, Inbox, Upload, Image as ImageIcon, Flame, ChefHat, Snowflake, Target, Sparkles, Info } from 'lucide-react';
import { productService, categoryService } from '../../services/api';
import FastImage from '../../components/common/FastImage';
import { preloadProductImages, preloadImage } from '../../utils/imagePreloader';

function ImagePreviewThumbnail({ src, onRemove, onPreview, label = 'Preview', borderColor = '#D97706' }) {
  const [hovered, setHovered] = useState(false);

  if (!src) return null;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        onPreview(src);
      }}
      style={{
        position: 'relative',
        display: 'inline-block',
        cursor: 'pointer',
        flexShrink: 0
      }}
      title="Klik untuk memperbesar gambar"
    >
      <FastImage
        src={src}
        alt={label}
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '10px',
          objectFit: 'cover',
          border: `2px solid ${borderColor}`,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          transition: 'transform 0.15s ease'
        }}
      />
      {hovered && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          title="Hapus Foto Ini"
          style={{
            position: 'absolute',
            top: '-6px',
            right: '-6px',
            background: '#EF4444',
            color: '#FFFFFF',
            borderRadius: '50%',
            width: '22px',
            height: '22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #FFFFFF',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            zIndex: 20
          }}
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}

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
    hot_price: '',
    ice_name: '',
    ice_price: '',
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
    hot_price: '',
    ice_name: '',
    ice_price: '',
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
  const [previewModalUrl, setPreviewModalUrl] = useState(null);

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
      preloadProductImages(prodData);
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
      hot_price: '',
      ice_name: '',
      ice_price: '',
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

      const isBoth = formData.temperature_type === 'both';
      const productName = formData.name || (isBoth ? (formData.hot_name || formData.ice_name || 'Produk') : '');
      const productPrice = formData.price || (isBoth ? (formData.hot_price || formData.ice_price || 0) : 0);

      const payload = new FormData();
      payload.append('category_id', selectedCatId);
      payload.append('name', productName);
      payload.append('price', productPrice);
      payload.append('description', formData.description || '');
      payload.append('temperature_type', formData.temperature_type || 'both');
      payload.append('hot_name', formData.hot_name || '');
      payload.append('hot_price', formData.hot_price || '');
      payload.append('ice_name', formData.ice_name || '');
      payload.append('ice_price', formData.ice_price || '');
      payload.append('is_available', formData.is_available ? 1 : 0);
      payload.append('is_best_seller', formData.is_best_seller ? 1 : 0);
      payload.append('is_chef_pick', formData.is_chef_pick ? 1 : 0);
      if (imageFile) {
        payload.append('image', imageFile);
      } else if (isBoth && hotImageFile) {
        payload.append('image', hotImageFile);
      } else if (isBoth && iceImageFile) {
        payload.append('image', iceImageFile);
      }
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
      hot_price: prod.hot_price || '',
      ice_name: prod.ice_name || '',
      ice_price: prod.ice_price || '',
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
      const isBoth = editFormData.temperature_type === 'both';
      const productName = editFormData.name || (isBoth ? (editFormData.hot_name || editFormData.ice_name || 'Produk') : '');
      const productPrice = editFormData.price || (isBoth ? (editFormData.hot_price || editFormData.ice_price || 0) : 0);

      const payload = new FormData();
      payload.append('category_id', editFormData.category_id);
      payload.append('name', productName);
      payload.append('price', productPrice);
      payload.append('description', editFormData.description || '');
      payload.append('temperature_type', editFormData.temperature_type || 'both');
      payload.append('hot_name', editFormData.hot_name || '');
      payload.append('hot_price', editFormData.hot_price || '');
      payload.append('ice_name', editFormData.ice_name || '');
      payload.append('ice_price', editFormData.ice_price || '');
      payload.append('is_available', editFormData.is_available ? 1 : 0);
      payload.append('is_best_seller', editFormData.is_best_seller ? 1 : 0);
      payload.append('is_chef_pick', editFormData.is_chef_pick ? 1 : 0);
      if (editImageFile) {
        payload.append('image', editImageFile);
      } else if (isBoth && editHotImageFile) {
        payload.append('image', editHotImageFile);
      } else if (isBoth && editIceImageFile) {
        payload.append('image', editIceImageFile);
      }
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

  const toggleVariantAvailability = async (prod, variant) => {
    try {
      const field = variant === 'hot' ? 'hot_available' : 'ice_available';
      const currentVal = prod[field] !== false;
      await productService.update(prod.id, { [field]: !currentVal });
      fetchProductsAndCategories();
    } catch (error) {
      alert('Gagal memperbarui status ketersediaan varian');
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
              <div style={{ display: 'grid', gridTemplateColumns: formData.temperature_type === 'both' ? '1fr 1fr' : '1fr', gap: '20px' }}>
                {/* Column 1: Info Produk */}
                <div>
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
                    <input type="text" name="name" placeholder="Contoh: Espresso Single / Kopi Susu" value={formData.name} onChange={handleChange} required />
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

                  {formData.temperature_type !== 'both' && (
                    <>
                      <div className="form-group">
                        <label>Harga (Rp)</label>
                        <input type="number" name="price" placeholder="15000" value={formData.price} onChange={handleChange} required />
                      </div>

                      <div className="form-group">
                        <label>Foto Produk (Upload / Paste)</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} onClick={() => setActiveImageTarget('main')}>
                          <label htmlFor="upload-add-image" style={{ background: activeImageTarget === 'main' ? '#FEE2E2' : '#F4ECE1', border: activeImageTarget === 'main' ? '2px solid #DC2626' : '1px dashed #D97706', padding: '10px 14px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700, color: '#7C4012' }}>
                            <Upload size={14} /> Upload / Paste Foto {activeImageTarget === 'main' && <Target size={14} className="text-red-600 ml-1 inline" />}
                          </label>
                          <input id="upload-add-image" type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'main')} style={{ display: 'none' }} />
                          <ImagePreviewThumbnail
                            src={imagePreview}
                            onRemove={() => { setImageFile(null); setImagePreview(null); }}
                            onPreview={(url) => setPreviewModalUrl(url)}
                            label="Preview Utama"
                            borderColor="#D97706"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="form-group mb-0">
                    <label>Deskripsi</label>
                    <textarea name="description" placeholder="Penjelasan singkat menu..." value={formData.description} onChange={handleChange} style={{ height: '85px' }} />
                  </div>
                </div>

                {/* Column 2: Varian Gambar (Hanya muncul jika temperature_type === 'both') */}
                {formData.temperature_type === 'both' && (
                  <div>
                    <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '14px', padding: '14px' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#92400E', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Coffee size={14} /> / <Snowflake size={14} /> Foto & Nama Varian Produk (Hot / Ice)
                      </h4>

                      {/* Varian Panas Box */}
                      <div
                        onClick={() => setActiveImageTarget('hot')}
                        style={{
                          background: activeImageTarget === 'hot' ? '#FFF3E0' : '#FFFFFF',
                          border: activeImageTarget === 'hot' ? '2px solid #EA580C' : '1px solid #FED7AA',
                          borderRadius: '12px',
                          padding: '12px',
                          marginBottom: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <label style={{ fontSize: '12px', color: '#9A3412', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                          <Coffee size={14} /> Nama & Gambar Varian Panas (Hot) {activeImageTarget === 'hot' && <Target size={14} className="text-orange-600 ml-auto" />}
                        </label>
                        <input
                          type="text"
                          name="hot_name"
                          placeholder="Contoh: Espresso Hot"
                          value={formData.hot_name}
                          onFocus={() => setActiveImageTarget('hot')}
                          onChange={handleChange}
                          style={{ marginBottom: '8px', fontSize: '12px', padding: '8px 10px' }}
                        />
                        <input
                          type="number"
                          name="hot_price"
                          placeholder="Harga Panas (Rp), contoh: 15000"
                          value={formData.hot_price}
                          onFocus={() => setActiveImageTarget('hot')}
                          onChange={handleChange}
                          style={{ marginBottom: '8px', fontSize: '12px', padding: '8px 10px' }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <label htmlFor="upload-add-hot-image" style={{ background: '#FED7AA', border: '1px solid #F97316', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 800, color: '#9A3412' }}>
                            <Upload size={12} /> Pilih / Paste Foto Panas
                          </label>
                          <input id="upload-add-hot-image" type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'hot')} style={{ display: 'none' }} />
                          <ImagePreviewThumbnail
                            src={hotImagePreview}
                            onRemove={() => { setHotImageFile(null); setHotImagePreview(null); }}
                            onPreview={(url) => setPreviewModalUrl(url)}
                            label="Preview Hot"
                            borderColor="#EA580C"
                          />
                        </div>
                      </div>

                      {/* Varian Dingin Box */}
                      <div
                        onClick={() => setActiveImageTarget('ice')}
                        style={{
                          background: activeImageTarget === 'ice' ? '#E0F2FE' : '#FFFFFF',
                          border: activeImageTarget === 'ice' ? '2px solid #0284C7' : '1px solid #BAE6FD',
                          borderRadius: '12px',
                          padding: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <label style={{ fontSize: '12px', color: '#0369A1', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                          <Snowflake size={14} /> Nama & Gambar Varian Dingin (Ice) {activeImageTarget === 'ice' && <Target size={14} className="text-sky-600 ml-auto" />}
                        </label>
                        <input
                          type="text"
                          name="ice_name"
                          placeholder="Contoh: Espresso Ice"
                          value={formData.ice_name}
                          onFocus={() => setActiveImageTarget('ice')}
                          onChange={handleChange}
                          style={{ marginBottom: '8px', fontSize: '12px', padding: '8px 10px' }}
                        />
                        <input
                          type="number"
                          name="ice_price"
                          placeholder="Harga Dingin (Rp), contoh: 18000"
                          value={formData.ice_price}
                          onFocus={() => setActiveImageTarget('ice')}
                          onChange={handleChange}
                          style={{ marginBottom: '8px', fontSize: '12px', padding: '8px 10px' }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <label htmlFor="upload-add-ice-image" style={{ background: '#BAE6FD', border: '1px solid #0EA5E9', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 800, color: '#0369A1' }}>
                            <Upload size={12} /> Pilih / Paste Foto Dingin
                          </label>
                          <input id="upload-add-ice-image" type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'ice')} style={{ display: 'none' }} />
                          <ImagePreviewThumbnail
                            src={iceImagePreview}
                            onRemove={() => { setIceImageFile(null); setIceImagePreview(null); }}
                            onPreview={(url) => setPreviewModalUrl(url)}
                            label="Preview Ice"
                            borderColor="#0284C7"
                          />
                        </div>
                      </div>
                    </div>

                    <span style={{ fontSize: '11px', color: '#7A695C', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '4px', lineHeight: 1.4 }}>
                      <Info size={12} className="shrink-0" /> Tips: Klik kotak varian (Hot/Ice) lalu tekan <strong>Ctrl + V (Paste)</strong> untuk memasukkan gambar langsung.
                    </span>
                  </div>
                )}
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
              <div style={{ display: 'grid', gridTemplateColumns: editFormData.temperature_type === 'both' ? '1fr 1fr' : '1fr', gap: '20px' }}>
                {/* Column 1: Info Produk */}
                <div>
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

                  {editFormData.temperature_type !== 'both' && (
                    <>
                      <div className="form-group">
                        <label>Harga (Rp)</label>
                        <input type="number" name="price" value={editFormData.price} onChange={handleEditChange} required />
                      </div>

                      <div className="form-group">
                        <label>Foto Produk (Upload / Paste)</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} onClick={() => setActiveImageTarget('main')}>
                          <label htmlFor="upload-edit-image" style={{ background: activeImageTarget === 'main' ? '#FEE2E2' : '#F4ECE1', border: activeImageTarget === 'main' ? '2px solid #DC2626' : '1px dashed #D97706', padding: '10px 14px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700, color: '#7C4012' }}>
                            <Upload size={14} /> Ganti Foto {activeImageTarget === 'main' && <Target size={14} className="text-red-600 ml-1 inline" />}
                          </label>
                          <input id="upload-edit-image" type="file" accept="image/*" onChange={(e) => handleEditFileChange(e, 'main')} style={{ display: 'none' }} />
                          <ImagePreviewThumbnail
                            src={editImagePreview}
                            onRemove={() => { setEditImageFile(null); setEditImagePreview(null); }}
                            onPreview={(url) => setPreviewModalUrl(url)}
                            label="Preview Edit Utama"
                            borderColor="#D97706"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="form-group mb-0">
                    <label>Deskripsi</label>
                    <textarea name="description" value={editFormData.description} onChange={handleEditChange} style={{ height: '85px' }} />
                  </div>
                </div>

                {/* Column 2: Varian Gambar (Hanya jika temperature_type === 'both') */}
                {editFormData.temperature_type === 'both' && (
                  <div>
                    <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '14px', padding: '14px' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#92400E', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Coffee size={14} /> / <Snowflake size={14} /> Foto & Nama Varian Produk (Hot / Ice)
                      </h4>

                      {/* Varian Panas Box */}
                      <div
                        onClick={() => setActiveImageTarget('hot')}
                        style={{
                          background: activeImageTarget === 'hot' ? '#FFF3E0' : '#FFFFFF',
                          border: activeImageTarget === 'hot' ? '2px solid #EA580C' : '1px solid #FED7AA',
                          borderRadius: '12px',
                          padding: '12px',
                          marginBottom: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <label style={{ fontSize: '12px', color: '#9A3412', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                          <Coffee size={14} /> Nama & Gambar Varian Panas (Hot) {activeImageTarget === 'hot' && <Target size={14} className="text-orange-600 ml-auto" />}
                        </label>
                        <input
                          type="text"
                          name="hot_name"
                          placeholder="Contoh: Espresso Hot"
                          value={editFormData.hot_name}
                          onFocus={() => setActiveImageTarget('hot')}
                          onChange={handleEditChange}
                          style={{ marginBottom: '8px', fontSize: '12px', padding: '8px 10px' }}
                        />
                        <input
                          type="number"
                          name="hot_price"
                          placeholder="Harga Panas (Rp)"
                          value={editFormData.hot_price}
                          onFocus={() => setActiveImageTarget('hot')}
                          onChange={handleEditChange}
                          style={{ marginBottom: '8px', fontSize: '12px', padding: '8px 10px' }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <label htmlFor="upload-edit-hot-image" style={{ background: '#FED7AA', border: '1px solid #F97316', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 800, color: '#9A3412' }}>
                            <Upload size={12} /> Ganti / Paste Foto Panas
                          </label>
                          <input id="upload-edit-hot-image" type="file" accept="image/*" onChange={(e) => handleEditFileChange(e, 'hot')} style={{ display: 'none' }} />
                          <ImagePreviewThumbnail
                            src={editHotImagePreview}
                            onRemove={() => { setEditHotImageFile(null); setEditHotImagePreview(null); }}
                            onPreview={(url) => setPreviewModalUrl(url)}
                            label="Preview Edit Hot"
                            borderColor="#EA580C"
                          />
                        </div>
                      </div>

                      {/* Varian Dingin Box */}
                      <div
                        onClick={() => setActiveImageTarget('ice')}
                        style={{
                          background: activeImageTarget === 'ice' ? '#E0F2FE' : '#FFFFFF',
                          border: activeImageTarget === 'ice' ? '2px solid #0284C7' : '1px solid #BAE6FD',
                          borderRadius: '12px',
                          padding: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <label style={{ fontSize: '12px', color: '#0369A1', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                          <Snowflake size={14} /> Nama & Gambar Varian Dingin (Ice) {activeImageTarget === 'ice' && <Target size={14} className="text-sky-600 ml-auto" />}
                        </label>
                        <input
                          type="text"
                          name="ice_name"
                          placeholder="Contoh: Espresso Ice"
                          value={editFormData.ice_name}
                          onFocus={() => setActiveImageTarget('ice')}
                          onChange={handleEditChange}
                          style={{ marginBottom: '8px', fontSize: '12px', padding: '8px 10px' }}
                        />
                        <input
                          type="number"
                          name="ice_price"
                          placeholder="Harga Dingin (Rp)"
                          value={editFormData.ice_price}
                          onFocus={() => setActiveImageTarget('ice')}
                          onChange={handleEditChange}
                          style={{ marginBottom: '8px', fontSize: '12px', padding: '8px 10px' }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <label htmlFor="upload-edit-ice-image" style={{ background: '#BAE6FD', border: '1px solid #0EA5E9', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 800, color: '#0369A1' }}>
                            <Upload size={12} /> Ganti / Paste Foto Dingin
                          </label>
                          <input id="upload-edit-ice-image" type="file" accept="image/*" onChange={(e) => handleEditFileChange(e, 'ice')} style={{ display: 'none' }} />
                          <ImagePreviewThumbnail
                            src={editIceImagePreview}
                            onRemove={() => { setEditIceImageFile(null); setEditIceImagePreview(null); }}
                            onPreview={(url) => setPreviewModalUrl(url)}
                            label="Preview Edit Ice"
                            borderColor="#0284C7"
                          />
                        </div>
                      </div>
                    </div>

                    <span style={{ fontSize: '11px', color: '#7A695C', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '4px', lineHeight: 1.4 }}>
                      <Info size={12} className="shrink-0" /> Tips: Klik kotak varian (Hot/Ice) lalu tekan <strong>Ctrl + V (Paste)</strong> untuk memasukkan gambar.
                    </span>
                  </div>
                )}
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
              <th>Kategori</th>
              <th>Foto & Nama Menu</th>
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
                  <td><span className="table-tag">{prod.category?.name || '-'}</span></td>
                  <td className="font-semibold">
                    {prod.temperature_type === 'both' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '4px 0' }}>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#2D1A10', borderBottom: '1px dashed #E8DFD5', paddingBottom: '4px' }}>
                          {prod.name}
                        </div>
                        {/* Hot Variant */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {prod.hot_image ? (
                            <FastImage
                              src={prod.hot_image}
                              alt={prod.hot_name || 'Hot'}
                              style={{ width: '38px', height: '38px', borderRadius: '10px', objectFit: 'cover', border: '1.5px solid #EA580C', flexShrink: 0 }}
                            />
                          ) : (
                            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#FFF3E0', border: '1px solid #FED7AA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Coffee size={16} style={{ color: '#EA580C' }} />
                            </div>
                          )}
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '12px', color: '#2D1A10', fontWeight: 700 }}>{prod.hot_name || 'Varian Panas'}</span>
                            <span style={{ fontSize: '10px', color: '#EA580C', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <Coffee size={10} /> Hot (Panas)
                            </span>
                          </div>
                        </div>

                        {/* Ice Variant */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {prod.ice_image ? (
                            <FastImage
                              src={prod.ice_image}
                              alt={prod.ice_name || 'Ice'}
                              style={{ width: '38px', height: '38px', borderRadius: '10px', objectFit: 'cover', border: '1.5px solid #0284C7', flexShrink: 0 }}
                            />
                          ) : (
                            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#E0F2FE', border: '1px solid #BAE6FD', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Snowflake size={16} style={{ color: '#0284C7' }} />
                            </div>
                          )}
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '12px', color: '#2D1A10', fontWeight: 700 }}>{prod.ice_name || 'Varian Dingin'}</span>
                            <span style={{ fontSize: '10px', color: '#0284C7', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <Snowflake size={10} /> Ice (Dingin)
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="product-title-cell">
                        {prod.image ? (
                          <FastImage
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
                    )}
                  </td>
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
                  <td className="font-semibold">
                    {prod.temperature_type === 'both' && (prod.hot_price || prod.ice_price) ? (
                      <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
                        {prod.hot_price ? <div style={{ color: '#C2410C' }}>Hot: Rp {Number(prod.hot_price).toLocaleString('id-ID')}</div> : null}
                        {prod.ice_price ? <div style={{ color: '#0369A1' }}>Ice: Rp {Number(prod.ice_price).toLocaleString('id-ID')}</div> : null}
                      </div>
                    ) : (
                      `Rp ${Number(prod.price).toLocaleString('id-ID')}`
                    )}
                  </td>
                  <td>
                    {prod.temperature_type === 'both' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <button
                          onClick={() => toggleVariantAvailability(prod, 'hot')}
                          className={`btn-toggle-stock ${prod.hot_available !== false ? 'available' : 'empty'}`}
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                          title="Klik untuk ubah stok varian Panas"
                        >
                          {prod.hot_available !== false ? <Check size={12} /> : <X size={12} />}
                          <span>Hot: {prod.hot_available !== false ? 'Tersedia' : 'Habis'}</span>
                        </button>
                        <button
                          onClick={() => toggleVariantAvailability(prod, 'ice')}
                          className={`btn-toggle-stock ${prod.ice_available !== false ? 'available' : 'empty'}`}
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                          title="Klik untuk ubah stok varian Dingin"
                        >
                          {prod.ice_available !== false ? <Check size={12} /> : <X size={12} />}
                          <span>Ice: {prod.ice_available !== false ? 'Tersedia' : 'Habis'}</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => toggleAvailability(prod)}
                        className={`btn-toggle-stock ${prod.is_available ? 'available' : 'empty'}`}
                      >
                        {prod.is_available ? <Check size={14} /> : <X size={14} />}
                        <span>{prod.is_available ? 'Tersedia' : 'Stok Habis'}</span>
                      </button>
                    )}
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

      {/* Full Size Image Preview Lightbox Modal */}
      {previewModalUrl && (
        <div
          className="modal-overlay"
          onClick={() => setPreviewModalUrl(null)}
          style={{ zIndex: 1200, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
        >
          <div
            style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh', background: '#18181B', borderRadius: '18px', padding: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewModalUrl(null)}
              style={{ position: 'absolute', top: '-12px', right: '-12px', background: '#EF4444', color: '#FFF', borderRadius: '50%', width: '32px', height: '32px', border: '2px solid #FFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', zIndex: 10 }}
              title="Tutup Preview"
            >
              <X size={18} />
            </button>
            <FastImage
              src={previewModalUrl}
              alt="Full Preview"
              style={{ maxWidth: '82vw', maxHeight: '82vh', borderRadius: '12px', objectFit: 'contain', display: 'block' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
