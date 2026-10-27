import React from 'react';

export default function StatCard({ label, value, icon: Icon, variant = 'emerald', subtitle }) {
  return (
    <div className="stat-card">
      {Icon && (
        <div className={`stat-icon ${variant}`}>
          <Icon size={22} />
        </div>
      )}
      <div className="stat-content">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
        {subtitle && <span className="text-dim text-sm">{subtitle}</span>}
      </div>
    </div>
  );
}
