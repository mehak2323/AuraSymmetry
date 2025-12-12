import React, { useRef, useState, useCallback } from 'react';
import { Camera, X, CheckCircle, AlertTriangle } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (base64: string) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState<boolean>(false);

  const startCamera = useCallback(async () => {
    try {
      setPermissionError(false);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setPermissionError(true);
    }
  }, []);

  const takePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Flip horizontally for mirror effect if needed, but usually raw capture is better for analysis
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(dataUrl);
        stopStream();
      }
    }
  }, []);

  const stopStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  };

  const confirmPhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  const retake = () => {
    setCapturedImage(null);
    startCamera();
  };

  React.useEffect(() => {
    startCamera();
    return () => stopStream();
  }, [startCamera]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-lg aspect-[3/4] bg-stone-900 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/20">
        
        {permissionError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-stone-900 text-stone-300">
             <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-4">
               <AlertTriangle size={32} />
             </div>
             <h3 className="text-xl font-medium text-white mb-2">Camera Access Denied</h3>
             <p className="mb-6">We need access to your camera to analyze your facial structure. Please check your browser permissions settings.</p>
             <button 
               onClick={startCamera}
               className="px-6 py-2 bg-stone-700 text-white rounded-full font-medium hover:bg-stone-600 transition"
             >
               Try Again
             </button>
          </div>
        ) : !capturedImage ? (
          <video 
            ref={videoRef} 
            className="w-full h-full object-cover transform scale-x-[-1]" 
            muted 
            playsInline 
          />
        ) : (
          <img 
            src={capturedImage} 
            alt="Captured" 
            className="w-full h-full object-cover" 
          />
        )}
        
        {/* Face Guide Overlay */}
        {!capturedImage && !permissionError && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-50">
            <div className="border-2 border-dashed border-white/50 w-48 h-64 rounded-[50%]"></div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition"
        >
          <X size={24} />
        </button>

        {!permissionError && (
          <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-6">
            {!capturedImage ? (
              <button 
                onClick={takePhoto}
                className="h-16 w-16 rounded-full border-4 border-white flex items-center justify-center bg-white/20 hover:bg-white/40 transition active:scale-95"
              >
                <div className="h-12 w-12 bg-white rounded-full" />
              </button>
            ) : (
              <>
                <button 
                  onClick={retake}
                  className="px-6 py-2 bg-stone-700 text-white rounded-full font-medium hover:bg-stone-600 transition"
                >
                  Retake
                </button>
                <button 
                  onClick={confirmPhoto}
                  className="px-6 py-2 bg-rose-500 text-white rounded-full font-medium hover:bg-rose-600 transition flex items-center gap-2"
                >
                  Use Photo <CheckCircle size={18} />
                </button>
              </>
            )}
          </div>
        )}
      </div>
      {!permissionError && (
         <p className="text-stone-400 mt-4 text-sm">Position your face within the oval in good lighting.</p>
      )}
    </div>
  );
};

export default CameraCapture;