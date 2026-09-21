import React, { useState, useEffect } from 'react';
import { Search, Flame, ChefHat, Coffee, Check, X, Inbox, Sparkles } from 'lucide-react';
import { productService } from '../../services/api';

export default function HighlightsPage() {
  const [products, setProducts] = useState(() => {
    try {
      const cached = localStorage.getItem('cached_products');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await productService.getAll();
      const prodData = res.data.data || [];
      setProducts(prodData);
      localStorage.setItem('cached_products', JSON.stringify(prodData));
    } catch (error) {
      console.error('Gagal mengambil data produk:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const toggleBestSeller = async (product) => {
    try {
      const updatedValue = !product.is_best_seller;
      await productService.update(product.id, { is_best_seller: updatedValue });
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, is_best_seller: updatedValue } : p))
      );
    } catch (error) {
      alert('Gagal memperbarui status Best Seller');
    }
  };

  const toggleChefPick = async (product) => {
    try {
      const updatedValue = !product.is_chef_pick;
      await productService.update(product.id, { is_chef_pick: updatedValue });
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, is_chef_pick: updatedValue } : p))
      );
    } catch (error) {
      alert('Gagal memperbarui status Rekomendasi Chef/Barista');
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalBestSellers = products.filter((p) => p.is_best_seller).length;
  const totalChefPicks = products.filter((p) => p.is_chef_pick).length;

  return (
    <div className="highlights-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Kelola Highlight Status Menu</h1>
          <p className="page-subtitle">Atur produk yang akan ditampilkan di seksi 🔥 Best Seller dan 👨‍🍳 Rekomendasi Barista/Chef</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#FFF5F5', border: '1px solid #FECDD3', borderRadius: '16px', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '13px', color: '#9F1239', fontWeight: 700, textTransform: 'uppercase' }}>Total Best Seller</span>
            <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#881337', margin: '4px 0 0 0' }}>{totalBestSellers} Menu</h2>
          </div>
          <div style={{ width: '48px', height: '48px', background: '#FFE4E6', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E11D48' }}>
            <Flame size={24} />
          </div>
        </div>

        <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '16px', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '13px', color: '#92400E', fontWeight: 700, textTransform: 'uppercase' }}>Total Rekomendasi Chef</span>
            <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#78350F', margin: '4px 0 0 0' }}>{totalChefPicks} Menu</h2>
          </div>
          <div style={{ width: '48px', height: '48px', background: '#FEF3C7', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
            <ChefHat size={24} />
          </div>
        </div>
      </div>

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
              <th style={{ textAlign: 'center' }}>🔥 Status Best Seller</th>
              <th style={{ textAlign: 'center' }}>👨‍🍳 Status Rekomendasi Chef</th>
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
                  <td style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => toggleBestSeller(prod)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '20px',
                        border: 'none',
                        background: prod.is_best_seller ? 'linear-gradient(135deg, #DC2626, #EF4444)' : '#F3F4F6',
                        color: prod.is_best_seller ? '#FFFFFF' : '#6B7280',
                        fontWeight: 700,
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: prod.is_best_seller ? '0 4px 12px rgba(220, 38, 38, 0.25)' : 'none',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Flame size={14} />
                      <span>{prod.is_best_seller ? '🔥 Best Seller Active' : 'Off'}</span>
                    </button>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => toggleChefPick(prod)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '20px',
                        border: 'none',
                        background: prod.is_chef_pick ? 'linear-gradient(135deg, #D97706, #F59E0B)' : '#F3F4F6',
                        color: prod.is_chef_pick ? '#FFFFFF' : '#6B7280',
                        fontWeight: 700,
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: prod.is_chef_pick ? '0 4px 12px rgba(217, 119, 6, 0.25)' : 'none',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <ChefHat size={14} />
                      <span>{prod.is_chef_pick ? '👨‍🍳 Rekomendasi Active' : 'Off'}</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-6 text-muted">
                  <div className="empty-state">
                    <Inbox size={32} />
                    <p>Tidak ada data produk ditemukan.</p>
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
