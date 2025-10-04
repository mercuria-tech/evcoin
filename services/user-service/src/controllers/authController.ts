import { Request, Res } from 'express';
import { AuthResponse, LoginRequest, RegisterRequest, OtpVerificationRequest } from '@ev-charging/shared-types';
import { CustomError } from '../middleware/errorHandler';
import { UserService } from '../services/UserService';
import { AuthService } from '../services/AuthService';
import { NotificationService } from '../services/NotificationService';
import { logger } from '../utils/logger';

export const authController = {
  async register(req: Request, res: Response): Promise<void> => {
    try {
      const userData: RegisterRequest = req.body;
      
      // Check if user already exists
      const existingUser = await UserService.getUserByEmail(userData.email);
      if (existingUser) {
        throw new CustomError('User with this email already exists', 409);
      }

      // Check if phone number already exists (if provided)
      if (userData.phone) {
        const existingPhone = await UserService.getUserByPhone(userData.phone);
        if (existingPhone) {
          throw new CustomError('User with this phone number already exists', 409);
        }
      }

      // Create user
      const user = await UserService.createUser(userData);

      // Send OTP if phone number provided
      if (userData.phone) {
        await NotificationService.sendOtp(userData.phone);
      } else {
        // If no phone, send email verification
        await NotificationService.sendEmailVerification(user.email);
      }

      logger.info({ userId: user.id, email: user.email }, 'User registered successfully');

      res.status(201).json({
        success: true,
        data: {
          userId: user.id,
          email: user.email,
          phone: user.phone,
          verificationRequired: userData.phone ? true : user.emailVerified,
          message: userData.phone 
            ? 'OTP sent to phone number' 
            : 'Email verification sent'
        }
      });

    } catch (error) {
      logger.error('Registration failed:', error);
      throw error;
    }
  },

  async verifyOtp(req: Request, res: Response): Promise<void> => {
    try {
      const { phone, otp }: OtpVerificationRequest = req.body;
      
      const isValid = await NotificationService.verifyOtp(phone, otp);
      if (!isValid) {
        throw new CustomError('Invalid or expired OTP', 400);
      }

      // Update user phone verification status
      const user = await UserService.getUserByPhone(phone);
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      await UserService.updatePhoneVerification(user.id, true);

      logger.info({ userId: user.id, phone }, 'Phone number verified successfully');

      res.status(200).json({
        success: true,
        data: {
          verified: true,
          message: 'Phone verified successfully'
        }
      });

    } catch (error) {
      logger.error('OTP verification failed:', error);
      throw error;
    }
  },

  async login(req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, rememberMe }: LoginRequest = req.body;

      // Get user with credential validation
      const authResult = await AuthService.authenticateUser(email, password);
      if (!authResult) {
        throw new CustomError('Invalid credentials', 401);
      }

      const { user, isPasswordValid } = authResult;
      if (!isPasswordValid) {
        throw new CustomError('Invalid credentials', 401);
      }

      // Check if user account is active
      if (user.status !== 'active') {
        throw new CustomError('Account is suspended or deleted', 403);
      }

      // Generate tokens
      const tokenExpiry = rememberMe ? '7d' : '24h';
      const { accessToken, refreshToken } = await AuthService.generateTokens(
        user.id, 
        tokenExpiry
      );

      // Update last login
      await UserService.updateLastLogin(user.id);

      const response: AuthResponse = {
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
        expiresIn: rememberMe ? 7 * 24 * 60 * 60 : 24 * 60 * 60, // seconds
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        }
      };

      logger.info({ userId: user.id, email: user.email }, 'User logged in successfully');

      res.status(200).json({
        success: true,
        data: response
      });

    } catch (error) {
      logger.error('Login failed:', error);
      throw error;
    }
  },

  async logout(req: Request, res: Response): Promise<void> => {
    try {
      // TODO: Implement token blacklisting
      logger.info('User logged out');
      
      res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      logger.error('Logout failed:', error);
      throw error;
    }
  },

  async refreshToken(req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new CustomError('Refresh token is required', 400);
      }

      const { accessToken, newRefreshToken } = await AuthService.refreshTokens(refreshToken);

      res.status(200).json({
        success: true,
        data: {
          accessToken,
          refreshToken: newRefreshToken,
          tokenType: 'Bearer',
          expiresIn: 15 * 60 // 15 minutes
        }
      });

    } catch (error) {
      logger.error('Token refresh failed:', error);
      throw error;
    }
  },

  async getProfile(req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id; // TODO: Extract from JWT token
      
      const user = await UserService.getUserById(userId);
      if (!user) {
        throw new CustomError('User not found', 404);
    }

      res.status(200).json({
        success: true,
        data: user
      });

    } catch (error) {
      logger.error('Get profile failed:', error);
      throw error;
    }
  },

  async forgotPassword(req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;

      const user = await UserService.getUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not for security
        res.status(200).json({
          success: true,
          message: 'If an account with this email exists, a password reset link has been sent'
        });
        return;
      }

      await AuthService.initPasswordReset(user.id);

      res.status(200).json({
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent'
      });

    } catch (error) {
      logger.error('Forgot password failed:', error);
      throw error;
    }
  },

  async resetPassword(req: Request, res: Response): Promise<void> => {
    try {
      const { token, password } = req.body;

      await AuthService.resetPassword(token, password);

      res.status(200).json({
        success: true,
        message: 'Password reset successfully'
      });

    } catch (error) {
      logger.error('Password reset failed:', error);
      throw error;
    }
  }
};
