import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useCamera } from '@/hooks/use-camera';
import { Camera, CameraOff, RotateCcw } from 'lucide-react';

interface CameraFeedProps {
  onVideoRef: (video: HTMLVideoElement | null) => void;
  className?: string;
}

export function CameraFeed({ onVideoRef, className = '' }: CameraFeedProps) {
  const { videoRef, cameraState, startCamera, stopCamera, switchCamera, setCameraState } = useCamera();

  useEffect(() => {
    if (videoRef.current) {
      onVideoRef(videoRef.current);
    }
  }, [videoRef.current, onVideoRef]);

  useEffect(() => {
    // Don't auto-start camera - let user explicitly request it
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  if (!cameraState.isActive && !cameraState.isLoading) {
    return (
      <div className={`camera-feed flex items-center justify-center ${className}`} data-testid="camera-placeholder">
        <div className="text-center text-white/60 max-w-md mx-auto">
          <Camera className="w-16 h-16 mx-auto mb-4" />
          <p className="text-lg font-light mb-4">Camera Access Required</p>
          <p className="text-sm mb-4">Enable camera to start AR try-on experience</p>
          {cameraState.error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4">
              <p className="text-red-300 text-sm font-medium mb-1">Camera Error</p>
              <p className="text-red-200 text-xs">{cameraState.error}</p>
              {cameraState.error.includes('permission') && (
                <p className="text-red-200 text-xs mt-2">
                  💡 Tip: Click the camera icon in your browser's address bar to enable camera access
                </p>
              )}
              {cameraState.error.includes('not found') && (
                <p className="text-red-200 text-xs mt-2">
                  💡 Tip: This demo works best with a physical camera device
                </p>
              )}
            </div>
          )}
          <div className="flex flex-col gap-3">
            <Button 
              onClick={startCamera} 
              className="bg-primary hover:bg-primary/90"
              data-testid="button-start-camera"
            >
              <Camera className="w-4 h-4 mr-2" />
              {cameraState.error ? 'Try Again' : 'Start Camera'}
            </Button>
            
            {cameraState.error && cameraState.error.includes('not found') && (
              <Button 
                onClick={() => {
                  // Demo mode with static background
                  if (videoRef.current) {
                    videoRef.current.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                    videoRef.current.style.backgroundSize = 'cover';
                  }
                  setCameraState(prev => ({
                    ...prev,
                    isActive: true,
                    isLoading: false,
                    error: null,
                    stream: null
                  }));
                  onVideoRef(videoRef.current);
                }}
                variant="outline"
                className="bg-secondary/50 border-secondary hover:bg-secondary/70"
                data-testid="button-demo-mode"
              >
                Try Demo Mode
              </Button>
            )}
          </div>
          
          {!cameraState.error && (
            <p className="text-xs text-white/40 mt-3">
              Works best in Chrome, Firefox, or Safari
            </p>
          )}
        </div>
      </div>
    );
  }

  if (cameraState.isLoading) {
    return (
      <div className={`camera-feed flex items-center justify-center ${className}`} data-testid="camera-loading">
        <div className="text-center text-white/60">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg font-light">Initializing Camera...</p>
          <p className="text-sm mt-2">Please allow camera access</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} data-testid="camera-feed-active">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        muted
        autoPlay
        controls={false}
        data-testid="camera-video"
      />
      
      {/* Camera Controls */}
      <div className="absolute top-4 right-4 flex gap-2">
        <Button
          size="sm"
          variant="ghost"
          className="floating-control rounded-full p-2"
          onClick={switchCamera}
          data-testid="button-switch-camera"
        >
          <RotateCcw className="w-4 h-4 text-white" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="floating-control rounded-full p-2"
          onClick={stopCamera}
          data-testid="button-stop-camera"
        >
          <CameraOff className="w-4 h-4 text-white" />
        </Button>
      </div>
    </div>
  );
}
