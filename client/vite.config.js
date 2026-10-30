import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const siteUrl = (env.VITE_SITE_URL || '').replace(/\/+$/, '');
  if (siteUrl && !/^https?:\/\/[^\s"'<>]+$/.test(siteUrl)) {
    throw new Error('VITE_SITE_URL must be an HTTP or HTTPS URL.');
  }
  return {
    plugins: [react(), { name: 'site-url', transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', siteUrl) }],
    server: { proxy: { '/api': { target: 'http://localhost:5000', changeOrigin: true } } }
  };
});
