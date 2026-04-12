import { Navigate } from 'react-router-dom';

/** Legacy route — lecture attendance lives on the instructor dashboard. */
export default function AttendancePage() {
  return <Navigate to="/instructordashboard/attendance" replace />;
}
