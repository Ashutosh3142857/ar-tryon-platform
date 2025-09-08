import { useState, useEffect, useRef, useCallback } from 'react';
import { advancedFaceDetectionService, AdvancedFaceLandmarks } from '@/lib/advanced-face-detection';
import { AR3DMeshService, ARProductPlacement } from '@/lib/ar-3d-mesh';
import { Product, ProductCategory } from '@/types/ar-types';

export interface AdvancedARState {
  isInitialized: boolean;
  isTracking: boolean;
  faceLandmarks: AdvancedFaceLandmarks | null;
  productPlacement: ARProductPlacement | null;
  trackingConfidence: number;
  frameRate: number;
}

export function useAdvancedAR(videoElement: HTMLVideoElement | null) {
  const [arState, setARState] = useState<AdvancedARState>({
    isInitialized: false,
    isTracking: false,
    faceLandmarks: null,
    productPlacement: null,
    trackingConfidence: 0,
    frameRate: 0
  });

  const ar3DMeshServiceRef = useRef<AR3DMeshService | null>(null);
  const animationFrameRef = useRef<number>();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameCountRef = useRef(0);
  const lastFrameTimeRef = useRef(Date.now());

  // Performance monitoring
  const [performanceMetrics, setPerformanceMetrics] = useState({
    averageFrameTime: 0,
    detectionLatency: 0,
    renderTime: 0
  });

  const initializeAdvancedAR = useCallback(async () => {
    if (arState.isInitialized || !videoElement) return;

    try {
      // Initialize face detection service
      await advancedFaceDetectionService.initialize();
      
      // Initialize 3D mesh service
      if (!ar3DMeshServiceRef.current) {
        ar3DMeshServiceRef.current = new AR3DMeshService();
      }

      // Create AR canvas overlay
      if (!canvasRef.current && videoElement.parentElement) {
        const canvas = document.createElement('canvas');
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '10';
        canvas.width = videoElement.videoWidth || 640;
        canvas.height = videoElement.videoHeight || 480;
        
        videoElement.parentElement.appendChild(canvas);
        canvasRef.current = canvas;
        
        ar3DMeshServiceRef.current.initialize(canvas);
      }

      setARState(prev => ({ ...prev, isInitialized: true }));
    } catch (error) {
      console.error('Advanced AR initialization failed:', error);
    }
  }, [arState.isInitialized, videoElement]);

  const startTracking = useCallback(() => {
    if (!arState.isInitialized || arState.isTracking) return;

    setARState(prev => ({ ...prev, isTracking: true }));
    
    const trackingLoop = async () => {
      if (!videoElement || !ar3DMeshServiceRef.current || !arState.isTracking) {
        return;
      }

      const frameStartTime = Date.now();

      try {
        // Detect face landmarks
        const detectionStartTime = Date.now();
        const landmarks = await advancedFaceDetectionService.detectAdvancedFace(videoElement);
        const detectionTime = Date.now() - detectionStartTime;

        if (landmarks) {
          // Create/update 3D face mesh
          const renderStartTime = Date.now();
          
          ar3DMeshServiceRef.current.createFaceMesh(landmarks);
          ar3DMeshServiceRef.current.adaptToLighting(videoElement);
          ar3DMeshServiceRef.current.render();
          
          const renderTime = Date.now() - renderStartTime;

          // Update AR state
          setARState(prev => ({
            ...prev,
            faceLandmarks: landmarks,
            trackingConfidence: landmarks.confidence
          }));

          // Update performance metrics
          const frameTime = Date.now() - frameStartTime;
          setPerformanceMetrics(prev => ({
            averageFrameTime: (prev.averageFrameTime + frameTime) / 2,
            detectionLatency: detectionTime,
            renderTime: renderTime
          }));
        }

        // Calculate frame rate
        frameCountRef.current++;
        const now = Date.now();
        if (now - lastFrameTimeRef.current >= 1000) {
          const fps = (frameCountRef.current * 1000) / (now - lastFrameTimeRef.current);
          setARState(prev => ({ ...prev, frameRate: Math.round(fps) }));
          frameCountRef.current = 0;
          lastFrameTimeRef.current = now;
        }

      } catch (error) {
        console.error('AR tracking error:', error);
      }

      // Continue tracking loop
      if (arState.isTracking) {
        animationFrameRef.current = requestAnimationFrame(trackingLoop);
      }
    };

    trackingLoop();
  }, [arState.isInitialized, arState.isTracking, videoElement]);

  const stopTracking = useCallback(() => {
    setARState(prev => ({ ...prev, isTracking: false }));
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  const calculateProductPlacement = useCallback((
    product: Product | null,
    category: ProductCategory
  ): ARProductPlacement | null => {
    if (!arState.faceLandmarks || !ar3DMeshServiceRef.current || !product) {
      return null;
    }

    const placement = ar3DMeshServiceRef.current.calculateProductPlacement(
      arState.faceLandmarks,
      category
    );

    setARState(prev => ({ ...prev, productPlacement: placement }));
    return placement;
  }, [arState.faceLandmarks]);

  const adjustForMovement = useCallback((movement: {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    scale: number;
  }) => {
    if (!arState.productPlacement) return;

    // Apply movement smoothing and prediction
    const smoothedPlacement = {
      ...arState.productPlacement,
      position: arState.productPlacement.position.clone().add(
        new (window as any).THREE.Vector3(movement.position.x, movement.position.y, movement.position.z)
      ),
      rotation: new (window as any).THREE.Euler(
        arState.productPlacement.rotation.x + movement.rotation.x,
        arState.productPlacement.rotation.y + movement.rotation.y,
        arState.productPlacement.rotation.z + movement.rotation.z
      ),
      scale: arState.productPlacement.scale.clone().multiplyScalar(movement.scale)
    };

    setARState(prev => ({ ...prev, productPlacement: smoothedPlacement }));
  }, [arState.productPlacement]);

  const getTrackingQuality = useCallback((): 'excellent' | 'good' | 'fair' | 'poor' => {
    const confidence = arState.trackingConfidence;
    const frameRate = arState.frameRate;

    if (confidence > 0.8 && frameRate > 25) return 'excellent';
    if (confidence > 0.6 && frameRate > 20) return 'good';
    if (confidence > 0.4 && frameRate > 15) return 'fair';
    return 'poor';
  }, [arState.trackingConfidence, arState.frameRate]);

  // Auto-initialize when video is ready
  useEffect(() => {
    if (videoElement && videoElement.readyState >= 2 && !arState.isInitialized) {
      initializeAdvancedAR();
    }
  }, [videoElement, arState.isInitialized, initializeAdvancedAR]);

  // Auto-start tracking when initialized
  useEffect(() => {
    if (arState.isInitialized && !arState.isTracking) {
      startTracking();
    }
  }, [arState.isInitialized, arState.isTracking, startTracking]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracking();
      if (ar3DMeshServiceRef.current) {
        ar3DMeshServiceRef.current.dispose();
      }
      if (canvasRef.current && canvasRef.current.parentElement) {
        canvasRef.current.parentElement.removeChild(canvasRef.current);
      }
      advancedFaceDetectionService.cleanup();
    };
  }, [stopTracking]);

  return {
    arState,
    performanceMetrics,
    initializeAdvancedAR,
    startTracking,
    stopTracking,
    calculateProductPlacement,
    adjustForMovement,
    getTrackingQuality,
    canvasRef
  };
}