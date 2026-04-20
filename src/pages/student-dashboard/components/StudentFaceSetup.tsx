import { useCallback, useEffect, useId, useState } from 'react';
import {
  Camera,
  FilterX,
  Info,
  Loader2,
  Plus,
  ScanFace,
  Sun,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  AttendanceService,
  type StudentFaceReference,
} from '../../../services/api/attendanceService';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';

function errMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  return String(e);
}

/** Keep in sync with server: EduVerse-Backend student-face-reference.service maxFileSize */
const MIN_FACE_FILE_SIZE_BYTES = 4 * 1024;
const MIN_FACE_SMALLEST_SIDE_PX = 200;
const MAX_FACE_FILE_SIZE_BYTES = 15 * 1024 * 1024;

/** Portrait preview: empty dropzone and uploaded photo share this footprint */
const PREVIEW_SLOT =
  'flex w-full max-w-[240px] flex-col rounded-2xl min-h-[288px] max-h-[360px] sm:min-h-[300px] sm:max-h-[380px]';

const loadImageDimensions = (file: File): Promise<{ width: number; height: number }> =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
      URL.revokeObjectURL(objectUrl);
    };
    image.onerror = () => {
      reject(new Error('Could not read image dimensions.'));
      URL.revokeObjectURL(objectUrl);
    };
    image.src = objectUrl;
  });

export function StudentFaceSetup() {
  const { isRTL, t } = useLanguage();
  const { isDark, primaryHex } = useTheme() as { isDark: boolean; primaryHex?: string };
  const accent = primaryHex || '#3b82f6';
  const fileInputId = useId();

  const [refs, setRefs] = useState<StudentFaceReference[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const hasPrimaryPhoto = refs.length > 0;
  const primaryRef = refs[0];

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
    if (hasPrimaryPhoto) {
      toast.error(
        isRTL
          ? 'يمكن رفع صورة واحدة فقط. احذف الصورة الحالية أولاً.'
          : 'Only one face photo is allowed. Remove the current one first.'
      );
      return;
    }

    if (file.size > MAX_FACE_FILE_SIZE_BYTES) {
      toast.error(
        isRTL
          ? 'حجم الصورة كبير جدًا. الحد الأقصى 15 ميجابايت.'
          : 'Image is too large. Maximum size is 15 MB.'
      );
      return;
    }

    if (file.size < MIN_FACE_FILE_SIZE_BYTES) {
      toast.error(
        isRTL
          ? 'الملف صغير جدًا وقد يكون تالفًا. جرّب صورة أخرى.'
          : 'This file is too small to be a usable photo. Try another image.'
      );
      return;
    }

    try {
      const { width, height } = await loadImageDimensions(file);
      const shortest = Math.min(width, height);
      if (shortest < MIN_FACE_SMALLEST_SIDE_PX) {
        toast.error(
          isRTL
            ? `الصورة ضيقة جدًا. يجب أن يكون أقصر جانب على الأقل ${MIN_FACE_SMALLEST_SIDE_PX} بكسل.`
            : `Image is too small. The shortest side should be at least ${MIN_FACE_SMALLEST_SIDE_PX} pixels.`
        );
        return;
      }
    } catch (error) {
      toast.error(errMessage(error));
      return;
    }

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
  const tipCardBase = `rounded-2xl border px-3 py-4 flex flex-col items-center text-center gap-2 ${
    isDark ? 'border-slate-600/80 bg-slate-950/35' : 'border-slate-100 bg-slate-50/90'
  }`;

  const tips = [
    { id: 'lighting', Icon: Sun, text: t('facePhotoTipLighting') },
    { id: 'framing', Icon: ScanFace, text: t('facePhotoTipFraming') },
    { id: 'filters', Icon: FilterX, text: t('facePhotoTipFilters') },
  ];

  const sampleMatClass = isDark
    ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 ring-2 ring-dashed ring-slate-500/70'
    : 'bg-gradient-to-br from-slate-100 to-slate-200/80 ring-2 ring-dashed ring-slate-300/90';

  const renderSampleInner = (compact: boolean) => (
    <div
      className={`relative w-full rounded-2xl p-2 shadow-inner ${sampleMatClass} ${
        compact ? 'max-w-[8.5rem]' : ''
      }`}
    >
      <span
        className={`absolute top-1.5 z-10 rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
          isRTL ? 'left-1.5' : 'right-1.5'
        } ${isDark ? 'border-slate-500 bg-slate-950/95 text-slate-200' : 'border-slate-200 bg-white/95 text-slate-600'}`}
      >
        {t('facePhotoSampleBadge')}
      </span>
      <div
        className={`relative flex items-center justify-center overflow-hidden rounded-lg ${
          isDark ? 'bg-slate-950/50' : 'bg-white/70'
        } ${compact ? 'min-h-[7rem] max-h-[9.5rem]' : 'min-h-[10rem] max-h-[14rem]'}`}
      >
        <div
          className="pointer-events-none absolute inset-0 z-[1] opacity-[0.07]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -12deg,
              transparent,
              transparent 10px,
              currentColor 10px,
              currentColor 11px
            )`,
          }}
          aria-hidden
        />
        <img
          src="/example-attendance-face.webp"
          alt=""
          className={`relative z-0 max-h-full w-full object-contain contrast-[0.96] saturate-[0.88] ${
            isDark ? 'opacity-90' : 'opacity-95'
          }`}
          loading="lazy"
          decoding="async"
        />
      </div>
    </div>
  );

  return (
    <div
      className={`glass rounded-[2.5rem] overflow-hidden border ${card}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="p-6 md:p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
          <div className="flex min-w-0 flex-1 flex-col gap-5">
            <div className="flex items-start gap-3">
              <div
                className="rounded-2xl p-3 shrink-0"
                style={{ backgroundColor: `${accent}22` }}
              >
                <Camera className="size-7" style={{ color: accent }} aria-hidden />
              </div>
              <div className="min-w-0 space-y-2.5">
                <h2 className={`text-lg font-semibold leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {t('facePhotoSectionTitle')}
                </h2>
                <p className={`text-sm leading-loose ${muted}`}>{t('facePhotoSectionSubtitle')}</p>
                <p className={`text-sm leading-loose ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {t('facePhotoSectionHint')}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {tips.map(({ id, Icon, text }) => (
                <div key={id} className={tipCardBase}>
                  <div
                    className="flex size-11 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${accent}18`, color: accent }}
                  >
                    <Icon className="size-5" strokeWidth={2} aria-hidden />
                  </div>
                  <p className={`text-xs font-semibold leading-tight ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div
            className={`flex w-full shrink-0 flex-col gap-3 lg:w-auto lg:max-w-[min(100%,360px)] ${
              isRTL ? 'lg:items-start' : 'lg:items-end'
            }`}
          >
            <input
              id={fileInputId}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              disabled={uploading || loading || hasPrimaryPhoto}
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = '';
                void onUpload(f);
              }}
            />

            {!hasPrimaryPhoto ? (
              <div className="flex w-full flex-col items-stretch gap-5 sm:flex-row sm:items-end sm:justify-end">
                <div className="flex w-full max-w-[8.75rem] flex-col gap-1.5 self-center sm:self-end">
                  <p
                    className={`text-[10px] font-semibold uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                  >
                    {t('facePhotoGoodExampleLabel')}
                  </p>
                  {renderSampleInner(true)}
                  <p className={`text-[10px] leading-snug ${muted}`}>{t('facePhotoGoodExampleCaption')}</p>
                </div>

                <label
                  htmlFor={fileInputId}
                  className={`${PREVIEW_SLOT} cursor-pointer border-2 border-dashed transition-colors hover:border-opacity-80 ${
                    isDark
                      ? 'border-slate-500 bg-slate-950/35 hover:bg-slate-900/50'
                      : 'border-slate-300 bg-slate-50/90 hover:bg-slate-100/90'
                  } ${uploading || loading ? 'pointer-events-none opacity-60' : ''} items-center justify-center gap-3 px-4 py-6 text-center self-center sm:self-end`}
                >
                  {uploading ? (
                    <Loader2 className="size-10 animate-spin" style={{ color: accent }} />
                  ) : (
                    <>
                      <div
                        className="flex size-14 items-center justify-center rounded-2xl"
                        style={{ backgroundColor: `${accent}22`, color: accent }}
                      >
                        <Plus className="size-7 stroke-[2.5]" aria-hidden />
                      </div>
                      <div className="space-y-1">
                        <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {t('facePhotoDropzoneTitle')}
                        </p>
                        <p className={`text-xs leading-snug ${muted}`}>{t('facePhotoDropzoneHint')}</p>
                      </div>
                    </>
                  )}
                </label>
              </div>
            ) : (
              <div className="flex w-full flex-col gap-3 self-center sm:self-end">
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                        isDark
                          ? 'border-slate-600 text-slate-200 hover:bg-slate-800'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Info className="size-3.5 shrink-0 opacity-80" aria-hidden />
                      {t('facePhotoViewExample')}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    className={`w-[min(calc(100vw-2rem),20rem)] p-3 ${isDark ? 'border-slate-600 bg-slate-900 text-slate-100' : ''}`}
                    align={isRTL ? 'end' : 'start'}
                  >
                    <p className={`mb-2 text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      {t('facePhotoExampleInPopover')}
                    </p>
                    {renderSampleInner(false)}
                    <p className={`mt-2 text-[11px] leading-snug ${muted}`}>{t('facePhotoGoodExampleCaption')}</p>
                  </PopoverContent>
                </Popover>

                <div
                  className={`${PREVIEW_SLOT} border-2 border-solid ${
                    isDark ? 'border-slate-600 bg-slate-950/50' : 'border-slate-200 bg-slate-50'
                  } items-center justify-center overflow-hidden p-1`}
                >
                  {primaryRef?.signedUrl ? (
                    <img
                      src={primaryRef.signedUrl}
                      alt=""
                      className="max-h-full w-auto max-w-full object-contain"
                    />
                  ) : (
                    <p className={`px-2 text-center text-xs ${muted}`}>
                      {isRTL ? 'المعاينة غير متاحة' : 'Preview unavailable'}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className={`mt-8 flex justify-center border-t pt-8 ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
            <Loader2 className="size-8 animate-spin" style={{ color: accent }} />
          </div>
        ) : hasPrimaryPhoto && primaryRef ? (
          <div
            className={`mt-8 flex flex-wrap items-center justify-between gap-3 border-t pt-6 ${isDark ? 'border-white/10' : 'border-slate-100'}`}
          >
            <div className="min-w-0">
              <p className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                {isRTL ? 'الصورة الأساسية' : 'Primary'}
              </p>
              <p className={`text-xs ${muted}`}>
                {(primaryRef.mimeType || '').replace('image/', '').toUpperCase()} ·{' '}
                {primaryRef.fileSize ? `${Math.round(primaryRef.fileSize / 1024)} KB` : '—'}
              </p>
            </div>
            <button
              type="button"
              disabled={deletingId === primaryRef.id}
              onClick={() => void onDelete(primaryRef.id)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium border transition-colors ${
                isDark
                  ? 'border-red-900/80 text-red-300 hover:bg-red-950/50'
                  : 'border-red-200 text-red-700 hover:bg-red-50'
              } disabled:opacity-40`}
            >
              {deletingId === primaryRef.id ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              {isRTL ? 'حذف' : 'Remove'}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
