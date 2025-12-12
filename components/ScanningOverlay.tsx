
import React from 'react';

interface ScanningOverlayProps {
  imageSrc: string;
}

const ScanningOverlay: React.FC<ScanningOverlayProps> = ({ imageSrc }) => {
  return (
    <div className="relative w-64 h-64 mx-auto rounded-full overflow-hidden shadow-2xl border-4 border-stone-800">
      <img 
        src={imageSrc} 
        alt="Scanning" 
        className="w-full h-full object-cover filter grayscale contrast-125"
      />
      <div className="absolute inset-0 bg-emerald-500/20 z-10"></div>
      
      {/* Grid Overlay */}
      <div className="absolute inset-0 z-20 opacity-30" 
           style={{ backgroundImage: 'linear-gradient(rgba(0, 255, 170, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 170, 0.5) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      </div>

      {/* Scanning Line */}
      <div className="absolute left-0 right-0 h-1 bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,1)] z-30 animate-[scan_2s_linear_infinite]"></div>
      
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default ScanningOverlay;
