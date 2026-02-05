// UI Component Library
// Use these components across all dashboards for consistency

// Layout Components
export { Sidebar, Header, DashboardLayout, PageTransition, StaggeredList, FadeIn } from './layout';

// Card Components
export { 
  StatsCard, 
  ActionCard, 
  MetricCard,
  StudyStreak,
  QuickActionsWidget,
  StudentQuickActions,
  DeadlineWidget,
  CourseCard,
} from './cards';

// Form Components
export { Button, Input, Select, Toggle } from './forms';

// Data Display Components
export { StatusBadge, ProgressBar, CircularProgress, DataTable } from './data-display';

// Modal Components
export { Modal, ModalBody, ModalFooter, ConfirmDialog } from './modals';

// Feedback Components
export { 
  Skeleton, 
  CardSkeleton, 
  TableRowSkeleton, 
  ListItemSkeleton,
  Loading, 
  PageLoading, 
  InlineLoading,
  EmptyState, 
  NoDataEmpty, 
  SearchEmpty, 
  ErrorEmpty,
  ToastProvider, 
  useToast 
} from './feedback';
