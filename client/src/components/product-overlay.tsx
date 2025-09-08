import { useEffect, useState, useRef } from 'react';
import { Product, AROverlay, FaceLandmarks, ProductCategory } from '@/types/ar-types';
import { AdvancedFaceLandmarks } from '@/lib/advanced-face-detection';

interface ProductOverlayProps {
  product: Product | null;
  faceLandmarks: any | null; // Support both landmark types
  overlay: AROverlay | null;
  onOverlayChange: (overlay: AROverlay | null) => void;
  videoElement: HTMLVideoElement | null;
}

export function ProductOverlay({ 
  product, 
  faceLandmarks, 
  overlay, 
  onOverlayChange,
  videoElement 
}: ProductOverlayProps) {
  const [overlayStyle, setOverlayStyle] = useState<React.CSSProperties>({});
  const [dynamicLighting, setDynamicLighting] = useState({ brightness: 1, contrast: 1, saturation: 1 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!product || !videoElement) {
      setOverlayStyle({ display: 'none' });
      return;
    }

    const videoRect = videoElement.getBoundingClientRect();
    const videoWidth = videoElement.videoWidth;
    const videoHeight = videoElement.videoHeight;

    if (!videoWidth || !videoHeight) return;

    // Default positions based on category (work even without face detection)
    let basePosition = { x: 50, y: 50, width: 20, height: 15 };

    switch (product.category) {
      case 'jewelry':
        basePosition = { x: 50, y: 20, width: 15, height: 10 }; // Head/neck area
        break;
      case 'shoes':
        basePosition = { x: 50, y: 85, width: 25, height: 12 }; // Bottom area  
        break;
      case 'clothes':
        basePosition = { x: 50, y: 55, width: 60, height: 75 }; // Much larger to cover torso properly
        break;
      case 'furniture':
        basePosition = { x: 30, y: 40, width: 40, height: 35 }; // Background
        break;
    }

    // Improve positioning with advanced face landmarks if available
    if (faceLandmarks) {
      const scaleX = videoRect.width / videoWidth;
      const scaleY = videoRect.height / videoHeight;

      let faceX, faceY, faceWidth, faceHeight;

      // Check if this is advanced landmarks (with faceGeometry) or basic landmarks
      if (faceLandmarks.faceGeometry) {
        // Advanced face landmarks
        const center = faceLandmarks.faceGeometry.center;
        faceX = center.x * scaleX;
        faceY = center.y * scaleY;
        faceWidth = faceLandmarks.faceGeometry.width * scaleX;
        faceHeight = faceLandmarks.faceGeometry.height * scaleY;
      } else if (faceLandmarks.face) {
        // Basic face landmarks
        faceX = faceLandmarks.face.x * scaleX;
        faceY = faceLandmarks.face.y * scaleY;
        faceWidth = faceLandmarks.face.width * scaleX;
        faceHeight = faceLandmarks.face.height * scaleY;
      } else {
        // Fallback to default positioning
        faceX = videoRect.width / 2;
        faceY = videoRect.height / 2;
        faceWidth = videoRect.width * 0.3;
        faceHeight = videoRect.height * 0.4;
      }

      switch (product.category) {
        case 'jewelry':
          // Position around face/neck area
          if (product.name.toLowerCase().includes('earring')) {
            basePosition = {
              x: (faceX / videoRect.width) * 100,
              y: ((faceY + faceHeight * 0.3) / videoRect.height) * 100,
              width: (faceWidth * 0.8 / videoRect.width) * 100,
              height: (faceHeight * 0.4 / videoRect.height) * 100
            };
          } else if (product.name.toLowerCase().includes('necklace')) {
            basePosition = {
              x: ((faceX + faceWidth * 0.2) / videoRect.width) * 100,
              y: ((faceY + faceHeight * 0.8) / videoRect.height) * 100,
              width: (faceWidth * 0.6 / videoRect.width) * 100,
              height: (faceHeight * 0.3 / videoRect.height) * 100
            };
          } else if (product.name.toLowerCase().includes('watch') || product.name.toLowerCase().includes('bracelet')) {
            basePosition = {
              x: ((faceX - faceWidth * 0.5) / videoRect.width) * 100,
              y: ((faceY + faceHeight * 1.2) / videoRect.height) * 100,
              width: (faceWidth * 0.4 / videoRect.width) * 100,
              height: (faceHeight * 0.2 / videoRect.height) * 100
            };
          }
          break;

        case 'shoes':
          basePosition = {
            x: ((faceX - faceWidth * 0.5) / videoRect.width) * 100,
            y: 75, // Bottom area
            width: (faceWidth * 1.5 / videoRect.width) * 100,
            height: 20
          };
          break;

        case 'clothes':
          // Position clothes to cover the entire torso area properly
          basePosition = {
            x: ((faceX) / videoRect.width) * 100, // Center on face x-position
            y: ((faceY + faceHeight * 0.7) / videoRect.height) * 100, // Start below the face
            width: Math.max(45, (faceWidth * 2.5 / videoRect.width) * 100), // Much wider to cover shoulders and torso
            height: Math.max(55, (faceHeight * 3.5 / videoRect.height) * 100) // Taller to cover full torso area
          };
          break;

        case 'furniture':
          basePosition = {
            x: 30,
            y: 40,
            width: 40,
            height: 35
          };
          break;
      }
    }

    // Apply overlay transformations if available
    const finalPosition = overlay ? {
      x: overlay.position.x,
      y: overlay.position.y,
      width: overlay.position.width,
      height: overlay.position.height
    } : basePosition;

    const scale = overlay?.scale || 1;
    const rotation = overlay?.rotation || 0;
    const opacity = overlay?.opacity || 0.9;

    setOverlayStyle({
      position: 'absolute',
      left: `${finalPosition.x}%`,
      top: `${finalPosition.y}%`,
      width: `${finalPosition.width}%`,
      height: `${finalPosition.height}%`,
      transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`,
      opacity,
      pointerEvents: 'none',
      zIndex: 10,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    });

    // Update overlay state if it doesn't exist
    if (!overlay && product) {
      onOverlayChange({
        productId: product.id,
        position: basePosition,
        scale: 1,
        rotation: 0,
        opacity: 0.9
      });
    }
  }, [product, faceLandmarks, overlay, videoElement, onOverlayChange]);

  // Dynamic lighting adaptation based on video feed
  useEffect(() => {
    if (!videoElement || !product) return;

    const adaptLighting = () => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 100;
      canvas.height = 100;
      
      // Sample the video frame
      try {
        ctx.drawImage(videoElement, 0, 0, 100, 100);
        const imageData = ctx.getImageData(0, 0, 100, 100);
        
        // Calculate lighting metrics
        let totalBrightness = 0;
        let rTotal = 0, gTotal = 0, bTotal = 0;
        
        for (let i = 0; i < imageData.data.length; i += 4) {
          const r = imageData.data[i];
          const g = imageData.data[i + 1];
          const b = imageData.data[i + 2];
          
          totalBrightness += (r + g + b) / 3;
          rTotal += r;
          gTotal += g;
          bTotal += b;
        }
        
        const pixelCount = imageData.data.length / 4;
        const avgBrightness = totalBrightness / pixelCount;
        const avgR = rTotal / pixelCount;
        const avgG = gTotal / pixelCount;
        const avgB = bTotal / pixelCount;
        
        // Adapt lighting based on scene
        const brightness = Math.max(0.7, Math.min(1.3, avgBrightness / 128));
        const contrast = avgBrightness < 100 ? 1.1 : 0.95;
        
        // Color temperature adaptation
        const colorTemp = (avgR + avgG + avgB) / 3;
        const saturation = colorTemp > 150 ? 1.1 : 0.9;
        
        setDynamicLighting({ brightness, contrast, saturation });
      } catch (error) {
        // Fallback values
        setDynamicLighting({ brightness: 1, contrast: 1, saturation: 1 });
      }
    };

    // Update lighting every 500ms
    const interval = setInterval(adaptLighting, 500);
    return () => clearInterval(interval);
  }, [videoElement, product]);

  if (!product || !product.overlayImageUrl) {
    return null;
  }

  return (
    <div 
      className="product-overlay"
      style={overlayStyle}
      data-testid={`product-overlay-${product.id}`}
    >
      {/* Hidden canvas for lighting analysis */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      <img
        src={product.overlayImageUrl}
        alt={`${product.name} AR overlay`}
        className="w-full h-full object-contain"
        style={{
          filter: `
            brightness(${dynamicLighting.brightness}) 
            contrast(${dynamicLighting.contrast}) 
            saturate(${dynamicLighting.saturation})
            drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))
          `,
          mixBlendMode: product.category === 'clothes' ? 'normal' : 'normal',
          objectFit: 'cover'
        }}
        draggable={false}
      />
      
      {/* Advanced AR visualization for debugging (only in development) */}
      {process.env.NODE_ENV === 'development' && faceLandmarks?.faceGeometry && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            border: '1px solid rgba(0, 255, 0, 0.3)',
            background: 'rgba(0, 255, 0, 0.05)'
          }}
        >
          <div className="absolute top-0 left-0 text-xs text-green-400 bg-black/50 px-1">
            Confidence: {Math.round(faceLandmarks.confidence * 100)}%
          </div>
        </div>
      )}
    </div>
  );
}
