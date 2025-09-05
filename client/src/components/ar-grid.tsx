interface ARGridProps {
  visible: boolean;
}

export function ARGrid({ visible }: ARGridProps) {
  if (!visible) return null;

  return (
    <div 
      className="absolute inset-0 z-5 pointer-events-none opacity-20" 
      data-testid="ar-grid"
    >
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
}
