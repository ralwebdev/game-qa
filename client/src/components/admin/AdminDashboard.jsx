import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  BookOpen, 
  Search, 
  Bug, 
  FileCheck, 
  MessageSquare, 
  Award, 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  Send,
  Download
} from 'lucide-react';
import StatCard from '../common/StatCard';
import Badge from '../common/Badge';
import FormField from '../common/FormField';
import { api, post, patch } from '../../services/api';
import { Link, useLocation } from 'react-router-dom';

const adminTabQueries = { learners: 'learner', modules: 'modules', theory: 'theory', bugs: 'bugs', cases: 'cases', feedback: 'feedback', certificates: 'certificates' };

export default function AdminDashboard({ run, setNotice }) {
  const location = useLocation();
  const queryTab = new URLSearchParams(location.search).get('tab');
  const tab = Object.keys(adminTabQueries).find(key => adminTabQueries[key] === queryTab) || 'overview';
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [eligibleOnly, setEligibleOnly] = useState(false);
  const [modules, setModules] = useState([]);
  const [theory, setTheory] = useState([]);
  const [bugs, setBugs] = useState([]);
  const [cases, setCases] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [reviewForms, setReviewForms] = useState({});
  const [replies, setReplies] = useState({});
  const [certificateRemarks, setCertificateRemarks] = useState({});
  const [certificateNames, setCertificateNames] = useState({});
  const [exportingBugs, setExportingBugs] = useState(false);
  const [certificateDialog, setCertificateDialog] = useState(null);
  const [savingCertificate, setSavingCertificate] = useState(false);
  const [certificateError, setCertificateError] = useState('');
  const certificateDialogRef = useRef(null);

  useEffect(() => {
    if (certificateDialog && certificateDialogRef.current && !certificateDialogRef.current.open) certificateDialogRef.current.showModal();
  }, [certificateDialog]);

  const downloadBugs = () => run(async () => {
    setExportingBugs(true);
    try {
      const response = await fetch('/api/admin/bugs/export', { credentials: 'include' });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Could not download bug reports');
      }
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement('a');
      link.href = url;
      link.download = 'bug-reports.xlsx';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } finally {
      setExportingBugs(false);
    }
  });

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

  const handleSaveReview = (type, id) => {
    const data = reviewForms[id];
    if (!data) return;
    run(async () => {
      await patch(`/admin/${type}/${id}/review`, data);
      if (type === 'bugs') setUsers(await api('/admin/users'));
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

  const openCertificateDialog = (learner, certificate) => {
    setCertificateError('');
    setCertificateNames(prev => ({ ...prev, [learner._id]: certificate.recipientName || learner.name }));
    setCertificateRemarks(prev => ({ ...prev, [learner._id]: certificate.remarks || '' }));
    setCertificateDialog({ learner, certificate });
  };

  const saveCertificate = (event) => {
    event.preventDefault();
    const { learner, certificate } = certificateDialog;
    run(async () => {
      setSavingCertificate(true);
      setCertificateError('');
      try {
        await post(`/admin/users/${learner._id}/certificate`, {
          recipientName: certificateNames[learner._id],
          remarks: certificateRemarks[learner._id] ?? ''
        });
        const [updatedUsers, updatedCertificates, updatedStats] = await Promise.all([
          api('/admin/users'), api('/admin/certificates'), api('/admin/stats')
        ]);
        setUsers(updatedUsers);
        setCertificates(updatedCertificates);
        setStats(updatedStats);
        certificateDialogRef.current?.close();
        setNotice(certificate.recipientName ? `Certificate updated for ${learner.name}.` : `Certificate issued for ${learner.name}.`);
      } catch (error) {
        setCertificateError(error.message || 'Could not save the certificate');
        throw error;
      } finally {
        setSavingCertificate(false);
      }
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
  const visibleUsers = eligibleOnly ? users.filter(user => user.eligible) : users;

  return (
    <main className="layout wide">
      <div className="page-header">
        <div>
          <h1 className="page-title">Academy Administration Portal</h1>
          <p className="page-subtitle">
            Learner accounts, course content, certificate issuance, and defect review queues.
          </p>
        </div>
        <span className="badge badge-major font-mono">
          <ShieldCheck size={14} /> Full Access Mode
        </span>
      </div>

      {/* Admin Subnav */}
      <div className="admin-subnav">
        {navTabs.map(({ key, label, icon: Icon }) => (
          <Link
            key={key}
            to={key === 'overview' ? '/admin' : `/admin?tab=${adminTabQueries[key]}`}
            className={`admin-tab-btn ${tab === key ? 'active' : ''}`}
            aria-current={tab === key ? 'page' : undefined}
          >
            <Icon size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            {label}
          </Link>
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
            <StatCard label="Issued Certificates" value={stats?.certificates ?? certificates.filter(c => c.recipientName).length} icon={Award} variant="emerald" />
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
              <h2 style={{ margin: 0 }}>Learner Accounts ({visibleUsers.length})</h2>
              <p className="text-muted text-sm mt-1">
                Certificates require at least 22 completed modules and 2 bug reports marked reviewed. Administrators set the certificate name and may add remarks.
              </p>
            </div>
            <div className={`learner-filter${eligibleOnly ? ' eligible' : ''}`} role="group" aria-label="Filter learners">
              <button type="button" aria-pressed={!eligibleOnly} onClick={() => setEligibleOnly(false)}>
                All Participants
              </button>
              <button type="button" aria-pressed={eligibleOnly} onClick={() => setEligibleOnly(true)}>
                Eligible for certificate
              </button>
            </div>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Learner</th>
                  <th>Role</th>
                  <th>Modules Done</th>
                  <th>Bug Reports</th>
                  <th>Test Cases</th>
                  <th>Certificate &amp; Remarks</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleUsers.map((u) => (
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
                    <td><span className="font-mono">{u.bugCount ?? 0} ({u.validBugs ?? 0} reviewed)</span></td>
                    <td><span className="font-mono">{u.caseCount ?? 0}</span></td>
                    <td>
                      <div className="admin-certificate-action">
                        <span className={`badge ${u.certificate?.recipientName ? 'badge-success' : 'badge-neutral'}`}>
                          {u.certificate?.recipientName ? 'Issued' : u.certificate ? 'Request pending' : 'No request'}
                        </span>
                        <input
                          className="form-control"
                          type="text"
                          maxLength={120}
                          aria-label={`Certificate name for ${u.name}`}
                          placeholder="Certificate recipient name"
                          value={certificateNames[u._id] ?? u.certificate?.recipientName ?? ''}
                          onChange={(event) => setCertificateNames((prev) => ({ ...prev, [u._id]: event.target.value }))}
                        />
                        <textarea
                          className="form-control"
                          rows={2}
                          maxLength={1000}
                          aria-label={`Certificate remarks for ${u.name}`}
                          placeholder="Remarks (optional)"
                          value={certificateRemarks[u._id] ?? u.certificate?.remarks ?? ''}
                          onChange={(event) => setCertificateRemarks((prev) => ({ ...prev, [u._id]: event.target.value }))}
                        />
                        <button type="button" className="btn sm primary" disabled={!u.eligible || !(certificateNames[u._id] ?? u.certificate?.recipientName ?? '').trim()} onClick={() => run(async () => {
                          await post(`/admin/users/${u._id}/certificate`, { recipientName: certificateNames[u._id] ?? u.certificate?.recipientName ?? '', remarks: certificateRemarks[u._id] ?? u.certificate?.remarks ?? '' });
                          const [updatedUsers, updatedCertificates, updatedStats] = await Promise.all([api('/admin/users'), api('/admin/certificates'), api('/admin/stats')]);
                          setUsers(updatedUsers);
                          setCertificates(updatedCertificates);
                          setStats(updatedStats);
                          setNotice(u.certificate?.recipientName ? `Certificate updated for ${u.name}.` : `Certificate name approved for ${u.name}.`);
                        })}>
                          <Award size={14} /> {u.certificate?.recipientName ? 'Update Certificate' : 'Issue Certificate'}
                        </button>
                      </div>
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
                {eligibleOnly && visibleUsers.length === 0 && (
                  <tr><td colSpan={7}>No learners are currently eligible for a certificate.</td></tr>
                )}
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
                Course content is maintained in the application files.
              </p>
            </div>
          </div>

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
            {tab === 'bugs' && (
              <button type="button" className="btn primary" onClick={downloadBugs} disabled={exportingBugs}>
                <Download size={16} /> {exportingBugs ? 'Preparing Excel...' : 'Download Excel'}
              </button>
            )}
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
                          {item.devices?.length ? <div><strong>Tested devices:</strong>{item.devices.map((d, i) => <p key={i}>{[d.platform, d.device, d.os, d.cpu && `CPU: ${d.cpu}`, d.gpu && `GPU: ${d.gpu}`, d.graphics && `Graphics: ${d.graphics}`, d.result].filter(Boolean).join(' ? ')}</p>)}</div> : item.device && <p><strong>Device:</strong> {item.device} {item.os}</p>}
                          {item.appName && <p><strong>Game / App:</strong> {item.appName} {item.build && `(${item.build})`}</p>}
                          {item.frequency && <p><strong>Frequency:</strong> {item.frequency}</p>}
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
              <h2 style={{ margin: 0 }}>Certificate Requests &amp; Records ({certificates.length})</h2>
              <p className="text-muted text-sm mt-1">
                Issue or update certificates here. Learners need 22 completed modules and 2 reviewed bug reports.
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
                  <th>Status</th>
                  <th>Record Created</th>
                  <th>Certificate Actions</th>
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
                      <span className={`badge ${c.recipientName ? 'badge-success' : 'badge-neutral'}`}>
                        {c.recipientName ? 'Issued' : 'Request pending'}
                      </span>
                    </td>
                    <td>
                      <span className="font-mono">
                        {new Date(c.issuedAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      {(() => {
                        const learner = users.find(u => u._id === c.user?._id);
                        if (!learner) return <span className="text-muted">Learner unavailable</span>;
                        return <div className="admin-certificate-action">
                          <span className="text-muted text-sm">{learner.completed}/22 modules ? {learner.validBugs}/2 reviewed bugs</span>
                          <button type="button" className="btn sm primary" disabled={!learner.eligible}
                            onClick={() => openCertificateDialog(learner, c)}>
                            <Award size={14} /> {c.recipientName ? 'Update Certificate' : 'Issue Certificate'}
                          </button>
                          {!learner.eligible && <span className="text-muted text-sm">Requirements incomplete</span>}
                        </div>;
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <dialog ref={certificateDialogRef} className="certificate-dialog" aria-labelledby="certificate-dialog-title"
        onClose={() => setCertificateDialog(null)}>
        {certificateDialog && <form onSubmit={saveCertificate} className="certificate-dialog-form">
          <h2 id="certificate-dialog-title">{certificateDialog.certificate.recipientName ? 'Update Certificate' : 'Issue Certificate'}</h2>
          <p className="text-muted text-sm">For {certificateDialog.learner.name}</p>
          {certificateError && <p className="alert alert-error" role="alert">{certificateError}</p>}
          <label htmlFor="certificate-recipient">Certificate recipient name</label>
          <input id="certificate-recipient" className="form-control" type="text" maxLength={120} required autoFocus
            value={certificateNames[certificateDialog.learner._id] ?? ''}
            onChange={event => setCertificateNames(prev => ({ ...prev, [certificateDialog.learner._id]: event.target.value }))} />
          <label htmlFor="certificate-remarks">Remarks (optional)</label>
          <textarea id="certificate-remarks" className="form-control" rows={3} maxLength={1000}
            value={certificateRemarks[certificateDialog.learner._id] ?? ''}
            onChange={event => setCertificateRemarks(prev => ({ ...prev, [certificateDialog.learner._id]: event.target.value }))} />
          <div className="flex items-center gap-2 flex-wrap">
            <button type="submit" className="btn primary" disabled={savingCertificate || !(certificateNames[certificateDialog.learner._id] ?? '').trim()}>
              {savingCertificate ? 'Saving?' : certificateDialog.certificate.recipientName ? 'Update Certificate' : 'Issue Certificate'}
            </button>
            <button type="button" className="btn" disabled={savingCertificate} onClick={() => certificateDialogRef.current?.close()}>Cancel</button>
          </div>
        </form>}
      </dialog>
    </main>
  );
}
