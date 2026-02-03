import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

// Comprehensive translations for the instructor dashboard
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header
    search: 'Search...',
    searchPlaceholder: 'Search courses, students, materials...',
    notifications: 'Notifications',
    language: 'Language',
    english: 'English',
    arabic: 'العربية',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    viewProfile: 'View Profile',
    logout: 'Logout',

    // Sidebar
    dashboard: 'Dashboard',
    courses: 'Courses',
    students: 'Students',
    attendance: 'Attendance',
    analytics: 'Analytics',
    communication: 'Communication',
    aiTools: 'AI Tools',
    settings: 'Settings',
    calendar: 'Calendar',
    grading: 'Grading',

    // Dashboard Overview
    welcomeBack: 'Welcome back',
    instructorDashboard: 'Instructor Dashboard',
    overviewDescription: 'Manage your courses, track student performance, and access AI teaching tools.',
    todaySchedule: "Today's Schedule",
    upcomingDeadlines: 'Upcoming Deadlines',
    quickStats: 'Quick Stats',
    recentActivity: 'Recent Activity',

    // Stats
    totalStudents: 'Total Students',
    activeCourses: 'Active Courses',
    avgAttendance: 'Avg Attendance',
    pendingGrading: 'Pending Grading',
    assignmentsToGrade: 'assignments to grade',

    // Courses
    myCourses: 'My Courses',
    createCourse: 'Create Course',
    courseManagement: 'Course Management',
    courseCode: 'Course Code',
    courseName: 'Course Name',
    semester: 'Semester',
    credits: 'Credits',
    enrolled: 'Enrolled',
    capacity: 'Capacity',
    schedule: 'Schedule',
    room: 'Room',
    status: 'Status',
    active: 'Active',
    archived: 'Archived',
    viewCourse: 'View Course',
    editCourse: 'Edit Course',
    archiveCourse: 'Archive Course',
    courseDetails: 'Course Details',
    courseMaterials: 'Course Materials',
    courseSettings: 'Course Settings',

    // Students
    studentRoster: 'Student Roster',
    allStudents: 'All Students',
    studentName: 'Student Name',
    studentId: 'Student ID',
    email: 'Email',
    grade: 'Grade',
    attendanceRate: 'Attendance Rate',
    performance: 'Performance',
    contactStudent: 'Contact Student',
    viewProfile: 'View Profile',
    atRisk: 'At Risk',
    onTrack: 'On Track',
    excellent: 'Excellent',

    // Attendance
    attendanceManagement: 'Attendance Management',
    takeAttendance: 'Take Attendance',
    attendanceHistory: 'Attendance History',
    present: 'Present',
    absent: 'Absent',
    late: 'Late',
    excused: 'Excused',
    markAttendance: 'Mark Attendance',
    aiAttendance: 'AI Attendance',
    uploadPhoto: 'Upload Photo',
    detectStudents: 'Detect Students',
    confirmAttendance: 'Confirm Attendance',
    attendanceRecords: 'Attendance Records',
    overallAttendance: 'Overall Attendance',
    lowAttendanceWarning: 'Low Attendance Warning',

    // Analytics
    courseAnalytics: 'Course Analytics',
    studentPerformance: 'Student Performance',
    gradeDistribution: 'Grade Distribution',
    attendanceTrends: 'Attendance Trends',
    topicsMastery: 'Topics Mastery',
    atRiskStudents: 'At-Risk Students',
    performanceTrends: 'Performance Trends',
    exportReport: 'Export Report',
    generateReport: 'Generate Report',
    weeklyReport: 'Weekly Report',
    monthlyReport: 'Monthly Report',
    semesterReport: 'Semester Report',
    averageGrade: 'Average Grade',
    completionRate: 'Completion Rate',
    engagementScore: 'Engagement Score',

    // Communication
    communicationCenter: 'Communication Center',
    announcements: 'Announcements',
    createAnnouncement: 'Create Announcement',
    scheduleAnnouncement: 'Schedule Announcement',
    sendNow: 'Send Now',
    scheduleFor: 'Schedule For',
    announcementTitle: 'Title',
    announcementContent: 'Content',
    selectCourses: 'Select Courses',
    allCourses: 'All Courses',
    directMessages: 'Direct Messages',
    courseChats: 'Course Chats',
    sendMessage: 'Send Message',
    typeMessage: 'Type a message...',
    messageStudents: 'Message Students',
    messageTA: 'Message TA',

    // AI Tools
    aiTeachingTools: 'AI Teaching Tools',
    aiPowered: 'AI-Powered',
    generateQuiz: 'Generate Quiz',
    generateQuestions: 'Generate Questions',
    autoGrading: 'Auto Grading',
    contentSummarizer: 'Content Summarizer',
    lectureAssistant: 'Lecture Assistant',
    smartRecommendations: 'Smart Recommendations',
    voiceToText: 'Voice to Text',
    imageToText: 'Image to Text',
    aiChatbot: 'AI Chatbot',
    difficulty: 'Difficulty',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    numberOfQuestions: 'Number of Questions',
    questionType: 'Question Type',
    multipleChoice: 'Multiple Choice',
    trueFalse: 'True/False',
    shortAnswer: 'Short Answer',
    essay: 'Essay',
    generateFromContent: 'Generate from Content',
    uploadContent: 'Upload Content',
    pasteContent: 'Paste Content',
    evyAssistant: 'Evy AI Assistant',

    // Grading
    gradingCenter: 'Grading Center',
    pendingSubmissions: 'Pending Submissions',
    gradedSubmissions: 'Graded Submissions',
    autoGrade: 'Auto Grade',
    manualGrade: 'Manual Grade',
    provideFeedback: 'Provide Feedback',
    submitGrade: 'Submit Grade',
    batchGrade: 'Batch Grade',
    rubric: 'Rubric',
    createRubric: 'Create Rubric',
    applyRubric: 'Apply Rubric',
    score: 'Score',
    maxScore: 'Max Score',
    feedback: 'Feedback',
    aiSuggestion: 'AI Suggestion',

    // Assignments
    assignments: 'Assignments',
    createAssignment: 'Create Assignment',
    assignmentTitle: 'Assignment Title',
    description: 'Description',
    dueDate: 'Due Date',
    points: 'Points',
    attachments: 'Attachments',
    submissions: 'Submissions',
    notSubmitted: 'Not Submitted',
    submitted: 'Submitted',
    graded: 'Graded',
    lateSubmissions: 'Late Submissions',
    allowLate: 'Allow Late Submissions',
    latePenalty: 'Late Penalty',

    // Calendar & Schedule
    academicCalendar: 'Academic Calendar',
    examSchedule: 'Exam Schedule',
    officeHours: 'Office Hours',
    setOfficeHours: 'Set Office Hours',
    classSchedule: 'Class Schedule',
    addEvent: 'Add Event',
    eventTitle: 'Event Title',
    eventDate: 'Event Date',
    eventTime: 'Event Time',
    eventLocation: 'Location',
    recurringEvent: 'Recurring Event',

    // Registration & Settings
    registrationPeriod: 'Registration Period',
    courseCapacity: 'Course Capacity',
    waitlist: 'Waitlist',
    enableWaitlist: 'Enable Waitlist',
    waitlistCapacity: 'Waitlist Capacity',
    prerequisites: 'Prerequisites',
    courseFeatures: 'Course Features',
    enableFeature: 'Enable',
    disableFeature: 'Disable',
    taCollaboration: 'TA Collaboration',
    addTA: 'Add TA',
    taPermissions: 'TA Permissions',

    // Materials
    uploadMaterials: 'Upload Materials',
    courseMaterials: 'Course Materials',
    lectures: 'Lectures',
    notes: 'Notes',
    resources: 'Resources',
    uploadFile: 'Upload File',
    dragAndDrop: 'Drag and drop files here',
    supportedFormats: 'Supported formats: PDF, DOC, PPT, MP4, Images',
    fileUploaded: 'File uploaded successfully',

    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
    submit: 'Submit',
    apply: 'Apply',
    reset: 'Reset',
    filter: 'Filter',
    sort: 'Sort',
    search: 'Search',
    noData: 'No data available',
    viewAll: 'View All',
    seeMore: 'See More',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    download: 'Download',
    upload: 'Upload',
    export: 'Export',
    import: 'Import',
    refresh: 'Refresh',
    date: 'Date',
    time: 'Time',
    actions: 'Actions',
    more: 'More',
  },
  ar: {
    // Header
    search: 'بحث...',
    searchPlaceholder: 'البحث عن المقررات والطلاب والمواد...',
    notifications: 'الإشعارات',
    language: 'اللغة',
    english: 'English',
    arabic: 'العربية',
    darkMode: 'الوضع الداكن',
    lightMode: 'الوضع الفاتح',
    viewProfile: 'عرض الملف الشخصي',
    logout: 'تسجيل الخروج',

    // Sidebar
    dashboard: 'لوحة التحكم',
    courses: 'المقررات',
    students: 'الطلاب',
    attendance: 'الحضور',
    analytics: 'التحليلات',
    communication: 'التواصل',
    aiTools: 'أدوات الذكاء الاصطناعي',
    settings: 'الإعدادات',
    calendar: 'التقويم',
    grading: 'التصحيح',

    // Dashboard Overview
    welcomeBack: 'مرحباً بعودتك',
    instructorDashboard: 'لوحة تحكم المحاضر',
    overviewDescription: 'إدارة مقرراتك، تتبع أداء الطلاب، والوصول إلى أدوات التدريس بالذكاء الاصطناعي.',
    todaySchedule: 'جدول اليوم',
    upcomingDeadlines: 'المواعيد النهائية القادمة',
    quickStats: 'إحصائيات سريعة',
    recentActivity: 'النشاط الأخير',

    // Stats
    totalStudents: 'إجمالي الطلاب',
    activeCourses: 'المقررات النشطة',
    avgAttendance: 'متوسط الحضور',
    pendingGrading: 'بانتظار التصحيح',
    assignmentsToGrade: 'واجبات للتصحيح',

    // Courses
    myCourses: 'مقرراتي',
    createCourse: 'إنشاء مقرر',
    courseManagement: 'إدارة المقررات',
    courseCode: 'رمز المقرر',
    courseName: 'اسم المقرر',
    semester: 'الفصل الدراسي',
    credits: 'الساعات المعتمدة',
    enrolled: 'المسجلين',
    capacity: 'السعة',
    schedule: 'الجدول',
    room: 'القاعة',
    status: 'الحالة',
    active: 'نشط',
    archived: 'مؤرشف',
    viewCourse: 'عرض المقرر',
    editCourse: 'تعديل المقرر',
    archiveCourse: 'أرشفة المقرر',
    courseDetails: 'تفاصيل المقرر',
    courseMaterials: 'مواد المقرر',
    courseSettings: 'إعدادات المقرر',

    // Students
    studentRoster: 'قائمة الطلاب',
    allStudents: 'جميع الطلاب',
    studentName: 'اسم الطالب',
    studentId: 'رقم الطالب',
    email: 'البريد الإلكتروني',
    grade: 'الدرجة',
    attendanceRate: 'نسبة الحضور',
    performance: 'الأداء',
    contactStudent: 'التواصل مع الطالب',
    atRisk: 'معرض للخطر',
    onTrack: 'على المسار',
    excellent: 'ممتاز',

    // Attendance
    attendanceManagement: 'إدارة الحضور',
    takeAttendance: 'تسجيل الحضور',
    attendanceHistory: 'سجل الحضور',
    present: 'حاضر',
    absent: 'غائب',
    late: 'متأخر',
    excused: 'معذور',
    markAttendance: 'تسجيل الحضور',
    aiAttendance: 'الحضور بالذكاء الاصطناعي',
    uploadPhoto: 'رفع صورة',
    detectStudents: 'اكتشاف الطلاب',
    confirmAttendance: 'تأكيد الحضور',
    attendanceRecords: 'سجلات الحضور',
    overallAttendance: 'الحضور الإجمالي',
    lowAttendanceWarning: 'تحذير انخفاض الحضور',

    // Analytics
    courseAnalytics: 'تحليلات المقرر',
    studentPerformance: 'أداء الطلاب',
    gradeDistribution: 'توزيع الدرجات',
    attendanceTrends: 'اتجاهات الحضور',
    topicsMastery: 'إتقان المواضيع',
    atRiskStudents: 'الطلاب المعرضون للخطر',
    performanceTrends: 'اتجاهات الأداء',
    exportReport: 'تصدير التقرير',
    generateReport: 'إنشاء تقرير',
    weeklyReport: 'تقرير أسبوعي',
    monthlyReport: 'تقرير شهري',
    semesterReport: 'تقرير الفصل',
    averageGrade: 'متوسط الدرجات',
    completionRate: 'نسبة الإنجاز',
    engagementScore: 'نقاط المشاركة',

    // Communication
    communicationCenter: 'مركز التواصل',
    announcements: 'الإعلانات',
    createAnnouncement: 'إنشاء إعلان',
    scheduleAnnouncement: 'جدولة إعلان',
    sendNow: 'إرسال الآن',
    scheduleFor: 'جدولة لـ',
    announcementTitle: 'العنوان',
    announcementContent: 'المحتوى',
    selectCourses: 'اختر المقررات',
    allCourses: 'جميع المقررات',
    directMessages: 'الرسائل المباشرة',
    courseChats: 'محادثات المقرر',
    sendMessage: 'إرسال رسالة',
    typeMessage: 'اكتب رسالة...',
    messageStudents: 'مراسلة الطلاب',
    messageTA: 'مراسلة المعيد',

    // AI Tools
    aiTeachingTools: 'أدوات التدريس بالذكاء الاصطناعي',
    aiPowered: 'مدعوم بالذكاء الاصطناعي',
    generateQuiz: 'إنشاء اختبار',
    generateQuestions: 'توليد الأسئلة',
    autoGrading: 'التصحيح التلقائي',
    contentSummarizer: 'ملخص المحتوى',
    lectureAssistant: 'مساعد المحاضرة',
    smartRecommendations: 'توصيات ذكية',
    voiceToText: 'تحويل الصوت إلى نص',
    imageToText: 'تحويل الصورة إلى نص',
    aiChatbot: 'روبوت المحادثة الذكي',
    difficulty: 'الصعوبة',
    easy: 'سهل',
    medium: 'متوسط',
    hard: 'صعب',
    numberOfQuestions: 'عدد الأسئلة',
    questionType: 'نوع السؤال',
    multipleChoice: 'اختيار من متعدد',
    trueFalse: 'صح/خطأ',
    shortAnswer: 'إجابة قصيرة',
    essay: 'مقالي',
    generateFromContent: 'توليد من المحتوى',
    uploadContent: 'رفع محتوى',
    pasteContent: 'لصق المحتوى',
    evyAssistant: 'مساعد إيفي الذكي',

    // Grading
    gradingCenter: 'مركز التصحيح',
    pendingSubmissions: 'التسليمات المعلقة',
    gradedSubmissions: 'التسليمات المصححة',
    autoGrade: 'تصحيح تلقائي',
    manualGrade: 'تصحيح يدوي',
    provideFeedback: 'تقديم ملاحظات',
    submitGrade: 'تسليم الدرجة',
    batchGrade: 'تصحيح جماعي',
    rubric: 'معيار التقييم',
    createRubric: 'إنشاء معيار',
    applyRubric: 'تطبيق المعيار',
    score: 'الدرجة',
    maxScore: 'الدرجة القصوى',
    feedback: 'الملاحظات',
    aiSuggestion: 'اقتراح الذكاء الاصطناعي',

    // Assignments
    assignments: 'الواجبات',
    createAssignment: 'إنشاء واجب',
    assignmentTitle: 'عنوان الواجب',
    description: 'الوصف',
    dueDate: 'تاريخ التسليم',
    points: 'النقاط',
    attachments: 'المرفقات',
    submissions: 'التسليمات',
    notSubmitted: 'لم يتم التسليم',
    submitted: 'تم التسليم',
    graded: 'تم التصحيح',
    lateSubmissions: 'التسليمات المتأخرة',
    allowLate: 'السماح بالتسليم المتأخر',
    latePenalty: 'خصم التأخير',

    // Calendar & Schedule
    academicCalendar: 'التقويم الأكاديمي',
    examSchedule: 'جدول الاختبارات',
    officeHours: 'ساعات المكتب',
    setOfficeHours: 'تحديد ساعات المكتب',
    classSchedule: 'جدول المحاضرات',
    addEvent: 'إضافة حدث',
    eventTitle: 'عنوان الحدث',
    eventDate: 'تاريخ الحدث',
    eventTime: 'وقت الحدث',
    eventLocation: 'الموقع',
    recurringEvent: 'حدث متكرر',

    // Registration & Settings
    registrationPeriod: 'فترة التسجيل',
    courseCapacity: 'سعة المقرر',
    waitlist: 'قائمة الانتظار',
    enableWaitlist: 'تفعيل قائمة الانتظار',
    waitlistCapacity: 'سعة قائمة الانتظار',
    prerequisites: 'المتطلبات السابقة',
    courseFeatures: 'ميزات المقرر',
    enableFeature: 'تفعيل',
    disableFeature: 'تعطيل',
    taCollaboration: 'التعاون مع المعيدين',
    addTA: 'إضافة معيد',
    taPermissions: 'صلاحيات المعيد',

    // Materials
    uploadMaterials: 'رفع المواد',
    lectures: 'المحاضرات',
    notes: 'الملاحظات',
    resources: 'الموارد',
    uploadFile: 'رفع ملف',
    dragAndDrop: 'اسحب وأفلت الملفات هنا',
    supportedFormats: 'الصيغ المدعومة: PDF, DOC, PPT, MP4, صور',
    fileUploaded: 'تم رفع الملف بنجاح',

    // Common
    loading: 'جاري التحميل...',
    error: 'خطأ',
    success: 'نجاح',
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    close: 'إغلاق',
    confirm: 'تأكيد',
    yes: 'نعم',
    no: 'لا',
    submit: 'إرسال',
    apply: 'تطبيق',
    reset: 'إعادة تعيين',
    filter: 'تصفية',
    sort: 'ترتيب',
    noData: 'لا توجد بيانات',
    viewAll: 'عرض الكل',
    seeMore: 'المزيد',
    back: 'رجوع',
    next: 'التالي',
    previous: 'السابق',
    download: 'تنزيل',
    upload: 'رفع',
    export: 'تصدير',
    import: 'استيراد',
    refresh: 'تحديث',
    date: 'التاريخ',
    time: 'الوقت',
    actions: 'الإجراءات',
    more: 'المزيد',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('eduverse-instructor-language');
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
    localStorage.setItem('eduverse-instructor-language', lang);
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
