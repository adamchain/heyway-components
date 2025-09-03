/*
 * CHANGES:
 * - Created authentication types for user management
 * - Added interfaces for login, registration, and user data
 * - Defined auth context and state types
 */

export interface User {
  id: string;
  email?: string;
  phoneNumber: string;
  profile: {
    firstName: string;
    lastName?: string;
    avatar?: string;
  };
  subscription: {
    plan: 'free' | 'basic' | 'premium';
    status: 'active' | 'inactive' | 'cancelled';
    expiresAt?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface SMSVerificationData {
  phoneNumber: string;
  firstName?: string;
  isSignIn?: boolean;
}

export interface SMSVerificationResponse {
  success: boolean;
  message: string;
  verifyServiceUsed?: boolean;
  status?: string;
}

export interface SMSLoginData {
  phoneNumber: string;
  code: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  inboundEnabled: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  sendSMSVerification: (data: SMSVerificationData) => Promise<SMSVerificationResponse>;
  verifySMS: (data: SMSLoginData) => Promise<void>;
  updateProfile: (data: { firstName: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  toggleInboundEnabled: () => Promise<boolean>;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  inboundEnabled: boolean;
}