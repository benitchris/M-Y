import React, { useState } from 'react';
import { useDb } from '../context/DbContext';
import { CheckCircle, PhoneCall, Mail } from 'lucide-react';

export const ContactPage = () => {
  const { exec } = useDb();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('General question');
  const [message, setMessage] = useState('');

  const [confirmMessage, setConfirmMessage] = useState('');
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

    exec(
      `INSERT INTO contact_messages (name, email, topic, message, status)
       VALUES (?, ?, ?, ?, 'new')`,
      [name.trim(), email.trim(), topic, message.trim()]
    );

    setConfirmMessage('Thanks — your message has been sent. We typically reply within 24 hours.');
  };

  return (
    <main style={{ paddingBottom: '80px' }}>
      <section style={{ paddingBottom: '0' }}>
        <div className="wrap">
          <span className="eyebrow">Contact</span>
          <h1 style={{ fontSize: '38px' }}>We're here to help</h1>
          <p>Questions, booking requests, or urgent support — reach out below.</p>
        </div>
      </section>

      <section>
        <div className="wrap" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          <div className="form-card">
            <h3 style={{ marginBottom: '20px' }}>Send us a message</h3>

            {confirmMessage ? (
              <div className="confirm-msg">
                <CheckCircle size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: '-3px' }} />
                {confirmMessage}
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && (
                  <div style={{ color: '#b91c1c', fontSize: '13px', marginBottom: '14px', fontWeight: '600' }}>
                    {error}
                  </div>
                )}

                <div className="form-row">
                  <label htmlFor="c-name">Name</label>
                  <input
                    type="text"
                    id="c-name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-row">
                  <label htmlFor="c-email">Email</label>
                  <input
                    type="email"
                    id="c-email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-row">
                  <label htmlFor="c-topic">Topic</label>
                  <select id="c-topic" value={topic} onChange={e => setTopic(e.target.value)}>
                    <option value="General question">General question</option>
                    <option value="Booking request">Booking request</option>
                    <option value="Host application">Host application</option>
                    <option value="Safety concern">Safety concern</option>
                  </select>
                </div>

                <div className="form-row">
                  <label htmlFor="c-message">Message</label>
                  <textarea
                    id="c-message"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="How can we help?"
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-block">
                  Send message
                </button>
              </form>
            )}
          </div>

          <div>
            <div className="card" style={{ marginBottom: '20px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PhoneCall size={20} color="var(--green-700)" /> 24/7 support line
              </h3>
              <p>For urgent safety concerns during an active session, call our support line any time.</p>
              <p style={{ fontWeight: '800', fontSize: '20px', color: 'var(--green-700)', margin: 0 }}>
                <a href="tel:+250782704033" style={{ color: 'inherit', textDecoration: 'none' }}>+250 782 704 033</a>
              </p>
            </div>

            <div className="card">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={20} color="var(--green-700)" /> General inquiries
              </h3>
              <p style={{ fontWeight: '600', color: 'var(--ink-900)' }}>
                <a href="mailto:info@forlocalltd.com" style={{ color: 'inherit', textDecoration: 'none' }}>info@forlocalltd.com</a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
