import React from 'react';
import { 
  BookOpen, 
  Bug, 
  FileCheck, 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  Target 
} from 'lucide-react';
import StatCard from '../common/StatCard';
import { post } from '../../services/api';

export default function HomeTab({ user, dash, modules, bugs, cases, go, run, setNotice }) {
  const completed = user?.completedModules || [];
  const totalModules = dash?.modules || modules.length || 0;
  const completedCount = dash?.completed || 0;
  const pct = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;

  const nextModule = modules.find((m) => !completed.includes(m._id));
  const isEligible = dash?.eligible;
  const hasCertificate = !!dash?.certificate;

  const handleIssueCertificate = () => {
    run(async () => {
      await post('/certificates/issue', {});
      setNotice('Congratulations! Your Certificate of Completion has been issued.');
    });
  };

  return (
    <div className="space-y-4">
      {/* Hero Welcome Card */}
      <div className="card hero">
        <div className="flex justify-between items-center mb-2">
          <span className="pill-role">{user?.learnerRole || 'Scope GT Apprentice'}</span>
          <span className="text-dim text-sm font-mono">Curriculum v2.4</span>
        </div>

        <h1 style={{ marginTop: 8, marginBottom: 6 }}>
          Welcome back, {user?.name}
        </h1>
        <p className="text-muted" style={{ maxWidth: 640 }}>
          Master game testing pipelines, authored test cases, and professional defect logging standards.
        </p>

        {/* Progress Section */}
        <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div className="flex justify-between items-center text-sm mb-1">
            <span style={{ fontWeight: 600, color: '#f8fafc' }}>Curriculum Completion</span>
            <span className="font-mono" style={{ color: '#10b981', fontWeight: 700 }}>
              {pct}%
            </span>
          </div>
          <div className="progress-track">
            <div className="progress-bar" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="stat-grid mt-4">
          <StatCard
            label="Modules Finished"
            value={`${completedCount}/${totalModules}`}
            icon={BookOpen}
            variant="emerald"
          />
          <StatCard
            label="Bugs Reported"
            value={dash?.bugs ?? bugs.length}
            icon={Bug}
            variant="amber"
          />
          <StatCard
            label="Test Cases"
            value={dash?.cases ?? cases.length}
            icon={FileCheck}
            variant="cyan"
          />
        </div>
      </div>

      {/* Suggested Next Step */}
      <div className="card">
        <div className="flex items-center gap-2 mb-2">
          <Target size={16} className="text-muted" />
          <span className="text-dim text-sm font-mono uppercase" style={{ letterSpacing: '0.05em' }}>
            Suggested Next Mission
          </span>
        </div>

        <h2 style={{ marginBottom: 6 }}>
          {nextModule ? `${nextModule.order ? `${nextModule.order}. ` : ''}${nextModule.title}` : 'Review & Polish Your QA Portfolio'}
        </h2>
        <p className="text-muted" style={{ fontSize: '0.92rem', marginBottom: 18 }}>
          {nextModule?.summary ||
            'You have finished all curriculum lessons! Check your defect reports and test cases to ensure they meet studio standards.'}
        </p>

        <button
          type="button"
          className="btn primary"
          onClick={() => go(nextModule ? 'course' : 'portfolio')}
        >
          {nextModule ? 'Continue Module' : 'Open Portfolio'} <ArrowRight size={16} />
        </button>
      </div>

      {/* Certificate Readiness Card */}
      <div
        className="card"
        style={{
          borderColor: hasCertificate || isEligible ? 'rgba(16, 185, 129, 0.4)' : undefined,
          boxShadow: hasCertificate || isEligible ? '0 0 25px rgba(16, 185, 129, 0.12)' : undefined
        }}
      >
        <div className="card-header-row">
          <div className="flex items-center gap-2">
            <Award size={20} style={{ color: hasCertificate || isEligible ? '#10b981' : '#94a3b8' }} />
            <h2 style={{ margin: 0 }}>Certificate of Completion</h2>
          </div>
          <span className={`badge ${hasCertificate ? 'badge-success' : isEligible ? 'badge-success' : 'badge-neutral'}`}>
            {hasCertificate ? 'Issued' : isEligible ? 'Ready to Issue' : 'In Progress'}
          </span>
        </div>

        <p className="text-muted text-sm" style={{ marginBottom: 16 }}>
          Earn an official, cryptographically verifiable record acknowledging your foundational skills across game testing theory, bug reporting, and test case authoring.
        </p>

        {/* Milestone Checklist */}
        <div className="space-y-2 mb-4" style={{ display: 'grid', gap: 10 }}>
          <div className="flex items-center gap-3 text-sm">
            {completedCount === totalModules && totalModules > 0 ? (
              <CheckCircle2 size={18} style={{ color: '#10b981' }} />
            ) : (
              <Circle size={18} style={{ color: '#64748b' }} />
            )}
            <span style={{ color: completedCount === totalModules && totalModules > 0 ? '#f8fafc' : '#94a3b8' }}>
              Complete all {totalModules} curriculum modules ({completedCount}/{totalModules})
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            {bugs.length > 0 ? (
              <CheckCircle2 size={18} style={{ color: '#10b981' }} />
            ) : (
              <Circle size={18} style={{ color: '#64748b' }} />
            )}
            <span style={{ color: bugs.length > 0 ? '#f8fafc' : '#94a3b8' }}>
              Log at least 1 professional defect report ({bugs.length} logged)
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            {cases.length > 0 ? (
              <CheckCircle2 size={18} style={{ color: '#10b981' }} />
            ) : (
              <Circle size={18} style={{ color: '#64748b' }} />
            )}
            <span style={{ color: cases.length > 0 ? '#f8fafc' : '#94a3b8' }}>
              Author at least 1 test case specification ({cases.length} authored)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap mt-3">
          {hasCertificate ? (
            <button
              type="button"
              className="btn primary"
              onClick={() => go('more')}
            >
              <Award size={16} /> View & Print Certificate
            </button>
          ) : (
            <button
              type="button"
              className="btn primary"
              disabled={!isEligible}
              onClick={handleIssueCertificate}
            >
              <Sparkles size={16} /> Issue My Certificate
            </button>
          )}

          <button
            type="button"
            className="btn"
            onClick={() => go('more')}
          >
            Certificate Center Details
          </button>
        </div>
      </div>
    </div>
  );
}
