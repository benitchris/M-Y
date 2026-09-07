import React, { useState } from 'react';
import { useDb } from '../context/DbContext';
import { CheckCircle } from 'lucide-react';

export const BecomeHostPage = () => {
  const { exec } = useDb();

  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState('Kigali');
  const [languages, setLanguages] = useState('');
  const [phone, setPhone] = useState('');
  const [about, setAbout] = useState('');

  const [confirmMessage, setConfirmMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!phone.trim()) {
      setError('Please enter a phone number.');
      return;
    }

    exec(
      `INSERT INTO host_applications (full_name, city, languages, phone, about, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [fullName.trim(), city, languages.trim(), phone.trim(), about.trim()]
    );

    setConfirmMessage("Thanks — we've received your application. Our team will reach out within a week to verify your ID and schedule a short call.");
  };

  return (
    <main style={{ paddingBottom: '80px' }}>
      <section className="hero" style={{ padding: '60px 0' }}>
        <div className="wrap" style={{ gridTemplateColumns: '1fr', textAlign: 'center' }}>
          <div>
            <span className="eyebrow" style={{ color: '#F0A83B' }}>For Rwandans</span>
            <h1 style={{ fontSize: '42px' }}>Know your city? Get paid to share it.</h1>
            <p className="lead" style={{ margin: '0 auto' }}>
              Set your own hours and rate. Meet travelers from around the world. Get paid after every session.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="grid-3" style={{ marginBottom: '50px' }}>
            <div className="card">
              <h3>Flexible income</h3>
              <p>Host as much or as little as you want, around your existing schedule.</p>
            </div>
            <div className="card">
              <h3>Fair pay</h3>
              <p>You set your rate. We take a small commission only when you get booked.</p>
            </div>
            <div className="card">
              <h3>Real support</h3>
              <p>Vetting and reviews protect you too — guests are accountable, not anonymous.</p>
            </div>
          </div>

          <div className="form-card" style={{ margin: '0 auto' }}>
            <h3 style={{ marginBottom: '20px' }}>Apply to become a host</h3>

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
                  <label htmlFor="h-name">Full name</label>
                  <input
                    type="text"
                    id="h-name"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Your full name"
                    required
                  />
                </div>

                <div className="form-row">
                  <label htmlFor="h-city">City you'd host in</label>
                  <select id="h-city" value={city} onChange={e => setCity(e.target.value)}>
                    <option value="Kigali">Kigali</option>
                    <option value="Musanze">Musanze</option>
                    <option value="Huye">Huye</option>
                    <option value="Rubavu">Rubavu</option>
                  </select>
                </div>

                <div className="form-row">
                  <label htmlFor="h-langs">Languages you speak</label>
                  <input
                    type="text"
                    id="h-langs"
                    value={languages}
                    onChange={e => setLanguages(e.target.value)}
                    placeholder="e.g. English, French, Kinyarwanda"
                  />
                </div>

                <div className="form-row">
                  <label htmlFor="h-phone">Phone number</label>
                  <input
                    type="tel"
                    id="h-phone"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+250 7XX XXX XXX"
                    required
                  />
                </div>

                <div className="form-row">
                  <label htmlFor="h-about">Tell us about yourself</label>
                  <textarea
                    id="h-about"
                    value={about}
                    onChange={e => setAbout(e.target.value)}
                    placeholder="What would you enjoy showing visitors?"
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-block">
                  Submit application
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};
