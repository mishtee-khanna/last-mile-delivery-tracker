import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../AuthContext';

const Login = () => {
  const { login } = useContext(AuthContext);
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'CUSTOMER' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegister) {
        await axios.post('/api/auth/register', formData);
        setIsRegister(false); // Switch to login
      } else {
        const res = await axios.post('/api/auth/login', { email: formData.email, password: formData.password });
        login(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass-card fade-in" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', color: 'var(--primary)' }}>{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
        
        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="input-group">
              <label>Name</label>
              <input className="input-field" type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>
          )}
          <div className="input-group">
            <label>Email</label>
            <input className="input-field" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input className="input-field" type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
          </div>
          {isRegister && (
            <div className="input-group">
              <label>Role</label>
              <select className="input-field" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                <option value="CUSTOMER">Customer</option>
                <option value="AGENT">Delivery Agent</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          )}
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            {isRegister ? 'Sign Up' : 'Log In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
