import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { DbProvider } from './context/DbContext';
import { AuthProvider } from './context/AuthContext';

import { Header } from './components/Header';
import { Footer } from './components/Footer';

import { HomePage } from './pages/HomePage';
import { HostsPage } from './pages/HostsPage';
import { HostProfilePage } from './pages/HostProfilePage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { BecomeHostPage } from './pages/BecomeHostPage';
import { ContactPage } from './pages/ContactPage';
import { AboutPage } from './pages/AboutPage';
import { SafetyPage } from './pages/SafetyPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

export function App() {
  return (
    <DbProvider>
      <AuthProvider>
        <Router>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <div style={{ flex: 1 }}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/hosts" element={<HostsPage />} />
                <Route path="/hosts/:id" element={<HostProfilePage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/become-host" element={<BecomeHostPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/safety" element={<SafetyPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/admin" element={<AdminDashboardPage />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </DbProvider>
  );
}

export default App;
