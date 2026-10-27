import React, { useState } from 'react';
import { Gamepad2, Shield, Sparkles, CheckCircle2, Lock, ArrowRight } from 'lucide-react';
import FormField from '../common/FormField';
import { post } from '../../services/api';

export default function AuthScreen({ onAuth, onError }) {
  const [isAdminPath, setIsAdminPath] = useState(window.location.pathname === '/admin');
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    learnerRole: 'Student'
  });
  const [busy, setBusy] = useState(false);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const isRegistering = !isAdminPath && mode === 'register';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    onError('');

    try {
      const endpoint = isAdminPath
        ? '/auth/admin/login'
        : mode === 'login'
        ? '/auth/login'
        : '/auth/register';

      const payload = isAdminPath
        ? { email: form.email, password: form.password }
        : mode === 'login'
        ? { email: form.email, password: form.password }
        : form;

      const response = await post(endpoint, payload);
      onAuth(response.user);
    } catch (err) {
      onError(err.message || 'Authentication failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="flex items-center justify-between mb-4">
          <div className="brand" style={{ fontSize: '1.35rem' }}>
            <div className="brand-icon-wrapper">
              <Gamepad2 size={22} />
            </div>
            <div>
              Game QA <span>Academy</span>
            </div>
          </div>
          {isAdminPath ? (
            <span className="badge badge-major">
              <Shield size={12} /> Admin Mode
            </span>
          ) : (
            <span className="badge badge-success">Learner Studio</span>
          )}
        </div>

        <h1>
          {isAdminPath
            ? 'Administrator Sign-In'
            : mode === 'login'
            ? 'Learner Sign-In'
            : 'Create Learner Account'}
        </h1>
        <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: 20 }}>
          {isAdminPath
            ? 'Authorized access for curriculum administration, review queues, and academy analytics.'
            : 'Master game QA fundamentals, defect reporting, and build a verified industry portfolio.'}
        </p>

        {!isAdminPath && (
          <div className="auth-mode-switch">
            <button
              type="button"
              className={`auth-mode-btn ${mode === 'login' ? 'active' : ''}`}
              onClick={() => setMode('login')}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-mode-btn ${mode === 'register' ? 'active' : ''}`}
              onClick={() => setMode('register')}
            >
              Create Account
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <FormField
              label="Full Name"
              name="name"
              placeholder="e.g. Alex Mercer"
              value={form.name}
              onChange={updateField}
              required
            />
          )}

          <FormField
            label="Email Address"
            name="email"
            kind="email"
            placeholder="e.g. alex@example.com"
            value={form.email}
            onChange={updateField}
            required
          />

          <FormField
            label="Password"
            name="password"
            kind="password"
            placeholder={isRegistering ? 'Minimum 8 characters' : 'Enter your password'}
            value={form.password}
            onChange={updateField}
            required
          />

          {isRegistering && (
            <FormField
              label="Learner Background / Role"
              name="learnerRole"
              choices={['Student', 'Aspiring Tester', 'Working Professional']}
              value={form.learnerRole}
              onChange={updateField}
            />
          )}

          <button
            type="submit"
            disabled={busy}
            className="btn primary w-full mt-4"
            style={{ height: '46px', fontSize: '1rem' }}
          >
            {busy ? (
              'Processing…'
            ) : isAdminPath ? (
              <>Sign In as Administrator <ArrowRight size={18} /></>
            ) : mode === 'login' ? (
              <>Sign In <ArrowRight size={18} /></>
            ) : (
              <>Register Account <Sparkles size={18} /></>
            )}
          </button>
        </form>

        <div className="flex items-center justify-between mt-4" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
          <button
            type="button"
            className="btn-link"
            style={{ fontSize: '0.82rem' }}
            onClick={() => {
              setIsAdminPath(!isAdminPath);
              onError('');
            }}
          >
            {isAdminPath ? 'Switch to Learner Sign-In' : 'Switch to Admin Portal'}
          </button>

          {!isAdminPath && (
            <button
              type="button"
              className="btn-link"
              style={{ fontSize: '0.82rem' }}
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                onError('');
              }}
            >
              {mode === 'login' ? 'New here? Register' : 'Already registered?'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
