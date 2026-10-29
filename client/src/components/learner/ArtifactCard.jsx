import React, { useState } from 'react';
import { 
  Bug, 
  FileCheck, 
  Edit3, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  MessageSquare, 
  Calendar, 
  Laptop 
} from 'lucide-react';
import Badge from '../common/Badge';
import ArtifactForm from './ArtifactForm';

export default function ArtifactCard({ item, kind, onDelete, onSave, savedDevices = [] }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const isBug = kind === 'bugs';
  const createdDate = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '';

  const handleConfirmDelete = () => {
    if (window.confirm(`Are you sure you want to delete this ${isBug ? 'defect report' : 'test case'}?`)) {
      onDelete();
    }
  };

  return (
    <div className="artifact-card">
      <div className="card-header-row">
        <div className="flex items-center gap-3">
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 'var(--radius-sm)',
              background: isBug ? 'rgba(245, 158, 11, 0.12)' : 'rgba(6, 182, 212, 0.12)',
              color: isBug ? '#f59e0b' : '#06b6d4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            {isBug ? <Bug size={18} /> : <FileCheck size={18} />}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem' }}>
              {isBug ? item.title : item.feature}
            </h3>
            <div className="artifact-meta mt-1">
              {createdDate && (
                <span className="flex items-center gap-1 font-mono">
                  <Calendar size={12} /> {createdDate}
                </span>
              )}
              {isBug && item.device && (
                <span className="flex items-center gap-1">
                  <Laptop size={12} /> {item.device}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isBug ? (
            <>
              <Badge text={item.severity} />
              <Badge text={item.priority} />
            </>
          ) : (
            <Badge text={item.result} />
          )}
          <Badge text={item.status || 'submitted'} />
        </div>
      </div>

      {/* Reviewer Note if any */}
      {item.reviewNote && (
        <div className="callout-box" style={{ borderLeftColor: '#f59e0b', background: 'rgba(245, 158, 11, 0.08)' }}>
          <div className="flex items-center gap-2 mb-1" style={{ color: '#fbbf24', fontWeight: 700 }}>
            <MessageSquare size={15} />
            <span>Reviewer Feedback</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.88rem' }}>{item.reviewNote}</p>
        </div>
      )}

      {/* Structured Details */}
      <details className="expandable-details" open={isExpanded} onToggle={(e) => setIsExpanded(e.target.open)}>
        <summary>
          <span>{isExpanded ? 'Hide Full Specification' : 'View Full Details & Execution Steps'}</span>
        </summary>

        <table className="artifact-field-table">
          <tbody>
            {isBug ? (
              <>
                <tr>
                  <td>Category</td>
                  <td>{item.category || 'Gameplay'}</td>
                </tr>
                {item.description && (
                  <tr><td>Issue Description</td><td style={{ whiteSpace: 'pre-line' }}>{item.description}</td></tr>
                )}
                {item.devices?.length > 0 && <tr><td>Tested devices</td><td>{item.devices.map((d, i) => <div key={i}>{[d.platform, d.device, d.os, d.cpu && `CPU: ${d.cpu}`, d.gpu && `GPU: ${d.gpu}`, d.graphics && `Graphics: ${d.graphics}`, d.result].filter(Boolean).join(' ? ')}</div>)}</td></tr>}
                {item.os && !item.devices?.length && (
                  <tr><td>Operating System Version</td><td>{item.os}</td></tr>
                )}
                {(item.appName || item.build) && (
                  <tr>
                    <td>App / Build</td>
                    <td>{item.appName} {item.build ? `(${item.build})` : ''}</td>
                  </tr>
                )}
                {item.preconditions && (
                  <tr>
                    <td>Preconditions</td>
                    <td>{item.preconditions}</td>
                  </tr>
                )}
                <tr>
                  <td>Steps to Reproduce</td>
                  <td style={{ whiteSpace: 'pre-line' }}>{item.steps}</td>
                </tr>
                <tr>
                  <td>Expected Result</td>
                  <td>{item.expected}</td>
                </tr>
                <tr>
                  <td>Actual Result</td>
                  <td style={{ color: '#fb7185' }}>{item.actual}</td>
                </tr>
                {item.frequency && (
                  <tr>
                    <td>Frequency</td>
                    <td>{item.frequency}</td>
                  </tr>
                )}
                {item.impact && (
                  <tr>
                    <td>Player Impact</td>
                    <td>{item.impact}</td>
                  </tr>
                )}
                {item.media && (
                  <tr>
                    <td>Media Reference</td>
                    <td>
                      <a href={item.media} target="_blank" rel="noopener noreferrer">
                        {item.media}
                      </a>
                    </td>
                  </tr>
                )}
                {item.notes && (
                  <tr>
                    <td>Comments</td>
                    <td>{item.notes}</td>
                  </tr>
                )}
              </>
            ) : (
              <>
                <tr>
                  <td>Objective</td>
                  <td>{item.objective}</td>
                </tr>
                {item.preconditions && (
                  <tr>
                    <td>Preconditions</td>
                    <td>{item.preconditions}</td>
                  </tr>
                )}
                <tr>
                  <td>Ordered Steps</td>
                  <td style={{ whiteSpace: 'pre-line' }}>{item.steps}</td>
                </tr>
                <tr>
                  <td>Expected Outcome</td>
                  <td>{item.expected}</td>
                </tr>
                <tr>
                  <td>Result Status</td>
                  <td><Badge text={item.result} /></td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </details>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <button
          type="button"
          className="btn sm"
          onClick={() => setIsEditing(!isEditing)}
        >
          <Edit3 size={14} />
          {isEditing ? 'Cancel Edit' : 'Edit Specification'}
        </button>
        <button
          type="button"
          className="btn sm danger"
          onClick={handleConfirmDelete}
        >
          <Trash2 size={14} />
          Delete
        </button>
      </div>

      {isEditing && (
        <div className="mt-4">
          <ArtifactForm
            kind={isBug ? 'bug' : 'case'}
            initial={item}
            savedDevices={savedDevices}
            buttonText="Save Changes"
            onSave={async (values) => {
              const saved = await onSave(values);
              if (saved !== false) setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      )}
    </div>
  );
}
