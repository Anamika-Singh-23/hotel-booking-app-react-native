// src/services/authService.ts
import { httpClient }        from './httpClient';
import { ENDPOINTS }         from '../config/api';
import { saveToken, saveUser } from '../storage/tokenStorage';
import {
  LoginCredentials,
  LoginSuccessResult,
} from '../types/auth.types';

export const authService = {

  loginWithEmail: async (
    credentials: LoginCredentials,
  ): Promise<LoginSuccessResult> => {

    const response = await httpClient<LoginSuccessResult>(
      ENDPOINTS.auth.loginEmail,
      {
        method: 'POST',
        body:   credentials,
      },
    );

    // Persist tokens immediately after successful login
    await saveToken(
      response.tokens.accessToken,
      response.tokens.refreshToken,
    );

    // Persist user so we can show name/avatar without an extra API call
    await saveUser(response.user);

    return response;
  },

};