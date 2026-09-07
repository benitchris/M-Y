import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDb } from '../context/DbContext';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Download, Upload, RefreshCw, Database, Terminal, Check, ShieldAlert } from 'lucide-react';

export const AdminDashboardPage = () => {
  const { user, isAdmin, login } = useAuth();
  const { isReady, query, exec, dbVersion, resetDb, exportDb, importDb } = useDb();

  const [applications, setApplications] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [messages, setMessages] = useState([]);
  const [hostsList, setHostsList] = useState([]);
  const [hostCount, setHostCount] = useState(0);

  // New Host Form state
  const [showAddHostModal, setShowAddHostModal] = useState(false);
  const [newHostName, setNewHostName] = useState('');
  const [newHostCity, setNewHostCity] = useState('kigali');
  const [newHostLangs, setNewHostLangs] = useState('english,french');
  const [newHostActivity, setNewHostActivity] = useState('orientation');
  const [newHostRate, setNewHostRate] = useState('20.00');
  const [newHostBio, setNewHostBio] = useState('');
  const [newHostPhotoUrl, setNewHostPhotoUrl] = useState('');

  // SQL Console state
  const [customSql, setCustomSql] = useState('SELECT * FROM hosts');
  const [sqlResult, setSqlResult] = useState(null);
  const [sqlError, setSqlError] = useState('');

  const [messageNotice, setMessageNotice] = useState('');

  useEffect(() => {
    if (!isReady) return;

    try {
      const apps = query('SELECT * FROM host_applications ORDER BY created_at DESC');
      const bks = query(`
        SELECT b.*, h.name AS host_name
        FROM bookings b
        LEFT JOIN hosts h ON h.id = b.host_id
        ORDER BY b.created_at DESC
      `);
      const msgs = query('SELECT * FROM contact_messages ORDER BY created_at DESC');
      const hList = query('SELECT * FROM hosts ORDER BY id DESC');

      setApplications(apps);
      setBookings(bks);
      setMessages(msgs);
      setHostsList(hList);
      setHostCount(hList.length);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  }, [isReady, query, dbVersion]);

  const updateAppStatus = (id, newStatus) => {
    exec('UPDATE host_applications SET status = ? WHERE id = ?', [newStatus, id]);
    showNotice(`Application #${id} status updated to ${newStatus}`);
  };

  const approveAndConvertHost = (app) => {
    exec(
      `INSERT INTO hosts (name, city, languages, activity, rate, rating, review_count, bio, photo_url, verified, hosting_since)
       VALUES (?, ?, ?, 'orientation', 20.00, 5.0, 0, ?, ?, 1, ?)`,
      [app.full_name, (app.city || 'kigali').toLowerCase(), app.languages || 'english', app.about || 'Local host in Rwanda', app.photo_url || null, new Date().getFullYear()]
    );
    exec('UPDATE host_applications SET status = "approved" WHERE id = ?', [app.id]);
    showNotice(`Approved application and created host profile for ${app.full_name}!`);
  };

  const updateHostPhoto = (hostId, photoUrl) => {
    exec('UPDATE hosts SET photo_url = ? WHERE id = ?', [photoUrl, hostId]);
    showNotice(`Updated photo for Host #${hostId}`);
  };

  const toggleHostVerified = (hostId, currentVerified) => {
    exec('UPDATE hosts SET verified = ? WHERE id = ?', [currentVerified === 1 ? 0 : 1, hostId]);
    showNotice(`Toggled verification for Host #${hostId}`);
  };

  const deleteHost = (hostId) => {
    if (window.confirm('Delete this host profile?')) {
      exec('DELETE FROM hosts WHERE id = ?', [hostId]);
      showNotice(`Host #${hostId} deleted.`);
    }
  };

  const handleCreateHostSubmit = (e) => {
    e.preventDefault();
    if (!newHostName.trim()) return;

    exec(
      `INSERT INTO hosts (name, city, languages, activity, rate, rating, review_count, bio, photo_url, verified, hosting_since)
       VALUES (?, ?, ?, ?, ?, 5.0, 0, ?, ?, 1, ?)`,
      [
        newHostName.trim(),
        newHostCity.toLowerCase(),
        newHostLangs.trim(),
        newHostActivity,
        parseFloat(newHostRate) || 20.0,
        newHostBio.trim(),
        newHostPhotoUrl || null,
        new Date().getFullYear()
      ]
    );

    setShowAddHostModal(false);
    setNewHostName('');
    setNewHostBio('');
    setNewHostPhotoUrl('');
    showNotice(`Created host ${newHostName}!`);
  };

  const updateBookingStatus = (id, newStatus) => {
    exec('UPDATE bookings SET status = ? WHERE id = ?', [newStatus, id]);
    showNotice(`Booking #${id} status updated to ${newStatus}`);
  };

  const updateMessageStatus = (id, newStatus) => {
    exec('UPDATE contact_messages SET status = ? WHERE id = ?', [newStatus, id]);
    showNotice(`Message #${id} status updated to ${newStatus}`);
  };

  const showNotice = (msg) => {
    setMessageNotice(msg);
    setTimeout(() => setMessageNotice(''), 3000);
  };

  const handleExport = () => {
    const blob = exportDb();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `for_local_database_${new Date().toISOString().slice(0, 10)}.sqlite`;
    a.click();
    URL.revokeObjectURL(url);
    showNotice('SQLite Database exported successfully!');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const buffer = evt.target.result;
      const success = await importDb(buffer);
      if (success) {
        showNotice('SQLite Database imported successfully!');
      } else {
        alert('Failed to parse uploaded SQLite database file.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleResetDb = async () => {
    if (window.confirm('Are you sure you want to reset the database to initial seed data?')) {
      await resetDb();
      showNotice('Database reset to seed state.');
    }
  };

  const runCustomSql = (e) => {
    e.preventDefault();
    setSqlError('');
    setSqlResult(null);
    try {
      const cleanSql = customSql.trim();
      if (cleanSql.toLowerCase().startsWith('select')) {
        const res = query(cleanSql);
        setSqlResult(res);
      } else {
        exec(cleanSql);
        showNotice('SQL executed successfully!');
      }
    } catch (err) {
      setSqlError(err.message);
    }
  };

  if (!isAdmin) {
    return (
      <main style={{ padding: '60px 0 100px' }}>
        <div className="wrap">
          <div className="card" style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center', padding: '40px' }}>
            <ShieldAlert size={48} color="#dc2626" style={{ margin: '0 auto 16px' }} />
            <h2>Admin Access Required</h2>
            <p>You need to be logged in as an Admin to view this dashboard.</p>
            <button
              className="btn btn-primary"
              onClick={() => login('admin@for-local.rw', 'adminpassword')}
              style={{ marginTop: '16px' }}
            >
              Click to Log In as Admin Demo Account
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="admin-top">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <LayoutDashboard size={22} />
          <strong style={{ fontSize: '18px' }}>For-Local Admin Dashboard (In-Browser SQLite)</strong>
        </div>
        <div>
          <Link to="/" style={{ marginRight: '16px' }}>View Site</Link>
          <span style={{ color: '#afd1c2' }}>Logged in as {user.full_name}</span>
        </div>
      </div>

      <div className="admin-wrap">
        {messageNotice && (
          <div style={{ background: '#ecfdf5', border: '1px solid #6ee7b7', color: '#047857', padding: '12px 18px', borderRadius: '8px', marginBottom: '24px', fontWeight: '700' }}>
            <Check size={18} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-3px' }} />
            {messageNotice}
          </div>
        )}

        {/* Stats Grid */}
        <div className="stat-grid">
          <div className="stat-card">
            <div className="num">{hostCount}</div>
            <div className="label">Hosts</div>
          </div>
          <div className="stat-card">
            <div className="num">{bookings.length}</div>
            <div className="label">Bookings</div>
          </div>
          <div className="stat-card">
            <div className="num">{applications.length}</div>
            <div className="label">Applications</div>
          </div>
          <div className="stat-card">
            <div className="num">{messages.length}</div>
            <div className="label">Messages</div>
          </div>
        </div>

        {/* Active Hosts Management Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', marginTop: '30px' }}>
          <h2>Manage Hosts & Photos ({hostsList.length})</h2>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddHostModal(!showAddHostModal)}>
            {showAddHostModal ? 'Cancel' : '+ Add New Host'}
          </button>
        </div>

        {showAddHostModal && (
          <form onSubmit={handleCreateHostSubmit} className="card" style={{ marginBottom: '24px', background: 'var(--sand-50)' }}>
            <h3 style={{ marginBottom: '14px' }}>Create New Host Profile</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '700' }}>Host Name</label>
                <input type="text" value={newHostName} onChange={e => setNewHostName(e.target.value)} placeholder="e.g. Marie K." required />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '700' }}>City</label>
                <select value={newHostCity} onChange={e => setNewHostCity(e.target.value)}>
                  <option value="kigali">Kigali</option>
                  <option value="musanze">Musanze</option>
                  <option value="huye">Huye</option>
                  <option value="rubavu">Rubavu</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '700' }}>Languages</label>
                <input type="text" value={newHostLangs} onChange={e => setNewHostLangs(e.target.value)} placeholder="e.g. english, french, kinyarwanda" />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '700' }}>Hourly Rate ($)</label>
                <input type="number" step="0.5" value={newHostRate} onChange={e => setNewHostRate(e.target.value)} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '13px', fontWeight: '700' }}>Host Profile Photo</label>
                <div
                  style={{
                    border: '2px dashed var(--line)',
                    borderRadius: '12px',
                    padding: '24px',
                    textAlign: 'center',
                    background: newHostPhotoUrl ? 'var(--green-50)' : 'var(--sand-50)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                  onClick={() => document.getElementById('admin-host-photo-upload').click()}
                  onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--green-600)'; }}
                  onDragLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; }}
                  onDrop={e => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = 'var(--line)';
                    const file = e.dataTransfer.files[0];
                    if (file && file.type.startsWith('image/')) {
                      const reader = new FileReader();
                      reader.onloadend = () => setNewHostPhotoUrl(reader.result);
                      reader.readAsDataURL(file);
                    }
                  }}
                >
                  <input
                    id="admin-host-photo-upload"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={e => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setNewHostPhotoUrl(reader.result);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  {newHostPhotoUrl ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'center' }}>
                      <div style={{ width: '72px', height: '72px', borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--green-600)', flexShrink: 0 }}>
                        <img src={newHostPhotoUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <p style={{ color: 'var(--green-700)', fontWeight: '700', margin: '0 0 4px' }}>✓ Photo selected</p>
                        <button
                          type="button"
                          style={{ background: 'none', border: 'none', color: 'var(--ink-600)', fontSize: '13px', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                          onClick={e => { e.stopPropagation(); setNewHostPhotoUrl(''); }}
                        >
                          Remove &amp; choose different
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: '36px', marginBottom: '10px' }}>📷</div>
                      <p style={{ margin: '0 0 6px', fontWeight: '700', color: 'var(--ink-900)', fontSize: '14px' }}>Click to upload or drag &amp; drop a photo</p>
                      <p style={{ margin: 0, color: 'var(--ink-600)', fontSize: '12px' }}>JPG, PNG, WebP · Any size · Will be cropped to circle</p>
                    </div>
                  )}
                </div>
                {/* OR divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '12px 0' }}>
                  <div style={{ flex: 1, height: '1px', background: 'var(--line)' }} />
                  <span style={{ fontSize: '12px', color: 'var(--ink-500)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>or paste a URL</span>
                  <div style={{ flex: 1, height: '1px', background: 'var(--line)' }} />
                </div>
                <input
                  type="url"
                  value={newHostPhotoUrl && newHostPhotoUrl.startsWith('data:') ? '' : newHostPhotoUrl}
                  onChange={e => setNewHostPhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... (optional)"
                  onClick={e => e.stopPropagation()}
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '13px', fontWeight: '700' }}>Bio</label>
                <textarea value={newHostBio} onChange={e => setNewHostBio(e.target.value)} placeholder="Tell visitors about this host..." />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '14px' }}>Save New Host</button>
          </form>
        )}

        <div className="table-responsive" style={{ marginBottom: '40px' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Photo</th>
                <th>Name</th>
                <th>City</th>
                <th>Languages</th>
                <th>Rate</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {hostsList.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center' }}>No hosts in database.</td></tr>
              ) : (
                hostsList.map(h => (
                  <tr key={h.id}>
                    <td>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', background: h.photo_color || '#C0DD97' }}>
                        {h.photo_url ? (
                          <img src={h.photo_url} alt={h.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : null}
                      </div>
                    </td>
                    <td><strong>{h.name}</strong></td>
                    <td>{h.city}</td>
                    <td style={{ fontSize: '13px' }}>{h.languages}</td>
                    <td><strong>${h.rate}/hr</strong></td>
                    <td>
                      <button
                        className={`btn btn-sm ${h.verified === 1 ? 'btn-amber' : 'btn-ghost'}`}
                        onClick={() => toggleHostVerified(h.id, h.verified)}
                        style={{ padding: '2px 8px', fontSize: '12px' }}
                      >
                        {h.verified === 1 ? 'Verified ✓' : 'Unverified'}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '2px 8px', fontSize: '12px' }}
                          onClick={() => {
                            const newUrl = prompt('Enter new Photo URL for ' + h.name, h.photo_url || '');
                            if (newUrl !== null) updateHostPhoto(h.id, newUrl);
                          }}
                        >
                          📷 Change Photo
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ color: '#dc2626', borderColor: '#fca5a5', padding: '2px 8px', fontSize: '12px' }}
                          onClick={() => deleteHost(h.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Host Applications Table */}
        <h2 style={{ marginBottom: '16px' }}>Host Applications</h2>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Photo</th>
                <th>Name</th>
                <th>City</th>
                <th>Languages</th>
                <th>Phone</th>
                <th>About</th>
                <th>Status / Action</th>
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center' }}>No applications yet.</td></tr>
              ) : (
                applications.map(a => (
                  <tr key={a.id}>
                    <td>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', background: '#ccc' }}>
                        {a.photo_url ? (
                          <img src={a.photo_url} alt={a.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : null}
                      </div>
                    </td>
                    <td><strong>{a.full_name}</strong></td>
                    <td>{a.city}</td>
                    <td>{a.languages}</td>
                    <td>{a.phone}</td>
                    <td style={{ maxWidth: '200px' }}>{a.about}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <select
                          className={`status-select status-${a.status}`}
                          value={a.status}
                          onChange={e => updateAppStatus(a.id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                        {a.status !== 'approved' && (
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ padding: '2px 8px', fontSize: '11px' }}
                            onClick={() => approveAndConvertHost(a)}
                          >
                            Approve &amp; Make Host
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Bookings Table */}
        <h2 style={{ marginBottom: '16px' }}>Bookings</h2>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Host</th>
                <th>Guest</th>
                <th>Email</th>
                <th>Session</th>
                <th>Date</th>
                <th>Hrs</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: 'center' }}>No bookings yet.</td></tr>
              ) : (
                bookings.map(b => (
                  <tr key={b.id}>
                    <td><strong>{b.host_name || `Host #${b.host_id}`}</strong></td>
                    <td>{b.guest_name}</td>
                    <td>{b.guest_email}</td>
                    <td style={{ fontSize: '13px' }}>{b.session_type}</td>
                    <td>{b.booking_date || 'N/A'}</td>
                    <td>{b.hours}</td>
                    <td><strong>${parseFloat(b.estimated_total || 0).toFixed(2)}</strong></td>
                    <td>
                      <select
                        className={`status-select status-${b.status}`}
                        value={b.status}
                        onChange={e => updateBookingStatus(b.id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Contact Messages Table */}
        <h2 style={{ marginBottom: '16px' }}>Contact Messages</h2>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Topic</th>
                <th>Message</th>
                <th>Status</th>
                <th>Received</th>
              </tr>
            </thead>
            <tbody>
              {messages.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center' }}>No messages yet.</td></tr>
              ) : (
                messages.map(m => (
                  <tr key={m.id}>
                    <td><strong>{m.name}</strong></td>
                    <td>{m.email}</td>
                    <td>{m.topic}</td>
                    <td style={{ maxWidth: '280px' }}>{m.message}</td>
                    <td>
                      <select
                        className={`status-select status-${m.status}`}
                        value={m.status}
                        onChange={e => updateMessageStatus(m.id, e.target.value)}
                      >
                        <option value="new">New</option>
                        <option value="read">Read</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--ink-600)' }}>{m.created_at}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* SQLite Database Management Tools */}
        <div className="card" style={{ marginTop: '40px', background: 'var(--sand-50)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={20} color="var(--green-700)" /> In-Browser SQLite Database Tools
          </h3>
          <p>
            This application uses an in-browser SQLite WebAssembly engine. You can backup your current database, import a database, or execute raw SQL.
          </p>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', margin: '20px 0' }}>
            <button onClick={handleExport} className="btn btn-primary btn-sm">
              <Download size={16} /> Export Database (.sqlite)
            </button>

            <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer', margin: 0 }}>
              <Upload size={16} /> Import Database File
              <input type="file" accept=".sqlite,.db" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>

            <button onClick={handleResetDb} className="btn btn-ghost btn-sm" style={{ color: '#dc2626', borderColor: '#fca5a5' }}>
              <RefreshCw size={16} /> Reset to Seed Data
            </button>
          </div>

          {/* Interactive SQL Console */}
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--line)' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Terminal size={16} /> SQL Console Query Tool
            </h4>
            <form onSubmit={runCustomSql} style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <input
                type="text"
                value={customSql}
                onChange={e => setCustomSql(e.target.value)}
                placeholder="Enter SQL command e.g. SELECT * FROM users"
                style={{ fontFamily: 'monospace', fontSize: '13px' }}
              />
              <button type="submit" className="btn btn-amber btn-sm">
                Run SQL
              </button>
            </form>

            {sqlError && (
              <div style={{ color: '#dc2626', fontSize: '13px', marginTop: '10px', fontFamily: 'monospace' }}>
                Error: {sqlError}
              </div>
            )}

            {sqlResult && (
              <div style={{ marginTop: '14px', overflowX: 'auto' }}>
                <p style={{ fontSize: '12px', fontWeight: '700' }}>Results ({sqlResult.length} rows):</p>
                <pre style={{ background: '#1e293b', color: '#f8fafc', padding: '14px', borderRadius: '8px', fontSize: '12px', overflowX: 'auto' }}>
                  {JSON.stringify(sqlResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};
