import { useEffect, useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import { ApiClient as api } from '../../services/api/client';
import { toast } from 'sonner';

import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  LayoutGrid,
  BookOpen,
  Calendar,
  MessageSquare,
  MessageCircle,
  User,
  Menu,
  ClipboardList,
  GraduationCap,
} from 'lucide-react';
import {
  DashboardOverview,
  CourseManagementPage,
  AcademicCalendarPage,
  CommunicationPage,
  EnrollmentPeriodPage,
  PrerequisitesManagementPage,
} from './components';
import { DashboardHeader, DashboardSidebar, MessagingChat } from '../../components/shared';
import { DashboardProfileTab } from '../../components/shared/DashboardProfileTab';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  DASHBOARD_STATS,
  USERS,
  COURSES,
  CALENDAR_EVENTS,
  ANALYTICS,
  NOTIFICATION_TEMPLATES,
  RECENT_ACTIVITY,
  ADMIN_DEPARTMENT,
  ENROLLMENT_PERIODS,
} from './constants';
import { StudentManagementPage } from './components/StudentManagementPage';

type TabKey =
  | 'dashboard'
  | 'students'
  | 'courses'
  | 'periods'
  | 'calendar'
  | 'communication'
  | 'chat'
  | 'profile';

const TABS: { key: TabKey; label: string; labelAr: string; icon: any; group: string }[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    labelAr: 'لوحة التحكم',
    icon: LayoutGrid,
    group: 'Overview',
  },
  {
    key: 'students',
    label: 'Student Management',
    labelAr: 'إدارة الطلاب',
    icon: GraduationCap,
    group: 'Management',
  },
  {
    key: 'courses',
    label: 'Course Management',
    labelAr: 'إدارة المقررات',
    icon: BookOpen,
    group: 'Management',
  },
  {
    key: 'periods',
    label: 'Periods & Scheduling',
    labelAr: 'الفترات والجدولة',
    icon: ClipboardList,
    group: 'Management',
  },
  {
    key: 'calendar',
    label: 'Academic Calendar',
    labelAr: 'التقويم الأكاديمي',
    icon: Calendar,
    group: 'Schedule',
  },
  {
    key: 'communication',
    label: 'Communication',
    labelAr: 'التواصل',
    icon: MessageSquare,
    group: 'Communication',
  },
  { key: 'chat', label: 'Chat', labelAr: 'الدردشة', icon: MessageCircle, group: 'Communication' },
  { key: 'profile', label: 'Profile', labelAr: 'الملف الشخصي', icon: User, group: 'Account' },
];

function AdminDashboardContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isDark, toggleTheme, primaryHex, primaryColor, setPrimaryColor } = useTheme() as any;
  const { language, setLanguage, isRTL, t } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const isMockMode = !isAuthenticated || location.state?.isMock;

  // Fetch live stats
  const { data: liveStats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminService.getStats(),
    enabled: !isMockMode,
  });

  // Fetch live users for staff assignment
  const { data: usersDataLive } = useQuery({
    queryKey: ['admin-all-users'],
    queryFn: () => adminService.getUsers(),
    enabled: !isMockMode && activeTab === 'courses',
  });

  // State for data management
  const [coursesData, setCoursesData] = useState(COURSES);
  const [usersList, setUsersList] = useState(USERS);

  const refreshCourses = async () => {
    if (isMockMode) {
      setCoursesData(COURSES);
      return;
    }

    try {
      const coursesRes = await api.get<any>('/courses');
      const apiCourses = Array.isArray(coursesRes?.data)
        ? coursesRes.data
        : Array.isArray(coursesRes?.data?.data)
          ? coursesRes.data.data
          : Array.isArray(coursesRes)
            ? coursesRes
            : [];

      console.log('[DEBUG] courses count:', apiCourses.length);

      const enrichedCourses = await Promise.all(
        apiCourses.map(async (c: any) => {
          const courseId = c.id;
          const base = {
            id: Number(courseId),
            code: c.code,
            name: c.name,
            department: c.department?.name || 'Unknown',
            semester: 'Fall 2025',
            credits: c.credits || 3,
            enrolled: 0,
            capacity: 100,
            status: (c.status || 'ACTIVE').toUpperCase(),
            instructor: '',
            instructorId: 0,
            taIds: [] as number[],
            taNames: [] as string[],
            level: (c.level || 'FRESHMAN').toUpperCase(),
            prerequisites: [],
            sectionId: null as number | null,
            skills: c.skills || [],
          };

          try {
            const sectionsRes = await api.get<any>(`/sections/course/${courseId}`);
            const sections = Array.isArray(sectionsRes?.data)
              ? sectionsRes.data
              : Array.isArray(sectionsRes)
                ? sectionsRes
                : [];

            if (sections.length === 0) {
              return base;
            }

            const section = sections[0];
            const sectionId = Number(section.id || section.sectionId);
            base.sectionId = sectionId;
            base.enrolled = section.currentEnrollment || 0;
            base.capacity = section.maxCapacity || 100;

            try {
              const instRes = await api.get<any>(`/enrollments/section/${sectionId}/instructor`);
              const instructorPayload = instRes?.data ?? instRes;
              if (instructorPayload?.instructor?.fullName) {
                base.instructor = instructorPayload.instructor.fullName;
                base.instructorId = Number(instructorPayload.instructorId) || 0;
              }
            } catch {
              // No instructor assigned.
            }

            try {
              const tasRes = await api.get<any>(`/enrollments/section/${sectionId}/tas`);
              const tas = Array.isArray(tasRes?.data)
                ? tasRes.data
                : Array.isArray(tasRes)
                  ? tasRes
                  : [];
              base.taIds = tas.map((t: any) => Number(t.userId));
              base.taNames = tas.map((t: any) => t.fullName);
            } catch {
              // No TAs assigned.
            }
          } catch (err) {
            console.warn(`[WARN] Failed to enrich course ${courseId}:`, err);
          }

          return base;
        })
      );

      setCoursesData(enrichedCourses);
      queryClient.setQueryData(['admin-courses'], { data: apiCourses });
    } catch (error: any) {
      console.error('[ERROR] refreshCourses failed:', error);
      toast.error('Failed to refresh courses: ' + (error.message || 'Unknown error'));
    }
  };

  // Sync users list
  useEffect(() => {
    if (usersDataLive?.data) {
      const apiUsers = usersDataLive.data;
      const mappedUsers = apiUsers.map((u: any) => ({
        id: Number(u.userId),
        name: u.fullName || `${u.firstName || ''} ${u.lastName || ''}`.trim(),
        role: u.roles?.[0]?.roleName?.toLowerCase() || '',
        department: '',
      }));
      setUsersList(mappedUsers);
    } else if (isMockMode) {
      setUsersList(USERS);
    }
  }, [usersDataLive, isMockMode]);

  useEffect(() => {
    refreshCourses();
  }, [isMockMode]);

  // Fetch calendar events
  const { data: calendarDataLive } = useQuery({
    queryKey: ['admin-calendar'],
    queryFn: () => adminService.getCalendarEvents(),
    enabled: !isMockMode && activeTab === 'calendar',
  });

  const [calendarEvents, setCalendarEvents] = useState(CALENDAR_EVENTS);

  // Sync calendar
  useEffect(() => {
    if (calendarDataLive) {
      const list =
        calendarDataLive.data || (Array.isArray(calendarDataLive) ? calendarDataLive : []);
      const mappedEvents = list.map((item: any) => ({
        id: item.id,
        title: `${item.name} ${item.year}`,
        date: item.startDate || item.date,
        endDate: item.endDate,
        type: 'semester',
        color: '#10b981',
      }));
      setCalendarEvents(mappedEvents.length > 0 ? mappedEvents : CALENDAR_EVENTS);
    }
  }, [calendarDataLive]);

  const [templates, setTemplates] = useState(NOTIFICATION_TEMPLATES);

  // Fetch enrollment periods
  const { data: periodsDataLive } = useQuery({
    queryKey: ['admin-periods'],
    queryFn: () => adminService.getEnrollmentPeriods(),
    enabled: !isMockMode && activeTab === 'periods',
  });

  const [enrollmentPeriodsData, setEnrollmentPeriodsData] = useState(ENROLLMENT_PERIODS);

  // Sync with live data
  useEffect(() => {
    if (periodsDataLive) {
      setEnrollmentPeriodsData(
        periodsDataLive.data ||
          (Array.isArray(periodsDataLive) ? periodsDataLive : ENROLLMENT_PERIODS)
      );
    } else if (isMockMode) {
      setEnrollmentPeriodsData(ENROLLMENT_PERIODS);
    }
  }, [periodsDataLive, isMockMode]);

  // Sync tab from URL
  useEffect(() => {
    const tabParam = (params.tab as TabKey) || 'dashboard';
    if (TABS.some((t) => t.key === tabParam)) {
      setActiveTab(tabParam);
    } else {
      setActiveTab('dashboard');
    }
  }, [params.tab]);

  // Navigate on tab change
  const handleTabChange = (key: TabKey) => {
    setActiveTab(key);
    navigate(`/admindashboard/${key}`);
  };

  // Translate tabs based on language
  const translatedTabs = TABS.map((tab) => ({
    ...tab,
    label: language === 'ar' ? tab.labelAr : tab.label,
  }));

  // Course Mutations
  const addCourseMutation = useMutation({
    mutationFn: (newCourse: any) => adminService.createCourse(newCourse),
    onSuccess: async () => {
      await refreshCourses();
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      toast.success(t('courseAdded') || 'Course created successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to create course: ' + (error.message || 'Unknown error'));
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => adminService.updateCourse(id, data),
    onSuccess: async () => {
      await refreshCourses();
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      toast.success(t('courseUpdated') || 'Course updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update course: ' + (error.message || 'Unknown error'));
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteCourse(id),
    onSuccess: async () => {
      await refreshCourses();
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      toast.success(t('courseDeleted') || 'Course deleted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to delete course: ' + (error.message || 'Unknown error'));
    },
  });

  // Course management handlers
  const handleAddCourse = (course: any) => {
    if (isMockMode) {
      const newCourse = {
        id: Math.max(0, ...coursesData.map((c: any) => c.id)) + 1,
        ...course,
        enrolled: 0,
        status: 'active',
      };
      setCoursesData([...coursesData, newCourse]);
      toast.info('Mock mode: added locally');
      return;
    }

    // Map UI data to backend DTO
    const dto = {
      departmentId: 1, // Defaulting to CSE (id: 1) for this admin
      name: course.name,
      code: course.code,
      description: course.description || `Course for ${course.semester}`,
      credits: Number(course.credits),
      level: (course.level || 'FRESHMAN').toUpperCase(),
      skills: course.skills,
    };
    addCourseMutation.mutate(dto);
  };

  const handleEditCourse = (id: number, course: any) => {
    if (isMockMode) {
      setCoursesData(coursesData.map((c: any) => (c.id === id ? { ...c, ...course } : c)));
      toast.info('Mock mode: updated locally');
      return;
    }

    const dto = {
      name: course.name,
      credits: Number(course.credits),
      description: course.description,
      status: (course.status || 'ACTIVE').toUpperCase(),
      level: (course.level || 'FRESHMAN').toUpperCase(),
      instructorId: course.instructorId,
      taIds: course.taIds,
      skills: course.skills,
    };
    updateCourseMutation.mutate({ id, data: dto });
  };

  const handleDeleteCourse = (id: number) => {
    if (isMockMode) {
      setCoursesData(coursesData.filter((c: any) => c.id !== id));
      toast.info('Mock mode: deleted locally');
      return;
    }
    deleteCourseMutation.mutate(id);
  };

  // Calendar event handlers
  const handleAddEvent = (event: any) => {
    const newEvent = {
      id: Math.max(...calendarEvents.map((e: any) => e.id)) + 1,
      ...event,
      color: getEventColor(event.type),
    };
    setCalendarEvents([...calendarEvents, newEvent]);
  };

  const handleEditEvent = (id: number, event: any) => {
    setCalendarEvents(calendarEvents.map((e: any) => (e.id === id ? { ...e, ...event } : e)));
  };

  const handleDeleteEvent = (id: number) => {
    setCalendarEvents(calendarEvents.filter((e: any) => e.id !== id));
  };

  // Enrollment period handlers
  const handleAddEnrollmentPeriod = (period: any) => {
    const newPeriod = {
      id: Math.max(0, ...enrollmentPeriodsData.map((p: any) => p.id)) + 1,
      ...period,
    };
    setEnrollmentPeriodsData([...enrollmentPeriodsData, newPeriod]);
  };

  const handleEditEnrollmentPeriod = (id: number, period: any) => {
    setEnrollmentPeriodsData(
      enrollmentPeriodsData.map((p: any) => (p.id === id ? { ...p, ...period } : p))
    );
  };

  const handleDeleteEnrollmentPeriod = (id: number) => {
    setEnrollmentPeriodsData(enrollmentPeriodsData.filter((p: any) => p.id !== id));
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'semesterStart':
        return '#10b981';
      case 'semesterEnd':
        return '#6366f1';
      case 'registration':
        return '#3b82f6';
      case 'holiday':
        return '#ef4444';
      case 'examPeriod':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  // Template handlers
  const handleCreateTemplate = (template: any) => {
    const newTemplate = {
      id: Math.max(...templates.map((t) => t.id)) + 1,
      ...template,
      lastUpdated: new Date().toISOString().slice(0, 10),
    };
    setTemplates([...templates, newTemplate]);
  };

  const handleEditTemplate = (id: number, template: any) => {
    setTemplates(templates.map((t) => (t.id === id ? { ...t, ...template } : t)));
  };

  const handleDeleteTemplate = (id: number) => {
    setTemplates(templates.filter((t) => t.id !== id));
  };

  const handleSendBroadcast = (message: any) => {
    console.log('Sending broadcast:', message);
    alert('Broadcast sent successfully!');
  };

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div
      className={`flex min-h-screen ${isRTL ? 'flex-row-reverse' : ''} ${isDark ? 'bg-background-dark' : 'bg-background-light'} text-slate-800 dark:text-slate-100 transition-colors duration-300`}
      style={{ fontFamily: "'Montserrat', sans-serif" }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Sidebar */}
      <DashboardSidebar
        tabs={translatedTabs.map((tab) => ({
          id: tab.key,
          label: tab.label,
          icon: tab.icon,
          group: tab.group,
        }))}
        activeTab={activeTab}
        onTabChange={(key) => handleTabChange(key as TabKey)}
        onLogout={handleLogout}
        isDark={isDark}
        isRTL={isRTL}
        accentColor={primaryHex || '#3b82f6'}
        isMobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
        groupOrder={['Overview', 'Management', 'Schedule', 'Communication', 'Account']}
      />

      {/* Main Content */}
      <main
        className={`flex-1 ${isRTL ? 'lg:mr-72' : 'lg:ml-72'} ${activeTab === 'chat' ? 'p-0' : 'p-4 lg:p-10'}`}
      >
        {activeTab !== 'chat' && (
          <DashboardHeader
            userName="Department Head"
            userRole="Admin"
            isDark={isDark}
            isRTL={isRTL}
            accentColor={primaryHex || '#3b82f6'}
            avatarGradient="from-[#3b82f6] to-[#06b6d4]"
            language={language}
            onToggleTheme={toggleTheme}
            onSetLanguage={setLanguage}
            searchRole="admin"
            onProfileClick={() => handleTabChange('profile')}
            onMenuClick={() => setSidebarOpen(true)}
            primaryColor={primaryColor}
            onSetPrimaryColor={setPrimaryColor}
            availableColors={[
              { id: 'blue', colorClass: 'bg-blue-500', hex: '#3b82f6' },
              { id: 'emerald', colorClass: 'bg-emerald-500', hex: '#10b981' },
              { id: 'rose', colorClass: 'bg-rose-500', hex: '#f43f5e' },
              { id: 'amber', colorClass: 'bg-amber-500', hex: '#f59e0b' },
            ]}
            translations={{
              search: t('search') || 'Search...',
              language: t('language'),
              english: t('english'),
              arabic: t('arabic'),
              darkMode: t('darkMode'),
              lightMode: t('lightMode'),
              viewProfile: t('viewProfile'),
              logout: t('logout'),
            }}
          />
        )}
        {/* Dashboard Overview */}
        {activeTab === 'dashboard' && (
          <DashboardOverview
            stats={liveStats || DASHBOARD_STATS}
            analytics={ANALYTICS}
            recentActivity={RECENT_ACTIVITY}
            onNavigate={(tab) => handleTabChange(tab as TabKey)}
          />
        )}

        {/* Student Management */}
        {activeTab === 'students' && <StudentManagementPage />}

        {/* Course Management */}
        {activeTab === 'courses' && (
          <CourseManagementPage
            courses={coursesData}
            users={usersList}
            adminDepartment={ADMIN_DEPARTMENT}
            onAddCourse={handleAddCourse}
            onEditCourse={handleEditCourse}
            onDeleteCourse={handleDeleteCourse}
            onRefreshCourses={refreshCourses}
          />
        )}

        {/* Periods & Scheduling */}
        {activeTab === 'periods' && (
          <EnrollmentPeriodPage
            enrollmentPeriods={enrollmentPeriodsData}
            courses={coursesData}
            adminDepartment={ADMIN_DEPARTMENT}
            onAddPeriod={handleAddEnrollmentPeriod}
            onEditPeriod={handleEditEnrollmentPeriod}
            onDeletePeriod={handleDeleteEnrollmentPeriod}
          />
        )}

        {/* Academic Calendar */}
        {activeTab === 'calendar' && (
          <AcademicCalendarPage
            events={calendarEvents}
            onAddEvent={handleAddEvent}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteEvent}
          />
        )}

        {/* Communication */}
        {activeTab === 'communication' && (
          <CommunicationPage
            templates={templates}
            onCreateTemplate={handleCreateTemplate}
            onEditTemplate={handleEditTemplate}
            onDeleteTemplate={handleDeleteTemplate}
            onSendBroadcast={handleSendBroadcast}
          />
        )}

        {/* Chat */}
        {activeTab === 'chat' && (
          <MessagingChat
            height="100vh"
            currentUserName={user?.fullName || 'Administrator'}
            showVideoCall={true}
            showVoiceCall={true}
            isDark={isDark}
            accentColor={primaryHex || '#4f46e5'}
            className="rounded-none border-0"
          />
        )}

        {/* Profile */}
        {activeTab === 'profile' && (
          <DashboardProfileTab
            isDark={isDark}
            accentColor={primaryHex || '#3b82f6'}
            bannerGradient="from-[#3b82f6] to-[#06b6d4]"
            profileData={{
              fullName: 'Admin Name',
              role: 'Administrator',
              department: 'Department',
              email: 'admin@eduverse.edu',
              phone: '',
              address: '',
              dateOfBirth: '',
              bio: '',
              specialization: [],
            }}
          />
        )}
      </main>
    </div>
  );
}

// Main component wrapped with providers
function AdminDashboard() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AdminDashboardContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default AdminDashboard;
