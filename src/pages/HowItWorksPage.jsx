import React, { useState } from 'react';

export const HowItWorksPage = () => {
  const [activeTab, setActiveTab] = useState('guests');

  return (
    <main style={{ paddingBottom: '80px' }}>
      <section style={{ paddingBottom: '0' }}>
        <div className="wrap">
          <span className="eyebrow">How it works</span>
          <h1 style={{ fontSize: '38px' }}>Simple on both sides</h1>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="tabs">
            <button
              className={`tab-btn ${activeTab === 'guests' ? 'active' : ''}`}
              onClick={() => setActiveTab('guests')}
            >
              For guests
            </button>
            <button
              className={`tab-btn ${activeTab === 'hosts' ? 'active' : ''}`}
              onClick={() => setActiveTab('hosts')}
            >
              For hosts
            </button>
          </div>

          {activeTab === 'guests' ? (
            <div className="grid-3">
              <div className="card step">
                <div className="num-mark">1</div>
                <h3>Search &amp; filter</h3>
                <p>Tell us your city and what you need — orientation, translation, or a full day out.</p>
              </div>
              <div className="card step">
                <div className="num-mark">2</div>
                <h3>Message &amp; book</h3>
                <p>Chat with your host, confirm a time, and pay securely through the platform.</p>
              </div>
              <div className="card step">
                <div className="num-mark">3</div>
                <h3>Meet in person</h3>
                <p>Your host meets you where agreed. Share your live location with someone back home if you'd like.</p>
              </div>
              <div className="card step">
                <div className="num-mark">4</div>
                <h3>Rate your experience</h3>
                <p>Leave a review — it helps other travelers and keeps hosts accountable.</p>
              </div>
            </div>
          ) : (
            <div className="grid-3">
              <div className="card step">
                <div className="num-mark">1</div>
                <h3>Apply &amp; verify</h3>
                <p>Submit your ID, a short interview, and a reference. Most applications are reviewed within a week.</p>
              </div>
              <div className="card step">
                <div className="num-mark">2</div>
                <h3>Set your rate &amp; availability</h3>
                <p>You choose your hourly rate and when you're free to host.</p>
              </div>
              <div className="card step">
                <div className="num-mark">3</div>
                <h3>Accept bookings</h3>
                <p>Guests request a time, you confirm. Full guest details shared once accepted.</p>
              </div>
              <div className="card step">
                <div className="num-mark">4</div>
                <h3>Get paid</h3>
                <p>Payment is released after each session, direct to your mobile money or bank account.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section style={{ background: 'var(--sand-100)' }}>
        <div className="wrap">
          <div className="section-head">
            <h2>Frequently asked questions</h2>
          </div>
          <details className="faq-item" open>
            <summary>Is this a dating or escort service?</summary>
            <p>No. For-Local is strictly cultural and logistical — translation, orientation, and local guidance. Romantic or intimate services are against our terms and result in immediate removal.</p>
          </details>
          <details className="faq-item">
            <summary>How are hosts vetted?</summary>
            <p>Every host goes through ID verification, a short interview, and a reference check before their first booking, and their first sessions are closely monitored through reviews.</p>
          </details>
          <details className="faq-item">
            <summary>What if something goes wrong during a session?</summary>
            <p>Our support line is available 24/7. Guests can also share live location with a trusted contact for any session.</p>
          </details>
          <details className="faq-item">
            <summary>How much does it cost?</summary>
            <p>Hosts set their own hourly rate, typically $15-30/hr depending on experience and language skills. Pricing is always shown upfront before you book.</p>
          </details>
        </div>
      </section>
    </main>
  );
};
