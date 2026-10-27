import React from 'react';

export default function Badge({ text, type }) {
  if (!text) return null;

  let className = 'badge badge-neutral';

  const t = String(text).toLowerCase();

  if (t.includes('blocker') || t.includes('critical') || t.includes('fail') || t.includes('p1') || t.includes('danger')) {
    className = 'badge badge-critical';
  } else if (t.includes('major') || t.includes('p2') || t.includes('needs_changes') || t.includes('warning') || t.includes('blocked')) {
    className = 'badge badge-major';
  } else if (t.includes('minor') || t.includes('p3') || t.includes('concept') || t.includes('info')) {
    className = 'badge badge-minor';
  } else if (t.includes('complete') || t.includes('pass') || t.includes('reviewed') || t.includes('issued') || t.includes('success')) {
    className = 'badge badge-success';
  } else if (t.includes('trivial') || t.includes('not run') || t.includes('draft') || t.includes('submitted')) {
    className = 'badge badge-trivial';
  }

  if (type) {
    className = `badge badge-${type}`;
  }

  return (
    <span className={className}>
      <span className="badge-dot" />
      {text}
    </span>
  );
}
