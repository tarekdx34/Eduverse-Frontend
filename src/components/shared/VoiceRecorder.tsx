import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Square, Play, Pause, RotateCcw, Check, Loader2 } from 'lucide-react';

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  onRecordingComplete?: (audioBlob: Blob) => void;
  maxDurationSeconds?: number;
  className?: string;
  showTranscription?: boolean;
  autoTranscribe?: boolean;
}

export function VoiceRecorder({
  onTranscription,
  onRecordingComplete,
  maxDurationSeconds = 300, // 5 minutes default
  className = '',
  showTranscription = true,
  autoTranscribe = true,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcribedText, setTranscribedText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Check for Web Speech API support
  const isSpeechRecognitionSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setDuration((prev) => {
        if (prev >= maxDurationSeconds) {
          stopRecording();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  }, [maxDurationSeconds]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));

        if (onRecordingComplete) {
          onRecordingComplete(blob);
        }

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());

        // Auto transcribe if enabled
        if (autoTranscribe && isSpeechRecognitionSupported) {
          transcribeAudio();
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);
      startTimer();

      // Start speech recognition for real-time transcription
      if (autoTranscribe && isSpeechRecognitionSupported) {
        startSpeechRecognition();
      }
    } catch (err) {
      setError('Microphone access denied. Please allow microphone access.');
      console.error('Error accessing microphone:', err);
    }
  };

  const startSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscribedText((prev) => prev + finalTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      stopTimer();

      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        startTimer();
        if (recognitionRef.current) {
          recognitionRef.current.start();
        }
      } else {
        mediaRecorderRef.current.pause();
        stopTimer();
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      }
      setIsPaused(!isPaused);
    }
  };

  const resetRecording = () => {
    stopRecording();
    setAudioBlob(null);
    setAudioUrl(null);
    setTranscribedText('');
    setDuration(0);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const transcribeAudio = () => {
    setIsTranscribing(true);
    // Simulate transcription delay (in real app, this would call an API)
    setTimeout(() => {
      setIsTranscribing(false);
      if (transcribedText) {
        onTranscription(transcribedText);
      }
    }, 1000);
  };

  const confirmTranscription = () => {
    if (transcribedText) {
      onTranscription(transcribedText);
    }
  };

  const playAudio = () => {
    if (audioRef.current && audioUrl) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    return () => {
      stopTimer();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl, stopTimer]);

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
      <div className="text-center">
        {/* Recording Status */}
        <div className="mb-6">
          <div
            className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center transition-all ${
              isRecording
                ? isPaused
                  ? 'bg-yellow-100 animate-pulse'
                  : 'bg-red-100 animate-pulse'
                : audioBlob
                  ? 'bg-green-100'
                  : 'bg-gray-100'
            }`}
          >
            {isRecording ? (
              isPaused ? (
                <Pause size={40} className="text-yellow-600" />
              ) : (
                <Mic size={40} className="text-red-600" />
              )
            ) : audioBlob ? (
              <Check size={40} className="text-green-600" />
            ) : (
              <MicOff size={40} className="text-gray-400" />
            )}
          </div>

          {/* Duration */}
          <p className="text-2xl font-mono font-bold text-gray-900 mt-4">{formatTime(duration)}</p>
          <p className="text-sm text-gray-500">
            {isRecording
              ? isPaused
                ? 'Paused'
                : 'Recording...'
              : audioBlob
                ? 'Recording complete'
                : 'Ready to record'}
          </p>
        </div>

        {/* Error Message */}
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mb-6">
          {!isRecording && !audioBlob && (
            <button
              onClick={startRecording}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-medium flex items-center gap-2 transition-colors"
            >
              <Mic size={20} />
              Start Recording
            </button>
          )}

          {isRecording && (
            <>
              <button
                onClick={pauseRecording}
                className="p-3 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-full transition-colors"
              >
                {isPaused ? <Play size={24} /> : <Pause size={24} />}
              </button>
              <button
                onClick={stopRecording}
                className="p-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-full transition-colors"
              >
                <Square size={24} />
              </button>
            </>
          )}

          {audioBlob && !isRecording && (
            <>
              <button
                onClick={playAudio}
                className="p-3 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-full transition-colors"
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
              <button
                onClick={resetRecording}
                className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
              >
                <RotateCcw size={24} />
              </button>
              <button
                onClick={confirmTranscription}
                disabled={!transcribedText || isTranscribing}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-full font-medium flex items-center gap-2 transition-colors"
              >
                {isTranscribing ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Transcribing...
                  </>
                ) : (
                  <>
                    <Check size={20} />
                    Use Transcription
                  </>
                )}
              </button>
            </>
          )}
        </div>

        {/* Audio Player (hidden) */}
        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
        )}

        {/* Transcription Display */}
        {showTranscription && (transcribedText || isTranscribing) && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left">
            <p className="text-sm font-medium text-gray-700 mb-2">Transcription:</p>
            {isTranscribing ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 size={16} className="animate-spin" />
                <span>Transcribing audio...</span>
              </div>
            ) : (
              <p className="text-gray-900">{transcribedText || 'No transcription available'}</p>
            )}
          </div>
        )}

        {/* Hint */}
        {!isSpeechRecognitionSupported && (
          <p className="text-xs text-yellow-600 mt-4">
            Real-time transcription not supported in this browser. Audio will be recorded without
            transcription.
          </p>
        )}
      </div>
    </div>
  );
}

export default VoiceRecorder;
