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
  const [hostCount, setHostCount] = useState(0);

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
      const hCount = query('SELECT COUNT(*) AS c FROM hosts')[0]?.c || 0;

      setApplications(apps);
      setBookings(bks);
      setMessages(msgs);
      setHostCount(hCount);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  }, [isReady, query, dbVersion]);

  const updateAppStatus = (id, newStatus) => {
    exec('UPDATE host_applications SET status = ? WHERE id = ?', [newStatus, id]);
    showNotice(`Application #${id} status updated to ${newStatus}`);
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

        {/* Host Applications Table */}
        <h2 style={{ marginBottom: '16px' }}>Host Applications</h2>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>City</th>
                <th>Languages</th>
                <th>Phone</th>
                <th>About</th>
                <th>Status</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center' }}>No applications yet.</td></tr>
              ) : (
                applications.map(a => (
                  <tr key={a.id}>
                    <td><strong>{a.full_name}</strong></td>
                    <td>{a.city}</td>
                    <td>{a.languages}</td>
                    <td>{a.phone}</td>
                    <td style={{ maxWidth: '240px' }}>{a.about}</td>
                    <td>
                      <select
                        className={`status-select status-${a.status}`}
                        value={a.status}
                        onChange={e => updateAppStatus(a.id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--ink-600)' }}>{a.created_at}</td>
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
