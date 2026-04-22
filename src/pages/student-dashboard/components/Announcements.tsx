import { useState, useMemo, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Megaphone, 
  Search, 
  Calendar, 
  User, 
  BookOpen, 
  Pin, 
  Eye,
  Loader2,
  Clock,
} from 'lucide-react';
import { announcementService, type Announcement } from '../../../services/api/announcementService';
import { toast } from 'sonner';

export function Announcements() {
  const { isDark, primaryHex } = useTheme() as any;
  const { t } = useLanguage();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const data = await announcementService.getAnnouncements();
        // Backend returns data in a paginated format { data: [], meta: {} } 
        // Based on service it might return r.data which is the whole object or just the data array
        // Let's handle both
        const list = Array.isArray(data) ? data : (data as any)?.data || [];
        setAnnouncements(list);
      } catch (error) {
        toast.error('Failed to load announcements');
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  const courseOptions = useMemo(() => {
    const courses = new Map();
    announcements.forEach(a => {
      if (a.course) {
        courses.set(String(a.courseId), a.course.name || a.course.code);
      }
    });
    return Array.from(courses.entries()).map(([id, name]) => ({ id, name }));
  }, [announcements]);

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter(a => {
      const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            a.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCourse = filterCourse === 'all' || String(a.courseId) === filterCourse;
      return matchesSearch && matchesCourse;
    });
  }, [announcements, searchTerm, filterCourse]);

  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-600';
  const cardBg = isDark ? 'bg-card-dark border-white/5' : 'bg-white border-slate-100';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${textPrimary}`}>
            {t('announcements') || 'Announcements'}
          </h1>
          <p className={`mt-1 ${textSecondary}`}>
            Latest updates and important notices from your instructors
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className={`p-4 rounded-[2rem] border-2 flex flex-col md:flex-row gap-4 ${cardBg}`}>
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search announcements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
              isDark ? 'bg-white/5 border-white/10 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          <button
            onClick={() => setFilterCourse('all')}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              filterCourse === 'all'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : isDark ? 'bg-white/5 text-slate-300 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Courses
          </button>
          {courseOptions.map(course => (
            <button
              key={course.id}
              onClick={() => setFilterCourse(course.id)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                filterCourse === course.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : isDark ? 'bg-white/5 text-slate-300 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {course.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
          <p className={textSecondary}>Loading announcements...</p>
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className={`p-20 text-center rounded-[2.5rem] border-2 border-dashed ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          <Megaphone size={64} className="mx-auto mb-6 opacity-20" />
          <h3 className={`text-xl font-bold ${textPrimary}`}>No announcements found</h3>
          <p className={`mt-2 ${textSecondary}`}>
            {searchTerm || filterCourse !== 'all' 
              ? "We couldn't find any announcements matching your current filters." 
              : "There are no announcements for your courses at the moment."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredAnnouncements.map((announcement) => (
            <div
              key={announcement.id}
              className={`p-6 rounded-[2.5rem] border-2 transition-all hover:shadow-xl group ${cardBg} ${announcement.isPinned ? (isDark ? 'border-amber-500/30 bg-amber-500/5' : 'border-amber-200 bg-amber-50/30') : ''}`}
            >
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    {announcement.isPinned === 1 && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                        <Pin size={12} className="fill-current" /> Pinned
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
                      <BookOpen size={12} /> {announcement.course?.code || 'General'}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      announcement.priority === 'urgent' ? 'bg-red-500 text-white' :
                      announcement.priority === 'high' ? 'bg-orange-500 text-white' :
                      'bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-400'
                    }`}>
                      {announcement.priority || 'Normal'}
                    </span>
                  </div>

                  <h3 className={`text-2xl font-bold leading-tight mb-4 ${textPrimary}`}>
                    {announcement.title}
                  </h3>

                  <div className={`flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium mb-6 ${textSecondary}`}>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <User size={14} className="text-blue-500" />
                      </div>
                      <span>
                        {announcement.author 
                          ? `${announcement.author.firstName} ${announcement.author.lastName}` 
                          : 'Instructor'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>{new Date(announcement.publishedAt || announcement.createdAt || '').toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      <span>{new Date(announcement.publishedAt || announcement.createdAt || '').toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit'
                      })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye size={16} />
                      <span>{announcement.viewCount ?? 0} views</span>
                    </div>
                  </div>

                  <div className={`text-base leading-relaxed whitespace-pre-wrap ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {announcement.content}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Announcements;
