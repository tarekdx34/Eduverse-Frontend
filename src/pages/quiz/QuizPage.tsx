import { Navigate } from 'react-router-dom';

/** Legacy route — AI quiz generation lives on the instructor/TA dashboard Quizzes tab. */
export default function QuizPage() {
  return <Navigate to="/instructordashboard/quizzes" replace />;
}
