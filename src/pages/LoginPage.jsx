import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

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
            <div className="form-row" style={{ textAlign: 'left' }}>
              <label htmlFor="email">Email address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="mwimantwaliblaise@gmail.com"
                required
              />
            </div>

            <div className="form-row" style={{ textAlign: 'left' }}>
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

            <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '10px' }}>
              Log in
            </button>
          </form>

          <p className="form-note" style={{ textAlign: 'center', marginTop: '24px' }}>
            New here? <Link to="/register">Sign up for an account</Link>
          </p>
        </div>
      </div>
    </main>
  );
};
