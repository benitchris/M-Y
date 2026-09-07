import initSqlJs from 'sql.js';
import { INIT_SCHEMA_SQL, SEED_DATA_SQL } from './schema.js';

const STORAGE_KEY_WASM = 'for_local_sqlite_db_v1';
const STORAGE_KEY_JSON = 'for_local_json_db_v2';

let dbInstance = null;
let SQL = null;

// Built-in Seed Data Store for 100% reliable instant local operations
const DEFAULT_SEED_STORE = {
  users: [
    { id: 1, full_name: 'Admin User', email: 'admin@for-local.rw', password_hash: 'adminpassword', role: 'admin', created_at: '2026-01-01 00:00:00' },
    { id: 2, full_name: 'Admin User', email: 'info@forlocalltd.com', password_hash: 'adminpassword', role: 'admin', created_at: '2026-01-01 00:00:00' },
    { id: 3, full_name: 'Sarah Smith', email: 'sarah@example.com', password_hash: 'userpassword', role: 'guest', created_at: '2026-01-01 00:00:00' }
  ],
  hosts: [
    {
      id: 1, user_id: null, name: 'Alice U.', city: 'kigali', languages: 'english,french', activity: 'orientation',
      rate: 18.00, rating: 4.9, review_count: 61, verified: 1, hosting_since: 2024, photo_color: '#C0DD97',
      photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      bio: 'I grew up in Kigali and love showing visitors the city beyond the guidebook — the markets locals actually shop at, the best brochette spot in Nyamirambo, and how to get around without getting lost in translation. I studied English and French at university and have been helping travelers navigate Rwanda for two years.',
      whats_included: 'Full translation support throughout your session\nLocal etiquette and cultural context as you go\nHelp with mobile money, SIM cards, or local transport\nHonest recommendations — no commission-driven detours'
    },
    {
      id: 2, user_id: null, name: 'Eric M.', city: 'kigali', languages: 'english,kinyarwanda', activity: 'food',
      rate: 22.00, rating: 5.0, review_count: 34, verified: 1, hosting_since: 2023, photo_color: '#F0997B',
      photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
      bio: 'Kigali-born food lover who knows every market stall worth visiting.',
      whats_included: 'Guided market tours\nFood tastings with trusted vendors\nTranslation support\nBargaining help'
    },
    {
      id: 3, user_id: null, name: 'Diane K.', city: 'kigali', languages: 'english,french,swahili', activity: 'business',
      rate: 25.00, rating: 4.8, review_count: 28, verified: 1, hosting_since: 2023, photo_color: '#85B7EB',
      photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
      bio: 'I support business travelers with meeting logistics, interpretation, and getting around Kigali efficiently.',
      whats_included: 'Meeting and appointment support\nProfessional interpretation\nAirport and hotel coordination\nLocal business etiquette guidance'
    },
    {
      id: 4, user_id: null, name: 'Jean Paul N.', city: 'musanze', languages: 'english', activity: 'fullday',
      rate: 30.00, rating: 4.9, review_count: 19, verified: 1, hosting_since: 2024, photo_color: '#F0A83B',
      photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
      bio: 'Based in Musanze, I guide full-day trips around the Volcanoes region.',
      whats_included: 'Full-day itinerary planning\nTransport coordination\nTranslation and local context\nPhoto stops at the best viewpoints'
    },
    {
      id: 5, user_id: null, name: 'Claudine I.', city: 'huye', languages: 'english,french', activity: 'orientation',
      rate: 16.00, rating: 4.7, review_count: 12, verified: 1, hosting_since: 2024, photo_color: '#AFA9EC',
      photo_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=600&q=80',
      bio: 'A Huye local who enjoys introducing visitors to the university town and its history.',
      whats_included: 'City orientation walks\nTranslation support\nRecommendations for food and stays\nHistorical context'
    },
    {
      id: 6, user_id: null, name: 'Aime K.', city: 'kigali', languages: 'english,swahili', activity: 'fullday',
      rate: 24.00, rating: 4.9, review_count: 45, verified: 1, hosting_since: 2023, photo_color: '#D4537E',
      photo_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=80',
      bio: 'I put together full days in Kigali mixing culture, food, and the city\'s best viewpoints.',
      whats_included: 'Full-day custom itinerary\nTranslation throughout\nMobile money and SIM card help\nHonest, no-commission recommendations'
    }
  ],
  host_reviews: [
    { id: 1, host_id: 1, author_name: 'Sofia', author_country: 'Spain', rating: 5.0, comment: 'Alice made our first day in Kigali so much easier. She translated everything at the market and helped us bargain fairly.' },
    { id: 2, host_id: 1, author_name: 'Tom', author_country: 'UK', rating: 5.0, comment: 'Genuinely felt like being shown around by a friend. Highly recommend for solo travelers.' },
    { id: 3, host_id: 2, author_name: 'Marcus', author_country: 'Germany', rating: 5.0, comment: 'Eric showed us food spots we would never have found on our own. Incredible brochettes and fresh juices!' },
    { id: 4, host_id: 4, author_name: 'Claire', author_country: 'Canada', rating: 4.9, comment: 'Jean Paul took care of all volcano trip logistics seamlessly. Super knowledgeable host!' }
  ],
  bookings: [
    { id: 1, host_id: 1, guest_name: 'David Miller', guest_email: 'david@example.com', session_type: 'City orientation — $18.00/hr', booking_date: '2026-09-15', hours: 3, estimated_total: 54.00, status: 'confirmed' },
    { id: 2, host_id: 2, guest_name: 'Elena Rostova', guest_email: 'elena@example.com', session_type: 'Markets & food — $22.00/hr', booking_date: '2026-09-20', hours: 2, estimated_total: 44.00, status: 'pending' }
  ],
  host_applications: [
    { id: 1, full_name: 'Emmanuel K.', city: 'kigali', languages: 'English, French, Kinyarwanda', phone: '+250 788 123 456', about: 'I am a university student in Kigali who loves photography and local art galleries.', photo_url: null, status: 'pending', created_at: '2026-09-01 10:00:00' }
  ],
  contact_messages: [
    { id: 1, name: 'Rachel Adams', email: 'rachel@example.com', topic: 'General question', message: 'Hi, can I book a host for a group of 4 people?', status: 'new', created_at: '2026-09-01 11:00:00' }
  ]
};

function loadJsonStore() {
  try {
    const dataStr = localStorage.getItem(STORAGE_KEY_JSON);
    if (dataStr) {
      const parsed = JSON.parse(dataStr);
      // Migration check for missing tables or columns
      if (parsed.users && parsed.hosts) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed reading json db, resetting to default seed:', e);
  }
  saveJsonStore(DEFAULT_SEED_STORE);
  return DEFAULT_SEED_STORE;
}

function saveJsonStore(store) {
  try {
    localStorage.setItem(STORAGE_KEY_JSON, JSON.stringify(store));
  } catch (e) {
    console.error('Failed saving json db:', e);
  }
}

let jsonStore = loadJsonStore();

export async function initDb() {
  if (dbInstance) return dbInstance;

  try {
    const cdnPromise = initSqlJs({ locateFile: f => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/${f}` });
    const timeoutPromise = new Promise((_, r) => setTimeout(() => r(new Error('timeout')), 2500));
    SQL = await Promise.race([cdnPromise, timeoutPromise]);
    if (SQL) {
      dbInstance = new SQL.Database();
      dbInstance.run(INIT_SCHEMA_SQL);
      dbInstance.run(SEED_DATA_SQL);
    }
  } catch (err) {
    console.warn('Sql.js background initialization deferred. Operating synchronously on Local Data Store.');
  }

  return dbInstance;
}

export function getDb() {
  return dbInstance;
}

export function persistDb() {
  saveJsonStore(jsonStore);
}

export function queryDb(sqlStr, params = []) {
  const cleanSql = sqlStr.trim();
  
  // Try WASM instance if available
  if (dbInstance) {
    try {
      const stmt = dbInstance.prepare(cleanSql);
      stmt.bind(params);
      const results = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      stmt.free();
      if (results.length > 0 || !cleanSql.toLowerCase().includes('from users')) {
        return results;
      }
    } catch (e) {
      console.warn('WASM query fallback to JSON store:', e);
    }
  }

  // Pure Synchronous JSON Store Engine Fallback
  const lowerSql = cleanSql.toLowerCase();

  // 1. SELECT COUNT(*) AS c FROM hosts
  if (lowerSql.includes('count(*)')) {
    if (lowerSql.includes('from hosts')) {
      return [{ c: jsonStore.hosts.length }];
    }
  }

  // 2. USERS Queries
  if (lowerSql.includes('from users')) {
    if (params.length > 0) {
      const targetEmail = String(params[0]).toLowerCase();
      const matched = jsonStore.users.filter(u => u.email.toLowerCase() === targetEmail);
      return matched;
    }
    return [...jsonStore.users];
  }

  // 3. HOSTS Queries
  if (lowerSql.includes('from hosts')) {
    let result = [...jsonStore.hosts];
    if (lowerSql.includes('where id =')) {
      const targetId = parseInt(params[0], 10);
      return result.filter(h => h.id === targetId);
    }
    if (lowerSql.includes('lower(city) = lower(?)')) {
      const city = String(params[0]).toLowerCase();
      result = result.filter(h => h.city.toLowerCase() === city);
    }
    if (lowerSql.includes('activity = ?')) {
      const actIdx = lowerSql.includes('lower(city) = lower(?)') ? 1 : 0;
      const activity = String(params[actIdx]);
      result = result.filter(h => h.activity === activity);
    }
    if (lowerSql.includes('like lower(?)')) {
      const langParam = String(params[params.length - 1]).replace(/%/g, '').toLowerCase();
      result = result.filter(h => h.languages.toLowerCase().includes(langParam));
    }
    if (lowerSql.includes('verified = 1')) {
      result = result.filter(h => h.verified === 1);
    }
    if (lowerSql.includes('order by rating desc')) {
      result.sort((a, b) => b.rating - a.rating);
    }
    if (lowerSql.includes('limit 3')) {
      result = result.slice(0, 3);
    }
    return result;
  }

  // 4. HOST_REVIEWS Queries
  if (lowerSql.includes('from host_reviews')) {
    if (lowerSql.includes('where host_id =')) {
      const hostId = parseInt(params[0], 10);
      return jsonStore.host_reviews.filter(r => r.host_id === hostId);
    }
    return [...jsonStore.host_reviews];
  }

  // 5. BOOKINGS Queries
  if (lowerSql.includes('from bookings')) {
    const list = jsonStore.bookings.map(b => {
      const host = jsonStore.hosts.find(h => h.id === b.host_id);
      return { ...b, host_name: host ? host.name : `Host #${b.host_id}` };
    });
    return list;
  }

  // 6. HOST_APPLICATIONS Queries
  if (lowerSql.includes('from host_applications')) {
    return [...jsonStore.host_applications];
  }

  // 7. CONTACT_MESSAGES Queries
  if (lowerSql.includes('from contact_messages')) {
    return [...jsonStore.contact_messages];
  }

  return [];
}

export function execDb(sqlStr, params = []) {
  const cleanSql = sqlStr.trim();
  const lowerSql = cleanSql.toLowerCase();

  // Try WASM instance if available
  if (dbInstance) {
    try {
      dbInstance.run(cleanSql, params);
    } catch (e) {
      console.warn('WASM exec fallback to JSON store:', e);
    }
  }

  // 1. INSERT INTO users
  if (lowerSql.startsWith('insert into users')) {
    const newUser = {
      id: jsonStore.users.length + 1,
      full_name: params[0],
      email: params[1],
      password_hash: params[2],
      role: params[3] || 'guest',
      created_at: new Date().toISOString()
    };
    jsonStore.users.push(newUser);
  }

  // 2. INSERT INTO hosts
  if (lowerSql.startsWith('insert into hosts')) {
    const newHost = {
      id: jsonStore.hosts.length + 1,
      name: params[0],
      city: params[1],
      languages: params[2],
      activity: params[3] || 'orientation',
      rate: parseFloat(params[4]) || 20.0,
      rating: 5.0,
      review_count: 0,
      bio: params[5] || '',
      photo_url: params[6] || null,
      verified: params[7] !== undefined ? params[7] : 1,
      hosting_since: params[8] || new Date().getFullYear(),
      photo_color: '#C0DD97'
    };
    jsonStore.hosts.push(newHost);
  }

  // 3. INSERT INTO bookings
  if (lowerSql.startsWith('insert into bookings')) {
    const newBooking = {
      id: jsonStore.bookings.length + 1,
      host_id: params[0],
      guest_name: params[1],
      guest_email: params[2],
      session_type: params[3],
      booking_date: params[4],
      hours: params[5],
      estimated_total: params[6],
      status: 'pending',
      created_at: new Date().toISOString()
    };
    jsonStore.bookings.push(newBooking);
  }

  // 4. INSERT INTO host_applications
  if (lowerSql.startsWith('insert into host_applications')) {
    const newApp = {
      id: jsonStore.host_applications.length + 1,
      full_name: params[0],
      city: params[1],
      languages: params[2],
      phone: params[3],
      about: params[4],
      photo_url: params[5] || null,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    jsonStore.host_applications.push(newApp);
  }

  // 5. INSERT INTO contact_messages
  if (lowerSql.startsWith('insert into contact_messages')) {
    const newMsg = {
      id: jsonStore.contact_messages.length + 1,
      name: params[0],
      email: params[1],
      topic: params[2],
      message: params[3],
      status: 'new',
      created_at: new Date().toISOString()
    };
    jsonStore.contact_messages.push(newMsg);
  }

  // 6. UPDATES
  if (lowerSql.startsWith('update host_applications set status =')) {
    const status = params[0];
    const id = parseInt(params[1], 10);
    const app = jsonStore.host_applications.find(a => a.id === id);
    if (app) app.status = status;
  }

  if (lowerSql.startsWith('update bookings set status =')) {
    const status = params[0];
    const id = parseInt(params[1], 10);
    const bk = jsonStore.bookings.find(b => b.id === id);
    if (bk) bk.status = status;
  }

  if (lowerSql.startsWith('update contact_messages set status =')) {
    const status = params[0];
    const id = parseInt(params[1], 10);
    const msg = jsonStore.contact_messages.find(m => m.id === id);
    if (msg) msg.status = status;
  }

  if (lowerSql.startsWith('update hosts set photo_url =')) {
    const url = params[0];
    const id = parseInt(params[1], 10);
    const h = jsonStore.hosts.find(x => x.id === id);
    if (h) h.photo_url = url;
  }

  if (lowerSql.startsWith('update hosts set verified =')) {
    const v = params[0];
    const id = parseInt(params[1], 10);
    const h = jsonStore.hosts.find(x => x.id === id);
    if (h) h.verified = v;
  }

  // 7. DELETES
  if (lowerSql.startsWith('delete from hosts where id =')) {
    const id = parseInt(params[0], 10);
    jsonStore.hosts = jsonStore.hosts.filter(h => h.id !== id);
  }

  saveJsonStore(jsonStore);
}

export function resetDbToSeed() {
  jsonStore = DEFAULT_SEED_STORE;
  saveJsonStore(DEFAULT_SEED_STORE);
  localStorage.removeItem(STORAGE_KEY_WASM);
  if (dbInstance) {
    try { dbInstance.close(); } catch (e) {}
    dbInstance = null;
  }
  return initDb();
}

export function exportDbFile() {
  const jsonString = JSON.stringify(jsonStore, null, 2);
  return new Blob([jsonString], { type: 'application/json' });
}

export function importDbFile(arrayBuffer) {
  try {
    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(arrayBuffer);
    const parsed = JSON.parse(text);
    if (parsed.users && parsed.hosts) {
      jsonStore = parsed;
      saveJsonStore(jsonStore);
      return true;
    }
  } catch (e) {
    console.error('Failed parsing imported store:', e);
  }
  return false;
}

