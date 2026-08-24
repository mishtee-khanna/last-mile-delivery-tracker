import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/orders');
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const triggerAutoAssign = async (id) => {
    try {
      await axios.post(`http://localhost:5000/api/admin/orders/${id}/assign`, {});
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to auto-assign');
    }
  };

  return (
    <div className="container fade-in">
      <h2>Admin Dashboard</h2>
      <div className="glass-card" style={{ marginTop: '2rem', overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Pickup Zone</th>
              <th>Agent</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}>
                <td>#{o.id}</td>
                <td>{o.customer?.name}</td>
                <td><span className={`badge badge-${o.status}`}>{o.status}</span></td>
                <td>{o.pickup_zone_id}</td>
                <td>{o.agent ? o.agent.name : 'None'}</td>
                <td>
                  {o.status === 'PENDING' && (
                    <button className="btn btn-accent" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }} onClick={() => triggerAutoAssign(o.id)}>
                      Auto-Assign
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
