import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import Header from './components/common/Header';
import MobileNavigation from './components/common/Navigation';
import AuthScreen from './components/auth/AuthScreen';
import LearnerStudio from './components/learner/LearnerStudio';
import AdminDashboard from './components/admin/AdminDashboard';
import { api, post } from './services/api';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

const tabPaths = { home: '/', course: '/course', theory: '/theory', practice: '/practice', portfolio: '/portfolio', more: '/more' };

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const tab = Object.keys(tabPaths).find((key) => tabPaths[key] === location.pathname);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [refresh, setRefresh] = useState(0);

  const run = async (fn) => {
    setError('');
    setNotice('');
    try {
      await fn();
      setRefresh((x) => x + 1);
    } catch (e) {
      setError(e.message || 'An unexpected error occurred');
    }
  };

  useEffect(() => {
    api('/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => {
        // Not authenticated or session expired
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    run(async () => {
      await post('/auth/logout', {});
      setUser(null);
      navigate(user.role === 'admin' ? '/admin' : '/');
    });
  };

  const handleSelectTab = (newTab) => {
    navigate(tabPaths[newTab] || '/');
    setError('');
    setNotice('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    setError('');
    setNotice('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '100vh' }}>
        <div className="card text-center" style={{ padding: '40px 48px', maxWidth: 420 }}>
          <div className="brand-icon-wrapper" style={{ margin: '0 auto 16px', width: 48, height: 48 }}>
            <span style={{ fontSize: '1.4rem' }}>🎮</span>
          </div>
          <h2 style={{ marginBottom: 6 }}>Scope GT</h2>
          <p className="text-muted text-sm">Initializing testing environment & verifying session…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header
        user={user}
        currentTab={tab}
        onLogout={handleLogout}
      />

      {/* Global Alerts / Toasts */}
      {(error || notice) && (
        <div className="layout" style={{ paddingBottom: 0, paddingTop: 16 }}>
          {error && (
            <div className="alert alert-error">
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ flex: 1 }}>{error}</div>
              <button
                type="button"
                className="btn icon-only ghost"
                style={{ padding: 4, minHeight: 24, minWidth: 24 }}
                onClick={() => setError('')}
              >
                <X size={15} />
              </button>
            </div>
          )}

          {notice && (
            <div className="alert alert-success">
              <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ flex: 1 }}>{notice}</div>
              <button
                type="button"
                className="btn icon-only ghost"
                style={{ padding: 4, minHeight: 24, minWidth: 24 }}
                onClick={() => setNotice('')}
              >
                <X size={15} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Content Router */}
      {!user ? (
        <AuthScreen onAuth={(authenticatedUser) => {
          setUser(authenticatedUser);
          if (authenticatedUser.role === 'admin') navigate('/admin', { replace: true });
          else if (location.pathname === '/admin') navigate('/', { replace: true });
        }} onError={setError} />
      ) : user.role === 'admin' ? (
        location.pathname === '/admin' ? <AdminDashboard key={refresh} run={run} setNotice={setNotice} /> : <Navigate to="/admin" replace />
      ) : !tab ? (
        <Navigate to="/" replace />
      ) : (
        <>
          <main className="layout learner">
            <LearnerStudio
              key={`${tab}-${refresh}`}
              tab={tab}
              user={user}
              setUser={setUser}
              go={handleSelectTab}
              run={run}
              setNotice={setNotice}
            />
          </main>
          <MobileNavigation currentTab={tab} />
        </>
      )}
    </>
  );
}
