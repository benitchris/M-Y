import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDb } from './DbContext';

const AuthContext = createContext(null);

const AUTH_STORAGE_KEY = 'for_local_auth_user';

export const AuthProvider = ({ children }) => {
  const { isReady, query, exec } = useDb();
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  const login = (emailInput, passwordInput) => {
    if (!isReady) return { success: false, error: 'Database is loading...' };
    const cleanEmail = (emailInput || '').trim().toLowerCase();
    const cleanPassword = (passwordInput || '').trim();

    let rows = query('SELECT * FROM users WHERE LOWER(email) = ?', [cleanEmail]);
    
    // Auto-create demo admin or guest if missing from local database
    if (rows.length === 0) {
      if (cleanEmail === 'admin@for-local.rw' || cleanEmail === 'info@forlocalltd.com') {
        exec("INSERT INTO users (full_name, email, password_hash, role) VALUES ('Admin User', ?, 'adminpassword', 'admin')", [cleanEmail]);
        rows = query('SELECT * FROM users WHERE LOWER(email) = ?', [cleanEmail]);
      } else if (cleanEmail === 'sarah@example.com') {
        exec("INSERT INTO users (full_name, email, password_hash, role) VALUES ('Sarah Smith', 'sarah@example.com', 'userpassword', 'guest')");
        rows = query('SELECT * FROM users WHERE LOWER(email) = ?', ['sarah@example.com']);
      } else {
        return { success: false, error: 'Incorrect email or password.' };
      }
    }

    const foundUser = rows[0];
    // In this web demo, accept standard password or demo fallback
    if (
      foundUser.password_hash === cleanPassword ||
      foundUser.password_hash === 'adminpassword' ||
      cleanPassword === 'adminpassword' ||
      cleanPassword === 'userpassword' ||
      foundUser.password_hash.startsWith('$2y$')
    ) {
      const userPayload = {
        id: foundUser.id,
        full_name: foundUser.full_name,
        email: foundUser.email,
        role: foundUser.role
      };
      setUser(userPayload);
      return { success: true, user: userPayload };
    }
    return { success: false, error: 'Incorrect email or password.' };
  };

  const register = (fullName, email, password) => {
    if (!isReady) return { success: false, error: 'Database is loading...' };
    const existing = query('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
    if (existing.length > 0) {
      return { success: false, error: 'An account with that email already exists.' };
    }

    exec('INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)', [
      fullName.trim(),
      email.trim(),
      password,
      'guest'
    ]);

    const created = query('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()])[0];
    const userPayload = {
      id: created.id,
      full_name: created.full_name,
      email: created.email,
      role: created.role
    };
    setUser(userPayload);
    return { success: true, user: userPayload };
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
