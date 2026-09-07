import React from 'react';

export const AboutPage = () => {
  return (
    <main style={{ paddingBottom: '80px' }}>
      <section style={{ paddingBottom: '0' }}>
        <div className="wrap">
          <span className="eyebrow">About us</span>
          <h1 style={{ fontSize: '38px', maxWidth: '640px' }}>
            Rwanda is easy to visit. It's harder to really see.
          </h1>
        </div>
      </section>

      <section>
        <div className="wrap" style={{ maxWidth: '720px' }}>
          <p style={{ fontSize: '18px', lineHeight: '1.7', color: 'var(--ink-700)', marginBottom: '20px' }}>
            Rwanda's tourism is growing fast — but for many visitors, a language barrier gets in the way of actually experiencing the country, not just passing through it. For-Local was built to close that gap: connecting travelers with vetted Rwandans who can translate, explain, and guide, so a visit becomes a real experience instead of a guessing game.
          </p>
          <p style={{ fontSize: '18px', lineHeight: '1.7', color: 'var(--ink-700)' }}>
            We also believe tourism growth should create income for the people who make it worthwhile — the locals who know the markets, the shortcuts, and the stories a guidebook can't tell.
          </p>
        </div>
      </section>

      <svg className="path-divider" viewBox="0 0 1120 46" preserveAspectRatio="none">
        <path d="M0 23 Q280 5 560 23 T1120 23" />
        <circle cx="60" cy="17.5" r="4" />
        <circle cx="560" cy="23" r="4" />
        <circle cx="1060" cy="17.5" r="4" />
      </svg>

      <section style={{ background: 'var(--sand-100)' }}>
        <div className="wrap">
          <div className="grid-3">
            <div className="card">
              <h3>Local first</h3>
              <p>Every experience is led by a Rwandan who lives it, not a scripted tour.</p>
            </div>
            <div className="card">
              <h3>Trust by design</h3>
              <p>Verification and reviews aren't an afterthought — they're the foundation.</p>
            </div>
            <div className="card">
              <h3>Fair for everyone</h3>
              <p>Transparent pricing for guests, fair pay and flexibility for hosts.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
