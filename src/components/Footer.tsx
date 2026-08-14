import React from 'react';
import { useProjectStore } from '../store/projectStore';
import { MapPin, Magnet, Grid } from 'lucide-react';

export const Footer: React.FC = () => {
  const { cursorPos, activeMode, snapToGrid, snapToGeometry, showGrid, gridSpacing } = useProjectStore();

  return (
    <footer className="h-7 bg-[#0F0F0F] border-t border-[#2A2A2A] px-4 flex items-center justify-between text-[11px] text-[#888888] shrink-0 z-30 select-none">
      {/* Left: Cursor coordinates & mode */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 font-mono text-[#E5E5E5]">
          <MapPin className="w-3 h-3 text-[#FF4D00]" />
          <span>
            X: <strong className="font-semibold text-white">{cursorPos[0].toFixed(1)}m</strong>, Y:{' '}
            <strong className="font-semibold text-white">{cursorPos[1].toFixed(1)}m</strong>
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D00]" />
          <span className="capitalize font-medium text-[#CCCCCC] font-mono">MODE: {activeMode}</span>
        </div>

        <div className="hidden md:flex items-center gap-3 text-[#777777]">
          <span className="flex items-center gap-1 font-mono">
            <Grid className="w-3 h-3 text-[#666666]" />
            <span>GRID {showGrid ? `${gridSpacing}M` : 'OFF'}</span>
          </span>
          <span className="flex items-center gap-1 font-mono">
            <Magnet className="w-3 h-3 text-[#666666]" />
            <span>SNAP {snapToGrid || snapToGeometry ? 'ON' : 'OFF'}</span>
          </span>
        </div>
      </div>

      {/* Right: Mandatory Legal Disclaimer */}
      <div className="truncate max-w-md hidden lg:block text-[#555555] text-[10px] font-mono tracking-tight">
        CONCEPTUAL PLANNING TOOL — VERIFY WITH LICENSED CIVIL & STRUCTURAL CONSULTANTS.
      </div>
    </footer>
  );
};
