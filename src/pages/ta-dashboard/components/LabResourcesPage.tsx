import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  FileText,
  Film,
  Code,
  Upload,
  Search,
  Eye,
  Download,
  Trash2,
  CheckCircle,
  TrendingUp,
  AlertTriangle,
  AlertCircle,
  XCircle,
  FolderOpen,
  Cloud,
} from 'lucide-react';

type TagType = 'Verified' | 'Popular' | 'Suggest Update' | 'Low Clarity' | 'Outdated';

interface Material {
  id: string;
  name: string;
  type: 'pdf' | 'video' | 'code';
  views: number;
  downloads: number;
  completion: number;
  tags: TagType[];
}

const labMaterials: Record<number, Material[]> = {
  1: [
    {
      id: '1-1',
      name: 'Data Structures Lab Guide.pdf',
      type: 'pdf',
      views: 156,
      downloads: 89,
      completion: 92,
      tags: ['Verified', 'Popular'],
    },
    {
      id: '1-2',
      name: 'LinkedList Implementation Tutorial',
      type: 'video',
      views: 234,
      downloads: 0,
      completion: 78,
      tags: ['Suggest Update'],
    },
    {
      id: '1-3',
      name: 'Sample Code - Binary Tree',
      type: 'code',
      views: 98,
      downloads: 67,
      completion: 85,
      tags: [],
    },
  ],
  2: [
    {
      id: '2-1',
      name: 'Sorting Algorithms Overview.pdf',
      type: 'pdf',
      views: 189,
      downloads: 112,
      completion: 88,
      tags: ['Low Clarity'],
    },
    {
      id: '2-2',
      name: 'QuickSort Visual Demo',
      type: 'video',
      views: 312,
      downloads: 0,
      completion: 95,
      tags: ['Popular', 'Verified'],
    },
  ],
  3: [
    {
      id: '3-1',
      name: 'Graph Theory Introduction.pdf',
      type: 'pdf',
      views: 145,
      downloads: 76,
      completion: 91,
      tags: [],
    },
    {
      id: '3-2',
      name: 'Dijkstra Algorithm Animation',
      type: 'video',
      views: 203,
      downloads: 0,
      completion: 82,
      tags: ['Outdated'],
    },
  ],
  4: [
    {
      id: '4-1',
      name: 'Dynamic Programming Basics.pdf',
      type: 'pdf',
      views: 87,
      downloads: 45,
      completion: 65,
      tags: ['Low Clarity', 'Suggest Update'],
    },
  ],
};

const qualityScores: Record<number, { score: number; color: string; bg: string }> = {
  1: { score: 82, color: 'bg-blue-500', bg: 'bg-blue-500/20' },
  2: { score: 76, color: 'bg-yellow-500', bg: 'bg-yellow-500/20' },
  3: { score: 91, color: 'bg-green-500', bg: 'bg-green-500/20' },
  4: { score: 65, color: 'bg-red-500', bg: 'bg-red-500/20' },
};

const tagConfig: Record<TagType, { color: string; darkColor: string; icon: React.ElementType }> = {
  Verified: {
    color: 'bg-green-100 text-green-700',
    darkColor: 'bg-green-500/20 text-green-400',
    icon: CheckCircle,
  },
  Popular: {
    color: 'bg-blue-100 text-blue-700',
    darkColor: 'bg-blue-500/20 text-blue-400',
    icon: TrendingUp,
  },
  'Suggest Update': {
    color: 'bg-yellow-100 text-yellow-700',
    darkColor: 'bg-yellow-500/20 text-yellow-400',
    icon: AlertTriangle,
  },
  'Low Clarity': {
    color: 'bg-yellow-100 text-yellow-700',
    darkColor: 'bg-yellow-500/20 text-yellow-400',
    icon: AlertCircle,
  },
  Outdated: {
    color: 'bg-red-100 text-red-700',
    darkColor: 'bg-red-500/20 text-red-400',
    icon: XCircle,
  },
};

const fileTypeConfig: Record<string, { icon: React.ElementType; color: string }> = {
  pdf: { icon: FileText, color: 'text-red-500' },
  video: { icon: Film, color: 'text-blue-500' },
  code: { icon: Code, color: 'text-green-500' },
};

export function LabResourcesPage() {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [materials, setMaterials] = useState<Record<number, Material[]>>(labMaterials);

  const currentMaterials = (materials[activeTab] || []).filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const quality = qualityScores[activeTab];

  const handleDelete = (id: string) => {
    setMaterials((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab].filter((m) => m.id !== id),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {t('Lab Resources')}
        </h1>
        <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {t('Manage and organize lab materials')}
        </p>
      </div>

      {/* Lab Tabs */}
      <div className={`flex gap-2 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
        {[1, 2, 3, 4].map((lab) => (
          <button
            key={lab}
            onClick={() => setActiveTab(lab)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
              activeTab === lab
                ? isDark
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500'
                  : 'bg-blue-50 text-blue-600 border-blue-500'
                : isDark
                  ? 'text-gray-400 border-transparent hover:text-gray-200'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            {t(`Lab ${lab}`)}
          </button>
        ))}
      </div>

      {/* Quality Score Card */}
      <div
        className={`border rounded-lg p-6 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('Quality Score')}
          </h2>
          <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {quality.score}%
          </span>
        </div>
        <div className={`w-full h-3 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
          <div
            className={`h-3 rounded-full transition-all ${quality.color}`}
            style={{ width: `${quality.score}%` }}
          />
        </div>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${
          isDark
            ? 'border-white/20 hover:border-white/40 text-gray-400'
            : 'border-gray-300 hover:border-gray-400 text-gray-500'
        }`}
      >
        <Cloud className="w-10 h-10" />
        <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {t('Upload New Material')}
        </p>
        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          {t('Drag & drop files here or click to browse')}
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search
          className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
        />
        <input
          type="text"
          placeholder={t('Filter materials by name...')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm transition-colors ${
            isDark
              ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-blue-500'
              : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500'
          } outline-none`}
        />
      </div>

      {/* Materials List */}
      {currentMaterials.length > 0 ? (
        <div className="space-y-4">
          {currentMaterials.map((material) => {
            const fileType = fileTypeConfig[material.type];
            const FileIcon = fileType.icon;

            return (
              <div
                key={material.id}
                className={`border rounded-lg p-6 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* File Icon */}
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}
                  >
                    <FileIcon className={`w-5 h-5 ${fileType.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}
                    >
                      {material.name}
                    </h3>

                    {/* Stats */}
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                      <span
                        className={`flex items-center gap-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        {material.views} {t('views')}
                      </span>
                      <span
                        className={`flex items-center gap-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                      >
                        <Download className="w-3.5 h-3.5" />
                        {material.downloads} {t('downloads')}
                      </span>
                    </div>

                    {/* Completion Bar */}
                    <div className="flex items-center gap-3 mt-3">
                      <div
                        className={`flex-1 h-2 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}
                      >
                        <div
                          className="h-2 rounded-full bg-blue-500 transition-all"
                          style={{ width: `${material.completion}%` }}
                        />
                      </div>
                      <span
                        className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                      >
                        {material.completion}%
                      </span>
                    </div>

                    {/* Tags */}
                    {material.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {material.tags.map((tag) => {
                          const cfg = tagConfig[tag];
                          const TagIcon = cfg.icon;
                          return (
                            <span
                              key={tag}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                isDark ? cfg.darkColor : cfg.color
                              }`}
                            >
                              <TagIcon className="w-3 h-3" />
                              {t(tag)}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        isDark
                          ? 'bg-white/10 text-gray-300 hover:bg-white/20'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        isDark
                          ? 'bg-white/10 text-gray-300 hover:bg-white/20'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(material.id)}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        isDark
                          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                          : 'bg-red-50 text-red-600 hover:bg-red-100'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div
          className={`border rounded-lg p-12 flex flex-col items-center justify-center gap-3 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
        >
          <FolderOpen className={`w-12 h-12 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
          <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {t('No materials uploaded')}
          </p>
        </div>
      )}
    </div>
  );
}
