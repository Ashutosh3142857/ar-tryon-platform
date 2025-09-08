import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { FACEMESH_TESSELATION, FACEMESH_RIGHT_EYE, FACEMESH_LEFT_EYE, FACEMESH_FACE_OVAL, FACEMESH_LIPS } from '@mediapipe/face_mesh';

export interface AdvancedFaceLandmarks {
  landmarks: Array<{x: number, y: number, z: number}>;
  faceOval: Array<{x: number, y: number, z: number}>;
  leftEye: Array<{x: number, y: number, z: number}>;
  rightEye: Array<{x: number, y: number, z: number}>;
  lips: Array<{x: number, y: number, z: number}>;
  nose: Array<{x: number, y: number, z: number}>;
  eyebrows: {
    left: Array<{x: number, y: number, z: number}>;
    right: Array<{x: number, y: number, z: number}>;
  };
  faceGeometry: {
    width: number;
    height: number;
    center: {x: number, y: number, z: number};
    rotation: {x: number, y: number, z: number};
    scale: number;
  };
  confidence: number;
}

export interface FaceMeshData {
  landmarks: Array<{x: number, y: number, z: number}>;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

class AdvancedFaceDetectionService {
  private faceMesh: FaceMesh | null = null;
  private camera: Camera | null = null;
  private isInitialized = false;
  private isProcessing = false;
  private lastDetectionTime = 0;
  private smoothingBuffer: AdvancedFaceLandmarks[] = [];
  private maxBufferSize = 3;

  // Key facial landmark indices for different features
  private readonly LANDMARK_INDICES = {
    // Face oval outline (17 points)
    faceOval: [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400],
    
    // Eyes (12 points each)
    leftEye: [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158],
    rightEye: [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387],
    
    // Eyebrows (10 points each) 
    leftEyebrow: [46, 53, 52, 51, 48, 115, 131, 134, 102, 49],
    rightEyebrow: [276, 283, 282, 281, 278, 344, 360, 363, 331, 279],
    
    // Nose (19 points)
    nose: [1, 2, 5, 4, 6, 19, 20, 94, 125, 141, 235, 236, 3, 51, 48, 115, 131, 134, 102],
    
    // Lips (20 points)
    lips: [61, 84, 17, 314, 405, 320, 307, 375, 321, 308, 324, 318, 78, 95, 88, 178, 87, 14, 317, 402],
    
    // Chin and jaw (15 points)
    jawline: [172, 136, 150, 149, 176, 148, 152, 377, 400, 378, 379, 365, 397, 288, 361]
  };

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.faceMesh = new FaceMesh({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        }
      });

      this.faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      this.isInitialized = true;
    } catch (error) {
      console.error('Advanced face detection initialization failed:', error);
      throw error;
    }
  }

  async detectAdvancedFace(videoElement: HTMLVideoElement): Promise<AdvancedFaceLandmarks | null> {
    if (!this.isInitialized || !this.faceMesh || this.isProcessing) {
      return null;
    }

    // Throttle detection to improve performance
    const now = Date.now();
    if (now - this.lastDetectionTime < 33) { // ~30 FPS max
      return this.getSmoothedLandmarks();
    }

    this.isProcessing = true;
    this.lastDetectionTime = now;

    try {
      return new Promise((resolve) => {
        this.faceMesh!.onResults((results) => {
          this.isProcessing = false;
          
          if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            const landmarks = results.multiFaceLandmarks[0];
            const advancedLandmarks = this.extractAdvancedLandmarks(landmarks, videoElement);
            
            // Add to smoothing buffer
            this.addToSmoothingBuffer(advancedLandmarks);
            
            resolve(this.getSmoothedLandmarks());
          } else {
            resolve(null);
          }
        });

        this.faceMesh!.send({ image: videoElement });
      });
    } catch (error) {
      this.isProcessing = false;
      console.error('Advanced face detection error:', error);
      return null;
    }
  }

  private extractAdvancedLandmarks(landmarks: any[], videoElement: HTMLVideoElement): AdvancedFaceLandmarks {
    const videoWidth = videoElement.videoWidth;
    const videoHeight = videoElement.videoHeight;

    // Convert landmarks to screen coordinates with depth
    const convertedLandmarks = landmarks.map(landmark => ({
      x: landmark.x * videoWidth,
      y: landmark.y * videoHeight,
      z: landmark.z || 0
    }));

    // Extract specific facial features
    const faceOval = this.LANDMARK_INDICES.faceOval.map(i => convertedLandmarks[i]);
    const leftEye = this.LANDMARK_INDICES.leftEye.map(i => convertedLandmarks[i]);
    const rightEye = this.LANDMARK_INDICES.rightEye.map(i => convertedLandmarks[i]);
    const lips = this.LANDMARK_INDICES.lips.map(i => convertedLandmarks[i]);
    const nose = this.LANDMARK_INDICES.nose.map(i => convertedLandmarks[i]);
    const leftEyebrow = this.LANDMARK_INDICES.leftEyebrow.map(i => convertedLandmarks[i]);
    const rightEyebrow = this.LANDMARK_INDICES.rightEyebrow.map(i => convertedLandmarks[i]);

    // Calculate face geometry
    const faceGeometry = this.calculateFaceGeometry(faceOval, leftEye, rightEye);

    return {
      landmarks: convertedLandmarks,
      faceOval,
      leftEye,
      rightEye,
      lips,
      nose,
      eyebrows: {
        left: leftEyebrow,
        right: rightEyebrow
      },
      faceGeometry,
      confidence: 0.85 // Mock confidence score
    };
  }

  private calculateFaceGeometry(faceOval: any[], leftEye: any[], rightEye: any[]) {
    // Calculate face center
    const faceCenter = faceOval.reduce((acc, point) => ({
      x: acc.x + point.x,
      y: acc.y + point.y,
      z: acc.z + point.z
    }), { x: 0, y: 0, z: 0 });

    faceCenter.x /= faceOval.length;
    faceCenter.y /= faceOval.length;
    faceCenter.z /= faceOval.length;

    // Calculate face dimensions
    const minX = Math.min(...faceOval.map(p => p.x));
    const maxX = Math.max(...faceOval.map(p => p.x));
    const minY = Math.min(...faceOval.map(p => p.y));
    const maxY = Math.max(...faceOval.map(p => p.y));

    const width = maxX - minX;
    const height = maxY - minY;

    // Calculate rotation based on eye positions
    const eyeCenter = {
      x: (leftEye[0].x + rightEye[0].x) / 2,
      y: (leftEye[0].y + rightEye[0].y) / 2
    };

    const eyeAngle = Math.atan2(rightEye[0].y - leftEye[0].y, rightEye[0].x - leftEye[0].x);
    
    // Calculate scale based on eye distance
    const eyeDistance = Math.sqrt(
      Math.pow(rightEye[0].x - leftEye[0].x, 2) + 
      Math.pow(rightEye[0].y - leftEye[0].y, 2)
    );
    const scale = eyeDistance / 100; // Normalize to typical eye distance

    return {
      width,
      height,
      center: faceCenter,
      rotation: {
        x: 0,
        y: 0,
        z: eyeAngle
      },
      scale
    };
  }

  private addToSmoothingBuffer(landmarks: AdvancedFaceLandmarks): void {
    this.smoothingBuffer.push(landmarks);
    if (this.smoothingBuffer.length > this.maxBufferSize) {
      this.smoothingBuffer.shift();
    }
  }

  private getSmoothedLandmarks(): AdvancedFaceLandmarks | null {
    if (this.smoothingBuffer.length === 0) return null;

    // Simple average smoothing
    const bufferSize = this.smoothingBuffer.length;
    const smoothed = this.smoothingBuffer[0]; // Use structure from first item

    // Average all landmarks
    smoothed.landmarks = smoothed.landmarks.map((_, index) => {
      const avgPoint = this.smoothingBuffer.reduce((acc, frame) => ({
        x: acc.x + frame.landmarks[index].x,
        y: acc.y + frame.landmarks[index].y,
        z: acc.z + frame.landmarks[index].z
      }), { x: 0, y: 0, z: 0 });

      return {
        x: avgPoint.x / bufferSize,
        y: avgPoint.y / bufferSize,
        z: avgPoint.z / bufferSize
      };
    });

    return smoothed;
  }

  isReady(): boolean {
    return this.isInitialized && this.faceMesh !== null;
  }

  cleanup(): void {
    if (this.faceMesh) {
      this.faceMesh.close();
      this.faceMesh = null;
    }
    if (this.camera) {
      this.camera.stop();
      this.camera = null;
    }
    this.isInitialized = false;
    this.smoothingBuffer = [];
  }
}

export const advancedFaceDetectionService = new AdvancedFaceDetectionService();