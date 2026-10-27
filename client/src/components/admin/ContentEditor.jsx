import React, { useState } from 'react';
import FormField from '../common/FormField';

export default function ContentEditor({ type, item, onCancel, onSave }) {
  const isModules = type === 'modules';

  const [form, setForm] = useState({
    ...item,
    quiz: item?.quiz || { q: '', a: '' },
    published: item?.published ?? true,
    order: item?.order ?? 1,
    tag: item?.tag || 'concept'
  });

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateQuiz = (key, value) => {
    setForm((prev) => ({
      ...prev,
      quiz: { ...prev.quiz, [key]: value }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      order: Number(form.order || 1)
    });
  };

  return (
    <form className="card mb-4" onSubmit={handleSubmit} style={{ border: '1px solid rgba(16, 185, 129, 0.4)' }}>
      <h3 style={{ marginTop: 0, marginBottom: 14 }}>
        {item._id ? 'Edit' : 'Create New'} {isModules ? 'Course Module' : 'Glossary Entry'}
      </h3>

      <FormField
        label="Title"
        name="title"
        value={form.title}
        onChange={update}
        required
      />

      {isModules ? (
        <>
          <div className="form-grid-2">
            <FormField
              label="Display Order Index"
              name="order"
              kind="number"
              value={String(form.order)}
              onChange={update}
              required
            />
            <div className="form-group flex items-center" style={{ marginTop: 28 }}>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => update('published', e.target.checked)}
                />
                <span style={{ fontWeight: 600, color: '#f8fafc' }}>Published & Visible to Learners</span>
              </label>
            </div>
          </div>

          <FormField
            label="Short Summary"
            name="summary"
            kind="textarea"
            value={form.summary}
            onChange={update}
          />
          <FormField
            label="Lesson Explanation & Theory"
            name="explanation"
            kind="textarea"
            value={form.explanation}
            onChange={update}
          />
          <FormField
            label="Worked Example / Code / Console"
            name="example"
            kind="textarea"
            value={form.example}
            onChange={update}
          />
          <FormField
            label="Learner Practice Activity"
            name="activity"
            kind="textarea"
            value={form.activity}
            onChange={update}
          />

          <div className="p-3 mb-3" style={{ background: 'rgba(0, 0, 0, 0.25)', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ marginBottom: 10, color: '#84cc16' }}>Self-Check Question & Answer</h4>
            <FormField
              label="Question Prompt"
              name="q"
              value={form.quiz?.q}
              onChange={(_, val) => updateQuiz('q', val)}
            />
            <FormField
              label="Suggested Answer"
              name="a"
              kind="textarea"
              value={form.quiz?.a}
              onChange={(_, val) => updateQuiz('a', val)}
            />
          </div>
        </>
      ) : (
        /* Theory Editor */
        <>
          <div className="form-grid-2">
            <FormField
              label="Category Tag"
              name="tag"
              choices={['concept', 'technique', 'lifecycle']}
              value={form.tag}
              onChange={update}
              required
            />
            <div className="form-group flex items-center" style={{ marginTop: 28 }}>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => update('published', e.target.checked)}
                />
                <span style={{ fontWeight: 600, color: '#f8fafc' }}>Published</span>
              </label>
            </div>
          </div>

          <FormField
            label="Summary Definition"
            name="summary"
            kind="textarea"
            value={form.summary}
            onChange={update}
          />
          <FormField
            label="Meaning & Theoretical Context"
            name="meaning"
            kind="textarea"
            value={form.meaning}
            onChange={update}
          />
          <FormField
            label="Importance in Game Development"
            name="importance"
            kind="textarea"
            value={form.importance}
            onChange={update}
          />
          <FormField
            label="Concrete Example Scenario"
            name="example"
            kind="textarea"
            value={form.example}
            onChange={update}
          />
          <FormField
            label="Suggested QA Action"
            name="action"
            kind="textarea"
            value={form.action}
            onChange={update}
          />
        </>
      )}

      <div className="flex items-center gap-3 mt-3">
        <button type="submit" className="btn primary">
          Save Content
        </button>
        <button type="button" className="btn ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
