import React from 'react';
import { useProjectStore } from '../store/projectStore';
import { computeProjectStats } from '../utils/export';
import { X, Trees, Building, Car, Route, Grid, ShieldAlert } from 'lucide-react';

interface SummaryModalProps {
  onClose: () => void;
}

export const SummaryModal: React.FC<SummaryModalProps> = ({ onClose }) => {
  const { project } = useProjectStore();
  const stats = computeProjectStats(project);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150 text-[#E5E5E5]">
      <div className="bg-[#141414] rounded-xl shadow-2xl border border-[#2A2A2A] w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#2A2A2A] flex items-center justify-between bg-[#181818]">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#E5E5E5]">
              Township Planning Metrics & Calculations
            </h2>
            <p className="text-xs text-[#888888] font-mono mt-0.5">
              {project.project.name} — Conceptual Site Analysis
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#777777] hover:text-[#FF4D00] p-1.5 rounded-md hover:bg-[#222222] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-[#CCCCCC]">
          {/* Key Metrics Bento */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg">
              <div className="flex items-center gap-1.5 text-[#888888] mb-1">
                <Grid className="w-3.5 h-3.5 text-[#FF4D00]" />
                <span className="font-semibold text-[11px] uppercase tracking-wider">Site Area</span>
              </div>
              <div className="text-base font-bold font-mono text-[#E5E5E5]">
                {stats.siteArea.toLocaleString(undefined, { maximumFractionDigits: 0 })} m²
              </div>
              <span className="text-[10px] text-[#777777] font-mono">Perimeter: {stats.sitePerimeter.toFixed(0)}m</span>
            </div>

            <div className="p-3.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg">
              <div className="flex items-center gap-1.5 text-[#4ade80] mb-1">
                <Trees className="w-3.5 h-3.5 text-[#4ade80]" />
                <span className="font-semibold text-[11px] uppercase tracking-wider">Open Space</span>
              </div>
              <div className="text-base font-bold font-mono text-[#4ade80]">
                {stats.openSpacePercentage.toFixed(1)}%
              </div>
              <span className="text-[10px] text-[#777777] font-mono">{stats.openSpaceArea.toLocaleString()} m²</span>
            </div>

            <div className="p-3.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg">
              <div className="flex items-center gap-1.5 text-[#38bdf8] mb-1">
                <Building className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span className="font-semibold text-[11px] uppercase tracking-wider">Built Footprint</span>
              </div>
              <div className="text-base font-bold font-mono text-[#38bdf8]">
                {stats.builtUpPercentage.toFixed(1)}%
              </div>
              <span className="text-[10px] text-[#777777] font-mono">{stats.builtUpArea.toLocaleString()} m²</span>
            </div>

            <div className="p-3.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg">
              <div className="flex items-center gap-1.5 text-[#fbbf24] mb-1">
                <Car className="w-3.5 h-3.5 text-[#fbbf24]" />
                <span className="font-semibold text-[11px] uppercase tracking-wider">Parking Stalls</span>
              </div>
              <div className="text-base font-bold font-mono text-[#fbbf24]">
                {stats.parkingSpaces}
              </div>
              <span className="text-[10px] text-[#777777] font-mono">{project.parking.length} Lots</span>
            </div>
          </div>

          {/* Land-Use Breakdown Table */}
          <div className="border border-[#2A2A2A] rounded-lg overflow-hidden bg-[#181818]">
            <div className="bg-[#1C1C1C] px-4 py-2.5 font-bold text-[#E5E5E5] text-xs border-b border-[#2A2A2A] uppercase tracking-wider">
              Land-Use Distribution
            </div>
            <div className="divide-y divide-[#2A2A2A] text-xs">
              <div className="px-4 py-2 flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#3b82f6]" />
                  <span>Residential Plots</span>
                </span>
                <span className="font-mono font-semibold text-[#E5E5E5]">{stats.residentialArea.toLocaleString()} m²</span>
              </div>
              <div className="px-4 py-2 flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#FF4D00]" />
                  <span>Commercial & Retail</span>
                </span>
                <span className="font-mono font-semibold text-[#E5E5E5]">{stats.commercialArea.toLocaleString()} m²</span>
              </div>
              <div className="px-4 py-2 flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#a855f7]" />
                  <span>Civic, Education & Public Facilities</span>
                </span>
                <span className="font-mono font-semibold text-[#E5E5E5]">{stats.publicArea.toLocaleString()} m²</span>
              </div>
              <div className="px-4 py-2 flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#64748b]" />
                  <span>Road Corridors & Rights-of-Way</span>
                </span>
                <span className="font-mono font-semibold text-[#E5E5E5]">{stats.roadArea.toLocaleString()} m² ({stats.roadLength.toFixed(1)}m length)</span>
              </div>
            </div>
          </div>

          {/* Entity Inventory */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-[#1A1A1A] rounded-lg border border-[#2A2A2A]">
              <div className="text-[#888888] text-[11px] uppercase tracking-wider">Total Plots</div>
              <div className="text-base font-bold font-mono text-[#E5E5E5]">{stats.plotCount}</div>
            </div>
            <div className="p-3 bg-[#1A1A1A] rounded-lg border border-[#2A2A2A]">
              <div className="text-[#888888] text-[11px] uppercase tracking-wider">Buildings</div>
              <div className="text-base font-bold font-mono text-[#E5E5E5]">{stats.buildingCount}</div>
            </div>
            <div className="p-3 bg-[#1A1A1A] rounded-lg border border-[#2A2A2A]">
              <div className="text-[#888888] text-[11px] uppercase tracking-wider">Planted Trees</div>
              <div className="text-base font-bold font-mono text-[#E5E5E5]">{stats.treeCount}</div>
            </div>
          </div>

          {/* Civil Planning Disclaimer Note */}
          <div className="bg-[#1E1914] border border-[#3D281C] rounded-lg p-3.5 flex gap-2.5 items-start text-[#FFB380]">
            <ShieldAlert className="w-4 h-4 text-[#FF4D00] shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed font-mono">
              <strong className="text-[#FF4D00]">CONCEPTUAL DISCLAIMER:</strong> All building setbacks, statutory road widths, utility capacities, and cadastral boundaries must be verified by a licensed civil engineer or registered surveyor.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2A2A2A] bg-[#181818] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#222222] hover:bg-[#2A2A2A] text-[#E5E5E5] hover:text-white border border-[#2A2A2A] text-xs font-semibold rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
