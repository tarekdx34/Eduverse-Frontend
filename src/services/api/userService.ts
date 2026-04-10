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

export class UserService {
  static async getPublicProfile(userId: number | string): Promise<PublicUserProfile> {
    return ApiClient.get<PublicUserProfile>(`/users/${String(userId)}/public`);
  }
}
