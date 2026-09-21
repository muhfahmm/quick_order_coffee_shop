import React, { useState, useEffect } from 'react';
import { Coffee, ShoppingBag, Plus, Check, Sparkles, Send } from 'lucide-react';
import { productService, categoryService, orderService } from '../../services/api';

export default function MenuPage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('Meja 01');
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
        const [resProd, resCat] = await Promise.all([
          productService.getAll(),
          categoryService.getAll()
        ]);
        setProducts(resProd.data.data || []);
        setCategories(resCat.data.data || []);
      } catch (err) {
        console.error('Gagal memuat menu customer:', err);
      }
    };

    fetchMenuData();
  }, []);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product_id === product.id);

      if (existing) {
        return prevCart.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...prevCart,
        {
          product_id: product.id,
          name: product.name,
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
        table_number: tableNumber,
        items: cart.map((it) => ({
          product_id: it.product_id,
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

          <div
            style={{
              background: '#F4ECE1',
              padding: '6px 14px',
              borderRadius: '20px',
              border: '1px solid #E8DFD5',
              fontSize: '13px',
              fontWeight: 700,
              color: '#7C4012'
            }}
          >
            {tableNumber}
          </div>
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

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '20px'
          }}
        >
          {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E8DFD5',
                borderRadius: '18px',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 2px 6px rgba(45, 26, 16, 0.03)'
              }}
            >
              <div>
                {prod.image && (
                  <img
                    src={prod.image}
                    alt={prod.name}
                    style={{
                      width: '100%',
                      height: '140px',
                      objectFit: 'cover',
                      borderRadius: '12px',
                      marginBottom: '12px'
                    }}
                  />
                )}

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px'
                  }}
                >

                  <span
                    style={{
                      fontSize: '11px',
                      background: '#F4ECE1',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      color: '#7C4012',
                      fontWeight: 700
                    }}
                  >
                    {prod.category?.name || 'Menu'}
                  </span>

                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: prod.is_available ? '#059669' : '#DC2626'
                    }}
                  >
                    {prod.is_available ? 'Tersedia' : 'Habis'}
                  </span>
                </div>

                <h3
                  style={{
                    fontSize: '16px',
                    fontWeight: 800,
                    color: '#2D1A10',
                    marginBottom: '4px'
                  }}
                >
                  {prod.name}
                </h3>

                <p
                  style={{
                    fontSize: '12px',
                    color: '#7A695C',
                    minHeight: '36px',
                    marginBottom: '12px'
                  }}
                >
                  {prod.description || 'Sajian kopi nikmat khas kedai.'}
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '12px',
                  borderTop: '1px solid #F0E8E1'
                }}
              >
                <span
                  style={{
                    fontSize: '15px',
                    fontWeight: 800,
                    color: '#7C4012'
                  }}
                >
                  Rp {Number(prod.price).toLocaleString('id-ID')}
                </span>

                <button
                  disabled={!prod.is_available}
                  onClick={() => addToCart(prod)}
                  style={{
                    background: prod.is_available ? '#7C4012' : '#D3C4B5',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: prod.is_available ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Plus size={14} /> Tambah
                </button>
              </div>
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
    </div>
  );
}