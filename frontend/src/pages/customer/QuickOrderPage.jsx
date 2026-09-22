import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coffee, ShoppingBag, Plus, Check, Send, MapPin, X, Snowflake, AlertTriangle, Search, ChevronUp, ChevronDown, Trash2, ArrowRight, Home } from 'lucide-react';
import { productService, categoryService, orderService, tableService } from '../../services/api';
import FastImage from '../../components/common/FastImage';
import { preloadProductImages } from '../../utils/imagePreloader';

export default function QuickOrderPage() {
  const navigate = useNavigate();
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
  
  // Cart state initialized from session/local storage (preserved during SPA navigation)
  const [cart, setCart] = useState(() => {
    try {
      const isReload =
        (window.performance &&
          window.performance.getEntriesByType &&
          window.performance.getEntriesByType('navigation')[0]?.type === 'reload') ||
        window.performance?.navigation?.type === 1;

      if (isReload) {
        sessionStorage.removeItem('checkout_cart');
        localStorage.removeItem('checkout_cart');
        return [];
      }

      const saved = sessionStorage.getItem('checkout_cart') || localStorage.getItem('checkout_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync cart changes to storage
  useEffect(() => {
    try {
      if (cart.length > 0) {
        sessionStorage.setItem('checkout_cart', JSON.stringify(cart));
        localStorage.setItem('checkout_cart', JSON.stringify(cart));
      } else {
        sessionStorage.removeItem('checkout_cart');
        localStorage.removeItem('checkout_cart');
      }
    } catch (err) {
      console.error('Gagal menyimpan cart:', err);
    }
  }, [cart]);

  // Clear cart when user reloads / refreshes page
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.removeItem('checkout_cart');
      localStorage.removeItem('checkout_cart');
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

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
      return sessionStorage.getItem('current_table_number') || localStorage.getItem('current_table_number') || '';
    } catch {
      return '';
    }
  });
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [variantProduct, setVariantProduct] = useState(null);
  const [isCartExpanded, setIsCartExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Real-time draggable bottom sheet state (Flutter-like modal bottom sheet gesture)
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartYRef = React.useRef(0);

  const startDrag = (clientY) => {
    dragStartYRef.current = clientY;
    setIsDragging(true);
  };

  const moveDrag = (clientY, isExpanded) => {
    if (!dragStartYRef.current) return;
    const delta = clientY - dragStartYRef.current;
    if (isExpanded) {
      if (delta > 0) setDragY(delta);
    } else {
      if (delta < 0) setDragY(delta);
    }
  };

  const endDrag = (isExpanded) => {
    setIsDragging(false);
    if (isExpanded) {
      if (dragY > 60) {
        setIsCartExpanded(false);
      }
    } else {
      if (dragY < -40) {
        setIsCartExpanded(true);
      }
    }
    setDragY(0);
    dragStartYRef.current = 0;
  };

  useEffect(() => {
    document.title = 'Quick Order Customer - Resto & Cafe';
    const params = new URLSearchParams(window.location.search);
    const rawParam = params.get('table') || params.get('table_number') || params.get('meja') || params.get('token');
    if (rawParam) {
      let resolved = rawParam;
      if (rawParam.startsWith('tbl-')) {
        const found = tables.find((t) => t.qr_code_token === rawParam);
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
  }, [tables]);

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

        preloadProductImages(prodData);
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
      addToCartWithVariant(product, 'Panas', product.hot_name || null, product.hot_price, product.hot_image || product.image);
    } else if (tempType === 'ice_only') {
      addToCartWithVariant(product, 'Dingin', product.ice_name || null, product.ice_price, product.ice_image || product.image);
    } else {
      addToCartWithVariant(product, null, null, product.price, product.image);
    }
  };

  const addToCartWithVariant = (product, variantType, customName, customPrice, customImage) => {
    const finalName = customName || (variantType ? `${product.name} (${variantType})` : product.name);
    const finalPrice = customPrice != null && customPrice !== '' ? Number(customPrice) : Number(product.price);
    const finalImage = customImage || product.image || (variantType === 'Panas' ? product.hot_image : variantType === 'Dingin' ? product.ice_image : null);

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
      } else {
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
      }
    });
  };

  const updateCartQuantity = (productId, variantType, delta) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.product_id === productId && item.variant_type === variantType) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
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
          padding: '12px 16px',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}
      >
        <div className="quickorder-container" style={{ margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <div style={{ width: '36px', height: '36px', minWidth: '36px', background: 'linear-gradient(135deg, #7C4012, #D97706)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Coffee size={18} />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <h1 style={{ fontSize: '15px', fontWeight: 800, color: '#2D1A10', margin: 0, whiteSpace: 'nowrap' }}>
                Quick Order
              </h1>
              <span style={{ fontSize: '11px', color: '#7A695C', fontWeight: 600, display: 'block', whiteSpace: 'nowrap' }}>
                Pesan Cepat Resto
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => navigate('/web')}
              style={{
                background: '#FAF6F0',
                color: '#7C4012',
                padding: '6px 10px',
                borderRadius: '16px',
                border: '1px solid #E8DFD5',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                whiteSpace: 'nowrap'
              }}
            >
              <Home size={13} />
              Web Resto
            </button>

            <button
              type="button"
              onClick={() => setIsTableModalOpen(true)}
              style={{
                background: tableNumber ? '#F4ECE1' : 'linear-gradient(135deg, #7C4012, #D97706)',
                color: tableNumber ? '#7C4012' : '#FFFFFF',
                padding: '6px 12px',
                borderRadius: '16px',
                border: tableNumber ? '1px solid #E8DFD5' : 'none',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                whiteSpace: 'nowrap'
              }}
            >
              <MapPin size={13} />
              {tableNumber ? tableNumber : 'Pilih Meja'}
            </button>
          </div>
        </div>
      </header>

      <main className="quickorder-container" style={{ margin: '0 auto', padding: '16px' }}>
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
        <div className="quickorder-products-grid" style={{ display: 'grid', gap: '14px' }}>
          {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              onClick={() => handleProductClick(prod)}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E8DFD5',
                borderRadius: '14px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                cursor: prod.is_available ? 'pointer' : 'not-allowed',
                opacity: prod.is_available ? 1 : 0.6
              }}
            >
              <FastImage src={prod.image} alt={prod.name} style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '10px', marginBottom: '8px' }} />

              <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#2D1A10', margin: '0 0 2px 0' }}>
                {prod.name}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#7C4012' }}>
                  Rp {Number(prod.price).toLocaleString('id-ID')}
                </span>
                <button type="button" style={{ background: '#7C4012', color: '#FFF', border: 'none', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Plus size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Floating Cart Bar & Cart Detail Drawer */}
      {cart.length > 0 && (
        <>
          {/* Expanded Cart Overlay/Drawer */}
          {isCartExpanded && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(45, 26, 16, 0.4)',
                backdropFilter: 'blur(3px)',
                zIndex: 90,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                transition: 'background-color 0.2s ease'
              }}
              onClick={() => setIsCartExpanded(false)}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                onTouchStart={(e) => startDrag(e.touches[0].clientY)}
                onTouchMove={(e) => moveDrag(e.touches[0].clientY, true)}
                onTouchEnd={() => endDrag(true)}
                onMouseDown={(e) => startDrag(e.clientY)}
                onMouseMove={(e) => isDragging && moveDrag(e.clientY, true)}
                onMouseUp={() => endDrag(true)}
                style={{
                  background: '#FFFFFF',
                  borderTopLeftRadius: '24px',
                  borderTopRightRadius: '24px',
                  padding: '12px 20px 20px 20px',
                  maxWidth: '600px',
                  width: '100%',
                  margin: '0 auto',
                  boxShadow: '0 -10px 30px rgba(0,0,0,0.15)',
                  maxHeight: '70vh',
                  display: 'flex',
                  flexDirection: 'column',
                  touchAction: 'none',
                  transform: dragY > 0 ? `translateY(${dragY}px)` : 'translateY(0)',
                  transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)'
                }}
              >
                {/* Drag Handle Indicator */}
                <div 
                  style={{ 
                    width: '44px', 
                    height: '5px', 
                    background: '#D9C8B4', 
                    borderRadius: '4px', 
                    margin: '0 auto 12px auto',
                    cursor: 'grab'
                  }} 
                />

                {/* Header Drawer */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #E8DFD5' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShoppingBag size={20} style={{ color: '#7C4012' }} />
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#2D1A10', margin: 0 }}>
                      Detail Keranjang ({cart.reduce((a, b) => a + b.quantity, 0)})
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCartExpanded(false)}
                    style={{ background: '#F4ECE1', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', color: '#7C4012', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Item List */}
                <div style={{ overflowY: 'auto', flex: 1, paddingRight: '4px', display: 'flex', flexDirection: 'column', gap: '12px', touchAction: 'pan-y' }}>
                  {cart.map((item, idx) => (
                    <div
                      key={`${item.product_id}-${item.variant_type || 'default'}-${idx}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justify: 'space-between',
                        background: '#FAF6F0',
                        padding: '12px 14px',
                        borderRadius: '14px',
                        border: '1px solid #E8DFD5'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, paddingRight: '12px' }}>
                        <FastImage src={item.image} alt={item.name} style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover' }} />
                        <div>
                          <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#2D1A10', margin: '0 0 4px 0' }}>
                            {item.name}
                          </h4>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#7C4012' }}>
                            Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>

                      {/* Qty Controls */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FFFFFF', padding: '4px 8px', borderRadius: '20px', border: '1px solid #E8DFD5' }}>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.product_id, item.variant_type, -1)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: item.quantity === 1 ? '#EF4444' : '#7C4012',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '2px'
                          }}
                        >
                          {item.quantity === 1 ? <Trash2 size={15} /> : <span style={{ fontSize: '16px', fontWeight: 800, lineHeight: 1 }}>-</span>}
                        </button>

                        <span style={{ fontSize: '13px', fontWeight: 800, color: '#2D1A10', minWidth: '20px', textAlign: 'center' }}>
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.product_id, item.variant_type, 1)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#7C4012',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '2px'
                          }}
                        >
                          <Plus size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #E8DFD5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#7A695C' }}>Total Pembayaran</span>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: '#7C4012' }}>
                    Rp {totalAmount.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Sticky Bottom Bar */}
          <div 
            onTouchStart={(e) => startDrag(e.touches[0].clientY)}
            onTouchMove={(e) => moveDrag(e.touches[0].clientY, false)}
            onTouchEnd={() => endDrag(false)}
            onMouseDown={(e) => startDrag(e.clientY)}
            onMouseMove={(e) => isDragging && moveDrag(e.clientY, false)}
            onMouseUp={() => endDrag(false)}
            style={{ 
              position: 'fixed', 
              bottom: 0, 
              left: 0, 
              right: 0, 
              background: '#FFFFFF', 
              borderTop: '1.5px solid #E8DFD5', 
              padding: '10px 20px 14px 20px', 
              boxShadow: '0 -8px 24px rgba(0,0,0,0.1)', 
              zIndex: 100, 
              touchAction: 'none',
              transform: dragY < 0 ? `translateY(${dragY}px)` : 'translateY(0)',
              transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)'
            }}
          >
            {/* Drag Pill for Bottom Bar */}
            <div 
              style={{ 
                width: '40px', 
                height: '4px', 
                background: '#D9C8B4', 
                borderRadius: '4px', 
                margin: '0 auto 8px auto',
                cursor: 'grab'
              }} 
              onClick={() => setIsCartExpanded(!isCartExpanded)}
            />
            <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div
                onClick={() => setIsCartExpanded(!isCartExpanded)}
                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '2px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <strong style={{ fontSize: '14px', color: '#2D1A10', fontWeight: 800 }}>
                    {cart.reduce((a, b) => a + b.quantity, 0)} Item Keranjang
                  </strong>
                  <button
                    type="button"
                    style={{
                      background: '#F4ECE1',
                      border: 'none',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#7C4012',
                      cursor: 'pointer'
                    }}
                  >
                    {isCartExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                  </button>
                </div>
                <span style={{ fontSize: '14px', color: '#7C4012', fontWeight: 800 }}>
                  Rp {totalAmount.toLocaleString('id-ID')}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (cart.length === 0) return;
                  localStorage.setItem('checkout_cart', JSON.stringify(cart));
                  localStorage.setItem('checkout_table', tableNumber || '');
                  navigate('/checkout');
                }}
                style={{
                  background: 'linear-gradient(135deg, #7C4012, #D97706)',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(124, 64, 18, 0.25)'
                }}
              >
                Checkout <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </>
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
                disabled={variantProduct.hot_available === false}
                onClick={() => {
                  if (variantProduct.hot_available !== false) {
                    addToCartWithVariant(variantProduct, 'Panas', variantProduct.hot_name || null, variantProduct.hot_price, variantProduct.hot_image || variantProduct.image);
                    setVariantProduct(null);
                  }
                }}
                style={{
                  padding: '12px 8px',
                  borderRadius: '14px',
                  border: '1.5px solid #FED7AA',
                  background: variantProduct.hot_available === false ? '#F3F4F6' : '#FFF8F0',
                  color: variantProduct.hot_available === false ? '#9CA3AF' : '#9A3412',
                  fontWeight: 800,
                  fontSize: '12px',
                  cursor: variantProduct.hot_available === false ? 'not-allowed' : 'pointer',
                  opacity: variantProduct.hot_available === false ? 0.6 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {variantProduct.hot_image ? <FastImage src={variantProduct.hot_image} alt="Hot" style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover' }} /> : <Coffee size={24} style={{ color: variantProduct.hot_available === false ? '#9CA3AF' : '#EA580C' }} />}
                <span>{variantProduct.hot_name || 'Panas (Hot)'}</span>
                <span style={{ fontSize: '11px', color: variantProduct.hot_available === false ? '#EF4444' : '#EA580C', fontWeight: 700 }}>
                  {variantProduct.hot_available === false ? 'Stok Habis' : `Rp ${Number(variantProduct.hot_price || variantProduct.price).toLocaleString('id-ID')}`}
                </span>
              </button>

              <button
                type="button"
                disabled={variantProduct.ice_available === false}
                onClick={() => {
                  if (variantProduct.ice_available !== false) {
                    addToCartWithVariant(variantProduct, 'Dingin', variantProduct.ice_name || null, variantProduct.ice_price, variantProduct.ice_image || variantProduct.image);
                    setVariantProduct(null);
                  }
                }}
                style={{
                  padding: '12px 8px',
                  borderRadius: '14px',
                  border: '1.5px solid #BAE6FD',
                  background: variantProduct.ice_available === false ? '#F3F4F6' : '#F0F9FF',
                  color: variantProduct.ice_available === false ? '#9CA3AF' : '#0369A1',
                  fontWeight: 800,
                  fontSize: '12px',
                  cursor: variantProduct.ice_available === false ? 'not-allowed' : 'pointer',
                  opacity: variantProduct.ice_available === false ? 0.6 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {variantProduct.ice_image ? <FastImage src={variantProduct.ice_image} alt="Ice" style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover' }} /> : <Snowflake size={24} style={{ color: variantProduct.ice_available === false ? '#9CA3AF' : '#0284C7' }} />}
                <span>{variantProduct.ice_name || 'Dingin (Ice)'}</span>
                <span style={{ fontSize: '11px', color: variantProduct.ice_available === false ? '#EF4444' : '#EF4444' ? '#0284C7' : '#0284C7', fontWeight: 700 }}>
                  {variantProduct.ice_available === false ? 'Stok Habis' : `Rp ${Number(variantProduct.ice_price || variantProduct.price).toLocaleString('id-ID')}`}
                </span>
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
