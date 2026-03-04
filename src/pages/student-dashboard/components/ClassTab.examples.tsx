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

// Example 2: With onViewCourse callback
export function ClassTabExample2() {
  const handleViewCourse = (courseId: string) => {
    console.log('View course:', courseId);
  };

  return <ClassTab onViewCourse={handleViewCourse} />;
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
