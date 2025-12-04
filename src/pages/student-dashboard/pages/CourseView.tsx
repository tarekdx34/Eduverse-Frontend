import { ArrowLeft, Star, Users, Clock, Tag, Globe, ChevronDown, Play, File, MessageSquare } from 'lucide-react';
import { useState } from 'react';

interface Lesson {
  id: string;
  title: string;
  duration: number;
  type: 'video' | 'resource' | 'quiz';
  completed: boolean;
}

interface CourseSection {
  id: string;
  title: string;
  lessons: Lesson[];
  duration: number;
}

interface CourseViewPageProps {
  courseId: string;
  onBack: () => void;
}

export default function CourseViewPage({ courseId, onBack }: CourseViewPageProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);

  const courseData = {
    id: '1',
    title: 'Introduction to Computer Science',
    instructor: 'Dr. Sarah Johnson',
    instructorImage: 'http://localhost:3845/assets/56d9e68ccff12413f144bdf75269165f5e84005a.png',
    rating: 4.8,
    reviewCount: 14523,
    students: 45892,
    duration: '12.5h',
    updated: '3 days ago',
    languages: 'English, Spanish',
    coursePreviewImage: 'http://localhost:3845/assets/e784b5e9e65a98ee9f30a163fd23594a1cca9cbb.png',
    progress: 9.52,
    progressLabel: '2/21 completed',
  };

  const courseSections: CourseSection[] = [
    {
      id: '1',
      title: 'Course Introduction',
      lessons: [
        { id: '1-1', title: 'Welcome to the Course', duration: 12, type: 'video', completed: true },
        { id: '1-2', title: 'Course Overview & Objectives', duration: 8, type: 'video', completed: true },
        { id: '1-3', title: 'How to Use This Platform', duration: 15, type: 'video', completed: false },
        { id: '1-4', title: 'Resources & Materials', duration: 5, type: 'resource', completed: false },
      ],
      duration: 60,
    },
    {
      id: '2',
      title: 'Core Concepts',
      lessons: [
        { id: '2-1', title: 'Fundamental Principles', duration: 25, type: 'video', completed: false },
        { id: '2-2', title: 'Basic Data Structures', duration: 30, type: 'video', completed: false },
        { id: '2-3', title: 'Algorithm Basics', duration: 35, type: 'video', completed: false },
        { id: '2-4', title: 'Core Concepts Quiz', duration: 10, type: 'quiz', completed: false },
        { id: '2-5', title: 'Practice Exercises', duration: 20, type: 'resource', completed: false },
        { id: '2-6', title: 'Discussion: Key Takeaways', duration: 15, type: 'resource', completed: false },
        { id: '2-7', title: 'Real-World Applications', duration: 25, type: 'video', completed: false },
        { id: '2-8', title: 'Case Studies & Examples', duration: 30, type: 'resource', completed: false },
      ],
      duration: 180,
    },
    {
      id: '3',
      title: 'Advanced Topics',
      lessons: [
        { id: '3-1', title: 'Advanced Concepts Part 1', duration: 40, type: 'video', completed: false },
        { id: '3-2', title: 'Advanced Concepts Part 2', duration: 35, type: 'video', completed: false },
        { id: '3-3', title: 'Optimization Techniques', duration: 30, type: 'video', completed: false },
        { id: '3-4', title: 'Advanced Quiz', duration: 15, type: 'quiz', completed: false },
        { id: '3-5', title: 'Capstone Project Instructions', duration: 20, type: 'resource', completed: false },
        { id: '3-6', title: 'Peer Review Guidelines', duration: 10, type: 'resource', completed: false },
      ],
      duration: 140,
    },
    {
      id: '4',
      title: 'Final Project & Assessment',
      lessons: [
        { id: '4-1', title: 'Project Overview', duration: 15, type: 'video', completed: false },
        { id: '4-2', title: 'Requirements & Rubric', duration: 12, type: 'resource', completed: false },
        { id: '4-3', title: 'Final Assessment', duration: 60, type: 'quiz', completed: false },
      ],
      duration: 90,
    },
  ];

  return (
    <div className="bg-white rounded-lg">
      {/* Header with back button */}
      <div className="bg-white border-b border-gray-200 p-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to My Classes</span>
        </button>

        {/* Course Title and Meta */}
        <div className="mb-4">
          <h1 className="text-3xl font-semibold text-gray-900 mb-4">{courseData.title}</h1>
          <div className="flex flex-wrap gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Star size={16} className="text-yellow-400" fill="currentColor" />
              <span className="font-semibold text-gray-900">{courseData.rating}</span>
              <span>({courseData.reviewCount.toLocaleString()} ratings)</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={16} />
              <span>{courseData.students.toLocaleString()} students enrolled</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>{courseData.duration} total duration</span>
            </div>
            <div className="flex items-center gap-2">
              <Tag size={16} />
              <span>Last updated {courseData.updated}</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe size={16} />
              <span>{courseData.languages}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-6 p-6">
        {/* Left Content Area */}
        <div className="flex-1">
          {/* Course Preview Video */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6 h-96">
            <div className="relative h-full">
              <img
                src={courseData.coursePreviewImage}
                alt="Course Preview"
                className="w-full h-full object-cover opacity-70"
              />
              <button className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-4 shadow-lg hover:shadow-xl transition-shadow">
                <svg className="w-8 h-8 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <div className="flex gap-8">
              {['overview', 'notes', 'announcements', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-2 font-medium text-sm transition-colors relative capitalize ${
                    activeTab === tab
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Course Summary Cards */}
              <div className="grid grid-cols-2 gap-6">
                <div className="border border-indigo-100 rounded-lg p-6 bg-indigo-50">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">📊</span>
                    <h3 className="font-semibold text-gray-900">Skill Level</h3>
                  </div>
                  <p className="text-2xl font-semibold text-indigo-600 mb-2">All Levels</p>
                  <p className="text-sm text-gray-600">Suitable for beginners to advanced learners</p>
                </div>

                <div className="border border-green-100 rounded-lg p-6 bg-green-50">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">📚</span>
                    <h3 className="font-semibold text-gray-900">Total Lectures</h3>
                  </div>
                  <p className="text-2xl font-semibold text-green-600 mb-2">21 Lessons</p>
                  <p className="text-sm text-gray-600">Comprehensive learning materials</p>
                </div>

                <div className="border border-orange-100 rounded-lg p-6 bg-orange-50">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">⏱️</span>
                    <h3 className="font-semibold text-gray-900">Duration</h3>
                  </div>
                  <p className="text-2xl font-semibold text-orange-600 mb-2">12.5 hours</p>
                  <p className="text-sm text-gray-600">On-demand video content</p>
                </div>

                <div className="border border-pink-100 rounded-lg p-6 bg-pink-50">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🏆</span>
                    <h3 className="font-semibold text-gray-900">Certification</h3>
                  </div>
                  <p className="text-2xl font-semibold text-pink-600 mb-2">Yes</p>
                  <p className="text-sm text-gray-600">Certificate of completion included</p>
                </div>
              </div>

              {/* About Section */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">About This Course</h3>
                <p className="text-gray-600 leading-relaxed">
                  This comprehensive course covers all the essential topics you need to master Introduction to Computer
                  Science. You'll learn from industry experts through hands-on projects and real-world examples. Whether
                  you're a beginner or looking to advance your skills, this course provides the perfect blend of theory
                  and practice.
                </p>
              </div>

              {/* What You'll Learn */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">What You'll Learn</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    'Fundamental concepts and principles',
                    'Advanced techniques and best practices',
                    'Real-world project implementation',
                    'Industry-standard tools and frameworks',
                    'Problem-solving strategies',
                    'Professional workflow optimization',
                  ].map((item, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-4 flex items-start gap-3">
                      <span className="text-green-600 font-bold mt-1">✓</span>
                      <span className="text-gray-700 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructor */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Instructor</h3>
                <div className="border border-gray-200 rounded-lg p-6 bg-gradient-to-r from-gray-50 to-white flex items-center gap-6">
                  <img
                    src={courseData.instructorImage}
                    alt={courseData.instructor}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{courseData.instructor}</h4>
                    <p className="text-sm text-gray-600 mb-2">Course Instructor</p>
                    <div className="flex gap-6 text-sm text-gray-600">
                      <span>⭐ 4.9 Rating</span>
                      <span>👥 12,450 Students</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notes' && <div className="text-gray-600">Course notes section coming soon</div>}
          {activeTab === 'announcements' && (
            <div className="text-gray-600">Announcements section coming soon</div>
          )}
          {activeTab === 'reviews' && <div className="text-gray-600">Reviews section coming soon</div>}
        </div>

        {/* Right Sidebar */}
        <div className="w-96">
          {/* Progress Card */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Course Content</h3>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-700">Progress</span>
                <span className="bg-white border border-indigo-200 rounded-full px-3 py-1 text-sm text-indigo-600 font-semibold">
                  {courseData.progressLabel}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600"
                  style={{ width: `${courseData.progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Course Sections */}
          <div className="space-y-3">
            {courseSections.map((section) => (
              <div key={section.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                {/* Section Header */}
                <button
                  onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 text-left">
                    <ChevronDown
                      size={20}
                      className={`text-gray-600 transition-transform ${
                        expandedSection === section.id ? 'rotate-180' : ''
                      }`}
                    />
                    <div>
                      <h4 className="font-medium text-gray-900">{section.title}</h4>
                      <p className="text-xs text-gray-600">
                        {section.lessons.length} lessons • {section.duration}min Total
                      </p>
                    </div>
                  </div>
                  <div className="text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>

                {/* Expanded Lessons */}
                {expandedSection === section.id && (
                  <div className="border-t border-gray-200 bg-gray-50">
                    <div className="space-y-2 p-4">
                      {section.lessons.map((lesson) => (
                        <button
                          key={lesson.id}
                          onClick={() => setSelectedLesson(lesson.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                            selectedLesson === lesson.id
                              ? 'bg-indigo-50 border border-indigo-200'
                              : 'bg-white border border-gray-200 hover:bg-white hover:border-indigo-200'
                          }`}
                        >
                          {/* Completion Checkbox */}
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                              lesson.completed
                                ? 'bg-green-500 border-green-500'
                                : 'border-gray-300 group-hover:border-indigo-500'
                            }`}
                          >
                            {lesson.completed && <span className="text-white text-xs">✓</span>}
                          </div>

                          {/* Lesson Icon */}
                          <div className="text-indigo-600 flex-shrink-0">
                            {lesson.type === 'video' && <Play size={18} />}
                            {lesson.type === 'resource' && <File size={18} />}
                            {lesson.type === 'quiz' && <MessageSquare size={18} />}
                          </div>

                          {/* Lesson Info */}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${lesson.completed ? 'text-gray-600' : 'text-gray-900'}`}>
                              {lesson.title}
                            </p>
                            <p className="text-xs text-gray-500">{lesson.duration} min</p>
                          </div>

                          {/* Type Badge */}
                          <div className="flex-shrink-0">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-white border border-gray-200">
                              {lesson.type === 'video' && '📹 Video'}
                              {lesson.type === 'resource' && '📄 Resource'}
                              {lesson.type === 'quiz' && '✓ Quiz'}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
