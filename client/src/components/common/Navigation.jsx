import React from 'react';
import { NAV_ITEMS } from './Header';

export default function MobileNavigation({ currentTab, onSelectTab }) {
  return (
    <nav className="mobile-nav-bar no-print" aria-label="Mobile Navigation">
      {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          type="button"
          className={currentTab === key ? 'active' : ''}
          onClick={() => onSelectTab(key)}
        >
          <Icon size={18} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
