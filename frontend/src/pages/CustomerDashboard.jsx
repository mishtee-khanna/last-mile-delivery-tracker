import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CustomerDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [quote, setQuote] = useState(null);
  const [formData, setFormData] = useState({
    pickup_address: '', pickup_zone_id: 1, drop_address: '', drop_zone_id: 2,
    length: 10, width: 10, height: 10, weight: 1, order_type: 'B2C', payment_type: 'PREPAID'
  });

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/customer/orders');
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleQuote = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/customer/quote', formData);
      setQuote(res.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to get quote');
    }
  };

  const handleSubmitOrder = async () => {
    try {
      await axios.post('http://localhost:5000/api/customer/orders', formData);
      setShowOrderForm(false);
      setQuote(null);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to place order');
    }
  };

  return (
    <div className="container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>My Orders</h2>
        <button className="btn btn-primary" onClick={() => setShowOrderForm(!showOrderForm)}>
          {showOrderForm ? 'Cancel' : 'Create New Order'}
        </button>
      </div>

      {showOrderForm && (
        <div className="glass-card" style={{ marginTop: '2rem' }}>
          <h3>Place Order</h3>
          <div className="grid">
            <div className="input-group">
              <label>Pickup Address</label>
              <input className="input-field" value={formData.pickup_address} onChange={e => setFormData({...formData, pickup_address: e.target.value})} />
            </div>
            <div className="input-group">
              <label>Pickup Zone ID</label>
              <input className="input-field" type="number" value={formData.pickup_zone_id} onChange={e => setFormData({...formData, pickup_zone_id: parseInt(e.target.value)})} />
            </div>
            <div className="input-group">
              <label>Drop Address</label>
              <input className="input-field" value={formData.drop_address} onChange={e => setFormData({...formData, drop_address: e.target.value})} />
            </div>
            <div className="input-group">
              <label>Drop Zone ID</label>
              <input className="input-field" type="number" value={formData.drop_zone_id} onChange={e => setFormData({...formData, drop_zone_id: parseInt(e.target.value)})} />
            </div>
            <div className="input-group">
              <label>Length (cm)</label>
              <input className="input-field" type="number" value={formData.length} onChange={e => setFormData({...formData, length: parseFloat(e.target.value)})} />
            </div>
            <div className="input-group">
              <label>Width (cm)</label>
              <input className="input-field" type="number" value={formData.width} onChange={e => setFormData({...formData, width: parseFloat(e.target.value)})} />
            </div>
            <div className="input-group">
              <label>Height (cm)</label>
              <input className="input-field" type="number" value={formData.height} onChange={e => setFormData({...formData, height: parseFloat(e.target.value)})} />
            </div>
            <div className="input-group">
              <label>Weight (kg)</label>
              <input className="input-field" type="number" value={formData.weight} onChange={e => setFormData({...formData, weight: parseFloat(e.target.value)})} />
            </div>
            <div className="input-group">
              <label>Order Type</label>
              <select className="input-field" value={formData.order_type} onChange={e => setFormData({...formData, order_type: e.target.value})}>
                <option value="B2B">B2B</option>
                <option value="B2C">B2C</option>
              </select>
            </div>
            <div className="input-group">
              <label>Payment Type</label>
              <select className="input-field" value={formData.payment_type} onChange={e => setFormData({...formData, payment_type: e.target.value})}>
                <option value="PREPAID">Prepaid</option>
                <option value="COD">COD</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button className="btn btn-accent" onClick={handleQuote}>Get Quote</button>
            {quote && (
              <button className="btn btn-primary" onClick={handleSubmitOrder}>
                Confirm Order (${quote.charge})
              </button>
            )}
          </div>
          {quote && (
            <div style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
              Billable Weight: {quote.calculated_weight}kg | COD Surcharge: ${quote.cod_surcharge_applied}
            </div>
          )}
        </div>
      )}

      <div className="glass-card" style={{ marginTop: '2rem', overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>From</th>
              <th>To</th>
              <th>Charge</th>
              <th>Status</th>
              <th>Agent</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}>
                <td>#{o.id}</td>
                <td>{o.pickup_address}</td>
                <td>{o.drop_address}</td>
                <td>${o.charge}</td>
                <td><span className={`badge badge-${o.status}`}>{o.status}</span></td>
                <td>{o.agent ? o.agent.name : 'Unassigned'}</td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan="6" style={{textAlign: 'center'}}>No orders found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerDashboard;
