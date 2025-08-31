import axios from 'axios';
import auth from './auth.js';

// Basic axios instance - callers may override baseURL via setBaseURL
const instance = axios.create({
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export function setBaseURL(url) {
  instance.defaults.baseURL = url;
}

// Request interceptor: attach access token
instance.interceptors.request.use((cfg) => {
  const token = auth.getAccessToken();
  if (token) cfg.headers = Object.assign({}, cfg.headers, { Authorization: `Bearer ${token}` });
  return cfg;
}, (err) => Promise.reject(err));

// Response interceptor: on 401 try refresh once and retry
let isRefreshing = false;
let refreshQueue = [];
function processQueue(error, token = null) {
  refreshQueue.forEach(p => {
    if (error) p.reject(error); else p.resolve(token);
  });
  refreshQueue = [];
}

instance.interceptors.response.use((r) => r, async (error) => {
  const originalRequest = error && error.config;
  if (!originalRequest) return Promise.reject(error);
  if (error.response && error.response.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;
    if (isRefreshing) {
      // queue the request
      return new Promise((resolve, reject) => { refreshQueue.push({ resolve, reject }); })
        .then((token) => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return instance(originalRequest);
        });
    }
    isRefreshing = true;
    try {
      const data = await auth.refreshTokens();
      const newToken = data.accessToken;
      processQueue(null, newToken);
      originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
      return instance(originalRequest);
    } catch (err) {
      processQueue(err, null);
      return Promise.reject(err);
    } finally { isRefreshing = false; }
  }
  return Promise.reject(error);
});

export default instance;
