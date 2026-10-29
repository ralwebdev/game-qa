import React, { useState } from 'react';
import { 
  Bug, 
  FileCheck, 
  Send, 
  AlertTriangle, 
  Info, 
  Layers, 
  Sparkles, 
  Monitor, 
  HelpCircle 
} from 'lucide-react';
import FormField from '../common/FormField';

export const BUG_DEFAULTS = {
  title: '',
  category: 'UI/UX',
  description: '',
  device: '',
  severity: 'Medium',
  priority: 'Medium',
  steps: '',
  expected: '',
  actual: '',
  appName: '',
  build: '',
  os: '',
  frequency: 'Not provided',
  preconditions: '',
  impact: '',
  media: '',
  notes: ''
};

export const CASE_DEFAULTS = {
  feature: '',
  objective: '',
  preconditions: '',
  steps: '',
  expected: '',
  result: 'Not run'
};

export default function ArtifactForm({ kind = 'bug', initial, onSave, buttonText, onCancel, savedDevice }) {
  const [form, setForm] = useState(initial || (kind === 'bug' ? { ...BUG_DEFAULTS, device: savedDevice?.device || '', os: savedDevice?.os || '' } : CASE_DEFAULTS));
  const [busy, setBusy] = useState(false);
  const optionsWithCurrent = (options, current) => current && !options.includes(current) ? [current, ...options] : options;

  const update = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const saved = await onSave(form);
      if (!initial && saved !== false) {
        setForm(kind === 'bug' ? { ...BUG_DEFAULTS, device: form.device, os: form.os } : CASE_DEFAULTS);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <div className="card-header-row mb-3">
        <div className="flex items-center gap-2">
          {kind === 'bug' ? (
            <Bug size={20} style={{ color: '#f59e0b' }} />
          ) : (
            <FileCheck size={20} style={{ color: '#06b6d4' }} />
          )}
          <h2 style={{ margin: 0 }}>
            {initial
              ? `Edit ${kind === 'bug' ? 'Defect Report' : 'Test Case'}`
              : kind === 'bug'
              ? 'Defect Report Studio'
              : 'Test Case Authoring Studio'}
          </h2>
        </div>
        <span className={`badge ${kind === 'bug' ? 'badge-major' : 'badge-minor'}`}>
          {kind === 'bug' ? 'Defect Report' : 'Test Case Spec'}
        </span>
      </div>

      {kind === 'bug' ? (
        <>
          <div className="mb-4">
            <h4>Device Details</h4>
            <div className="form-grid-2">
              <FormField label="Model Name and Number" name="device" placeholder="e.g. Redmi Note 12 Pro 5G" value={form.device} onChange={update} required />
              <FormField label="Android Version" name="os" placeholder="e.g. 16" value={form.os} onChange={update} required />
            </div>
          </div>
          <p className="text-dim text-sm">Enter one issue per report. Reports are identified in your portfolio.</p>
          <div className="form-grid-2">
            <FormField label="Issue Category" name="category" choices={optionsWithCurrent(['UI/UX', 'Functional', 'Usability', 'Compatibility', 'Performance', 'Other'], form.category)} value={form.category} onChange={update} required />
            <FormField label="Issue Title" name="title" placeholder="Briefly describe the issue" value={form.title} onChange={update} required />
          </div>
          <FormField label="Issue Description" name="description" kind="textarea" placeholder="Describe the issue and where it occurs" value={form.description} onChange={update} />
          <FormField label="Pre Conditions" name="preconditions" kind="textarea" placeholder="Describe the conditions needed before testing" value={form.preconditions} onChange={update} />
          <FormField label="Steps to Replicate" name="steps" kind="textarea" placeholder={'1. Launch the game.\n2. Perform the action.\n3. Observe the issue.'} value={form.steps} onChange={update} required />
          <div className="form-grid-2">
            <FormField label="Expected Result" name="expected" kind="textarea" placeholder="What should happen?" value={form.expected} onChange={update} required />
            <FormField label="Actual Result" name="actual" kind="textarea" placeholder="What actually happened?" value={form.actual} onChange={update} required />
          </div>
          <div className="form-grid-2">
            <FormField label="Priority" name="priority" choices={optionsWithCurrent(['High', 'Medium', 'Low'], form.priority)} value={form.priority} onChange={update} required />
            <FormField label="Severity" name="severity" choices={optionsWithCurrent(['High', 'Medium', 'Low'], form.severity)} value={form.severity} onChange={update} required />
          </div>
          <FormField label="Impact" name="impact" kind="textarea" placeholder="Describe how the issue affects users" value={form.impact} onChange={update} />
          <FormField label="Comments" name="notes" kind="textarea" placeholder="Additional observations" value={form.notes} onChange={update} />
          <FormField label="Attachment Link (Image or Video URL)" name="media" placeholder="https://..." value={form.media} onChange={update} />
          <details className="expandable-details">
            <summary>Additional environment details</summary>
            <div className="form-grid-2 mt-3">
              <FormField label="Game / App Title" name="appName" value={form.appName} onChange={update} />
              <FormField label="Build / Version" name="build" value={form.build} onChange={update} />
              <FormField label="Reproduction Frequency" name="frequency" choices={optionsWithCurrent(['Not provided', '100% (5/5 attempts)', 'Intermittent (~60%)', 'Once only'], form.frequency)} value={form.frequency} onChange={update} />
            </div>
          </details>
        </>
      ) : (
        /* Test Case Form */
        <>
          <div className="mb-4">
            <h4 style={{ color: '#cbd5e1', marginBottom: 12, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 6 }}>
              1. Test Specification
            </h4>
            <div className="form-grid-2">
              <FormField
                label="Feature / Component"
                name="feature"
                placeholder="e.g. Inventory Management"
                value={form.feature}
                onChange={update}
                required
              />
              <FormField
                label="Execution Result Status"
                name="result"
                choices={['Not run', 'Pass', 'Fail', 'Blocked']}
                value={form.result}
                onChange={update}
                required
              />
            </div>

            <FormField
              label="Test Objective"
              name="objective"
              placeholder="e.g. Verify that dragging an item into an occupied slot triggers an item swap."
              value={form.objective}
              onChange={update}
              required
            />

            <FormField
              label="Preconditions"
              name="preconditions"
              placeholder="e.g. Inventory has at least 2 distinct items (Sword, Potion) in hotbar slots 1 and 2."
              value={form.preconditions}
              onChange={update}
            />
          </div>

          <div className="mb-4">
            <h4 style={{ color: '#cbd5e1', marginBottom: 12, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 6 }}>
              2. Execution Procedure & Validation
            </h4>
            <FormField
              label="Ordered Execution Steps"
              name="steps"
              kind="textarea"
              placeholder={`1. Open Inventory Screen (key I).\n2. Left-click and hold item in Slot 1.\n3. Drag cursor over Slot 2 and release mouse button.`}
              value={form.steps}
              onChange={update}
              required
            />

            <FormField
              label="Expected Outcome"
              name="expected"
              kind="textarea"
              placeholder="Item from Slot 1 and item from Slot 2 cleanly swap positions with a subtle swap sound effect."
              value={form.expected}
              onChange={update}
              required
            />
          </div>
        </>
      )}

      <div className="flex items-center gap-3 mt-4">
        <button type="submit" disabled={busy} className="btn primary">
          <Send size={16} />
          {busy ? 'Saving to Portfolio…' : buttonText || 'Save to Portfolio'}
        </button>
        {onCancel && (
          <button type="button" className="btn ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
