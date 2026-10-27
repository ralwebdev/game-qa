import React from 'react';

export default function FormField({
  label,
  name,
  value,
  onChange,
  required = false,
  kind = 'text',
  choices,
  placeholder,
  helperText,
  disabled = false
}) {
  const handleChange = (e) => {
    onChange(name, e.target.value);
  };

  return (
    <div className="form-group">
      {label && (
        <label className="form-label" htmlFor={name}>
          {label}
          {required && <span className="required-star">*</span>}
        </label>
      )}

      {choices ? (
        <select
          id={name}
          className="form-control"
          value={value ?? ''}
          required={required}
          disabled={disabled}
          onChange={handleChange}
        >
          {choices.map((choice) => (
            <option key={choice} value={choice}>
              {choice}
            </option>
          ))}
        </select>
      ) : kind === 'textarea' ? (
        <textarea
          id={name}
          className="form-control"
          value={value ?? ''}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          onChange={handleChange}
        />
      ) : (
        <input
          id={name}
          className="form-control"
          type={kind}
          value={value ?? ''}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          onChange={handleChange}
        />
      )}

      {helperText && <div className="text-dim text-sm mt-1">{helperText}</div>}
    </div>
  );
}
