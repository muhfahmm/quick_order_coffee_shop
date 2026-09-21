import React, { useState, useEffect } from 'react';
import { Coffee, ShoppingBag, Plus, Check, Send, MapPin, X, Snowflake, AlertTriangle, Search } from 'lucide-react';
import { productService, categoryService, orderService, tableService } from '../../services/api';

export default function QuickOrderPage() {
  const [categories, setCategories] = useState(() => {
    try {
      const cached = localStorage.getItem('cached_categories');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [products, setProducts] = useState(() => {
    try {
      const cached = localStorage.getItem('cached_products');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [tables, setTables] = useState(() => {
    try {
      const cached = localStorage.getItem('cached_tables');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [variantProduct, setVariantProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tbl = params.get('table_number') || params.get('table');
    if (tbl) {
      setTableNumber(tbl);
    }
  }, []);

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const [resProd, resCat, resTbl] = await Promise.all([
          productService.getAll(),
          categoryService.getAll(),
          tableService.getAll()
        ]);
        const prodData = resProd.data.data || [];
        const catData = resCat.data.data || [];
        const tblData = resTbl.data.data || [];

        setProducts(prodData);
        setCategories(catData);
        setTables(tblData);

        localStorage.setItem('cached_products', JSON.stringify(prodData));
        localStorage.setItem('cached_categories', JSON.stringify(catData));
        localStorage.setItem('cached_tables', JSON.stringify(tblData));
      } catch (err) {
        console.error('Gagal memuat menu quick order:', err);
      }
    };

    fetchMenuData();
  }, []);

  const handleProductClick = (product) => {
    if (!product.is_available) return;

    const tempType = product.temperature_type || 'both';

    if (tempType === 'both') {
      setVariantProduct(product);
    } else if (tempType === 'hot_only') {
      addToCartWithVariant(product, 'Panas', product.hot_name || null);
    } else if (tempType === 'ice_only') {
      addToCartWithVariant(product, 'Dingin', product.ice_name || null);
    } else {
      addToCartWithVariant(product, null, null);
    }
  };

  const addToCartWithVariant = (product, variantType, customVariantName = null) => {
    const finalName = customVariantName || product.name;
    setCart((prevCart) => {
      const existing = prevCart.find(
        (item) => item.product_id === product.id && item.variant_type === variantType
      );

      if (existing) {
        return prevCart.map((item) =>
          item.product_id === product.id && item.variant_type === variantType
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...prevCart,
        {
          product_id: product.id,
          name: finalName,
          variant_type: variantType,
          price: Number(product.price),
          quantity: 1
        }
      ];
    });
  };

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCreateOrder = async (e) => {
    e.preventDefault();

    if (!tableNumber) {
      setIsTableModalOpen(true);
      return;
    }

    if (!customerName || cart.length === 0) return;

    setIsSubmitting(true);

    try {
      const res = await orderService.create({
        customer_name: customerName,
        table_number: tableNumber,
        items: cart.map((it) => ({
          product_id: it.product_id,
          variant_type: it.variant_type || null,
          quantity: it.quantity
        }))
      });

      setOrderSuccess(res.data.data);
      setCart([]);
      setCustomerName('');
    } catch (err) {
      console.error('Gagal mengirim pesanan:', err);
      alert(err.response?.data?.message || 'Gagal membuat pesanan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products
    .filter((p) => selectedCategory === 'all' || String(p.category_id) === String(selectedCategory))
    .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div style={{ background: '#FAF6F0', minHeight: '100vh', paddingBottom: '120px' }}>
      {/* Header Quick Order */}
      <header
        style={{
          background: '#FFFFFF',
          borderBottom: '1px solid #E8DFD5',
          padding: '14px 20px',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}
      >
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg, #7C4012, #D97706)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Coffee size={20} />
            </div>
            <div>
              <h1 style={{ fontSize: '16px', fontWeight: 800, color: '#2D1A10', margin: 0 }}>
                Quick Order Meja
              </h1>
              <span style={{ fontSize: '11px', color: '#7A695C', fontWeight: 600 }}>
                Pesan Cepat Resto & Coffee
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsTableModalOpen(true)}
            style={{
              background: tableNumber ? '#F4ECE1' : 'linear-gradient(135deg, #7C4012, #D97706)',
              color: tableNumber ? '#7C4012' : '#FFFFFF',
              padding: '7px 14px',
              borderRadius: '20px',
              border: tableNumber ? '1px solid #E8DFD5' : 'none',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <MapPin size={14} />
            {tableNumber ? tableNumber : 'Pilih Meja'}
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '16px' }}>
        {/* Search & Filter Categories */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: '#FFFFFF', border: '1px solid #E8DFD5', borderRadius: '12px', padding: '8px 12px', marginBottom: '12px' }}>
            <Search size={16} style={{ color: '#7A695C', marginRight: '8px' }} />
            <input
              type="text"
              placeholder="Cari menu kopi atau makanan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '13px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            <button
              onClick={() => setSelectedCategory('all')}
              style={{
                padding: '8px 14px',
                borderRadius: '16px',
                border: selectedCategory === 'all' ? 'none' : '1px solid #E8DFD5',
                background: selectedCategory === 'all' ? '#7C4012' : '#FFFFFF',
                color: selectedCategory === 'all' ? '#FFFFFF' : '#5C4333',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Semua ({products.length})
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '16px',
                  border: selectedCategory === cat.id ? 'none' : '1px solid #E8DFD5',
                  background: selectedCategory === cat.id ? '#7C4012' : '#FFFFFF',
                  color: selectedCategory === cat.id ? '#FFFFFF' : '#5C4333',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {orderSuccess && (
          <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '14px', borderRadius: '14px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Check size={20} style={{ color: '#059669' }} />
              <div>
                <strong style={{ color: '#065F46', display: 'block', fontSize: '14px' }}>Pesanan Terkirim!</strong>
                <span style={{ fontSize: '12px', color: '#047857' }}>Kode: <strong>{orderSuccess.order_code}</strong></span>
              </div>
            </div>
            <button onClick={() => setOrderSuccess(null)} style={{ background: 'transparent', border: 'none', color: '#047857', fontWeight: 700, cursor: 'pointer' }}>Tutup</button>
          </div>
        )}

        {/* Product Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              onClick={() => handleProductClick(prod)}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E8DFD5',
                borderRadius: '14px',
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                cursor: prod.is_available ? 'pointer' : 'not-allowed',
                opacity: prod.is_available ? 1 : 0.6
              }}
            >
              {prod.image ? (
                <img src={prod.image} alt={prod.name} style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '10px', marginBottom: '8px' }} />
              ) : (
                <div style={{ width: '100%', height: '110px', background: '#F4ECE1', borderRadius: '10px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C4012' }}>
                  <Coffee size={28} />
                </div>
              )}

              <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#2D1A10', margin: '0 0 2px 0' }}>
                {prod.name}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#7C4012' }}>
                  Rp {Number(prod.price).toLocaleString('id-ID')}
                </span>
                <button type="button" style={{ background: '#7C4012', color: '#FFF', border: 'none', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Plus size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Floating Cart Bar */}
      {cart.length > 0 && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#FFFFFF', borderTop: '1.5px solid #E8DFD5', padding: '14px 20px', boxShadow: '0 -8px 24px rgba(0,0,0,0.1)', zIndex: 100 }}>
          <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div>
              <strong style={{ fontSize: '14px', color: '#2D1A10', display: 'block' }}>
                {cart.reduce((a, b) => a + b.quantity, 0)} Item Keranjang
              </strong>
              <span style={{ fontSize: '13px', color: '#7C4012', fontWeight: 800 }}>
                Rp {totalAmount.toLocaleString('id-ID')}
              </span>
            </div>

            <form onSubmit={handleCreateOrder} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="text"
                placeholder="Nama Pemesan"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #E8DFD5', outline: 'none', fontSize: '12px', width: '130px' }}
              />

              <button
                type="submit"
                disabled={isSubmitting}
                style={{ background: 'linear-gradient(135deg, #7C4012, #D97706)', color: '#FFFFFF', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Send size={12} /> {isSubmitting ? '...' : 'Kirim'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Variant Selection Modal */}
      {variantProduct && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(45, 26, 16, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', backdropFilter: 'blur(3px)' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '20px', maxWidth: '360px', width: '100%', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#2D1A10', margin: 0 }}>Pilih Varian Suhu</h3>
              <button onClick={() => setVariantProduct(null)} style={{ background: '#F4ECE1', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', color: '#7C4012', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
            </div>

            <p style={{ fontSize: '13px', fontWeight: 700, color: '#7C4012', marginBottom: '16px' }}>{variantProduct.name}</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => { addToCartWithVariant(variantProduct, 'Panas', variantProduct.hot_name || null); setVariantProduct(null); }}
                style={{ padding: '12px 8px', borderRadius: '14px', border: '1.5px solid #FED7AA', background: '#FFF8F0', color: '#9A3412', fontWeight: 800, fontSize: '12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}
              >
                {variantProduct.hot_image ? <img src={variantProduct.hot_image} alt="Hot" style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover' }} /> : <Coffee size={24} style={{ color: '#EA580C' }} />}
                <span>{variantProduct.hot_name || 'Panas (Hot)'}</span>
              </button>

              <button
                type="button"
                onClick={() => { addToCartWithVariant(variantProduct, 'Dingin', variantProduct.ice_name || null); setVariantProduct(null); }}
                style={{ padding: '12px 8px', borderRadius: '14px', border: '1.5px solid #BAE6FD', background: '#F0F9FF', color: '#0369A1', fontWeight: 800, fontSize: '12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}
              >
                {variantProduct.ice_image ? <img src={variantProduct.ice_image} alt="Ice" style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover' }} /> : <Snowflake size={24} style={{ color: '#0284C7' }} />}
                <span>{variantProduct.ice_name || 'Dingin (Ice)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table Selector Modal */}
      {isTableModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(45, 26, 16, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', backdropFilter: 'blur(3px)' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '20px', maxWidth: '400px', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={18} style={{ color: '#7C4012' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#2D1A10', margin: 0 }}>Pilih Nomor Meja</h3>
              </div>
              <button onClick={() => setIsTableModalOpen(false)} style={{ background: '#F4ECE1', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', color: '#7C4012', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
            </div>

            {!tableNumber && (
              <div style={{ background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: '10px', padding: '8px 12px', marginBottom: '14px', fontSize: '12px', color: '#92400E', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={16} />
                <span>Pilih nomor meja Anda sebelum mengirim pesanan.</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
              {tables.map((t) => {
                const isSelected = tableNumber === t.table_number;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => { setTableNumber(t.table_number); setIsTableModalOpen(false); }}
                    style={{ padding: '10px 6px', borderRadius: '10px', border: isSelected ? '2px solid #7C4012' : '1px solid #E8DFD5', background: isSelected ? '#7C4012' : '#FAF6F0', color: isSelected ? '#FFFFFF' : '#2D1A10', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                  >
                    {t.table_number}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
