import * as faceapi from 'face-api.js';

export class FaceDetectionService {
  private isInitialized = false;
  private modelUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(this.modelUrl),
        faceapi.nets.faceLandmark68Net.loadFromUri(this.modelUrl),
        faceapi.nets.faceRecognitionNet.loadFromUri(this.modelUrl)
      ]);
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize face detection:', error);
      throw new Error('Face detection initialization failed');
    }
  }

  async detectFace(videoElement: HTMLVideoElement) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const detection = await faceapi
        .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();

      if (!detection) return null;

      const { box } = detection.detection;
      const landmarks = detection.landmarks;

      return {
        face: {
          x: box.x,
          y: box.y,
          width: box.width,
          height: box.height
        },
        leftEar: landmarks.getLeftEar()?.[0] ? {
          x: landmarks.getLeftEar()[0].x,
          y: landmarks.getLeftEar()[0].y
        } : undefined,
        rightEar: landmarks.getRightEar()?.[0] ? {
          x: landmarks.getRightEar()[0].x,
          y: landmarks.getRightEar()[0].y
        } : undefined,
        nose: landmarks.getNose()?.[0] ? {
          x: landmarks.getNose()[0].x,
          y: landmarks.getNose()[0].y
        } : undefined,
        leftEye: landmarks.getLeftEye()?.[0] ? {
          x: landmarks.getLeftEye()[0].x,
          y: landmarks.getLeftEye()[0].y
        } : undefined,
        rightEye: landmarks.getRightEye()?.[0] ? {
          x: landmarks.getRightEye()[0].x,
          y: landmarks.getRightEye()[0].y
        } : undefined
      };
    } catch (error) {
      console.error('Face detection error:', error);
      return null;
    }
  }

  isReady(): boolean {
    return this.isInitialized;
  }
}

export const faceDetectionService = new FaceDetectionService();
