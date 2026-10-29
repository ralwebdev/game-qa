import React, { useEffect, useRef, useState } from 'react';
import { Download } from 'lucide-react';

export default function CertificateView({ user }) {
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const name = user?.name?.trim() || 'Academy Learner';

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    setError(false);
    const image = new Image();
    image.onload = () => {
      if (cancelled || !canvasRef.current) return;
      const canvas = canvasRef.current;
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0);
      let size = canvas.width * 0.035;
      context.font = `600 ${size}px Georgia, serif`;
      const maxWidth = canvas.width * 0.42;
      const measuredWidth = context.measureText(name).width;
      if (measuredWidth > maxWidth) {
        size *= maxWidth / measuredWidth;
        context.font = `600 ${size}px Georgia, serif`;
      }
      context.fillStyle = '#263238';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(name, canvas.width / 2, canvas.height * 0.62);
      setReady(true);
    };
    image.onerror = () => { if (!cancelled) setError(true); };
    image.src = `${import.meta.env.BASE_URL}certificate-background.png`;
    return () => { cancelled = true; };
  }, [name]);

  const handleDownload = () => {
    canvasRef.current?.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'certificate-of-completion.png';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
  };

  return (
    <div>
      <div className="certificate-artwork">
        <canvas ref={canvasRef} aria-label={`Certificate awarded to ${name}`} role="img" />
        {error && <p className="certificate-error">The certificate image could not be loaded. Please refresh and try again.</p>}
      </div>

      <div className="flex items-center justify-center gap-3 mt-4 flex-wrap no-print">
        <button type="button" className="btn primary" onClick={handleDownload} disabled={!ready}>
          <Download size={16} /> Download Certificate
        </button>
      </div>
    </div>
  );
}
