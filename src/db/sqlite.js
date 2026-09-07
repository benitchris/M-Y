import initSqlJs from 'sql.js';
import { INIT_SCHEMA_SQL, SEED_DATA_SQL } from './schema.js';

const STORAGE_KEY = 'for_local_sqlite_db_v1';

let dbInstance = null;
let SQL = null;

async function loadSqlEngine() {
  const cdnPromise = initSqlJs({
    locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/${file}`
  });

  const localPromise = initSqlJs({
    locateFile: file => `./${file}`
  });

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('WASM load timeout')), 4000)
  );

  try {
    return await Promise.race([cdnPromise, timeoutPromise]);
  } catch (e1) {
    console.warn('Primary WASM load failed or timed out, trying fallback local WASM...', e1);
    try {
      return await localPromise;
    } catch (e2) {
      console.error('All WASM initializations failed:', e2);
      throw e2;
    }
  }
}

export async function initDb() {
  if (dbInstance) return dbInstance;

  try {
    SQL = await loadSqlEngine();
  } catch (err) {
    console.error('Failed to load SQL engine:', err);
  }

  if (!SQL) {
    console.warn('Running in fallback memory state due to WASM failure');
  }

  const savedDbBase64 = localStorage.getItem(STORAGE_KEY);
  if (savedDbBase64 && SQL) {
    try {
      const binaryString = atob(savedDbBase64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      dbInstance = new SQL.Database(bytes);
      // Run auto migration for photo_url
      try { dbInstance.run("ALTER TABLE hosts ADD COLUMN photo_url TEXT;"); } catch (e) {}
      try { dbInstance.run("ALTER TABLE host_applications ADD COLUMN photo_url TEXT;"); } catch (e) {}

      // Ensure seed users exist
      try {
        const stmt = dbInstance.prepare('SELECT COUNT(*) AS c FROM users');
        let userCount = 0;
        if (stmt.step()) {
          userCount = stmt.getAsObject().c;
        }
        stmt.free();
        if (userCount === 0) {
          dbInstance.run(SEED_DATA_SQL);
          persistDb(dbInstance);
        }
      } catch (e) {
        dbInstance.run(INIT_SCHEMA_SQL);
        dbInstance.run(SEED_DATA_SQL);
        persistDb(dbInstance);
      }

      console.log('SQLite loaded successfully from localStorage');
      return dbInstance;
    } catch (e) {
      console.error('Failed to load saved SQLite DB, initializing fresh:', e);
    }
  }

  // Create brand new database
  if (SQL) {
    dbInstance = new SQL.Database();
    dbInstance.run(INIT_SCHEMA_SQL);
    dbInstance.run(SEED_DATA_SQL);
    persistDb(dbInstance);
    console.log('SQLite database initialized with fresh schema and seed data');
  }

  return dbInstance;
}

export function getDb() {
  return dbInstance;
}

export function persistDb(db = dbInstance) {
  if (!db) return;
  try {
    const data = db.export();
    let binary = '';
    const bytes = new Uint8Array(data);
    const chunk = 8192;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    const base64 = btoa(binary);
    localStorage.setItem(STORAGE_KEY, base64);
  } catch (err) {
    console.error('Error saving SQLite database to storage:', err);
  }
}

export function queryDb(sql, params = []) {
  if (!dbInstance) return [];
  try {
    const stmt = dbInstance.prepare(sql);
    stmt.bind(params);
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  } catch (err) {
    console.error('Query error:', sql, params, err);
    throw err;
  }
}

export function execDb(sql, params = []) {
  if (!dbInstance) return;
  try {
    dbInstance.run(sql, params);
    persistDb(dbInstance);
  } catch (err) {
    console.error('Execution error:', sql, params, err);
    throw err;
  }
}

export function resetDbToSeed() {
  localStorage.removeItem(STORAGE_KEY);
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
  return initDb();
}

export function exportDbFile() {
  if (!dbInstance) return null;
  const data = dbInstance.export();
  const blob = new Blob([data], { type: 'application/x-sqlite3' });
  return blob;
}

export function importDbFile(arrayBuffer) {
  if (!SQL) return false;
  try {
    const bytes = new Uint8Array(arrayBuffer);
    if (dbInstance) {
      dbInstance.close();
    }
    dbInstance = new SQL.Database(bytes);
    persistDb(dbInstance);
    return true;
  } catch (err) {
    console.error('Failed to import database file:', err);
    return false;
  }
}
