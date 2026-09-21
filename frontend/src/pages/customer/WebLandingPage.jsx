import React, { useState, useEffect } from 'react';
import { Coffee, ShoppingBag, Plus, Check, Sparkles, Send, MapPin, X, Flame, ChefHat, Tag, Gift, Bell, Search, Clock, Wifi, Utensils, Snowflake, Zap, AlertTriangle, BookOpen, Citrus, ShoppingCart, MousePointer, ShieldCheck, ArrowRight, UserCheck, Star, Phone } from 'lucide-react';
import { productService, categoryService, orderService, tableService } from '../../services/api';
import { Link } from 'react-router-dom';

export default function WebLandingPage() {
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

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('Online / Delivery');
  const [variantProduct, setVariantProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  useEffect(() => {
    const fetchMenuData = async () => {
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
      } catch (err) {
        console.error('Gagal memuat menu web landing:', err);
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
    if (!customerName || cart.length === 0) return;

    setIsSubmitting(true);

    try {
      const res = await orderService.create({
        customer_name: customerName,
        table_number: tableNumber || 'Online Order',
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
      console.error('Gagal mengirim pesanan online:', err);
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

  const bestSellers = products.filter(p => p.is_best_seller);
  const chefPicks = products.filter(p => p.is_chef_pick);

  return (
    <div style={{ background: '#FAF6F0', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Navigation Bar Web */}
      <nav
        style={{
          background: '#FFFFFF',
          borderBottom: '1px solid #E8DFD5',
          padding: '16px 32px',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          boxShadow: '0 2px 10px rgba(45, 26, 16, 0.05)'
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                background: 'linear-gradient(135deg, #7C4012, #D97706)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(124, 64, 18, 0.2)'
              }}
            >
              <Coffee size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#2D1A10', margin: 0, letterSpacing: '-0.5px' }}>
                CoffeeShop Resto
              </h1>
              <span style={{ fontSize: '12px', color: '#7A695C', fontWeight: 600 }}>
                Specialty Coffee & Gourmet Dining
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <a href="#hero-section" style={{ textDecoration: 'none', color: '#5C4333', fontWeight: 700, fontSize: '14px' }}>Beranda</a>
            <a href="#menu-catalog" style={{ textDecoration: 'none', color: '#5C4333', fontWeight: 700, fontSize: '14px' }}>Menu Katalog</a>
            <a href="#about-us" style={{ textDecoration: 'none', color: '#5C4333', fontWeight: 700, fontSize: '14px' }}>Tentang Kami</a>
            <Link to="/quick-order" style={{ textDecoration: 'none', color: '#7C4012', background: '#F4ECE1', padding: '8px 16px', borderRadius: '20px', fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={14} /> Quick Order Meja (QR)
            </Link>
            <Link to="/auth/login" style={{ textDecoration: 'none', color: '#FFFFFF', background: 'linear-gradient(135deg, #7C4012, #D97706)', padding: '10px 20px', borderRadius: '12px', fontWeight: 700, fontSize: '13px', boxShadow: '0 4px 12px rgba(124, 64, 18, 0.2)' }}>
              Portal Admin
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        id="hero-section"
        style={{
          background: 'linear-gradient(135deg, #2D1A10 0%, #5C3111 60%, #7C4012 100%)',
          color: '#FFFFFF',
          padding: '80px 32px 100px 32px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <span style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#FDE68A', padding: '6px 16px', borderRadius: '30px', fontSize: '13px', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '20px' }}>
            <Sparkles size={14} /> Nikmati Kopi Terbaik & Layanan Cepat
          </span>

          <h2 style={{ fontSize: '46px', fontWeight: 900, lineHeight: 1.15, margin: '0 0 20px 0', letterSpacing: '-1px' }}>
            Sensasi Kopi Nusantara Ditulis Dengan Kesempurnaan
          </h2>

          <p style={{ fontSize: '16px', opacity: 0.9, lineHeight: 1.6, margin: '0 0 32px 0', fontWeight: 400 }}>
            Pesan menu favorit Anda langsung secara Online atau Scan QR Code Meja saat Dine-In tanpa harus mengantre. Bahan segar dipadu dengan keahlian Barista terbaik kami.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="#menu-catalog"
              style={{
                background: 'linear-gradient(135deg, #D97706, #B45309)',
                color: '#FFFFFF',
                padding: '16px 32px',
                borderRadius: '14px',
                fontWeight: 800,
                fontSize: '15px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 8px 24px rgba(217, 119, 6, 0.35)',
                transition: 'transform 0.2s ease'
              }}
            >
              Pesan Online Sekarang <ArrowRight size={18} />
            </a>

            <Link
              to="/quick-order"
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                color: '#FFFFFF',
                border: '1.5px solid rgba(255, 255, 255, 0.3)',
                padding: '16px 32px',
                borderRadius: '14px',
                fontWeight: 800,
                fontSize: '15px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Zap size={18} /> Mode Quick Order Meja
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section style={{ maxWidth: '1200px', margin: '-40px auto 60px auto', padding: '0 32px', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {[
            { icon: <Coffee size={28} className="text-amber-700" />, title: 'Biji Kopi Pilihan', desc: '100% Single Origin Robusta & Arabica terbaik dipanggang secara presisi.' },
            { icon: <ChefHat size={28} className="text-amber-700" />, title: 'Racikan Master Barista', desc: 'Dibuat oleh tim barista berpengalaman dengan standar kualitas tertinggi.' },
            { icon: <Zap size={28} className="text-amber-700" />, title: 'Quick QR Dine-In', desc: 'Pesan dari meja Anda via Scan QR tanpa antre, diantar hangat dalam 10 menit.' }
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E8DFD5',
                borderRadius: '20px',
                padding: '28px 24px',
                boxShadow: '0 8px 24px rgba(45, 26, 16, 0.06)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ width: '56px', height: '56px', background: '#F4ECE1', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.icon}
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#2D1A10', margin: 0 }}>{item.title}</h3>
              <p style={{ fontSize: '13px', color: '#7A695C', lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Menu Catalog & Online Order Section */}
      <section id="menu-catalog" style={{ maxWidth: '1200px', margin: '0 auto 80px auto', padding: '0 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ color: '#D97706', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
            KATALOG MENU SPESIAL
          </span>
          <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#2D1A10', margin: '8px 0 12px 0' }}>
            Pilih & Pesan Menu Kopi / Makanan
          </h2>
          <p style={{ fontSize: '15px', color: '#7A695C', maxWidth: '600px', margin: '0 auto' }}>
            Klik menu yang disukai untuk menambahkan ke keranjang pemesanan online
          </p>
        </div>

        {/* Category Filters */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '36px' }}>
          <button
            onClick={() => setSelectedCategory('all')}
            style={{
              padding: '12px 24px',
              borderRadius: '25px',
              border: selectedCategory === 'all' ? 'none' : '1px solid #E8DFD5',
              background: selectedCategory === 'all' ? '#7C4012' : '#FFFFFF',
              color: selectedCategory === 'all' ? '#FFFFFF' : '#5C4333',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: selectedCategory === 'all' ? '0 4px 14px rgba(124, 64, 18, 0.25)' : 'none'
            }}
          >
            <Utensils size={16} /> Semua Sajian ({products.length})
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '12px 24px',
                borderRadius: '25px',
                border: selectedCategory === cat.id ? 'none' : '1px solid #E8DFD5',
                background: selectedCategory === cat.id ? '#7C4012' : '#FFFFFF',
                color: selectedCategory === cat.id ? '#FFFFFF' : '#5C4333',
                fontWeight: 800,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: selectedCategory === cat.id ? '0 4px 14px rgba(124, 64, 18, 0.25)' : 'none'
              }}
            >
              <Coffee size={16} /> {cat.name}
            </button>
          ))}
        </div>

        {orderSuccess && (
          <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '20px', borderRadius: '16px', marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <Check size={28} style={{ color: '#059669' }} />
              <div>
                <strong style={{ color: '#065F46', display: 'block', fontSize: '16px' }}>Pesanan Online Berhasil Dikirim!</strong>
                <span style={{ fontSize: '13px', color: '#047857' }}>Kode Order: <strong>{orderSuccess.order_code}</strong> (Status: Menunggu Konfirmasi Resto)</span>
              </div>
            </div>
            <button onClick={() => setOrderSuccess(null)} style={{ background: 'transparent', border: 'none', color: '#047857', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}>Tutup</button>
          </div>
        )}

        {/* Product Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
          {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              onClick={() => handleProductClick(prod)}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E8DFD5',
                borderRadius: '20px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                cursor: prod.is_available ? 'pointer' : 'not-allowed',
                boxShadow: '0 4px 16px rgba(45, 26, 16, 0.04)',
                opacity: prod.is_available ? 1 : 0.6,
                transition: 'transform 0.2s ease, boxShadow 0.2s ease'
              }}
            >
              <div style={{ position: 'relative', marginBottom: '14px' }}>
                {prod.image ? (
                  <img src={prod.image} alt={prod.name} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '14px' }} />
                ) : (
                  <div style={{ width: '100%', height: '160px', background: '#F4ECE1', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C4012' }}>
                    <Coffee size={40} />
                  </div>
                )}

                {prod.is_best_seller && (
                  <span style={{ position: 'absolute', top: '8px', left: '8px', background: '#DC2626', color: '#FFF', fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Flame size={12} /> Best Seller
                  </span>
                )}
              </div>

              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#2D1A10', margin: '0 0 6px 0', lineHeight: 1.3 }}>
                {prod.name}
              </h3>
              <p style={{ fontSize: '12px', color: '#7A695C', margin: '0 0 12px 0', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.4 }}>
                {prod.description || 'Sajian rasa kopi nikmat dan berkualitas tinggi.'}
              </p>

              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #F4ECE1' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#7C4012' }}>
                  Rp {Number(prod.price).toLocaleString('id-ID')}
                </span>
                <button
                  type="button"
                  style={{ background: 'linear-gradient(135deg, #7C4012, #D97706)', color: '#FFF', border: 'none', width: '32px', height: '32px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(124, 64, 18, 0.25)' }}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Floating Cart for Online Order */}
      {cart.length > 0 && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#FFFFFF', borderTop: '1.5px solid #E8DFD5', padding: '18px 32px', boxShadow: '0 -10px 30px rgba(0,0,0,0.12)', zIndex: 100 }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ background: '#7C4012', color: '#fff', width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingBag size={24} />
              </div>
              <div>
                <strong style={{ fontSize: '16px', color: '#2D1A10', display: 'block' }}>
                  {cart.reduce((a, b) => a + b.quantity, 0)} Item Keranjang Online
                </strong>
                <span style={{ fontSize: '14px', color: '#7C4012', fontWeight: 800 }}>
                  Total: Rp {totalAmount.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <form onSubmit={handleCreateOrder} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="text"
                placeholder="Nama Lengkap Anda"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                style={{ padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #E8DFD5', outline: 'none', fontSize: '14px', width: '200px' }}
              />

              <button
                type="submit"
                disabled={isSubmitting}
                style={{ background: 'linear-gradient(135deg, #7C4012, #D97706)', color: '#FFFFFF', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: 800, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(124, 64, 18, 0.25)' }}
              >
                <Send size={16} /> {isSubmitting ? 'Mengirim...' : 'Kirim Pesanan Online'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Variant Modal */}
      {variantProduct && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(45, 26, 16, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', backdropFilter: 'blur(3px)' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '24px', padding: '28px', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#2D1A10', margin: 0 }}>Pilih Varian Suhu</h3>
              <button onClick={() => setVariantProduct(null)} style={{ background: '#F4ECE1', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', color: '#7C4012', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} /></button>
            </div>

            <p style={{ fontSize: '15px', fontWeight: 800, color: '#7C4012', marginBottom: '20px' }}>{variantProduct.name}</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <button
                type="button"
                onClick={() => { addToCartWithVariant(variantProduct, 'Panas', variantProduct.hot_name || null); setVariantProduct(null); }}
                style={{ padding: '16px 12px', borderRadius: '18px', border: '1.5px solid #FED7AA', background: '#FFF8F0', color: '#9A3412', fontWeight: 800, fontSize: '13px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
              >
                {variantProduct.hot_image ? <img src={variantProduct.hot_image} alt="Hot" style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover' }} /> : <Coffee size={28} style={{ color: '#EA580C' }} />}
                <span>{variantProduct.hot_name || 'Panas (Hot)'}</span>
              </button>

              <button
                type="button"
                onClick={() => { addToCartWithVariant(variantProduct, 'Dingin', variantProduct.ice_name || null); setVariantProduct(null); }}
                style={{ padding: '16px 12px', borderRadius: '18px', border: '1.5px solid #BAE6FD', background: '#F0F9FF', color: '#0369A1', fontWeight: 800, fontSize: '13px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
              >
                {variantProduct.ice_image ? <img src={variantProduct.ice_image} alt="Ice" style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover' }} /> : <Snowflake size={28} style={{ color: '#0284C7' }} />}
                <span>{variantProduct.ice_name || 'Dingin (Ice)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Website */}
      <footer style={{ background: '#2D1A10', color: '#FFFFFF', padding: '60px 32px 30px 32px', borderTop: '4px solid #7C4012' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px', marginBottom: '40px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Coffee size={28} style={{ color: '#FDE68A' }} />
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>CoffeeShop Resto</h3>
            </div>
            <p style={{ fontSize: '13px', opacity: 0.8, lineHeight: 1.6 }}>
              Tempat terbaik menikmati seduhan kopi racikan Barista profesional & santapan makanan khas berkualitas.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#FDE68A', marginBottom: '16px' }}>Jam Operasional & WiFi</h4>
            <div style={{ fontSize: '13px', opacity: 0.8, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={16} /> Senin - Minggu: 08:00 - 22:00 WIB</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Wifi size={16} /> Free WiFi: CoffeeShop_Resto (Pass: kopi123)</span>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#FDE68A', marginBottom: '16px' }}>Lokasi & Kontak</h4>
            <div style={{ fontSize: '13px', opacity: 0.8, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={16} /> Jl. Kopi Nusantara No. 88, Resto Area</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={16} /> +62 812-3456-7890</span>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', textAlign: 'center', opacity: 0.6, fontSize: '12px' }}>
          © 2026 CoffeeShop Resto. All rights reserved. Built with Quick QR & Online Order System.
        </div>
      </footer>
    </div>
  );
}
