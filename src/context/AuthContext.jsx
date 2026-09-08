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

    const isAdminEmail = cleanEmail === 'mwimantwaliblaise@gmail.com' || cleanEmail === 'info@forlocalltd.com' || cleanEmail === 'admin@for-local.rw';

    let rows = query('SELECT * FROM users WHERE LOWER(email) = ?', [cleanEmail]);
    
    // Auto-create official admin if missing from local SQLite database
    if (rows.length === 0) {
      if (isAdminEmail) {
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
      (isAdminEmail && cleanPassword === 'Mwima@22022003');

    if (isPasswordValid) {
      const targetRole = isAdminEmail ? 'admin' : (foundUser.role || 'guest');
      
      // Update password hash or role if needed
      if (foundUser.password_hash !== cleanPassword && cleanPassword === 'Mwima@22022003') {
        exec("UPDATE users SET password_hash = 'Mwima@22022003', role = ? WHERE id = ?", [targetRole, foundUser.id]);
      } else if (foundUser.role !== targetRole) {
        exec("UPDATE users SET role = ? WHERE id = ?", [targetRole, foundUser.id]);
      }

      const userPayload = {
        id: foundUser.id,
        full_name: foundUser.full_name,
        email: foundUser.email,
        role: targetRole
      };
      setUser(userPayload);
      return { success: true, user: userPayload };
    }
    return { success: false, error: 'Incorrect email or password.' };
  };

  const register = (fullName, email, password) => {
    if (!isReady) return { success: false, error: 'Database is loading...' };
    const cleanEmail = (email || '').trim().toLowerCase();
    const existing = query('SELECT id FROM users WHERE LOWER(email) = ?', [cleanEmail]);
    if (existing.length > 0) {
      return { success: false, error: 'An account with that email already exists.' };
    }

    const isAdminEmail = cleanEmail === 'mwimantwaliblaise@gmail.com' || cleanEmail === 'info@forlocalltd.com';
    const role = isAdminEmail ? 'admin' : 'guest';

    exec('INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)', [
      fullName.trim(),
      cleanEmail,
      password,
      role
    ]);

    const created = query('SELECT * FROM users WHERE LOWER(email) = ?', [cleanEmail])[0];
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
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isAdmin: user?.role === 'admin',
      isHost: user?.role === 'host',
      isGuest: user?.role === 'guest' || !user
    }}>
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
