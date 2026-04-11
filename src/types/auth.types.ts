export type UserRole = 'admin' | 'student' | 'teacher' | 'super_admin' | 'faculty';
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  profilePicture?: string;
  phone?: string;
  isEmailVerified: boolean;
  approvalStatus?: 'approved' | 'pending' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  profilePicture?: File;
  agreeToTerms: boolean;
}

export interface ForgotPasswordData {
  email: string;
}

export interface VerifyOTPData {
  email: string;
  otp: string;
}

export interface ResetPasswordData {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ user: User; tokens: AuthTokens }>;
  register: (data: RegisterData) => Promise<{ user: User; tokens: AuthTokens | null; message?: string }>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  socialLogin: (provider: 'google' | 'facebook', token: string) => Promise<any>;
  clearError: () => void;
}

export interface SocialAuthProvider {
  name: 'google' | 'facebook';
  icon: React.ReactNode;
  color: string;
}

export interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
  suggestions: string[];
}
