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
} from 'lucide-react';

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
      // Ctrl+E (or Cmd+E on Mac) toggles the modal
      if ((e.ctrlKey || e.metaKey) && (e.key === 'e' || e.key === 'E')) {
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
            Ctrl+E
          </kbd>{' '}
          anywhere to open this panel.
        </p>

        <div className="grid gap-2">
          {PAGES.map(({ path, label, icon: Icon }) => (
            <button
              key={path}
              type="button"
              onClick={() => handleNavigate(path)}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg border border-border bg-background hover:bg-muted/50 hover:border-primary/30 transition-colors text-left"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-medium text-foreground">{label}</span>
                <p className="text-xs text-muted-foreground truncate">{path}</p>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

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
} from 'lucide-react';

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
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
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
          Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">Ctrl+E</kbd> anytime to open this panel.
        </p>
        <div className="grid gap-2">
          {PAGES.map(({ path, label, icon: Icon }) => (
            <button
              key={path}
              onClick={() => handleNavigate(path)}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg border border-border bg-background hover:bg-muted/50 hover:border-primary/30 transition-colors text-left"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-medium text-foreground">{label}</span>
                <p className="text-xs text-muted-foreground truncate">{path}</p>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
