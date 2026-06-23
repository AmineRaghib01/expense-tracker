import { Response } from 'express';
import { authService } from '../services/auth.service.js';
import { AuthenticatedRequest } from '../types/index.js';
import { asyncHandler, successResponse } from '../utils/response.js';

export class AuthController {
  register = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await authService.register(req.body.fullName, req.body.email, req.body.password);
    successResponse(res, result, 'Registration successful', 201);
  });

  login = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await authService.login(req.body.email, req.body.password);
    successResponse(res, result, 'Login successful');
  });

  refresh = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const tokens = await authService.refreshToken(req.body.refreshToken);
    successResponse(res, tokens, 'Token refreshed');
  });

  logout = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    await authService.logout(req.user!.userId);
    successResponse(res, null, 'Logged out successfully');
  });

  forgotPassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await authService.forgotPassword(req.body.email);
    successResponse(res, result, result.message);
  });

  resetPassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    await authService.resetPassword(req.body.token, req.body.password);
    successResponse(res, null, 'Password reset successful');
  });

  changePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    await authService.changePassword(
      req.user!.userId,
      req.body.currentPassword,
      req.body.newPassword,
    );
    successResponse(res, null, 'Password changed successfully');
  });

  getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const profile = await authService.getProfile(req.user!.userId);
    successResponse(res, profile);
  });

  updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const profile = await authService.updateProfile(req.user!.userId, req.body);
    successResponse(res, profile, 'Profile updated');
  });
}

export const authController = new AuthController();
