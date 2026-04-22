import React, { useEffect, useMemo, useState } from 'react';
import { X, Search, User, Shield, GraduationCap, Zap, UserSquare2 } from 'lucide-react';

interface QuickLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (email: string, password: string) => void;
}

type QuickLoginSeedUser = { id: number; name: string; email: string; roles: string[] };

type QuickLoginSeeds = {
  generatedAt?: string;
  database?: string;
  students: QuickLoginSeedUser[];
  teachingAssistants: QuickLoginSeedUser[];
  instructors: QuickLoginSeedUser[];
  staff: QuickLoginSeedUser[];
};

const QuickLoginModal: React.FC<QuickLoginModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'student' | 'ta' | 'instructor' | 'admin'>('student');
  const [seeds, setSeeds] = useState<QuickLoginSeeds | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const devPassword =
    (import.meta as any).env?.VITE_DEV_QUICK_LOGIN_PASSWORD ||
    (import.meta as any).env?.VITE_DEV_SEED_PASSWORD ||
    'Pass@123';

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const res = await fetch(`/quickLoginSeeds.json?ts=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) {
          throw new Error(`Missing quickLoginSeeds.json (${res.status}). Run npm run dev:export-quick-login-seeds`);
        }
        const json = (await res.json()) as QuickLoginSeeds;
        if (cancelled) return;
        setSeeds(json);
      } catch (e) {
        if (cancelled) return;
        setSeeds(null);
        setLoadError(e instanceof Error ? e.message : 'Failed to load quick login accounts');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const roles = [
    { id: 'student' as const, label: 'Students', icon: GraduationCap },
    { id: 'ta' as const, label: 'TAs', icon: UserSquare2 },
    { id: 'instructor' as const, label: 'Instructors', icon: User },
    { id: 'admin' as const, label: 'Staff', icon: Shield },
  ];

  const students = seeds?.students || [];
  const tas = seeds?.teachingAssistants || [];
  const instructors = seeds?.instructors || [];
  const others = seeds?.staff || [];

  const matches = (u: QuickLoginSeedUser) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || String(u.id).includes(q);
  };

  const filteredStudents = useMemo(() => students.filter(matches), [students, searchTerm]);
  const filteredTas = useMemo(() => tas.filter(matches), [tas, searchTerm]);
  const filteredInstructors = useMemo(() => instructors.filter(matches), [instructors, searchTerm]);
  const filteredStaff = useMemo(() => others.filter(matches), [others, searchTerm]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-slate-900/90 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Quick Login</h2>
              <p className="text-xs text-slate-400">
                {seeds?.database ? `${seeds.database}` : 'Dev accounts'}
                {seeds?.generatedAt ? ` · generated ${new Date(seeds.generatedAt).toLocaleString()}` : ''}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 bg-black/20">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text"
              placeholder="Search by name or email..."
              className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex p-2 gap-1 bg-black/20">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                onClick={() => setActiveTab(role.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === role.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : 'text-slate-400 hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {role.label}
              </button>
            );
          })}
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {isLoading && (
            <div className="py-10 text-center text-sm text-slate-400">Loading accounts…</div>
          )}

          {!isLoading && loadError && (
            <div className="py-8 px-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-sm text-red-200">
              {loadError}
            </div>
          )}

          {!isLoading && !loadError && activeTab === 'student' && filteredStudents.map((u) => (
            <button
              key={u.email}
              onClick={() => onSelect(u.email, devPassword)}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 group-hover:bg-blue-500/20 group-hover:border-blue-500/30 transition-colors">
                  <span className="text-xs font-bold text-slate-300 group-hover:text-blue-400">S{u.id}</span>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-white text-sm">{u.name}</div>
                  <div className="text-xs text-slate-500">{u.email}</div>
                </div>
              </div>
              <div className="px-3 py-1 rounded-full bg-white/5 text-[10px] font-bold text-slate-400 group-hover:text-blue-400 tracking-wider transition-colors">
                LOGIN
              </div>
            </button>
          ))}

          {!isLoading && !loadError && activeTab === 'ta' && filteredTas.map((u) => (
            <button
              key={u.email}
              onClick={() => onSelect(u.email, devPassword)}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 group-hover:bg-amber-500/20 group-hover:border-amber-500/30 transition-colors">
                  <UserSquare2 className="w-5 h-5 text-slate-300 group-hover:text-amber-300" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-white text-sm">{u.name}</div>
                  <div className="text-xs text-slate-500">{u.email}</div>
                </div>
              </div>
              <div className="px-3 py-1 rounded-full bg-white/5 text-[10px] font-bold text-slate-400 group-hover:text-amber-300 tracking-wider transition-colors">
                LOGIN
              </div>
            </button>
          ))}

          {!isLoading && !loadError && activeTab === 'instructor' && filteredInstructors.map((u) => (
            <button
              key={u.email}
              onClick={() => onSelect(u.email, devPassword)}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-green-500/30 hover:bg-green-500/5 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 group-hover:bg-green-500/20 group-hover:border-green-500/30 transition-colors">
                  <User className="w-5 h-5 text-slate-300 group-hover:text-green-400" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-white text-sm">{u.name}</div>
                  <div className="text-xs text-slate-500">{u.email}</div>
                </div>
              </div>
              <div className="px-3 py-1 rounded-full bg-white/5 text-[10px] font-bold text-slate-400 group-hover:text-green-400 tracking-wider transition-colors">
                LOGIN
              </div>
            </button>
          ))}

          {!isLoading && !loadError && activeTab === 'admin' && filteredStaff.map((u) => (
            <button
              key={u.email}
              onClick={() => onSelect(u.email, devPassword)}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 group-hover:bg-purple-500/20 group-hover:border-purple-500/30 transition-colors">
                  <Shield className="w-5 h-5 text-slate-300 group-hover:text-purple-400" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-white text-sm">{u.name}</div>
                  <div className="text-xs text-slate-500">{u.email}</div>
                </div>
              </div>
              <div className="px-3 py-1 rounded-full bg-white/5 text-[10px] font-bold text-slate-400 group-hover:text-purple-400 tracking-wider transition-colors">
                LOGIN
              </div>
            </button>
          ))}

          {!isLoading && !loadError && activeTab === 'student' && filteredStudents.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-slate-500 text-sm italic">No students found matching "{searchTerm}"</p>
            </div>
          )}

          {!isLoading && !loadError && activeTab === 'ta' && filteredTas.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-slate-500 text-sm italic">No TAs found matching "{searchTerm}"</p>
            </div>
          )}

          {!isLoading && !loadError && activeTab === 'instructor' && filteredInstructors.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-slate-500 text-sm italic">No instructors found matching "{searchTerm}"</p>
            </div>
          )}

          {!isLoading && !loadError && activeTab === 'admin' && filteredStaff.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-slate-500 text-sm italic">No staff accounts found matching "{searchTerm}"</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-black/40 border-t border-white/5 text-[10px] text-center text-slate-500 uppercase tracking-widest font-medium">
          PRO-TIP: PRESS <span className="text-blue-400">ESC</span> TO CANCEL
        </div>
      </div>
    </div>
  );
};

export default QuickLoginModal;
