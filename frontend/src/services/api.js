const API_BASE = '/api';

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const config = {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  };

  const res = await fetch(url, config);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }

  return data;
}

// Offices
export const getOffices = (type) =>
  request(`/offices${type ? `?type=${type}` : ''}`);
export const getOffice = (abbreviation) =>
  request(`/offices/${abbreviation}`);
export const getOfficeVisitors = (abbreviation) =>
  request(`/offices/${abbreviation}/visitors`);

// Visitors
export const getVisitors = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/visitors${qs ? `?${qs}` : ''}`);
};
export const getVisitor = (id) => request(`/visitors/${id}`);
export const createVisitor = (data) =>
  request('/visitors', { method: 'POST', body: JSON.stringify(data) });
export const updateVisitor = (id, data) =>
  request(`/visitors/${id}`, { method: 'PUT', body: JSON.stringify(data) });

// Visits
export const getTodayVisits = (office) =>
  request(`/visits/today${office ? `?office=${office}` : ''}`);
export const checkInVisitor = (data) =>
  request('/visits', { method: 'POST', body: JSON.stringify(data) });
export const checkOutVisitor = (visitId) =>
  request(`/visits/${visitId}/checkout`, { method: 'PUT' });

// Analytics
export const getDashboard = () => request('/analytics/dashboard');
export const getWeeklyAnalytics = () => request('/analytics/weekly');
export const getOfficeTraffic = (days = 7) =>
  request(`/analytics/offices?days=${days}`);
export const getAnomalies = (limit = 20) =>
  request(`/analytics/anomalies?limit=${limit}`);
export const getSentiment = () => request('/analytics/sentiment');
export const getPredictions = () => request('/analytics/predictions');

// AI
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

// Pre-registrations
export const getPreRegistrations = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/pre-registrations${qs ? `?${qs}` : ''}`);
};
export const createPreRegistration = (data) =>
  request('/pre-registrations', { method: 'POST', body: JSON.stringify(data) });
export const updatePreRegistration = (id, data) =>
  request(`/pre-registrations/${id}`, { method: 'PUT', body: JSON.stringify(data) });

// Appointments (executive office pre-registrations)
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

// QR Token lookup
export const lookupQRToken = (token) =>
  request(`/pre-registrations/qr/${token}`);

// Upload
export const uploadPhoto = (visitorId, file) =>
  fetch(`${API_BASE}/photo/${visitorId}`, {
    method: 'POST',
    body: file,
  }).then(r => r.json());
