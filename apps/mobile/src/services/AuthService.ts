import { ApiClient } from './ApiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  avatar?: string;
  preferences?: any;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
  message: string;
}

export interface RegisterResponse {
  user: User;
  message: string;
  verificationRequired: boolean;
}

export class AuthService {
  private static readonly ACCESS_TOKEN_KEY = 'accessToken';
  private static readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private static readonly USER_DATA_KEY = 'userData';

  /**
   * Login user with email and password
   */
  static async login(credentials: { email: string; password: string }): Promise<LoginResponse> {
    try {
      const response = await ApiClient.post('/auth/login', {
        email: credentials.email,
        password: credentials.password,
      });

      if (response.status === 200 && response.data.success) {
        const { user, accessToken, refreshToken } = response.data;
        
        return {
          user,
          tokens: {
            accessToken,
            refreshToken,
          },
          message: response.data.message || 'Login successful',
        };
      } else {
        throw new Error(response.data.error?.message || 'Login failed');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || error.message || 'Login failed');
    }
  }

  /**
   * Register new user
   */
  static async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    acceptTerms: boolean;
  }): Promise<RegisterResponse> {
    try {
      const response = await ApiClient.post('/auth/register', userData);

      if (response.status === 201 && response.data.success) {
        const { user } = response.data;
        
        return {
          user,
          message: response.data.message || 'Registration successful',
          verificationRequired: response.data.verificationRequired || false,
        };
      } else {
        throw new Error(response.data.error?.message || 'Registration failed');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || error.message || 'Registration failed');
    }
  }

  /**
   * Verify OTP for phone number
   */
  static async verifyOTP(phone: string, otp: string): Promise<{ verified: boolean; message: string }> {
    try {
      const response = await ApiClient.post('/auth/verify-otp', {
        phone,
        otp,
      });

      if (response.status === 200 && response.data.success) {
        return {
          verified: true,
          message: response.data.message || 'OTP verified successfully',
        };
      } else {
        throw new Error(response.data.error?.message || 'OTP verification failed');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || error.message || 'OTP verification failed');
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshTokens(refreshToken: string): Promise<{ tokens: AuthTokens; message: string }> {
    try {
      const response = await ApiClient.post('/auth/refresh-token', {
        refreshToken,
      });

      if (response.status === 200 && response.data.success) {
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        
        return {
          tokens: {
            accessToken,
            refreshToken: newRefreshToken || refreshToken,
          },
          message: 'Tokens refreshed successfully',
        };
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error: any) {
      throw new Error('Token refresh failed');
    }
  }

  /**
   * Logout user
   */
  static async logout(accessToken: string): Promise<{ message: string }> {
    try {
      const response = await ApiClient.post(
        '/auth/logout',
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return {
        message: response.data.message || 'Logout successful',
      };
    } catch (error: any) {
      // Even if logout fails on server, we should clear local tokens
      console.warn('Logout API call failed:', error.message);
      return { message: 'Logged out locally' };
    }
  }

  /**
   * Get current user profile
   */
  static async getCurrentUser(accessToken: string): Promise<User> {
    try {
      const response = await ApiClient.get('/users/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 200 && response.data.success) {
        return response.data.data;
      } else {
        throw new Error('Failed to get user profile');
      }
    } catch (error: any) {
      throw new Error('Failed to get user profile');
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(accessToken: string, profileData: Partial<User>): Promise<User> {
    try {
      const response = await ApiClient.put(
        '/users/me',
        profileData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 200 && response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error?.message || 'Profile update failed');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || error.message || 'Profile update failed');
    }
  }

  /**
   * Change user password
   */
  static async changePassword(
    accessToken: string,
    oldPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
    try {
      const response = await ApiClient.put(
        '/auth/change-password',
        {
          oldPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 200 && response.data.success) {
        return {
          message: response.data.message || 'Password changed successfully',
        };
      } else {
        throw new Error(response.data.error?.message || 'Password change failed');
      }

    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || error.message || 'Password change failed');
    }
  }

  /**
   * Request password reset
   */
  static async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const response = await ApiClient.post('/auth/forgot-password', {
        email,
      });

      if (response.status === 200 && response.data.success) {
        return {
          message: response.data.message || 'Password reset email sent',
        };
      } else {
        throw new Error(response.data.error?.message || 'Password reset failed');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || error.message || 'Password reset failed');
    }
  }

  /**
   * Reset password with token
   */
  static async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    try {
      const response = await ApiClient.post('/auth/reset-password', {
        token,
        newPassword,
      });

      if (response.status === 200 && response.data.success) {
        return {
          message: response.data.message || 'Password reset successfully',
        };
      } else {
        throw new Error(response.data.error?.message || 'Password reset failed');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || error.message || 'Password reset failed');
    }
  }

  /**
   * Store tokens securely
   */
  static async storeTokens(tokens: AuthTokens): Promise<void> {
    try {
      await AsyncStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.accessToken);
      await AsyncStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
    } catch (error) {
      console.error('Failed to store tokens:', error);
    }
  }

  /**
   * Get stored tokens
   */
  static async getStoredTokens(): Promise<AuthTokens | null> {
    try {
      const accessToken = await AsyncStorage.getItem(this.ACCESS_TOKEN_KEY);
      const refreshToken = await AsyncStorage.getItem(this.REFRESH_TOKEN_KEY);

      if (accessToken && refreshToken) {
        return {
          accessToken,
          refreshToken,
        };
      }

      return null;
    } catch (error) {
      console.error('Failed to get stored tokens:', error);
      return null;
    }
  }

  /**
   * Get access token
   */
  static async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  }

  /**
   * Clear stored tokens
   */
  static async clearTokens(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.ACCESS_TOKEN_KEY,
        this.REFRESH_TOKEN_KEY,
        this.USER_DATA_KEY,
      ]);
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  /**
   * Store user data
   */
  static async storeUserData(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(this.USER_DATA_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Failed to store user data:', error);
    }
  }

  /**
   * Get stored user data
   */
  static async getStoredUserData(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(this.USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to get stored user data:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      const tokens = await this.getStoredTokens();
      return tokens !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Validate token format
   */
  static isValidToken(token: string): boolean {
    if (!token || typeof token !== 'string') {
      return false;
    }

    // Basic JWT validation (has 3 parts separated by dots)
    const parts = token.split('.');
    return parts.length === 3;
  }
}
