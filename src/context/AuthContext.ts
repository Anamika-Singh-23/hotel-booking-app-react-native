// src/context/AuthContext.ts
import { createContext, useContext } from 'react';
import { AuthContextValue }         from '../types/auth.types';

export const AuthContext = createContext<AuthContextValue>({
  user:            null,
  isAuthenticated: false,
  isLoading:       true,
  signIn:          async () => {},
  signOut:         async () => {},
});

export const useAuth = (): AuthContextValue => useContext(AuthContext);