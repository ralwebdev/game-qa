import React, { useEffect, useState } from 'react';
import HomeTab from './HomeTab';
import CourseTab from './CourseTab';
import TheoryTab from './TheoryTab';
import PracticeTab from './PracticeTab';
import PortfolioTab from './PortfolioTab';
import MoreTab from './MoreTab';
import { api } from '../../services/api';

export default function LearnerStudio({ tab, user, setUser, go, run, setNotice }) {
  const [dash, setDash] = useState(null);
  const [modules, setModules] = useState([]);
  const [theory, setTheory] = useState([]);
  const [bugs, setBugs] = useState([]);
  const [cases, setCases] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api('/dashboard'),
      api('/modules'),
      api('/theory'),
      api('/bugs'),
      api('/cases'),
      api('/feedback')
    ])
      .then(([d, m, t, b, c, f]) => {
        setDash(d);
        setModules(m);
        setTheory(t);
        setBugs(b);
        setCases(c);
        setFeedback(f);
      })
      .catch((err) => {
        console.error('Error fetching learner data:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading && !dash) {
    return (
      <div className="card text-center" style={{ padding: 48, maxWidth: 500, margin: '60px auto' }}>
        <div className="brand-icon-wrapper" style={{ margin: '0 auto 16px' }}>
          <span style={{ fontSize: '1.2rem' }}>🎮</span>
        </div>
        <h3>Loading Scope GT…</h3>
        <p className="text-muted text-sm">Synchronizing your curriculum records and testing portfolio.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {tab === 'home' && (
        <HomeTab
          user={user}
          dash={dash}
          modules={modules}
          bugs={bugs}
          cases={cases}
          go={go}
          run={run}
          setNotice={setNotice}
        />
      )}

      {tab === 'course' && (
        <CourseTab
          modules={modules}
          user={user}
          setUser={setUser}
          run={run}
          setNotice={setNotice}
        />
      )}

      {tab === 'theory' && (
        <TheoryTab theory={theory} />
      )}

      {tab === 'practice' && (
        <PracticeTab run={run} setNotice={setNotice} />
      )}

      {tab === 'portfolio' && (
        <PortfolioTab
          user={user}
          bugs={bugs}
          cases={cases}
          feedback={feedback}
          run={run}
          setNotice={setNotice}
        />
      )}

      {tab === 'more' && (
        <MoreTab
          user={user}
          setUser={setUser}
          dash={dash}
          bugs={bugs}
          cases={cases}
          feedback={feedback}
          go={go}
          run={run}
          setNotice={setNotice}
        />
      )}
    </div>
  );
}
