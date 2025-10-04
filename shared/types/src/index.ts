// User types
export * from './user';

// Station types
export * from './station';

// Charging types
export * from './charging';

// Payment types
export * from './payment';

// Reservation types
export * from './reservation';

// Notification types
export * from './notification';

// Common API types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: {
    field?: string;
    reason?: string;
  };
  requestId?: string;
  timestamp: Date;
}

export interface PaginationRequest {
  limit?: number;
  offset?: number;
  page?: number;
}

export interface PaginationResponse {
  total: number;
  limit: number;
  offset: number;
  page?: number;
  totalPages?: number;
}

export interface ServiceHealth {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: Date;
  version?: string;
  dependencies?: Record<string, 'healthy' | 'unhealthy'>;
}
