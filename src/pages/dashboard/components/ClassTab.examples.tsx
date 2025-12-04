import { ClassTab } from './components';

/**
 * ClassTab Component Integration Example
 * 
 * This shows how to integrate the ClassTab component with tabs
 * in the student dashboard.
 */

// Example 1: Basic usage with default data
export function ClassTabExample1() {
  return <ClassTab />;
}

// Example 2: With custom courses and stats
export function ClassTabExample2() {
  const customCourses = [
    {
      id: '1',
      title: 'Advanced Python Programming',
      courseCode: 'CS401',
      instructor: 'Dr. Advanced Instructor',
      instructorImage: 'http://localhost:3845/assets/56d9e68ccff12413f144bdf75269165f5e84005a.png',
      schedule: 'Mon, Wed, Fri - 09:00 AM',
      nextClass: 'Next: Monday, 09:00 AM',
      room: 'Lab 305',
      students: 28,
      credits: 4,
      progress: 72,
      color: '#e0e7ff',
      progressColor: '#4f39f6',
    },
  ];

  const customStats = {
    totalCourses: 5,
    completed: 2,
    inProgress: 3,
    totalCredits: 18,
  };

  return <ClassTab courses={customCourses} stats={customStats} />;
}

/**
 * Integration with TabPanel component (for use in StudentDashboard)
 * 
 * Add to StudentDashboardPage.tsx:
 * 
 * import { ClassTab } from './components';
 * 
 * <Tabs>
 *   <TabList>
 *     <Tab>My Class</Tab>
 *     <Tab>Schedule</Tab>
 *   </TabList>
 *   <TabPanel>
 *     <ClassTab />
 *   </TabPanel>
 * </Tabs>
 */
