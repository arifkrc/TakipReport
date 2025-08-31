// Minimal auth token manager and refresh helper
import client from './client.js';

const ACCESS_KEY = 'api_access_token';
const REFRESH_KEY = 'api_refresh_token';

export function getAccessToken() {
  try { return localStorage.getItem(ACCESS_KEY); } catch(e) { return null; }
}
export function getRefreshToken() {
  try { return localStorage.getItem(REFRESH_KEY); } catch(e) { return null; }
}
export function setTokens({ accessToken, refreshToken }){
  try { if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken); else localStorage.removeItem(ACCESS_KEY); } catch(e) {}
  try { if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken); else localStorage.removeItem(REFRESH_KEY); } catch(e) {}
}
export function clearTokens(){ try{ localStorage.removeItem(ACCESS_KEY); localStorage.removeItem(REFRESH_KEY);}catch(e){} }

// Attempt to refresh tokens using refresh token; expects server endpoint POST /api/auth/refresh
export async function refreshTokens() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('no refresh token');
  try {
    const resp = await client.post('/api/auth/refresh', { refreshToken });
    const data = resp && resp.data ? resp.data : null;
    if (!data || !data.accessToken) throw new Error('invalid refresh response');
    setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken || refreshToken });
    return data;
  } catch (err) {
    clearTokens();
    throw err;
  }
}

export default {
  getAccessToken, getRefreshToken, setTokens, clearTokens, refreshTokens
};
