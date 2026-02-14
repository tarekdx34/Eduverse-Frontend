import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header
    search: 'Search...',
    searchPlaceholder: 'Search courses, labs, students...',
    notifications: 'Notifications',
    language: 'Language',
    english: 'English',
    arabic: 'العربية',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    viewProfile: 'View Profile',
    logout: 'Logout',

    // Sidebar
    taPanel: 'TA Panel',
    dashboard: 'Dashboard',
    courses: 'Courses',
    labs: 'Labs',
    grading: 'Grading',
    students: 'Students',
    communication: 'Communication',

    // Dashboard
    teachingAssistantDashboard: 'Teaching Assistant Dashboard',
    assignedCourses: 'Assigned Courses',
    activeLabs: 'Active Labs',
    pendingSubmissions: 'Pending Submissions',
    avgPerformance: 'Avg Performance',
    unreadMessages: 'Unread Messages',
    upcomingLabs: 'Upcoming Labs',
    recentActivity: 'Recent Activity',
    quickActions: 'Quick Actions',
    viewAllCourses: 'View All Courses',
    gradePendingSubmissions: 'Grade Pending Submissions',
    checkMessages: 'Check Messages',
    manageLabs: 'Manage Labs',
    viewAll: 'View All',
    coursePerformance: 'Course Performance',

    // Courses
    assignedCoursesTitle: 'Assigned Courses',
    manageAssignedCourses: 'Manage your assigned courses and labs',
    searchCourses: 'Search courses by name or code...',
    labsCount: 'Labs',
    studentsCount: 'Students',
    avgGrade: 'Avg Grade',
    attendance: 'Attendance',
    viewDetails: 'View Details',
    noCoursesFound: 'No courses found matching your search.',
    pendingSubmissionsCount: 'Pending Submissions',

    // Labs
    labManagement: 'Lab Management',
    manageLabSessions: 'Manage lab sessions, materials, and submissions',
    createNewLab: 'Create New Lab',
    searchLabs: 'Search labs...',
    all: 'All',
    upcoming: 'Upcoming',
    active: 'Active',
    completed: 'Completed',
    lab: 'Lab',
    course: 'Course',
    dateTime: 'Date & Time',
    location: 'Location',
    submissions: 'Submissions',
    status: 'Status',
    actions: 'Actions',
    viewDetailsAction: 'View Details',
    noLabsFound: 'No labs found matching your criteria.',
    graded: 'graded',
    pending: 'pending',

    // Grading
    gradingTitle: 'Grading',
    gradingSubtitle: 'Grade lab submissions with AI assistance or manually',
    pendingFilter: 'Pending',
    gradedFilter: 'Graded',
    submittedFiles: 'Submitted Files',
    feedback: 'Feedback',
    aiAssistedGrade: 'AI-Assisted Grade',
    manualGrade: 'Manual Grade',
    editGrade: 'Edit Grade',
    noSubmissionsFound: 'No submissions found matching your criteria.',

    // Students
    studentPerformance: 'Student Performance',
    monitorPerformance: 'Monitor student performance in your labs',
    excellent: 'Excellent',
    good: 'Good',
    fair: 'Fair',
    needsImprovement: 'Needs Improvement',
    overallAverage: 'Overall Average',
    overallAttendance: 'Overall Attendance',
    selectStudent: 'Select a student to view performance details',
    averageGrade: 'Average Grade',
    submissionCount: 'Submissions',
    lateSubmissions: 'Late',
    courseDetails: 'Course Details',

    // Communication
    communicationTitle: 'Communication',
    manageMessagesQA: 'Manage messages, Q&A discussions, and reminders',
    messages: 'Messages',
    qaDiscussions: 'Q&A Discussions',
    newMessage: 'New Message',
    filter: 'Filter',
    answer: 'Answer',
    yourAnswer: 'Your Answer',
    flagForInstructor: 'Flag for Instructor',
    new: 'New',
    answered: 'Answered',
    flagged: 'Flagged',

    // Lab detail
    back: 'Back',
    title: 'Title',
    instructions: 'Instructions',
    materials: 'Materials',
    markAttendance: 'Mark Attendance',
    open: 'Open',
    download: 'Download',
    save: 'Save',

    // Common
    saveAction: 'Save',
    cancel: 'Cancel',
    create: 'Create',
    send: 'Send',
    submit: 'Submit',
  },
  ar: {
    search: 'بحث...',
    searchPlaceholder: 'البحث عن المقررات والمعامل والطلاب...',
    notifications: 'الإشعارات',
    language: 'اللغة',
    english: 'English',
    arabic: 'العربية',
    darkMode: 'الوضع الداكن',
    lightMode: 'الوضع الفاتح',
    viewProfile: 'عرض الملف الشخصي',
    logout: 'تسجيل الخروج',

    taPanel: 'لوحة المعيد',
    dashboard: 'لوحة التحكم',
    courses: 'المقررات',
    labs: 'المعامل',
    grading: 'التصحيح',
    students: 'الطلاب',
    communication: 'التواصل',

    teachingAssistantDashboard: 'لوحة تحكم المعيد',
    assignedCourses: 'المقررات المعينة',
    activeLabs: 'المعامل النشطة',
    pendingSubmissions: 'التسليمات المعلقة',
    avgPerformance: 'متوسط الأداء',
    unreadMessages: 'رسائل غير مقروءة',
    upcomingLabs: 'المعامل القادمة',
    recentActivity: 'النشاط الأخير',
    quickActions: 'إجراءات سريعة',
    viewAllCourses: 'عرض كل المقررات',
    gradePendingSubmissions: 'تصحيح التسليمات المعلقة',
    checkMessages: 'التحقق من الرسائل',
    manageLabs: 'إدارة المعامل',
    viewAll: 'عرض الكل',
    coursePerformance: 'أداء المقررات',

    assignedCoursesTitle: 'المقررات المعينة',
    manageAssignedCourses: 'إدارة مقرراتك ومعاملك',
    searchCourses: 'البحث بالاسم أو الرمز...',
    labsCount: 'المعامل',
    studentsCount: 'الطلاب',
    avgGrade: 'متوسط الدرجة',
    attendance: 'الحضور',
    viewDetails: 'عرض التفاصيل',
    noCoursesFound: 'لا توجد مقررات تطابق البحث.',
    pendingSubmissionsCount: 'تسليمات معلقة',

    labManagement: 'إدارة المعامل',
    manageLabSessions: 'إدارة جلسات المعامل والمواد والتسليمات',
    createNewLab: 'إنشاء معمل جديد',
    searchLabs: 'البحث في المعامل...',
    all: 'الكل',
    upcoming: 'قادم',
    active: 'نشط',
    completed: 'مكتمل',
    lab: 'المعمل',
    course: 'المقرر',
    dateTime: 'التاريخ والوقت',
    location: 'المكان',
    submissions: 'التسليمات',
    status: 'الحالة',
    actions: 'إجراءات',
    viewDetailsAction: 'عرض التفاصيل',
    noLabsFound: 'لا توجد معامل تطابق المعايير.',
    graded: 'تم التصحيح',
    pending: 'معلق',

    gradingTitle: 'التصحيح',
    gradingSubtitle: 'تصحيح تسليمات المعامل بمساعدة الذكاء الاصطناعي أو يدوياً',
    pendingFilter: 'معلق',
    gradedFilter: 'تم التصحيح',
    submittedFiles: 'الملفات المرفوعة',
    feedback: 'التغذية الراجعة',
    aiAssistedGrade: 'تصحيح بمساعدة الذكاء الاصطناعي',
    manualGrade: 'تصحيح يدوي',
    editGrade: 'تعديل الدرجة',
    noSubmissionsFound: 'لا توجد تسليمات تطابق المعايير.',

    studentPerformance: 'أداء الطلاب',
    monitorPerformance: 'متابعة أداء الطلاب في المعامل',
    excellent: 'ممتاز',
    good: 'جيد',
    fair: 'مقبول',
    needsImprovement: 'يحتاج تحسين',
    overallAverage: 'المتوسط العام',
    overallAttendance: 'الحضور العام',
    selectStudent: 'اختر طالباً لعرض تفاصيل الأداء',
    averageGrade: 'متوسط الدرجة',
    submissionCount: 'التسليمات',
    lateSubmissions: 'متأخر',
    courseDetails: 'تفاصيل المقرر',

    communicationTitle: 'التواصل',
    manageMessagesQA: 'إدارة الرسائل والأسئلة والأجوبة والتذكيرات',
    messages: 'الرسائل',
    qaDiscussions: 'الأسئلة والأجوبة',
    newMessage: 'رسالة جديدة',
    filter: 'تصفية',
    answer: 'إجابة',
    yourAnswer: 'إجابتك',
    flagForInstructor: 'إحالة للمحاضر',
    new: 'جديد',
    answered: 'تمت الإجابة',
    flagged: 'محال',

    back: 'رجوع',
    title: 'العنوان',
    instructions: 'التعليمات',
    materials: 'المواد',
    markAttendance: 'تسجيل الحضور',
    open: 'فتح',
    download: 'تحميل',
    save: 'حفظ',

    saveAction: 'حفظ',
    cancel: 'إلغاء',
    create: 'إنشاء',
    send: 'إرسال',
    submit: 'تسليم',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('eduverse-ta-language');
      return (saved as Language) || 'en';
    }
    return 'en';
  });

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('eduverse-ta-language', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export default LanguageContext;
