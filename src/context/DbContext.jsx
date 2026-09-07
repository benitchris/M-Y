import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { initDb, queryDb, execDb, resetDbToSeed, exportDbFile, importDbFile } from '../db/sqlite';

const DbContext = createContext(null);

export const DbProvider = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const [dbVersion, setDbVersion] = useState(0);

  useEffect(() => {
    initDb().then(() => {
      setIsReady(true);
    }).catch(err => {
      console.error('Failed to initialize SQLite database:', err);
    });
  }, []);

  const refresh = useCallback(() => {
    setDbVersion(v => v + 1);
  }, []);

  const query = useCallback((sql, params = []) => {
    return queryDb(sql, params);
  }, []);

  const exec = useCallback((sql, params = []) => {
    execDb(sql, params);
    refresh();
  }, [refresh]);

  const resetDb = useCallback(async () => {
    await resetDbToSeed();
    refresh();
  }, [refresh]);

  const exportDb = useCallback(() => {
    return exportDbFile();
  }, []);

  const importDb = useCallback(async (buffer) => {
    const success = importDbFile(buffer);
    if (success) {
      refresh();
    }
    return success;
  }, [refresh]);

  return (
    <DbContext.Provider value={{ isReady, dbVersion, query, exec, refresh, resetDb, exportDb, importDb }}>
      {children}
    </DbContext.Provider>
  );
};

export const useDb = () => {
  const context = useContext(DbContext);
  if (!context) {
    throw new Error('useDb must be used within a DbProvider');
  }
  return context;
};
