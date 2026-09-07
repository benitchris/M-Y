import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDb } from '../context/DbContext';
import { ShieldCheck, Star, PhoneCall, CreditCard, Award, ArrowRight } from 'lucide-react';

export const HomePage = () => {
  const navigate = useNavigate();
  const { isReady, query, dbVersion } = useDb();
  const [featuredHosts, setFeaturedHosts] = useState([]);

  const [searchCity, setSearchCity] = useState('kigali');
  const [searchActivity, setSearchActivity] = useState('orientation');

  useEffect(() => {
    if (isReady) {
      const hosts = query('SELECT * FROM hosts WHERE verified = 1 ORDER BY rating DESC, review_count DESC LIMIT 3');
      setFeaturedHosts(hosts);
    }
  }, [isReady, query, dbVersion]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/hosts?city=${searchCity}&activity=${searchActivity}`);
  };

  const activityLabels = {
    orientation: 'City orientation',
    food: 'Markets & food',
    business: 'Translator on call',
    fullday: 'Full-day experience'
  };

  return (
    <main>
      {/* Hero Section */}
      <section className="hero">
        <div className="wrap">
          <div>
            <span className="eyebrow" style={{ color: '#F0A83B' }}>Rwanda, without the language barrier</span>
            <h1>See Rwanda through<br />a local's eyes</h1>
            <p className="lead">
              Book a vetted local host for city orientation, translation, and honest guidance — from a Kigali afternoon to a full cultural immersion.
            </p>
            <div className="hero-badges">
              <div><span className="dot"></span> ID-verified hosts</div>
              <div><span className="dot"></span> Transparent pricing</div>
              <div><span className="dot"></span> 24/7 support line</div>
            </div>
          </div>

          <form className="search-card" onSubmit={handleSearchSubmit}>
            <label htmlFor="dest">Where are you visiting</label>
            <select id="dest" value={searchCity} onChange={e => setSearchCity(e.target.value)}>
              <option value="kigali">Kigali</option>
              <option value="musanze">Musanze (Volcanoes)</option>
              <option value="huye">Huye</option>
              <option value="rubavu">Rubavu</option>
            </select>

            <label htmlFor="need">What do you need</label>
            <select id="need" value={searchActivity} onChange={e => setSearchActivity(e.target.value)}>
              <option value="orientation">City orientation</option>
              <option value="fullday">Full-day experience</option>
              <option value="business">Translator on call</option>
              <option value="food">Markets &amp; food</option>
            </select>

            <button type="submit" className="btn btn-amber btn-block" style={{ marginTop: '20px' }}>
              Find a local host
            </button>
          </form>
        </div>
      </section>

      {/* SVG Path Divider */}
      <svg className="path-divider" viewBox="0 0 1120 46" preserveAspectRatio="none">
        <path d="M0 23 Q280 5 560 23 T1120 23" />
        <circle cx="60" cy="17.5" r="4" />
        <circle cx="560" cy="23" r="4" />
        <circle cx="1060" cy="17.5" r="4" />
      </svg>

      {/* How it Works */}
      <section>
        <div className="wrap">
          <div className="section-head" style={{ margin: '0 auto 40px', textAlign: 'center', maxWidth: '560px' }}>
            <h2>How it works</h2>
            <p>Three steps between you and a real Rwandan experience.</p>
          </div>
          <div className="grid-3">
            <div className="card step">
              <div className="num-mark">1</div>
              <h3>Browse hosts</h3>
              <p>Filter by city, language spoken, and the kind of experience you want.</p>
            </div>
            <div className="card step">
              <div className="num-mark">2</div>
              <h3>Book a session</h3>
              <p>Choose a time and tier. Pricing is shown upfront, no surprise fees.</p>
            </div>
            <div className="card step">
              <div className="num-mark">3</div>
              <h3>Explore together</h3>
              <p>Your host meets you and guides the way — language, culture, and all.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Hosts from SQLite */}
      <section style={{ background: 'var(--sand-100)' }}>
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Featured hosts</span>
            <h2>Meet a few of our Rwanda hosts</h2>
          </div>
          <div className="grid-3">
            {featuredHosts.map(host => (
              <Link key={host.id} className="host-card" to={`/hosts/${host.id}`}>
                <div className="host-photo" style={{ background: host.photo_color || '#C0DD97' }}>
                  {host.verified === 1 && (
                    <span className="badge">
                      <Award size={14} /> Verified
                    </span>
                  )}
                </div>
                <div className="host-body">
                  <div>
                    <div className="name">{host.name}</div>
                    <div className="langs">
                      {host.languages.split(',').map(l => l.charAt(0).toUpperCase() + l.slice(1)).join(', ')} — {activityLabels[host.activity] || host.activity}
                    </div>
                  </div>
                  <div className="host-meta">
                    <span>
                      <Star size={15} fill="#f0a83b" color="#f0a83b" style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }} />
                      {host.rating} ({host.review_count})
                    </span>
                    <span className="rate">${host.rate}/hr</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '36px' }}>
            <Link to="/hosts" className="btn btn-ghost">
              See all hosts <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section>
        <div className="wrap">
          <div className="trust-row">
            <div className="trust-item"><ShieldCheck size={20} /> ID &amp; background checks</div>
            <div className="trust-item"><Star size={20} /> Public two-way reviews</div>
            <div className="trust-item"><PhoneCall size={20} /> 24/7 support line</div>
            <div className="trust-item"><CreditCard size={20} /> Secure payments</div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section>
        <div className="wrap">
          <div className="section-head" style={{ textAlign: 'center', margin: '0 auto 34px', maxWidth: '560px' }}>
            <h2>What travelers say</h2>
          </div>
          <div className="grid-3">
            <div className="quote-card">
              <p>"I didn't speak a word of Kinyarwanda. My host translated everything and took me to a market I'd never have found alone."</p>
              <div className="who">— Mara, visiting from Portugal</div>
            </div>
            <div className="quote-card">
              <p>"Booked a half-day in Kigali before a conference. Felt like meeting a friend, not hiring a guide."</p>
              <div className="who">— Daniel, business traveler</div>
            </div>
            <div className="quote-card">
              <p>"The verification and reviews made me comfortable booking as a solo traveler. Would do it again."</p>
              <div className="who">— Priya, visiting from India</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section>
        <div className="wrap">
          <div className="cta-band">
            <h2>Know Rwanda? Turn it into income.</h2>
            <p>Join as a verified local host — flexible hours, fair pay, meet people from everywhere.</p>
            <Link to="/become-host" className="btn btn-primary" style={{ background: '#F0A83B', color: '#2a1c00' }}>
              Become a host
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};
