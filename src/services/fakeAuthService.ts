// src/services/fakeAuthService.ts

import {
  LoginCredentials,
  SignInPayload,
} from '../types/auth.types';

// ── Fake credentials & response data ─────────────────────────────────────────

const VALID_EMAIL    = 'test@test.com';
const VALID_PASSWORD = '123456';

const FAKE_USER_DB: Record<string, SignInPayload> = {
  [VALID_EMAIL]: {
    user: {
      id:        'usr_001',
      name:      'Ana',
      email:     VALID_EMAIL,
      phone:     null,
      avatarUrl: null,
    },
    tokens: {
      accessToken:  'fake_access_eyJhbGciOiJIUzI1NiJ9_token',
      refreshToken: 'fake_refresh_eyJhbGciOiJIUzI1NiJ9_token',
    },
  },
};

// ── Custom error class ────────────────────────────────────────────────────────
// Gives catch blocks richer info than a plain Error string

export class AuthError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

// ── The fake API call ─────────────────────────────────────────────────────────

const FAKE_DELAY_MS = 1500;  // simulates real network latency

export const fakeAuthService = {

  loginWithEmail: (
    credentials: LoginCredentials,
  ): Promise<SignInPayload> => {

    return new Promise((resolve, reject) => {
      setTimeout(() => {

        const { email, password } = credentials;

        // Case 1: empty fields (belt-and-suspenders — hook validates too)
        if (!email || !password) {
          reject(
            new AuthError(
              'Email and password are required.',
              'MISSING_FIELDS',
              400,
            ),
          );
          return;
        }

        // Case 2: unknown email
        const record = FAKE_USER_DB[email.toLowerCase().trim()];
        if (!record) {
          reject(
            new AuthError(
              'No account found with this email.',
              'USER_NOT_FOUND',
              404,
            ),
          );
          return;
        }

        // Case 3: wrong password
        if (password !== VALID_PASSWORD) {
          reject(
            new AuthError(
              'Incorrect password. Please try again.',
              'INVALID_CREDENTIALS',
              401,
            ),
          );
          return;
        }

        // Case 4: success
        resolve(record);

      }, FAKE_DELAY_MS);
    });
  },
};