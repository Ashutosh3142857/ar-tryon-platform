import { Pose } from '@mediapipe/pose';
import { SelfieSegmentation } from '@mediapipe/selfie_segmentation';
import * as bodyPix from '@tensorflow-models/body-pix';
import * as tf from '@tensorflow/tfjs';

export interface BodyLandmarks {
  // Upper body key points
  leftShoulder: { x: number; y: number; z?: number };
  rightShoulder: { x: number; y: number; z?: number };
  leftElbow: { x: number; y: number; z?: number };
  rightElbow: { x: number; y: number; z?: number };
  leftWrist: { x: number; y: number; z?: number };
  rightWrist: { x: number; y: number; z?: number };
  
  // Torso points
  leftHip: { x: number; y: number; z?: number };
  rightHip: { x: number; y: number; z?: number };
  chest: { x: number; y: number; z?: number }; // Calculated center point
  
  // Lower body
  leftKnee: { x: number; y: number; z?: number };
  rightKnee: { x: number; y: number; z?: number };
  leftAnkle: { x: number; y: number; z?: number };
  rightAnkle: { x: number; y: number; z?: number };
  
  // Body dimensions
  shoulderWidth: number;
  torsoHeight: number;
  armSpan: number;
  confidence: number;
}

export interface ClothingRegions {
  shirt: {
    topLeft: { x: number; y: number };
    topRight: { x: number; y: number };
    bottomLeft: { x: number; y: number };
    bottomRight: { x: number; y: number };
    center: { x: number; y: number };
  };
  pants: {
    topLeft: { x: number; y: number };
    topRight: { x: number; y: number };
    bottomLeft: { x: number; y: number };
    bottomRight: { x: number; y: number };
    center: { x: number; y: number };
  };
  shoes: {
    left: { x: number; y: number; width: number; height: number };
    right: { x: number; y: number; width: number; height: number };
  };
}

class BodyVisionService {
  private pose: Pose | null = null;
  private selfieSegmentation: SelfieSegmentation | null = null;
  private bodyPixModel: any = null;
  private isInitialized = false;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize TensorFlow.js
      await tf.ready();

      // Initialize MediaPipe Pose
      this.pose = new Pose({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        }
      });

      this.pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: true,
        smoothSegmentation: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      // Initialize Selfie Segmentation for body masking
      this.selfieSegmentation = new SelfieSegmentation({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
        }
      });

      this.selfieSegmentation.setOptions({
        modelSelection: 1,
        selfieMode: true,
      });

      // Initialize BodyPix for clothing segmentation
      this.bodyPixModel = await bodyPix.load({
        architecture: 'MobileNetV1',
        outputStride: 16,
        multiplier: 0.75,
        quantBytes: 2
      });

      // Create canvas for processing
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');

      this.isInitialized = true;
      console.log('Body vision models initialized successfully');
    } catch (error) {
      console.error('Body vision initialization failed:', error);
      throw error;
    }
  }

  async detectBodyLandmarks(videoElement: HTMLVideoElement): Promise<BodyLandmarks | null> {
    if (!this.isInitialized || !this.pose) return null;

    return new Promise((resolve) => {
      this.pose!.onResults((results) => {
        if (results.poseLandmarks && results.poseLandmarks.length > 0) {
          const landmarks = this.extractBodyLandmarks(results.poseLandmarks, videoElement);
          resolve(landmarks);
        } else {
          resolve(null);
        }
      });

      this.pose!.send({ image: videoElement });
    });
  }

  private extractBodyLandmarks(landmarks: any[], videoElement: HTMLVideoElement): BodyLandmarks {
    const videoWidth = videoElement.videoWidth;
    const videoHeight = videoElement.videoHeight;

    // MediaPipe Pose landmark indices
    const POSE_LANDMARKS = {
      LEFT_SHOULDER: 11,
      RIGHT_SHOULDER: 12,
      LEFT_ELBOW: 13,
      RIGHT_ELBOW: 14,
      LEFT_WRIST: 15,
      RIGHT_WRIST: 16,
      LEFT_HIP: 23,
      RIGHT_HIP: 24,
      LEFT_KNEE: 25,
      RIGHT_KNEE: 26,
      LEFT_ANKLE: 27,
      RIGHT_ANKLE: 28
    };

    const getPoint = (index: number) => ({
      x: landmarks[index].x * videoWidth,
      y: landmarks[index].y * videoHeight,
      z: landmarks[index].z || 0
    });

    const leftShoulder = getPoint(POSE_LANDMARKS.LEFT_SHOULDER);
    const rightShoulder = getPoint(POSE_LANDMARKS.RIGHT_SHOULDER);
    const leftHip = getPoint(POSE_LANDMARKS.LEFT_HIP);
    const rightHip = getPoint(POSE_LANDMARKS.RIGHT_HIP);

    // Calculate body metrics
    const shoulderWidth = Math.abs(rightShoulder.x - leftShoulder.x);
    const torsoHeight = Math.abs((leftShoulder.y + rightShoulder.y) / 2 - (leftHip.y + rightHip.y) / 2);
    const armSpan = Math.abs(getPoint(POSE_LANDMARKS.LEFT_WRIST).x - getPoint(POSE_LANDMARKS.RIGHT_WRIST).x);

    // Calculate chest center point
    const chest = {
      x: (leftShoulder.x + rightShoulder.x) / 2,
      y: (leftShoulder.y + rightShoulder.y) / 2 + torsoHeight * 0.3,
      z: (leftShoulder.z + rightShoulder.z) / 2
    };

    return {
      leftShoulder,
      rightShoulder,
      leftElbow: getPoint(POSE_LANDMARKS.LEFT_ELBOW),
      rightElbow: getPoint(POSE_LANDMARKS.RIGHT_ELBOW),
      leftWrist: getPoint(POSE_LANDMARKS.LEFT_WRIST),
      rightWrist: getPoint(POSE_LANDMARKS.RIGHT_WRIST),
      leftHip,
      rightHip,
      chest,
      leftKnee: getPoint(POSE_LANDMARKS.LEFT_KNEE),
      rightKnee: getPoint(POSE_LANDMARKS.RIGHT_KNEE),
      leftAnkle: getPoint(POSE_LANDMARKS.LEFT_ANKLE),
      rightAnkle: getPoint(POSE_LANDMARKS.RIGHT_ANKLE),
      shoulderWidth,
      torsoHeight,
      armSpan,
      confidence: 0.85 // Average confidence
    };
  }

  async segmentClothingRegions(videoElement: HTMLVideoElement, bodyLandmarks: BodyLandmarks): Promise<ClothingRegions | null> {
    if (!this.bodyPixModel || !this.canvas || !this.ctx) return null;

    try {
      // Resize canvas to match video
      this.canvas.width = videoElement.videoWidth;
      this.canvas.height = videoElement.videoHeight;

      // Get body segmentation
      const segmentation = await this.bodyPixModel.segmentPersonParts(videoElement, {
        flipHorizontal: false,
        internalResolution: 'medium',
        segmentationThreshold: 0.7
      });

      // Calculate clothing regions based on body landmarks and segmentation
      const clothingRegions = this.calculateClothingRegions(bodyLandmarks, segmentation);
      return clothingRegions;
    } catch (error) {
      console.error('Clothing segmentation failed:', error);
      return null;
    }
  }

  private calculateClothingRegions(bodyLandmarks: BodyLandmarks, segmentation: any): ClothingRegions {
    const { leftShoulder, rightShoulder, leftHip, rightHip, chest, leftAnkle, rightAnkle, shoulderWidth, torsoHeight } = bodyLandmarks;

    // Calculate shirt region (chest and upper torso)
    const shirtPadding = shoulderWidth * 0.1;
    const shirt = {
      topLeft: { 
        x: leftShoulder.x - shirtPadding, 
        y: leftShoulder.y - shoulderWidth * 0.1 
      },
      topRight: { 
        x: rightShoulder.x + shirtPadding, 
        y: rightShoulder.y - shoulderWidth * 0.1 
      },
      bottomLeft: { 
        x: leftHip.x - shirtPadding, 
        y: leftHip.y 
      },
      bottomRight: { 
        x: rightHip.x + shirtPadding, 
        y: rightHip.y 
      },
      center: chest
    };

    // Calculate pants region (hips to knees)
    const hipCenter = { x: (leftHip.x + rightHip.x) / 2, y: (leftHip.y + rightHip.y) / 2 };
    const pantsPadding = shoulderWidth * 0.05;
    const pants = {
      topLeft: { 
        x: leftHip.x - pantsPadding, 
        y: leftHip.y 
      },
      topRight: { 
        x: rightHip.x + pantsPadding, 
        y: rightHip.y 
      },
      bottomLeft: { 
        x: bodyLandmarks.leftKnee.x - pantsPadding, 
        y: bodyLandmarks.leftKnee.y 
      },
      bottomRight: { 
        x: bodyLandmarks.rightKnee.x + pantsPadding, 
        y: bodyLandmarks.rightKnee.y 
      },
      center: hipCenter
    };

    // Calculate shoe regions
    const shoeWidth = shoulderWidth * 0.15;
    const shoeHeight = shoulderWidth * 0.08;
    const shoes = {
      left: {
        x: leftAnkle.x - shoeWidth / 2,
        y: leftAnkle.y - shoeHeight / 2,
        width: shoeWidth,
        height: shoeHeight
      },
      right: {
        x: rightAnkle.x - shoeWidth / 2,
        y: rightAnkle.y - shoeHeight / 2,
        width: shoeWidth,
        height: shoeHeight
      }
    };

    return { shirt, pants, shoes };
  }

  async createBodyMask(videoElement: HTMLVideoElement): Promise<HTMLCanvasElement | null> {
    if (!this.selfieSegmentation || !this.canvas || !this.ctx) return null;

    return new Promise((resolve) => {
      this.selfieSegmentation!.onResults((results) => {
        if (results.segmentationMask) {
          // Create a mask canvas
          const maskCanvas = document.createElement('canvas');
          maskCanvas.width = videoElement.videoWidth;
          maskCanvas.height = videoElement.videoHeight;
          const maskCtx = maskCanvas.getContext('2d')!;

          // Draw the segmentation mask
          maskCtx.putImageData(results.segmentationMask, 0, 0);
          resolve(maskCanvas);
        } else {
          resolve(null);
        }
      });

      this.selfieSegmentation!.send({ image: videoElement });
    });
  }

  isReady(): boolean {
    return this.isInitialized && this.pose !== null && this.bodyPixModel !== null;
  }

  cleanup(): void {
    if (this.pose) {
      this.pose.close();
      this.pose = null;
    }
    if (this.selfieSegmentation) {
      this.selfieSegmentation.close();
      this.selfieSegmentation = null;
    }
    this.bodyPixModel = null;
    this.isInitialized = false;
  }
}

export const bodyVisionService = new BodyVisionService();