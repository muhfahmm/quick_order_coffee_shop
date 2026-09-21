import React, { useState, useEffect } from 'react';
import { Coffee, ShoppingBag, Plus, Check, Sparkles, Send, MapPin, X } from 'lucide-react';
import { productService, categoryService, orderService, tableService } from '../../services/api';

export default function MenuPage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [tables, setTables] = useState([]);
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
        setProducts(resProd.data.data || []);
        setCategories(resCat.data.data || []);
        setTables(resTbl.data.data || []);
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

  const addToCartWithVariant = (product, variantType) => {
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
          name: product.name,
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
      alert('Silakan pilih meja terlebih dahulu sebelum mengirim pesanan.');
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

  return (
    <div
      className="customer-menu-container"
      style={{
        background: '#FAF6F0',
        minHeight: '100vh',
        paddingBottom: '100px'
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
                Pemesanan Langsung Meja
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
          margin: '24px auto',
          padding: '0 20px'
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #3C2415, #7C4012)',
            borderRadius: '20px',
            padding: '24px',
            color: '#FFFFFF',
            marginBottom: '24px',
            boxShadow: '0 8px 20px rgba(60, 36, 21, 0.15)'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '6px'
            }}
          >
            <Sparkles size={18} style={{ color: '#FBBF24' }} />
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: '#FDE68A'
              }}
            >
              Selamat Datang
            </span>
          </div>

          <h2
            style={{
              fontSize: '22px',
              fontWeight: 800,
              color: '#FFFFFF',
              margin: 0
            }}
          >
            Nikmati Kopi & Sajian Terbaik Kami
          </h2>

          <p style={{ fontSize: '13px', opacity: 0.9, marginTop: '6px' }}>
            Pilih menu favorit Anda dan pesanan akan langsung diproses oleh tim
            bar / dapur kami.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '10px',
            overflowX: 'auto',
            paddingBottom: '12px',
            marginBottom: '20px'
          }}
        >
          <button
            onClick={() => setSelectedCategory('all')}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border:
                selectedCategory === 'all' ? 'none' : '1px solid #E8DFD5',
              background: selectedCategory === 'all' ? '#7C4012' : '#FFFFFF',
              color: selectedCategory === 'all' ? '#FFFFFF' : '#5C4333',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Semua Menu
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border:
                  selectedCategory === cat.id
                    ? 'none'
                    : '1px solid #E8DFD5',
                background:
                  selectedCategory === cat.id ? '#7C4012' : '#FFFFFF',
                color:
                  selectedCategory === cat.id ? '#FFFFFF' : '#5C4333',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>

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
              Pilih konsumsi yang Anda inginkan:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                type="button"
                onClick={() => {
                  addToCartWithVariant(variantProduct, 'Panas');
                  setVariantProduct(null);
                }}
                style={{
                  padding: '16px 12px',
                  borderRadius: '14px',
                  border: '1.5px solid #E8DFD5',
                  background: '#FFF8F0',
                  color: '#9A3412',
                  fontWeight: 800,
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ fontSize: '24px' }}>☕</span>
                <span>Panas (Hot)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  addToCartWithVariant(variantProduct, 'Dingin');
                  setVariantProduct(null);
                }}
                style={{
                  padding: '16px 12px',
                  borderRadius: '14px',
                  border: '1.5px solid #E8DFD5',
                  background: '#F0F9FF',
                  color: '#0369A1',
                  fontWeight: 800,
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ fontSize: '24px' }}>🧊</span>
                <span>Dingin (Ice)</span>
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
                marginBottom: '20px'
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