import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  Download,
  Upload,
  Paperclip,
  Send,
  AlertCircle,
  CheckCircle,
  Award,
  X,
  File,
  Loader2,
} from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useApi, useMutation } from '../../../hooks/useApi';
import { AssignmentService } from '../../../services/api/assignmentService';

interface AssignmentDetailsProps {
  assignmentId: number;
  onBack: () => void;
}

// Assignment data - in a real app, this would come from an API
const assignmentData: { [key: number]: any } = {
  1: {
    id: 1,
    title: 'Database Design Project',
    course: 'Database Management Systems',
    courseCode: 'CS220',
    type: 'Project',
    dueDate: '2025-12-10',
    dueTime: '11:59 PM',
    status: 'pending',
    priority: 'high',
    description: 'Design and implement a relational database for a library management system',
    points: 100,
    submittedPoints: null,
    progress: 45,
    color: 'bg-orange-500',
    instructor: 'Dr. James Wilson',
    instructorEmail: 'j.wilson@university.edu',
    dateAssigned: '2025-11-20',
    detailedDescription: `In this project, you will design and implement a comprehensive relational database for a library management system. This assignment will test your understanding of database normalization, entity-relationship modeling, and SQL query optimization.

**Learning Objectives:**
- Design a normalized database schema
- Create efficient indexes and constraints
- Write complex SQL queries for common library operations
- Implement data integrity and security measures

**Requirements:**
1. Create an ER diagram showing all entities and relationships
2. Design a normalized database schema (at least 3NF)
3. Implement the database using PostgreSQL or MySQL
4. Write SQL scripts for common operations (checkout, returns, fines, etc.)
5. Include sample data and test queries

**Submission Guidelines:**
- Submit all SQL scripts in a single ZIP file
- Include a detailed report (PDF format) explaining your design decisions
- Provide screenshots of successful query executions
- Document any assumptions made during the design process`,
    rubric: [
      {
        criteria: 'ER Diagram Accuracy',
        points: 20,
        description: 'Complete and accurate entity-relationship diagram',
      },
      {
        criteria: 'Database Normalization',
        points: 25,
        description: 'Proper normalization (3NF or higher)',
      },
      {
        criteria: 'SQL Implementation',
        points: 30,
        description: 'Working SQL scripts with no errors',
      },
      {
        criteria: 'Query Efficiency',
        points: 15,
        description: 'Optimized queries with appropriate indexes',
      },
      {
        criteria: 'Documentation',
        points: 10,
        description: 'Clear and comprehensive documentation',
      },
    ],
    resources: [
      { name: 'Project Requirements.pdf', size: '245 KB', type: 'pdf' },
      { name: 'Database Schema Template.sql', size: '12 KB', type: 'sql' },
      { name: 'Sample Data.csv', size: '89 KB', type: 'csv' },
      { name: 'Grading Rubric.pdf', size: '156 KB', type: 'pdf' },
    ],
  },
  2: {
    id: 2,
    title: 'Mobile App Prototype',
    course: 'Mobile Application Development',
    courseCode: 'CS350',
    type: 'Project',
    dueDate: '2025-12-08',
    dueTime: '11:59 PM',
    status: 'pending',
    priority: 'high',
    description: 'Create a functional prototype of a mobile application using React Native',
    points: 150,
    submittedPoints: null,
    progress: 60,
    color: 'bg-[var(--accent-color)]/100',
    instructor: 'Dr. Robert Taylor',
    instructorEmail: 'r.taylor@university.edu',
    dateAssigned: '2025-11-18',
    detailedDescription: `Develop a functional mobile application prototype using React Native. The app should demonstrate your understanding of mobile UI/UX principles, state management, and API integration.

**Learning Objectives:**
- Build cross-platform mobile applications
- Implement responsive and intuitive UI components
- Manage application state effectively
- Integrate with external APIs

**Requirements:**
1. Implement at least 5 functional screens
2. Use React Navigation for screen transitions
3. Integrate with a REST API (can be mock or real)
4. Implement local storage for user preferences
5. Follow Material Design or iOS Human Interface Guidelines

**Submission Guidelines:**
- Submit complete source code via GitHub repository
- Include a README with setup instructions
- Provide APK/IPA file or Expo link for testing
- Create a short demo video (3-5 minutes)`,
    rubric: [
      { criteria: 'Functionality', points: 40, description: 'All features work as expected' },
      { criteria: 'UI/UX Design', points: 30, description: 'Professional and intuitive interface' },
      { criteria: 'Code Quality', points: 35, description: 'Clean, well-organized code' },
      { criteria: 'API Integration', points: 25, description: 'Successful API integration' },
      { criteria: 'Documentation', points: 20, description: 'Complete documentation and demo' },
    ],
    resources: [
      { name: 'Assignment Instructions.pdf', size: '312 KB', type: 'pdf' },
      { name: 'API Documentation.pdf', size: '198 KB', type: 'pdf' },
      { name: 'UI Design Guidelines.pdf', size: '567 KB', type: 'pdf' },
      { name: 'Sample Code.zip', size: '1.2 MB', type: 'zip' },
    ],
  },
  3: {
    id: 3,
    title: 'Algorithm Analysis Report',
    course: 'Data Structures & Algorithms',
    courseCode: 'CS201',
    type: 'Report',
    dueDate: '2025-12-06',
    dueTime: '11:59 PM',
    status: 'in-progress',
    priority: 'medium',
    description: 'Analyze time and space complexity of sorting algorithms',
    points: 50,
    submittedPoints: null,
    progress: 75,
    color: 'bg-blue-500',
    instructor: 'Prof. Michael Chen',
    instructorEmail: 'm.chen@university.edu',
    dateAssigned: '2025-11-15',
    detailedDescription: `Write a comprehensive technical report analyzing the time and space complexity of various sorting algorithms. Include theoretical analysis and empirical performance measurements.

**Learning Objectives:**
- Understand Big-O notation and complexity analysis
- Compare different sorting algorithms
- Conduct empirical performance testing
- Present technical findings clearly

**Requirements:**
1. Analyze at least 5 sorting algorithms (Bubble, Quick, Merge, Heap, Radix)
2. Provide theoretical complexity analysis (best, average, worst case)
3. Implement algorithms and measure actual runtime
4. Create graphs comparing performance
5. Discuss trade-offs and use cases

**Submission Guidelines:**
- Submit as PDF document (8-12 pages)
- Include source code as appendix or separate file
- Use proper citations for references
- Include clear graphs and tables`,
    rubric: [
      { criteria: 'Theoretical Analysis', points: 15, description: 'Accurate complexity analysis' },
      { criteria: 'Implementation', points: 15, description: 'Correct algorithm implementations' },
      { criteria: 'Empirical Testing', points: 10, description: 'Comprehensive performance tests' },
      { criteria: 'Presentation', points: 10, description: 'Clear writing and visualizations' },
    ],
    resources: [
      { name: 'Assignment Brief.pdf', size: '178 KB', type: 'pdf' },
      { name: 'Algorithm Templates.java', size: '34 KB', type: 'java' },
      { name: 'Report Template.docx', size: '45 KB', type: 'docx' },
    ],
  },
  4: {
    id: 4,
    title: 'Software Requirements Document',
    course: 'Software Engineering Principles',
    courseCode: 'CS305',
    type: 'Documentation',
    dueDate: '2025-12-05',
    dueTime: '11:59 PM',
    status: 'in-progress',
    priority: 'medium',
    description: 'Write comprehensive software requirements specification',
    points: 75,
    submittedPoints: null,
    progress: 90,
    color: 'bg-pink-500',
    instructor: 'Prof. Lisa Anderson',
    instructorEmail: 'l.anderson@university.edu',
    dateAssigned: '2025-11-12',
    detailedDescription: `Create a complete Software Requirements Specification (SRS) document for a hypothetical software system. Follow IEEE 830 standards.

**Learning Objectives:**
- Understand requirements engineering
- Write clear and testable requirements
- Use standard documentation formats
- Identify functional and non-functional requirements

**Requirements:**
1. Follow IEEE 830 SRS template
2. Include use case diagrams
3. Define at least 20 functional requirements
4. Specify non-functional requirements (performance, security, etc.)
5. Create a requirements traceability matrix

**Submission Guidelines:**
- Submit as PDF document
- Use professional formatting
- Include all diagrams and tables
- Maximum 25 pages`,
    rubric: [
      { criteria: 'Completeness', points: 20, description: 'All sections included' },
      { criteria: 'Clarity', points: 20, description: 'Requirements are clear and testable' },
      { criteria: 'Format', points: 15, description: 'Follows IEEE 830 standards' },
      { criteria: 'Diagrams', points: 20, description: 'Quality use case diagrams' },
    ],
    resources: [
      { name: 'IEEE 830 Template.docx', size: '234 KB', type: 'docx' },
      { name: 'Sample SRS.pdf', size: '456 KB', type: 'pdf' },
      { name: 'Requirements Checklist.pdf', size: '123 KB', type: 'pdf' },
    ],
  },
};

const getDaysUntilDue = (dueDate: string) => {
  const today = new Date('2025-12-04');
  const due = new Date(dueDate);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export default function AssignmentDetails({ assignmentId, onBack }: AssignmentDetailsProps) {
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [submissionText, setSubmissionText] = useState('');
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { isDark } = useTheme() as any;

  // Fetch assignment details from API
  const { data: assignment, loading: loadingAssignment } = useApi(
    () => AssignmentService.getById(String(assignmentId)),
    [assignmentId]
  );

  // Fetch my submission status
  const { data: mySubmission, refetch: refetchSubmission } = useApi(
    () => AssignmentService.getMySubmission(String(assignmentId)),
    [assignmentId]
  );

  // Mutation for submitting assignment
  const { mutate: submitAssignment, loading: submitting } = useMutation(
    async (data: { text: string; files: File[] }) => {
      if (data.files.length > 0) {
        // Submit with file
        return AssignmentService.submitFile(
          String(assignmentId),
          data.files[0],
          data.text || undefined
        );
      } else if (data.text) {
        // Submit text only
        return AssignmentService.submitText(String(assignmentId), data.text);
      }
      throw new Error('No content to submit');
    }
  );

  if (loadingAssignment) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[var(--accent-color)] mx-auto mb-4 animate-spin" />
          <p className="text-slate-600">Loading assignment...</p>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-slate-800 mb-2 font-semibold">Assignment Not Found</h2>
          <p className="text-slate-600 mb-4">The assignment you're looking for doesn't exist.</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-[var(--accent-color)] text-white rounded-lg hover:opacity-90"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Calculate days until due
  const daysUntil = assignment.dueDate 
    ? getDaysUntilDue(assignment.dueDate.split('T')[0])
    : null;
  
  // Check if already submitted
  const isSubmitted = mySubmission !== null;
  const submissionStatus = mySubmission?.submissionStatus || 'Not submitted';

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachedFiles([...attachedFiles, ...Array.from(e.target.files)]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles(attachedFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    setShowSubmitConfirmation(true);
  };

  const confirmSubmit = async () => {
    setShowSubmitConfirmation(false);
    try {
      await submitAssignment({
        text: submissionText,
        files: attachedFiles
      });
      refetchSubmission(); // Refresh submission status
      setShowSuccessModal(true);
      setAttachedFiles([]); // Clear files
      setSubmissionText(''); // Clear text
    } catch (error) {
      console.error('Submit failed:', error);
      // TODO: Show error toast/message
      alert('Failed to submit assignment. Please try again.');
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    onBack();
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Assignments</span>
        </button>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span
                className={`px-2 py-0.5 rounded-md text-xs font-medium border ${isDark ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
              >
                Assignment #{assignment.id}
              </span>
              <span
                className={`px-2 py-0.5 rounded-md text-xs font-medium border ${isDark ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
              >
                {assignment.submissionType || 'Assignment'}
              </span>
              <span
                className={`px-2 py-0.5 rounded-md text-xs font-medium border ${
                  assignment.status === 'published'
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : assignment.status === 'draft'
                    ? 'bg-gray-50 border-gray-200 text-gray-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}
              >
                {assignment.status}
              </span>
            </div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {assignment.title}
            </h2>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              {assignment.course?.code} - {assignment.course?.name}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div
          className={`${isDark ? 'bg-card-dark' : 'bg-white'} rounded-2xl p-5 border-2 ${isDark ? 'border-white/5' : 'border-slate-50'} shadow-sm`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
              <Calendar className={`w-5 h-5 text-[var(--accent-color)]`} />
            </div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Due Date
            </p>
          </div>
          <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {assignment.dueDate 
              ? new Date(assignment.dueDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
              : 'No due date'}
          </p>
          <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            {assignment.dueDate ? '11:59 PM' : '-'}
          </p>
        </div>

        <div
          className={`${isDark ? 'bg-card-dark' : 'bg-white'} rounded-2xl p-5 border-2 ${isDark ? 'border-white/5' : 'border-slate-50'} shadow-sm`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
              <Clock className={`w-5 h-5 ${daysUntil !== null && daysUntil <= 2 ? 'text-red-500' : 'text-amber-500'}`} />
            </div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Time Left
            </p>
          </div>
          <p
            className={`text-xl font-bold ${daysUntil !== null && daysUntil <= 2 ? 'text-red-500' : isDark ? 'text-white' : 'text-slate-900'}`}
          >
            {daysUntil !== null 
              ? (daysUntil > 0 ? `${daysUntil} days left` : daysUntil === 0 ? 'Due today' : 'Overdue')
              : 'No due date'}
          </p>
        </div>

        <div
          className={`${isDark ? 'bg-card-dark' : 'bg-white'} rounded-2xl p-5 border-2 ${isDark ? 'border-white/5' : 'border-slate-50'} shadow-sm`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
              <Award className={`w-5 h-5 text-emerald-500`} />
            </div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Points</p>
          </div>
          <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {Number(assignment.maxScore)} Points
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Assignment Details */}
          <div className="glass rounded-[2.5rem] shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-background-light to-white p-6 border-b border-slate-100">
              <h2 className="text-slate-800 font-semibold">Assignment Details</h2>
            </div>
            <div className="p-6">
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                  {assignment.detailedDescription || assignment.description || 'No description provided.'}
                </div>
              </div>
            </div>
          </div>

          {/* Grading Rubric */}
          {assignment.rubric && assignment.rubric.length > 0 && (
            <div className="glass rounded-[2.5rem] shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-background-light to-white p-6 border-b border-slate-100">
                <h2 className="text-slate-800 font-semibold">Grading Rubric</h2>
                <p className="text-slate-600 text-sm mt-1">Total: {assignment.points || assignment.maxScore} points</p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {(assignment.rubric || []).map((item: any, index: number) => (
                    <div
                      key={index}
                      className="border border-slate-100 rounded-lg p-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-slate-800 font-medium">{item.criteria}</h3>
                        <span className="px-3 py-1 bg-[var(--accent-color)]/10 text-[var(--accent-color)] rounded-lg text-sm border border-[var(--accent-color)]/20 font-medium">
                          {item.points} pts
                        </span>
                      </div>
                      <p className="text-slate-600 text-sm">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Submit Assignment */}
          <div className="glass rounded-[2.5rem] shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-background-light to-white p-6 border-b border-slate-100">
              <h2 className="text-slate-800 font-semibold">Submit Your Work</h2>
              <p className="text-slate-600 text-sm mt-1">Attach your assignment files and submit</p>
            </div>
            <div className="p-6">
              {/* File Upload Area */}
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-[var(--accent-color)] hover:bg-[var(--accent-color)]/10/50 transition-all mb-4">
                <Upload className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-800 mb-2 font-medium">Drag and drop your files here</p>
                <p className="text-slate-500 text-sm mb-4">or click to browse</p>
                <label className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent-color)] text-white rounded-lg cursor-pointer hover:opacity-90 transition-colors">
                  <Paperclip className="w-4 h-4" />
                  <span>Choose Files</span>
                  <input type="file" multiple onChange={handleFileAttach} className="hidden" />
                </label>
                <p className="text-slate-500 text-xs mt-3">
                  Supported formats: PDF, DOC, DOCX, ZIP, RAR (Max 50MB each)
                </p>
              </div>

              {/* Attached Files */}
              {attachedFiles.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-slate-800 mb-3 font-medium">
                    Attached Files ({attachedFiles.length})
                  </h3>
                  <div className="space-y-2">
                    {attachedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[var(--accent-color)]/10 rounded-lg flex items-center justify-center">
                            <File className="w-5 h-5 text-[var(--accent-color)]" />
                          </div>
                          <div>
                            <p className="text-slate-800 text-sm font-medium">{file.name}</p>
                            <p className="text-slate-500 text-xs">
                              {(file.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveFile(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitted || submitting || (attachedFiles.length === 0 && !submissionText)}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-color)] text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none font-medium"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-lg">Submitting...</span>
                  </>
                ) : isSubmitted ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-lg">Already Submitted</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span className="text-lg">Hand In Assignment</span>
                  </>
                )}
              </button>

              {!isSubmitted && attachedFiles.length === 0 && !submissionText && (
                <p className="text-amber-600 text-sm text-center mt-3 flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Please attach at least one file or enter text before submitting
                </p>
              )}
              
              {isSubmitted && mySubmission && (
                <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <p className="text-emerald-900 font-medium">Submitted</p>
                  </div>
                  <p className="text-emerald-700 text-sm">
                    Status: <span className="font-medium">{submissionStatus}</span>
                  </p>
                  <p className="text-emerald-700 text-sm">
                    Submitted at: {new Date(mySubmission.submittedAt).toLocaleString()}
                  </p>
                  {mySubmission.score && (
                    <p className="text-emerald-700 text-sm mt-1">
                      Score: <span className="font-bold">{mySubmission.score}/{assignment.maxScore}</span>
                    </p>
                  )}
                  {mySubmission.feedback && (
                    <div className="mt-2">
                      <p className="text-emerald-900 text-sm font-medium">Feedback:</p>
                      <p className="text-emerald-700 text-sm">{mySubmission.feedback}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assignment Info */}
          <div className="glass rounded-[2.5rem] shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-background-light to-white p-4 border-b border-slate-100">
              <h3 className="text-slate-800 font-semibold">Assignment Information</h3>
            </div>
            <div className="p-4 space-y-4">
              {(assignment.instructor || assignment.createdBy) && (
                <div>
                  <p className="text-slate-600 text-sm mb-1 font-medium">Instructor</p>
                  <p className="text-slate-800 font-medium">{assignment.instructor || 'Instructor Name Not Available'}</p>
                  {assignment.instructorEmail && (
                    <p className="text-[var(--accent-color)] text-sm">{assignment.instructorEmail}</p>
                  )}
                </div>
              )}
              {assignment.dateAssigned && (
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-slate-600 text-sm mb-1 font-medium">Date Assigned</p>
                  <p className="text-slate-800 font-medium">
                    {new Date(assignment.dateAssigned).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              )}
              <div className="border-t border-slate-100 pt-4">
                <p className="text-slate-600 text-sm mb-1 font-medium">Status</p>
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                    assignment.status === 'pending'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : assignment.status === 'in-progress'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-green-50 text-green-700 border border-green-200'
                  }`}
                >
                  {assignment.status === 'pending' ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : assignment.status === 'in-progress' ? (
                    <Clock className="w-4 h-4" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  <span className="capitalize">
                    {assignment.status === 'in-progress' ? 'In Progress' : assignment.status}
                  </span>
                </span>
              </div>
              <div className="border-t border-slate-100 pt-4">
                <p className="text-slate-600 text-sm mb-2 font-medium">Progress</p>
                <div className="relative">
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`${assignment.color || 'bg-blue-500'} h-2 rounded-full transition-all`}
                      style={{ width: `${assignment.progress || 0}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-slate-800 mt-2 font-medium">
                    {assignment.progress || 0}% Complete
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Downloadable Resources */}
          <div className="glass rounded-[2.5rem] shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-background-light to-white p-4 border-b border-slate-100">
              <h3 className="text-slate-800 font-semibold">Assignment Instructions</h3>
              <p className="text-slate-600 text-sm mt-1">Download required materials</p>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                {(assignment.resources || []).map((resource: any, index: number) => (
                  <button
                    key={index}
                    className="w-full flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-[var(--accent-color)]/10 hover:border-[var(--accent-color)]/50 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[var(--accent-color)]/10 rounded-lg flex items-center justify-center group-hover:bg-[var(--accent-color)]/20 transition-colors">
                        <FileText className="w-5 h-5 text-[var(--accent-color)]" />
                      </div>
                      <div className="text-left">
                        <p className="text-slate-800 text-sm group-hover:text-[var(--accent-color)] transition-colors font-medium">
                          {resource.name}
                        </p>
                        <p className="text-slate-500 text-xs">{resource.size}</p>
                      </div>
                    </div>
                    <Download className="w-5 h-5 text-slate-500 group-hover:text-[var(--accent-color)] transition-colors" />
                  </button>
                ))}
                {(!assignment.resources || assignment.resources.length === 0) && (
                  <p className="text-center text-slate-500 text-sm py-4">No resources available for this assignment</p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass rounded-[2.5rem] shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-background-light to-white p-4 border-b border-slate-100">
              <h3 className="text-slate-800 font-semibold">Quick Actions</h3>
            </div>
            <div className="p-4 space-y-2">
              <button className="w-full px-4 py-2.5 border-2 border-slate-100 rounded-lg text-slate-700 hover:bg-slate-50 transition-all text-sm font-medium">
                Ask Instructor Question
              </button>
              <button className="w-full px-4 py-2.5 border-2 border-slate-100 rounded-lg text-slate-700 hover:bg-slate-50 transition-all text-sm font-medium">
                View Class Discussion
              </button>
              <button className="w-full px-4 py-2.5 border-2 border-slate-100 rounded-lg text-slate-700 hover:bg-slate-50 transition-all text-sm font-medium">
                Request Extension
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="w-16 h-16 bg-[var(--accent-color)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-[var(--accent-color)]" />
            </div>
            <h2 className="text-slate-800 text-center mb-2 font-semibold">Submit Assignment?</h2>
            <p className="text-slate-600 text-center mb-6">
              Are you sure you want to submit this assignment? You have attached{' '}
              {attachedFiles.length} file(s).
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-900 text-sm mb-1 font-medium">Important Note</p>
                  <p className="text-amber-700 text-xs">
                    Once submitted, you may not be able to modify your submission. Make sure all
                    files are attached.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitConfirmation(false)}
                className="flex-1 px-4 py-3 border-2 border-slate-100 rounded-xl text-slate-700 hover:bg-slate-50 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmSubmit}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-color)] text-white rounded-xl hover:shadow-lg transition-all font-medium"
              >
                Confirm Submit
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 backdrop-blur-sm shadow-2xl">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Submitted!</h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Your assignment has been submitted successfully. Good luck!
            </p>
            <button
              onClick={handleSuccessClose}
              className="w-full px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-semibold shadow-lg shadow-emerald-200"
            >
              Great!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
