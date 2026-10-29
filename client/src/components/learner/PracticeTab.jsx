import React, { useState } from 'react';
import { Bug, FileCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import ArtifactForm from './ArtifactForm';
import { post } from '../../services/api';

export default function PracticeTab({ run, setNotice, user, setUser }) {
  const [practiceMode, setPracticeMode] = useState('bug'); // 'bug' | 'case'

  const handleSaveBug = async (data) => {
    let saved = false;
    await run(async () => {
      await post('/bugs', data);
      setUser(previous => {
        const saved = [...(previous.devices?.length ? previous.devices : previous.device && previous.os ? [{ platform: 'Android', device: previous.device, os: previous.os }] : [])];
        for (const d of data.devices) {
          const entry = { ...d, device: d.device.trim(), os: d.os.trim(), result: '' };
          const i = saved.findIndex(v => v.platform === entry.platform && v.device.toLowerCase() === entry.device.toLowerCase() && v.os.toLowerCase() === entry.os.toLowerCase());
          if (i < 0) saved.push(entry); else saved[i] = entry;
        }
        return { ...previous, device: data.devices[0].device.trim(), os: data.devices[0].os.trim(), devices: saved.slice(-20) };
      });
      setNotice('Defect report successfully logged into your QA portfolio!');
      saved = true;
    });
    return saved;
  };

  const handleSaveCase = (data) => {
    run(async () => {
      await post('/cases', data);
      setNotice('Test case successfully authored and saved into your QA portfolio!');
    });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Practice Lab</h1>
          <p className="page-subtitle">
            Draft professional defect tickets and test case specifications adhering to AAA studio standards.
          </p>
        </div>
      </div>

      <div className="practice-tab-switch">
        <button
          type="button"
          className={`practice-tab-btn ${practiceMode === 'bug' ? 'active' : ''}`}
          onClick={() => setPracticeMode('bug')}
        >
          <Bug size={19} />
          <span>Defect Report Builder</span>
        </button>
        <button
          type="button"
          className={`practice-tab-btn ${practiceMode === 'case' ? 'active' : ''}`}
          onClick={() => setPracticeMode('case')}
        >
          <FileCheck size={19} />
          <span>Test Case Builder</span>
        </button>
      </div>

      {practiceMode === 'bug' ? (
        <ArtifactForm key="bug" kind="bug" onSave={handleSaveBug} savedDevices={user.devices?.length ? user.devices : (user.device && user.os ? [{ platform: 'Android', device: user.device, os: user.os }] : [])} />
      ) : (
        <ArtifactForm key="case" kind="case" onSave={handleSaveCase} />
      )}
    </div>
  );
}
