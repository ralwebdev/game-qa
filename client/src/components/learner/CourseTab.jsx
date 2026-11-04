import React, { useState } from 'react';
import { 
  CheckCircle2, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle, 
  Sparkles, 
  Code2, 
  Flag,
  Search,
  X,
  BookMarked,
  RotateCcw
} from 'lucide-react';
import Badge from '../common/Badge';
import { post } from '../../services/api';
import { useSearchParams } from 'react-router-dom';
import TheoryTab from './TheoryTab';

export default function CourseTab({ modules, theory, user, setUser, run, setNotice }) {
  const completed = user?.completedModules || [];
  const [openQuizAnswers, setOpenQuizAnswers] = useState({});
  const [openLessons, setOpenLessons] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'todo' | 'completed'
  const [searchParams, setSearchParams] = useSearchParams();

  const view = searchParams.get('view');
  const showGlossary = view === 'glossary';
  const session = searchParams.get('session') === '2' ? 2 : 1;

  // Distinguish Session 1 and Session 2 curriculum modules
  const isSessionTwo = (m) => (m.legacyId >= 115 && m.legacyId <= 122) || /^Session 2\b/i.test(m.summary || '') || (m.order >= 15);
  const sessionOneModules = modules.filter((m) => !isSessionTwo(m));
  const sessionTwoModules = modules.filter((m) => isSessionTwo(m));
  const activeSessionModules = session === 2 ? sessionTwoModules : sessionOneModules;

  // Progress metrics
  const totalCompletedCount = modules.filter((m) => completed.includes(m._id)).length;
  const s1Completed = sessionOneModules.filter((m) => completed.includes(m._id)).length;
  const s2Completed = sessionTwoModules.filter((m) => completed.includes(m._id)).length;
  const currentCompleted = session === 2 ? s2Completed : s1Completed;
  const sessionProgressPercent = activeSessionModules.length > 0
    ? Math.round((currentCompleted / activeSessionModules.length) * 100)
    : 0;

  // Filter modules based on search and status
  const query = searchQuery.toLowerCase().trim();
  const filteredModules = activeSessionModules.filter((m) => {
    const isDone = completed.includes(m._id);
    if (statusFilter === 'todo' && isDone) return false;
    if (statusFilter === 'completed' && !isDone) return false;
    if (!query) return true;
    return (
      (m.title && m.title.toLowerCase().includes(query)) ||
      (m.summary && m.summary.toLowerCase().includes(query)) ||
      (m.explanation && m.explanation.toLowerCase().includes(query))
    );
  });

  // Toggle single module accordion
  const toggleLesson = (id) => {
    setOpenLessons((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Expand / collapse all modules in the current session
  const anyOpen = Object.values(openLessons).some(Boolean);
  const toggleAllLessons = () => {
    if (anyOpen) {
      setOpenLessons({});
    } else {
      const next = {};
      filteredModules.forEach((m) => { next[m._id] = true; });
      setOpenLessons(next);
    }
  };

  const toggleQuizAnswer = (moduleId) => {
    setOpenQuizAnswers((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const handleComplete = (moduleId) => {
    run(async () => {
      await post(`/modules/${moduleId}/complete`, {});
      setUser((prev) => ({
        ...prev,
        completedModules: Array.from(new Set([...(prev.completedModules || []), moduleId]))
      }));
      setNotice('Module successfully completed! Progress updated.');
    });
  };

  return (
    <div>
      {/* Top Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">QA Curriculum &amp; Course</h1>
          <p className="page-subtitle">
            Master professional game testing across progressive sessions and theory slide decks.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-success" title="Total academy progress">
            <CheckCircle2 size={13} /> {totalCompletedCount} / {modules.length} Completed
          </span>
        </div>
      </div>

      {/* Primary Navigation Pills: Session 1, Session 2, and Theory Glossary */}
      <div className="filter-pills" aria-label="Course section views" role="tablist">
        <button
          type="button"
          className={`filter-pill ${!showGlossary && session === 1 ? 'active' : ''}`}
          role="tab"
          aria-selected={!showGlossary && session === 1}
          onClick={() => {
            setSearchParams({});
            setSearchQuery('');
          }}
        >
          Session 1: Foundations ({s1Completed}/{sessionOneModules.length})
        </button>
        <button
          type="button"
          className={`filter-pill ${!showGlossary && session === 2 ? 'active' : ''}`}
          role="tab"
          aria-selected={!showGlossary && session === 2}
          onClick={() => {
            setSearchParams({ session: '2' });
            setSearchQuery('');
          }}
        >
          Session 2: Mobile QA ({s2Completed}/{sessionTwoModules.length})
        </button>
        <button
          type="button"
          className={`filter-pill ${showGlossary ? 'active' : ''}`}
          role="tab"
          aria-selected={showGlossary}
          onClick={() => {
            setSearchParams({ view: 'glossary' });
            setSearchQuery('');
          }}
        >
          <BookMarked size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: '-2px' }} />
          Theory Glossary ({theory.length})
        </button>
      </div>

      {/* When in Glossary View, render the dedicated TheoryTab component */}
      {showGlossary ? (
        <TheoryTab theory={theory} />
      ) : (
        <>
          {/* Active Session Progress Banner */}
          <div className="course-hero-banner">
            <div className="course-hero-header">
              <div>
                <h2 className="course-hero-title">
                  {session === 1
                    ? 'Session 1 • Foundations, Test Types & QA Pipeline'
                    : 'Session 2 • Mobile Bug Hunting, Reports & Portfolio'}
                </h2>
                <p className="course-hero-subtitle">
                  {session === 1
                    ? 'Learn what is a game, tester roles, QA pipeline, testing techniques, and salaries.'
                    : 'Master reporting anatomy, reproduction steps, device testing, and studio practice.'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge ${sessionProgressPercent === 100 ? 'badge-success' : 'badge-minor'}`}>
                  {currentCompleted} / {activeSessionModules.length} Done ({sessionProgressPercent}%)
                </span>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="progress-track" aria-hidden="true" style={{ margin: '10px 0 6px' }}>
              <div
                className="progress-bar"
                style={{ width: `${sessionProgressPercent}%` }}
              />
            </div>
          </div>

          {/* Controls: Mobile Search Bar & Status Filters */}
          <div className="course-controls-row">
            {/* Search Input */}
            <div className="course-search-box">
              <Search size={16} className="course-search-icon" />
              <input
                type="search"
                className="form-control course-search-input"
                aria-label="Filter session modules"
                placeholder="Search modules (e.g., UI/UX, Bug Report, Salary)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="btn icon-only ghost"
                  aria-label="Clear search"
                  style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', minHeight: 32, minWidth: 32, padding: 4 }}
                  onClick={() => setSearchQuery('')}
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Status Filter & Accordion Toggle */}
            <div className="flex items-center gap-2 justify-between flex-wrap">
              <div className="course-status-filters" role="group" aria-label="Status filter">
                <button
                  type="button"
                  className={`filter-pill ${statusFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('all')}
                >
                  All ({activeSessionModules.length})
                </button>
                <button
                  type="button"
                  className={`filter-pill ${statusFilter === 'todo' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('todo')}
                >
                  To Do ({activeSessionModules.length - currentCompleted})
                </button>
                <button
                  type="button"
                  className={`filter-pill ${statusFilter === 'completed' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('completed')}
                >
                  Completed ({currentCompleted})
                </button>
              </div>

              {filteredModules.length > 0 && (
                <button
                  type="button"
                  className="btn ghost sm"
                  style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}
                  onClick={toggleAllLessons}
                  title="Expand or collapse all modules on this screen"
                >
                  {anyOpen ? (
                    <>
                      <ChevronUp size={14} /> Collapse All
                    </>
                  ) : (
                    <>
                      <ChevronDown size={14} /> Expand All
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Module Cards Grid */}
          <div style={{ display: 'grid', gap: 14 }}>
            {filteredModules.length === 0 ? (
              <div className="card text-center" style={{ padding: '36px 20px' }}>
                <p style={{ fontSize: '2rem', margin: '0 0 10px' }}>🔍</p>
                <h3 style={{ marginBottom: 6 }}>No matching lessons found</h3>
                <p className="text-muted text-sm" style={{ maxWidth: 420, margin: '0 auto 16px' }}>
                  No modules match &quot;{searchQuery}&quot; with the selected filter. Try clearing your search or switching filters.
                </p>
                <button
                  type="button"
                  className="btn ghost sm"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                >
                  <RotateCcw size={14} /> Reset Filters
                </button>
              </div>
            ) : (
              filteredModules.map((m, index) => {
                const isDone = completed.includes(m._id);
                const isAnswerRevealed = !!openQuizAnswers[m._id];
                const isOpen = !!openLessons[m._id];
                const cleanSummary = (m.summary || '').replace(/\s*\?\s*/g, ' • ');
                const relatedTheory = theory.filter(
                  (item) => item.moduleLegacyId === m.legacyId || (item.title && m.title && item.title.trim().toLowerCase() === m.title.trim().toLowerCase())
                );

                return (
                  <div
                    key={m._id}
                    className={`module-card ${isDone ? 'completed' : ''}`}
                  >
                    {/* Module Card Top Header */}
                    <div className="card-header-row">
                      <div className="flex items-center gap-3" style={{ minWidth: 0, flex: 1 }}>
                        <span
                          className="module-index"
                          style={{
                            background: isDone ? 'rgba(16, 185, 129, 0.18)' : undefined,
                            borderColor: isDone ? 'var(--primary)' : undefined
                          }}
                        >
                          {String(m.order ?? index + 1).padStart(2, '0')}
                        </span>
                        <h3 className="module-card-title">
                          {m.title}
                        </h3>
                      </div>
                      <Badge
                        text={isDone ? 'Completed' : 'Ready'}
                        type={isDone ? 'success' : 'neutral'}
                      />
                    </div>

                    {/* Brief Summary */}
                    {cleanSummary && (
                      <p className="text-muted" style={{ fontSize: '0.88rem', margin: '6px 0 10px', lineHeight: 1.5 }}>
                        {cleanSummary}
                      </p>
                    )}

                    {/* Mobile-Friendly Accordion Trigger */}
                    <button
                      type="button"
                      className={`module-toggle-btn ${isOpen ? 'active' : ''}`}
                      onClick={() => toggleLesson(m._id)}
                      aria-expanded={isOpen}
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen size={16} />
                        <span>{isOpen ? 'Close Lesson' : 'Open Lesson & Theory Slides'}</span>
                      </div>
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>

                    {/* Expanded Lesson Content */}
                    {isOpen && (
                      <div className="lesson-expanded-content">
                        {/* 1. Related Theory Slides */}
                        {relatedTheory.length > 0 && (
                          <div className="lesson-section">
                            <div className="lesson-section-header">
                              <BookOpen size={15} style={{ color: '#a3e635' }} />
                              <span>Curriculum Theory Slide</span>
                            </div>
                            <TheoryTab theory={relatedTheory} embedded />
                          </div>
                        )}

                        {/* 2. Explanation & Core Principles */}
                        {m.explanation && (
                          <div className="lesson-section">
                            <div className="lesson-section-header">
                              <Sparkles size={15} style={{ color: '#10b981' }} />
                              <span>Explanation &amp; Principles</span>
                            </div>
                            <div className="lesson-explanation-box">
                              <p style={{ margin: 0 }}>{m.explanation}</p>
                            </div>
                          </div>
                        )}

                        {/* 3. Worked Example / Scenario */}
                        {m.example && (
                          <div className="callout-box example">
                            <div className="flex items-center gap-2 mb-1" style={{ color: '#06b6d4', fontWeight: 700 }}>
                              <Code2 size={16} />
                              <span>Worked Example / Studio Scenario</span>
                            </div>
                            <p style={{ margin: 0, whiteSpace: 'pre-line' }}>{m.example}</p>
                          </div>
                        )}

                        {/* 4. Practical Hands-On Exercise */}
                        {m.activity && (
                          <div className="callout-box activity">
                            <div className="flex items-center gap-2 mb-1" style={{ color: '#f59e0b', fontWeight: 700 }}>
                              <Flag size={16} />
                              <span>Hands-On QA Exercise</span>
                            </div>
                            <p style={{ margin: 0 }}>{m.activity}</p>
                          </div>
                        )}

                        {/* 5. Knowledge Self-Check */}
                        {m.quiz?.q && (
                          <div className="quiz-box">
                            <div className="flex items-center gap-2 mb-2" style={{ color: '#84cc16', fontWeight: 700 }}>
                              <HelpCircle size={16} />
                              <span>Knowledge Self-Check</span>
                            </div>
                            <p style={{ fontWeight: 600, color: '#f8fafc', marginBottom: 10 }}>
                              {m.quiz.q}
                            </p>

                            <button
                              type="button"
                              className="btn sm ghost quiz-reveal-btn"
                              style={{ color: '#10b981', paddingLeft: 0 }}
                              onClick={() => toggleQuizAnswer(m._id)}
                            >
                              {isAnswerRevealed ? 'Hide Suggested Answer' : 'Reveal Suggested Answer'}
                            </button>

                            {isAnswerRevealed && (
                              <div className="quiz-answer-revealed">
                                <strong>Suggested Answer:</strong> {m.quiz.a}
                              </div>
                            )}
                          </div>
                        )}

                        {/* 6. Lesson Bottom Action Bar */}
                        <div className="lesson-bottom-actions">
                          <button
                            type="button"
                            disabled={isDone}
                            className={`btn primary ${isDone ? 'btn-completed' : ''}`}
                            onClick={() => handleComplete(m._id)}
                          >
                            {isDone ? (
                              <>
                                <CheckCircle2 size={16} /> Module Completed
                              </>
                            ) : (
                              <>
                                <Sparkles size={16} /> Mark Module Complete
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            className="btn ghost sm"
                            onClick={() => toggleLesson(m._id)}
                          >
                            <ChevronUp size={16} /> Close Lesson
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
