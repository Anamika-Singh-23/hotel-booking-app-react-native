// src/types/auth.types.ts

export interface LoginCredentials {
  email:    string;
  password: string;
}

export interface AuthUser {
  id:        string;
  name:      string;
  email:     string;
  phone:      string | null;
  avatarUrl: string | null;
}

export interface AuthTokens {
  accessToken:  string;
  refreshToken: string;
}

// ─── What signIn() receives ───────────────────────────────────────────────────
// After login API succeeds, pass both user + tokens here.
// AuthProvider stores them — callers don't touch AsyncStorage directly.

export interface SignInPayload {
  user:   AuthUser;
  tokens: AuthTokens;
}

// ─── Context shape ────────────────────────────────────────────────────────────
// This is what useAuth() returns — the public API of AuthContext.

export interface AuthContextValue {
  // ── State ──────────────────────────────────────────────
  isAuthenticated: boolean;
  user:            AuthUser | null;
  loading:         boolean;       // true while restoring session on app launch

  // ── Actions ────────────────────────────────────────────
  signIn:          (payload: SignInPayload) => Promise<void>;
  signOut:         () => Promise<void>;
  restoreSession:  () => Promise<void>; // called on app launch
}

// ─── Persisted session shape ──────────────────────────────────────────────────
// What we read back from AsyncStorage on app restart.

export interface PersistedSession {
  user:         AuthUser;
  accessToken:  string;
  refreshToken: string;
}


// What the hook exposes to the UI
export interface UseLoginReturn {
  login:      (credentials: LoginCredentials) => Promise<boolean>;
  loading:    boolean;
  error:      string | null;
  clearError: () => void;
}