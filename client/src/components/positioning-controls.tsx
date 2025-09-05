import { AROverlay } from '@/types/ar-types';
import { Button } from '@/components/ui/button';
import { Plus, Minus, RotateCcw, RotateCw, Move } from 'lucide-react';

interface PositioningControlsProps {
  overlay: AROverlay | null;
  onOverlayUpdate: (overlay: AROverlay) => void;
  visible: boolean;
}

export function PositioningControls({ 
  overlay, 
  onOverlayUpdate, 
  visible 
}: PositioningControlsProps) {
  if (!visible || !overlay) return null;

  const updateOverlay = (changes: Partial<AROverlay>) => {
    onOverlayUpdate({ ...overlay, ...changes });
  };

  const scaleUp = () => {
    const newScale = Math.min(overlay.scale + 0.1, 2);
    updateOverlay({ scale: newScale });
  };

  const scaleDown = () => {
    const newScale = Math.max(overlay.scale - 0.1, 0.5);
    updateOverlay({ scale: newScale });
  };

  const rotateLeft = () => {
    const newRotation = overlay.rotation - 15;
    updateOverlay({ rotation: newRotation });
  };

  const rotateRight = () => {
    const newRotation = overlay.rotation + 15;
    updateOverlay({ rotation: newRotation });
  };

  const moveUp = () => {
    const newY = Math.max(overlay.position.y - 2, 0);
    updateOverlay({ 
      position: { ...overlay.position, y: newY }
    });
  };

  const moveDown = () => {
    const newY = Math.min(overlay.position.y + 2, 100);
    updateOverlay({ 
      position: { ...overlay.position, y: newY }
    });
  };

  const moveLeft = () => {
    const newX = Math.max(overlay.position.x - 2, 0);
    updateOverlay({ 
      position: { ...overlay.position, x: newX }
    });
  };

  const moveRight = () => {
    const newX = Math.min(overlay.position.x + 2, 100);
    updateOverlay({ 
      position: { ...overlay.position, x: newX }
    });
  };

  return (
    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-40" data-testid="positioning-controls">
      <div className="flex flex-col space-y-3">
        {/* Scale Controls */}
        <Button
          className="floating-control rounded-full p-3"
          onClick={scaleUp}
          data-testid="button-scale-up"
        >
          <Plus className="w-4 h-4 text-white" />
        </Button>
        
        <Button
          className="floating-control rounded-full p-3"
          onClick={scaleDown}
          data-testid="button-scale-down"
        >
          <Minus className="w-4 h-4 text-white" />
        </Button>

        {/* Rotation Controls */}
        <Button
          className="floating-control rounded-full p-3"
          onClick={rotateLeft}
          data-testid="button-rotate-left"
        >
          <RotateCcw className="w-4 h-4 text-white" />
        </Button>
        
        <Button
          className="floating-control rounded-full p-3"
          onClick={rotateRight}
          data-testid="button-rotate-right"
        >
          <RotateCw className="w-4 h-4 text-white" />
        </Button>

        {/* Movement Controls */}
        <div className="floating-control rounded-xl p-2">
          <div className="grid grid-cols-3 gap-1">
            <div></div>
            <Button
              size="sm"
              className="p-1 h-auto"
              onClick={moveUp}
              data-testid="button-move-up"
            >
              ↑
            </Button>
            <div></div>
            
            <Button
              size="sm"
              className="p-1 h-auto"
              onClick={moveLeft}
              data-testid="button-move-left"
            >
              ←
            </Button>
            <div className="flex items-center justify-center">
              <Move className="w-3 h-3 text-white/60" />
            </div>
            <Button
              size="sm"
              className="p-1 h-auto"
              onClick={moveRight}
              data-testid="button-move-right"
            >
              →
            </Button>
            
            <div></div>
            <Button
              size="sm"
              className="p-1 h-auto"
              onClick={moveDown}
              data-testid="button-move-down"
            >
              ↓
            </Button>
            <div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
