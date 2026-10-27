import React, { useState } from 'react';
import { Bug, FileCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import ArtifactForm from './ArtifactForm';
import { post } from '../../services/api';

export default function PracticeTab({ run, setNotice }) {
  const [practiceMode, setPracticeMode] = useState('bug'); // 'bug' | 'case'

  const handleSaveBug = (data) => {
    run(async () => {
      await post('/bugs', data);
      setNotice('Defect report successfully logged into your QA portfolio!');
    });
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
        <ArtifactForm kind="bug" onSave={handleSaveBug} />
      ) : (
        <ArtifactForm kind="case" onSave={handleSaveCase} />
      )}
    </div>
  );
}
