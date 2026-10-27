import React, { useState } from 'react';
import { 
  Award, 
  Printer, 
  Download, 
  ExternalLink, 
  Copy, 
  Check, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';

export default function CertificateView({ user, cert, bugs = 0, cases = 0 }) {
  const [copied, setCopied] = useState(false);

  const issuedDate = cert?.issuedAt
    ? new Date(cert.issuedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : new Date().toLocaleDateString();

  const handleCopyCode = () => {
    if (cert?.code) {
      navigator.clipboard.writeText(cert.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div>
      <div className="cert-container">
        <div className="cert-inner-border">
          {/* Emblem Crest */}
          <div className="cert-badge-crest">
            <Award size={34} />
          </div>

          <div className="cert-org">Scope GT — Testing Studio</div>
          <h2 className="cert-title">Certificate of Course Completion</h2>
          <div className="cert-subtitle">Foundational Software Quality Assurance for Video Games</div>

          <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: '20px 0 6px' }}>
            This officially certifies that
          </p>

          <div className="cert-recipient-name">
            {user?.name || 'Academy Learner'}
          </div>

          <div className="cert-statement">
            has successfully fulfilled all curriculum requirements, demonstrated practical competence in defect discovery, structured bug report authoring, test case specification, and game QA release methodologies.
          </div>

          <div className="cert-meta-row">
            <div>
              <span className="text-dim text-sm block">Date of Issuance</span>
              <strong style={{ color: '#f8fafc' }}>{issuedDate}</strong>
            </div>

            <div>
              <span className="text-dim text-sm block">Verification Record</span>
              <span className="cert-code-pill font-mono">{cert?.code || 'GQA-PENDING'}</span>
            </div>

            <div>
              <span className="text-dim text-sm block">Verified Artifacts</span>
              <strong style={{ color: '#f8fafc' }}>
                {bugs} Bug Reports &bull; {cases} Test Cases
              </strong>
            </div>
          </div>

          <div className="cert-disclaimer">
            Official completion record issued by Scope GT. Verifiable against canonical registry records. Not an accredited degree or ISTQB credential.
          </div>
        </div>
      </div>

      {/* Certificate Action Toolbar */}
      <div className="flex items-center justify-center gap-3 mt-4 flex-wrap no-print">
        <button
          type="button"
          className="btn primary"
          onClick={() => window.print()}
        >
          <Printer size={16} /> Print / Save PDF
        </button>

        {cert?.code && (
          <button
            type="button"
            className="btn"
            onClick={handleCopyCode}
          >
            {copied ? <Check size={16} style={{ color: '#10b981' }} /> : <Copy size={16} />}
            {copied ? 'Code Copied' : 'Copy Verification Code'}
          </button>
        )}

        {cert?.fileName && (
          <a
            className="btn"
            href="/api/certificates/download"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Download size={16} /> Download Official File
          </a>
        )}

        {cert?.code && (
          <a
            className="btn ghost"
            href={`/api/certificates/verify/${cert.code}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink size={16} /> Verify Online
          </a>
        )}
      </div>
    </div>
  );
}
