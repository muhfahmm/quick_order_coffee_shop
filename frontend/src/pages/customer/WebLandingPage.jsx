import React, { useState, useEffect } from 'react';
import { Coffee, ShoppingBag, Plus, Check, Sparkles, Send, MapPin, X, Flame, ChefHat, Tag, Gift, Bell, Search, Clock, Wifi, Utensils, Snowflake, Zap, AlertTriangle, BookOpen, Citrus, ShoppingCart, MousePointer, ShieldCheck, ArrowRight, UserCheck, Star, Phone, Menu } from 'lucide-react';
import { productService, categoryService, orderService } from '../../services/api';
import { Link } from 'react-router-dom';
import FastImage from '../../components/common/FastImage';
import { preloadProductImages } from '../../utils/imagePreloader';

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
      const parsed = cached ? JSON.parse(cached) : [];
      if (parsed.length > 0) preloadProductImages(parsed);
      return parsed;
    } catch {
      return [];
    }
  });

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState([]);

  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const rawParam = params.get('table') || params.get('table_number') || params.get('meja') || params.get('token');
      if (rawParam) {
        let resolved = rawParam;
        if (rawParam.startsWith('tbl-')) {
          const cachedTables = JSON.parse(localStorage.getItem('cached_tables') || '[]');
          const found = cachedTables.find((t) => t.qr_code_token === rawParam);
          if (found) resolved = found.table_number;
        } else if (/^\d+$/.test(rawParam)) {
          resolved = `Meja ${parseInt(rawParam, 10)}`;
        } else if (!rawParam.toLowerCase().startsWith('meja')) {
          resolved = `Meja ${rawParam}`;
        }
        sessionStorage.setItem('current_table_number', resolved);
        localStorage.setItem('current_table_number', resolved);
        return resolved;
      }
      return sessionStorage.getItem('current_table_number') || localStorage.getItem('current_table_number') || 'Online / Delivery';
    } catch {
      return 'Online / Delivery';
    }
  });
  const [variantProduct, setVariantProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.title = 'Website Utama - Coffee Shop Resto';
    const params = new URLSearchParams(window.location.search);
    const rawParam = params.get('table') || params.get('table_number') || params.get('meja') || params.get('token');
    if (rawParam) {
      let resolved = rawParam;
      if (rawParam.startsWith('tbl-')) {
        const cachedTables = JSON.parse(localStorage.getItem('cached_tables') || '[]');
        const found = cachedTables.find((t) => t.qr_code_token === rawParam);
        if (found) resolved = found.table_number;
      } else if (/^\d+$/.test(rawParam)) {
        resolved = `Meja ${parseInt(rawParam, 10)}`;
      } else if (!rawParam.toLowerCase().startsWith('meja')) {
        resolved = `Meja ${rawParam}`;
      }
      setTableNumber(resolved);
      sessionStorage.setItem('current_table_number', resolved);
      localStorage.setItem('current_table_number', resolved);
    }
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

        preloadProductImages(prodData);
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
      addToCartWithVariant(product, 'Panas', product.hot_name || null, product.hot_price, product.hot_image || product.image);
    } else if (tempType === 'ice_only') {
      addToCartWithVariant(product, 'Dingin', product.ice_name || null, product.ice_price, product.ice_image || product.image);
    } else {
      addToCartWithVariant(product, null, null, product.price, product.image);
    }
  };

  const addToCartWithVariant = (product, variantType, customVariantName = null, customPrice = null, customImage = null) => {
    const finalName = customVariantName || (variantType ? `${product.name} (${variantType})` : product.name);
    const finalPrice = customPrice != null && customPrice !== '' ? Number(customPrice) : Number(product.price);
    const finalImage = customImage || product.image;

    setCart((prevCart) => {
      const existing = prevCart.find(
        (item) => item.product_id === product.id && item.variant_type === variantType
      );

      if (existing) {
        return prevCart.map((item) =>
          item.product_id === product.id && item.variant_type === variantType
            ? { ...item, quantity: item.quantity + 1, image: finalImage || item.image }
            : item
        );
      }

      return [
        ...prevCart,
        {
          product_id: product.id,
          name: finalName,
          variant_type: variantType,
          price: finalPrice,
          image: finalImage,
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
      localStorage.removeItem('checkout_cart');
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

  return (
    <div style={{ background: '#FAF6F0', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Navigation Bar Web */}
      <nav
        style={{
          background: '#FFFFFF',
          borderBottom: '1px solid #E8DFD5',
          padding: '14px 20px',
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
            {/* Mobile Hamburger Toggle (Modern Custom Coffee Bar Style) */}
            <button
              className="web-mobile-toggle"
              onClick={() => setIsMobileMenuOpen(true)}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '6px',
                color: '#7C4012',
                cursor: 'pointer',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.2s ease'
              }}
            >
              <Menu size={26} strokeWidth={2.5} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #7C4012, #D97706)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  boxShadow: '0 4px 12px rgba(124, 64, 18, 0.2)'
                }}
              >
                <Coffee size={22} />
              </div>
              <div>
                <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#2D1A10', margin: 0, letterSpacing: '-0.5px' }}>
                  CoffeeShop Resto
                </h1>
                <span style={{ fontSize: '11px', color: '#7A695C', fontWeight: 600 }}>
                  Specialty Coffee & Gourmet
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="web-desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <a href="#hero-section" style={{ textDecoration: 'none', color: '#5C4333', fontWeight: 700, fontSize: '14px' }}>Beranda</a>
            <a href="#menu-catalog" style={{ textDecoration: 'none', color: '#5C4333', fontWeight: 700, fontSize: '14px' }}>Katalog Menu</a>
            <Link to="/quick-order" style={{ textDecoration: 'none', color: '#7C4012', background: '#F4ECE1', padding: '8px 16px', borderRadius: '20px', fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={14} /> Quick Order Meja
            </Link>
            <Link to="/auth/login" style={{ textDecoration: 'none', color: '#FFFFFF', background: 'linear-gradient(135deg, #7C4012, #D97706)', padding: '8px 18px', borderRadius: '12px', fontWeight: 700, fontSize: '13px', boxShadow: '0 4px 12px rgba(124, 64, 18, 0.2)' }}>
              Portal Admin
            </Link>
          </div>
        </div>

        {/* Mobile Slide-In Side Drawer Menu (Left to Right) */}
        {isMobileMenuOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(45, 26, 16, 0.5)',
              backdropFilter: 'blur(4px)',
              zIndex: 1000,
              display: 'flex'
            }}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#FFFFFF',
                width: '280px',
                height: '100%',
                padding: '24px 20px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '10px 0 30px rgba(0,0,0,0.2)',
                animation: 'slideFromLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
              }}
            >
              {/* Drawer Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #E8DFD5' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #7C4012, #D97706)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    <Coffee size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#2D1A10', margin: 0 }}>CoffeeShop</h3>
                    <span style={{ fontSize: '10px', color: '#7A695C', fontWeight: 600 }}>Menu Navigasi</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ background: '#F4ECE1', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', color: '#7C4012', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Links */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                <a
                  href="#hero-section"
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ textDecoration: 'none', color: '#2D1A10', fontWeight: 700, fontSize: '15px', padding: '12px 14px', borderRadius: '12px', background: '#FAF6F0' }}
                >
                  Beranda
                </a>
                <a
                  href="#menu-catalog"
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ textDecoration: 'none', color: '#2D1A10', fontWeight: 700, fontSize: '15px', padding: '12px 14px', borderRadius: '12px', background: '#FAF6F0' }}
                >
                  Katalog Menu
                </a>
                <Link
                  to="/quick-order"
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ textDecoration: 'none', color: '#7C4012', background: '#F4ECE1', padding: '12px 14px', borderRadius: '12px', fontWeight: 800, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Zap size={16} /> Quick Order Meja
                </Link>
              </div>

              {/* Drawer Footer Admin Link */}
              <div style={{ paddingTop: '16px', borderTop: '1px solid #E8DFD5' }}>
                <Link
                  to="/auth/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ textDecoration: 'none', color: '#FFFFFF', background: 'linear-gradient(135deg, #7C4012, #D97706)', padding: '14px', borderRadius: '14px', fontWeight: 800, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', boxSizing: 'border-box' }}
                >
                  Portal Admin
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section
        id="hero-section"
        style={{
          background: 'linear-gradient(135deg, #2D1A10 0%, #5C3111 60%, #7C4012 100%)',
          color: '#FFFFFF',
          padding: '60px 20px 80px 20px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <span style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#FDE68A', padding: '6px 14px', borderRadius: '30px', fontSize: '12px', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
            <Sparkles size={14} /> Nikmati Kopi Terbaik & Layanan Cepat
          </span>

          <h2 style={{ fontSize: 'clamp(28px, 5vw, 46px)', fontWeight: 900, lineHeight: 1.2, margin: '0 0 16px 0', letterSpacing: '-0.5px' }}>
            Sensasi Kopi Nusantara Ditulis Dengan Kesempurnaan
          </h2>

          <p style={{ fontSize: 'clamp(14px, 2.5vw, 16px)', opacity: 0.9, lineHeight: 1.6, margin: '0 0 28px 0', fontWeight: 400 }}>
            Pesan menu favorit Anda langsung secara Online atau Scan QR Code Meja saat Dine-In tanpa harus mengantre.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="#menu-catalog"
              style={{
                background: 'linear-gradient(135deg, #D97706, #B45309)',
                color: '#FFFFFF',
                padding: '14px 24px',
                borderRadius: '14px',
                fontWeight: 800,
                fontSize: '14px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 8px 24px rgba(217, 119, 6, 0.35)'
              }}
            >
              Pesan Online Sekarang <ArrowRight size={16} />
            </a>

            <Link
              to="/quick-order"
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                color: '#FFFFFF',
                border: '1.5px solid rgba(255, 255, 255, 0.3)',
                padding: '14px 24px',
                borderRadius: '14px',
                fontWeight: 800,
                fontSize: '14px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Zap size={16} /> Quick Order Meja
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section style={{ maxWidth: '1200px', margin: '-30px auto 40px auto', padding: '0 20px', position: 'relative', zIndex: 10 }}>
        <div className="web-feature-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          {[
            { icon: <Coffee size={26} style={{ color: '#7C4012' }} />, title: 'Biji Kopi Pilihan', desc: '100% Single Origin Robusta & Arabica terbaik dipanggang secara presisi.' },
            { icon: <ChefHat size={26} style={{ color: '#7C4012' }} />, title: 'Racikan Master Barista', desc: 'Dibuat oleh tim barista berpengalaman dengan standar kualitas tertinggi.' },
            { icon: <Zap size={26} style={{ color: '#7C4012' }} />, title: 'Quick QR Dine-In', desc: 'Pesan dari meja Anda via Scan QR tanpa antre, diantar hangat dalam 10 menit.' }
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E8DFD5',
                borderRadius: '18px',
                padding: '20px',
                boxShadow: '0 8px 24px rgba(45, 26, 16, 0.06)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ width: '48px', height: '48px', background: '#F4ECE1', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.icon}
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#2D1A10', margin: 0 }}>{item.title}</h3>
              <p style={{ fontSize: '13px', color: '#7A695C', lineHeight: 1.5, margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Menu Catalog & Online Order Section */}
      <section id="menu-catalog" style={{ maxWidth: '1200px', margin: '0 auto 60px auto', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span style={{ color: '#D97706', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
            KATALOG MENU SPESIAL
          </span>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 900, color: '#2D1A10', margin: '6px 0 10px 0' }}>
            Pilih & Pesan Menu Kopi / Makanan
          </h2>
          <p style={{ fontSize: '14px', color: '#7A695C', maxWidth: '600px', margin: '0 auto' }}>
            Klik menu yang disukai untuk menambahkan ke keranjang pemesanan online
          </p>
        </div>

        {/* Category Filters */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '28px' }}>
          <button
            onClick={() => setSelectedCategory('all')}
            style={{
              padding: '10px 20px',
              borderRadius: '25px',
              border: selectedCategory === 'all' ? 'none' : '1px solid #E8DFD5',
              background: selectedCategory === 'all' ? '#7C4012' : '#FFFFFF',
              color: selectedCategory === 'all' ? '#FFFFFF' : '#5C4333',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              boxShadow: selectedCategory === 'all' ? '0 4px 14px rgba(124, 64, 18, 0.25)' : 'none'
            }}
          >
            <Utensils size={15} /> Semua Sajian ({products.length})
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '10px 20px',
                borderRadius: '25px',
                border: selectedCategory === cat.id ? 'none' : '1px solid #E8DFD5',
                background: selectedCategory === cat.id ? '#7C4012' : '#FFFFFF',
                color: selectedCategory === cat.id ? '#FFFFFF' : '#5C4333',
                fontWeight: 800,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
                boxShadow: selectedCategory === cat.id ? '0 4px 14px rgba(124, 64, 18, 0.25)' : 'none'
              }}
            >
              <Coffee size={15} /> {cat.name}
            </button>
          ))}
        </div>

        {orderSuccess && (
          <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '16px', borderRadius: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Check size={24} style={{ color: '#059669' }} />
              <div>
                <strong style={{ color: '#065F46', display: 'block', fontSize: '15px' }}>Pesanan Online Berhasil Dikirim!</strong>
                <span style={{ fontSize: '12px', color: '#047857' }}>Kode Order: <strong>{orderSuccess.order_code}</strong></span>
              </div>
            </div>
            <button onClick={() => setOrderSuccess(null)} style={{ background: 'transparent', border: 'none', color: '#047857', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>Tutup</button>
          </div>
        )}

        {/* Product Grid - Responsive */}
        <div className="web-products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
          {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              onClick={() => handleProductClick(prod)}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E8DFD5',
                borderRadius: '18px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                cursor: prod.is_available ? 'pointer' : 'not-allowed',
                boxShadow: '0 4px 16px rgba(45, 26, 16, 0.04)',
                opacity: prod.is_available ? 1 : 0.6
              }}
            >
              <div style={{ position: 'relative', marginBottom: '12px' }}>
                <FastImage src={prod.image} alt={prod.name} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '12px' }} />

                {prod.is_best_seller && (
                  <span style={{ position: 'absolute', top: '8px', left: '8px', background: '#DC2626', color: '#FFF', fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Flame size={12} /> Best Seller
                  </span>
                )}
              </div>

              <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#2D1A10', margin: '0 0 4px 0', lineHeight: 1.3 }}>
                {prod.name}
              </h3>
              <p style={{ fontSize: '12px', color: '#7A695C', margin: '0 0 10px 0', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.4 }}>
                {prod.description || 'Sajian rasa kopi nikmat dan berkualitas tinggi.'}
              </p>

              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #F4ECE1' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#7C4012' }}>
                  Rp {Number(prod.price).toLocaleString('id-ID')}
                </span>
                <button
                  type="button"
                  style={{ background: 'linear-gradient(135deg, #7C4012, #D97706)', color: '#FFF', border: 'none', width: '30px', height: '30px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <Plus size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Floating Cart for Online Order */}
      {cart.length > 0 && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#FFFFFF', borderTop: '1.5px solid #E8DFD5', padding: '14px 20px', boxShadow: '0 -10px 30px rgba(0,0,0,0.12)', zIndex: 100 }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: '#7C4012', color: '#fff', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingBag size={20} />
              </div>
              <div>
                <strong style={{ fontSize: '14px', color: '#2D1A10', display: 'block' }}>
                  {cart.reduce((a, b) => a + b.quantity, 0)} Item Keranjang Online
                </strong>
                <span style={{ fontSize: '13px', color: '#7C4012', fontWeight: 800 }}>
                  Rp {totalAmount.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <form onSubmit={handleCreateOrder} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
              <input
                type="text"
                placeholder="Nama Lengkap Anda"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                style={{ padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #E8DFD5', outline: 'none', fontSize: '13px', minWidth: '160px', flex: 1, maxWidth: '240px' }}
              />

              <button
                type="submit"
                disabled={isSubmitting}
                style={{ background: 'linear-gradient(135deg, #7C4012, #D97706)', color: '#FFFFFF', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 800, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
              >
                <Send size={15} /> {isSubmitting ? 'Mengirim...' : 'Kirim Pesanan'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Variant Modal */}
      {variantProduct && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(45, 26, 16, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', backdropFilter: 'blur(3px)' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '24px', padding: '24px', maxWidth: '380px', width: '100%', textAlign: 'center', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#2D1A10', margin: 0 }}>Pilih Varian Suhu</h3>
              <button onClick={() => setVariantProduct(null)} style={{ background: '#F4ECE1', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', color: '#7C4012', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
            </div>

            <p style={{ fontSize: '14px', fontWeight: 800, color: '#7C4012', marginBottom: '18px' }}>{variantProduct.name}</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                type="button"
                onClick={() => { addToCartWithVariant(variantProduct, 'Panas', variantProduct.hot_name || null, variantProduct.hot_price, variantProduct.hot_image || variantProduct.image); setVariantProduct(null); }}
                style={{ padding: '14px 10px', borderRadius: '16px', border: '1.5px solid #FED7AA', background: '#FFF8F0', color: '#9A3412', fontWeight: 800, fontSize: '12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}
              >
                {variantProduct.hot_image ? <FastImage src={variantProduct.hot_image} alt="Hot" style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover' }} /> : <Coffee size={26} style={{ color: '#EA580C' }} />}
                <span>{variantProduct.hot_name || 'Panas (Hot)'}</span>
              </button>

              <button
                type="button"
                onClick={() => { addToCartWithVariant(variantProduct, 'Dingin', variantProduct.ice_name || null, variantProduct.ice_price, variantProduct.ice_image || variantProduct.image); setVariantProduct(null); }}
                style={{ padding: '14px 10px', borderRadius: '16px', border: '1.5px solid #BAE6FD', background: '#F0F9FF', color: '#0369A1', fontWeight: 800, fontSize: '12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}
              >
                {variantProduct.ice_image ? <FastImage src={variantProduct.ice_image} alt="Ice" style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover' }} /> : <Snowflake size={26} style={{ color: '#0284C7' }} />}
                <span>{variantProduct.ice_name || 'Dingin (Ice)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Website */}
      <footer style={{ background: '#2D1A10', color: '#FFFFFF', padding: '50px 20px 30px 20px', borderTop: '4px solid #7C4012' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '32px', marginBottom: '32px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <Coffee size={24} style={{ color: '#FDE68A' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>CoffeeShop Resto</h3>
            </div>
            <p style={{ fontSize: '13px', opacity: 0.8, lineHeight: 1.6 }}>
              Tempat terbaik menikmati seduhan kopi racikan Barista profesional & santapan makanan khas berkualitas.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#FDE68A', marginBottom: '14px' }}>Jam Operasional & WiFi</h4>
            <div style={{ fontSize: '13px', opacity: 0.8, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={16} /> Senin - Minggu: 08:00 - 22:00 WIB</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Wifi size={16} /> Free WiFi: CoffeeShop_Resto (Pass: kopi123)</span>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#FDE68A', marginBottom: '14px' }}>Lokasi & Kontak</h4>
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
