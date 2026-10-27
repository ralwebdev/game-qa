import React from 'react';
import { 
  Gamepad2, 
  Home, 
  BookOpen, 
  Search, 
  FlaskConical, 
  Folder, 
  MoreHorizontal, 
  LogOut, 
  ShieldCheck, 
  User as UserIcon 
} from 'lucide-react';

export const NAV_ITEMS = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'course', label: 'Course', icon: BookOpen },
  { key: 'theory', label: 'Theory', icon: Search },
  { key: 'practice', label: 'Practice Lab', icon: FlaskConical },
  { key: 'portfolio', label: 'Portfolio', icon: Folder },
  { key: 'more', label: 'More', icon: MoreHorizontal }
];

export default function Header({ user, currentTab, onSelectTab, onLogout }) {
  return (
    <header className="app-header">
      <div className="brand">
        <div className="brand-icon-wrapper">
          <Gamepad2 size={20} />
        </div>
        <div>
          Game QA <span>Academy</span>
        </div>
      </div>

      {user && user.role !== 'admin' && (
        <nav className="header-nav no-print" aria-label="Main Navigation">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              className={`nav-tab-btn ${currentTab === key ? 'active' : ''}`}
              onClick={() => onSelectTab(key)}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      )}

      {user && (
        <div className="flex items-center gap-3 no-print">
          <div className="user-profile-badge">
            <div className="user-avatar">
              {user.role === 'admin' ? <ShieldCheck size={16} /> : (user.name?.[0] || 'L').toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1.1 }}>
                {user.role === 'admin' ? 'Academy Admin' : user.name}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>
                {user.role === 'admin' ? 'Administrator' : user.learnerRole}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="btn icon-only ghost"
            onClick={onLogout}
            title="Log out of session"
            aria-label="Log out"
          >
            <LogOut size={17} />
          </button>
        </div>
      )}
    </header>
  );
}
