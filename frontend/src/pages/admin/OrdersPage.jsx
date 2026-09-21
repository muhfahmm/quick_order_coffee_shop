import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, AlertCircle, RefreshCw, ChevronRight, Inbox } from 'lucide-react';
import { orderService } from '../../services/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const res = await orderService.getAll();
      setOrders(res.data.data || []);
    } catch (err) {
      console.error('Gagal mengambil data pesanan dari database:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    try {
      await orderService.updateStatus(orderId, newStatus);
      fetchOrders();
    } catch (err) {
      console.error('Gagal memperbarui status pesanan:', err);
      alert('Gagal memperbarui status pesanan');
    }
  };

  return (
    <div className="orders-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Live Orders Board (Dapur & Kasir)</h1>
          <p className="page-subtitle">Pantau dan perbarui status masakan pesanan customer secara real-time dari database MySQL (`tb_orders`)</p>
        </div>
        <button onClick={fetchOrders} className="btn-action-primary">
          <RefreshCw size={16} /> Refresh Data
        </button>
      </div>

      <div className="orders-kanban-board">
        <div className="kanban-column">
          <div className="column-header status-pending">
            <h3><AlertCircle size={18} /> Pesanan Baru (Pending)</h3>
            <span className="count-badge">{orders.filter(o => o.status === 'pending').length}</span>
          </div>
          <div className="column-content">
            {orders.filter(o => o.status === 'pending').length > 0 ? (
              orders.filter(o => o.status === 'pending').map(order => (
                <div key={order.id} className="order-kanban-card">
                  <div className="card-top">
                    <span className="order-id">{order.order_code}</span>
                    <span className="table-badge">{order.table_number || 'General'}</span>
                  </div>
                  <div className="customer-info">
                    <strong>{order.customer_name}</strong>
                    {order.items && order.items.length > 0 && (
                      <ul className="text-xs text-slate-400 mt-2 space-y-1">
                        {order.items.map((it, idx) => (
                          <li key={idx}>• {it.quantity}x {it.product_name} {it.variant_type ? `(${it.variant_type})` : ''}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="card-bottom">
                    <span className="order-total">Rp {Number(order.total_amount).toLocaleString('id-ID')}</span>
                    <button onClick={() => updateStatus(order.id, 'processing')} className="btn-step-next">
                      Proses Ke Dapur <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <Inbox size={24} />
                <p>Tidak ada pesanan pending</p>
              </div>
            )}
          </div>
        </div>

        <div className="kanban-column">
          <div className="column-header status-processing">
            <h3><Clock size={18} /> Sedang Disiapkan (Cooking)</h3>
            <span className="count-badge">{orders.filter(o => o.status === 'processing').length}</span>
          </div>
          <div className="column-content">
            {orders.filter(o => o.status === 'processing').length > 0 ? (
              orders.filter(o => o.status === 'processing').map(order => (
                <div key={order.id} className="order-kanban-card">
                  <div className="card-top">
                    <span className="order-id">{order.order_code}</span>
                    <span className="table-badge">{order.table_number || 'General'}</span>
                  </div>
                  <div className="customer-info">
                    <strong>{order.customer_name}</strong>
                    {order.items && order.items.length > 0 && (
                      <ul className="text-xs text-slate-400 mt-2 space-y-1">
                        {order.items.map((it, idx) => (
                          <li key={idx}>• {it.quantity}x {it.product_name} {it.variant_type ? `(${it.variant_type})` : ''}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="card-bottom">
                    <span className="order-total">Rp {Number(order.total_amount).toLocaleString('id-ID')}</span>
                    <button onClick={() => updateStatus(order.id, 'completed')} className="btn-step-complete">
                      Selesai & Antar <CheckCircle2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <Inbox size={24} />
                <p>Tidak ada pesanan sedang dimasak</p>
              </div>
            )}
          </div>
        </div>

        <div className="kanban-column">
          <div className="column-header status-completed">
            <h3><CheckCircle2 size={18} /> Selesai / Diantar</h3>
            <span className="count-badge">{orders.filter(o => o.status === 'completed').length}</span>
          </div>
          <div className="column-content">
            {orders.filter(o => o.status === 'completed').length > 0 ? (
              orders.filter(o => o.status === 'completed').map(order => (
                <div key={order.id} className="order-kanban-card completed-card">
                  <div className="card-top">
                    <span className="order-id">{order.order_code}</span>
                    <span className="table-badge">{order.table_number || 'General'}</span>
                  </div>
                  <div className="customer-info">
                    <strong>{order.customer_name}</strong>
                  </div>
                  <div className="card-bottom">
                    <span className="status-done-tag">Selesai</span>
                    <span className="order-total font-semibold">Rp {Number(order.total_amount).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <Inbox size={24} />
                <p>Belum ada pesanan selesai</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
