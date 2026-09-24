import { apiRequest } from './client';
import { AuthResponse, User, UserRole } from '../types/api';

export function login(email: string, password: string, authenticatorCode?: string) {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, ...(authenticatorCode ? { authenticatorCode } : {}) }),
  });
}

export function getMe(accessToken: string) {
  return apiRequest<User>('/me', { accessToken });
}

export function register(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  adminRegistrationCode?: string;
}) {
  return apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function forgotPassword(email: string) {
  return apiRequest<{ message: string }>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
}
export function resetPassword(token: string, password: string) {
  return apiRequest<{ message: string }>('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) });
}
export function setupMfa(accessToken: string) { return apiRequest<{ secret: string; uri: string; qrCode: string }>('/auth/mfa/setup', { accessToken }); }
export function enableMfa(accessToken: string, code: string) { return apiRequest<{ enabled: boolean }>('/auth/mfa/enable', { method: 'POST', accessToken, body: JSON.stringify({ code }) }); }
