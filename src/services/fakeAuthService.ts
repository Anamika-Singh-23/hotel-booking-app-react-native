// src/services/fakeAuthService.ts

import {
  LoginCredentials,
  SignupCredentials,
  AuthUser,
  AuthTokens,
}                    from '../types/auth.types';

// ── Types ─────────────────────────────────────────────────────────────────────

interface AuthResult {
  user:   AuthUser;
  tokens: AuthTokens;
}

// ── Fake database ─────────────────────────────────────────────────────────────
// In-memory store — app restart pe reset hoga
// Real app mein yeh backend API karega

const REGISTERED_USERS: Map<string, {
  user:     AuthUser;
  password: string;
  tokens:   AuthTokens;
}> = new Map([
  // Default test user — pehle se registered
  ['test@test.com', {
    user: {
      id:        'usr_001',
      name:      'Ana',
      email:     'test@test.com',
      avatarUrl: null,
    },
    password: '123456',
    tokens: {
      accessToken:  'fake_access_token_xyz',
      refreshToken: 'fake_refresh_token_xyz',
    },
  }],
]);

// ── AuthError class ───────────────────────────────────────────────────────────

export class AuthError extends Error {
  constructor(
    public message:    string,
    public code:       string,
    public statusCode: number,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

// ── Fake network delay ────────────────────────────────────────────────────────

const DELAY_MS = 1500;

const withDelay = <T>(fn: () => T): Promise<T> =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(fn());
      } catch (err) {
        reject(err);
      }
    }, DELAY_MS);
  });

// ── fakeAuthService ───────────────────────────────────────────────────────────

export const fakeAuthService = {

  // ── Existing: loginWithEmail ───────────────────────────────────────────────

  loginWithEmail: (credentials: LoginCredentials): Promise<AuthResult> =>
    withDelay(() => {
      const { email, password } = credentials;

      if (!email || !password) {
        throw new AuthError(
          'Email and password required.',
          'MISSING_FIELDS',
          400,
        );
      }

      const record = REGISTERED_USERS.get(email.toLowerCase().trim());

      if (!record) {
        throw new AuthError(
          'No account found with this email.',
          'USER_NOT_FOUND',
          404,
        );
      }

      if (record.password !== password) {
        throw new AuthError(
          'Incorrect password. Please try again.',
          'INVALID_CREDENTIALS',
          401,
        );
      }

      return { user: record.user, tokens: record.tokens };
    }),

  // ── 🆕 New: registerWithEmail ──────────────────────────────────────────────

  registerWithEmail: (credentials: SignupCredentials): Promise<AuthResult> =>
    withDelay(() => {
      const { name, email, password } = credentials;
      const normalizedEmail = email.toLowerCase().trim();

      // Check: email already registered?
      if (REGISTERED_USERS.has(normalizedEmail)) {
        throw new AuthError(
          'An account with this email already exists.',
          'USER_EXISTS',
          409,
        );
      }

      // Create new fake user
      const newUser: AuthUser = {
        id:        `usr_${Date.now()}`,   // unique fake ID
        name:      name.trim(),
        email:     normalizedEmail,
        avatarUrl: null,
      };

      const newTokens: AuthTokens = {
        accessToken:  `fake_access_${Date.now()}`,
        refreshToken: `fake_refresh_${Date.now()}`,
      };

      // Save to in-memory "database"
      // Next login bhi kaam karega same session mein
      REGISTERED_USERS.set(normalizedEmail, {
        user:     newUser,
        password: password,
        tokens:   newTokens,
      });

      return { user: newUser, tokens: newTokens };
    }),
};