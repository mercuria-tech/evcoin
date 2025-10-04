import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'operator' | 'support';
  permissions: string[];
  avatar?: string;
  createdAt: string;
  lastLogin: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Check for stored authentication on mount
  useEffect(() => {
    checkStoredAuth();
  }, []);

  const checkStoredAuth = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (token) {
        // Validate token with backend
        const response = await fetch('/api/v1/admin/auth/validate', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setAuthState({
            user: userData.user,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          localStorage.removeItem('admin_token');
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.error('Auth validation failed:', error);
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const response = await fetch('/api/v1/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      
      // Store token
      localStorage.setItem('admin_token', data.token);
      
      setAuthState({
        user: data.user,
        isLoading: false,
        isAuthenticated: true,
      });

      toast.success(`Welcome back, ${data.user.firstName}!`);
      
    } catch (error: any) {
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
      
      toast.error(error.message || 'Login failed. Please try again.');
      throw error;
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      
      if (token) {
        // Notify backend about logout
        await fetch('/api/v1/admin/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
      
      // Clear stored token
      localStorage.removeItem('admin_token');
      
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });

      toast.success('Logged out successfully');
      
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if backend logout fails
      localStorage.removeItem('admin_token');
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  };

  const refreshToken = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) return;

      const response = await fetch('/api/v1/admin/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('admin_token', data.token);
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch('/api/v1/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Profile update failed');
      }

      const updatedUser = await response.json();
      
      setAuthState(prev => ({
        ...prev,
        user: { ...prev.user, ...updatedUser.user },
      }));

      toast.success('Profile updated successfully');
      
    } catch (error: any) {
      toast.error(error.message || 'Profile update failed');
      throw error;
    }
  };

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    refreshToken,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
