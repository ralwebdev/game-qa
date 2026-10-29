import React from 'react';
import FormField from '../common/FormField';

export const blankDevice = () => ({ platform: 'Android', device: '', os: '', cpu: '', gpu: '', graphics: '', result: 'Not tested' });
export const legacyDevice = (device, os) => ({ ...blankDevice(), device: device || '', os: os || '' });

export default function DeviceFields({ device, onChange, prefix, showResult = false }) {
  const field = (name, label, extra = {}) => <FormField id={`${prefix}-${name}`} label={label} name={name} value={device[name]} onChange={onChange} {...extra} />;
  return <>
    <div className="form-grid-2">
      {field('platform', 'Platform', { choices: ['Android', 'PC', 'Other'], required: true })}
      {field('device', device.platform === 'PC' ? 'PC / Laptop Model' : 'Model Name and Number', { placeholder: 'e.g. Redmi Note 12 Pro 5G', required: true })}
      {field('os', device.platform === 'Android' ? 'Android Version' : 'Operating System Version', { placeholder: device.platform === 'Android' ? 'e.g. 16' : 'e.g. Windows 11', required: true })}
      {showResult && field('result', 'Result on this device', { choices: ['Not tested', 'Reproduced', 'Not reproduced'] })}
      {device.platform === 'PC' && <>
        {field('cpu', 'CPU', { placeholder: 'e.g. Intel Core i5-12450H' })}
        {field('gpu', 'GPU', { placeholder: 'e.g. NVIDIA GeForce RTX 3050' })}
        {field('graphics', 'Graphics Setting', { placeholder: 'e.g. High' })}
      </>}
    </div>
  </>;
}
