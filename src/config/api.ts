// src/config/api.ts

const DEV_BASE_URL  = 'http://10.0.2.2:3000';  // Android emulator → localhost
// const DEV_BASE_URL = 'http://localhost:3000'; // iOS simulator
// const DEV_BASE_URL = 'https://api.aastha.com'; // Production

export const API_CONFIG = {
  baseURL: DEV_BASE_URL,
  timeout: 15000,           // 15 seconds before we give up
  headers: {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
  },
};

export const ENDPOINTS = {
  auth: {
    loginEmail: '/api/auth/login/email/password',
    // future:
    // loginPhone:      '/api/auth/login/phone/otp',
    // register:        '/api/auth/register',
    // refreshToken:    '/api/auth/token/refresh',
    // logout:          '/api/auth/logout',
  },
};