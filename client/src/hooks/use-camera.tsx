import { useState, useEffect, useRef, useCallback } from 'react';
import { CameraState } from '@/types/ar-types';

export function useCamera() {
  const [cameraState, setCameraState] = useState<CameraState>({
    isActive: false,
    isLoading: false,
    error: null,
    stream: null,
    facingMode: 'user'
  });

  const videoRef = useRef<HTMLVideoElement>(null);

  const startCamera = useCallback(async () => {
    setCameraState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera access not supported in this browser');
      }

      // Try different constraint configurations for better compatibility
      const constraintConfigs = [
        // Basic video constraint for maximum compatibility
        {
          video: true,
          audio: false
        },
        // Minimal constraints with size
        {
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 }
          },
          audio: false
        },
        // Preferred configuration with specific facing mode
        {
          video: {
            facingMode: cameraState.facingMode,
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 }
          },
          audio: false
        }
      ];

      let stream: MediaStream | null = null;
      let lastError: Error | null = null;

      // Try each constraint configuration
      for (let i = 0; i < constraintConfigs.length; i++) {
        const constraints = constraintConfigs[i];
        try {
          console.log(`Trying camera constraint config ${i + 1}:`, constraints);
          stream = await navigator.mediaDevices.getUserMedia(constraints);
          console.log('Camera stream obtained successfully:', stream);
          break;
        } catch (err) {
          lastError = err instanceof Error ? err : new Error('Unknown camera error');
          console.warn(`Camera constraint ${i + 1} failed:`, err);
          console.warn('Error details:', {
            name: err instanceof Error ? err.name : 'unknown',
            message: err instanceof Error ? err.message : 'unknown error'
          });
          continue;
        }
      }

      if (!stream) {
        throw lastError || new Error('Camera access failed with all configurations');
      }
      
      // Wait for video element if it's not ready yet
      if (!videoRef.current) {
        // Retry after a short delay to handle timing issues
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.muted = true;
            videoRef.current.playsInline = true;
            videoRef.current.autoplay = true;
            videoRef.current.play().catch(console.warn);
          }
        }, 100);
      }
      
      if (videoRef.current) {
        // Force stop any existing stream
        if (videoRef.current.srcObject) {
          const existingStream = videoRef.current.srcObject as MediaStream;
          existingStream.getTracks().forEach(track => track.stop());
        }
        
        // Set the new stream
        videoRef.current.srcObject = stream;
        
        // Force video properties
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        videoRef.current.autoplay = true;
        
        // Try to play
        videoRef.current.play().catch(console.warn);
      }

      setCameraState(prev => ({
        ...prev,
        isActive: true,
        isLoading: false,
        stream,
        error: null
      }));

    } catch (error) {
      console.error('Camera access error:', error);
      
      let errorMessage = 'Camera access failed';
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          errorMessage = 'Camera permission denied. Please allow camera access and refresh the page.';
        } else if (error.name === 'NotFoundError' || error.name === 'DeviceNotFoundError') {
          errorMessage = 'No camera found. Please connect a camera device.';
        } else if (error.name === 'NotSupportedError') {
          errorMessage = 'Camera not supported in this browser. Try Chrome, Firefox, or Safari.';
        } else if (error.name === 'NotReadableError') {
          errorMessage = 'Camera is being used by another application. Please close other apps using the camera.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setCameraState(prev => ({
        ...prev,
        isActive: false,
        isLoading: false,
        error: errorMessage
      }));
    }
  }, [cameraState.facingMode]);

  const stopCamera = useCallback(() => {
    if (cameraState.stream) {
      cameraState.stream.getTracks().forEach(track => track.stop());
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraState(prev => ({
      ...prev,
      isActive: false,
      stream: null,
      error: null
    }));
  }, [cameraState.stream]);

  const switchCamera = useCallback(() => {
    const newFacingMode = cameraState.facingMode === 'user' ? 'environment' : 'user';
    setCameraState(prev => ({ ...prev, facingMode: newFacingMode }));
    
    if (cameraState.isActive) {
      stopCamera();
      // Restart with new facing mode
      setTimeout(() => {
        startCamera();
      }, 100);
    }
  }, [cameraState.facingMode, cameraState.isActive, stopCamera, startCamera]);

  const capturePhoto = useCallback((): string | null => {
    if (!videoRef.current || !cameraState.isActive) {
      console.warn('Cannot capture: video not ready or camera not active');
      return null;
    }

    // Check if video has proper dimensions
    if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
      console.warn('Cannot capture: video dimensions not ready');
      return null;
    }

    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        console.error('Cannot get canvas context');
        return null;
      }

      // Set canvas dimensions to match video
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      // Draw the current video frame to canvas
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      // Convert to data URL
      const dataURL = canvas.toDataURL('image/jpeg', 0.9);
      console.log('Photo captured successfully');
      return dataURL;
    } catch (error) {
      console.error('Error capturing photo:', error);
      return null;
    }
  }, [cameraState.isActive]);

  useEffect(() => {
    return () => {
      if (cameraState.stream) {
        cameraState.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraState.stream]);

  return {
    videoRef,
    cameraState,
    setCameraState,
    startCamera,
    stopCamera,
    switchCamera,
    capturePhoto
  };
}
