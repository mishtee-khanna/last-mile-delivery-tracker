import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AgentDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [currentZoneId, setCurrentZoneId] = useState(1);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/agent/orders');
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/agent/orders/${id}/status`, { status });
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status');
    }
  };

  const updateLocation = async () => {
    try {
      await axios.put('http://localhost:5000/api/agent/location', { current_zone_id: currentZoneId });
      alert("Location updated successfully.");
    } catch (err) {
      alert("Failed to update location.");
    }
  };

  return (
    <div className="container fade-in">
      <h2>Agent Dashboard</h2>
      
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h3>Current Location</h3>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '1rem' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <input type="number" className="input-field" value={currentZoneId} onChange={(e) => setCurrentZoneId(parseInt(e.target.value))} placeholder="Zone ID" />
          </div>
          <button className="btn btn-primary" onClick={updateLocation}>Update</button>
        </div>
      </div>

      <div className="glass-card" style={{ overflowX: 'auto' }}>
        <h3>My Deliveries</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Pickup</th>
              <th>Drop</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}>
                <td>#{o.id}</td>
                <td>{o.pickup_address}</td>
                <td>{o.drop_address}</td>
                <td><span className={`badge badge-${o.status}`}>{o.status}</span></td>
                <td>
                  <select className="input-field" style={{ padding: '0.4rem', fontSize: '0.8rem' }}
                    value={o.status}
                    onChange={(e) => updateStatus(o.id, e.target.value)}
                  >
                    <option value="ASSIGNED">Assigned</option>
                    <option value="PICKED_UP">Picked Up</option>
                    <option value="IN_TRANSIT">In Transit</option>
                    <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="FAILED">Failed</option>
                  </select>
                </td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan="5" style={{textAlign: 'center'}}>No assigned orders.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AgentDashboard;
