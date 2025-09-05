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

    try {
      const landmarks = await faceDetectionService.detectFace(videoElement);
      setFaceLandmarks(landmarks);
      setError(null);
    } catch (err) {
      console.error('Face detection error:', err);
      setError(err instanceof Error ? err.message : 'Face detection failed');
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
      detectFace();
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
