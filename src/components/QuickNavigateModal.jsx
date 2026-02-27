import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Home,
  LogIn,
  User,
  GraduationCap,
  BookOpen,
  Users,
  Shield,
  Server,
  ExternalLink,
  Sparkles,
  PenTool,
  Zap,
} from 'lucide-react';

const AWAB_PAGES = [
  { 
    path: '/', 
    label: 'Global Page Titles', 
    description: 'Old: "eduverse"\nNew: "[Page Name] | EduVerse"',
    icon: Sparkles 
  },
  { 
    path: '/instructordashboard', 
    label: 'Minimal Search Bar', 
    description: 'Old: Huge glass effect bar\nNew: Clean clickable button, like Vercel/GitHub',
    icon: Sparkles 
  },
  { 
    path: '/instructordashboard', 
    label: 'Minimal Stat Cards', 
    description: 'Old: Huge glass effect, large shadows\nNew: Clean minimal flat design with soft borders',
    icon: Sparkles 
  },
  { 
    path: '/instructordashboard', 
    label: 'Refined Evy AI Card', 
    description: 'Old: Huge, too round, unbalanced font ratios\nNew: Smaller padding, refined borders, proportional icons & font sizes',
    icon: Sparkles 
  },
  { 
    path: '/instructordashboard', 
    label: 'Global Dashboard Themes', 
    description: 'Old: Cluttered with random colors (purple, green, orange)\nNew: Single primary color scale driving all charts, tags, cards, and sidebars',
    icon: PenTool 
  },
  { 
    path: '/instructordashboard', 
    label: 'Refined Quick Actions', 
    description: 'Old: Heavy, stark dark-colored block\nNew: Clean bright card with refined shadows and subtle hover interactions',
    icon: Sparkles 
  },
  { 
    path: '/instructordashboard', 
    label: 'Lucide Icons for Courses', 
    description: 'Old: Hardcoded text emojis (🎓, 📊)\nNew: Scalable Lucide React icons matching the application theme system',
    icon: GraduationCap 
  },
  {
    path: '/instructordashboard',
    label: 'Profile Theme Dropdown',
    description: 'Old: Theme colored in hidden global search menu\nNew: Centralized inside the top right Profile dropdown menu for contextual dashboard switching',
    icon: Sparkles
  },
  {
    path: '/instructordashboard',
    label: 'Rose & Amber Themes',
    description: 'Old: Only 3 primary colors available (Blue, Emerald, Violet)\nNew: Dynamic support for warm Rose and Amber tones alongside pastels',
    icon: Sparkles
  },
  {
    path: '/instructordashboard',
    label: 'Legible Evy & Class Cards',
    description: 'Old: Contrast clashed leading to illegible theme texts. Cards were boundless flat glasses.\nNew: Fixed Tailwind purging dynamically mapped font colors, text contrasts securely mapped to rich slates. Soft borders applied natively to distinct Course Cards.',
    icon: PenTool
  },
  {
    path: '/instructordashboard',
    label: 'Clean Universal Sidebar',
    description: 'Old: Used heavy purple glows, generic .glass backgrounds, and translation hover effects.\nNew: Refined to a bright minimal flat look. Tied 100% to selected active theme color, no scale/translate jiggle.',
    icon: Sparkles
  },
  {
    path: '/instructordashboard',
    label: 'Clean Minimal Header & Search',
    description: 'Old: Search input was surrounded by focus rings and heavy drop shadows. Avatar had purple hover glows.\nNew: Stripped out completely to zero box shadows. Sleek border outline and flat hover variants to maintain an ultimate minimal aesthetic aligned with everything else.',
    icon: Sparkles
  }
];

const TAREK_PAGES = [
  {
    path: '/tadashboard',
    label: 'TA Dashboard — New Tabs',
    description: 'Added: Quizzes, Analytics, Office Hours, Notifications, AI Assistant, Lab Resources tabs',
    icon: Zap
  },
  {
    path: '/tadashboard',
    label: 'TA — Removed Communication',
    description: 'Removed CommunicationPage and merged functionality into Discussion/Chat',
    icon: Zap
  },
  {
    path: '/studentdashboard',
    label: 'Student — Quiz Center',
    description: 'Added Quiz Center tab with full QuizTaking component (selection, active quiz, results)',
    icon: Zap
  },
  {
    path: '/admindashboard',
    label: 'Admin — Student Management',
    description: 'Renamed User Management → Student Management with new StudentManagementPage component',
    icon: Zap
  },
  {
    path: '/admindashboard',
    label: 'Admin — Periods & Scheduling',
    description: 'Added Periods & Scheduling tab and Prerequisites Management',
    icon: Zap
  },
  {
    path: '/instructordashboard',
    label: 'Shared — Dark Mode Improvements',
    description: 'AIQuestionEditor and MessagingChat now have explicit isDark props and improved dark mode styling',
    icon: Zap
  },
  {
    path: '/instructordashboard',
    label: 'Shared — CMD+K Global Search',
    description: 'DashboardHeader refactored with CMD+K shortcut for Global Search',
    icon: Zap
  },
];

const PAGES = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/login', label: 'Login', icon: LogIn },
  { path: '/profile', label: 'Profile', icon: User },
  { path: '/studentdashboard', label: 'Student Dashboard', icon: GraduationCap },
  { path: '/instructordashboard', label: 'Instructor Dashboard', icon: BookOpen },
  { path: '/tadashboard', label: 'TA Dashboard', icon: Users },
  { path: '/admindashboard', label: 'Admin Dashboard', icon: Shield },
  { path: '/itadmindashboard', label: 'IT Admin Dashboard', icon: Server },
];

export function QuickNavigateModal() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+Shift+E (or Cmd+Shift+E on Mac) toggles the modal
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'e' || e.key === 'E')) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }

      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Quick Navigate
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground mb-4">
          Press{' '}
          <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">
            Ctrl+Shift+E
          </kbd>{' '}
          anywhere to open this panel.
        </p>

        <div className="grid gap-2 max-h-[60vh] overflow-y-auto pr-2">
          {PAGES.map((page) => {
            const Icon = page.icon;
            return (
              <button
                key={page.path}
                type="button"
                onClick={() => handleNavigate(page.path)}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg border border-border bg-background hover:bg-muted/50 hover:border-primary/30 transition-colors text-left"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
              <div className="flex-1 min-w-0">
                <span className="font-medium text-foreground">{page.label}</span>
                <p className="text-xs text-muted-foreground truncate">{page.path}</p>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>
          )})}

          <div className="my-2 border-t border-border" />
          
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-primary" />
            Awab changes
          </h3>
          <p className="text-xs text-muted-foreground mb-2">Track the pages you are redesigning here (compare before/after).</p>

          {AWAB_PAGES.length > 0 ? (
            AWAB_PAGES.map((page) => {
              const Icon = page.icon;
              return (
              <button
                key={page.path}
                type="button"
                onClick={() => handleNavigate(page.path)}
                className="flex items-start gap-3 w-full px-4 py-3 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors text-left"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-foreground block">{page.label}</span>
                  {page.description ? (
                    <p className="text-xs text-primary/80 mt-1 whitespace-pre-line">{page.description}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground truncate">{page.path}</p>
                  )}
                </div>
                <ExternalLink className="h-4 w-4 text-primary/70 shrink-0 mt-1" />
              </button>
            )})
          ) : (
            <div className="text-xs text-center p-3 rounded-lg border border-dashed border-border text-muted-foreground bg-muted/10">
              No pages added yet. Add them to AWAB_PAGES in QuickNavigateModal.jsx
            </div>
          )}

          <div className="my-2 border-t border-border" />

          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-1">
            <Zap className="h-4 w-4 text-amber-500" />
            Tarek changes
          </h3>
          <p className="text-xs text-muted-foreground mb-2">Track what Tarek added in the finalize branch.</p>

          {TAREK_PAGES.length > 0 ? (
            TAREK_PAGES.map((page, idx) => {
              const Icon = page.icon;
              return (
              <button
                key={`tarek-${idx}`}
                type="button"
                onClick={() => handleNavigate(page.path)}
                className="flex items-start gap-3 w-full px-4 py-3 rounded-lg border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition-colors text-left"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-amber-500/10 shrink-0">
                  <Icon className="h-4 w-4 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-foreground block">{page.label}</span>
                  {page.description ? (
                    <p className="text-xs text-amber-600/80 mt-1 whitespace-pre-line">{page.description}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground truncate">{page.path}</p>
                  )}
                </div>
                <ExternalLink className="h-4 w-4 text-amber-500/70 shrink-0 mt-1" />
              </button>
            )})
          ) : (
            <div className="text-xs text-center p-3 rounded-lg border border-dashed border-border text-muted-foreground bg-muted/10">
              No pages added yet. Add them to TAREK_PAGES in QuickNavigateModal.jsx
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}
