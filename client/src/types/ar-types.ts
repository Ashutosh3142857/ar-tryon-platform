export type ProductCategory = 'jewelry' | 'shoes' | 'clothes' | 'furniture';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  imageUrl: string;
  overlayImageUrl?: string;
  price?: number;
  description?: string;
}

export interface AROverlay {
  productId: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  scale: number;
  rotation: number;
  opacity: number;
}

export interface FaceLandmarks {
  face?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  leftEar?: { x: number; y: number };
  rightEar?: { x: number; y: number };
  nose?: { x: number; y: number };
  leftEye?: { x: number; y: number };
  rightEye?: { x: number; y: number };
}

export interface CameraState {
  isActive: boolean;
  isLoading: boolean;
  error: string | null;
  stream: MediaStream | null;
  deviceId?: string;
  facingMode: 'user' | 'environment';
}

export interface ARSession {
  activeCategory: ProductCategory;
  selectedProduct: Product | null;
  overlay: AROverlay | null;
  isRecording: boolean;
  showGrid: boolean;
  showControls: boolean;
  faceLandmarks: any | null; // Allow both FaceLandmarks and AdvancedFaceLandmarks
}
