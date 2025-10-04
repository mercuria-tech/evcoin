import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthService } from '../../services/AuthService';
import { ApiClient } from '../../services/ApiClient';

// Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  avatar?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  defaultVehicle?: string;
  pushNotifications?: boolean;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  language?: string;
  distanceUnit?: 'km' | 'miles';
  currency?: string;
}

export interface LoginCredentials {
  email: String;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  acceptTerms: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  lastLogin?: Date;
}

// Initial state
const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  lastLogin: undefined,
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await AuthService.login(credentials);
      
      // Store tokens
      await AuthService.storeTokens(response.tokens);
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      const response = await AuthService.register(userData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async ({ phone, otp }: { phone: string; otp: string }, { rejectWithValue }) => {
    try {
      const response = await AuthService.verifyOTP(phone, otp);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'OTP verification failed');
    }
  }
);

export const refreshTokens = createAsyncThunk(
  'auth/refreshTokens',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const refreshToken = state.auth.tokens?.refreshToken;
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await AuthService.refreshTokens(refreshToken);
      
      // Store new tokens
      await AuthService.storeTokens(response.tokens);
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Token refresh failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { getState }) => {
    try {
      const state = getState() as { auth: AuthState };
      
      // Call logout API if user is authenticated
      if (state.auth.tokens) {
        await AuthService.logout(state.auth.tokens.accessToken);
      }
      
      // Clear stored tokens
      await AuthService.clearTokens();
      
      return true;
    } catch (error) {
      // Force logout even if API call fails
      await AuthService.clearTokens();
      return true;
    }
  }
);

export const loadStoredTokens = createAsyncThunk(
  'auth/loadStoredTokens',
  async (_, { rejectWithValue }) => {
    try {
      const tokens = await AuthService.getStoredTokens();
      
      if (!tokens) {
        return null;
      }

      // Verify tokens by calling user profile endpoint
      const user = await AuthService.getCurrentUser(tokens.accessToken);
      
      return { user, tokens };
    } catch (error: any) {
      // Clear invalid tokens
      await AuthService.clearTokens();
      return rejectWithValue('Invalid stored tokens');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData: Partial<User>, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const token = state.auth.tokens?.accessToken;
      
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await AuthService.updateProfile(token, profileData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Profile update failed');
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const token = state.auth.tokens?.accessToken;
      
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await AuthService.changePassword(token, oldPassword, newPassword);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Password change failed');
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await AuthService.forgotPassword(email);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Password reset failed');
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAuth: (state) => {
      state.user = null;
      state.tokens = null;
      state.isAuthenticated = false;
      state.error = null;
      state.lastLogin = undefined;
    },
    updateTokens: (state, action: PayloadAction<AuthTokens>) => {
      state.tokens = action.payload;
    },
    updateUserData: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    // Login user
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.isAuthenticated = true;
        state.lastLogin = new Date();
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Register user
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.error = null;
        // Note: Registration doesn't automatically authenticate
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Verify OTP
    builder
      .addCase(verifyOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.user) {
          state.user.phoneVerified = true;
        }
        state.error = null;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Refresh tokens
    builder
      .addCase(refreshTokens.fulfilled, (state, action) => {
        state.tokens = action.payload.tokens;
      })
      .addCase(refreshTokens.rejected, (state) => {
        state.user = null;
        state.tokens = null;
        state.isAuthenticated = false;
      });

    // Logout user
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.tokens = null;
        state.isAuthenticated = false;
        state.error = null;
        state.lastLogin = undefined;
      });

    // Load stored tokens
    builder
      .addCase(loadStoredTokens.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload.user;
          state.tokens = action.payload.tokens;
          state.isAuthenticated = true;
        }
      })
      .addCase(loadStoredTokens.rejected, (state) => {
        state.user = null;
        state.tokens = null;
        state.isAuthenticated = false;
      });

    // Update profile
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = { ...state.user, ...action.payload };
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Change password
    builder
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Forgot password
    builder
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearAuth, updateTokens, updateUserData } = authSlice.actions;
export default authSlice.reducer;
