import { useEffect, useState } from 'react';
import { Product, AROverlay, FaceLandmarks, ProductCategory } from '@/types/ar-types';

interface ProductOverlayProps {
  product: Product | null;
  faceLandmarks: FaceLandmarks | null;
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

  useEffect(() => {
    if (!product || !videoElement) {
      setOverlayStyle({ display: 'none' });
      return;
    }

    const videoRect = videoElement.getBoundingClientRect();
    const videoWidth = videoElement.videoWidth;
    const videoHeight = videoElement.videoHeight;

    if (!videoWidth || !videoHeight) return;

    let basePosition = { x: 50, y: 50, width: 20, height: 15 };

    // Position based on category and face landmarks
    if (faceLandmarks?.face) {
      const scaleX = videoRect.width / videoWidth;
      const scaleY = videoRect.height / videoHeight;

      const faceX = faceLandmarks.face.x * scaleX;
      const faceY = faceLandmarks.face.y * scaleY;
      const faceWidth = faceLandmarks.face.width * scaleX;
      const faceHeight = faceLandmarks.face.height * scaleY;

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
          basePosition = {
            x: ((faceX - faceWidth * 0.3) / videoRect.width) * 100,
            y: ((faceY + faceHeight * 0.5) / videoRect.height) * 100,
            width: (faceWidth * 1.6 / videoRect.width) * 100,
            height: (faceHeight * 2 / videoRect.height) * 100
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

  if (!product || !product.overlayImageUrl) {
    return null;
  }

  return (
    <div 
      className="product-overlay"
      style={overlayStyle}
      data-testid={`product-overlay-${product.id}`}
    >
      <img
        src={product.overlayImageUrl}
        alt={`${product.name} AR overlay`}
        className="w-full h-full object-contain"
        style={{
          filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
        }}
        draggable={false}
      />
    </div>
  );
}
