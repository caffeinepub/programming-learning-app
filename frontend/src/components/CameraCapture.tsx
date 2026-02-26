import { useEffect } from 'react';
import { Camera, X, RotateCcw, ZapOff } from 'lucide-react';
import { useCamera } from '../camera/useCamera';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
  studentName: string;
}

export default function CameraCapture({ onCapture, onClose, studentName }: CameraCaptureProps) {
  const {
    isActive,
    isSupported,
    error,
    isLoading,
    startCamera,
    stopCamera,
    capturePhoto,
    videoRef,
    canvasRef,
  } = useCamera({
    facingMode: 'environment',
    quality: 0.85,
    format: 'image/jpeg',
  });

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCapture = async () => {
    const file = await capturePhoto();
    if (file) {
      onCapture(file);
      stopCamera();
      onClose();
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="bg-navy text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-teal-300" />
            <span className="font-semibold text-sm">Capture Photo</span>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg hover:bg-navy-700 transition-colors"
            aria-label="Close camera"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Student name */}
        <div className="px-4 py-2 bg-muted/50 border-b border-border">
          <p className="text-xs text-muted-foreground">
            Taking photo for: <span className="font-semibold text-foreground">{studentName}</span>
          </p>
        </div>

        {/* Camera Preview */}
        <div className="relative bg-black" style={{ minHeight: 280 }}>
          {isSupported === false ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3 p-6 text-center">
              <ZapOff className="w-10 h-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Camera is not supported in this browser.</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3 p-6 text-center">
              <ZapOff className="w-10 h-10 text-red-400" />
              <p className="text-sm text-red-500 font-medium">{error.message}</p>
              <button
                onClick={() => startCamera()}
                className="flex items-center gap-1.5 text-xs text-teal-500 hover:text-teal-600 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Try again
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full object-cover"
                style={{ minHeight: 280, aspectRatio: '4/3' }}
              />
              {isLoading && !isActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <div className="flex flex-col items-center gap-2">
                    <svg className="animate-spin w-8 h-8 text-teal-400" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span className="text-white text-xs">Starting camera...</span>
                  </div>
                </div>
              )}
            </>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Actions */}
        <div className="p-4 flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCapture}
            disabled={!isActive || isLoading}
            className="flex-1 py-2.5 rounded-xl bg-teal-500 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Camera className="w-4 h-4" />
            Snap Photo
          </button>
        </div>
      </div>
    </div>
  );
}
