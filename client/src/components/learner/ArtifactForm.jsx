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
import DeviceFields, { blankDevice, legacyDevice } from './DeviceFields';

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

export default function ArtifactForm({ kind = 'bug', initial, onSave, buttonText, onCancel, savedDevices = [] }) {
  const [form, setForm] = useState(() => {
    if (kind !== 'bug') return initial || CASE_DEFAULTS;
    const devices = initial?.devices?.length ? initial.devices : initial?.device ? [legacyDevice(initial.device, initial.os)] : savedDevices.length ? [{ ...blankDevice(), ...savedDevices[0], result: 'Not tested' }] : [blankDevice()];
    return { ...BUG_DEFAULTS, ...initial, devices };
  });
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
        setForm(kind === 'bug' ? { ...BUG_DEFAULTS, devices: form.devices.map(d => ({ ...d, result: 'Not tested' })) } : CASE_DEFAULTS);
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
            <h4>Game and Tested Devices</h4>
            <div className="form-grid-2">
              <FormField label="Game Title" name="appName" placeholder="e.g. Parking Sort" value={form.appName} onChange={update} />
              <FormField label="Build / Version" name="build" placeholder="e.g. 1.2.0" value={form.build} onChange={update} />
            </div>
            {form.devices.map((device, index) => <div key={index} className="mb-3" style={{ border: '1px solid var(--border-subtle)', padding: 12, borderRadius: 'var(--radius-sm)' }}>
              <h4>Tested device {index + 1}</h4>
              {savedDevices.length > 0 && <div className="form-group">
                <label className="form-label" htmlFor={`saved-device-${index}`}>Use a saved device</label>
                <select id={`saved-device-${index}`} className="form-control" value="" onChange={e => {
                  if (e.target.value === '') return;
                  const selected = savedDevices[Number(e.target.value)];
                  setForm(prev => ({ ...prev, devices: prev.devices.map((d, i) => i === index ? { ...blankDevice(), ...selected, result: d.result || 'Not tested' } : d) }));
                }}><option value="">Choose a saved device</option>{savedDevices.map((d, i) => <option key={i} value={i}>{d.device} ({d.platform || 'Android'}, {d.os})</option>)}</select>
              </div>}
              <DeviceFields prefix={`report-device-${index}`} device={device} showResult onChange={(name, value) => setForm(prev => ({ ...prev, devices: prev.devices.map((d, i) => i === index ? { ...d, [name]: value } : d) }))} />
              {form.devices.length > 1 && <button type="button" className="btn sm" onClick={() => setForm(prev => ({ ...prev, devices: prev.devices.filter((_, i) => i !== index) }))}>Remove device</button>}
            </div>)}
            {form.devices.length < 20 && <button type="button" className="btn" onClick={() => setForm(prev => ({ ...prev, devices: [...prev.devices, blankDevice()] }))}>Add another tested device</button>}
          </div>
          <p className="text-dim text-sm">Enter one issue per report. Reports are identified in your portfolio.</p>
          <div className="form-grid-2">
            <FormField label="Issue Category" name="category" choices={optionsWithCurrent(['UI/UX', 'Functional', 'Usability', 'Compatibility', 'Performance', 'Audio', 'Physics', 'Collision', 'Camera', 'Graphics / Visual', 'Crash / Freeze', 'Animation', 'Installation / Update', 'Save / Load', 'Other'], form.category)} value={form.category} onChange={update} required />
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
            <FormField helperText="How urgently should this be fixed?" label="Priority" name="priority" choices={optionsWithCurrent(['High', 'Medium', 'Low'], form.priority)} value={form.priority} onChange={update} required />
            <FormField helperText="How serious is the effect on the game or user?" label="Severity" name="severity" choices={optionsWithCurrent(['High', 'Medium', 'Low'], form.severity)} value={form.severity} onChange={update} required />
          </div>
          <FormField label="Impact" name="impact" kind="textarea" placeholder="Describe how the issue affects users" value={form.impact} onChange={update} />
          <FormField label="Comments" name="notes" kind="textarea" placeholder="Additional observations" value={form.notes} onChange={update} />
          <FormField label="Attachment Link (Image or Video URL)" name="media" placeholder="https://..." value={form.media} onChange={update} />
          <details className="expandable-details">
            <summary>Review report before saving</summary>
            <p><strong>Game:</strong> {form.appName || 'Not provided'} &nbsp; <strong>Build:</strong> {form.build || 'Not provided'}</p>
            <p><strong>Devices:</strong> {form.devices.map(d => `${d.device || 'Unnamed device'} (${d.platform}, ${d.os || 'OS not provided'}): ${d.result || 'Not tested'}`).join('; ')}</p>
            <p><strong>Issue:</strong> {form.title || 'Not provided'} ({form.category})</p>
            <p><strong>Description:</strong> {form.description || 'Not provided'}</p>
            <p><strong>Preconditions:</strong> {form.preconditions || 'Not provided'}</p>
            <p style={{ whiteSpace: 'pre-line' }}><strong>Steps:</strong> {form.steps || 'Not provided'}</p>
            <p><strong>Expected:</strong> {form.expected || 'Not provided'}</p>
            <p><strong>Actual:</strong> {form.actual || 'Not provided'}</p>
            <p><strong>Priority:</strong> {form.priority} &nbsp; <strong>Severity:</strong> {form.severity}</p>
            <p><strong>Impact:</strong> {form.impact || 'Not provided'}</p>
            <p><strong>Comments:</strong> {form.notes || 'Not provided'}</p>
            <p><strong>Attachment:</strong> {form.media || 'Not provided'}</p>
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
