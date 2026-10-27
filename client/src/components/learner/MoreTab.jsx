import React, { useState } from 'react';
import { 
  User, 
  Award, 
  MessageSquare, 
  Download, 
  Printer, 
  Star, 
  Send, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';
import FormField from '../common/FormField';
import CertificateView from './CertificateView';
import { patch, post } from '../../services/api';

export default function MoreTab({ user, setUser, dash, bugs, cases, feedback, go, run, setNotice }) {
  const [profile, setProfile] = useState({
    name: user?.name || '',
    learnerRole: user?.learnerRole || 'Student'
  });
  const [feedbackForm, setFeedbackForm] = useState({
    rating: 5,
    message: ''
  });

  const handleSaveProfile = () => {
    run(async () => {
      const res = await patch('/auth/me', profile);
      setUser(res.user);
      setNotice('Profile details updated successfully');
    });
  };

  const handleIssueCert = () => {
    run(async () => {
      await post('/certificates/issue', {});
      setNotice('Certificate issued! Scroll down to view and print your record.');
    });
  };

  const handleSubmitFeedback = (e) => {
    e.preventDefault();
    if (!feedbackForm.message.trim()) return;

    run(async () => {
      await post('/feedback', feedbackForm);
      setFeedbackForm({ rating: 5, message: '' });
      setNotice('Thank you! Your feedback has been shared with academy mentors.');
    });
  };

  const exportJSON = () => {
    const payload = {
      profile: user,
      bugReports: bugs,
      testCases: cases,
      feedback: feedback
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gqa-portfolio.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Profile & Academy Utilities</h1>
          <p className="page-subtitle">
            Manage your account credentials, certificate issuance, course feedback, and data portability.
          </p>
        </div>
      </div>

      {/* Profile Settings */}
      <div className="card">
        <div className="card-header-row">
          <div className="flex items-center gap-2">
            <User size={20} style={{ color: '#10b981' }} />
            <h2 style={{ margin: 0 }}>Learner Profile</h2>
          </div>
          <span className="pill-role">{user?.learnerRole}</span>
        </div>

        <div className="form-grid-2">
          <FormField
            label="Display Name"
            name="name"
            value={profile.name}
            onChange={(_, val) => setProfile((p) => ({ ...p, name: val }))}
            required
          />
          <FormField
            label="Learner Career Role"
            name="learnerRole"
            choices={['Student', 'Aspiring Tester', 'Working Professional']}
            value={profile.learnerRole}
            onChange={(_, val) => setProfile((p) => ({ ...p, learnerRole: val }))}
          />
        </div>

        <button type="button" className="btn primary mt-2" onClick={handleSaveProfile}>
          Save Profile Changes
        </button>
      </div>

      {/* Certificate Section */}
      <div className="card">
        <div className="card-header-row">
          <div className="flex items-center gap-2">
            <Award size={20} style={{ color: '#f59e0b' }} />
            <h2 style={{ margin: 0 }}>Certificate of Completion</h2>
          </div>
          <span className={`badge ${dash?.certificate ? 'badge-success' : dash?.eligible ? 'badge-success' : 'badge-neutral'}`}>
            {dash?.certificate ? 'Issued' : dash?.eligible ? 'Ready' : 'Requirements Incomplete'}
          </span>
        </div>

        {dash?.certificate ? (
          <CertificateView
            user={user}
            cert={dash.certificate}
            bugs={bugs.length}
            cases={cases.length}
          />
        ) : (
          <div>
            <p className="text-muted">
              Complete all published lessons, log at least 1 bug report, and author 1 test case to unlock your verifiable certificate.
            </p>
            <button
              type="button"
              className="btn primary mt-2"
              disabled={!dash?.eligible}
              onClick={handleIssueCert}
            >
              <Sparkles size={16} /> Issue My Certificate
            </button>
          </div>
        )}
      </div>

      {/* Feedback Section */}
      <div className="card">
        <div className="card-header-row">
          <div className="flex items-center gap-2">
            <MessageSquare size={20} style={{ color: '#06b6d4' }} />
            <h2 style={{ margin: 0 }}>Course Feedback & Review</h2>
          </div>
        </div>

        <form onSubmit={handleSubmitFeedback}>
          <div className="form-grid-2">
            <FormField
              label="Course Rating"
              name="rating"
              choices={['5', '4', '3', '2', '1']}
              value={String(feedbackForm.rating)}
              onChange={(_, val) => setFeedbackForm((p) => ({ ...p, rating: Number(val) }))}
            />
          </div>

          <FormField
            label="Your Feedback / Suggestions"
            name="message"
            kind="textarea"
            placeholder="Share your thoughts on the curriculum clarity, defect templates, or suggestions for new modules..."
            value={feedbackForm.message}
            onChange={(_, val) => setFeedbackForm((p) => ({ ...p, message: val }))}
            required
          />

          <button type="submit" className="btn primary">
            <Send size={15} /> Submit Scope GT Feedback
          </button>
        </form>

        {feedback.length > 0 && (
          <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <h4 style={{ marginBottom: 12 }}>Your Past Feedback Submissions</h4>
            <div style={{ display: 'grid', gap: 10 }}>
              {feedback.map((f) => (
                <div
                  key={f._id}
                  style={{
                    background: 'rgba(0, 0, 0, 0.25)',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.88rem' }}>
                      {'★'.repeat(f.rating)}{'☆'.repeat(5 - f.rating)} ({f.rating}/5)
                    </span>
                    <span className="text-dim text-sm font-mono">
                      {f.createdAt ? new Date(f.createdAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '0.9rem' }}>{f.message}</p>
                  {f.adminReply && (
                    <div
                      className="mt-2 p-2"
                      style={{
                        background: 'rgba(16, 185, 129, 0.08)',
                        borderLeft: '2px solid #10b981',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.85rem'
                      }}
                    >
                      <strong style={{ color: '#10b981' }}>Academy Mentor Reply:</strong> {f.adminReply}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Utilities Section */}
      <div className="form-grid-2">
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <Download size={18} style={{ color: '#10b981' }} />
            <h3 style={{ margin: 0 }}>Data Portability</h3>
          </div>
          <p className="text-muted text-sm">
            Export a full JSON backup of your testing artifacts and portfolio records.
          </p>
          <button type="button" className="btn" onClick={exportJSON}>
            <Download size={15} /> Export Portfolio JSON
          </button>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <Printer size={18} style={{ color: '#06b6d4' }} />
            <h3 style={{ margin: 0 }}>Tester Handbook</h3>
          </div>
          <p className="text-muted text-sm">
            Generate an offline printable version of all course modules and theory concepts.
          </p>
          <button
            type="button"
            className="btn"
            onClick={() => {
              go('course');
              setTimeout(() => window.print(), 250);
            }}
          >
            <Printer size={15} /> Print Course Materials
          </button>
        </div>
      </div>
    </div>
  );
}
