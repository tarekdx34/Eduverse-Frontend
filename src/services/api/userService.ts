import { client } from './client';
import { User } from './authService';

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  profilePictureUrl?: string;
  bio?: string;
  socialLinks?: Record<string, string>;
}

export interface UpdateUserPreferencesDto {
  language?: string;
  theme?: string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
}

export interface ChangePasswordDto {
  currentPassword?: string;
  newPassword?: string;
}

export const userService = {
  getProfile: () => client.get<User>('/users/profile').then((r) => r.data),
  updateProfile: (data: UpdateProfileDto) => client.put<User>('/users/profile', data).then((r) => r.data),
  
  getPreferences: () => client.get('/users/preferences').then((r) => r.data),
  updatePreferences: (data: UpdateUserPreferencesDto) => client.put('/users/preferences', data).then((r) => r.data),
  
  changePassword: (data: ChangePasswordDto) => client.patch('/users/password', data).then((r) => r.data),
};
