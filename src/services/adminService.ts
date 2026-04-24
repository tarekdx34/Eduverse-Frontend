import { ApiClient } from './api/client';

export interface AdminStats {
  totalUsers: number;
  activeCampuses: number;
  currentSemester: string;
  /** Active course rows in the catalog (course.status = ACTIVE) */
  totalCourses: number;
  activeCourses: number;
  /** Sum of section.currentEnrollment for sections in the selected semester */
  enrolledSeatsThisSemester: number;
  /** Human label for which semester sections are aggregated against */
  semesterLabel: string;
  registrationStatus: 'open' | 'closed' | 'upcoming' | 'unknown';
  registrationSub: string;
  /** Accounts awaiting approval (user.status = pending) */
  pendingRequests: number;
  pendingRequestsSub: string;
  instructorCount: number;
  taCount: number;
  avgEnrollmentLabel: string;
  semesterWeekLabel: string;
  sectionFillRate: number;
  enrollmentChart: { course: string; enrolled: number; capacity: number }[];
  upcomingSchedule: {
    time: string;
    course: string;
    instructor: string;
    room: string;
  }[];
}

export interface User {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  roles: { roleId: number; roleName: string }[];
}

export type AdminDashboardInsights = {
  analytics: {
    userGrowth: { month: string; students: number; instructors: number }[];
    courseEngagement: {
      course: string;
      activeStudents: number;
      avgAttendance: number | null;
      avgGrade: number | null;
    }[];
    aiUsage: { label: string; value: number }[];
    systemMetrics: {
      cpuUsage: number;
      memoryUsage: number;
      storageUsage: number;
      networkLoad: number;
    } | null;
  };
  recentActivity: {
    type: 'course' | 'user';
    title: string;
    description: string;
    time: string;
  }[];
};

export type CreateSemesterPayload = {
  name: string;
  code: string;
  startDate: string;
  endDate: string;
  registrationStart: string;
  registrationEnd: string;
};

export const adminService = {
  // Stats for the overview
  getStats: async (): Promise<AdminStats> => {
    const today = new Date().toISOString().split('T')[0];

    const [
      users,
      campuses,
      userStats,
      allCoursesMeta,
      activeCoursesMeta,
      upcomingEventsRes,
    ] = await Promise.all([
      ApiClient.get<{ total: number }>('/admin/users?size=1'),
      ApiClient.get<any[]>('/campuses'),
      ApiClient.get<{
        totalUsers: number;
        pendingUsers: number;
        roleDistribution: { role: string; count: string }[];
      }>('/admin/users/statistics'),
      ApiClient.get<{ meta: { total: number; totalPages: number; limit: number } }>(
        '/courses?page=1&limit=100',
      ),
      ApiClient.get<{ meta: { total: number } }>('/courses?page=1&limit=1&status=ACTIVE'),
      ApiClient.get<{ data: any[] }>('/campus-events', {
        params: { fromDate: today, page: 1, limit: 4 },
      }),
    ]);

    let currentSemester: any | null = null;
    try {
      currentSemester = await ApiClient.get<any>('/semesters/current');
    } catch {
      currentSemester = null;
    }

    if (!currentSemester) {
      try {
        const activeSemesters = await ApiClient.get<any[]>('/semesters?status=active');
        if (Array.isArray(activeSemesters) && activeSemesters.length > 0) {
          currentSemester = activeSemesters[0];
        }
      } catch {
        // ignore
      }
    }

    const currentSemesterName = currentSemester?.name || 'None';
    const semesterId: number | null =
      typeof currentSemester?.id === 'number' ? currentSemester.id : null;

    const registrationStart = currentSemester?.registrationStart
      ? String(currentSemester.registrationStart).split('T')[0]
      : null;
    const registrationEnd = currentSemester?.registrationEnd
      ? String(currentSemester.registrationEnd).split('T')[0]
      : null;

    let registrationStatus: AdminStats['registrationStatus'] = 'unknown';
    let registrationSub = '—';
    if (registrationStart && registrationEnd) {
      if (today >= registrationStart && today <= registrationEnd) {
        registrationStatus = 'open';
        registrationSub = `${registrationStart} → ${registrationEnd}`;
      } else if (today < registrationStart) {
        registrationStatus = 'upcoming';
        registrationSub = `Starts ${registrationStart}`;
      } else {
        registrationStatus = 'closed';
        registrationSub = `Ended ${registrationEnd}`;
      }
    } else if (currentSemesterName !== 'None') {
      registrationSub = currentSemesterName;
    }

    const roleDistribution = userStats?.roleDistribution || [];
    const countForRole = (name: string) => {
      const row = roleDistribution.find((r) => r.role === name);
      return row ? Number(row.count) || 0 : 0;
    };

    const instructorCount = countForRole('instructor');
    const taCount = countForRole('teaching_assistant');

    const totalPages = allCoursesMeta?.meta?.totalPages || 1;
    const limit = allCoursesMeta?.meta?.limit || 100;

    const coursePages = await Promise.all(
      Array.from({ length: totalPages }, (_, i) =>
        ApiClient.get<{ data: { id: number; code?: string; name?: string }[] }>(
          `/courses?page=${i + 1}&limit=${limit}`,
        ),
      ),
    );

    const allCourses = coursePages.flatMap((p) => p.data || []);

    const chunk = <T,>(arr: T[], size: number) => {
      const out: T[][] = [];
      for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
      return out;
    };

    let totalSectionCount = 0;
    let enrolledSeatsThisSemester = 0;
    let totalCapacityThisSemester = 0;
    const perCourse: {
      id: number;
      label: string;
      enrolled: number;
      capacity: number;
    }[] = [];

    for (const batch of chunk(allCourses, 12)) {
      const results = await Promise.all(
        batch.map(async (c) => {
          try {
            const q = semesterId != null ? `?semesterId=${semesterId}` : '';
            const sectionsRes = await ApiClient.get<any>(`/sections/course/${c.id}${q}`);
            const sections = Array.isArray(sectionsRes?.data)
              ? sectionsRes.data
              : Array.isArray(sectionsRes)
                ? sectionsRes
                : [];

            let enrolled = 0;
            let capacity = 0;
            for (const s of sections) {
              enrolled += Number(s.currentEnrollment) || 0;
              capacity += Number(s.maxCapacity) || 0;
            }

            const label = (c.code ? `${c.code}` : `Course ${c.id}`) + (c.name ? ` — ${c.name}` : '');
            return { id: c.id, label, enrolled, capacity, sectionCount: sections.length };
          } catch {
            return { id: c.id, label: `Course ${c.id}`, enrolled: 0, capacity: 0, sectionCount: 0 };
          }
        }),
      );

      for (const r of results) {
        if (r.sectionCount > 0) {
          totalSectionCount += r.sectionCount;
          enrolledSeatsThisSemester += r.enrolled;
          totalCapacityThisSemester += r.capacity;
          perCourse.push({
            id: r.id,
            label: r.label,
            enrolled: r.enrolled,
            capacity: r.capacity,
          });
        }
      }
    }

    perCourse.sort((a, b) => b.enrolled - a.enrolled);
    const enrollmentChart = perCourse.slice(0, 8).map((c) => ({
      course: c.label.length > 42 ? `${c.label.slice(0, 40)}…` : c.label,
      enrolled: c.enrolled,
      capacity: c.capacity,
    }));

    const avgEnrollment =
      totalSectionCount > 0 ? Math.round((enrolledSeatsThisSemester / totalSectionCount) * 10) / 10 : 0;

    const sectionFillRate =
      totalCapacityThisSemester > 0
        ? Math.round((enrolledSeatsThisSemester / totalCapacityThisSemester) * 1000) / 10
        : 0;

    const semesterWeekLabel = (() => {
      if (!currentSemester?.startDate || !currentSemester?.endDate) return '—';
      const start = new Date(String(currentSemester.startDate).split('T')[0]);
      const end = new Date(String(currentSemester.endDate).split('T')[0]);
      const now = new Date(today);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return '—';
      const totalDays = Math.max(1, Math.floor((end.getTime() - start.getTime()) / 86400000) + 1);
      if (now < start) {
        return `${currentSemesterName} — starts ${String(currentSemester.startDate).split('T')[0]}`;
      }
      if (now > end) {
        return `${currentSemesterName} — ended ${String(currentSemester.endDate).split('T')[0]}`;
      }
      const week = Math.max(
        1,
        Math.min(
          totalDays,
          Math.floor((now.getTime() - start.getTime()) / 86400000) + 1,
        ),
      );
      return `${currentSemesterName} — Week ${week} of ${totalDays}`;
    })();

    const upcomingSchedule = (upcomingEventsRes?.data || []).map((e: any) => {
      const start = e.startDatetime ? new Date(e.startDatetime) : null;
      const time =
        start && !Number.isNaN(start.getTime())
          ? start.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
          : '—';
      return {
        time,
        course: e.title || 'Event',
        instructor: e.organizer?.fullName || e.organizer?.firstName || 'Campus',
        room: e.location || '—',
      };
    });

    return {
      totalUsers: users.total || userStats?.totalUsers || 0,
      activeCampuses: campuses.length || 0,
      currentSemester: currentSemesterName,
      totalCourses: allCoursesMeta?.meta?.total || 0,
      activeCourses: activeCoursesMeta?.meta?.total || 0,
      enrolledSeatsThisSemester,
      semesterLabel: semesterId != null ? currentSemesterName : `${currentSemesterName} (all sections)`,
      registrationStatus,
      registrationSub,
      pendingRequests: userStats?.pendingUsers || 0,
      pendingRequestsSub: 'user accounts pending approval',
      instructorCount,
      taCount,
      avgEnrollmentLabel: totalSectionCount > 0 ? `${avgEnrollment} / section` : '—',
      semesterWeekLabel,
      sectionFillRate,
      enrollmentChart,
      upcomingSchedule,
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

  /** Full student roster: paginates through `/admin/users` until all rows are loaded, then optional client-side search. */
  getAllStudents: async (search = '') => {
    const size = 200;
    let page = 1;
    let all: User[] = [];
    let totalPages = 1;
    do {
      const res = await ApiClient.get<{
        data: User[];
        totalPages: number;
      }>(`/admin/users?role=student&page=${page}&size=${size}`);
      all = all.concat(res.data || []);
      totalPages = res.totalPages ?? 1;
      page += 1;
    } while (page <= totalPages);

    if (!search.trim()) {
      return { data: all, total: all.length };
    }
    const q = search.trim().toLowerCase();
    const filtered = all.filter((u) => {
      const name = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
      const email = (u.email || '').toLowerCase();
      return name.includes(q) || email.includes(q) || String(u.userId).includes(q);
    });
    return { data: filtered, total: filtered.length };
  },

  getStudentEnrollments: async (userId: number) => {
    return ApiClient.get<any[]>(`/enrollments/student/${userId}`);
  },

  dropStudentEnrollment: async (enrollmentId: number) => {
    return ApiClient.delete(`/enrollments/${enrollmentId}`);
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

  getAdminDashboardInsights: async (): Promise<AdminDashboardInsights> => {
    return ApiClient.get<AdminDashboardInsights>('/admin/dashboard/summary');
  },

  // Semester management
  getSemesters: async () => {
    return ApiClient.get<any[]>('/semesters');
  },

  createSemester: async (payload: CreateSemesterPayload) => {
    return ApiClient.post<unknown>('/semesters', payload);
  },

  updateSemester: async (id: number, payload: Partial<CreateSemesterPayload>) => {
    return ApiClient.put<unknown>(`/semesters/${id}`, payload);
  },

  deleteSemester: async (id: number) => {
    return ApiClient.delete<unknown>(`/semesters/${id}`);
  },

  /**
   * Enrollment periods from the API (semesters + real course / student counts).
   * @param departmentId optional — limits counts to that department (dept admin).
   */
  getEnrollmentPeriods: async (departmentId?: number) => {
    const qs =
      departmentId != null && Number.isFinite(Number(departmentId))
        ? `?departmentId=${encodeURIComponent(String(departmentId))}`
        : '';
    const res = await ApiClient.get<any>(`/enrollments/periods${qs}`);
    const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
    if (!list.length) return [];

    const toYmd = (v: unknown): string => {
      if (v == null || v === '') return '';
      if (typeof v === 'string') return v.split('T')[0];
      try {
        return new Date(v as Date).toISOString().split('T')[0];
      } catch {
        return '';
      }
    };

    const now = new Date().toISOString().split('T')[0];

    return list.map((row: any) => {
      const semesterStartY = toYmd(row.semesterStart);
      const semesterEndY = toYmd(row.semesterEnd);
      const regStart = toYmd(row.registrationStart);
      const regEnd = toYmd(row.registrationEnd);
      const periodStart = regStart || semesterStartY;
      const periodEnd = regEnd || semesterEndY;
      let status: 'active' | 'closed' | 'upcoming' = 'upcoming';
      if (periodStart && periodEnd) {
        if (periodStart <= now && periodEnd >= now) status = 'active';
        else if (periodEnd < now) status = 'closed';
      }

      const semesterName = row.semesterName || row.name || 'Semester';
      const semesterId = Number(row.id);
      const coursesAvailable = Number(row.coursesAvailableCount ?? 0) || 0;
      const registeredStudents = Number(row.registeredStudentCount ?? 0) || 0;
      const totalSeatCapacity = Number(row.totalSeatCapacity ?? 0) || 0;

      return {
        id: semesterId,
        semesterId,
        /** Periods are semester-wide; UI no longer filters these out by a mismatched dept string */
        department: '',
        semester: semesterName,
        semesterCode: String(row.semesterCode ?? ''),
        startDate: regStart || semesterStartY,
        endDate: regEnd || semesterEndY,
        registrationStart: regStart,
        registrationEnd: regEnd,
        semesterStart: semesterStartY,
        semesterEnd: semesterEndY,
        /** Sum of section seat capacity (OPEN/FULL) for this semester — used as enrollment ceiling */
        totalStudents: totalSeatCapacity,
        registeredStudents,
        coursesAvailable,
        status,
        description: `${semesterName} — course registration window`,
      };
    });
  },

  // Calendar events (mapping from semesters and custom events)
  getCalendarEvents: async () => {
    // Fetch semesters for academic periods
    const semesters = await ApiClient.get<any[]>('/semesters');
    // Fetch custom calendar events (high limit to get all for the view)
    const customEventsRes = await ApiClient.get<any>('/calendar/events?limit=100');
    const customEvents = Array.isArray(customEventsRes?.data) ? customEventsRes.data : [];

    return {
      semesters: Array.isArray(semesters) ? semesters : [],
      customEvents,
    };
  },

  createCalendarEvent: async (data: any) => {
    return ApiClient.post('/calendar/events', data);
  },

  updateCalendarEvent: async (id: number, data: any) => {
    return ApiClient.put(`/calendar/events/${id}`, data);
  },

  deleteCalendarEvent: async (id: number) => {
    return ApiClient.delete(`/calendar/events/${id}`);
  },
};
