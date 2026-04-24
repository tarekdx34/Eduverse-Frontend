import React, { useMemo } from 'react';
import { Joyride, STATUS } from 'react-joyride';
import type { Step, EventData } from 'react-joyride';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface DashboardWalkthroughProps {
  run: boolean;
  onFinish: () => void;
  activeTab: string;
  onTabChange: (tab: any) => void;
}

export const DashboardWalkthrough: React.FC<DashboardWalkthroughProps> = ({ 
  run, 
  onFinish, 
  activeTab, 
  onTabChange 
}) => {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();

  const steps: Step[] = useMemo(() => [
    {
      target: 'body',
      placement: 'center',
      content: (
        <div className="text-center">
          <h3 className="text-xl font-bold mb-2">Welcome to EduVerse! 🎓</h3>
          <p>Hello Professor {user?.firstName || 'Tarek'}. Let us take you on a deep dive tour of your dashboard.</p>
        </div>
      ),
      disableBeacon: true,
    },
    // Dashboard Section
    {
      target: '#walkthrough-stats',
      content: 'Here is your Overview. You can see total students, active courses, and pending tasks at a glance.',
      placement: 'bottom',
    },
    {
      target: '#walkthrough-performance',
      content: 'Track how your students are performing across all courses with real-time analytics.',
      placement: 'top',
    },
    {
      target: '#walkthrough-evy-ai',
      content: 'Meet Evy, your AI assistant. Evy can help you automate attendance from photos, grade papers, and more.',
      placement: 'top',
    },

    // Courses Section
    {
      target: '#walkthrough-tab-courses',
      content: "Next, let's look at your Courses. Clicking 'Next' will take us there.",
      placement: isRTL ? 'left' : 'right',
    },
    {
      target: '#walkthrough-courses-grid',
      content: 'This is your course catalog. You can open any course to manage its specific content.',
      placement: 'top',
    },
    {
      target: '#walkthrough-add-course',
      content: 'Need to start something new? Create a new course or section right here.',
      placement: 'left',
    },

    // Roster Section
    {
      target: '#walkthrough-tab-roster',
      content: "Let's check your Student Roster. Moving to the Roster tab now...",
      placement: isRTL ? 'left' : 'right',
    },
    {
      target: '#walkthrough-roster-search',
      content: 'Quickly find any student by name, ID, or email using this search bar.',
      placement: 'bottom',
    },
    {
      target: '#walkthrough-roster-table',
      content: 'View enrollment dates, current grades, and even add private notes about student progress.',
      placement: 'top',
    },

    // Assignments Section
    {
      target: '#walkthrough-tab-assignments',
      content: 'Management of Assignments is crucial. Switching tabs...',
      placement: isRTL ? 'left' : 'right',
    },
    {
      target: '#walkthrough-assignments-grid',
      content: 'View all assignments, their due dates, and submission counts. You can grade them directly from here.',
      placement: 'top',
    },
    {
      target: '#walkthrough-create-assignment',
      content: 'Create new assignments, set deadlines, and attach resources for your students.',
      placement: 'left',
    },

    // Attendance Section
    {
      target: '#walkthrough-tab-attendance',
      content: 'Track Attendance effortlessly. Heading to the Attendance tab...',
      placement: isRTL ? 'left' : 'right',
    },
    {
      target: '#walkthrough-attendance-table',
      content: 'Review past attendance records or start a new roll call session for today\'s lecture.',
      placement: 'top',
    },

    // Labs Section
    {
      target: '#walkthrough-tab-labs',
      content: 'Manage your Laboratory sessions. Switching to Labs...',
      placement: isRTL ? 'left' : 'right',
    },
    {
      target: '#walkthrough-labs-grid',
      content: 'Create lab instructions, monitor submissions, and track student performance in practical work.',
      placement: 'top',
    },

    // Quizzes Section
    {
      target: '#walkthrough-tab-quizzes',
      content: "Finally, let's look at Quizzes. Navigating to the Quizzes tab...",
      placement: isRTL ? 'left' : 'right',
    },
    {
      target: '#walkthrough-quizzes-list',
      content: 'Design interactive quizzes, set time limits, and analyze student results automatically.',
      placement: 'top',
    },

    // Wrap up
    {
      target: '#walkthrough-notifications',
      content: 'Don\'t forget to check your notifications for messages and student updates.',
      placement: 'bottom',
    },
    {
      target: 'body',
      placement: 'center',
      content: (
        <div className="text-center">
          <h3 className="text-xl font-bold mb-2">Tour Complete! 🚀</h3>
          <p>You're ready to master your classroom with EduVerse. Happy teaching!</p>
        </div>
      ),
    },
  ], [user, isRTL, t]);

  const handleJoyrideCallback = (data: EventData) => {
    const { action, index, lifecycle, status } = data;

    // Logic to switch tabs at specific step transitions
    if (status === STATUS.RUNNING && lifecycle === 'complete') {
        const nextIndex = action === 'prev' ? index - 1 : index + 1;
        const nextStep = steps[nextIndex];
        
        if (nextStep && typeof nextStep.target === 'string') {
            const target = nextStep.target;
            const changeTab = (tab: string) => {
                if (activeTab !== tab && typeof onTabChange === 'function') {
                    onTabChange(tab);
                }
            };

            if (target.includes('stats') || target.includes('performance') || target.includes('evy-ai')) {
                changeTab('dashboard');
            } else if (target.includes('courses-grid') || target.includes('add-course')) {
                changeTab('courses');
            } else if (target.includes('roster-search') || target.includes('roster-table')) {
                changeTab('roster');
            } else if (target.includes('assignments-grid') || target.includes('create-assignment')) {
                changeTab('assignments');
            } else if (target.includes('attendance-table')) {
                changeTab('attendance');
            } else if (target.includes('labs-grid')) {
                changeTab('labs');
            } else if (target.includes('quizzes-list')) {
                changeTab('quizzes');
            }
        }
    }

    if (([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status)) {
      onFinish();
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous={true}
      onEvent={handleJoyrideCallback}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Finish',
        next: 'Next',
        skip: 'Skip',
      }}
      options={{
        showProgress: true,
        buttons: ['back', 'primary', 'skip'],
        zIndex: 10000,
        primaryColor: '#3b82f6',
      }}
      styles={{
        tooltipContainer: {
          textAlign: isRTL ? 'right' : 'left',
          direction: isRTL ? 'rtl' : 'ltr',
        },
        buttonNext: {
            backgroundColor: '#3b82f6',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            padding: '8px 16px',
        },
        buttonBack: {
            marginRight: '10px',
            fontSize: '14px',
            fontWeight: '600',
        },
        buttonSkip: {
            fontSize: '14px',
            fontWeight: '600',
            color: '#64748b'
        }
      }}
    />
  );
};
