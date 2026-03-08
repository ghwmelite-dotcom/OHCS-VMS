const API_BASE = import.meta.env.PROD
  ? 'https://ohcs-vms-api.ghwmelite.workers.dev/api'
  : '/api';

function getToken() {
  try { return localStorage.getItem('ohcs-token'); } catch { return null; }
}

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = { ...options, headers };
  const res = await fetch(url, config);

  // Global 401 handler — force logout
  if (res.status === 401 && path !== '/auth/login' && path !== '/auth/setup') {
    localStorage.removeItem('ohcs-token');
    window.dispatchEvent(new CustomEvent('vms:auth-expired'));
    throw new Error('Session expired');
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }

  return data;
}

// ─── Auth ───
export const authSetup = (email, password, full_name) =>
  request('/auth/setup', { method: 'POST', body: JSON.stringify({ email, password, full_name }) });
export const authLogin = (email, password) =>
  request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
export const authLogout = () =>
  request('/auth/logout', { method: 'POST' });
export const authMe = () =>
  request('/auth/me');
export const authChangePassword = (current_password, new_password) =>
  request('/auth/change-password', {
    method: 'PUT',
    body: JSON.stringify({ current_password, new_password }),
  });
export const getUsers = () => request('/auth/users');
export const createUser = (data) =>
  request('/auth/users', { method: 'POST', body: JSON.stringify(data) });
export const updateUser = (id, data) =>
  request(`/auth/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const resetUserPassword = (id, new_password) =>
  request(`/auth/users/${id}/reset-password`, {
    method: 'PUT',
    body: JSON.stringify({ new_password }),
  });

// ─── Offices ───
export const getOffices = (type) =>
  request(`/offices${type ? `?type=${type}` : ''}`);
export const getOffice = (abbreviation) =>
  request(`/offices/${abbreviation}`);
export const getOfficeVisitors = (abbreviation) =>
  request(`/offices/${abbreviation}/visitors`);

// ─── Visitors ───
export const getVisitors = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/visitors${qs ? `?${qs}` : ''}`);
};
export const getVisitor = (id) => request(`/visitors/${id}`);
export const createVisitor = (data) =>
  request('/visitors', { method: 'POST', body: JSON.stringify(data) });
export const updateVisitor = (id, data) =>
  request(`/visitors/${id}`, { method: 'PUT', body: JSON.stringify(data) });

// ─── Visits ───
export const getTodayVisits = (office) =>
  request(`/visits/today${office ? `?office=${office}` : ''}`);
export const checkInVisitor = (data) =>
  request('/visits', { method: 'POST', body: JSON.stringify(data) });
export const checkOutVisitor = (visitId) =>
  request(`/visits/${visitId}/checkout`, { method: 'PUT' });

// ─── Analytics ───
export const getDashboard = () => request('/analytics/dashboard');
export const getWeeklyAnalytics = () => request('/analytics/weekly');
export const getOfficeTraffic = (days = 7) =>
  request(`/analytics/offices?days=${days}`);
export const getAnomalies = (limit = 20) =>
  request(`/analytics/anomalies?limit=${limit}`);
export const getSentiment = () => request('/analytics/sentiment');
export const getPredictions = () => request('/analytics/predictions');
export const getHourlyHeatmap = () => request('/analytics/hourly-heatmap');
export const getFlowData = () => request('/analytics/flow');
export const getPredictionAccuracy = (days = 14) =>
  request(`/analytics/prediction-accuracy?days=${days}`);
export const checkOutVisitorWithSurvey = (visitId, data) =>
  request(`/visits/${visitId}/checkout`, { method: 'PUT', body: JSON.stringify(data) });

// ─── AI ───
export const aiRoute = (purpose, organization, history) =>
  request('/ai/route', {
    method: 'POST',
    body: JSON.stringify({ purpose, organization, history }),
  });
export const aiChat = (message, conversationHistory) =>
  request('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ message, conversationHistory }),
  });
export const aiSentiment = (text, visit_id) =>
  request('/ai/sentiment', {
    method: 'POST',
    body: JSON.stringify({ text, visit_id }),
  });

// ─── Pre-registrations ───
export const getPreRegistrations = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/pre-registrations${qs ? `?${qs}` : ''}`);
};
export const createPreRegistration = (data) =>
  request('/pre-registrations', { method: 'POST', body: JSON.stringify(data) });
export const updatePreRegistration = (id, data) =>
  request(`/pre-registrations/${id}`, { method: 'PUT', body: JSON.stringify(data) });

// ─── Appointments ───
export const getAppointments = (status = 'pending') =>
  request(`/appointments?status=${status}`);
export const getPendingAppointmentCount = () =>
  request('/appointments/pending-count');
export const approveAppointment = (id) =>
  request(`/appointments/${id}/approve`, { method: 'PUT' });
export const declineAppointment = (id, reason) =>
  request(`/appointments/${id}/decline`, {
    method: 'PUT',
    body: JSON.stringify({ reason }),
  });

// ─── QR Token ───
export const lookupQRToken = (token) =>
  request(`/pre-registrations/qr/${token}`);

// ─── Upload ───
export const uploadPhoto = (visitorId, file) => {
  const token = getToken();
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return fetch(`${API_BASE}/photo/${visitorId}`, {
    method: 'POST',
    body: file,
    headers,
  }).then(r => r.json());
};
