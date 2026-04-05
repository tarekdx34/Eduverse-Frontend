import React, { useState } from 'react';
import {
  Upload,
  FileText,
  Film,
  Code,
  Image,
  Archive,
  Sparkles,
  Search,
  Trash2,
  Eye,
  Download,
  Cloud,
  X,
  Plus,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { CleanSelect } from '../../../components/shared';

type FileType = 'All' | 'PDF' | 'Video' | 'Code' | 'Image' | 'Archive' | 'AI Generated';
type SortOption = 'Recent' | 'By Name' | 'By Size';

type Material = {
  id: string;
  name: string;
  size: string;
  date: string;
  uploadedBy: string;
  type: 'PDF' | 'Video' | 'Code' | 'Image' | 'Archive';
  aiGenerated: boolean;
};

const MOCK_MATERIALS: Material[] = [
  {
    id: 'm1',
    name: 'Lab_3_Instructions.pdf',
    size: '2.4 MB',
    date: 'Jan 15, 2024',
    uploadedBy: 'Dr. Smith',
    type: 'PDF',
    aiGenerated: false,
  },
  {
    id: 'm2',
    name: 'Synchronization_Demo.mp4',
    size: '145 MB',
    date: 'Jan 14, 2024',
    uploadedBy: 'TA Assistant',
    type: 'Video',
    aiGenerated: false,
  },
  {
    id: 'm3',
    name: 'semaphore_examples.cpp',
    size: '8.2 KB',
    date: 'Jan 13, 2024',
    uploadedBy: 'Dr. Smith',
    type: 'Code',
    aiGenerated: false,
  },
  {
    id: 'm4',
    name: 'AI_Study_Guide_Lab3.pdf',
    size: '1.8 MB',
    date: 'Jan 12, 2024',
    uploadedBy: 'AI Generated',
    type: 'PDF',
    aiGenerated: true,
  },
  {
    id: 'm5',
    name: 'process_diagram.png',
    size: '420 KB',
    date: 'Jan 11, 2024',
    uploadedBy: 'TA Assistant',
    type: 'Image',
    aiGenerated: false,
  },
  {
    id: 'm6',
    name: 'lab_resources.zip',
    size: '12.5 MB',
    date: 'Jan 10, 2024',
    uploadedBy: 'Dr. Smith',
    type: 'Archive',
    aiGenerated: false,
  },
];

const FILE_TYPE_FILTERS: FileType[] = ['All', 'PDF', 'Video', 'Code', 'AI Generated'];

function getFileIcon(type: Material['type']) {
  switch (type) {
    case 'PDF':
      return <FileText className="w-5 h-5 text-red-400" />;
    case 'Video':
      return <Film className="w-5 h-5 text-blue-400" />;
    case 'Code':
      return <Code className="w-5 h-5 text-green-400" />;
    case 'Image':
      return <Image className="w-5 h-5 text-blue-400" />;
    case 'Archive':
      return <Archive className="w-5 h-5 text-yellow-400" />;
  }
}

function parseSizeToBytes(size: string): number {
  const num = parseFloat(size);
  if (size.includes('MB')) return num * 1024 * 1024;
  if (size.includes('KB')) return num * 1024;
  return num;
}

export function UploadMaterialsPage() {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const [selectedCourse, setSelectedCourse] = useState('CS101');
  const [selectedLab, setSelectedLab] = useState('Lab 1');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FileType>('All');
  const [sortOption, setSortOption] = useState<SortOption>('Recent');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileType, setUploadFileType] = useState<Material['type']>('PDF');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [materials, setMaterials] = useState<Material[]>(MOCK_MATERIALS);

  const filteredMaterials = materials
    .filter((m) => {
      if (activeFilter === 'AI Generated') return m.aiGenerated;
      if (activeFilter !== 'All') return m.type === activeFilter;
      return true;
    })
    .filter((m) => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortOption === 'By Name') return a.name.localeCompare(b.name);
      if (sortOption === 'By Size') return parseSizeToBytes(b.size) - parseSizeToBytes(a.size);
      return 0; // Recent keeps original order
    });

  const handleDelete = (id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
    setDeleteConfirmId(null);
  };

  const handleUploadSubmit = () => {
    if (!uploadFileName.trim()) return;
    const newMaterial: Material = {
      id: `m${Date.now()}`,
      name: uploadFileName,
      size: '0 KB',
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      uploadedBy: 'TA Assistant',
      type: uploadFileType,
      aiGenerated: false,
    };
    setMaterials((prev) => [newMaterial, ...prev]);
    setUploadFileName('');
    setUploadFileType('PDF');
    setShowUploadModal(false);
  };

  const cardClass = `border rounded-lg p-6 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`;
  const headingClass = isDark ? 'text-white' : 'text-gray-900';
  const subtextClass = isDark ? 'text-slate-400' : 'text-gray-600';
  const inputClass = `w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'border-gray-300 bg-white'}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${headingClass}`}>Upload Materials</h1>
          <p className={`mt-1 text-sm ${subtextClass}`}>
            Manage and share course resources with your students
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
            <Sparkles className="w-4 h-4" />
            AI Generate
          </button>
        </div>
      </div>

      {/* Course/Lab Selector */}
      <div className={cardClass}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${headingClass}`}>Course</label>
            <CleanSelect
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className={inputClass}
            >
              <option value="CS101">CS101 - Introduction to Programming</option>
              <option value="CS202">CS202 - Data Structures</option>
              <option value="CS303">CS303 - Advanced Algorithms</option>
            </CleanSelect>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${headingClass}`}>Lab</label>
            <CleanSelect
              value={selectedLab}
              onChange={(e) => setSelectedLab(e.target.value)}
              className={inputClass}
            >
              <option value="Lab 1">Lab 1</option>
              <option value="Lab 2">Lab 2</option>
              <option value="Lab 3">Lab 3</option>
              <option value="Lab 4">Lab 4</option>
            </CleanSelect>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Students', value: '120' },
          { label: 'Materials', value: String(materials.length) },
          { label: 'Last Updated', value: '3h ago' },
        ].map((stat) => (
          <div key={stat.label} className={cardClass}>
            <p className={`text-sm ${subtextClass}`}>{stat.label}</p>
            <p className={`text-xl font-bold mt-1 ${headingClass}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Upload Area */}
      <div
        onClick={() => setShowUploadModal(true)}
        className={`border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center cursor-pointer transition-colors ${
          isDark ? 'border-white/20 hover:border-white/40' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <Cloud className={`w-10 h-10 mb-3 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
        <p className={`font-semibold ${headingClass}`}>Upload Materials</p>
        <p className={`text-sm mt-1 ${subtextClass}`}>
          Add PDFs, videos, code files or other resources
        </p>
      </div>

      {/* Filter Bar */}
      <div className={cardClass}>
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search
              className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-400' : 'text-gray-400'}`}
            />
            <input
              type="text"
              placeholder="Search materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${inputClass} pl-9`}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {FILE_TYPE_FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  activeFilter === filter
                    ? 'bg-blue-600 text-white'
                    : isDark
                      ? 'bg-white/10 text-slate-300 hover:bg-white/20'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
          <CleanSelect
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            className={`${inputClass} w-auto`}
          >
            <option value="Recent">Recent</option>
            <option value="By Name">By Name</option>
            <option value="By Size">By Size</option>
          </CleanSelect>
        </div>
      </div>

      {/* Materials List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMaterials.map((material) => (
          <div key={material.id} className={`${cardClass} flex items-start gap-4 relative`}>
            <div
              className={`flex-shrink-0 p-2 rounded-lg ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}
            >
              {getFileIcon(material.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className={`font-medium truncate ${headingClass}`}>{material.name}</p>
                {material.aiGenerated && (
                  <span className="flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-0.5 text-xs text-blue-400 whitespace-nowrap">
                    <Sparkles className="w-3 h-3" />
                    AI
                  </span>
                )}
              </div>
              <div
                className={`flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs ${subtextClass}`}
              >
                <span>{material.size}</span>
                <span>{material.date}</span>
                <span>{material.uploadedBy}</span>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <button
                  className={`p-1.5 rounded-md transition-colors ${isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'}`}
                  title="View"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  className={`p-1.5 rounded-md transition-colors ${isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'}`}
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
                {deleteConfirmId === material.id ? (
                  <div className="flex items-center gap-1 ml-auto">
                    <button
                      onClick={() => handleDelete(material.id)}
                      className="rounded-md bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700 transition-colors"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className={`rounded-md px-2 py-1 text-xs transition-colors ${isDark ? 'bg-white/10 text-slate-300 hover:bg-white/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirmId(material.id)}
                    className="p-1.5 rounded-md transition-colors text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMaterials.length === 0 && (
        <div className={`text-center py-12 ${subtextClass}`}>
          <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No materials found matching your filters.</p>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className={`w-full max-w-md rounded-xl p-6 ${isDark ? 'bg-gray-800 border border-white/10' : 'bg-white border border-gray-200'}`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-lg font-semibold ${headingClass}`}>Upload Material</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className={`p-1 rounded-md ${isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${headingClass}`}>
                  File Name
                </label>
                <input
                  type="text"
                  placeholder="Enter file name..."
                  value={uploadFileName}
                  onChange={(e) => setUploadFileName(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${headingClass}`}>
                  File Type
                </label>
                <CleanSelect
                  value={uploadFileType}
                  onChange={(e) => setUploadFileType(e.target.value as Material['type'])}
                  className={inputClass}
                >
                  <option value="PDF">PDF</option>
                  <option value="Video">Video</option>
                  <option value="Code">Code</option>
                  <option value="Image">Image</option>
                  <option value="Archive">Archive</option>
                </CleanSelect>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${isDark ? 'bg-white/10 text-slate-300 hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadSubmit}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
