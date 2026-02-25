import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Upload,
  FileText,
  Video,
  Presentation,
  Table,
  Search,
  X,
  RotateCcw,
  Trash2,
  Edit,
  Download,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader,
  XCircle,
  CloudUpload,
  FolderOpen,
} from 'lucide-react';

const uploadQueue = [
  { id: 1, name: 'Lecture_Notes_Week5.pdf', size: '2.5 MB', status: 'completed', progress: 100, course: 'CS101' },
  { id: 2, name: 'Assignment_Template.docx', size: '156 KB', status: 'uploading', progress: 65, course: 'CS201' },
  { id: 3, name: 'Lab_Instructions.pdf', size: '1.8 MB', status: 'processing', progress: 100, course: 'CS301' },
  { id: 4, name: 'Video_Tutorial_Part2.mp4', size: '245 MB', status: 'pending', progress: 0, course: 'CS101' },
  { id: 5, name: 'Midterm_Review.pptx', size: '8.2 MB', status: 'failed', progress: 45, course: 'CS201' },
];

const materialsLibrary = [
  { id: 1, name: 'Course Syllabus', type: 'document', size: '256 KB', course: 'CS101', module: 'General', visibility: true, downloads: 45, date: 'Feb 1, 2026', tags: ['syllabus', 'important'] },
  { id: 2, name: 'Lecture 1 - Introduction', type: 'video', size: '125 MB', course: 'CS101', module: 'Week 1', visibility: true, downloads: 32, date: 'Feb 3, 2026', tags: ['lecture'] },
  { id: 3, name: 'Week 1 Slides', type: 'presentation', size: '4.5 MB', course: 'CS101', module: 'Week 1', visibility: true, downloads: 28, date: 'Feb 3, 2026', tags: ['slides'] },
  { id: 4, name: 'Programming Exercise Dataset', type: 'spreadsheet', size: '890 KB', course: 'CS201', module: 'Week 1', visibility: false, downloads: 0, date: 'Feb 5, 2026', tags: ['exercise'] },
  { id: 5, name: 'Data Structures Overview', type: 'document', size: '1.2 MB', course: 'CS201', module: 'Week 2', visibility: true, downloads: 56, date: 'Feb 8, 2026', tags: ['notes'] },
  { id: 6, name: 'Sorting Algorithms Demo', type: 'video', size: '89 MB', course: 'CS201', module: 'Week 3', visibility: true, downloads: 41, date: 'Feb 10, 2026', tags: ['demo'] },
  { id: 7, name: 'ER Diagram Tutorial', type: 'presentation', size: '3.2 MB', course: 'CS301', module: 'Week 1', visibility: true, downloads: 18, date: 'Feb 12, 2026', tags: ['tutorial'] },
  { id: 8, name: 'SQL Practice Problems', type: 'document', size: '450 KB', course: 'CS301', module: 'Week 2', visibility: true, downloads: 23, date: 'Feb 14, 2026', tags: ['practice'] },
];

const courseOptions = [
  { value: 'all', label: 'All Courses' },
  { value: 'CS101', label: 'CS101 - Intro to CS' },
  { value: 'CS201', label: 'CS201 - Data Structures' },
  { value: 'CS301', label: 'CS301 - Database Systems' },
];

const moduleOptions: Record<string, string[]> = {
  CS101: ['General', 'Week 1', 'Week 2', 'Week 3'],
  CS201: ['General', 'Week 1', 'Week 2', 'Week 3'],
  CS301: ['General', 'Week 1', 'Week 2', 'Week 3'],
};

const typeFilters = ['All', 'Documents', 'Videos', 'Presentations', 'Spreadsheets'];

const typeToFilter: Record<string, string> = {
  document: 'Documents',
  video: 'Videos',
  presentation: 'Presentations',
  spreadsheet: 'Spreadsheets',
};

function getFileTypeIcon(type: string, size = 20) {
  switch (type) {
    case 'video':
      return <Video size={size} className="text-red-500" />;
    case 'presentation':
      return <Presentation size={size} className="text-amber-500" />;
    case 'spreadsheet':
      return <Table size={size} className="text-green-500" />;
    default:
      return <FileText size={size} className="text-blue-500" />;
  }
}

function getFileTypeFromName(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase();
  if (['mp4', 'avi', 'mov', 'mkv'].includes(ext || '')) return 'video';
  if (['pptx', 'ppt'].includes(ext || '')) return 'presentation';
  if (['xlsx', 'xls', 'csv'].includes(ext || '')) return 'spreadsheet';
  return 'document';
}

function StatusBadge({ status, isDark }: { status: string; isDark: boolean }) {
  const config: Record<string, { bg: string; text: string; icon: JSX.Element; label: string }> = {
    completed: {
      bg: isDark ? 'bg-green-500/20' : 'bg-green-100',
      text: isDark ? 'text-green-300' : 'text-green-700',
      icon: <CheckCircle size={14} />,
      label: 'Completed',
    },
    uploading: {
      bg: isDark ? 'bg-blue-500/20' : 'bg-blue-100',
      text: isDark ? 'text-blue-300' : 'text-blue-700',
      icon: <Loader size={14} className="animate-spin" />,
      label: 'Uploading',
    },
    processing: {
      bg: isDark ? 'bg-amber-500/20' : 'bg-amber-100',
      text: isDark ? 'text-amber-300' : 'text-amber-700',
      icon: <Loader size={14} className="animate-spin" />,
      label: 'Processing',
    },
    pending: {
      bg: isDark ? 'bg-gray-500/20' : 'bg-gray-100',
      text: isDark ? 'text-gray-300' : 'text-gray-700',
      icon: <Clock size={14} />,
      label: 'Pending',
    },
    failed: {
      bg: isDark ? 'bg-red-500/20' : 'bg-red-100',
      text: isDark ? 'text-red-300' : 'text-red-700',
      icon: <XCircle size={14} />,
      label: 'Failed',
    },
  };

  const c = config[status] || config.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      {c.icon}
      {c.label}
    </span>
  );
}

export function UploadMaterialsPage() {
  const { isDark } = useTheme();
  const { isRTL } = useLanguage();

  const [activeTab, setActiveTab] = useState<'queue' | 'library'>('queue');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<typeof materialsLibrary[0] | null>(null);

  // Library filters
  const [courseFilter, setCourseFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Upload modal state
  const [uploadCourse, setUploadCourse] = useState('CS101');
  const [uploadModule, setUploadModule] = useState('General');

  // Edit modal state
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editModule, setEditModule] = useState('');
  const [editTags, setEditTags] = useState('');

  // Visibility toggles
  const [visibilityState, setVisibilityState] = useState<Record<number, boolean>>(
    Object.fromEntries(materialsLibrary.map((m) => [m.id, m.visibility]))
  );

  const filteredMaterials = materialsLibrary.filter((m) => {
    if (courseFilter !== 'all' && m.course !== courseFilter) return false;
    if (typeFilter !== 'All' && typeToFilter[m.type] !== typeFilter) return false;
    if (searchQuery && !m.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const openEdit = (material: typeof materialsLibrary[0]) => {
    setSelectedMaterial(material);
    setEditName(material.name);
    setEditDescription('');
    setEditModule(material.module);
    setEditTags(material.tags.join(', '));
    setShowEditModal(true);
  };

  const openDelete = (material: typeof materialsLibrary[0]) => {
    setSelectedMaterial(material);
    setShowDeleteDialog(true);
  };

  const toggleVisibility = (id: number) => {
    setVisibilityState((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const tabs = [
    { key: 'queue' as const, label: 'Upload Queue', count: uploadQueue.length },
    { key: 'library' as const, label: 'Materials Library', count: materialsLibrary.length },
  ];

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-transparent' : 'bg-gray-50'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Upload size={28} />
              Upload Materials
            </h1>
            <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              Manage course materials and resources
            </p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Upload size={20} />
            Upload Files
          </button>
        </div>

        {/* Tab Navigation */}
        <div className={`flex items-center gap-2 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === tab.key
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : isDark
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  activeTab === tab.key
                    ? 'bg-indigo-100 text-indigo-700'
                    : isDark
                      ? 'bg-white/10 text-gray-400'
                      : 'bg-gray-100 text-gray-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Upload Queue Tab */}
        {activeTab === 'queue' && (
          <div className="space-y-4">
            {uploadQueue.map((item) => {
              const fileType = getFileTypeFromName(item.name);
              return (
                <div
                  key={item.id}
                  className={`rounded-xl p-4 border shadow-sm ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
                      {getFileTypeIcon(fileType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {item.name}
                        </span>
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{item.size}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-700'}`}>
                          {item.course}
                        </span>
                      </div>
                      {(item.status === 'uploading' || item.status === 'processing' || item.status === 'failed') && (
                        <div className="mt-2">
                          <div className={`w-full h-2 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                            <div
                              className={`h-2 rounded-full transition-all ${
                                item.status === 'failed'
                                  ? 'bg-red-500'
                                  : item.status === 'processing'
                                    ? 'bg-amber-500'
                                    : 'bg-indigo-600'
                              }`}
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                          <span className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {item.progress}%
                          </span>
                        </div>
                      )}
                    </div>
                    <StatusBadge status={item.status} isDark={isDark} />
                    <div className="flex items-center gap-2">
                      {(item.status === 'pending' || item.status === 'uploading') && (
                        <button className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`} title="Cancel">
                          <X size={16} />
                        </button>
                      )}
                      {item.status === 'failed' && (
                        <button className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-amber-400' : 'hover:bg-amber-50 text-amber-600'}`} title="Retry">
                          <RotateCcw size={16} />
                        </button>
                      )}
                      {item.status === 'completed' && (
                        <button className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`} title="Remove">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Materials Library Tab */}
        {activeTab === 'library' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className={`px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'border-gray-300 bg-white'}`}
              >
                {courseOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} className={isDark ? 'bg-gray-800' : ''}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2">
                {typeFilters.map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTypeFilter(tf)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      typeFilter === tf
                        ? 'bg-indigo-600 text-white'
                        : isDark
                          ? 'bg-white/5 text-gray-400 hover:bg-white/10'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
              <div className="relative flex-1 max-w-md">
                <Search
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search materials..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500' : 'border-gray-300 bg-white'}`}
                />
              </div>
            </div>

            {/* Materials List */}
            {filteredMaterials.length === 0 ? (
              <div className={`rounded-xl p-12 border text-center ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
                <FolderOpen size={48} className={`mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>No materials found</h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Try adjusting your filters or upload new materials.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMaterials.map((material) => (
                  <div
                    key={material.id}
                    className={`rounded-xl p-4 border shadow-sm ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
                        {getFileTypeIcon(material.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {material.name}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-700'}`}>
                            {material.course}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isDark ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                            {material.module}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {material.tags.map((tag) => (
                            <span
                              key={tag}
                              className={`px-2 py-0.5 rounded text-xs ${isDark ? 'bg-white/5 text-gray-400' : 'bg-gray-50 text-gray-500'}`}
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                        <div className={`flex items-center gap-4 mt-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <span>{material.size}</span>
                          <span className="flex items-center gap-1">
                            <Download size={12} />
                            {material.downloads} downloads
                          </span>
                          <span>{material.date}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleVisibility(material.id)}
                          className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                          title={visibilityState[material.id] ? 'Visible to students' : 'Hidden from students'}
                        >
                          {visibilityState[material.id] ? (
                            <Eye size={16} className="text-green-500" />
                          ) : (
                            <EyeOff size={16} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
                          )}
                        </button>
                        <button
                          onClick={() => openEdit(material)}
                          className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => openDelete(material)}
                          className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-red-400' : 'hover:bg-red-50 text-red-500'}`}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button
                          className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                          title="Download"
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className={`w-full max-w-lg rounded-xl p-6 shadow-xl ${isDark ? 'bg-gray-800 border border-white/10' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Upload Materials</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Course</label>
                <select
                  value={uploadCourse}
                  onChange={(e) => {
                    setUploadCourse(e.target.value);
                    setUploadModule(moduleOptions[e.target.value]?.[0] || 'General');
                  }}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'border-gray-300 bg-white'}`}
                >
                  {courseOptions.filter((o) => o.value !== 'all').map((opt) => (
                    <option key={opt.value} value={opt.value} className={isDark ? 'bg-gray-800' : ''}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Module</label>
                <select
                  value={uploadModule}
                  onChange={(e) => setUploadModule(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'border-gray-300 bg-white'}`}
                >
                  {(moduleOptions[uploadCourse] || ['General']).map((mod) => (
                    <option key={mod} value={mod} className={isDark ? 'bg-gray-800' : ''}>
                      {mod}
                    </option>
                  ))}
                </select>
              </div>
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center ${isDark ? 'border-white/20 hover:border-indigo-500/50' : 'border-gray-300 hover:border-indigo-400'} transition-colors cursor-pointer`}
              >
                <CloudUpload size={40} className={`mx-auto mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-700'}`}>
                  Drag & drop files here
                </p>
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  or <span className="text-indigo-600 hover:underline">browse files</span>
                </p>
                <p className={`text-xs mt-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Supported: PDF, DOCX, PPTX, XLSX, MP4, AVI, MOV (max 500 MB)
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isDark ? 'text-gray-300 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                Close
              </button>
              <button className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Material Modal */}
      {showEditModal && selectedMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className={`w-full max-w-lg rounded-xl p-6 shadow-xl ${isDark ? 'bg-gray-800 border border-white/10' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Edit Material</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Material Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'border-gray-300 bg-white'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none ${isDark ? 'bg-white/5 border-white/10 text-white' : 'border-gray-300 bg-white'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Module</label>
                <select
                  value={editModule}
                  onChange={(e) => setEditModule(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'border-gray-300 bg-white'}`}
                >
                  {(moduleOptions[selectedMaterial.course] || ['General']).map((mod) => (
                    <option key={mod} value={mod} className={isDark ? 'bg-gray-800' : ''}>
                      {mod}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Tags</label>
                <input
                  type="text"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  placeholder="Comma-separated tags"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500' : 'border-gray-300 bg-white'}`}
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isDark ? 'text-gray-300 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                Cancel
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && selectedMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className={`w-full max-w-sm rounded-xl p-6 shadow-xl ${isDark ? 'bg-gray-800 border border-white/10' : 'bg-white'}`}>
            <div className="text-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-red-500/20' : 'bg-red-100'}`}>
                <AlertTriangle size={24} className="text-red-500" />
              </div>
              <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Delete Material?</h3>
              <p className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                This action cannot be undone. The following material will be permanently deleted:
              </p>
              <p className={`text-sm font-medium mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {selectedMaterial.name}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isDark ? 'text-gray-300 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                Cancel
              </button>
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UploadMaterialsPage;
