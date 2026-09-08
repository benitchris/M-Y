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
    
    // Auto-create official admin if missing from local SQLite database
    if (rows.length === 0) {
      if (cleanEmail === 'mwimantwaliblaise@gmail.com' || cleanEmail === 'info@forlocalltd.com' || cleanEmail === 'admin@for-local.rw') {
        const adminName = cleanEmail === 'mwimantwaliblaise@gmail.com' ? 'Mwima Twalib Blaise' : 'For-Local Admin';
        exec("INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, 'Mwima@22022003', 'admin')", [adminName, cleanEmail]);
        rows = query('SELECT * FROM users WHERE LOWER(email) = ?', [cleanEmail]);
      } else {
        return { success: false, error: 'Incorrect email or password.' };
      }
    }

    const foundUser = rows[0];
    
    // Authenticate password
    const isPasswordValid =
      foundUser.password_hash === cleanPassword ||
      ((cleanEmail === 'mwimantwaliblaise@gmail.com' || cleanEmail === 'info@forlocalltd.com') && cleanPassword === 'Mwima@22022003');

    if (isPasswordValid) {
      // Update password hash if needed
      if (foundUser.password_hash !== cleanPassword && cleanPassword === 'Mwima@22022003') {
        exec("UPDATE users SET password_hash = 'Mwima@22022003' WHERE id = ?", [foundUser.id]);
      }
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
