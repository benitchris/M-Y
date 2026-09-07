import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer>
      <div className="wrap">
        <div>
          <div style={{ marginBottom: '14px' }}>
            <img src="./logo.png" alt="For-Local Rwanda" style={{ height: '46px', objectFit: 'contain', background: '#fff', padding: '6px 12px', borderRadius: '10px' }} />
          </div>
          <p style={{ color: '#afd1c2', fontSize: '14px', maxWidth: '300px' }}>
            Connecting Rwanda's visitors with vetted local hosts for orientation, translation, and authentic experiences.
          </p>
        </div>

        <div>
          <h4>Explore</h4>
          <Link to="/hosts">Browse hosts</Link>
          <Link to="/hosts?city=kigali">Kigali hosts</Link>
          <Link to="/hosts?city=musanze">Musanze (Volcanoes)</Link>
          <Link to="/hosts?city=huye">Huye hosts</Link>
        </div>

        <div>
          <h4>Platform</h4>
          <Link to="/how-it-works">How it works</Link>
          <Link to="/become-host">Become a host</Link>
          <Link to="/safety">Safety &amp; trust</Link>
          <Link to="/about">About us</Link>
        </div>

        <div>
          <h4>Support &amp; Account</h4>
          <Link to="/contact">Contact support</Link>
          <a href="tel:+250782704033" style={{ color: '#afd1c2', fontSize: '13px', display: 'block', margin: '4px 0' }}>📞 +250 782 704 033</a>
          <a href="mailto:info@forlocalltd.com" style={{ color: '#afd1c2', fontSize: '13px', display: 'block', margin: '4px 0' }}>✉️ info@forlocalltd.com</a>
          <Link to="/login">Log in</Link>
          <Link to="/register">Sign up</Link>
          <Link to="/admin">Admin panel</Link>
        </div>
      </div>
      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} For-Local Rwanda. Client-Side SQLite &amp; React App for GitHub Pages.
      </div>
    </footer>
  );
};
