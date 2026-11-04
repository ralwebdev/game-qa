import React, { useState, useRef, useCallback } from 'react';
import { Search, X, BookMarked, Lightbulb, Gamepad, Compass, ChevronLeft, ChevronRight } from 'lucide-react';
import Badge from '../common/Badge';
import { formatTheoryContent } from './formatTheoryContent';

export default function TheoryTab({ theory, embedded = false }) {
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState('all');
  const [slide, setSlide] = useState(0);

  // Touch swipe state
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const isSwiping = useRef(false);

  const categories = [
    { key: 'all', label: 'All Concepts' },
    { key: 'concept', label: 'Core Concepts' },
    { key: 'technique', label: 'Testing Techniques' },
    { key: 'lifecycle', label: 'Dev Lifecycle' }
  ];
  const query = search.toLowerCase().trim();
  const filteredTheory = theory.filter((item) =>
    (tag === 'all' || item.tag === tag) &&
    (!query || [item.title, item.summary, item.meaning, item.importance, item.example, item.action]
      .some((value) => value?.toLowerCase().includes(query)))
  );
  const currentSlide = Math.min(slide, Math.max(0, filteredTheory.length - 1));
  const item = filteredTheory[currentSlide];
  const formattedContent = item && formatTheoryContent(item.meaning, item.moduleLegacyId);

  // Navigate slides
  const goToSlide = useCallback((n) => {
    setSlide(Math.max(0, Math.min(n, filteredTheory.length - 1)));
  }, [filteredTheory.length]);

  const goPrev = useCallback(() => goToSlide(currentSlide - 1), [currentSlide, goToSlide]);
  const goNext = useCallback(() => goToSlide(currentSlide + 1), [currentSlide, goToSlide]);

  // Touch swipe handlers for mobile slide navigation
  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwiping.current = false;
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (touchStartX.current === null) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;
    // Only consider it a horizontal swipe if dx > dy (prevents hijacking vertical scroll)
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
      isSwiping.current = true;
    }
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (touchStartX.current === null || !isSwiping.current) {
      touchStartX.current = null;
      touchStartY.current = null;
      return;
    }
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const SWIPE_THRESHOLD = 50;
    if (dx < -SWIPE_THRESHOLD) {
      goNext();
    } else if (dx > SWIPE_THRESHOLD) {
      goPrev();
    }
    touchStartX.current = null;
    touchStartY.current = null;
    isSwiping.current = false;
  }, [goNext, goPrev]);

  return (
    <div>
      {!embedded && <div className="page-header">
        <div>
          <h1 className="page-title">QA Theory &amp; Glossary</h1>
          <p className="page-subtitle">Explore game testing concepts one slide at a time.</p>
        </div>
        <span className="badge badge-minor font-mono">{filteredTheory.length} Entries</span>
      </div>}

      {!embedded && <><div className="search-bar-wrapper">
        <Search size={18} className="search-bar-icon" />
        <input
          type="search"
          className="form-control search-bar-input"
          aria-label="Search theory concepts"
          placeholder="Search QA concepts..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setSlide(0); }}
        />
        {search && (
          <button type="button" className="btn icon-only ghost" aria-label="Clear search"
            style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}
            onClick={() => { setSearch(''); setSlide(0); }}>
            <X size={16} />
          </button>
        )}
      </div>

        <div className="filter-pills" aria-label="Filter theory by category" role="tablist">
          {categories.map((c) => (
            <button key={c.key} type="button" className={`filter-pill ${tag === c.key ? 'active' : ''}`}
              role="tab" aria-selected={tag === c.key} onClick={() => { setTag(c.key); setSlide(0); }}>
              {c.label}
            </button>
          ))}
        </div>
      </>}

      {!item ? (
        <div className="card text-center" style={{ padding: '24px 16px' }}>
          <Compass size={36} className="text-muted" style={{ margin: '0 auto 12px' }} />
          <h3>No matching terminology found</h3>
          <p className="text-muted">Try adjusting your search query or switching to &quot;All Concepts&quot;.</p>
          <button type="button" className="btn ghost sm" onClick={() => { setSearch(''); setTag('all'); setSlide(0); }}>
            Reset Filters
          </button>
        </div>
      ) : (
        <section
          className={`theory-slideshow ${embedded ? 'theory-slideshow-embedded' : ''}`}
          aria-label="Theory slideshow"
          aria-roledescription="carousel"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="theory-slide card" key={item._id || item.id}>
            {!embedded && <div className="card-header-row">
              <span className="theory-slide-label"><BookMarked size={16} /> THEORY CONCEPT</span>
              <Badge text={item.tag} />
            </div>}
            <h2 className="theory-slide-title">{item.title}</h2>
            {!embedded && <p className="theory-slide-summary">{item.summary}</p>}
            <div className="theory-slide-content">
              {item.meaning && (formattedContent ? (
                <div className="theory-formatted-content">
                  {formattedContent.map((block, index) => {
                    if (block.type === 'heading') return <h3 key={index}>{block.text}</h3>;
                    if (block.type === 'bullet') return <ul key={index}><li>{block.text}</li></ul>;
                    return <p key={index}>{block.text}</p>;
                  })}
                </div>
              ) : <div><h4>Lesson content</h4><p style={{ whiteSpace: 'pre-line' }}>{item.meaning}</p></div>)}
              {item.importance && <div><h4>Why It Matters to QA</h4><p>{item.importance}</p></div>}
              {item.example && <div className="callout-box example">
                <div className="flex items-center gap-2 mb-1" style={{ color: '#06b6d4', fontWeight: 700 }}><Gamepad size={16} /><span>Game Scenario Example</span></div>
                <p>{item.example}</p>
              </div>}
              {item.action && <div className="callout-box activity">
                <div className="flex items-center gap-2 mb-1" style={{ color: '#f59e0b', fontWeight: 700 }}><Lightbulb size={16} /><span>Practical Testing Action</span></div>
                <p>{item.action}</p>
              </div>}
            </div>
          </div>
          {!embedded && <div className="theory-slide-navigation">
            <button type="button" className="btn ghost" disabled={currentSlide === 0} onClick={goPrev} aria-label="Previous slide">
              <ChevronLeft size={18} /> <span className="theory-nav-label">Previous</span>
            </button>
            <span className="text-muted font-mono" aria-live="polite">{currentSlide + 1} / {filteredTheory.length}</span>
            <button type="button" className="btn ghost" disabled={currentSlide === filteredTheory.length - 1} onClick={goNext} aria-label="Next slide">
              <span className="theory-nav-label">Next</span> <ChevronRight size={18} />
            </button>
          </div>}
        </section>
      )}
    </div>
  );
}
