import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    const res = register(name, email, password);
    if (res.success) {
      navigate('/');
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
            <UserPlus size={20} color="var(--green-700)" /> Create your account
          </h3>

          {error && (
            <div style={{ color: '#b91c1c', background: '#fef2f2', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', fontWeight: '600' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <label htmlFor="name">Full name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="First and last name"
                required
              />
            </div>

            <div className="form-row">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@example.com"
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
                placeholder="At least 6 characters"
                minLength={6}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block">
              Sign up
            </button>
          </form>

          <p className="form-note" style={{ textAlign: 'center', marginTop: '18px' }}>
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </main>
  );
};
