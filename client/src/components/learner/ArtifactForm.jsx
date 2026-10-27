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
  category: 'Gameplay',
  device: '',
  severity: 'Major',
  priority: 'Medium (P2)',
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

export default function ArtifactForm({ kind = 'bug', initial, onSave, buttonText, onCancel }) {
  const [form, setForm] = useState(initial || (kind === 'bug' ? BUG_DEFAULTS : CASE_DEFAULTS));
  const [busy, setBusy] = useState(false);

  const update = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await onSave(form);
      if (!initial) {
        setForm(kind === 'bug' ? BUG_DEFAULTS : CASE_DEFAULTS);
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
          {kind === 'bug' ? 'Jira / Defect Standard' : 'Test Case Spec'}
        </span>
      </div>

      {kind === 'bug' ? (
        <>
          <div className="callout-box example" style={{ marginBottom: 20 }}>
            <div className="flex items-center gap-2 mb-1" style={{ fontWeight: 700 }}>
              <Info size={16} />
              <span>QA Standards Guide</span>
            </div>
            <span className="text-sm">
              <strong>Severity</strong> indicates system failure severity (Blocker = stops testing/progress).{' '}
              <strong>Priority</strong> determines fix urgency for production scheduling.
            </span>
          </div>

          {/* Section 1: Core Issue Details */}
          <div className="mb-4">
            <h4 style={{ color: '#cbd5e1', marginBottom: 12, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 6 }}>
              1. Issue Summary & Classification
            </h4>
            <FormField
              label="Issue Title"
              name="title"
              placeholder="[Menu] [Settings] Pressing Back button resets audio sliders to zero"
              value={form.title}
              onChange={update}
              required
              helperText="Format: [Component] [Condition] Concise description of failure"
            />

            <div className="form-grid-3">
              <FormField
                label="Category"
                name="category"
                choices={['Gameplay', 'UI/Menu', 'Audio', 'Crash/Freeze', 'Graphics/Animation', 'Progression/Save']}
                value={form.category}
                onChange={update}
                required
              />
              <FormField
                label="Severity"
                name="severity"
                choices={['Blocker/Critical', 'Major', 'Minor', 'Trivial']}
                value={form.severity}
                onChange={update}
                required
              />
              <FormField
                label="Priority"
                name="priority"
                choices={['High (P1)', 'Medium (P2)', 'Low (P3)']}
                value={form.priority}
                onChange={update}
                required
              />
            </div>
          </div>

          {/* Section 2: Environment */}
          <div className="mb-4">
            <h4 style={{ color: '#cbd5e1', marginBottom: 12, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 6 }}>
              2. Target Environment & Frequency
            </h4>
            <div className="form-grid-3">
              <FormField
                label="Device / Platform"
                name="device"
                placeholder="e.g. PC / Steam Deck / PS5 / iPad Pro"
                value={form.device}
                onChange={update}
                required
              />
              <FormField
                label="Game / App Title"
                name="appName"
                placeholder="e.g. Project Odyssey"
                value={form.appName}
                onChange={update}
              />
              <FormField
                label="Build / Version"
                name="build"
                placeholder="e.g. v1.0.42-rc3"
                value={form.build}
                onChange={update}
              />
            </div>

            <div className="form-grid-2">
              <FormField
                label="Operating System Version"
                name="os"
                placeholder="e.g. Windows 11 23H2 / iOS 17.5"
                value={form.os}
                onChange={update}
              />
              <FormField
                label="Reproduction Frequency"
                name="frequency"
                choices={['Not provided', '100% (5/5 attempts)', 'Intermittent (~60%)', 'Once only']}
                value={form.frequency}
                onChange={update}
              />
            </div>
          </div>

          {/* Section 3: Reproduction Steps */}
          <div className="mb-4">
            <h4 style={{ color: '#cbd5e1', marginBottom: 12, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 6 }}>
              3. Steps to Reproduce & Observations
            </h4>
            <FormField
              label="Preconditions"
              name="preconditions"
              placeholder="e.g. User is logged in with Level 5 profile, Audio master volume set to 50%"
              value={form.preconditions}
              onChange={update}
            />

            <FormField
              label="Numbered Steps to Reproduce"
              name="steps"
              kind="textarea"
              placeholder={`1. Launch build and load Campaign mode.\n2. Navigate to Options -> Audio.\n3. Adjust Master Volume to 80% and press Apply.\n4. Click Back button to return to Main Menu.`}
              value={form.steps}
              onChange={update}
              required
            />

            <div className="form-grid-2">
              <FormField
                label="Expected Result"
                name="expected"
                kind="textarea"
                placeholder="Audio settings should persist and volume should remain at 80%."
                value={form.expected}
                onChange={update}
                required
              />
              <FormField
                label="Actual Result"
                name="actual"
                kind="textarea"
                placeholder="Volume slider jumps to 0% and in-game audio becomes completely muted."
                value={form.actual}
                onChange={update}
                required
              />
            </div>
          </div>

          {/* Section 4: Evidence & Supplementary */}
          <div className="mb-4">
            <h4 style={{ color: '#cbd5e1', marginBottom: 12, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 6 }}>
              4. Evidence & Context
            </h4>
            <div className="form-grid-2">
              <FormField
                label="Player / User Impact"
                name="impact"
                placeholder="e.g. Disorients players, breaks immersion during prologue cutscene"
                value={form.impact}
                onChange={update}
              />
              <FormField
                label="Media Reference / URL"
                name="media"
                placeholder="e.g. https://youtu.be/... or screenshot_01.png"
                value={form.media}
                onChange={update}
              />
            </div>

            <FormField
              label="Internal Notes / Logs"
              name="notes"
              kind="textarea"
              placeholder="Console output or callstack logs observed during reproduction..."
              value={form.notes}
              onChange={update}
            />
          </div>
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
