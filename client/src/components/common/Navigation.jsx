import React from 'react';
import { Link } from 'react-router-dom';
import { NAV_ITEMS } from './Header';

export default function MobileNavigation({ currentTab }) {
  return (
    <nav className="mobile-nav-bar no-print" aria-label="Mobile Navigation">
      {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
        <Link
          key={key}
          to={key === 'home' ? '/' : `/${key}`}
          className={currentTab === key ? 'active' : ''}
          aria-current={currentTab === key ? 'page' : undefined}
        >
          <Icon size={18} />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
