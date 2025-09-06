import { useState, useEffect, useCallback, useRef } from 'react';
import { FaceLandmarks } from '@/types/ar-types';
import { faceDetectionService } from '@/lib/face-detection';

export function useFaceDetection(videoElement: HTMLVideoElement | null, isActive: boolean) {
  const [faceLandmarks, setFaceLandmarks] = useState<FaceLandmarks | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const animationFrameRef = useRef<number>();

  const detectFace = useCallback(async () => {
    if (!videoElement || !isActive || !faceDetectionService.isReady()) {
      return;
    }

    // Check if video is actually playing and has dimensions
    if (videoElement.readyState < 2 || videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
      // Video not ready yet, schedule retry
      if (isActive) {
        animationFrameRef.current = requestAnimationFrame(detectFace);
      }
      return;
    }

    try {
      const landmarks = await faceDetectionService.detectFace(videoElement);
      setFaceLandmarks(landmarks);
      setError(null);
    } catch (err) {
      // Silently handle face detection errors - they're expected when no face is visible
      setError(err instanceof Error ? err.message : 'Face detection failed');
      // Don't stop detection on errors, just continue
    }

    // Schedule next detection
    if (isActive) {
      animationFrameRef.current = requestAnimationFrame(detectFace);
    }
  }, [videoElement, isActive]);

  const initializeFaceDetection = useCallback(async () => {
    try {
      setError(null);
      await faceDetectionService.initialize();
      setIsInitialized(true);
    } catch (err) {
      console.error('Face detection initialization error:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize face detection');
    }
  }, []);

  useEffect(() => {
    if (isActive && !isInitialized) {
      initializeFaceDetection();
    }
  }, [isActive, isInitialized, initializeFaceDetection]);

  useEffect(() => {
    if (isActive && isInitialized && videoElement) {
      // Wait a bit for video to be fully ready before starting detection
      const timer = setTimeout(() => {
        detectFace();
      }, 500);
      
      return () => {
        clearTimeout(timer);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, isInitialized, videoElement, detectFace]);

  return {
    faceLandmarks,
    isInitialized,
    error
  };
}
