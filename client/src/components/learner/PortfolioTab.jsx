import React from 'react';
import { Download, Bug, FileCheck, Info, Sparkles, FolderOpen } from 'lucide-react';
import ArtifactCard from './ArtifactCard';
import { patch, del } from '../../services/api';

export default function PortfolioTab({ user, bugs, cases, feedback, run, setNotice }) {
  const exportJSON = () => {
    const payload = {
      profile: {
        name: user?.name,
        email: user?.email,
        learnerRole: user?.learnerRole,
        completedModules: user?.completedModules
      },
      bugReports: bugs,
      testCases: cases,
      feedback: feedback,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `game-qa-portfolio-${(user?.name || 'learner').toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteBug = (id) => {
    run(async () => {
      await del(`/bugs/${id}`);
      setNotice('Defect report deleted from portfolio');
    });
  };

  const handleUpdateBug = async (id, data) => {
    let saved = false;
    await run(async () => {
      await patch(`/bugs/${id}`, data);
      setNotice('Defect report updated successfully');
      saved = true;
    });
    return saved;
  };

  const handleDeleteCase = (id) => {
    run(async () => {
      await del(`/cases/${id}`);
      setNotice('Test case deleted from portfolio');
    });
  };

  const handleUpdateCase = (id, data) => {
    run(async () => {
      await patch(`/cases/${id}`, data);
      setNotice('Test case updated successfully');
    });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Learner QA Portfolio</h1>
          <p className="page-subtitle">
            Repository of your logged bug tickets, test specifications, and review feedback.
          </p>
        </div>
        <button type="button" className="btn" onClick={exportJSON}>
          <Download size={16} /> Export Portfolio JSON
        </button>
      </div>

      <div className="callout-box" style={{ marginBottom: 24 }}>
        <div className="flex items-center gap-2 mb-1" style={{ color: '#06b6d4', fontWeight: 600 }}>
          <Info size={16} />
          <span>Industry Disclosure</span>
        </div>
        <p style={{ margin: 0, fontSize: '0.88rem' }}>
          These artifacts demonstrate practical methodology, defect logging accuracy, and test writing competence created in the Academy simulation environment.
        </p>
      </div>

      {/* Section 1: Defect Reports */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bug size={20} style={{ color: '#f59e0b' }} />
            <h2 style={{ margin: 0 }}>Logged Defect Reports ({bugs.length})</h2>
          </div>
          <span className="badge badge-major font-mono">{bugs.length} Logged</span>
        </div>

        {bugs.length > 0 ? (
          <div style={{ display: 'grid', gap: 14 }}>
            {bugs.map((b) => (
              <ArtifactCard
                key={b._id}
                item={b}
                kind="bugs"
                savedDevices={user.devices || []}
                onDelete={() => handleDeleteBug(b._id)}
                onSave={(data) => handleUpdateBug(b._id, data)}
              />
            ))}
          </div>
        ) : (
          <div className="card text-center" style={{ padding: 32 }}>
            <FolderOpen size={32} className="text-muted" style={{ margin: '0 auto 8px' }} />
            <p className="text-muted" style={{ margin: 0 }}>
              No bug reports logged yet. Head to the <strong>Practice Lab</strong> to author your first defect ticket!
            </p>
          </div>
        )}
      </div>

      {/* Section 2: Test Cases */}
      <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileCheck size={20} style={{ color: '#06b6d4' }} />
            <h2 style={{ margin: 0 }}>Authored Test Cases ({cases.length})</h2>
          </div>
          <span className="badge badge-minor font-mono">{cases.length} Authored</span>
        </div>

        {cases.length > 0 ? (
          <div style={{ display: 'grid', gap: 14 }}>
            {cases.map((c) => (
              <ArtifactCard
                key={c._id}
                item={c}
                kind="cases"
                onDelete={() => handleDeleteCase(c._id)}
                onSave={(data) => handleUpdateCase(c._id, data)}
              />
            ))}
          </div>
        ) : (
          <div className="card text-center" style={{ padding: 32 }}>
            <FolderOpen size={32} className="text-muted" style={{ margin: '0 auto 8px' }} />
            <p className="text-muted" style={{ margin: 0 }}>
              No test cases authored yet. Head to the <strong>Practice Lab</strong> to design test scenarios!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
