import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, ShieldCheck, User, LogOut, LayoutDashboard } from 'lucide-react';

export const Header = () => {
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className={`site-header ${mobileOpen ? 'open' : ''}`}>
      <div className="wrap">
        <Link to="/" className="logo" onClick={closeMobile}>
          <span className="mark">🇷🇼</span>
          <span className="for">For</span>
          <span className="local">Local</span>
        </Link>

        <nav className="nav-links">
          <Link to="/" className={isActive('/') ? 'active' : ''}>Home</Link>
          <Link to="/hosts" className={isActive('/hosts') ? 'active' : ''}>Browse hosts</Link>
          <Link to="/how-it-works" className={isActive('/how-it-works') ? 'active' : ''}>How it works</Link>
          <Link to="/become-host" className={isActive('/become-host') ? 'active' : ''}>Become a host</Link>
          <Link to="/safety" className={isActive('/safety') ? 'active' : ''}>Safety</Link>
          <Link to="/contact" className={isActive('/contact') ? 'active' : ''}>Contact</Link>
        </nav>

        <div className="nav-actions">
          {user ? (
            <>
              <span className="nav-hello">Hi, <strong>{user.full_name.split(' ')[0]}</strong></span>
              {isAdmin && (
                <Link to="/admin" className="btn btn-ghost btn-sm">
                  <LayoutDashboard size={16} /> Admin
                </Link>
              )}
              <button onClick={logout} className="btn btn-ghost btn-sm" title="Log out">
                <LogOut size={16} /> Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Log in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign up</Link>
            </>
          )}
        </div>

        <button className="nav-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle navigation">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="mobile-panel">
          <Link to="/" onClick={closeMobile}>Home</Link>
          <Link to="/hosts" onClick={closeMobile}>Browse hosts</Link>
          <Link to="/how-it-works" onClick={closeMobile}>How it works</Link>
          <Link to="/become-host" onClick={closeMobile}>Become a host</Link>
          <Link to="/safety" onClick={closeMobile}>Safety &amp; Trust</Link>
          <Link to="/contact" onClick={closeMobile}>Contact</Link>
          <Link to="/about" onClick={closeMobile}>About Us</Link>
          
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {user ? (
              <>
                <div className="nav-hello">Logged in as <strong>{user.full_name}</strong> ({user.role})</div>
                {isAdmin && (
                  <Link to="/admin" className="btn btn-ghost btn-block" onClick={closeMobile}>Admin Dashboard</Link>
                )}
                <button onClick={() => { logout(); closeMobile(); }} className="btn btn-ghost btn-block">Log out</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-block" onClick={closeMobile}>Log in</Link>
                <Link to="/register" className="btn btn-primary btn-block" onClick={closeMobile}>Sign up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
