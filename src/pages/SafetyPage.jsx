import React from 'react';
import { Link } from 'react-router-dom';

export const SafetyPage = () => {
  return (
    <main style={{ paddingBottom: '80px' }}>
      <section style={{ paddingBottom: '0' }}>
        <div className="wrap">
          <span className="eyebrow">Safety &amp; trust</span>
          <h1 style={{ fontSize: '38px', maxWidth: '640px' }}>
            Everyone's safety comes before every booking
          </h1>
          <p style={{ maxWidth: '580px' }}>
            For-Local exists for cultural orientation, translation, and local guidance. It is not a dating or escort service, and any use of the platform for that purpose is grounds for immediate, permanent removal.
          </p>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="grid-2">
            <div className="card">
              <h3>How we vet hosts</h3>
              <ul style={{ color: 'var(--ink-700)', paddingLeft: '20px', lineHeight: '1.8' }}>
                <li>Government ID verification and phone confirmation</li>
                <li>A short interview covering language and judgment</li>
                <li>A community or employer reference</li>
                <li>Close review of a host's first sessions</li>
              </ul>
            </div>
            <div className="card">
              <h3>What guests get</h3>
              <ul style={{ color: 'var(--ink-700)', paddingLeft: '20px', lineHeight: '1.8' }}>
                <li>Public, unremovable two-way reviews</li>
                <li>A 24/7 support line for any concern</li>
                <li>Option to share live location with a trusted contact</li>
                <li>Clear conduct policy every host agrees to</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section style={{ background: 'var(--sand-100)' }}>
        <div className="wrap">
          <div className="section-head">
            <h2>If something feels wrong</h2>
          </div>
          <p style={{ maxWidth: '580px', fontSize: '16px' }}>
            Contact our support line immediately — available around the clock. Reports are taken seriously and can result in a host or guest being removed from the platform. You are never obligated to continue a session that makes you uncomfortable.
          </p>
          <Link to="/contact" className="btn btn-primary" style={{ marginTop: '16px' }}>
            Contact support
          </Link>
        </div>
      </section>
    </main>
  );
};
