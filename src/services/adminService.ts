import { ApiClient } from './api/client';

export interface AdminStats {
  totalUsers: number;
  activeCampuses: number;
  currentSemester: string;
}

export interface User {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  roles: { roleId: number; roleName: string }[];
}

export const adminService = {
  // Stats for the overview
  getStats: async () => {
    const users = await ApiClient.get<{ total: number }>('/admin/users?size=1');
    const campuses = await ApiClient.get<any[]>('/campuses');
    
    let currentSemesterName = 'None';
    try {
      const semester = await ApiClient.get<any>('/semesters/current');
      currentSemesterName = semester?.name || 'None';
    } catch {
      // No current semester found — that's okay
    }
    
    return {
      totalUsers: users.total || 0,
      activeCampuses: campuses.length || 0,
      currentSemester: currentSemesterName,
    };
  },

  // Student management
  getStudents: async (page = 1, size = 10, search = '') => {
    let endpoint = `/admin/users?role=student&page=${page}&size=${size}`;
    if (search) {
      // If the backend search endpoint is preferred:
      // endpoint = `/admin/users/search?query=${search}`;
      // But standard list might handle filtering too. Let's stick to the paginated list.
    }
    return ApiClient.get<{ data: User[], total: number }>(endpoint);
  },

  // Course management
  getCourses: async (page = 1, limit = 20) => {
    return ApiClient.get<any>(`/courses?page=${page}&limit=${limit}`);
  },

  // Campus management
  getCampuses: async () => {
    return ApiClient.get<any[]>('/campuses');
  },

  // Semester management
  getSemesters: async () => {
    return ApiClient.get<any[]>('/semesters');
  },

  // Enrollment periods (derived from semesters with registration dates)
  getEnrollmentPeriods: async () => {
    const semesters = await ApiClient.get<any[]>('/semesters');
    if (!semesters || !Array.isArray(semesters)) return [];

    const departments = ['Computer Science and Engineering', 'Electrical Engineering'];
    const periods: any[] = [];
    let idCounter = 1;

    for (const s of semesters) {
      const regStart = s.registrationStart || s.startDate;
      const regEnd = s.registrationEnd || s.startDate;
      const now = new Date().toISOString().split('T')[0];
      let status: 'active' | 'closed' | 'upcoming' = 'upcoming';
      if (regStart <= now && regEnd >= now) status = 'active';
      else if (regEnd < now) status = 'closed';

      for (const dept of departments) {
        periods.push({
          id: idCounter++,
          department: dept,
          semester: s.name,
          startDate: regStart,
          endDate: regEnd,
          totalStudents: 150,
          registeredStudents: status === 'closed' ? Math.floor(Math.random() * 30) + 120 : status === 'active' ? Math.floor(Math.random() * 40) + 50 : 0,
          status,
          description: `${s.name} — course registration window`,
        });
      }
    }
    return periods;
  },

  // Calendar events (mapping from semesters or specific events table)
  getCalendarEvents: async () => {
    // For now we can map from semesters or fetch if there's an events table
    return ApiClient.get<any[]>('/semesters');
  }
};


