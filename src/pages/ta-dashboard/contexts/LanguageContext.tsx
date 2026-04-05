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
    // Sidebar & Header
    search: 'Search...',
    language: 'Language',
    english: 'English',
    arabic: 'العربية',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    viewProfile: 'View Profile',
    logout: 'Logout',
    dashboard: 'Dashboard',
    courses: 'Courses',
    labs: 'Labs',
    grading: 'Grading',
    students: 'Students',
    attendance: 'Attendance',
    schedule: 'Schedule',
    announcements: 'Announcements',
    discussion: 'Discussion',
    communication: 'Communication',
    chat: 'Chat',

    // Common
    all: 'All',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    filter: 'Filter',
    actions: 'Actions',
    status: 'Status',
    viewDetails: 'View Details',
    viewAll: 'View All',
    course: 'Course',
    pending: 'Pending',
    active: 'Active',
    submitted: 'Submitted',
    graded: 'graded',
    present: 'Present',
    absent: 'Absent',
    pin: 'Pin',
    unpin: 'Unpin',

    // ModernDashboard
    assignedCourses: 'Assigned Courses',
    activeLabs: 'Active Labs',
    pendingSubmissions: 'Pending Submissions',
    avgPerformance: 'Avg Performance',
    unreadMessages: 'Unread Messages',
    upcomingLabs: 'Upcoming Labs',
    coursePerformance: 'Course Performance',
    recentActivity: 'Recent Activity',
    quickActions: 'Quick Actions',
    viewAllCourses: 'View All Courses',
    gradePendingSubmissions: 'Grade Pending Submissions',
    checkMessages: 'Check Messages',
    manageLabs: 'Manage Labs',

    // CoursesPage
    manageYourCourses: 'Manage your assigned courses and labs',
    searchCoursesPlaceholder: 'Search courses by name or code...',
    code: 'Code',
    instructor: 'Instructor',
    avgGrade: 'Avg Grade',
    noCoursesFound: 'No courses found matching your search.',

    // LabsPage
    labManagement: 'Lab Management',
    manageLabSessions: 'Manage lab sessions, materials, and submissions',
    createNewLab: 'Create New Lab',
    searchLabsPlaceholder: 'Search labs...',
    upcoming: 'Upcoming',
    completed: 'Completed',
    lab: 'Lab',
    dateAndTime: 'Date & Time',
    location: 'Location',
    submissions: 'Submissions',
    noLabsFound: 'No labs found matching your criteria.',

    // QuizzesPage
    quizManagement: 'Quiz Management',
    gradeAndReviewQuizzes: 'Grade and review quizzes',
    createNewQuiz: 'Create New Quiz',
    aiGenerate: 'AI Generate',
    loadingQuizzes: 'Loading quizzes...',
    errorLoadingQuizzes: 'Error loading quizzes',
    noQuizzesAvailable: 'No quizzes available',
    createFirstQuiz: 'Create your first quiz to get started',
    questions: 'questions',
    min: 'min',
    attempts: 'attempts',
    viewAttempts: 'View Attempts',
    editQuiz: 'Edit Quiz',
    gradeEssays: 'Grade Essays',
    generateWithAI: 'Generate with AI',
    analyzeResults: 'Analyze Results',
    publish: 'Publish',
    quizTitle: 'Quiz Title',
    enterQuizTitle: 'Enter quiz title...',
    durationMinutes: 'Duration (minutes)',
    difficulty: 'Difficulty',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',

    // GradingPage
    gradeLabSubmissions: 'Grade lab submissions with AI assistance or manually',
    grade: 'Grade',
    submittedFiles: 'Submitted Files',
    feedback: 'Feedback',
    aiAssistedGrade: 'AI-Assisted Grade',
    manualGrade: 'Manual Grade',
    editGrade: 'Edit Grade',
    noSubmissionsFound: 'No submissions found matching your criteria.',

    // AssignmentGradingPage
    gradeAssignmentSubmissions: 'Grade assignment submissions',
    selectSubmissionToGrade: 'Select a submission to grade',
    submissionText: 'Submission Text',
    file: 'File',
    enterValidScore: 'Enter a valid score',
    provideFeedback: 'Provide constructive feedback...',
    previousFeedback: 'Previous Feedback',
    submitGrade: 'Submit Grade',
    submitting: 'Submitting...',
    lateSubmission: 'Late submission',
    assignmentNotFound: 'Assignment not found',
    errorGradingSubmission: 'Failed to grade submission',
    successGraded: 'Submission graded successfully',
    cannotAccessAsTA: 'Cannot access as TA - role restricted',
    errorLoadingAssignments: 'Failed to load assignments',

    // StudentPerformancePage
    studentPerformance: 'Student Performance',
    monitorPerformance: 'Monitor student performance in your labs',
    excellent: 'Excellent',
    good: 'Good',
    fair: 'Fair',
    needsImprovement: 'Needs Improvement',
    avg: 'Avg',
    overallAverage: 'Overall Average',
    overallAttendance: 'Overall Attendance',
    performanceByCourse: 'Performance by Course',
    courseDetails: 'Course Details',
    averageGrade: 'Average Grade',
    late: 'Late',
    selectStudentMessage: 'Select a student to view performance details',

    // AttendancePage
    aiPoweredAttendance: 'AI-Powered Attendance',
    uploadPhotoDescription:
      'Upload a photo of your lab/class and AI will detect and mark attendance automatically',
    uploadPhoto: 'Upload Photo',
    results: 'Results',
    history: 'History',
    selectLabSession: 'Select Lab Session',
    uploadClassPhoto: 'Upload Class Photo',
    uploadPhotoForAI: 'Upload a clear photo of your lab session for AI detection',
    dragAndDrop: 'Drag and drop or click to browse',
    maxSizeFormats: 'Max size: 5MB • Formats: .jpg, .jpeg, .png',
    photoGuidelines: 'Photo Guidelines:',
    guidelineVisible: 'Ensure all students are clearly visible',
    guidelineLighting: 'Good lighting and focus are important',
    guidelineBlurry: 'Avoid blurry or low-resolution images',
    guidelineFacing: 'Students should face the camera',
    processWithAI: 'Process with AI — Detect Students',
    detectingFaces: 'Detecting faces and marking attendance...',
    analyzingImage: 'Analyzing image...',
    detectingFacesTip: 'Detecting faces...',
    matchingStudents: 'Matching students...',
    almostThere: 'Almost there...',
    finalizingResults: 'Finalizing results...',
    demoNote: 'Note: This is a demo simulation. Real AI processing may vary.',
    attendanceResults: 'Attendance Results',
    totalStudents: 'Total Students',
    uncertain: 'Uncertain',
    needsReview: 'Needs Review',
    needsReviewDescription: 'These students need your attention. Please verify their attendance.',
    student: 'Student',
    confidence: 'Confidence',
    manual: 'Manual',
    allStudents: 'All Students',
    exportCSV: 'Export CSV',
    saveAttendance: 'Save Attendance',
    viewMode: 'View Mode',
    editMode: 'Edit Mode',
    noHistoryYet: 'No History Yet',
    noHistoryDescription: 'AI attendance sessions will appear here after you process class photos',
    detected: 'detected',

    // SchedulePage
    viewScheduleDescription: 'View your labs, office hours, meetings, and deadlines',
    week: 'Week',
    list: 'List',
    labSession: 'Lab Session',
    officeHours: 'Office Hours',
    meeting: 'Meeting',
    deadline: 'Deadline',
    legend: 'Legend',
    labSessions: 'Lab Sessions',
    meetings: 'Meetings',
    deadlines: 'Deadlines',
    sunday: 'Sunday',
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',

    // AnnouncementsPage
    postAndManageAnnouncements: 'Post and manage announcements for your lab sections',
    newAnnouncement: 'New Announcement',
    createAnnouncement: 'Create Announcement',
    title: 'Title',
    content: 'Content',
    announcementTitlePlaceholder: 'Announcement title...',
    writeAnnouncementPlaceholder: 'Write your announcement...',
    pinThisAnnouncement: 'Pin this announcement',
    postAnnouncement: 'Post Announcement',
    allCourses: 'All Courses',
    postedBy: 'Posted by',
    noAnnouncementsFound: 'No announcements found.',

    // DiscussionPage
    discussionForum: 'Discussion Forum',
    respondToQuestions: 'Respond to student questions and manage discussions',
    open: 'Open',
    answered: 'Answered',
    closed: 'Closed',
    searchDiscussionsPlaceholder: 'Search discussions...',
    allStatus: 'All Status',
    closeThread: 'Close Thread',
    replies: 'replies',
    views: 'views',
    acceptedAnswer: 'Accepted Answer',
    markAsAnswer: 'Mark as Answer',
    writeReplyPlaceholder: 'Write your reply...',
    reply: 'Reply',
    ta: 'TA',
    instructorRole: 'Instructor',
    studentRole: 'Student',
    noDiscussionsFound: 'No discussions found matching your criteria.',

    // CommunicationPage
    manageMessagesDescription: 'Manage messages, Q&A discussions, and reminders',
    messages: 'Messages',
    qaDiscussions: 'Q&A Discussions',
    newMessage: 'New Message',
    newStatus: 'New',
    flagged: 'Flagged',
    answer: 'Answer',
    flagForInstructor: 'Flag for Instructor',
    yourAnswer: 'Your Answer:',
  },
  ar: {
    // Sidebar & Header
    search: 'بحث...',
    language: 'اللغة',
    english: 'English',
    arabic: 'العربية',
    darkMode: 'الوضع الداكن',
    lightMode: 'الوضع الفاتح',
    viewProfile: 'عرض الملف الشخصي',
    logout: 'تسجيل الخروج',
    dashboard: 'لوحة التحكم',
    courses: 'المقررات',
    labs: 'المعامل',
    grading: 'التصحيح',
    students: 'الطلاب',
    attendance: 'الحضور',
    schedule: 'الجدول',
    announcements: 'الإعلانات',
    discussion: 'المناقشات',
    communication: 'التواصل',
    chat: 'الدردشة',

    // Common
    all: 'الكل',
    cancel: 'إلغاء',
    save: 'حفظ',
    delete: 'حذف',
    edit: 'تعديل',
    filter: 'تصفية',
    actions: 'الإجراءات',
    status: 'الحالة',
    viewDetails: 'عرض التفاصيل',
    viewAll: 'عرض الكل',
    course: 'المقرر',
    pending: 'معلق',
    active: 'نشط',
    submitted: 'تم التقديم',
    graded: 'تم التصحيح',
    present: 'حاضر',
    absent: 'غائب',
    pin: 'تثبيت',
    unpin: 'إلغاء التثبيت',

    // ModernDashboard
    assignedCourses: 'المقررات المسندة',
    activeLabs: 'المعامل النشطة',
    pendingSubmissions: 'التقديمات المعلقة',
    avgPerformance: 'متوسط الأداء',
    unreadMessages: 'الرسائل غير المقروءة',
    upcomingLabs: 'المعامل القادمة',
    coursePerformance: 'أداء المقررات',
    recentActivity: 'النشاط الأخير',
    quickActions: 'إجراءات سريعة',
    viewAllCourses: 'عرض جميع المقررات',
    gradePendingSubmissions: 'تصحيح التقديمات المعلقة',
    checkMessages: 'مراجعة الرسائل',
    manageLabs: 'إدارة المعامل',

    // CoursesPage
    manageYourCourses: 'إدارة المقررات والمعامل المسندة إليك',
    searchCoursesPlaceholder: 'البحث عن المقررات بالاسم أو الرمز...',
    code: 'الرمز',
    instructor: 'المحاضر',
    avgGrade: 'متوسط الدرجة',
    noCoursesFound: 'لا توجد مقررات مطابقة لبحثك.',

    // LabsPage
    labManagement: 'إدارة المعامل',
    manageLabSessions: 'إدارة جلسات المعامل والمواد والتقديمات',
    createNewLab: 'إنشاء معمل جديد',
    searchLabsPlaceholder: 'البحث عن المعامل...',
    upcoming: 'قادم',
    completed: 'مكتمل',
    lab: 'المعمل',
    dateAndTime: 'التاريخ والوقت',
    location: 'الموقع',
    submissions: 'التقديمات',
    noLabsFound: 'لا توجد معامل مطابقة لمعايير البحث.',

    // QuizzesPage
    quizManagement: 'إدارة الاختبارات',
    gradeAndReviewQuizzes: 'تصنيف ومراجعة الاختبارات',
    createNewQuiz: 'إنشاء اختبار جديد',
    aiGenerate: 'توليد بالذكاء الاصطناعي',
    loadingQuizzes: 'جارٍ تحميل الاختبارات...',
    errorLoadingQuizzes: 'خطأ في تحميل الاختبارات',
    noQuizzesAvailable: 'لا توجد اختبارات متاحة',
    createFirstQuiz: 'أنشئ اختبارك الأول للبدء',
    questions: 'أسئلة',
    min: 'د',
    attempts: 'محاولات',
    viewAttempts: 'عرض المحاولات',
    editQuiz: 'تعديل الاختبار',
    gradeEssays: 'تصنيف المقالات',
    generateWithAI: 'توليد بالذكاء الاصطناعي',
    analyzeResults: 'تحليل النتائج',
    publish: 'نشر',
    quizTitle: 'عنوان الاختبار',
    enterQuizTitle: 'أدخل عنوان الاختبار...',
    durationMinutes: 'المدة (دقائق)',
    difficulty: 'الصعوبة',
    easy: 'سهل',
    medium: 'متوسط',
    hard: 'صعب',

    // GradingPage
    gradeLabSubmissions: 'تصحيح تقديمات المعامل بمساعدة الذكاء الاصطناعي أو يدوياً',
    grade: 'الدرجة',
    submittedFiles: 'الملفات المقدمة',
    feedback: 'التغذية الراجعة',
    aiAssistedGrade: 'تصحيح بمساعدة الذكاء الاصطناعي',
    manualGrade: 'تصحيح يدوي',
    editGrade: 'تعديل الدرجة',
    noSubmissionsFound: 'لا توجد تقديمات مطابقة لمعايير البحث.',

    // AssignmentGradingPage
    gradeAssignmentSubmissions: 'تصحيح تقديمات التكاليف',
    selectSubmissionToGrade: 'حدد تقديماً لتصحيحه',
    submissionText: 'نص التقديم',
    file: 'ملف',
    enterValidScore: 'أدخل درجة صحيحة',
    provideFeedback: 'قدم تعليقات بناءة...',
    previousFeedback: 'التعليقات السابقة',
    submitGrade: 'إرسال الدرجة',
    submitting: 'جاري الإرسال...',
    lateSubmission: 'تقديم متأخر',
    assignmentNotFound: 'التكليف غير موجود',
    errorGradingSubmission: 'فشل في تصحيح التقديم',
    successGraded: 'تم تصحيح التقديم بنجاح',
    cannotAccessAsTA: 'لا يمكن الوصول كمعيد - الدور مقيد',
    errorLoadingAssignments: 'فشل في تحميل التكاليف',

    // StudentPerformancePage
    studentPerformance: 'أداء الطلاب',
    monitorPerformance: 'متابعة أداء الطلاب في معاملك',
    excellent: 'ممتاز',
    good: 'جيد',
    fair: 'مقبول',
    needsImprovement: 'يحتاج تحسين',
    avg: 'المتوسط',
    overallAverage: 'المتوسط العام',
    overallAttendance: 'الحضور العام',
    performanceByCourse: 'الأداء حسب المقرر',
    courseDetails: 'تفاصيل المقرر',
    averageGrade: 'متوسط الدرجة',
    late: 'متأخر',
    selectStudentMessage: 'اختر طالباً لعرض تفاصيل الأداء',

    // AttendancePage
    aiPoweredAttendance: 'الحضور بالذكاء الاصطناعي',
    uploadPhotoDescription: 'ارفع صورة لمعملك/فصلك وسيقوم الذكاء الاصطناعي بكشف الحضور تلقائياً',
    uploadPhoto: 'رفع صورة',
    results: 'النتائج',
    history: 'السجل',
    selectLabSession: 'اختر جلسة المعمل',
    uploadClassPhoto: 'رفع صورة الفصل',
    uploadPhotoForAI: 'ارفع صورة واضحة لجلسة المعمل للكشف بالذكاء الاصطناعي',
    dragAndDrop: 'اسحب وأفلت أو انقر للاستعراض',
    maxSizeFormats: 'الحد الأقصى: 5 ميجابايت • الصيغ: .jpg, .jpeg, .png',
    photoGuidelines: 'إرشادات الصورة:',
    guidelineVisible: 'تأكد من ظهور جميع الطلاب بوضوح',
    guidelineLighting: 'الإضاءة الجيدة والتركيز مهمان',
    guidelineBlurry: 'تجنب الصور الضبابية أو منخفضة الدقة',
    guidelineFacing: 'يجب أن يواجه الطلاب الكاميرا',
    processWithAI: 'المعالجة بالذكاء الاصطناعي — كشف الطلاب',
    detectingFaces: 'جاري كشف الوجوه وتسجيل الحضور...',
    analyzingImage: 'جاري تحليل الصورة...',
    detectingFacesTip: 'جاري كشف الوجوه...',
    matchingStudents: 'جاري مطابقة الطلاب...',
    almostThere: 'أوشك على الانتهاء...',
    finalizingResults: 'جاري إنهاء النتائج...',
    demoNote: 'ملاحظة: هذه محاكاة تجريبية. قد تختلف المعالجة الفعلية بالذكاء الاصطناعي.',
    attendanceResults: 'نتائج الحضور',
    totalStudents: 'إجمالي الطلاب',
    uncertain: 'غير مؤكد',
    needsReview: 'يحتاج مراجعة',
    needsReviewDescription: 'هؤلاء الطلاب يحتاجون انتباهك. يرجى التحقق من حضورهم.',
    student: 'الطالب',
    confidence: 'نسبة الثقة',
    manual: 'يدوي',
    allStudents: 'جميع الطلاب',
    exportCSV: 'تصدير CSV',
    saveAttendance: 'حفظ الحضور',
    viewMode: 'وضع العرض',
    editMode: 'وضع التعديل',
    noHistoryYet: 'لا يوجد سجل بعد',
    noHistoryDescription: 'ستظهر جلسات الحضور بالذكاء الاصطناعي هنا بعد معالجة صور الفصل',
    detected: 'تم الكشف',

    // SchedulePage
    viewScheduleDescription: 'عرض معاملك وساعات المكتب والاجتماعات والمواعيد النهائية',
    week: 'أسبوع',
    list: 'قائمة',
    labSession: 'جلسة معمل',
    officeHours: 'ساعات المكتب',
    meeting: 'اجتماع',
    deadline: 'الموعد النهائي',
    legend: 'دليل الألوان',
    labSessions: 'جلسات المعامل',
    meetings: 'الاجتماعات',
    deadlines: 'المواعيد النهائية',
    sunday: 'الأحد',
    monday: 'الاثنين',
    tuesday: 'الثلاثاء',
    wednesday: 'الأربعاء',
    thursday: 'الخميس',

    // AnnouncementsPage
    postAndManageAnnouncements: 'نشر وإدارة الإعلانات لأقسام معاملك',
    newAnnouncement: 'إعلان جديد',
    createAnnouncement: 'إنشاء إعلان',
    title: 'العنوان',
    content: 'المحتوى',
    announcementTitlePlaceholder: 'عنوان الإعلان...',
    writeAnnouncementPlaceholder: 'اكتب إعلانك...',
    pinThisAnnouncement: 'تثبيت هذا الإعلان',
    postAnnouncement: 'نشر الإعلان',
    allCourses: 'جميع المقررات',
    postedBy: 'نشر بواسطة',
    noAnnouncementsFound: 'لا توجد إعلانات.',

    // DiscussionPage
    discussionForum: 'منتدى المناقشات',
    respondToQuestions: 'الرد على أسئلة الطلاب وإدارة المناقشات',
    open: 'مفتوح',
    answered: 'تمت الإجابة',
    closed: 'مغلق',
    searchDiscussionsPlaceholder: 'البحث في المناقشات...',
    allStatus: 'جميع الحالات',
    closeThread: 'إغلاق الموضوع',
    replies: 'ردود',
    views: 'مشاهدات',
    acceptedAnswer: 'إجابة مقبولة',
    markAsAnswer: 'تحديد كإجابة',
    writeReplyPlaceholder: 'اكتب ردك...',
    reply: 'رد',
    ta: 'معيد',
    instructorRole: 'محاضر',
    studentRole: 'طالب',
    noDiscussionsFound: 'لا توجد مناقشات مطابقة لمعايير البحث.',

    // CommunicationPage
    manageMessagesDescription: 'إدارة الرسائل ومناقشات الأسئلة والأجوبة والتذكيرات',
    messages: 'الرسائل',
    qaDiscussions: 'مناقشات الأسئلة والأجوبة',
    newMessage: 'رسالة جديدة',
    newStatus: 'جديد',
    flagged: 'مُعَلَّم',
    answer: 'إجابة',
    flagForInstructor: 'تحويل للمحاضر',
    yourAnswer: 'إجابتك:',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('eduverse-language');
      return (saved as Language) || 'en';
    }
    return 'en';
  });

  useEffect(() => {
    localStorage.setItem('eduverse-language', language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
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
