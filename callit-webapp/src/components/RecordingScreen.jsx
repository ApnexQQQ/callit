import { useRef, useState, useEffect } from 'react';
import { XMarkIcon, BoltIcon, ClockIcon, FaceSmileIcon, MusicalNoteIcon } from '@heroicons/react/24/outline';
import { CameraIcon } from '@heroicons/react/24/solid';

function RecordingScreen({ onClose }) {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [activeTab, setActiveTab] = useState('60s');

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: true
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Could not access camera. Please allow camera permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const startRecording = () => {
    if (!stream) return;

    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    
    const chunks = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      console.log('Recording saved:', url);
      // Here you would typically upload the video
    };

    mediaRecorder.start();
    setRecordedChunks(chunks);
    setIsRecording(true);
    setRecordingTime(0);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="recording-screen">
      <div className="recording-header">
        <button className="close-recording" onClick={onClose}>
          <XMarkIcon width={28} height={28} />
        </button>
        
        <div className="recording-options">
          <span 
            className={`recording-option ${activeTab === '60s' ? 'active' : ''}`}
            onClick={() => setActiveTab('60s')}
          >
            60s
          </span>
          <span 
            className={`recording-option ${activeTab === '15s' ? 'active' : ''}`}
            onClick={() => setActiveTab('15s')}
          >
            15s
          </span>
          <span 
            className={`recording-option ${activeTab === 'LIVE' ? 'active' : ''}`}
            onClick={() => setActiveTab('LIVE')}
          >
            LIVE
          </span>
        </div>

        <button className="close-recording">
          <FaceSmileIcon width={28} height={28} />
        </button>
      </div>

      <div className="camera-preview">
        <video
          ref={videoRef}
          className="camera-video"
          autoPlay
          playsInline
          muted
        />
        
        {isRecording && (
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.6)',
            padding: '8px 16px',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{
              width: '10px',
              height: '10px',
              background: '#FE2C55',
              borderRadius: '50%',
              animation: 'pulse 1s infinite'
            }} />
            <span>{formatTime(recordingTime)}</span>
          </div>
        )}
      </div>

      <div className="recording-controls">
        <div className="recording-side-controls">
          <div className="side-control">
            <MusicalNoteIcon />
            <span>Sounds</span>
          </div>
          <div className="side-control">
            <CameraIcon />
            <span>Flip</span>
          </div>
          <div className="side-control">
            <BoltIcon />
            <span>Speed</span>
          </div>
          <div className="side-control">
            <ClockIcon />
            <span>Timer</span>
          </div>
        </div>

        <button 
          className={`record-btn ${isRecording ? 'recording' : ''}`}
          onClick={toggleRecording}
        >
          <div className={`record-inner ${isRecording ? 'stop' : ''}`} />
        </button>

        <div style={{ height: '40px' }} />
      </div>
    </div>
  );
}

export default RecordingScreen;
