import React, { useState, useEffect } from 'react';
import { Coffee, ShoppingBag, Plus, Check, Sparkles, Send, MapPin, X, Flame, ChefHat, Tag, Gift, Bell, Search, Clock, Wifi, Utensils, Snowflake, Zap, AlertTriangle, BookOpen, Citrus, ShoppingCart, MousePointer } from 'lucide-react';
import { productService, categoryService, orderService, tableService } from '../../services/api';

export default function MenuPage() {
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
        console.error('Gagal memuat menu customer:', err);
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
      addToCartWithVariant(product, 'Panas');
    } else if (tempType === 'ice_only') {
      addToCartWithVariant(product, 'Dingin');
    } else {
      addToCartWithVariant(product, null);
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

  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter(
          (p) => String(p.category_id) === String(selectedCategory)
        );

  const flaggedBestSellers = products.filter(p => p.is_best_seller);
  const bestSellers = flaggedBestSellers.length > 0 ? flaggedBestSellers : products.slice(0, 6);

  const flaggedChefPicks = products.filter(p => p.is_chef_pick);
  const chefPicks = flaggedChefPicks.length > 0 ? flaggedChefPicks : products.slice(0, 3);
  const hour = new Date().getHours();
  const greeting =
    hour < 11 ? 'Selamat Pagi' :
    hour < 15 ? 'Selamat Siang' :
    hour < 18 ? 'Selamat Sore' : 'Selamat Malam';

  return (
    <div
      className="customer-menu-container"
      style={{
        background: '#FAF6F0',
        minHeight: '100vh',
        paddingBottom: '120px'
      }}
    >
      <header
        className="customer-header"
        style={{
          background: '#FFFFFF',
          borderBottom: '1px solid #E8DFD5',
          padding: '16px 24px',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}
      >
        <div
          style={{
            maxWidth: '1000px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                background: 'linear-gradient(135deg, #7C4012, #D97706)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}
            >
              <Coffee size={24} />
            </div>

            <div>
              <h1
                style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  color: '#2D1A10',
                  margin: 0
                }}
              >
                CoffeeShop Resto
              </h1>
              <span
                style={{
                  fontSize: '12px',
                  color: '#7A695C',
                  fontWeight: 600
                }}
              >
                Pemesanan Meja QR
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsTableModalOpen(true)}
            style={{
              background: tableNumber ? '#F4ECE1' : 'linear-gradient(135deg, #7C4012, #D97706)',
              color: tableNumber ? '#7C4012' : '#FFFFFF',
              padding: '8px 16px',
              borderRadius: '20px',
              border: tableNumber ? '1px solid #E8DFD5' : 'none',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: tableNumber ? 'none' : '0 4px 12px rgba(124, 64, 18, 0.2)',
              transition: 'all 0.2s ease'
            }}
          >
            <MapPin size={14} />
            {tableNumber ? tableNumber : 'Pilih Meja'}
          </button>
        </div>
      </header>

      <main
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
          padding: '0 16px'
        }}
      >
        {/* 1. HERO WELCOME */}
        <div
          style={{
            background: 'linear-gradient(135deg, #3C2415 0%, #7C4012 100%)',
            borderRadius: '0 0 24px 24px',
            padding: '24px 20px 32px 20px',
            color: '#FFFFFF',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(60, 36, 21, 0.15)',
            margin: '0 -16px 20px -16px'
          }}
        >
          <div style={{ position: 'relative', zIndex: 2 }}>
            <p style={{ fontSize: '13px', opacity: 0.9, margin: 0, fontWeight: 600 }}>
              {greeting}
            </p>
            <h2
              style={{
                fontSize: '22px',
                fontWeight: 800,
                color: '#FFFFFF',
                margin: '4px 0 8px 0',
                lineHeight: '1.2'
              }}
            >
              Selamat Datang di <span style={{ color: '#FDE68A' }}>CoffeeShop Resto</span>
            </h2>
            <p style={{ fontSize: '13px', opacity: 0.9, margin: 0 }}>
              {tableNumber ? (
                <>Anda di <strong>{tableNumber}</strong> · Pesan langsung tanpa antre</>
              ) : (
                <>Silakan pilih meja Anda untuk memulai pesanan</>
              )}
            </p>

            <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
              <span style={{ background: 'rgba(255,255,255,0.18)', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} /> Buka · 08:00 - 22:00
              </span>
              <span style={{ background: 'rgba(255,255,255,0.18)', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Zap size={12} /> Penyajian ~10 Menit
              </span>
            </div>
          </div>
        </div>

        {/* 2. QUICK ACTIONS */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '8px',
            marginTop: '-24px',
            position: 'relative',
            zIndex: 5,
            marginBottom: '24px'
          }}
        >
          {[
            { icon: <Search size={20} className="text-amber-800" />, label: 'Cari Menu', action: () => document.getElementById('menu-grid-section')?.scrollIntoView({ behavior: 'smooth' }) },
            { icon: <Flame size={20} className="text-orange-600" />, label: 'Best Seller', action: () => document.getElementById('bestseller-section')?.scrollIntoView({ behavior: 'smooth' }) },
            { icon: <Gift size={20} className="text-amber-700" />, label: 'Promo', action: () => document.getElementById('promo-section')?.scrollIntoView({ behavior: 'smooth' }) },
            { icon: <Bell size={20} className="text-amber-800" />, label: 'Panggil Waiter', action: () => alert('Pelayan telah dipanggil ke meja Anda! Silakan tunggu sejenak.') }
          ].map((act, i) => (
            <button
              key={i}
              onClick={act.action}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E8DFD5',
                borderRadius: '16px',
                padding: '12px 6px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(45, 26, 16, 0.05)',
                transition: 'transform 0.15s ease'
              }}
            >
              <div>{act.icon}</div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#2D1A10', textAlign: 'center' }}>
                {act.label}
              </span>
            </button>
          ))}
        </div>

        {/* 3. PROMO CAROUSEL */}
        <div id="promo-section" style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Tag size={18} style={{ color: '#D97706' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#2D1A10', margin: 0 }}>
              Penawaran Spesial Hari Ini
            </h3>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '12px',
              overflowX: 'auto',
              paddingBottom: '8px',
              scrollbarWidth: 'none'
            }}
          >
            {[
              { badge: 'HEMAT 20%', title: 'Paket Espresso + Croissant', desc: 'Hanya Rp 28.000', bg: 'linear-gradient(135deg, #7C4012, #D97706)', icon: <Coffee size={32} style={{ opacity: 0.9 }} /> },
              { badge: 'GRATIS ES TEH', title: 'Min. Belanja Rp 50.000', desc: 'Otomatis klaim saat order', bg: 'linear-gradient(135deg, #15803D, #059669)', icon: <Sparkles size={32} style={{ opacity: 0.9 }} /> },
              { badge: 'MENU BARU', title: 'Cold Brew Citrus Special', desc: 'Sensasi asam menyegarkan', bg: 'linear-gradient(135deg, #B45309, #F59E0B)', icon: <Citrus size={32} style={{ opacity: 0.9 }} /> }
            ].map((p, idx) => (
              <div
                key={idx}
                style={{
                  minWidth: '260px',
                  background: p.bg,
                  borderRadius: '18px',
                  padding: '16px',
                  color: '#FFFFFF',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
                }}
              >
                <div>
                  <span style={{ background: 'rgba(255,255,255,0.25)', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '10px' }}>
                    {p.badge}
                  </span>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, margin: '6px 0 2px 0', color: '#FFFFFF' }}>
                    {p.title}
                  </h4>
                  <p style={{ fontSize: '11px', opacity: 0.9, margin: 0 }}>{p.desc}</p>
                </div>
                {p.icon}
              </div>
            ))}
          </div>
        </div>

        {/* 4. KATEGORI MENU */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Utensils size={18} style={{ color: '#7C4012' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#2D1A10', margin: 0 }}>
              Kategori Menu
            </h3>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '10px',
              overflowX: 'auto',
              paddingBottom: '8px'
            }}
          >
            <button
              onClick={() => setSelectedCategory('all')}
              style={{
                padding: '10px 18px',
                borderRadius: '20px',
                border: selectedCategory === 'all' ? 'none' : '1px solid #E8DFD5',
                background: selectedCategory === 'all' ? '#7C4012' : '#FFFFFF',
                color: selectedCategory === 'all' ? '#FFFFFF' : '#5C4333',
                fontWeight: 800,
                fontSize: '13px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: selectedCategory === 'all' ? '0 4px 12px rgba(124, 64, 18, 0.25)' : 'none'
              }}
            >
              <Utensils size={14} /> Semua Menu ({products.length})
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '20px',
                  border: selectedCategory === cat.id ? 'none' : '1px solid #E8DFD5',
                  background: selectedCategory === cat.id ? '#7C4012' : '#FFFFFF',
                  color: selectedCategory === cat.id ? '#FFFFFF' : '#5C4333',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: selectedCategory === cat.id ? '0 4px 12px rgba(124, 64, 18, 0.25)' : 'none'
                }}
              >
                <Coffee size={14} /> {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* 5. MENU POPULER / BEST SELLER */}
        {bestSellers.length > 0 && selectedCategory === 'all' && (
          <div id="bestseller-section" style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Flame size={18} style={{ color: '#DC2626' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#2D1A10', margin: 0 }}>
                Paling Banyak Dipesan
              </h3>
              <span style={{ background: '#FEF2F2', color: '#DC2626', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '8px' }}>
                HARI INI
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '12px',
                overflowX: 'auto',
                paddingBottom: '8px'
              }}
            >
              {bestSellers.map((prod, i) => (
                <div
                  key={prod.id}
                  onClick={() => handleProductClick(prod)}
                  style={{
                    minWidth: '150px',
                    maxWidth: '150px',
                    background: '#FFFFFF',
                    border: '1px solid #E8DFD5',
                    borderRadius: '16px',
                    padding: '10px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  }}
                >
                  <div style={{ position: 'relative', marginBottom: '8px' }}>
                    {prod.image ? (
                      <img src={prod.image} alt={prod.name} style={{ width: '100%', height: '90px', objectFit: 'cover', borderRadius: '10px' }} />
                    ) : (
                      <div style={{ width: '100%', height: '90px', background: '#F4ECE1', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C4012' }}>
                        <Coffee size={24} />
                      </div>
                    )}
                    <span style={{ position: 'absolute', top: '4px', left: '4px', background: '#DC2626', color: '#FFF', fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '6px' }}>
                      #{i + 1} Terlaris
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', fontWeight: 800, color: '#2D1A10', margin: '0 0 2px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {prod.name}
                  </p>
                  <p style={{ fontSize: '12px', fontWeight: 800, color: '#7C4012', margin: 0 }}>
                    Rp {Number(prod.price).toLocaleString('id-ID')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. REKOMENDASI CHEF */}
        {chefPicks.length > 0 && selectedCategory === 'all' && (
          <div style={{ marginBottom: '28px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '20px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <ChefHat size={22} style={{ color: '#92400E' }} />
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#92400E', margin: 0 }}>
                  Rekomendasi Barista / Chef
                </h3>
                <p style={{ fontSize: '11px', color: '#B45309', margin: 0 }}>
                  Pilihan sajian istimewa khas kedai kami
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {chefPicks.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => handleProductClick(prod)}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #FCD34D',
                    borderRadius: '14px',
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer'
                  }}
                >
                  {prod.image ? (
                    <img src={prod.image} alt={prod.name} style={{ width: '50px', height: '50px', borderRadius: '10px', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '50px', height: '50px', background: '#F4ECE1', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Coffee size={20} style={{ color: '#7C4012' }} />
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#2D1A10', margin: '0 0 2px 0' }}>{prod.name}</h4>
                    <p style={{ fontSize: '12px', fontWeight: 800, color: '#7C4012', margin: 0 }}>Rp {Number(prod.price).toLocaleString('id-ID')}</p>
                  </div>
                  <button type="button" style={{ background: '#7C4012', color: '#FFF', border: 'none', width: '32px', height: '32px', borderRadius: '50%', fontWeight: 800, fontSize: '16px', cursor: 'pointer' }}>
                    +
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {orderSuccess && (
          <div
            style={{
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              padding: '16px 20px',
              borderRadius: '16px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
            >
              <Check size={24} style={{ color: '#059669' }} />
              <div>
                <strong style={{ color: '#065F46', display: 'block' }}>
                  Pesanan Berhasil Dikirim!
                </strong>
                <span style={{ fontSize: '13px', color: '#047857' }}>
                  Kode Order: <strong>{orderSuccess.order_code}</strong> (Status:
                  Pending Dapur)
                </span>
              </div>
            </div>

            <button
              onClick={() => setOrderSuccess(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#047857',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Tutup
            </button>
          </div>
        )}

        {/* DAFTAR MENU UTAMA */}
        <div id="menu-grid-section" style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <BookOpen size={18} style={{ color: '#7C4012' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#2D1A10', margin: 0 }}>
              {selectedCategory === 'all' ? 'Semua Menu Sajian' : 'Menu Pilihan'}
            </h3>
          </div>

          <div className="customer-products-grid">
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                className="customer-product-card"
                onClick={() => handleProductClick(prod)}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E8DFD5',
                  borderRadius: '16px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  cursor: prod.is_available ? 'pointer' : 'not-allowed',
                  boxShadow: '0 2px 8px rgba(45, 26, 16, 0.04)',
                  opacity: prod.is_available ? 1 : 0.6,
                  transition: 'transform 0.15s ease, boxShadow 0.15s ease'
                }}
              >
                {prod.image ? (
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="card-img"
                    style={{
                      width: '100%',
                      height: '110px',
                      objectFit: 'cover',
                      borderRadius: '12px',
                      marginBottom: '10px'
                    }}
                  />
                ) : (
                  <div
                    className="card-img"
                    style={{
                      width: '100%',
                      height: '110px',
                      background: '#F4ECE1',
                      borderRadius: '12px',
                      marginBottom: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#7C4012'
                    }}
                  >
                    <Coffee size={32} />
                  </div>
                )}

                <h3
                  className="card-title"
                  style={{
                    fontSize: '13px',
                    fontWeight: 800,
                    color: '#2D1A10',
                    margin: '0 0 4px 0',
                    lineHeight: '1.3'
                  }}
                >
                  {prod.name}
                </h3>

                <span
                  className="card-price"
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#7A695C'
                  }}
                >
                  Rp {Number(prod.price).toLocaleString('id-ID')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 7. CARA PESAN */}
        <div style={{ marginBottom: '32px', background: '#FFFFFF', border: '1px solid #E8DFD5', borderRadius: '20px', padding: '18px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#2D1A10', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={18} style={{ color: '#7C4012' }} /> Cara Pesan Mudah (3 Langkah)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center' }}>
            {[
              { icon: <MousePointer size={18} className="text-amber-800" />, title: '1. Pilih Menu', desc: 'Klik gambar menu' },
              { icon: <ShoppingCart size={18} className="text-amber-800" />, title: '2. Keranjang', desc: 'Isi nama & meja' },
              { icon: <Utensils size={18} className="text-amber-800" />, title: '3. Diantar', desc: 'Kami kirim ke meja' }
            ].map((st, i) => (
              <div key={i}>
                <div style={{ width: '40px', height: '40px', background: '#F4ECE1', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px auto' }}>
                  {st.icon}
                </div>
                <strong style={{ fontSize: '12px', color: '#2D1A10', display: 'block' }}>{st.title}</strong>
                <span style={{ fontSize: '10px', color: '#7A695C' }}>{st.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 8. FOOTER INFO RESTO */}
        <footer style={{ background: '#2D1A10', color: '#FFFFFF', borderRadius: '20px', padding: '20px', fontSize: '12px', lineHeight: '1.6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <Wifi size={20} className="text-amber-400" />
            <div>
              <strong style={{ display: 'block', color: '#FFFFFF' }}>WiFi Gratis Kedai</strong>
              <span style={{ opacity: 0.8 }}>SSID: CoffeeShop_Resto · Pass: kopi123</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Clock size={20} className="text-amber-400" />
            <div>
              <strong style={{ display: 'block', color: '#FFFFFF' }}>Jam Operasional</strong>
              <span style={{ opacity: 0.8 }}>Setiap Hari: 08:00 – 22:00 WIB</span>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '10px', textAlign: 'center', opacity: 0.6, fontSize: '10px' }}>
            © 2026 CoffeeShop Resto · Quick QR Order System
          </div>
        </footer>
      </main>

      {cart.length > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: '#FFFFFF',
            borderTop: '1.5px solid #E8DFD5',
            padding: '16px 24px',
            boxShadow: '0 -10px 30px rgba(0,0,0,0.1)',
            zIndex: 100
          }}
        >
          <div
            style={{
              maxWidth: '1000px',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '20px',
              flexWrap: 'wrap'
            }}
          >
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '16px' }}
            >
              <div
                style={{
                  background: '#7C4012',
                  color: '#fff',
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ShoppingBag size={22} />
              </div>

              <div>
                <strong
                  style={{
                    fontSize: '15px',
                    color: '#2D1A10',
                    display: 'block'
                  }}
                >
                  {cart.reduce((a, b) => a + b.quantity, 0)} Item Dalam Keranjang
                </strong>

                <span
                  style={{
                    fontSize: '13px',
                    color: '#7C4012',
                    fontWeight: 800
                  }}
                >
                  Total: Rp {totalAmount.toLocaleString('id-ID')}
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    color: '#7A695C',
                    display: 'block',
                    marginTop: '2px'
                  }}
                >
                  {cart.map((c) => `${c.name} (${c.variant_type || 'Std'}) x${c.quantity}`).join(', ')}
                </span>
              </div>
            </div>

            <form
              onSubmit={handleCreateOrder}
              style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
            >
              <input
                type="text"
                placeholder="Nama Anda / Pemesan"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid #E8DFD5',
                  outline: 'none',
                  fontSize: '13px',
                  width: '180px'
                }}
              />

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  background: 'linear-gradient(135deg, #7C4012, #D97706)',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Send size={14} />{' '}
                {isSubmitting ? 'Kirim...' : 'Kirim Pesanan'}
              </button>
            </form>
          </div>
        </div>
      )}

      {variantProduct && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(45, 26, 16, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
            backdropFilter: 'blur(3px)'
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '24px',
              maxWidth: '380px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}
            >
              <h3
                style={{
                  fontSize: '17px',
                  fontWeight: 800,
                  color: '#2D1A10',
                  margin: 0
                }}
              >
                Pilih Varian Suhu
              </h3>
              <button
                onClick={() => setVariantProduct(null)}
                style={{
                  background: '#F4ECE1',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#7C4012'
                }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '14px', fontWeight: 700, color: '#7C4012', marginBottom: '4px' }}>
              {variantProduct.name}
            </p>
            <p style={{ fontSize: '13px', color: '#7A695C', marginBottom: '20px' }}>
              Pilih varian rasa & suhu yang Anda inginkan:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                type="button"
                onClick={() => {
                  addToCartWithVariant(variantProduct, 'Panas', variantProduct.hot_name || null);
                  setVariantProduct(null);
                }}
                style={{
                  padding: '14px 10px',
                  borderRadius: '16px',
                  border: '1.5px solid #FED7AA',
                  background: '#FFF8F0',
                  color: '#9A3412',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease'
                }}
              >
                {variantProduct.hot_image ? (
                  <img
                    src={variantProduct.hot_image}
                    alt={variantProduct.hot_name || 'Panas'}
                    style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover', border: '2px solid #EA580C' }}
                  />
                ) : (
                  <Coffee size={28} style={{ color: '#EA580C' }} />
                )}
                <span>{variantProduct.hot_name || 'Panas (Hot)'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  addToCartWithVariant(variantProduct, 'Dingin', variantProduct.ice_name || null);
                  setVariantProduct(null);
                }}
                style={{
                  padding: '14px 10px',
                  borderRadius: '16px',
                  border: '1.5px solid #BAE6FD',
                  background: '#F0F9FF',
                  color: '#0369A1',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease'
                }}
              >
                {variantProduct.ice_image ? (
                  <img
                    src={variantProduct.ice_image}
                    alt={variantProduct.ice_name || 'Dingin'}
                    style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover', border: '2px solid #0284C7' }}
                  />
                ) : (
                  <Snowflake size={28} style={{ color: '#0284C7' }} />
                )}
                <span>{variantProduct.ice_name || 'Dingin (Ice)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {isTableModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(45, 26, 16, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
            backdropFilter: 'blur(3px)'
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '24px',
              maxWidth: '440px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={20} style={{ color: '#7C4012' }} />
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: 800,
                    color: '#2D1A10',
                    margin: 0
                  }}
                >
                  Pilih Nomor Meja
                </h3>
              </div>
              <button
                onClick={() => setIsTableModalOpen(false)}
                style={{
                  background: '#F4ECE1',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#7C4012'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {!tableNumber && (
              <div
                style={{
                  background: '#FEF3C7',
                  border: '1px solid #F59E0B',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  marginBottom: '16px',
                  fontSize: '13px',
                  color: '#92400E',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <AlertTriangle size={18} className="text-amber-600 shrink-0" />
                <span>Silakan pilih nomor meja Anda terlebih dahulu untuk mengirim pesanan.</span>
              </div>
            )}

            <p style={{ fontSize: '13px', color: '#7A695C', marginBottom: '16px' }}>
              Silakan pilih posisi/nomor meja Anda untuk melanjutkan pemesanan:
            </p>

            {tables.length > 0 ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '10px',
                  maxHeight: '260px',
                  overflowY: 'auto',
                  paddingRight: '4px'
                }}
              >
                {tables.map((t) => {
                  const isSelected = tableNumber === t.table_number;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setTableNumber(t.table_number);
                        setIsTableModalOpen(false);
                      }}
                      style={{
                        padding: '12px 8px',
                        borderRadius: '12px',
                        border: isSelected
                          ? '2px solid #7C4012'
                          : '1px solid #E8DFD5',
                        background: isSelected ? '#7C4012' : '#FAF6F0',
                        color: isSelected ? '#FFFFFF' : '#2D1A10',
                        fontWeight: 700,
                        fontSize: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        textAlign: 'center'
                      }}
                    >
                      {t.table_number}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div
                style={{
                  padding: '32px 16px',
                  textAlign: 'center',
                  background: '#FAF6F0',
                  borderRadius: '12px',
                  border: '1px dashed #E8DFD5',
                  color: '#7A695C',
                  fontSize: '14px',
                  fontWeight: 600
                }}
              >
                Tidak ada meja yang tersedia
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}