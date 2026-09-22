import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coffee, MapPin, ArrowLeft, CreditCard, Send, Check, AlertTriangle, X, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { orderService, tableService } from '../../services/api';
import FastImage from '../../components/common/FastImage';

export default function CheckoutPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Checkout Pesanan | CoffeeShop Resto';
  }, []);

  // Get saved checkout state from storage (cleared on page reload)
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

  const updateCartQuantity = (productId, variantType, delta) => {
    setCart((prevCart) => {
      const updated = prevCart
        .map((item) => {
          if (item.product_id === productId && item.variant_type === variantType) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);

      sessionStorage.setItem('checkout_cart', JSON.stringify(updated));
      localStorage.setItem('checkout_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const [tableNumber, setTableNumber] = useState(() => {
    return localStorage.getItem('checkout_table') || '';
  });

  const [tables, setTables] = useState(() => {
    try {
      const cached = localStorage.getItem('cached_tables');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' | 'qris'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Validation modal state
  const [validationModal, setValidationModal] = useState({ isOpen: false, title: '', message: '' });
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const res = await tableService.getAll();
        const data = res.data.data || [];
        setTables(data);
        localStorage.setItem('cached_tables', JSON.stringify(data));
      } catch (err) {
        console.error('Gagal mengambil data meja:', err);
      }
    };
    if (tables.length === 0) fetchTables();
  }, []);

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (!customerName.trim() && !tableNumber) {
      setValidationModal({
        isOpen: true,
        title: 'Nama Pemesan & Meja Belum Diisi',
        message: 'Silakan masukkan Nama Pemesan Anda dan pilih Nomor Meja sebelum mengirim pesanan.'
      });
      return;
    }

    if (!customerName.trim()) {
      setValidationModal({
        isOpen: true,
        title: 'Nama Pemesan Belum Diisi',
        message: 'Silakan masukkan Nama Pemesan Anda terlebih dahulu.'
      });
      return;
    }

    if (!tableNumber) {
      setValidationModal({
        isOpen: true,
        title: 'Nomor Meja Belum Dipilih',
        message: 'Silakan pilih Nomor Meja tempat Anda duduk terlebih dahulu.'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await orderService.create({
        customer_name: customerName,
        table_number: tableNumber,
        payment_method: paymentMethod,
        items: cart.map((it) => ({
          product_id: it.product_id,
          variant_type: it.variant_type || null,
          quantity: it.quantity
        }))
      });

      setOrderSuccess(res.data.data);
      setCart([]);
      localStorage.removeItem('checkout_cart');
      localStorage.removeItem('checkout_table');
    } catch (err) {
      console.error('Gagal membuat pesanan:', err);
      alert(err.response?.data?.message || 'Gagal mengirim pesanan');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div style={{ background: '#FAF6F0', minHeight: '100vh', padding: '40px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#FFFFFF', borderRadius: '24px', padding: '30px 24px', maxWidth: '440px', width: '100%', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', border: '1px solid #E8DFD5' }}>
          <div style={{ width: '64px', height: '64px', background: '#ECFDF5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', color: '#059669' }}>
            <Check size={36} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#2D1A10', margin: '0 0 8px 0' }}>Pesanan Berhasil Dikirim!</h2>
          <p style={{ fontSize: '13px', color: '#7A695C', margin: '0 0 20px 0' }}>Silakan tunggu pesanan Anda diproses oleh staf barista kami.</p>

          <div style={{ background: '#FAF6F0', borderRadius: '16px', padding: '16px', border: '1px solid #E8DFD5', marginBottom: '24px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
              <span style={{ color: '#7A695C' }}>Kode Pesanan:</span>
              <strong style={{ color: '#7C4012' }}>{orderSuccess.order_code}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
              <span style={{ color: '#7A695C' }}>Nama Pemesan:</span>
              <strong style={{ color: '#2D1A10' }}>{orderSuccess.customer_name}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
              <span style={{ color: '#7A695C' }}>Nomor Meja:</span>
              <strong style={{ color: '#2D1A10' }}>{orderSuccess.table_number || tableNumber || '-'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: '#7A695C' }}>Metode Pembayaran:</span>
              <strong style={{ color: '#2D1A10', textTransform: 'uppercase' }}>{paymentMethod}</strong>
            </div>
          </div>

          <button
            onClick={() => navigate('/quick-order')}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #7C4012, #D97706)',
              color: '#FFFFFF',
              border: 'none',
              padding: '12px',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Kembali ke Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#FAF6F0', minHeight: '100vh', paddingBottom: '100px' }}>
      {/* Header */}
      <header style={{ background: '#FFFFFF', borderBottom: '1px solid #E8DFD5', padding: '14px 20px', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: '#F4ECE1', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C4012', cursor: 'pointer' }}
          >
            <ArrowLeft size={18} />
          </button>
          <h1 style={{ fontSize: '16px', fontWeight: 800, color: '#2D1A10', margin: 0 }}>Pembayaran & Checkout</h1>
          <div style={{ width: '36px' }} />
        </div>
      </header>

      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '16px' }}>
        {cart.length === 0 ? (
          <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '40px 20px', textAlign: 'center', border: '1px solid #E8DFD5', marginTop: '20px' }}>
            <AlertTriangle size={40} style={{ color: '#D97706', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#2D1A10', margin: '0 0 6px 0' }}>Keranjang Anda Kosong</h3>
            <p style={{ fontSize: '13px', color: '#7A695C', marginBottom: '20px' }}>Silakan pilih menu makanan / minuman terlebih dahulu.</p>
            <button
              onClick={() => navigate('/quick-order')}
              style={{ background: '#7C4012', color: '#FFF', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
            >
              Lihat Menu
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitOrder}>
            {/* Informasi Pemesan */}
            <div style={{ background: '#FFFFFF', borderRadius: '18px', padding: '16px', border: '1px solid #E8DFD5', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 800, color: '#2D1A10', margin: '0 0 12px 0' }}>Informasi Pemesan</h2>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#5C4333', marginBottom: '6px' }}>
                  Nama Pemesan *
                </label>
                <input
                  type="text"
                  placeholder="Masukkan nama lengkap / panggilan..."
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #E8DFD5',
                    outline: 'none',
                    fontSize: '13px',
                    background: '#FAF6F0',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#5C4333', marginBottom: '6px' }}>
                  Nomor Meja *
                </label>
                <div
                  onClick={() => setIsTableModalOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: tableNumber ? '#F4ECE1' : '#FFF8F0',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: tableNumber ? '1px solid #E8DFD5' : '1.5px solid #F59E0B',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={16} style={{ color: '#7C4012' }} />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: tableNumber ? '#2D1A10' : '#D97706' }}>
                      {tableNumber ? `Meja ${tableNumber}` : 'Klik untuk Pilih Meja'}
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#7C4012', fontWeight: 700, textDecoration: 'underline' }}>
                    {tableNumber ? 'Ubah' : 'Pilih'}
                  </span>
                </div>
              </div>
            </div>

            {/* Ringkasan Pesanan */}
            <div style={{ background: '#FFFFFF', borderRadius: '18px', padding: '16px', border: '1px solid #E8DFD5', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 800, color: '#2D1A10', margin: '0 0 12px 0' }}>Ringkasan Pesanan</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '14px' }}>
                {cart.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: idx === cart.length - 1 ? 'none' : '1px solid #F4ECE1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, paddingRight: '8px' }}>
                      <FastImage src={item.image} alt={item.name} style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' }} />
                      <div>
                        <strong style={{ fontSize: '13px', color: '#2D1A10', display: 'block' }}>{item.name}</strong>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#7C4012' }}>
                          Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>

                    {/* Quantity Controls (+ angka -) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FAF6F0', padding: '4px 8px', borderRadius: '20px', border: '1px solid #E8DFD5' }}>
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

                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#2D1A10', minWidth: '18px', textAlign: 'center' }}>
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

              {/* Tombol Pesan Yang Lain */}
              <button
                type="button"
                onClick={() => navigate('/quick-order')}
                style={{
                  width: '100%',
                  background: '#FFF8F0',
                  color: '#7C4012',
                  border: '1.5px dashed #7C4012',
                  padding: '10px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  marginBottom: '14px'
                }}
              >
                <Plus size={16} /> Pesan yang Lain
              </button>

              <div style={{ paddingTop: '12px', borderTop: '1.5px dashed #E8DFD5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#2D1A10' }}>Total Bayar</span>
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#7C4012' }}>
                  Rp {totalAmount.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Metode Pembayaran */}
            <div style={{ background: '#FFFFFF', borderRadius: '18px', padding: '16px', border: '1px solid #E8DFD5', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 800, color: '#2D1A10', margin: '0 0 12px 0' }}>Metode Pembayaran</h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    border: paymentMethod === 'cash' ? '2px solid #7C4012' : '1px solid #E8DFD5',
                    background: paymentMethod === 'cash' ? '#FFF8F0' : '#FFFFFF',
                    color: paymentMethod === 'cash' ? '#7C4012' : '#5C4333',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <CreditCard size={18} /> Cash / Kasir
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('qris')}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    border: paymentMethod === 'qris' ? '2px solid #7C4012' : '1px solid #E8DFD5',
                    background: paymentMethod === 'qris' ? '#FFF8F0' : '#FFFFFF',
                    color: paymentMethod === 'qris' ? '#7C4012' : '#5C4333',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <CreditCard size={18} /> QRIS / Digital
                </button>
              </div>
            </div>

            {/* Fixed Bottom Action Bar */}
            <div
              style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                background: '#FFFFFF',
                borderTop: '1.5px solid #E8DFD5',
                padding: '12px 20px',
                boxShadow: '0 -8px 24px rgba(0,0,0,0.1)',
                zIndex: 100
              }}
            >
              <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#7A695C', fontWeight: 600, display: 'block' }}>Total Bayar</span>
                  <strong style={{ fontSize: '17px', color: '#7C4012', fontWeight: 800 }}>
                    Rp {totalAmount.toLocaleString('id-ID')}
                  </strong>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    flex: 1,
                    maxWidth: '280px',
                    background: 'linear-gradient(135deg, #7C4012, #D97706)',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(124, 64, 18, 0.25)'
                  }}
                >
                  <Send size={16} /> {isSubmitting ? 'Mengirim...' : 'Bayar & Kirim Pesanan'}
                </button>
              </div>
            </div>
          </form>
        )}
      </main>

      {/* Validation Modal */}
      {validationModal.isOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(45, 26, 16, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', backdropFilter: 'blur(3px)' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '24px 20px', maxWidth: '380px', width: '100%', textAlign: 'center' }}>
            <div style={{ width: '50px', height: '50px', background: '#FEF3C7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px auto', color: '#D97706' }}>
              <AlertTriangle size={28} />
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#2D1A10', margin: '0 0 8px 0' }}>
              {validationModal.title}
            </h3>

            <p style={{ fontSize: '13px', color: '#7A695C', margin: '0 0 20px 0', lineHeight: 1.5 }}>
              {validationModal.message}
            </p>

            <button
              type="button"
              onClick={() => {
                setValidationModal({ isOpen: false, title: '', message: '' });
                if (!tableNumber && validationModal.title.includes('Meja')) {
                  setIsTableModalOpen(true);
                }
              }}
              style={{
                width: '100%',
                background: '#7C4012',
                color: '#FFFFFF',
                border: 'none',
                padding: '10px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Mengerti & Lengkapi
            </button>
          </div>
        </div>
      )}

      {/* Table Selection Modal */}
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
