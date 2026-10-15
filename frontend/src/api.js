import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8001/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach session token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('trustweigh_token');
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

export const loginAdmin = async (username, password) => {
  const res = await api.post('/auth/login', { username, password });
  return res.data;
};

export const getCurrentUser = async () => {
  const res = await api.get('/auth/me');
  return res.data;
};

// Wokwi Live Simulation Bridge API
export const fetchLiveWokwiState = async () => {
  const res = await api.get('/wokwi/live');
  return res.data;
};

export const triggerWokwiAction = async (action, weight = 5.0) => {
  const res = await api.post('/wokwi/trigger-mode', { action, weight });
  return res.data;
};

export const ingestWokwiTelemetry = async (payload) => {
  const res = await api.post('/wokwi/telemetry', payload);
  return res.data;
};

export const fetchDevices = async () => {
  const res = await api.get('/devices');
  return res.data;
};

export const fetchDeviceDetails = async (deviceId) => {
  const res = await api.get(`/devices/${deviceId}`);
  return res.data;
};

export const registerDevice = async (deviceData) => {
  const res = await api.post('/devices', deviceData);
  return res.data;
};

export const blockDevice = async (deviceId, payload = {}) => {
  const res = await api.post(`/devices/${deviceId}/block`, payload);
  return res.data;
};

export const unblockDevice = async (deviceId, payload = {}) => {
  const res = await api.post(`/devices/${deviceId}/unblock`, payload);
  return res.data;
};

export const deleteDevice = async (deviceId) => {
  const res = await api.delete(`/devices/${deviceId}`);
  return res.data;
};

export const fetchTrustOverview = async () => {
  const res = await api.get('/trust/overview');
  return res.data;
};

export const fetchTrustHistory = async (deviceId) => {
  const res = await api.get(`/trust/history/${deviceId}`);
  return res.data;
};

export const evaluateTrust = async (payload) => {
  const res = await api.post('/trust/evaluate', payload);
  return res.data;
};

export const fetchAlerts = async (params = {}) => {
  const res = await api.get('/alerts', { params });
  return res.data;
};

export const fetchActiveAlerts = async () => {
  const res = await api.get('/alerts/active');
  return res.data;
};

export const acknowledgeAlert = async (alertId, officerName = 'Admin (Legal Metrology)') => {
  const res = await api.post(`/alerts/${alertId}/acknowledge`, { officer_name: officerName });
  return res.data;
};

export const fetchAnalytics = async () => {
  const res = await api.get('/analytics/summary');
  return res.data;
};

export const fetchReportSummary = async () => {
  const res = await api.get('/reports/summary');
  return res.data;
};

export const fetchSettings = async () => {
  const res = await api.get('/settings');
  return res.data;
};

export const updateSettings = async (settingsData) => {
  const res = await api.put('/settings', settingsData);
  return res.data;
};

export default api;
