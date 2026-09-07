import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, KeyRound } from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const res = login(email, password);
    if (res.success) {
      if (res.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
      setError(res.error);
    }
  };

  const fillAdminAndLogin = () => {
    setEmail('admin@for-local.rw');
    setPassword('adminpassword');
    const res = login('admin@for-local.rw', 'adminpassword');
    if (res.success) {
      navigate('/admin');
    }
  };

  const fillGuestAndLogin = () => {
    setEmail('sarah@example.com');
    setPassword('userpassword');
    const res = login('sarah@example.com', 'userpassword');
    if (res.success) {
      navigate('/');
    }
  };

  return (
    <main style={{ padding: '60px 0 100px' }}>
      <div className="wrap">
        <div className="form-card" style={{ maxWidth: '440px', margin: '0 auto', textAlign: 'center' }}>
          <img src="./logo.png" alt="For-Local Logo" style={{ height: '60px', objectFit: 'contain', marginBottom: '16px' }} />
          <h3 style={{ marginBottom: '20px', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LogIn size={20} color="var(--green-700)" /> Log in to For-Local
          </h3>

          {error && (
            <div style={{ color: '#b91c1c', background: '#fef2f2', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', fontWeight: '600' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="form-row">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block">
              Log in
            </button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid var(--line)' }}>
            <p className="form-note" style={{ fontWeight: '700', marginBottom: '8px' }}>⚡ Quick 1-Click Demo Login:</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={fillAdminAndLogin} className="btn btn-amber btn-sm" style={{ flex: 1 }}>
                Log in as Admin
              </button>
              <button onClick={fillGuestAndLogin} className="btn btn-ghost btn-sm" style={{ flex: 1 }}>
                Log in as Guest
              </button>
            </div>
          </div>

          <p className="form-note" style={{ textAlign: 'center', marginTop: '18px' }}>
            New here? <Link to="/register">Sign up</Link>
          </p>
        </div>
      </div>
    </main>
  );
};
