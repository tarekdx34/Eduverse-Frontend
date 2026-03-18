import { client } from './client';

export interface AnnouncementAuthor {
  userId?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  profilePictureUrl?: string | null;
}

export interface AnnouncementCourse {
  id?: string;
  name?: string;
  code?: string;
}

export interface Announcement {
  id: string;
  courseId: string | null;
  createdBy: number;
  title: string;
  content: string;
  announcementType?: 'course' | 'campus' | 'system';
  priority?: 'low' | 'medium' | 'high' | 'urgent' | string;
  targetAudience?: string;
  isPublished: number;
  attachmentFileId?: string | null;
  viewCount?: number;
  isPinned?: number;
  publishedAt?: string;
  expiresAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  author?: AnnouncementAuthor;
  course?: AnnouncementCourse | null;
}

export interface AnnouncementParams {
  courseId?: string;
  page?: number;
  limit?: number;
}

interface AnnouncementListResponse {
  data?: Announcement[];
}

export interface CreateAnnouncementInput {
  title: string;
  content: string;
  courseId?: number;
  priority?: string;
  announcementType?: 'course' | 'campus' | 'system';
  isPublished?: boolean;
}

export interface UpdateAnnouncementInput {
  title?: string;
  content?: string;
  priority?: string;
}

export const announcementService = {
  // Get all announcements (backend filters by role)
  getAnnouncements: (params?: AnnouncementParams) =>
    client
      .get<Announcement[] | AnnouncementListResponse>('/announcements', { params })
      .then((r) => {
        const payload = r.data;
        if (Array.isArray(payload)) return payload;
        return Array.isArray(payload?.data) ? payload.data : [];
      }),

  // Get single announcement
  getAnnouncement: (id: string) => client.get<Announcement>(`/announcements/${id}`).then((r) => r.data),

  // Create announcement (creates as draft isPublished=0)
  createAnnouncement: (data: CreateAnnouncementInput) =>
    client.post<Announcement>('/announcements', data).then((r) => r.data),

  // Update announcement
  updateAnnouncement: (id: string, data: UpdateAnnouncementInput) =>
    client.put<Announcement>(`/announcements/${id}`, data).then((r) => r.data),

  // Delete announcement
  deleteAnnouncement: (id: string) =>
    client.delete<{ success?: boolean; message?: string }>(`/announcements/${id}`).then((r) => r.data),

  // Publish announcement
  publishAnnouncement: (id: string) =>
    client.patch<Announcement>(`/announcements/${id}/publish`).then((r) => r.data),

  // Schedule announcement
  scheduleAnnouncement: (id: string, scheduledAt: string) =>
    client.patch<Announcement>(`/announcements/${id}/schedule`, { scheduledAt }).then((r) => r.data),

  // Get announcement analytics
  getAnnouncementAnalytics: (id: string) =>
    client.get(`/announcements/${id}/analytics`).then((r) => r.data),

  // Pin/unpin announcement
  pinAnnouncement: (id: string, isPinned: boolean) =>
    client.patch<Announcement>(`/announcements/${id}/pin`, { isPinned }).then((r) => r.data),
};
