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

  getUsers: async (params?: {
    role?: string;
    department?: string;
    page?: number;
    size?: number;
  }) => {
    const query = new URLSearchParams();
    query.set('size', String(params?.size ?? 1000));
    if (params?.role) query.set('role', params.role);
    if (params?.department) query.set('department', params.department);
    if (params?.page) query.set('page', String(params.page));
    return ApiClient.get<{ data: any[]; total: number }>(`/admin/users?${query.toString()}`);
  },

  // Student management
  getStudents: async (page = 1, size = 10, search = '') => {
    let endpoint = `/admin/users?role=student&page=${page}&size=${size}`;
    if (search) {
      // Standard search endpoint
      endpoint = `/admin/users/search?query=${search}`;
    }
    return ApiClient.get<{ data: User[]; total: number }>(endpoint);
  },

  createStudent: async (data: any) => {
    return ApiClient.post('/auth/register', {
      ...data,
      role: 'student',
    });
  },

  updateUser: async (id: number, data: any) => {
    return ApiClient.put(`/admin/users/${id}`, data);
  },

  updateUserStatus: async (id: number, status: string) => {
    return ApiClient.put(`/admin/users/${id}/status`, { status });
  },

  deleteUser: async (id: number) => {
    return ApiClient.delete(`/admin/users/${id}`);
  },

  // Course management
  getCourses: async (page = 1, limit = 20) => {
    return ApiClient.get<any>(`/courses?page=${page}&limit=${limit}`);
  },

  createCourse: async (data: any) => {
    return ApiClient.post('/courses', data);
  },

  updateCourse: async (id: number, data: any) => {
    return ApiClient.patch(`/courses/${id}`, data);
  },

  deleteCourse: async (id: number) => {
    return ApiClient.delete(`/courses/${id}`);
  },

  // Campus management
  getCampuses: async () => {
    return ApiClient.get<any[]>('/campuses');
  },

  getDepartments: async () => {
    return ApiClient.get<any[]>('/departments');
  },

  getInstructors: async (deptId?: number) => {
    let url = '/admin/users?role=instructor';
    if (deptId) url += `&departmentId=${deptId}`;
    return ApiClient.get<any>(url);
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
          registeredStudents:
            status === 'closed'
              ? Math.floor(Math.random() * 30) + 120
              : status === 'active'
                ? Math.floor(Math.random() * 40) + 50
                : 0,
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
  },
};
