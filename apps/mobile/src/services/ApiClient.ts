import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Environment configuration
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api/v1' 
  : 'https://api.evcharging-platform.com/api/v1';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class ApiClient {
  private static instance: ApiClient;
  private axiosInstance: AxiosInstance;

  private constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Platform': Platform.OS,
        'X-App-Version': '1.0.0',
      },
    });

    this.setupInterceptors();
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private setupInterceptors(): void {
    // Request interceptor to add auth token
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const token = await this.getStoredAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling and token refresh
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized errors
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = await AsyncStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await this.refreshTokens(refreshToken);
              
              if (response.success) {
                await this.storeTokens(response.data.tokens);
                
                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${response.data.tokens.accessToken}`;
                return this.axiosInstance(originalRequest);
              }
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            await this.clearTokens();
            console.error('Token refresh failed:', refreshError);
          }
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  private async getStoredAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('accessToken');
    } catch (error) {
      console.error('Failed to get stored access token:', error);
      return null;
    }
  }

  private async refreshTokens(refreshToken: string): Promise<any> {
    const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
      refreshToken,
    });
    return response.data;
  }

  private async storeTokens(tokens: { accessToken: string; refreshToken: string }): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        ['accessToken', tokens.accessToken],
        ['refreshToken', tokens.refreshToken],
      ]);
    } catch (error) {
      console.error('Failed to store tokens:', error);
    }
  }

  private async clearTokens(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }


  private handleError(error: any): Error {
    try {
      let message = 'An unexpected error occurred';
      let code = 'UNKNOWN_ERROR';

      if (error.response) {
        // Server responded with error status
        const { status, data } = error.response;
        
        if (data?.error?.message) {
          message = data.error.message;
          code = data.error.code || `HTTP_${status}`;
        } else {
          message = this.getErrorMessageFromStatus(status);
          code = `HTTP_${status}`;
        }
      } else if (error.request) {
        // Request was made but no response received
        message = 'No internet connection. Please check your network and try again.';
        code = 'NETWORK_ERROR';
      } else {
        // Something else happened
        message = error.message || message;
      }

      const apiError = new Error(message);
      (apiError as any).code = code;
      (apiError as any).status = error.response?.status;
      (apiError as any).data = error.response?.data;

      return apiError;
    } catch (catchError) {
      console.error('Error in handleError:', catchError);
      return new Error('An unexpected error occurred');
    }
  }

  private getErrorMessageFromStatus(status: number): string {
    switch (status) {
      case 400:
        return 'Invalid request. Please check your input and try again.';
      case 401:
        return 'Authentication required. Please log in again.';
      case 403:
        return 'Access denied. You don\'t have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'Conflict detected. Please try again with different input.';
      case 422:
        return 'Validation error. Please check your input.';
      case 429:
        return 'Too many requests. Please wait before trying again.';
      case 500:
        return 'Server error. Please try again later.';
      case 503:
        return 'Service unavailable. Please try again later.';
      default:
        return `Server error (${status}). Please try again later.`;
    }
  }

  // HTTP Method implementations
  public async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.axiosInstance.get(url, config);
  }

  public async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.axiosInstance.post(url, data, config);
  }

  public async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.axiosInstance.put(url, data, config);
  }

  public async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.axiosInstance.patch(url, data, config);
  }

  public async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.axiosInstance.delete(url, config);
  }

  // Utility methods
  public setBaseURL(baseURL: string): void {
    this.axiosInstance.defaults.baseURL = baseURL;
  }

  public setTimeout(timeout: number): void {
    this.axiosInstance.defaults.timeout = timeout;
  }

  public addRequestInterceptor(
    onFulfilled?: (value: any) => any,
    onRejected?: (error: any) => any
  ): number {
    return this.axiosInstance.interceptors.request.use(onFulfilled, onRejected);
  }

  public addResponseInterceptor(
    onFulfilled?: (value: any) => any,
    onRejected?: (error: any) => any
  ): number {
    return this.axiosInstance.interceptors.response.use(onFulfilled, onRejected);
  }

  public removeRequestInterceptor(interceptorId: number): void {
    this.axiosInstance.interceptors.request.eject(interceptorId);
  }

  public removeResponseInterceptor(interceptorId: number): void {
    this.axiosInstance.interceptors.response.eject(interceptorId);
  }

  // Batch request utility
  public async batch<T = any>(requests: Array<() => Promise<AxiosResponse<ApiResponse<T>>>>): Promise<AxiosResponse<ApiResponse<T>>[]> {
    try {
      return await Promise.all(requests.map(request => request()));
    } catch (error) {
      throw error;
    }
  }

  // Upload utility for file uploads
  public async upload(
    url: string,
    file: { uri: string; type: string; name: string },
    additionalData?: Record<string, any>
  ): Promise<AxiosResponse<ApiResponse>> {
    const formData = new FormData();
    
    formData.append('file', {
      uri: file.uri,
      type: file.type,
      name: file.name,
    } as any);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    return this.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Real-time connection token for WebSocket authentication
  public async getWebSocketToken(): Promise<string> {
    try {
      const response = await this.post('/auth/websocket-token');
      return response.data.data.token;
    } catch (error) {
      throw new Error('Failed to get WebSocket token');
    }
  }

  // Health check
  public async healthCheck(): Promise<boolean> {
    try {
      const response = await this.get('/health');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  // Reset instance (for testing or token changes)
  public reset(): void {
    ApiClient.instance = new ApiClient();
  }
}

export default ApiClient.getInstance();
