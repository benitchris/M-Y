import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDb } from '../context/DbContext';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, LogIn, UserPlus } from 'lucide-react';

export const BecomeHostPage = () => {
  const { exec } = useDb();
  const { user } = useAuth();

  const [fullName, setFullName] = useState(user ? user.full_name : '');
  const [city, setCity] = useState('Kigali');
  const [languages, setLanguages] = useState('');
  const [phone, setPhone] = useState('');
  const [about, setAbout] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  const [confirmMessage, setConfirmMessage] = useState('');
  const [error, setError] = useState('');

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('Please log in or sign up first to submit your host application.');
      return;
    }

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!phone.trim()) {
      setError('Please enter a phone number.');
      return;
    }

    exec(
      `INSERT INTO host_applications (user_id, full_name, city, languages, phone, about, photo_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [user.id, fullName.trim(), city, languages.trim(), phone.trim(), about.trim(), photoUrl || null]
    );

    setConfirmMessage("Thanks — we've received your application! Our team will review your application and reach out to verify your details.");
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

            {!user ? (
              <div style={{ textAlign: 'center', padding: '30px 20px', background: 'var(--sand-50)', borderRadius: '12px', border: '1px solid var(--line)' }}>
                <UserPlus size={40} color="var(--green-700)" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ marginBottom: '8px' }}>Account Required to Apply</h4>
                <p style={{ color: 'var(--ink-600)', marginBottom: '20px', fontSize: '14px' }}>
                  To apply as a host, please log in to your account or sign up first.
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <Link to="/login" className="btn btn-primary">
                    <LogIn size={16} /> Log In
                  </Link>
                  <Link to="/register" className="btn btn-secondary">
                    <UserPlus size={16} /> Sign Up
                  </Link>
                </div>
              </div>
            ) : confirmMessage ? (
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

                <div className="form-row">
                  <label htmlFor="h-photo">Profile Photo (Upload or URL)</label>
                  <input
                    type="file"
                    id="h-photo"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    style={{ marginBottom: '8px' }}
                  />
                  <input
                    type="url"
                    value={photoUrl.startsWith('data:') ? '' : photoUrl}
                    onChange={e => setPhotoUrl(e.target.value)}
                    placeholder="Or paste image URL e.g. https://..."
                  />
                  {photoUrl && (
                    <div style={{ marginTop: '10px', width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--green-600)' }}>
                      <img src={photoUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
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
