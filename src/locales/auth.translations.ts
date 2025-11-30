export interface AuthTranslations {
  en: {
    title: string;
    subtitle: string;
    email: string;
    password: string;
    forgotPassword: string;
    loginButton: string;
    loginWithGoogle: string;
    loginWithMicrosoft: string;
    languageToggle: string;
    loggingIn: string;
    error: string;
  };
  ar: {
    title: string;
    subtitle: string;
    email: string;
    password: string;
    forgotPassword: string;
    loginButton: string;
    loginWithGoogle: string;
    loginWithMicrosoft: string;
    languageToggle: string;
    loggingIn: string;
    error: string;
  };
}

export const authTranslations: AuthTranslations = {
  en: {
    title: 'Welcome Back to EduVerse',
    subtitle: 'Your AI-powered learning journey continues with new challenges and rewards!',
    email: 'Email/Username',
    password: 'Password',
    forgotPassword: 'Forgot Password?',
    loginButton: 'Login',
    loginWithGoogle: 'Login with Google',
    loginWithMicrosoft: 'Login with Microsoft',
    languageToggle: 'English 🇬🇧 / Arabic 🇸🇦',
    loggingIn: 'Logging in...',
    error: 'Login failed. Please check your credentials.',
  },
  ar: {
    title: 'مرحبًا بكم مجددًا في عالم التعليم',
    subtitle: 'رحلتك التعليمية بدعم الذكاء الاصطناعي مستمرة مع تحديات ومكافآت جديدة!',
    email: 'البريد الإلكتروني / اسم المستخدم',
    password: 'كلمة المرور',
    forgotPassword: 'هل نسيت كلمة المرور؟',
    loginButton: 'تسجيل الدخول',
    loginWithGoogle: 'تسجيل الدخول باستخدام جوجل',
    loginWithMicrosoft: 'تسجيل الدخول باستخدام مايكروسوفت',
    languageToggle: 'الإنجليزية / العربية',
    loggingIn: 'جارٍ التسجيل...',
    error: 'فشل تسجيل الدخول. يرجى التحقق من بيانات اعتمادك.',
  },
};
