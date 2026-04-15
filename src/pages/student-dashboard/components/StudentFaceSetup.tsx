import { useCallback, useEffect, useState } from 'react';
import { Camera, Loader2, Trash2, UserCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AttendanceService,
  type StudentFaceReference,
} from '../../../services/api/attendanceService';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

function errMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  return String(e);
}

export function StudentFaceSetup() {
  const { isRTL } = useLanguage();
  const { isDark, primaryHex } = useTheme() as { isDark: boolean; primaryHex?: string };
  const accent = primaryHex || '#3b82f6';

  const [refs, setRefs] = useState<StudentFaceReference[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await AttendanceService.listMyFaceReferences();
      setRefs(Array.isArray(list) ? list : []);
    } catch (e) {
      toast.error(errMessage(e));
      setRefs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onUpload = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      await AttendanceService.uploadMyFaceReference(file);
      toast.success(isRTL ? 'تم رفع الصورة' : 'Face photo uploaded.');
      await load();
    } catch (e) {
      toast.error(errMessage(e));
    } finally {
      setUploading(false);
    }
  };

  const onDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await AttendanceService.deleteMyFaceReference(id);
      toast.success(isRTL ? 'تم الحذف' : 'Photo removed.');
      await load();
    } catch (e) {
      toast.error(errMessage(e));
    } finally {
      setDeletingId(null);
    }
  };

  const muted = isDark ? 'text-slate-400' : 'text-slate-600';
  const card = isDark ? 'border-slate-600/80 bg-slate-900/50' : 'border-slate-200 bg-white';

  return (
    <div
      className={`glass rounded-[2.5rem] overflow-hidden border ${card}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="p-6 md:p-8">
        <div className="flex flex-wrap items-start gap-4 justify-between">
          <div className="flex items-start gap-3">
            <div
              className="rounded-2xl p-3 shrink-0"
              style={{ backgroundColor: `${accent}22` }}
            >
              <Camera className="size-7" style={{ color: accent }} aria-hidden />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {isRTL ? 'صورة الوجه للحضور بالذكاء الاصطناعي' : 'AI attendance face photo'}
              </h2>
              <p className={`text-sm mt-1 ${muted}`}>
                {isRTL
                  ? 'ارفع صورة واضحة لوجهك مرة واحدة؛ يستخدمها النظام لمطابقتك عند تسجيل الحضور بالكاميرا في المحاضرة.'
                  : 'Upload one clear front-facing photo. Instructors use it to match you when they run AI attendance from a class photo.'}
              </p>
            </div>
          </div>
          <label className="shrink-0">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              disabled={uploading || loading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = '';
                void onUpload(f);
              }}
            />
            <span
              className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white cursor-pointer hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: accent }}
            >
              {uploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : isRTL ? (
                'رفع صورة'
              ) : (
                'Upload photo'
              )}
            </span>
          </label>
        </div>

        <div className={`mt-6 pt-6 border-t ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="size-8 animate-spin" style={{ color: accent }} />
            </div>
          ) : refs.length === 0 ? (
            <div
              className={`flex flex-col items-center justify-center gap-2 py-10 rounded-2xl border border-dashed ${
                isDark ? 'border-slate-600 text-slate-500' : 'border-slate-200 text-slate-500'
              }`}
            >
              <UserCircle2 className="size-12 opacity-40" />
              <p className="text-sm font-medium">
                {isRTL ? 'لا توجد صورة بعد' : 'No photo on file yet'}
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {refs.map((r) => (
                <li
                  key={r.id}
                  className={`flex flex-wrap items-center gap-4 rounded-2xl border p-3 ${
                    isDark ? 'border-slate-700 bg-slate-950/40' : 'border-slate-100 bg-slate-50'
                  }`}
                >
                  <div className="size-16 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0">
                    {r.signedUrl ? (
                      <img
                        src={r.signedUrl}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="size-full flex items-center justify-center text-xs text-slate-500 p-1 text-center">
                        Preview unavailable
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      {r.isPrimary ? (isRTL ? 'الصورة الأساسية' : 'Primary') : '—'}
                    </p>
                    <p className={`text-xs ${muted}`}>
                      {(r.mimeType || '').replace('image/', '').toUpperCase()} ·{' '}
                      {r.fileSize ? `${Math.round(r.fileSize / 1024)} KB` : '—'}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={deletingId === r.id}
                    onClick={() => void onDelete(r.id)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium border transition-colors ${
                      isDark
                        ? 'border-red-900/80 text-red-300 hover:bg-red-950/50'
                        : 'border-red-200 text-red-700 hover:bg-red-50'
                    } disabled:opacity-40`}
                  >
                    {deletingId === r.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                    {isRTL ? 'حذف' : 'Remove'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
