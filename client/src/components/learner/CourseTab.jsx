import React, { useState } from 'react';
import { 
  CheckCircle2, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle, 
  Sparkles, 
  Code2, 
  Flag 
} from 'lucide-react';
import Badge from '../common/Badge';
import { post } from '../../services/api';
import { useSearchParams } from 'react-router-dom';
import TheoryTab from './TheoryTab';

export default function CourseTab({ modules, theory, user, setUser, run, setNotice }) {
  const completed = user?.completedModules || [];
  const [openQuizAnswers, setOpenQuizAnswers] = useState({});
  const [searchParams, setSearchParams] = useSearchParams();
  const showGlossary = searchParams.get('view') === 'glossary';

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
      <div className="page-header">
        <div>
          <h1 className="page-title">Course</h1>
          <p className="page-subtitle">
            Learn with theory slides, practical exercises, and self-checks.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-success">
            {modules.filter((module) => completed.includes(module._id)).length} / {modules.length} Completed
          </span>
        </div>
      </div>

      <div className="filter-pills" aria-label="Course views">
        <button type="button" className={`filter-pill ${!showGlossary ? 'active' : ''}`} aria-pressed={!showGlossary} onClick={() => setSearchParams({})}>Lessons</button>
        <button type="button" className={`filter-pill ${showGlossary ? 'active' : ''}`} aria-pressed={showGlossary} onClick={() => setSearchParams({ view: 'glossary' })}>Theory glossary</button>
      </div>

      {showGlossary ? <TheoryTab theory={theory} /> : <div style={{ display: 'grid', gap: 18 }}>
        {modules.map((m, index) => {
          const isDone = completed.includes(m._id);
          const isAnswerRevealed = !!openQuizAnswers[m._id];
          const relatedTheory = theory.filter((item) => item.moduleLegacyId === m.legacyId);

          return (
            <div
              key={m._id}
              className={`module-card ${isDone ? 'completed' : ''}`}
            >
              <div className="card-header-row">
                <div className="flex items-center gap-3">
                  <span className="module-index">
                    {String(m.order ?? index + 1).padStart(2, '0')}
                  </span>
                  <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{m.title}</h2>
                </div>
                <Badge
                  text={isDone ? 'Completed' : 'Ready'}
                  type={isDone ? 'success' : 'neutral'}
                />
              </div>

              <p className="text-muted" style={{ fontSize: '0.92rem', marginBottom: 14 }}>
                {m.summary}
              </p>

              <details className="expandable-details">
                <summary>
                  <BookOpen size={16} />
                  <span>Open Lesson</span>
                </summary>

                <div className="mt-4" style={{ display: 'grid', gap: 16 }}>
                  {relatedTheory.length > 0 && (
                    <div>
                      <h3 style={{ marginBottom: 12 }}>Theory</h3>
                      <TheoryTab theory={relatedTheory} embedded />
                    </div>
                  )}
                  <div>
                    <h4 style={{ color: '#f8fafc', marginBottom: 6 }}>Explanation & Principles</h4>
                    <p style={{ lineHeight: 1.65 }}>{m.explanation}</p>
                  </div>

                  {m.example && (
                    <div className="callout-box example">
                      <div className="flex items-center gap-2 mb-1" style={{ color: '#06b6d4', fontWeight: 700 }}>
                        <Code2 size={16} />
                        <span>Worked Example / Studio Scenario</span>
                      </div>
                      <p style={{ margin: 0, whiteSpace: 'pre-line' }}>{m.example}</p>
                    </div>
                  )}

                  {m.activity && (
                    <div className="callout-box activity">
                      <div className="flex items-center gap-2 mb-1" style={{ color: '#f59e0b', fontWeight: 700 }}>
                        <Flag size={16} />
                        <span>Hands-On QA Exercise</span>
                      </div>
                      <p style={{ margin: 0 }}>{m.activity}</p>
                    </div>
                  )}

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
                        className="btn sm ghost"
                        style={{ color: '#10b981', paddingLeft: 0 }}
                        onClick={() => toggleQuizAnswer(m._id)}
                      >
                        {isAnswerRevealed ? 'Hide Suggested Answer' : 'Reveal Suggested Answer'}
                      </button>

                      {isAnswerRevealed && (
                        <div
                          className="mt-2 p-3"
                          style={{
                            background: 'rgba(16, 185, 129, 0.08)',
                            borderRadius: 'var(--radius-sm)',
                            borderLeft: '2px solid #10b981',
                            fontSize: '0.9rem',
                            color: '#cbd5e1'
                          }}
                        >
                          <strong>Suggested Answer:</strong> {m.quiz.a}
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <button
                      type="button"
                      disabled={isDone}
                      className="btn primary"
                      style={{ marginTop: 8 }}
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
                  </div>
                </div>
              </details>
            </div>
          );
        })}
      </div>}
    </div>
  );
}
