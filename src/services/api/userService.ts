import { ApiClient } from './client';

export interface PublicUserProfile {
  userId: number;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  profilePictureUrl?: string | null;
  bio?: string | null;
  socialLinks?: Record<string, string | null> | null;
  roles?: string[];
}

export interface UserProfile {
  userId: number;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  profilePictureUrl?: string | null;
  bio?: string | null;
  socialLinks?: Record<string, string | null> | null;
  roles?: string[];
  // New fields from backend update
  academicInterests?: string[];
  skills?: string[];
  profileCompleteness?: number;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  bio?: string;
  academicInterests?: string[];
  skills?: string[];
  socialLinks?: Record<string, string | null>;
}

export class UserService {
  static async getPublicProfile(userId: number | string): Promise<PublicUserProfile> {
    return ApiClient.get<PublicUserProfile>(`/users/${String(userId)}/public`);
  }

  static async getProfile(): Promise<UserProfile> {
    return ApiClient.get<UserProfile>('/users/profile');
  }

  static async updateProfile(data: UpdateProfileDto): Promise<UserProfile> {
    return ApiClient.put<UserProfile>('/users/profile', data);
  }
}
