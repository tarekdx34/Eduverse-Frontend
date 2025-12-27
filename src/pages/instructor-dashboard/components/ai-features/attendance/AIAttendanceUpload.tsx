import React, { useState } from 'react';
import { Camera, History, Upload } from 'lucide-react';
import { FileUploadZone, AIProcessingAnimation } from '../shared';

interface AIAttendanceUploadProps {
  onProcessingComplete: (results: any) => void;
  courseSection: string;
}

export function AIAttendanceUpload({
  onProcessingComplete,
  courseSection,
}: AIAttendanceUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleProcess = () => {
    if (!selectedFile) return;

    setIsProcessing(true);

    // Simulate AI processing (5 seconds)
    setTimeout(() => {
      // Generate mock attendance results
      const mockResults = generateMockAttendance(courseSection);
      setIsProcessing(false);
      onProcessingComplete({
        photoName: selectedFile.name,
        ...mockResults,
      });
    }, 5000);
  };

  if (isProcessing) {
    return (
      <AIProcessingAnimation
        message="Detecting faces and marking attendance..."
        duration={5000}
        showNote={true}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-indigo-100 rounded-lg">
          <Camera className="text-indigo-600" size={24} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">AI-Powered Attendance</h3>
          <p className="text-sm text-gray-500">
            Upload a class photo to automatically mark attendance
          </p>
        </div>
      </div>

      {/* Upload Zone */}
      <FileUploadZone
        onFileSelect={handleFileSelect}
        acceptedTypes=".jpg,.jpeg,.png"
        maxSizeMB={5}
        label="Upload Class Photo"
        description="Drag and drop or click to browse"
        icon="image"
      />

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">📸 Photo Guidelines:</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Ensure all students are clearly visible</li>
          <li>Good lighting and focus are important</li>
          <li>Avoid blurry or low-resolution images</li>
          <li>Students should face the camera</li>
        </ul>
      </div>

      {/* Process Button */}
      {selectedFile && (
        <button
          onClick={handleProcess}
          className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold flex items-center justify-center gap-2"
        >
          <Upload size={20} />
          Process with AI
        </button>
      )}
    </div>
  );
}

// Helper function to generate mock attendance
function generateMockAttendance(courseSection: string) {
  const students = [
    'Ahmed Hassan',
    'Sara Mohamed',
    'Omar Ali',
    'Fatima Khalil',
    'Youssef Ibrahim',
    'Layla Ahmed',
    'Khaled Samir',
    'Nour El-Din',
    'Mona Farid',
    'Hassan Mahmoud',
    'Dina Youssef',
    'Tarek Nabil',
    'Rania Hossam',
    'Amr Sayed',
    'Heba Mostafa',
    'Karim Ashraf',
    'Salma Hassan',
    'Mahmoud Ali',
    'Yasmin Khaled',
    'Adel Ibrahim',
    'Mariam Samir',
    'Ziad Nasser',
    'Nada Fathy',
    'Sherif Magdy',
    'Aya Mohamed',
    'Mostafa Ahmed',
    'Rana Waleed',
    'Bassem Fouad',
    'Noha Essam',
    'Wael Tamer',
  ];

  const results = students.map((name, index) => {
    const random = Math.random();
    let status: 'present' | 'absent' | 'uncertain';
    let confidence: number;

    if (random > 0.85) {
      // 15% absent
      status = 'absent';
      confidence = 0;
    } else if (random > 0.75) {
      // 10% uncertain
      status = 'uncertain';
      confidence = Math.floor(Math.random() * 20) + 50; // 50-70%
    } else {
      // 75% present
      status = 'present';
      confidence = Math.floor(Math.random() * 20) + 80; // 80-100%
    }

    return {
      studentId: index + 1,
      studentName: name,
      status,
      confidence,
      manualOverride: false,
    };
  });

  const totalDetected = results.filter((r) => r.status === 'present').length;

  return {
    date: new Date(),
    courseSection,
    totalDetected,
    totalStudents: students.length,
    results,
  };
}

export default AIAttendanceUpload;
