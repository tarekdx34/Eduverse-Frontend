import { useState } from 'react';
import { X, LayoutGrid, BookOpen, Calendar, CreditCard, FileText, CheckSquare, Sparkles } from 'lucide-react';
import { Sidebar, Header, StatsCard, GpaChart, DailySchedule, PaymentHistory, ClassTab, WeeklySchedule, GradesTranscript, Assignments, AcademicCalendar, AIFeatures } from './components';
import { GPA_DATA, SCHEDULE_DATA } from './constants';

export default function StudentDashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'myclass', label: 'My Class', icon: BookOpen },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'assignments', label: 'Assignments', icon: CheckSquare },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'ai', label: 'AI Features', icon: Sparkles },
    { id: 'grades', label: 'Grades', icon: FileText },
    { id: 'payments', label: 'Payments', icon: CreditCard },
  ];

  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed on desktop, drawer on mobile */}
      <div className={`fixed md:relative z-50 md:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} transition-transform duration-300`}>
        <Sidebar onTabChange={(tab) => {
          setActiveTab(tab);
          setSidebarOpen(false);
        }} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header with drawer toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-4 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? (
              <X size={24} className="text-gray-600" />
            ) : (
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
          <div className="flex-1">
            <Header userName="Tarek Mohamed" />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border-b border-gray-200 px-6 overflow-x-auto">
          <div className="flex gap-8">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 font-medium text-sm transition-colors relative flex items-center gap-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-purple-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <IconComponent size={18} />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <StatsCard
                  label="Credits Completed"
                  value="120"
                  maxValue="144"
                  comparison="+24 Credits"
                  isPositive={true}
                />
                <StatsCard
                  label="Grade Point Average"
                  value="3.75"
                  maxValue="4.00"
                  comparison="-0.25 Points"
                  isPositive={false}
                />
                <StatsCard
                  label="Active Class"
                  value="15"
                  maxValue="18"
                  comparison="Active Course This Semester"
                  isPositive={true}
                />
              </div>

              {/* Charts and Schedule */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <GpaChart data={GPA_DATA} />
                <DailySchedule schedules={SCHEDULE_DATA} />
              </div>

              {/* Payment History */}
              <PaymentHistory />
            </>
          )}

          {/* My Class Tab */}
          {activeTab === 'myclass' && <ClassTab />}

          {/* Schedule Tab */}
          {activeTab === 'schedule' && <WeeklySchedule />}

          {/* Assignments Tab */}
          {activeTab === 'assignments' && <Assignments />}

          {/* Calendar Tab */}
          {activeTab === 'calendar' && <AcademicCalendar />}

          {/* AI Features Tab */}
          {activeTab === 'ai' && <AIFeatures />}

          {/* Grades & Transcript Tab */}
          {activeTab === 'grades' && <GradesTranscript />}

          {/* Payments Tab */}
          {activeTab === 'payments' && <PaymentHistory />}
        </div>
      </div>
    </div>
  );
}
