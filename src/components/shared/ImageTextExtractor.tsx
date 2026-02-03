import { useState, useRef, useCallback } from 'react';
import { Upload, Image, FileText, Copy, Check, Loader2, X, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

interface ImageTextExtractorProps {
  onTextExtracted: (text: string) => void;
  className?: string;
  supportedFormats?: string[];
  maxFileSizeMB?: number;
}

interface ExtractedRegion {
  text: string;
  confidence: number;
  bounds: { x: number; y: number; width: number; height: number };
}

export function ImageTextExtractor({
  onTextExtracted,
  className = '',
  supportedFormats = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'],
  maxFileSizeMB = 10,
}: ImageTextExtractorProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [extractedRegions, setExtractedRegions] = useState<ExtractedRegion[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulated OCR function (in production, use Tesseract.js or cloud OCR API)
  const performOCR = async (imageUrl: string): Promise<{ text: string; regions: ExtractedRegion[] }> => {
    // Simulate OCR processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simulated extracted text (in real implementation, use Tesseract.js)
    const simulatedText = `Chapter 5: Introduction to Machine Learning

Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed.

Key Concepts:
1. Supervised Learning - Learning from labeled data
2. Unsupervised Learning - Finding patterns in unlabeled data
3. Reinforcement Learning - Learning through trial and error

Common Algorithms:
• Linear Regression
• Decision Trees
• Neural Networks
• Support Vector Machines

Applications include:
- Image recognition
- Natural language processing
- Recommendation systems
- Autonomous vehicles`;

    const regions: ExtractedRegion[] = [
      { text: 'Chapter 5: Introduction to Machine Learning', confidence: 0.98, bounds: { x: 50, y: 20, width: 400, height: 30 } },
      { text: 'Machine learning is a subset of artificial intelligence...', confidence: 0.95, bounds: { x: 50, y: 60, width: 450, height: 50 } },
      { text: 'Key Concepts:', confidence: 0.99, bounds: { x: 50, y: 120, width: 150, height: 25 } },
    ];

    return { text: simulatedText, regions };
  };

  const processImage = useCallback(async (file: File) => {
    // Validate file type
    if (!supportedFormats.includes(file.type)) {
      setError(`Unsupported format. Please use: ${supportedFormats.map(f => f.split('/')[1]).join(', ')}`);
      return;
    }

    // Validate file size
    if (file.size > maxFileSizeMB * 1024 * 1024) {
      setError(`File too large. Maximum size: ${maxFileSizeMB}MB`);
      return;
    }

    setError(null);
    setIsExtracting(true);
    setExtractedText('');
    setExtractedRegions([]);

    // Create preview
    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageUrl = e.target?.result as string;
      setImagePreview(imageUrl);

      try {
        const { text, regions } = await performOCR(imageUrl);
        setExtractedText(text);
        setExtractedRegions(regions);
      } catch (err) {
        setError('Failed to extract text. Please try again.');
      } finally {
        setIsExtracting(false);
      }
    };
    reader.readAsDataURL(file);
  }, [supportedFormats, maxFileSizeMB]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      processImage(file);
    }
  }, [processImage]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file);
    }
  }, [processImage]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(extractedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Failed to copy text');
    }
  };

  const useExtractedText = () => {
    if (extractedText) {
      onTextExtracted(extractedText);
    }
  };

  const resetExtractor = () => {
    setImagePreview(null);
    setExtractedText('');
    setExtractedRegions([]);
    setError(null);
    setZoom(100);
    setRotation(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="text-purple-600" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Image to Text</h3>
              <p className="text-sm text-gray-600">Extract text from images using OCR</p>
            </div>
          </div>
          {imagePreview && (
            <button
              onClick={resetExtractor}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {!imagePreview ? (
          /* Upload Area */
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
              ${isDragging
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
              }
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={supportedFormats.join(',')}
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="flex flex-col items-center gap-4">
              <div className={`p-4 rounded-full ${isDragging ? 'bg-purple-100' : 'bg-gray-100'}`}>
                <Image size={32} className={isDragging ? 'text-purple-600' : 'text-gray-400'} />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {isDragging ? 'Drop image here' : 'Drop an image or click to upload'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Supports PNG, JPEG, WebP, GIF (max {maxFileSizeMB}MB)
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Image Preview and Extraction */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Image Preview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Source Image</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setZoom((z) => Math.max(z - 25, 25))}
                    className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                    title="Zoom out"
                  >
                    <ZoomOut size={16} className="text-gray-600" />
                  </button>
                  <span className="text-xs text-gray-500 w-12 text-center">{zoom}%</span>
                  <button
                    onClick={() => setZoom((z) => Math.min(z + 25, 200))}
                    className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                    title="Zoom in"
                  >
                    <ZoomIn size={16} className="text-gray-600" />
                  </button>
                  <button
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                    className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                    title="Rotate"
                  >
                    <RotateCw size={16} className="text-gray-600" />
                  </button>
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 h-64 flex items-center justify-center">
                <img
                  src={imagePreview}
                  alt="Uploaded"
                  className="max-h-full max-w-full object-contain transition-transform"
                  style={{
                    transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  }}
                />
              </div>
            </div>

            {/* Extracted Text */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Extracted Text</span>
                {extractedText && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    >
                      {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                )}
              </div>

              <div className="border border-gray-200 rounded-lg h-64 overflow-y-auto bg-gray-50">
                {isExtracting ? (
                  <div className="h-full flex flex-col items-center justify-center gap-3">
                    <Loader2 size={32} className="text-purple-600 animate-spin" />
                    <p className="text-sm text-gray-600">Extracting text from image...</p>
                  </div>
                ) : extractedText ? (
                  <pre className="p-4 text-sm text-gray-900 whitespace-pre-wrap font-sans">
                    {extractedText}
                  </pre>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-sm text-gray-500">No text extracted yet</p>
                  </div>
                )}
              </div>

              {/* Confidence Indicator */}
              {extractedRegions.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">Average confidence:</span>
                  <span className="font-medium text-green-600">
                    {Math.round(
                      (extractedRegions.reduce((sum, r) => sum + r.confidence, 0) /
                        extractedRegions.length) *
                        100
                    )}%
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2">
            <X size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        {extractedText && !isExtracting && (
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={resetExtractor}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Upload New Image
            </button>
            <button
              onClick={useExtractedText}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <Check size={18} />
              Use Extracted Text
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageTextExtractor;
