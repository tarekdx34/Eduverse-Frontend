import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  FolderOpen,
  LayoutGrid,
  List,
  Upload,
  Search,
  MoreVertical,
  FileText,
  Video,
  Image,
  Music,
  Download,
  Trash2,
  Share2,
  Pen,
  X,
  CloudUpload,
  HardDrive,
  ChevronDown,
} from 'lucide-react';

interface FileItem {
  id: number;
  name: string;
  type: string;
  size: string;
  date: string;
  icon: string;
  color: string;
}

const mockFiles: FileItem[] = [
  { id: 1, name: 'Database_Notes.pdf', type: 'document', size: '2.4 MB', date: 'Feb 20, 2026', icon: 'FileText', color: '#EF4444' },
  { id: 2, name: 'Lecture_Recording.mp4', type: 'video', size: '156 MB', date: 'Feb 19, 2026', icon: 'Video', color: '#7C3AED' },
  { id: 3, name: 'Algorithm_Diagram.png', type: 'image', size: '1.8 MB', date: 'Feb 18, 2026', icon: 'Image', color: '#10B981' },
  { id: 4, name: 'Project_Report.docx', type: 'document', size: '4.2 MB', date: 'Feb 17, 2026', icon: 'FileText', color: '#3B82F6' },
  { id: 5, name: 'Study_Notes.pdf', type: 'document', size: '1.1 MB', date: 'Feb 16, 2026', icon: 'FileText', color: '#EF4444' },
  { id: 6, name: 'Presentation.pptx', type: 'document', size: '8.5 MB', date: 'Feb 15, 2026', icon: 'FileText', color: '#F59E0B' },
  { id: 7, name: 'Lab_Screenshot.jpg', type: 'image', size: '3.2 MB', date: 'Feb 14, 2026', icon: 'Image', color: '#10B981' },
  { id: 8, name: 'Interview_Prep.mp3', type: 'audio', size: '12.4 MB', date: 'Feb 13, 2026', icon: 'Music', color: '#F59E0B' },
  { id: 9, name: 'Research_Paper.pdf', type: 'document', size: '5.6 MB', date: 'Feb 12, 2026', icon: 'FileText', color: '#EF4444' },
  { id: 10, name: 'Tutorial_Video.mp4', type: 'video', size: '245 MB', date: 'Feb 11, 2026', icon: 'Video', color: '#7C3AED' },
  { id: 11, name: 'Class_Photo.png', type: 'image', size: '4.1 MB', date: 'Feb 10, 2026', icon: 'Image', color: '#10B981' },
  { id: 12, name: 'Podcast_Episode.mp3', type: 'audio', size: '18.7 MB', date: 'Feb 9, 2026', icon: 'Music', color: '#F59E0B' },
];

const filterChips = ['All', 'Documents', 'Images', 'Videos', 'Audio'];
const sortOptions = ['Name', 'Date', 'Size', 'Type'];

const iconMap: Record<string, React.ElementType> = {
  FileText,
  Video,
  Image,
  Music,
};

export const MyFiles = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Date');
  const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set());
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const filteredFiles = mockFiles
    .filter((file) => {
      if (activeFilter !== 'All') {
        const filterMap: Record<string, string> = {
          Documents: 'document',
          Images: 'image',
          Videos: 'video',
          Audio: 'audio',
        };
        if (file.type !== filterMap[activeFilter]) return false;
      }
      if (searchQuery) {
        return file.name.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'Name':
          return a.name.localeCompare(b.name);
        case 'Size':
          return parseFloat(a.size) - parseFloat(b.size);
        case 'Type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

  const toggleFileSelect = (id: number) => {
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleFileClick = (file: FileItem) => {
    setSelectedFile(file);
    setShowDetailsModal(true);
  };

  const renderFileIcon = (file: FileItem, size = 24) => {
    const IconComponent = iconMap[file.icon] || FileText;
    return <IconComponent size={size} style={{ color: file.color }} />;
  };

  const cardClass = isDark ? 'bg-card-dark border border-white/5' : 'glass border border-slate-100';
  const textPrimary = isDark ? 'text-white' : 'text-slate-800';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-500';
  const inputBg = isDark ? 'bg-white/5 border-white/10 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold flex items-center gap-3 ${textPrimary}`}>
            <div className="p-2 rounded-xl bg-[#7C3AED]/10">
              <FolderOpen size={24} className="text-[#7C3AED]" />
            </div>
            {t('myFiles') || 'My Files'}
          </h1>
          <p className={`mt-1 ${textSecondary}`}>{t('manageDocuments') || 'Manage your documents and media'}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className={`flex items-center rounded-xl p-1 ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#7C3AED] text-white' : textSecondary}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#7C3AED] text-white' : textSecondary}`}
            >
              <List size={18} />
            </button>
          </div>
          {/* Upload Button */}
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all"
          >
            <Upload size={18} />
            {t('upload') || 'Upload'}
          </button>
        </div>
      </div>

      {/* Storage Overview */}
      <div className="rounded-[2.5rem] bg-gradient-to-br from-[#7C3AED] via-purple-600 to-indigo-700 p-6 text-white">
        <div className="flex items-center gap-2 mb-4">
          <HardDrive size={20} />
          <h2 className="text-lg font-semibold">{t('storage') || 'Storage'}</h2>
        </div>
        <div className="flex items-end gap-2 mb-3">
          <span className="text-3xl font-bold">2.4 GB</span>
          <span className="text-white/70 mb-1">/ 5.0 GB</span>
        </div>
        <div className="w-full h-3 rounded-full bg-white/20 mb-2">
          <div className="h-full rounded-full bg-white" style={{ width: '48%' }} />
        </div>
        <p className="text-sm text-white/70 mb-4">48% Used</p>
        <div className="flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-300" />
            <span className="text-white/80">Documents</span>
            <span className="font-semibold">1.2 GB</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-300" />
            <span className="text-white/80">Media</span>
            <span className="font-semibold">0.8 GB</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-300" />
            <span className="text-white/80">Other</span>
            <span className="font-semibold">0.4 GB</span>
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-2">
        {filterChips.map((chip) => (
          <button
            key={chip}
            onClick={() => setActiveFilter(chip)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeFilter === chip
                ? 'bg-[#7C3AED] text-white'
                : isDark
                  ? 'bg-white/5 text-slate-400 hover:bg-white/10'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Search & Sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textSecondary}`} />
          <input
            type="text"
            placeholder={t('searchFiles') || 'Search files...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none transition-all focus:ring-2 focus:ring-[#7C3AED]/40 ${inputBg}`}
          />
        </div>
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={`appearance-none pl-4 pr-10 py-2.5 rounded-xl border outline-none cursor-pointer transition-all focus:ring-2 focus:ring-[#7C3AED]/40 ${inputBg}`}
          >
            {sortOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${textSecondary}`} />
        </div>
      </div>

      {/* Multi-Select Bar */}
      {selectedFiles.size > 0 && (
        <div className={`flex items-center justify-between rounded-xl p-4 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-slate-50 border border-slate-200'}`}>
          <span className={`text-sm font-medium ${textPrimary}`}>{selectedFiles.size} file{selectedFiles.size > 1 ? 's' : ''} selected</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedFiles(new Set())}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isDark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setSelectedFiles(new Set());
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
            >
              <Trash2 size={16} />
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Files Content */}
      {filteredFiles.length === 0 ? (
        /* Empty State */
        <div className={`${cardClass} rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center`}>
          <div className={`p-6 rounded-2xl mb-4 ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
            <FolderOpen size={48} className={textSecondary} />
          </div>
          <h3 className={`text-lg font-semibold mb-2 ${textPrimary}`}>No files yet</h3>
          <p className={`mb-6 ${textSecondary}`}>Upload files to get started</p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#7C3AED] to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all"
          >
            <Upload size={18} />
            Upload Files
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className={`group ${cardClass} rounded-[2.5rem] p-5 cursor-pointer hover:shadow-lg transition-all relative`}
              onClick={() => handleFileClick(file)}
            >
              {/* Checkbox */}
              <div
                className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFileSelect(file.id);
                }}
              >
                <div
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                    selectedFiles.has(file.id)
                      ? 'bg-[#7C3AED] border-[#7C3AED] text-white'
                      : isDark
                        ? 'border-white/20 hover:border-white/40'
                        : 'border-slate-300 hover:border-slate-400'
                  }`}
                  style={{ opacity: selectedFiles.has(file.id) ? 1 : undefined }}
                >
                  {selectedFiles.has(file.id) && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>

              {/* More Options */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === file.id ? null : file.id);
                  }}
                  className={`p-1.5 rounded-lg transition-all ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}
                >
                  <MoreVertical size={16} className={textSecondary} />
                </button>
                {openMenuId === file.id && (
                  <div className={`absolute right-0 mt-1 w-36 rounded-xl shadow-xl z-10 py-1 ${isDark ? 'bg-slate-800 border border-white/10' : 'bg-white border border-slate-200'}`}>
                    {[
                      { label: 'Download', icon: Download },
                      { label: 'Rename', icon: Pen },
                      { label: 'Delete', icon: Trash2, danger: true },
                    ].map((action) => (
                      <button
                        key={action.label}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(null);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-all ${
                          action.danger
                            ? 'text-red-500 hover:bg-red-500/10'
                            : isDark
                              ? 'text-slate-300 hover:bg-white/5'
                              : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <action.icon size={14} />
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* File Icon */}
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                {renderFileIcon(file, 28)}
              </div>

              {/* File Info */}
              <h3 className={`font-semibold truncate mb-1 ${textPrimary}`}>{file.name}</h3>
              <p className={`text-sm ${textSecondary}`}>{file.size}</p>
              <div className="flex items-center justify-between mt-3">
                <span className={`text-xs ${textSecondary}`}>{file.date}</span>
                <span
                  className="text-xs font-medium px-2.5 py-1 rounded-lg capitalize"
                  style={{
                    backgroundColor: `${file.color}15`,
                    color: file.color,
                  }}
                >
                  {file.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className={`${cardClass} rounded-[2.5rem] overflow-hidden`}>
          {/* List Header */}
          <div className={`grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold uppercase tracking-wider ${isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
            <div className="col-span-1" />
            <div className="col-span-4">Name</div>
            <div className="col-span-2">Size</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-1" />
          </div>
          {/* List Items */}
          {filteredFiles.map((file, index) => (
            <div
              key={file.id}
              onClick={() => handleFileClick(file)}
              className={`group grid grid-cols-12 gap-4 items-center px-6 py-4 cursor-pointer transition-all ${
                isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
              } ${index < filteredFiles.length - 1 ? (isDark ? 'border-b border-white/5' : 'border-b border-slate-100') : ''}`}
            >
              {/* Checkbox & Icon */}
              <div className="col-span-1 flex items-center gap-2">
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFileSelect(file.id);
                  }}
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer ${
                    selectedFiles.has(file.id)
                      ? 'bg-[#7C3AED] border-[#7C3AED] text-white'
                      : isDark
                        ? 'border-white/20 hover:border-white/40'
                        : 'border-slate-300 hover:border-slate-400'
                  }`}
                >
                  {selectedFiles.has(file.id) && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>
              {/* Name */}
              <div className="col-span-4 flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  {renderFileIcon(file, 18)}
                </div>
                <span className={`font-medium truncate ${textPrimary}`}>{file.name}</span>
              </div>
              {/* Size */}
              <div className={`col-span-2 text-sm ${textSecondary}`}>{file.size}</div>
              {/* Date */}
              <div className={`col-span-2 text-sm ${textSecondary}`}>{file.date}</div>
              {/* Type */}
              <div className="col-span-2">
                <span
                  className="text-xs font-medium px-2.5 py-1 rounded-lg capitalize"
                  style={{
                    backgroundColor: `${file.color}15`,
                    color: file.color,
                  }}
                >
                  {file.type}
                </span>
              </div>
              {/* Actions */}
              <div className="col-span-1 flex justify-end relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === file.id ? null : file.id);
                  }}
                  className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}
                >
                  <MoreVertical size={16} className={textSecondary} />
                </button>
                {openMenuId === file.id && (
                  <div className={`absolute right-0 top-8 w-36 rounded-xl shadow-xl z-10 py-1 ${isDark ? 'bg-slate-800 border border-white/10' : 'bg-white border border-slate-200'}`}>
                    {[
                      { label: 'Download', icon: Download },
                      { label: 'Rename', icon: Pen },
                      { label: 'Delete', icon: Trash2, danger: true },
                    ].map((action) => (
                      <button
                        key={action.label}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(null);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-all ${
                          action.danger
                            ? 'text-red-500 hover:bg-red-500/10'
                            : isDark
                              ? 'text-slate-300 hover:bg-white/5'
                              : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <action.icon size={14} />
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className={`w-full max-w-lg rounded-[2rem] p-6 ${isDark ? 'bg-slate-900 border border-white/10' : 'bg-white border border-slate-200'}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${textPrimary}`}>Upload Files</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className={`p-2 rounded-xl transition-all ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}
              >
                <X size={20} className={textSecondary} />
              </button>
            </div>
            <div
              className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all ${
                isDark ? 'border-white/10 hover:border-[#7C3AED]/50' : 'border-slate-200 hover:border-[#7C3AED]/50'
              }`}
            >
              <div className="p-4 rounded-2xl bg-[#7C3AED]/10 mb-4">
                <CloudUpload size={40} className="text-[#7C3AED]" />
              </div>
              <p className={`font-semibold mb-1 ${textPrimary}`}>Drag & drop files here</p>
              <p className={`text-sm ${textSecondary}`}>or browse files</p>
            </div>
            <div className={`mt-4 space-y-1 text-sm ${textSecondary}`}>
              <p>Supports PDF, DOCX, PNG, JPG, MP4, MP3</p>
              <p>Max 50 MB per file</p>
            </div>
          </div>
        </div>
      )}

      {/* File Details Modal */}
      {showDetailsModal && selectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md rounded-[2rem] p-6 ${isDark ? 'bg-slate-900 border border-white/10' : 'bg-white border border-slate-200'}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${textPrimary}`}>File Details</h2>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedFile(null);
                }}
                className={`p-2 rounded-xl transition-all ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}
              >
                <X size={20} className={textSecondary} />
              </button>
            </div>
            {/* File Icon & Name */}
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                {renderFileIcon(selectedFile, 32)}
              </div>
              <div>
                <h3 className={`font-semibold ${textPrimary}`}>{selectedFile.name}</h3>
                <span
                  className="text-xs font-medium px-2.5 py-1 rounded-lg capitalize mt-1 inline-block"
                  style={{
                    backgroundColor: `${selectedFile.color}15`,
                    color: selectedFile.color,
                  }}
                >
                  {selectedFile.type}
                </span>
              </div>
            </div>
            {/* Details */}
            <div className={`space-y-3 mb-6 ${textSecondary}`}>
              {[
                { label: 'Size', value: selectedFile.size },
                { label: 'Uploaded', value: selectedFile.date },
                { label: 'Type', value: selectedFile.type.charAt(0).toUpperCase() + selectedFile.type.slice(1) },
                { label: 'Last Modified', value: selectedFile.date },
              ].map((detail) => (
                <div key={detail.label} className="flex justify-between text-sm">
                  <span>{detail.label}</span>
                  <span className={textPrimary}>{detail.value}</span>
                </div>
              ))}
            </div>
            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-all">
                <Download size={16} />
                Download
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-all">
                <Share2 size={16} />
                Share
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-all">
                <Pen size={16} />
                Rename
              </button>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedFile(null);
                }}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
