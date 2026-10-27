import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Home, BookOpen, Search, FlaskConical, Folder, MoreHorizontal, Shield, LogOut } from "lucide-react";
import "./style.css";
const api = async (path, options = {}) => {
  let r = await fetch("/api" + path, { credentials: "include", headers: { "Content-Type": "application/json" }, ...options, body: options.body ? JSON.stringify(options.body) : void 0 });
  let data = await r.json().catch(() => ({ message: "Unexpected response" }));
  if (!r.ok) throw Error(data.message || "Request failed");
  return data;
};
const post = (p, b) => api(p, { method: "POST", body: b });
const patch = (p, b) => api(p, { method: "PATCH", body: b });
const del = (p) => api(p, { method: "DELETE" });
const text = (o, k) => o[k] ?? "";
function Field({ label, name, value, onChange, required = false, kind = "text", choices }) {
  return <div className="group"><label className="formlabel">{label}{required ? " *" : ""}</label>{choices ? <select className="field" value={value ?? ""} required={required} onChange={(e) => onChange(name, e.target.value)}>{choices.map((x) => <option key={x} value={x}>{x}</option>)}</select> : kind === "textarea" ? <textarea className="field" value={value ?? ""} required={required} onChange={(e) => onChange(name, e.target.value)} /> : <input className="field" type={kind} value={value ?? ""} required={required} onChange={(e) => onChange(name, e.target.value)} />}</div>;
}
function App() {
  const [user, setUser] = useState(null), [loading, setLoading] = useState(true), [tab, setTab] = useState("home"), [error, setError] = useState(""), [notice, setNotice] = useState(""), [refresh, setRefresh] = useState(0);
  const run = async (fn) => {
    setError("");
    setNotice("");
    try {
      await fn();
      setRefresh((x) => x + 1);
    } catch (e) {
      setError(e.message);
    }
  };
  useEffect(() => {
    api("/auth/me").then((x) => setUser(x.user)).catch(() => {
    }).finally(() => setLoading(false));
  }, []);
  const logout = () => run(async () => {
    await post("/auth/logout", {});
    setUser(null);
  });
  if (loading) return <div className="auth">Loading Academy…</div>;
  return <><header className="app-header"><div className="brand">▶ Game QA <span>Academy</span></div>{user && <div className="actions"><span className="pill">{user.role === "admin" ? "Admin" : user.name}</span><button className="btn noPrint" onClick={logout} title="Log out"><LogOut size={15} /></button></div>}</header>{error && <div className="layout" style={{ paddingBottom: 0 }}><div className="error">{error}<button className="linkbtn" style={{ float: "right" }} onClick={() => setError("")}>Dismiss</button></div></div>}{notice && <div className="layout" style={{ paddingBottom: 0 }}><div className="success">{notice}</div></div>}{!user ? <Auth onAuth={setUser} onError={setError} /> : user.role === "admin" ? <Admin key={refresh} run={run} setNotice={setNotice} /> : <><main className="layout learner"><Learner key={tab + "-" + refresh} tab={tab} user={user} setUser={setUser} go={setTab} run={run} setNotice={setNotice} /></main><nav className="nav noPrint">{[["home", "Home", Home], ["course", "Course", BookOpen], ["theory", "Theory", Search], ["practice", "Practice", FlaskConical], ["portfolio", "Portfolio", Folder], ["more", "More", MoreHorizontal]].map(([key, label, Icon]) => <button key={key} className={tab === key ? "active" : ""} onClick={() => {
    setTab(key);
    setError("");
    setNotice("");
  }}><Icon size={19} />{label}</button>)}</nav></>}</>;
}
function Auth({ onAuth, onError }) {
  const [mode, setMode] = useState("login"), [f, setF] = useState({ name: "", email: "", password: "", learnerRole: "Student" }), [busy, setBusy] = useState(false);
  const update = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const adminLogin = window.location.pathname === "/admin";
  const registering = !adminLogin && mode === "register";
  return <div className="auth"><div className="card"><h1>{adminLogin ? "Administrator Sign-In" : mode === "login" ? "Learner Studio Sign-In" : "Create Learner Account"}</h1><p className="muted small">{adminLogin ? "Sign in with the administrator account configured for this academy." : "Game QA fundamentals, defect logging, and personal learning portfolios — synced across devices."}</p>{!adminLogin && <div className="notice">Your work is saved securely in the academy database, not only in this browser.</div>}<form onSubmit={async (e) => {
    e.preventDefault();
    setBusy(true);
    onError("");
    try {
      const r = await post(adminLogin ? "/auth/admin/login" : "/auth/" + (mode === "login" ? "login" : "register"), f);
      onAuth(r.user);
    } catch (e2) {
      onError(e2.message);
    } finally {
      setBusy(false);
    }
  }}>{registering && <Field label="Full name" name="name" value={f.name} onChange={update} required />}<Field label="Email address" name="email" kind="email" value={f.email} onChange={update} required /><Field label="Password" name="password" kind="password" value={f.password} onChange={update} required />{registering && <Field label="Learner role" name="learnerRole" choices={["Student", "Aspiring Tester", "Working Professional"]} value={f.learnerRole} onChange={update} />}<button disabled={busy} className="btn primary" style={{ width: "100%" }}>{busy ? "Processing\u2026" : adminLogin ? "Sign In as Admin" : mode === "login" ? "Sign In" : "Register"}</button></form>{!adminLogin && <><div className="divider" /><button className="linkbtn" onClick={() => setMode(mode === "login" ? "register" : "login")}>{mode === "login" ? "Create a new learner account" : "Already registered? Sign in"}</button></>}</div></div>;
}
function Learner({ tab, user, setUser, go, run, setNotice }) {
  const [dash, setDash] = useState(null), [modules, setModules] = useState([]), [theory, setTheory] = useState([]), [bugs, setBugs] = useState([]), [cases, setCases] = useState([]), [feedback, setFeedback] = useState([]);
  useEffect(() => {
    Promise.all([api("/dashboard"), api("/modules"), api("/theory"), api("/bugs"), api("/cases"), api("/feedback")]).then(([d, m, t, b, c, f]) => {
      setDash(d);
      setModules(m);
      setTheory(t);
      setBugs(b);
      setCases(c);
      setFeedback(f);
    }).catch(() => {
    });
  }, []);
  const [search, setSearch] = useState(""), [tag, setTag] = useState("all"), [practice, setPractice] = useState("bug"), [profile, setProfile] = useState({ name: user.name, learnerRole: user.learnerRole });
  const completed = user.completedModules || [];
  const pct = dash?.modules ? Math.round(dash.completed / dash.modules * 100) : 0;
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify({ profile: user, bugReports: bugs, testCases: cases, feedback }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gqa-portfolio.json";
    a.click();
    URL.revokeObjectURL(url);
  };
  return <>{tab === "home" && <><div className="card hero"><span className="tag">{user.learnerRole}</span><h1 style={{ marginTop: 10 }}>Welcome back, {user.name}</h1><p className="muted small">Curriculum mapped to game QA foundations & practical defect logging.</p><div className="row small"><b>Course Progress</b><b>{pct}%</b></div><div className="progress"><div style={{ width: pct + "%" }} /></div><div className="three" style={{ marginTop: 14 }}><Stat label="Modules" value={`${dash?.completed || 0}/${dash?.modules || 0}`} /><Stat label="Bug Reports" value={dash?.bugs || 0} /><Stat label="Test Cases" value={dash?.cases || 0} /></div></div><div className="card"><div className="tag">SUGGESTED NEXT STEP</div><h2 style={{ marginTop: 8 }}>{modules.find((m) => !completed.includes(m._id))?.title || "Review your portfolio"}</h2><p className="muted">Continue learning and record evidence of your QA practice.</p><button className="btn primary" onClick={() => go("course")}>Continue Module</button></div><div className="card"><h2>Certificate Eligibility <span className="tag">{dash?.eligible ? "Eligible" : "Locked"}</span></h2><p className="small muted">Complete every published module, record at least one bug report, and draft at least one test case.</p><p> {dash?.completed === dash?.modules && dash?.modules ? "\u2713" : "\u25CB"} Modules ({dash?.completed || 0}/{dash?.modules || 0})</p><p> {bugs.length ? "\u2713" : "\u25CB"} Bug report ({bugs.length})</p><p> {cases.length ? "\u2713" : "\u25CB"} Test case ({cases.length})</p><button className="btn" onClick={() => go("more")}>Certificate & Utilities</button></div></>}
{tab === "course" && <><h1>Course Modules</h1><p className="muted">Beginner-friendly lessons, worked examples, activities and self-checks.</p>{modules.map((m) => <div className="card" key={m._id}><div className="row"><h2>{m.order}. {m.title}</h2><span className="tag">{completed.includes(m._id) ? "Complete" : "Open"}</span></div><p className="muted small">{m.summary}</p><details><summary className="lime" style={{ cursor: "pointer", fontWeight: 700 }}>Read Lesson & Self-Check</summary><div className="divider" /><p>{m.explanation}</p><div className="notice">{m.example}</div><p><b>Activity:</b> {m.activity}</p><p><b>Self-check:</b> {m.quiz?.q}</p><details><summary className="lime">Show suggested answer</summary><p>{m.quiz?.a}</p></details><button className="btn primary" disabled={completed.includes(m._id)} style={{ marginTop: 14 }} onClick={() => run(async () => {
    await post("/modules/" + m._id + "/complete", {});
    setUser((p) => ({ ...p, completedModules: [.../* @__PURE__ */ new Set([...p.completedModules, m._id])] }));
    setNotice("Module marked complete");
  })}>{completed.includes(m._id) ? "Completed \u2713" : "Mark Module Complete"}</button></details></div>)}</>}
{tab === "theory" && <><h1>QA Theory & Glossary</h1><p className="muted">Searchable game testing terminology and techniques.</p><input className="field" placeholder="Search QA concepts…" value={search} onChange={(e) => setSearch(e.target.value)} /><div className="actions" style={{ margin: "14px 0" }}>{["all", "concept", "technique", "lifecycle"].map((t) => <button className={"btn " + (tag === t ? "primary" : "")} onClick={() => setTag(t)} key={t}>{t === "all" ? "All" : t}</button>)}</div>{theory.filter((t) => (tag === "all" || t.tag === tag) && JSON.stringify(t).toLowerCase().includes(search.toLowerCase())).map((t) => <div className="card" key={t._id}><span className="tag">{t.tag}</span><h2 style={{ marginTop: 8 }}>{t.title}</h2><p className="muted">{t.summary}</p><details><summary className="lime">Explore concept</summary><p><b>Meaning:</b> {t.meaning}</p><p><b>Why it matters:</b> {t.importance}</p><p><b>Example:</b> {t.example}</p><div className="notice">{t.action}</div></details></div>)}</>}
{tab === "practice" && <><h1>Practice Lab</h1><p className="muted">Create professional defect reports and test case specifications.</p><div className="cols"><button className={"btn " + (practice === "bug" ? "primary" : "")} onClick={() => setPractice("bug")}>Bug Report Builder</button><button className={"btn " + (practice === "case" ? "primary" : "")} onClick={() => setPractice("case")}>Test Case Builder</button></div><div style={{ height: 14 }} />{practice === "bug" ? <ArtifactForm kind="bug" onSave={(v) => run(async () => {
    await post("/bugs", v);
    setNotice("Bug report saved to portfolio");
  })} /> : <ArtifactForm kind="case" onSave={(v) => run(async () => {
    await post("/cases", v);
    setNotice("Test case saved to portfolio");
  })} />}</>}
{tab === "portfolio" && <><div className="row"><div><h1>Learner Portfolio</h1><p className="muted">Your saved training artifacts and progress.</p></div><button className="btn" onClick={exportJSON}>Export JSON</button></div><div className="notice" style={{ marginBottom: 16 }}>These are training artifacts, not claims of commercial testing experience.</div><h2>Logged Bug Reports ({bugs.length})</h2>{bugs.length ? bugs.map((b) => <Artifact key={b._id} item={b} kind="bugs" onDelete={() => run(async () => {
    await del("/bugs/" + b._id);
    setNotice("Deleted bug report");
  })} onSave={(v) => run(async () => {
    await patch("/bugs/" + b._id, v);
    setNotice("Bug report updated");
  })} />) : <p className="muted">No reports yet.</p>}<h2>Authored Test Cases ({cases.length})</h2>{cases.length ? cases.map((c) => <Artifact key={c._id} item={c} kind="cases" onDelete={() => run(async () => {
    await del("/cases/" + c._id);
    setNotice("Deleted test case");
  })} onSave={(v) => run(async () => {
    await patch("/cases/" + c._id, v);
    setNotice("Test case updated");
  })} />) : <p className="muted">No test cases yet.</p>}</>}
{tab === "more" && <><h1>More & Utilities</h1><div className="card"><h2>My Profile</h2><Field label="Display name" name="name" value={profile.name} onChange={(k, v) => setProfile((p) => ({ ...p, [k]: v }))} /><Field label="Learner role" name="learnerRole" choices={["Student", "Aspiring Tester", "Working Professional"]} value={profile.learnerRole} onChange={(k, v) => setProfile((p) => ({ ...p, [k]: v }))} /><button className="btn primary" onClick={() => run(async () => {
    const x = await patch("/auth/me", profile);
    setUser(x.user);
    setNotice("Profile updated");
  })}>Save Profile</button></div><div className="card"><h2>Completion Certificate</h2>{dash?.certificate ? <Certificate user={user} cert={dash.certificate} bugs={bugs.length} cases={cases.length} /> : <><p className="muted">The academy will issue a unique verifiable record when you meet the completion requirements.</p><button className="btn primary" disabled={!dash?.eligible} onClick={() => run(async () => {
    await post("/certificates/issue", {});
    setNotice("Certificate issued. Open this tab to print.");
  })}>Issue Certificate</button></>}</div><div className="card"><h2>Course Feedback</h2><FeedbackForm onSave={(v) => run(async () => {
    await post("/feedback", v);
    setNotice("Feedback submitted");
  })} />{feedback.map((f) => <p className="small muted" key={f._id}>★ {f.rating}/5 — {f.message} {f.adminReply && <span className="lime"> • Admin: {f.adminReply}</span>}</p>)}</div><div className="card"><h2>Backup & Data Portability</h2><p className="muted small">Export your portfolio to JSON. Your canonical account records remain in the database.</p><button className="btn" onClick={exportJSON}>Export Portfolio JSON</button></div><div className="card"><h2>Tester Handbook</h2><p className="muted">Print the course lesson material for offline study.</p><button className="btn" onClick={() => {
    go("course");
    setTimeout(() => window.print(), 100);
  }}>Open Course for Printing</button></div></>}</>;
}
function Stat({ label, value }) {
  return <div className="stat"><strong>{value}</strong><span>{label}</span></div>;
}
const bugDefaults = { title: "", category: "Gameplay", device: "", severity: "Major", priority: "Medium (P2)", steps: "", expected: "", actual: "", appName: "", build: "", os: "", frequency: "Not provided", preconditions: "", impact: "", media: "", notes: "" };
const caseDefaults = { feature: "", objective: "", preconditions: "", steps: "", expected: "", result: "Not run" };
const bugFields = [["title", "Issue Title", true], ["category", "Category", true, ["Gameplay", "UI/Menu", "Audio", "Crash/Freeze", "Graphics/Animation", "Progression/Save"]], ["device", "Device / Platform", true], ["severity", "Severity", true, ["Blocker/Critical", "Major", "Minor", "Trivial"]], ["priority", "Priority", true, ["High (P1)", "Medium (P2)", "Low (P3)"]], ["steps", "Numbered Steps to Reproduce", true, null, "textarea"], ["expected", "Expected Result", true, null, "textarea"], ["actual", "Actual Result", true, null, "textarea"], ["appName", "Game / App Title"], ["build", "Build / Version"], ["os", "OS Version"], ["frequency", "Reproduction Frequency", false, ["Not provided", "100% (5/5 attempts)", "Intermittent (~60%)", "Once only"]], ["preconditions", "Preconditions"], ["impact", "Player / User Impact"], ["media", "Media URL / Attachment Reference"], ["notes", "Internal Notes", false, null, "textarea"]];
const caseFields = [["feature", "Feature / Component", true], ["objective", "Test Objective", true], ["preconditions", "Preconditions"], ["steps", "Ordered Execution Steps", true, null, "textarea"], ["expected", "Expected Outcome", true, null, "textarea"], ["result", "Execution Result Status", true, ["Not run", "Pass", "Fail", "Blocked"]]];
function ArtifactForm({ kind, onSave, initial, button }) {
  const [f, setF] = useState(initial || (kind === "bug" ? bugDefaults : caseDefaults)), [busy, setBusy] = useState(false);
  const fields = kind === "bug" ? bugFields : caseFields;
  return <form className="card" onSubmit={async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await onSave(f);
      if (!initial) setF(kind === "bug" ? bugDefaults : caseDefaults);
    } finally {
      setBusy(false);
    }
  }}><h2>{kind === "bug" ? "Defect Report Studio" : "Test Case Authoring"}</h2>{kind === "bug" && <div className="notice" style={{ marginBottom: 16 }}>Severity reflects technical impact; priority reflects release urgency.</div>}{fields.map(([key, label, required, choices, type]) => <Field key={key} name={key} label={label} required={required} value={f[key]} choices={choices} kind={type || "text"} onChange={(k, v) => setF((x) => ({ ...x, [k]: v }))} />)}<button className="btn primary" disabled={busy}>{busy ? "Saving\u2026" : button || "Save to Portfolio"}</button></form>;
}
function Artifact({ item, kind, onDelete, onSave }) {
  const [edit, setEdit] = useState(false);
  return <div className="card"><div className="row"><h3>{item.title || item.feature}</h3><span className="tag">{item.status}</span></div><p className="small muted">Created {new Date(item.createdAt).toLocaleDateString()} • {item.severity || item.result}</p>{item.reviewNote && <div className="notice">Reviewer: {item.reviewNote}</div>}<details><summary className="lime">View details</summary>{(kind === "bugs" ? bugFields : caseFields).map(([k, label]) => <p key={k} className="small"><b>{label}:</b> {item[k]}</p>)}</details><div className="actions" style={{ marginTop: 12 }}><button className="btn" onClick={() => setEdit(!edit)}>{edit ? "Cancel edit" : "Edit"}</button><button className="btn danger" onClick={() => {
    if (window.confirm("Delete this artifact?")) onDelete();
  }}>Delete</button></div>{edit && <div style={{ marginTop: 16 }}><ArtifactForm kind={kind === "bugs" ? "bug" : "case"} initial={item} button="Save Changes" onSave={onSave} /></div>}</div>;
}
function FeedbackForm({ onSave }) {
  const [f, setF] = useState({ rating: 5, message: "" });
  return <form onSubmit={(e) => {
    e.preventDefault();
    onSave(f);
    setF({ rating: 5, message: "" });
  }}><Field label="Rating" name="rating" value={f.rating} choices={["1", "2", "3", "4", "5"]} onChange={(k, v) => setF((x) => ({ ...x, rating: Number(v) }))} /><Field label="Your feedback" name="message" kind="textarea" required value={f.message} onChange={(k, v) => setF((x) => ({ ...x, message: v }))} /><button className="btn primary">Submit Feedback</button></form>;
}
function Certificate({ user, cert, bugs, cases }) {
  return <><div className="cert"><b>GAME QA ACADEMY — LEARNER STUDIO</b><h2>Certificate of Course Completion</h2><p>This record certifies that</p><h2>{user.name}</h2><p>has completed foundational training in game software QA, test design, bug reporting, regression and release testing.</p><p><b>Date:</b> {new Date(cert.issuedAt).toLocaleDateString()}</p><p><b>Record:</b> <code>{cert.code}</code></p><p>Practice artifacts: {bugs} bug reports / {cases} test cases</p><p className="footnote">Course completion record only. Not an accredited academic credential, ISTQB certification, or proof of identity.</p></div><div className="actions noPrint" style={{ marginTop: 15 }}><button className="btn primary" onClick={() => window.print()}>Print / Save PDF</button><a href={"/verify/" + cert.code} onClick={(e) => {
    e.preventDefault();
    window.open("/api/certificates/verify/" + cert.code, "_blank");
  }}>Verify record</a></div></>;
}
function Admin({ run, setNotice }) {
  const [tab, setTab] = useState("overview"), [stats, setStats] = useState(null), [users, setUsers] = useState([]), [modules, setModules] = useState([]), [theory, setTheory] = useState([]), [bugs, setBugs] = useState([]), [cases, setCases] = useState([]), [feedback, setFeedback] = useState([]), [certificates, setCertificates] = useState([]), [editing, setEditing] = useState(null);
  useEffect(() => {
    Promise.all([api("/admin/stats"), api("/admin/users"), api("/modules"), api("/theory"), api("/admin/bugs"), api("/admin/cases"), api("/admin/feedback"), api("/admin/certificates")]).then(([a, b, c, d, e, f, g, h]) => {
      setStats(a);
      setUsers(b);
      setModules(c);
      setTheory(d);
      setBugs(e);
      setCases(f);
      setFeedback(g);
      setCertificates(h);
    }).catch(console.error);
  }, []);
  const saveContent = async (type, item) => {
    await (item._id ? patch("/admin/" + type + "/" + item._id, item) : post("/admin/" + type, item));
    setEditing(null);
    setNotice("Content saved");
  };
  return <main className="layout"><div className="row"><div><h1>Administration</h1><p className="muted">Manage learners, curriculum, and QA submissions.</p></div><span className="pill"><Shield size={15} style={{ verticalAlign: "middle" }} /> Admin Panel</span></div><div className="adminnav">{[["overview", "Overview"], ["learners", "Learners"], ["modules", "Courses"], ["theory", "Glossary"], ["bugs", "Bug Reports"], ["cases", "Test Cases"], ["feedback", "Feedback"], ["certificates", "Certificates"]].map(([k, l]) => <button className={"btn " + (tab === k ? "active" : "")} key={k} onClick={() => {
    setTab(k);
    setEditing(null);
  }}>{l}</button>)}</div>{tab === "overview" && <><div className="three">{Object.entries(stats || {}).map(([k, v]) => <Stat key={k} label={k} value={v} />)}</div><div className="card"><h2>Academy Administration</h2><p className="muted">Use the tabs to manage account access, lesson content, learner submissions, feedback, and issued completion records. All data is stored in MongoDB.</p></div></>}{tab === "learners" && <div className="card"><h2>Learner Accounts ({users.length})</h2><div className="tablewrap"><table className="table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Completed</th><th>Access</th></tr></thead><tbody>{users.map((u) => <tr key={u._id}><td>{u.name}</td><td>{u.email}</td><td>{u.learnerRole}</td><td>{u.completedModules?.length || 0}</td><td><button className={"btn " + (u.disabled ? "primary" : "danger")} onClick={() => run(async () => {
    await patch("/admin/users/" + u._id, { disabled: !u.disabled });
    setNotice("Account access updated");
  })}>{u.disabled ? "Enable" : "Disable"}</button></td></tr>)}</tbody></table></div></div>}
{(tab === "modules" || tab === "theory") && <><div className="row"><h2>{tab === "modules" ? "Course Module Management" : "Theory & Glossary Management"}</h2><button className="btn primary" onClick={() => setEditing({ _new: true })}>+ Add {tab === "modules" ? "Module" : "Theory"}</button></div>{editing && <ContentEditor type={tab} item={editing._new ? {} : editing} onCancel={() => setEditing(null)} onSave={(v) => run(() => saveContent(tab, v))} />} {(tab === "modules" ? modules : theory).map((item) => <div className="card" key={item._id}><div className="row"><div><h3>{item.title}</h3><p className="small muted">{item.summary}</p><span className="tag">{item.published ? "Published" : "Draft"}</span></div><div className="actions"><button className="btn" onClick={() => setEditing(item)}>Edit</button><button className="btn danger" onClick={() => {
    if (window.confirm("Delete content permanently?")) run(async () => {
      await del("/admin/" + tab + "/" + item._id);
      setNotice("Content deleted");
    });
  }}>Delete</button></div></div></div>)}</>}
{(tab === "bugs" || tab === "cases") && <><h2>Submitted {tab === "bugs" ? "Bug Reports" : "Test Cases"}</h2>{(tab === "bugs" ? bugs : cases).map((item) => <ReviewCard key={item._id} item={item} type={tab} onSave={(v) => run(async () => {
    await patch("/admin/" + tab + "/" + item._id + "/review", v);
    setNotice("Review saved");
  })} />)}</>}
{tab === "feedback" && <><h2>Learner Feedback</h2>{feedback.map((f) => <FeedbackReview key={f._id} item={f} onSave={(v) => run(async () => {
    await patch("/admin/feedback/" + f._id, { adminReply: v });
    setNotice("Reply saved");
  })} />)}</>}
{tab === "certificates" && <div className="card"><h2>Issued Certificates</h2><div className="tablewrap"><table className="table"><thead><tr><th>Reference</th><th>Learner</th><th>Issue date</th></tr></thead><tbody>{certificates.map((c) => <tr key={c._id}><td>{c.code}</td><td>{c.user?.name} ({c.user?.email})</td><td>{new Date(c.issuedAt).toLocaleDateString()}</td></tr>)}</tbody></table></div></div>}</main>;
}
function ContentEditor({ type, item, onCancel, onSave }) {
  const [f, setF] = useState({ ...item, quiz: item.quiz || { q: "", a: "" }, published: item.published ?? true, order: item.order ?? 1, tag: item.tag || "concept" });
  const fields = type === "modules" ? [["title", "Title", true], ["summary", "Summary", false, null, "textarea"], ["explanation", "Lesson Explanation", false, null, "textarea"], ["example", "Worked Example", false, null, "textarea"], ["activity", "Learner Activity", false, null, "textarea"], ["order", "Display Order"]] : [["title", "Title", true], ["tag", "Category", true, ["concept", "technique", "lifecycle"]], ["summary", "Summary", false, null, "textarea"], ["meaning", "Meaning", false, null, "textarea"], ["importance", "Importance", false, null, "textarea"], ["example", "Example", false, null, "textarea"], ["action", "Suggested Activity", false, null, "textarea"]];
  return <form className="card" onSubmit={(e) => {
    e.preventDefault();
    onSave({ ...f, order: Number(f.order) });
  }}><h3>{item._id ? "Edit" : "Create"} {type === "modules" ? "Module" : "Glossary Entry"}</h3>{fields.map(([k, label, required, choices, kind]) => <Field key={k} name={k} label={label} required={required} choices={choices} kind={kind || "text"} value={f[k]} onChange={(k2, v) => setF((p) => ({ ...p, [k2]: v }))} />)}{type === "modules" && <><Field label="Self-check question" name="q" value={f.quiz.q} onChange={(k, v) => setF((p) => ({ ...p, quiz: { ...p.quiz, q: v } }))} /><Field label="Suggested answer" name="a" value={f.quiz.a} onChange={(k, v) => setF((p) => ({ ...p, quiz: { ...p.quiz, a: v } }))} /></>}<label className="formlabel"><input type="checkbox" checked={f.published} onChange={(e) => setF((p) => ({ ...p, published: e.target.checked }))} /> Published</label><div className="actions"><button className="btn primary">Save Content</button><button type="button" className="btn" onClick={onCancel}>Cancel</button></div></form>;
}
function ReviewCard({ item, type, onSave }) {
  const [f, setF] = useState({ status: item.status, reviewNote: item.reviewNote || "" });
  return <div className="card"><h3>{item.title || item.feature}</h3><p className="muted small">{item.user?.name} ({item.user?.email}) • {new Date(item.createdAt).toLocaleDateString()}</p><details><summary className="lime">View full submission</summary>{(type === "bugs" ? bugFields : caseFields).map(([k, label]) => <p key={k} className="small"><b>{label}:</b> {item[k]}</p>)}</details><div className="cols" style={{ marginTop: 12 }}><Field name="status" label="Review status" value={f.status} choices={["submitted", "reviewed", "needs_changes"]} onChange={(k, v) => setF((p) => ({ ...p, status: v }))} /><Field name="reviewNote" label="Reviewer note" value={f.reviewNote} onChange={(k, v) => setF((p) => ({ ...p, reviewNote: v }))} /></div><button className="btn primary" onClick={() => onSave(f)}>Save Review</button></div>;
}
function FeedbackReview({ item, onSave }) {
  const [reply, setReply] = useState(item.adminReply || "");
  return <div className="card"><h3>★ {item.rating}/5 — {item.user?.name}</h3><p>{item.message}</p><Field label="Admin reply" name="reply" value={reply} onChange={(_, v) => setReply(v)} /><button className="btn primary" onClick={() => onSave(reply)}>Save Reply</button></div>;
}
createRoot(document.getElementById("root")).render(<App />);
