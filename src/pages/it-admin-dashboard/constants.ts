// IT Admin Dashboard Constants

export const IT_DASHBOARD_STATS = [
  { label: 'Server Uptime', value: '99.9%', comparison: '+0.1%', isPositive: true },
  { label: 'API Requests/min', value: '12,450', comparison: '+15%', isPositive: true },
  { label: 'Active Sessions', value: '2,847', comparison: '+8%', isPositive: true },
  { label: 'Storage Used', value: '78.5 TB', comparison: '+2.3 TB', isPositive: false },
];

export const SERVER_STATUS = [
  {
    id: 1,
    name: 'Production Server 1',
    status: 'healthy',
    cpu: 45,
    memory: 62,
    uptime: '99.99%',
    location: 'US-East',
  },
  {
    id: 2,
    name: 'Production Server 2',
    status: 'healthy',
    cpu: 38,
    memory: 55,
    uptime: '99.98%',
    location: 'US-West',
  },
  {
    id: 3,
    name: 'Database Server',
    status: 'healthy',
    cpu: 72,
    memory: 78,
    uptime: '99.99%',
    location: 'US-East',
  },
  {
    id: 4,
    name: 'Cache Server',
    status: 'warning',
    cpu: 85,
    memory: 70,
    uptime: '99.95%',
    location: 'EU-West',
  },
  {
    id: 5,
    name: 'Backup Server',
    status: 'healthy',
    cpu: 25,
    memory: 40,
    uptime: '99.99%',
    location: 'US-East',
  },
];

export const API_INTEGRATIONS = [
  {
    id: 1,
    name: 'OpenAI GPT-4',
    type: 'AI',
    status: 'active',
    apiKey: '****-****-****-1234',
    usage: 85000,
    limit: 100000,
    cost: '$425.00',
  },
  {
    id: 2,
    name: 'Google Gemini',
    type: 'AI',
    status: 'active',
    apiKey: '****-****-****-5678',
    usage: 45000,
    limit: 75000,
    cost: '$180.00',
  },
  {
    id: 3,
    name: 'Microsoft Azure',
    type: 'Cloud',
    status: 'active',
    apiKey: '****-****-****-9012',
    usage: null,
    limit: null,
    cost: '$1,250.00',
  },
  {
    id: 4,
    name: 'AWS S3',
    type: 'Storage',
    status: 'active',
    apiKey: '****-****-****-3456',
    usage: null,
    limit: null,
    cost: '$850.00',
  },
  {
    id: 5,
    name: 'SendGrid',
    type: 'Email',
    status: 'active',
    apiKey: '****-****-****-7890',
    usage: 25000,
    limit: 50000,
    cost: '$45.00',
  },
  {
    id: 6,
    name: 'Zoom API',
    type: 'Video',
    status: 'inactive',
    apiKey: '****-****-****-2468',
    usage: 0,
    limit: 10000,
    cost: '$0.00',
  },
];

export const DATABASE_BACKUPS = [
  {
    id: 1,
    name: 'Daily Backup',
    schedule: 'Every day at 2:00 AM',
    lastRun: '2026-02-05 02:00:00',
    status: 'completed',
    size: '45.2 GB',
    retention: '7 days',
  },
  {
    id: 2,
    name: 'Weekly Full Backup',
    schedule: 'Every Sunday at 1:00 AM',
    lastRun: '2026-02-02 01:00:00',
    status: 'completed',
    size: '125.8 GB',
    retention: '30 days',
  },
  {
    id: 3,
    name: 'Monthly Archive',
    schedule: '1st of every month',
    lastRun: '2026-02-01 00:00:00',
    status: 'completed',
    size: '125.8 GB',
    retention: '1 year',
  },
  {
    id: 4,
    name: 'Real-time Replication',
    schedule: 'Continuous',
    lastRun: 'Running',
    status: 'running',
    size: 'N/A',
    retention: 'Real-time',
  },
];

export const SECURITY_EVENTS = [
  {
    id: 1,
    type: 'warning',
    message: 'Multiple failed login attempts from IP 192.168.1.100',
    timestamp: '2026-02-05 13:15:00',
    severity: 'medium',
  },
  {
    id: 2,
    type: 'info',
    message: 'SSL certificate renewal successful',
    timestamp: '2026-02-05 12:00:00',
    severity: 'low',
  },
  {
    id: 3,
    type: 'error',
    message: 'Rate limit exceeded for API endpoint /api/users',
    timestamp: '2026-02-05 11:45:00',
    severity: 'high',
  },
  {
    id: 4,
    type: 'info',
    message: 'Security patch applied successfully',
    timestamp: '2026-02-05 10:30:00',
    severity: 'low',
  },
  {
    id: 5,
    type: 'warning',
    message: 'Unusual traffic pattern detected from region: Unknown',
    timestamp: '2026-02-05 09:15:00',
    severity: 'medium',
  },
];

export const SSL_CERTIFICATES = [
  {
    id: 1,
    domain: '*.eduverse.com',
    issuer: "Let's Encrypt",
    validFrom: '2026-01-01',
    validTo: '2026-04-01',
    status: 'valid',
  },
  {
    id: 2,
    domain: 'api.eduverse.com',
    issuer: 'DigiCert',
    validFrom: '2025-12-15',
    validTo: '2026-12-15',
    status: 'valid',
  },
  {
    id: 3,
    domain: 'admin.eduverse.com',
    issuer: "Let's Encrypt",
    validFrom: '2026-01-15',
    validTo: '2026-04-15',
    status: 'valid',
  },
  {
    id: 4,
    domain: 'legacy.eduverse.com',
    issuer: 'Comodo',
    validFrom: '2025-06-01',
    validTo: '2026-02-28',
    status: 'expiring',
  },
];

export const AI_MODELS = [
  {
    id: 1,
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    status: 'active',
    purpose: 'Content Generation',
    costPerRequest: '$0.005',
    monthlyUsage: 45000,
  },
  {
    id: 2,
    name: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    status: 'active',
    purpose: 'Chat Support',
    costPerRequest: '$0.001',
    monthlyUsage: 120000,
  },
  {
    id: 3,
    name: 'Gemini Pro',
    provider: 'Google',
    status: 'active',
    purpose: 'Code Analysis',
    costPerRequest: '$0.004',
    monthlyUsage: 25000,
  },
  {
    id: 4,
    name: 'Claude 3',
    provider: 'Anthropic',
    status: 'inactive',
    purpose: 'Research',
    costPerRequest: '$0.008',
    monthlyUsage: 0,
  },
  {
    id: 5,
    name: 'DALL-E 3',
    provider: 'OpenAI',
    status: 'active',
    purpose: 'Image Generation',
    costPerRequest: '$0.04',
    monthlyUsage: 5000,
  },
];

export const CAMPUSES = [
  {
    id: 1,
    name: 'Main Campus',
    domain: 'main.eduverse.com',
    students: 15000,
    instructors: 450,
    status: 'active',
    storage: '25.5 TB',
  },
  {
    id: 2,
    name: 'Engineering Campus',
    domain: 'eng.eduverse.com',
    students: 8500,
    instructors: 280,
    status: 'active',
    storage: '18.2 TB',
  },
  {
    id: 3,
    name: 'Medical Campus',
    domain: 'med.eduverse.com',
    students: 5200,
    instructors: 320,
    status: 'active',
    storage: '22.8 TB',
  },
  {
    id: 4,
    name: 'Business School',
    domain: 'business.eduverse.com',
    students: 6800,
    instructors: 190,
    status: 'active',
    storage: '12.0 TB',
  },
  {
    id: 5,
    name: 'Arts Campus',
    domain: 'arts.eduverse.com',
    students: 3200,
    instructors: 120,
    status: 'maintenance',
    storage: '8.5 TB',
  },
];

export const SYSTEM_SETTINGS = {
  sessionTimeout: 30, // minutes
  maxLoginAttempts: 5,
  passwordExpiry: 90, // days
  twoFactorEnabled: true,
  maintenanceMode: false,
  debugMode: false,
  rateLimitPerMinute: 100,
  maxFileUploadSize: 100, // MB
};

export const BRANDING_SETTINGS = {
  primaryColor: '#ef4444',
  secondaryColor: '#f97316',
  logoUrl: '/logo.png',
  faviconUrl: '/favicon.ico',
  supportEmail: 'support@eduverse.com',
  companyName: 'EduVerse',
};

export const PERFORMANCE_METRICS = {
  responseTime: [
    { time: '00:00', value: 120 },
    { time: '04:00', value: 85 },
    { time: '08:00', value: 250 },
    { time: '12:00', value: 380 },
    { time: '16:00', value: 320 },
    { time: '20:00', value: 180 },
  ],
  errorRate: [
    { time: '00:00', value: 0.1 },
    { time: '04:00', value: 0.05 },
    { time: '08:00', value: 0.3 },
    { time: '12:00', value: 0.5 },
    { time: '16:00', value: 0.4 },
    { time: '20:00', value: 0.2 },
  ],
  activeUsers: [
    { time: '00:00', value: 150 },
    { time: '04:00', value: 50 },
    { time: '08:00', value: 1200 },
    { time: '12:00', value: 2500 },
    { time: '16:00', value: 2100 },
    { time: '20:00', value: 800 },
  ],
};

export const RECENT_IT_ACTIVITY = [
  {
    id: 1,
    action: 'Server restart',
    user: 'IT Admin',
    timestamp: '2026-02-05 13:00:00',
    details: 'Production Server 2',
  },
  {
    id: 2,
    action: 'Backup completed',
    user: 'System',
    timestamp: '2026-02-05 02:00:00',
    details: 'Daily backup - 45.2 GB',
  },
  {
    id: 3,
    action: 'SSL renewed',
    user: 'IT Admin',
    timestamp: '2026-02-04 15:30:00',
    details: '*.eduverse.com',
  },
  {
    id: 4,
    action: 'API key rotated',
    user: 'IT Admin',
    timestamp: '2026-02-04 10:00:00',
    details: 'OpenAI GPT-4',
  },
  {
    id: 5,
    action: 'Security patch',
    user: 'System',
    timestamp: '2026-02-03 23:00:00',
    details: 'Critical vulnerability fix',
  },
];
