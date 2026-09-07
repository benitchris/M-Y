import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDb } from '../context/DbContext';
import { Award, Star } from 'lucide-react';

export const HostsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isReady, query, dbVersion } = useDb();

  const [hosts, setHosts] = useState([]);
  const cityParam = searchParams.get('city') || 'all';
  const langParam = searchParams.get('lang') || 'all';
  const activityParam = searchParams.get('activity') || 'all';

  useEffect(() => {
    if (!isReady) return;

    let sql = 'SELECT * FROM hosts WHERE 1=1';
    const params = [];

    if (cityParam !== 'all') {
      sql += ' AND LOWER(city) = LOWER(?)';
      params.push(cityParam);
    }
    if (activityParam !== 'all') {
      sql += ' AND activity = ?';
      params.push(activityParam);
    }
    if (langParam !== 'all') {
      sql += ' AND LOWER(languages) LIKE LOWER(?)';
      params.push(`%${langParam}%`);
    }

    sql += ' ORDER BY rating DESC, review_count DESC';

    const results = query(sql, params);
    setHosts(results);
  }, [isReady, query, dbVersion, cityParam, langParam, activityParam]);

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === 'all') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  const activityLabels = {
    orientation: 'City orientation',
    food: 'Markets & food',
    business: 'Translator on call',
    fullday: 'Full-day experience'
  };

  return (
    <main style={{ paddingBottom: '60px' }}>
      <section style={{ paddingBottom: '10px' }}>
        <div className="wrap">
          <span className="eyebrow">Browse hosts</span>
          <h1 style={{ fontSize: '38px' }}>Find your local in Rwanda</h1>
          <p style={{ maxWidth: '560px' }}>
            Every host is ID-verified and rated by past travelers. Filter to find the right fit for your journey.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: '20px' }}>
        <div className="wrap">
          <div className="filter-bar">
            <select value={cityParam} onChange={e => updateFilter('city', e.target.value)}>
              <option value="all">All cities</option>
              <option value="kigali">Kigali</option>
              <option value="musanze">Musanze</option>
              <option value="huye">Huye</option>
              <option value="rubavu">Rubavu</option>
            </select>

            <select value={langParam} onChange={e => updateFilter('lang', e.target.value)}>
              <option value="all">Any language</option>
              <option value="english">English</option>
              <option value="french">French</option>
              <option value="swahili">Swahili</option>
              <option value="kinyarwanda">Kinyarwanda</option>
            </select>

            <select value={activityParam} onChange={e => updateFilter('activity', e.target.value)}>
              <option value="all">Any experience</option>
              <option value="orientation">City orientation</option>
              <option value="food">Markets &amp; food</option>
              <option value="business">Business travel</option>
              <option value="fullday">Full-day experience</option>
            </select>
          </div>

          <p className="results-count">
            {hosts.length} host{hosts.length === 1 ? '' : 's'} found
          </p>

          <div className="grid-3">
            {hosts.length === 0 ? (
              <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
                <h3>No hosts match those filters</h3>
                <p>Try widening your search or choosing a different city or language.</p>
                <button
                  className="btn btn-ghost"
                  onClick={() => setSearchParams({})}
                  style={{ marginTop: '10px' }}
                >
                  Clear filters
                </button>
              </div>
            ) : (
              hosts.map(host => (
                <Link key={host.id} className="host-card" to={`/hosts/${host.id}`}>
                  <div className="host-photo" style={{ background: host.photo_color || '#C0DD97', position: 'relative', overflow: 'hidden' }}>
                    {host.photo_url ? (
                      <img src={host.photo_url} alt={host.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : null}
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
                        {host.languages.split(',').map(l => l.charAt(0).toUpperCase() + l.slice(1).trim()).join(', ')} — {activityLabels[host.activity] || host.activity}
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
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
};
