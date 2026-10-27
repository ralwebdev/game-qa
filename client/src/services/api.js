/**
 * Centralized API service for Game QA Academy
 */

export const api = async (path, options = {}) => {
  const url = path.startsWith('/api') ? path : `/api${path}`;
  const isFormData = options.body instanceof FormData || options.body instanceof Blob;
  
  const headers = {
    ...(!isFormData && options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    credentials: 'include',
    ...options,
    headers,
    body: options.body && !isFormData && typeof options.body === 'object' 
      ? JSON.stringify(options.body) 
      : options.body
  });

  const contentType = response.headers.get('content-type') || '';
  let data = null;
  if (contentType.includes('application/json')) {
    data = await response.json().catch(() => ({ message: 'Invalid response from server' }));
  } else if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    data = { message: errorText || `Request failed (${response.status})` };
  }

  if (!response.ok) {
    const errorMsg = data?.message || (response.status === 401 ? 'Please sign in to continue' : 'Request failed');
    throw new Error(errorMsg);
  }

  return data;
};

export const get = (path) => api(path);
export const post = (path, body) => api(path, { method: 'POST', body });
export const patch = (path, body) => api(path, { method: 'PATCH', body });
export const del = (path) => api(path, { method: 'DELETE' });

export const uploadCertificate = async (userId, file) => {
  const response = await fetch(`/api/admin/users/${userId}/certificate-file`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': file.type,
      'X-File-Name': encodeURIComponent(file.name)
    },
    body: file
  });

  const data = await response.json().catch(() => ({ message: 'Unexpected response' }));
  if (!response.ok) {
    throw new Error(data.message || 'Certificate upload failed');
  }
  return data;
};
