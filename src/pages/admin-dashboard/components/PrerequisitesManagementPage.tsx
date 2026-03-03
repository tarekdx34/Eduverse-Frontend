import React, { useState } from 'react';
import { Search, Plus, X, GitBranch, BookOpen, ArrowRight, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface Course {
  id: number;
  code: string;
  name: string;
  department: string;
  prerequisites: string[];
}

interface PrerequisitesManagementPageProps {
  courses: Course[];
  adminDepartment: string;
  onUpdatePrerequisites: (courseId: number, prerequisites: string[]) => void;
}

export function PrerequisitesManagementPage({ courses, adminDepartment, onUpdatePrerequisites }: PrerequisitesManagementPageProps) {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null);

  const deptCourses = courses.filter(c => c.department === adminDepartment);
  const allCourses = courses;

  const filteredCourses = deptCourses.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const coursesWithPrereqs = deptCourses.filter(c => c.prerequisites && c.prerequisites.length > 0).length;

  const getPrerequisiteChain = (courseCode: string, visited = new Set<string>()): string[] => {
    if (visited.has(courseCode)) return [];
    visited.add(courseCode);
    const course = allCourses.find(c => c.code === courseCode);
    if (!course || !course.prerequisites || course.prerequisites.length === 0) return [];
    const chain: string[] = [...course.prerequisites];
    for (const prereq of course.prerequisites) {
      chain.push(...getPrerequisiteChain(prereq, visited));
    }
    return [...new Set(chain)];
  };

  const addPrerequisite = (courseId: number, prereqCode: string) => {
    const course = deptCourses.find(c => c.id === courseId);
    if (!course) return;
    if (course.prerequisites.includes(prereqCode)) return;
    // Prevent circular dependency
    const prereqChain = getPrerequisiteChain(prereqCode);
    if (prereqChain.includes(course.code)) return;
    onUpdatePrerequisites(courseId, [...course.prerequisites, prereqCode]);
  };

  const removePrerequisite = (courseId: number, prereqCode: string) => {
    const course = deptCourses.find(c => c.id === courseId);
    if (!course) return;
    onUpdatePrerequisites(courseId, course.prerequisites.filter(p => p !== prereqCode));
  };

  const getAvailablePrereqs = (course: Course) => {
    return allCourses.filter(c =>
      c.code !== course.code &&
      !course.prerequisites.includes(c.code) &&
      !getPrerequisiteChain(c.code).includes(course.code)
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('prerequisitesManagement')}</h1>
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">{adminDepartment}</span>
          </div>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('managePrereqSub')}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: t('totalCourses'), value: deptCourses.length, icon: BookOpen, color: 'text-blue-500' },
          { label: t('currentPrerequisites'), value: coursesWithPrereqs, icon: GitBranch, color: 'text-blue-500' },
          { label: t('availableCourses'), value: allCourses.length, icon: AlertCircle, color: 'text-green-500' },
        ].map((stat, i) => (
          <div key={i} className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}><stat.icon size={20} className={stat.color} /></div>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</p>
                <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} size={18} />
          <input type="text" placeholder={t('searchPrerequisites')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full pl-10 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`} />
        </div>
      </div>

      {/* Prerequisite Chain Visualization */}
      <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <GitBranch size={20} className="text-blue-500" /> {t('prerequisiteChain')}
        </h3>
        <div className="flex flex-wrap gap-3">
          {deptCourses.filter(c => c.prerequisites && c.prerequisites.length > 0).map(course => (
            <div key={course.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              {course.prerequisites.map((prereq, i) => (
                <React.Fragment key={prereq}>
                  <span className={`text-sm font-medium px-2 py-1 rounded ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>{prereq}</span>
                  <ArrowRight size={14} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
                </React.Fragment>
              ))}
              <span className={`text-sm font-semibold px-2 py-1 rounded ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>{course.code}</span>
            </div>
          ))}
          {deptCourses.filter(c => c.prerequisites && c.prerequisites.length > 0).length === 0 && (
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('noPrerequisites')}</p>
          )}
        </div>
      </div>

      {/* Course List with Prerequisites */}
      <div className="space-y-3">
        {filteredCourses.map(course => {
          const isExpanded = expandedCourse === course.id;
          const available = getAvailablePrereqs(course);
          return (
            <div key={course.id} className={`rounded-xl border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <button onClick={() => setExpandedCourse(isExpanded ? null : course.id)} className={`w-full flex items-center justify-between p-4 hover:bg-opacity-50 transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400`}>{course.code}</span>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{course.name}</span>
                  {course.prerequisites && course.prerequisites.length > 0 && (
                    <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                      {course.prerequisites.length} {t('currentPrerequisites').toLowerCase()}
                    </span>
                  )}
                </div>
                {isExpanded ? <ChevronUp size={18} className={isDark ? 'text-gray-400' : 'text-gray-500'} /> : <ChevronDown size={18} className={isDark ? 'text-gray-400' : 'text-gray-500'} />}
              </button>
              {isExpanded && (
                <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  {/* Current Prerequisites */}
                  <div className="mb-4">
                    <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('currentPrerequisites')}:</h4>
                    <div className="flex flex-wrap gap-2">
                      {(!course.prerequisites || course.prerequisites.length === 0) && (
                        <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('noPrerequisites')}</span>
                      )}
                      {course.prerequisites && course.prerequisites.map(prereq => {
                        const prereqCourse = allCourses.find(c => c.code === prereq);
                        return (
                          <span key={prereq} className={`inline-flex items-center gap-1 text-sm px-3 py-1 rounded-full ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                            {prereq} {prereqCourse && `- ${prereqCourse.name}`}
                            <button onClick={() => removePrerequisite(course.id, prereq)} className="ml-1 hover:text-red-500"><X size={14} /></button>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  {/* Add Prerequisite */}
                  <div>
                    <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('addPrerequisite')}:</h4>
                    <div className="flex flex-wrap gap-2">
                      {available.slice(0, 10).map(c => (
                        <button key={c.id} onClick={() => addPrerequisite(course.id, c.code)} className={`inline-flex items-center gap-1 text-sm px-3 py-1 rounded-full border transition-colors ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                          <Plus size={12} /> {c.code} - {c.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PrerequisitesManagementPage;
