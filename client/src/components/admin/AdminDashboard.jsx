import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  Search, 
  Bug, 
  FileCheck, 
  MessageSquare, 
  Award, 
  ShieldCheck, 
  Plus, 
  Edit3, 
  Trash2, 
  Upload, 
  CheckCircle, 
  XCircle, 
  Send 
} from 'lucide-react';
import StatCard from '../common/StatCard';
import Badge from '../common/Badge';
import FormField from '../common/FormField';
import ContentEditor from './ContentEditor';
import { api, post, patch, del, uploadCertificate } from '../../services/api';

export default function AdminDashboard({ run, setNotice }) {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [modules, setModules] = useState([]);
  const [theory, setTheory] = useState([]);
  const [bugs, setBugs] = useState([]);
  const [cases, setCases] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [editing, setEditing] = useState(null);
  const [reviewForms, setReviewForms] = useState({});
  const [replies, setReplies] = useState({});

  useEffect(() => {
    Promise.all([
      api('/admin/stats'),
      api('/admin/users'),
      api('/modules'),
      api('/theory'),
      api('/admin/bugs'),
      api('/admin/cases'),
      api('/admin/feedback'),
      api('/admin/certificates')
    ])
      .then(([s, u, m, t, b, c, f, certs]) => {
        setStats(s);
        setUsers(u);
        setModules(m);
        setTheory(t);
        setBugs(b);
        setCases(c);
        setFeedback(f);
        setCertificates(certs);
      })
      .catch(console.error);
  }, []);

  const handleSaveContent = async (type, item) => {
    run(async () => {
      if (item._id) {
        await patch(`/admin/${type}/${item._id}`, item);
      } else {
        await post(`/admin/${type}`, item);
      }
      setEditing(null);
      setNotice('Content updated successfully');
    });
  };

  const handleDeleteContent = (type, id) => {
    if (window.confirm('Are you sure you want to delete this permanently?')) {
      run(async () => {
        await del(`/admin/${type}/${id}`);
        setNotice('Content deleted');
      });
    }
  };

  const handleSaveReview = (type, id) => {
    const data = reviewForms[id];
    if (!data) return;
    run(async () => {
      await patch(`/admin/${type}/${id}/review`, data);
      setNotice('Review submitted to learner portfolio');
    });
  };

  const handleSaveReply = (id) => {
    const replyText = replies[id];
    if (!replyText) return;
    run(async () => {
      await patch(`/admin/feedback/${id}`, { adminReply: replyText });
      setNotice('Reply posted to learner feedback');
    });
  };

  const navTabs = [
    { key: 'overview', label: 'Overview', icon: ShieldCheck },
    { key: 'learners', label: `Learners (${users.length})`, icon: Users },
    { key: 'modules', label: `Modules (${modules.length})`, icon: BookOpen },
    { key: 'theory', label: `Glossary (${theory.length})`, icon: Search },
    { key: 'bugs', label: `Bugs (${bugs.length})`, icon: Bug },
    { key: 'cases', label: `Test Cases (${cases.length})`, icon: FileCheck },
    { key: 'feedback', label: `Feedback (${feedback.length})`, icon: MessageSquare },
    { key: 'certificates', label: `Certificates (${certificates.length})`, icon: Award }
  ];

  return (
    <main className="layout wide">
      <div className="page-header">
        <div>
          <h1 className="page-title">Academy Administration Portal</h1>
          <p className="page-subtitle">
            Curriculum authoring, learner accounts, certificate issuance, and defect review queues.
          </p>
        </div>
        <span className="badge badge-major font-mono">
          <ShieldCheck size={14} /> Full Access Mode
        </span>
      </div>

      {/* Admin Subnav */}
      <div className="admin-subnav">
        {navTabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            className={`admin-tab-btn ${tab === key ? 'active' : ''}`}
            onClick={() => {
              setTab(key);
              setEditing(null);
            }}
          >
            <Icon size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            {label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div style={{ display: 'grid', gap: 20 }}>
          <div className="stat-grid">
            <StatCard label="Registered Learners" value={stats?.learners ?? users.length} icon={Users} variant="emerald" />
            <StatCard label="Curriculum Modules" value={stats?.modules ?? modules.length} icon={BookOpen} variant="cyan" />
            <StatCard label="Submitted Bug Reports" value={stats?.bugs ?? bugs.length} icon={Bug} variant="amber" />
            <StatCard label="Authored Test Cases" value={stats?.cases ?? cases.length} icon={FileCheck} variant="indigo" />
            <StatCard label="Learner Reviews" value={stats?.feedback ?? feedback.length} icon={MessageSquare} variant="cyan" />
            <StatCard label="Issued Certificates" value={stats?.certificates ?? certificates.length} icon={Award} variant="emerald" />
          </div>

          <div className="card">
            <h2>Academy Health & System Status</h2>
            <p className="text-muted">
              All data is backed up and continuously synced to MongoDB Atlas. Learner defect submissions and test cases can be reviewed directly in the tabs above to provide actionable pedagogical feedback.
            </p>
          </div>
        </div>
      )}

      {/* Learners Management */}
      {tab === 'learners' && (
        <div className="card">
          <div className="card-header-row">
            <div>
              <h2 style={{ margin: 0 }}>Learner Accounts ({users.length})</h2>
              <p className="text-muted text-sm mt-1">
                Upload verified PDF/PNG/JPEG completion files (max 10MB) or toggle account access.
              </p>
            </div>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Learner</th>
                  <th>Role</th>
                  <th>Modules Done</th>
                  <th>Official File</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <strong>{u.name}</strong>
                      <div className="text-dim text-sm font-mono">{u.email}</div>
                    </td>
                    <td>
                      <Badge text={u.learnerRole || 'Student'} />
                    </td>
                    <td>
                      <span className="font-mono">
                        {u.completedModules?.length || 0} / {modules.length}
                      </span>
                    </td>
                    <td>
                      <label className="upload-btn-label">
                        <Upload size={14} />
                        <span>{u.certificate?.fileName ? u.certificate.fileName.slice(0, 18) + '…' : 'Attach PDF/PNG'}</span>
                        <input
                          type="file"
                          accept="application/pdf,image/png,image/jpeg"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              run(async () => {
                                await uploadCertificate(u._id, file);
                                setNotice(`Certificate file uploaded for ${u.name}`);
                              });
                              e.target.value = '';
                            }
                          }}
                        />
                      </label>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`btn sm ${u.disabled ? 'primary' : 'danger'}`}
                        onClick={() =>
                          run(async () => {
                            await patch(`/admin/users/${u._id}`, { disabled: !u.disabled });
                            setNotice(`Account access updated for ${u.name}`);
                          })
                        }
                      >
                        {u.disabled ? 'Enable Access' : 'Disable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modules or Theory Management */}
      {(tab === 'modules' || tab === 'theory') && (
        <div>
          <div className="card-header-row mb-3">
            <div>
              <h2 style={{ margin: 0 }}>
                {tab === 'modules' ? 'Course Curriculum Modules' : 'Theory & Glossary Terms'}
              </h2>
              <p className="text-muted text-sm">
                Add, revise, or reorder curriculum lessons and testing concepts.
              </p>
            </div>
            <button
              type="button"
              className="btn primary"
              onClick={() => setEditing({ _new: true })}
            >
              <Plus size={16} /> Add {tab === 'modules' ? 'Module' : 'Glossary Entry'}
            </button>
          </div>

          {editing && (
            <ContentEditor
              type={tab}
              item={editing._new ? {} : editing}
              onCancel={() => setEditing(null)}
              onSave={(data) => handleSaveContent(tab, data)}
            />
          )}

          <div style={{ display: 'grid', gap: 14 }}>
            {(tab === 'modules' ? modules : theory).map((item) => (
              <div key={item._id} className="card">
                <div className="card-header-row">
                  <div>
                    <h3 style={{ margin: 0 }}>
                      {item.order ? `${item.order}. ` : ''}{item.title}
                    </h3>
                    <p className="text-muted text-sm mt-1">{item.summary}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge text={item.published ? 'Published' : 'Draft'} />
                      {item.tag && <Badge text={item.tag} />}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="btn sm"
                      onClick={() => setEditing(item)}
                    >
                      <Edit3 size={14} /> Edit
                    </button>
                    <button
                      type="button"
                      className="btn sm danger"
                      onClick={() => handleDeleteContent(tab, item._id)}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bugs or Test Cases Review Queue */}
      {(tab === 'bugs' || tab === 'cases') && (
        <div>
          <div className="page-header mb-3">
            <div>
              <h2 style={{ margin: 0 }}>
                Submitted {tab === 'bugs' ? 'Defect Reports' : 'Test Case Specifications'}
              </h2>
              <p className="text-muted text-sm">
                Evaluate student submissions, mark review statuses, and provide actionable mentor feedback.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 16 }}>
            {(tab === 'bugs' ? bugs : cases).map((item) => {
              const currentStatus = reviewForms[item._id]?.status ?? item.status ?? 'submitted';
              const currentNote = reviewForms[item._id]?.reviewNote ?? item.reviewNote ?? '';

              return (
                <div key={item._id} className="card">
                  <div className="card-header-row">
                    <div>
                      <h3 style={{ margin: 0 }}>
                        {item.title || item.feature}
                      </h3>
                      <div className="text-dim text-sm mt-1">
                        By <strong>{item.user?.name}</strong> ({item.user?.email}) &bull;{' '}
                        {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {tab === 'bugs' ? (
                        <>
                          <Badge text={item.severity} />
                          <Badge text={item.priority} />
                        </>
                      ) : (
                        <Badge text={item.result} />
                      )}
                      <Badge text={item.status} />
                    </div>
                  </div>

                  <details className="expandable-details">
                    <summary>View Complete Submission Content</summary>
                    <div className="p-3 mt-2" style={{ background: 'rgba(0, 0, 0, 0.3)', borderRadius: 'var(--radius-md)' }}>
                      {tab === 'bugs' ? (
                        <>
                          <p><strong>Category:</strong> {item.category}</p>
                          {item.description && <p><strong>Issue Description:</strong> {item.description}</p>}
                          {item.device && <p><strong>Device:</strong> {item.device}</p>}
                          {item.preconditions && <p><strong>Pre Conditions:</strong> {item.preconditions}</p>}
                          <p><strong>Steps:</strong></p>
                          <pre style={{ whiteSpace: 'pre-wrap', color: '#cbd5e1' }}>{item.steps}</pre>
                          <p><strong>Expected:</strong> {item.expected}</p>
                          <p><strong>Actual:</strong> <span style={{ color: '#fb7185' }}>{item.actual}</span></p>
                          {item.impact && <p><strong>Impact:</strong> {item.impact}</p>}
                          {item.notes && <p><strong>Comments:</strong> {item.notes}</p>}
                          {item.media && <p><strong>Attachment:</strong> {item.media}</p>}
                        </>
                      ) : (
                        <>
                          <p><strong>Objective:</strong> {item.objective}</p>
                          <p><strong>Steps:</strong></p>
                          <pre style={{ whiteSpace: 'pre-wrap', color: '#cbd5e1' }}>{item.steps}</pre>
                          <p><strong>Expected:</strong> {item.expected}</p>
                        </>
                      )}
                    </div>
                  </details>

                  <div className="form-grid-2 mt-3 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    <FormField
                      label="Review Decision"
                      name="status"
                      choices={['submitted', 'reviewed', 'needs_changes']}
                      value={currentStatus}
                      onChange={(_, val) =>
                        setReviewForms((p) => ({
                          ...p,
                          [item._id]: { ...p[item._id], status: val, reviewNote: currentNote }
                        }))
                      }
                    />
                    <FormField
                      label="Mentor Note to Learner"
                      name="reviewNote"
                      placeholder="e.g. Great steps to reproduce! Consider clarifying preconditions..."
                      value={currentNote}
                      onChange={(_, val) =>
                        setReviewForms((p) => ({
                          ...p,
                          [item._id]: { ...p[item._id], status: currentStatus, reviewNote: val }
                        }))
                      }
                    />
                  </div>

                  <button
                    type="button"
                    className="btn primary sm"
                    onClick={() => handleSaveReview(tab, item._id)}
                  >
                    Save Review
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Feedback Tab */}
      {tab === 'feedback' && (
        <div style={{ display: 'grid', gap: 16 }}>
          <div className="page-header mb-1">
            <div>
              <h2 style={{ margin: 0 }}>Learner Feedback Reviews ({feedback.length})</h2>
              <p className="text-muted text-sm">Ratings and suggestions submitted by learners.</p>
            </div>
          </div>

          {feedback.map((f) => (
            <div key={f._id} className="card">
              <div className="card-header-row">
                <div>
                  <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: '1.1rem' }}>
                    {'★'.repeat(f.rating)}{'☆'.repeat(5 - f.rating)} ({f.rating}/5)
                  </span>
                  <div className="text-dim text-sm mt-1">
                    From <strong>{f.user?.name}</strong> ({f.user?.email}) &bull;{' '}
                    {new Date(f.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <p style={{ margin: '8px 0 16px', fontSize: '0.95rem' }}>{f.message}</p>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Type an official admin reply visible to this learner..."
                  value={replies[f._id] ?? f.adminReply ?? ''}
                  onChange={(e) =>
                    setReplies((p) => ({ ...p, [f._id]: e.target.value }))
                  }
                />
                <button
                  type="button"
                  className="btn primary"
                  style={{ flexShrink: 0 }}
                  onClick={() => handleSaveReply(f._id)}
                >
                  <Send size={15} /> Save Reply
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Certificates Registry */}
      {tab === 'certificates' && (
        <div className="card">
          <div className="card-header-row">
            <div>
              <h2 style={{ margin: 0 }}>Official Certificates Registry ({certificates.length})</h2>
              <p className="text-muted text-sm mt-1">
                Canonical cryptographic records of all course completions issued by the academy.
              </p>
            </div>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Verification Code</th>
                  <th>Learner Name</th>
                  <th>Learner Email</th>
                  <th>Issued Date</th>
                </tr>
              </thead>
              <tbody>
                {certificates.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <span className="cert-code-pill font-mono">{c.code}</span>
                    </td>
                    <td>
                      <strong>{c.user?.name || 'Unknown'}</strong>
                    </td>
                    <td>
                      <span className="text-dim font-mono">{c.user?.email}</span>
                    </td>
                    <td>
                      <span className="font-mono">
                        {new Date(c.issuedAt).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
