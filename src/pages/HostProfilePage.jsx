import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDb } from '../context/DbContext';
import { Award, Star, CheckCircle, Calendar, Clock, User, Mail } from 'lucide-react';

export const HostProfilePage = () => {
  const { id } = useParams();
  const { isReady, query, exec, dbVersion } = useDb();

  const [host, setHost] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [sessionType, setSessionType] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [hours, setHours] = useState(2);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isReady) return;

    const hostId = parseInt(id, 10);
    const hostRows = query('SELECT * FROM hosts WHERE id = ?', [hostId]);
    if (hostRows.length > 0) {
      const h = hostRows[0];
      setHost(h);
      setSessionType(`City orientation — $${h.rate}/hr (min 2hrs)`);

      const reviewRows = query('SELECT * FROM host_reviews WHERE host_id = ? ORDER BY created_at DESC', [hostId]);
      setReviews(reviewRows);
    } else {
      setHost(null);
    }
    setLoading(false);
  }, [id, isReady, query, dbVersion]);

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!guestName.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!guestEmail.trim() || !guestEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    const estimatedTotal = (parseFloat(hours) || 1) * (parseFloat(host.rate) || 0);

    exec(
      `INSERT INTO bookings (host_id, guest_name, guest_email, session_type, booking_date, hours, estimated_total, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [host.id, guestName.trim(), guestEmail.trim(), sessionType, bookingDate || null, parseInt(hours, 10) || 1, estimatedTotal]
    );

    setConfirmMessage(`Thanks — your request to book ${host.name} has been sent. You won't be charged yet; they will confirm availability first.`);
  };

  const activityLabels = {
    orientation: 'City orientation',
    food: 'Markets & food',
    business: 'Translator on call',
    fullday: 'Full-day experience'
  };

  if (loading) {
    return (
      <div className="wrap" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <p>Loading host profile...</p>
      </div>
    );
  }

  if (!host) {
    return (
      <div className="wrap" style={{ padding: '80px 24px' }}>
        <h1>Host not found</h1>
        <p><Link to="/hosts">Back to all hosts</Link></p>
      </div>
    );
  }

  return (
    <main style={{ padding: '30px 0 80px' }}>
      <div className="wrap profile-grid">
        <div>
          <div
            style={{
              height: '320px',
              borderRadius: '16px',
              background: host.photo_color || '#C0DD97',
              marginBottom: '24px',
              boxShadow: 'var(--card-shadow)',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            {host.photo_url ? (
              <img src={host.photo_url} alt={host.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : null}
          </div>

          {host.verified === 1 && (
            <span className="badge" style={{ position: 'static', display: 'inline-flex', marginBottom: '14px' }}>
              <Award size={15} /> Verified host
            </span>
          )}

          <h1 style={{ fontSize: '34px', marginBottom: '6px' }}>{host.name}</h1>
          <p style={{ color: 'var(--ink-600)', fontSize: '15px' }}>
            {host.city.charAt(0).toUpperCase() + host.city.slice(1)}, Rwanda &middot; Hosting since {host.hosting_since} &middot;{' '}
            <Star size={16} fill="#f0a83b" color="#f0a83b" style={{ display: 'inline', verticalAlign: '-2px' }} />{' '}
            <strong>{host.rating}</strong> ({host.review_count} reviews)
          </p>

          <div style={{ margin: '18px 0 28px' }}>
            {host.languages.split(',').map((l, i) => (
              <span key={i} className="tag">
                {l.trim().charAt(0).toUpperCase() + l.trim().slice(1)}
              </span>
            ))}
            <span className="tag">{activityLabels[host.activity] || host.activity}</span>
          </div>

          <h3>About {host.name.split(' ')[0]}</h3>
          <p style={{ whiteSpace: 'pre-line', fontSize: '16px', lineHeight: '1.7' }}>{host.bio}</p>

          {host.whats_included && (
            <div style={{ marginTop: '36px' }}>
              <h3>What's included</h3>
              <ul style={{ color: 'var(--ink-700)', paddingLeft: '20px', fontSize: '15px', lineHeight: '1.8' }}>
                {host.whats_included.split('\n').filter(Boolean).map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ marginTop: '40px' }}>
            <h3>Reviews ({reviews.length})</h3>
            {reviews.length === 0 ? (
              <p style={{ color: 'var(--ink-600)' }}>No reviews yet.</p>
            ) : (
              reviews.map(r => (
                <div key={r.id} className="quote-card" style={{ marginBottom: '16px' }}>
                  <p style={{ fontStyle: 'normal' }}>"{r.comment}"</p>
                  <div className="who" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>— <strong>{r.author_name}</strong>{r.author_country ? `, ${r.author_country}` : ''}</span>
                    <span style={{ color: 'var(--green-700)', fontWeight: '700' }}>★ {r.rating}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Booking Card */}
        <div>
          <div className="card" style={{ position: 'sticky', top: '100px' }}>
            <h3 style={{ marginBottom: '18px' }}>Book {host.name.split(' ')[0]}</h3>

            {confirmMessage ? (
              <div className="confirm-msg">
                <CheckCircle size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: '-3px' }} />
                {confirmMessage}
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit}>
                {error && (
                  <div style={{ color: '#b91c1c', fontSize: '13px', marginBottom: '14px', fontWeight: '600' }}>
                    {error}
                  </div>
                )}

                <div className="form-row">
                  <label htmlFor="guest_name">Your name</label>
                  <input
                    type="text"
                    id="guest_name"
                    value={guestName}
                    onChange={e => setGuestName(e.target.value)}
                    placeholder="Full name"
                    required
                  />
                </div>

                <div className="form-row">
                  <label htmlFor="guest_email">Your email</label>
                  <input
                    type="email"
                    id="guest_email"
                    value={guestEmail}
                    onChange={e => setGuestEmail(e.target.value)}
                    placeholder="email@example.com"
                    required
                  />
                </div>

                <div className="form-row">
                  <label htmlFor="session_type">Session type</label>
                  <select
                    id="session_type"
                    value={sessionType}
                    onChange={e => setSessionType(e.target.value)}
                  >
                    <option>City orientation — ${host.rate}/hr (min 2hrs)</option>
                    <option>Full-day experience — ${host.rate}/hr (6-8hrs)</option>
                    <option>On-call translator — ${host.rate}/hr (1hr blocks)</option>
                  </select>
                </div>

                <div className="form-row">
                  <label htmlFor="booking_date">Date</label>
                  <input
                    type="date"
                    id="booking_date"
                    value={bookingDate}
                    onChange={e => setBookingDate(e.target.value)}
                  />
                </div>

                <div className="form-row">
                  <label htmlFor="hours">Hours</label>
                  <input
                    type="number"
                    id="hours"
                    value={hours}
                    min="1"
                    onChange={e => setHours(e.target.value)}
                  />
                </div>

                <div
                  style={{
                    display: 'flex',
                    justify: 'space-between',
                    fontSize: '15px',
                    padding: '14px 0',
                    borderTop: '1px solid var(--line)',
                    marginBottom: '18px'
                  }}
                >
                  <span>Estimated Total</span>
                  <strong>${((parseFloat(hours) || 1) * parseFloat(host.rate)).toFixed(2)}</strong>
                </div>

                <button type="submit" className="btn btn-primary btn-block">
                  Request to book
                </button>
                <p className="form-note" style={{ textAlign: 'center', marginTop: '12px' }}>
                  You won't be charged yet — {host.name.split(' ')[0]} will confirm availability first.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};
