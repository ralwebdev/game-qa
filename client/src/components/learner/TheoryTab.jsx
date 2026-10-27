import React, { useState } from 'react';
import { Search, X, BookMarked, Sparkles, Lightbulb, Gamepad, Compass } from 'lucide-react';
import Badge from '../common/Badge';

export default function TheoryTab({ theory }) {
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState('all');

  const categories = [
    { key: 'all', label: 'All Concepts' },
    { key: 'concept', label: 'Core Concepts' },
    { key: 'technique', label: 'Testing Techniques' },
    { key: 'lifecycle', label: 'Dev Lifecycle' }
  ];

  const filteredTheory = theory.filter((item) => {
    const matchesTag = tag === 'all' || item.tag === tag;
    const query = search.toLowerCase().trim();
    if (!query) return matchesTag;

    const matchesSearch =
      item.title?.toLowerCase().includes(query) ||
      item.summary?.toLowerCase().includes(query) ||
      item.meaning?.toLowerCase().includes(query) ||
      item.example?.toLowerCase().includes(query);

    return matchesTag && matchesSearch;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">QA Theory & Glossary</h1>
          <p className="page-subtitle">
            Essential game testing terminology, test design methodologies, and studio lifecycle paradigms.
          </p>
        </div>
        <span className="badge badge-minor font-mono">
          {filteredTheory.length} Entries
        </span>
      </div>

      {/* Search Bar */}
      <div className="search-bar-wrapper">
        <Search size={18} className="search-bar-icon" />
        <input
          type="text"
          className="form-control search-bar-input"
          placeholder="Search QA concepts, methodologies, examples (e.g., Regression, Smoke, Collision)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            type="button"
            className="btn icon-only ghost"
            style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}
            onClick={() => setSearch('')}
            title="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="filter-pills">
        {categories.map((c) => (
          <button
            key={c.key}
            type="button"
            className={`filter-pill ${tag === c.key ? 'active' : ''}`}
            onClick={() => setTag(c.key)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* List of Concepts */}
      {filteredTheory.length === 0 ? (
        <div className="card text-center" style={{ padding: 40 }}>
          <Compass size={36} className="text-muted" style={{ margin: '0 auto 12px' }} />
          <h3>No matching terminology found</h3>
          <p className="text-muted">
            Try adjusting your search query or switching to &quot;All Concepts&quot;.
          </p>
          <button
            type="button"
            className="btn ghost sm"
            onClick={() => {
              setSearch('');
              setTag('all');
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 18 }}>
          {filteredTheory.map((item) => (
            <div key={item._id} className="card">
              <div className="card-header-row">
                <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{item.title}</h2>
                <Badge text={item.tag} />
              </div>

              <p className="text-muted" style={{ fontSize: '0.94rem', marginBottom: 14 }}>
                {item.summary}
              </p>

              <details className="expandable-details">
                <summary>
                  <BookMarked size={16} />
                  <span>Deep-Dive & Studio Application</span>
                </summary>

                <div className="mt-3" style={{ display: 'grid', gap: 14 }}>
                  {item.meaning && (
                    <div>
                      <h4 style={{ color: '#f8fafc', marginBottom: 4 }}>Definition & Meaning</h4>
                      <p>{item.meaning}</p>
                    </div>
                  )}

                  {item.importance && (
                    <div>
                      <h4 style={{ color: '#f8fafc', marginBottom: 4 }}>Why It Matters to QA</h4>
                      <p>{item.importance}</p>
                    </div>
                  )}

                  {item.example && (
                    <div className="callout-box example">
                      <div className="flex items-center gap-2 mb-1" style={{ color: '#06b6d4', fontWeight: 700 }}>
                        <Gamepad size={16} />
                        <span>Game Scenario Example</span>
                      </div>
                      <p style={{ margin: 0 }}>{item.example}</p>
                    </div>
                  )}

                  {item.action && (
                    <div className="callout-box activity">
                      <div className="flex items-center gap-2 mb-1" style={{ color: '#f59e0b', fontWeight: 700 }}>
                        <Lightbulb size={16} />
                        <span>Practical Testing Action</span>
                      </div>
                      <p style={{ margin: 0 }}>{item.action}</p>
                    </div>
                  )}
                </div>
              </details>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
