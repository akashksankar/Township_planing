import React from 'react';
import { useProjectStore } from '../store/projectStore';
import { ToolMode, RoadType, LandUseType, BuildingType, LandscapeType, FacilityType, InfraType, TreeType } from '../types/project';
import {
  MousePointer2,
  Route,
  LayoutGrid,
  Building,
  Trees,
  Building2,
  Car,
  Droplets,
  Ruler,
  Maximize2,
  Type,
  Grid as GridIcon,
  Magnet,
  Maximize,
  Square
} from 'lucide-react';

export const Toolbar: React.FC = () => {
  const {
    activeMode,
    setMode,
    subTypeRoad,
    setSubTypeRoad,
    subTypeLandUse,
    setSubTypeLandUse,
    subTypeBuilding,
    setSubTypeBuilding,
    subTypeLandscape,
    setSubTypeLandscape,
    subTypeTree,
    setSubTypeTree,
    subTypeFacility,
    setSubTypeFacility,
    subTypeInfra,
    setSubTypeInfra,
    showGrid,
    toggleGrid,
    gridSpacing,
    setGridSpacing,
    snapToGrid,
    toggleSnapToGrid,
    snapToGeometry,
    toggleSnapToGeometry,
    fitToSite,
    fitToPlan,
    showPlotLabels,
    togglePlotLabels
  } = useProjectStore();

  const MAIN_TOOLS: { mode: ToolMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { mode: 'select', label: 'Select (V)', icon: MousePointer2 },
    { mode: 'road', label: 'Roads & Corridors', icon: Route },
    { mode: 'plot', label: 'Plot Subdivisions', icon: LayoutGrid },
    { mode: 'building', label: 'Building Footprints', icon: Building },
    { mode: 'landscape', label: 'Parks & Trees', icon: Trees },
    { mode: 'facility', label: 'Public Facilities', icon: Building2 },
    { mode: 'parking', label: 'Parking Lots', icon: Car },
    { mode: 'infrastructure', label: 'Water & Drainage', icon: Droplets },
    { mode: 'dimension', label: 'Technical Dimensions', icon: Ruler },
    { mode: 'measure', label: 'Measure Tool', icon: Maximize2 },
    { mode: 'text', label: 'Text Annotation', icon: Type }
  ];

  return (
    <aside className="w-16 md:w-56 bg-[#141414] border-r border-[#2A2A2A] flex flex-col shrink-0 overflow-y-auto select-none text-[#E5E5E5]">
      {/* Primary Tool Modes */}
      <div className="p-2 space-y-1">
        <div className="text-[10px] font-bold text-[#777777] uppercase tracking-widest px-2 py-1 hidden md:block">
          STUDIO TOOLS
        </div>

        {MAIN_TOOLS.map(t => {
          const Icon = t.icon;
          const isActive = activeMode === t.mode;

          return (
            <button
              key={t.mode}
              id={`tool-mode-${t.mode}`}
              onClick={() => setMode(t.mode)}
              className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-md text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#FF4D00] text-black shadow-xs font-bold'
                  : 'text-[#CCCCCC] hover:bg-[#1E1E1E] hover:text-white'
              }`}
              title={t.label}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline truncate">{t.label.split(' (')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Sub-tool Options Bar (Shows when specific mode is active) */}
      <div className="p-2 border-t border-[#2A2A2A] space-y-2">
        {/* ROAD SUB-OPTIONS */}
        {activeMode === 'road' && (
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-[#777777] uppercase tracking-wider px-1 hidden md:block">Road Type</div>
            <div className="grid grid-cols-2 gap-1 text-[11px]">
              {(['main', 'secondary', 'local', 'pedestrian', 'cycle'] as RoadType[]).map(rt => (
                <button
                  key={rt}
                  onClick={() => setSubTypeRoad(rt)}
                  className={`px-2 py-1 rounded capitalize text-center border ${
                    subTypeRoad === rt ? 'bg-[#FF4D00] text-black font-bold border-[#FF4D00]' : 'bg-[#1C1C1C] hover:bg-[#252525] text-[#AAAAAA] hover:text-white border-[#2A2A2A]'
                  }`}
                >
                  {rt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PLOT SUB-OPTIONS */}
        {activeMode === 'plot' && (
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-[#777777] uppercase tracking-wider px-1 hidden md:block">Zoning / Land Use</div>
            <div className="grid grid-cols-1 gap-1 text-[11px]">
              {(['residential', 'commercial', 'mixed_use', 'public', 'institutional', 'open_space'] as LandUseType[]).map(lu => (
                <button
                  key={lu}
                  onClick={() => setSubTypeLandUse(lu)}
                  className={`px-2 py-1 rounded capitalize text-left border ${
                    subTypeLandUse === lu ? 'bg-[#FF4D00] text-black font-bold border-[#FF4D00]' : 'bg-[#1C1C1C] hover:bg-[#252525] text-[#AAAAAA] hover:text-white border-[#2A2A2A]'
                  }`}
                >
                  {lu.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* BUILDING SUB-OPTIONS */}
        {activeMode === 'building' && (
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-[#777777] uppercase tracking-wider px-1 hidden md:block">Building Type</div>
            <div className="grid grid-cols-1 gap-1 text-[11px]">
              {(['residential', 'apartment', 'commercial', 'office'] as BuildingType[]).map(bt => (
                <button
                  key={bt}
                  onClick={() => setSubTypeBuilding(bt)}
                  className={`px-2 py-1 rounded capitalize text-left border ${
                    subTypeBuilding === bt ? 'bg-[#FF4D00] text-black font-bold border-[#FF4D00]' : 'bg-[#1C1C1C] hover:bg-[#252525] text-[#AAAAAA] hover:text-white border-[#2A2A2A]'
                  }`}
                >
                  {bt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* LANDSCAPE SUB-OPTIONS */}
        {activeMode === 'landscape' && (
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold text-[#777777] uppercase tracking-wider px-1 hidden md:block">Landscape Element</div>
            <div className="grid grid-cols-2 gap-1 text-[11px]">
              <button
                onClick={() => setSubTypeLandscape('park')}
                className={`px-2 py-1 rounded text-center border ${
                  subTypeLandscape === 'park' ? 'bg-[#FF4D00] text-black font-bold border-[#FF4D00]' : 'bg-[#1C1C1C] text-[#AAAAAA] hover:text-white border-[#2A2A2A]'
                }`}
              >
                Park Polygon
              </button>
              <button
                onClick={() => setSubTypeLandscape('garden')}
                className={`px-2 py-1 rounded text-center border ${
                  subTypeLandscape === 'garden' ? 'bg-[#FF4D00] text-black font-bold border-[#FF4D00]' : 'bg-[#1C1C1C] text-[#AAAAAA] hover:text-white border-[#2A2A2A]'
                }`}
              >
                Tree Stamp
              </button>
            </div>
            {subTypeLandscape === 'garden' && (
              <div className="grid grid-cols-2 gap-1 text-[10px]">
                {(['canopy', 'palm', 'evergreen', 'ornamental'] as TreeType[]).map(tt => (
                  <button
                    key={tt}
                    onClick={() => setSubTypeTree(tt)}
                    className={`px-1.5 py-0.5 rounded capitalize border ${
                      subTypeTree === tt ? 'bg-[#10B981] text-black font-bold border-[#10B981]' : 'bg-[#14231A] text-[#10B981] border-[#10B981]/30'
                    }`}
                  >
                    {tt}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* FACILITY SUB-OPTIONS */}
        {activeMode === 'facility' && (
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-[#777777] uppercase tracking-wider px-1 hidden md:block">Facility Symbol</div>
            <div className="grid grid-cols-1 gap-1 text-[11px]">
              {(['school', 'hospital', 'community_center', 'police_station', 'fire_station', 'market'] as FacilityType[]).map(ft => (
                <button
                  key={ft}
                  onClick={() => setSubTypeFacility(ft)}
                  className={`px-2 py-1 rounded capitalize text-left border ${
                    subTypeFacility === ft ? 'bg-[#FF4D00] text-black font-bold border-[#FF4D00]' : 'bg-[#1C1C1C] hover:bg-[#252525] text-[#AAAAAA] hover:text-white border-[#2A2A2A]'
                  }`}
                >
                  {ft.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* INFRASTRUCTURE SUB-OPTIONS */}
        {activeMode === 'infrastructure' && (
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-[#777777] uppercase tracking-wider px-1 hidden md:block">Utility Line</div>
            <div className="grid grid-cols-1 gap-1 text-[11px]">
              {(['water_pipe', 'water_tank', 'drain', 'manhole'] as InfraType[]).map(it => (
                <button
                  key={it}
                  onClick={() => setSubTypeInfra(it)}
                  className={`px-2 py-1 rounded capitalize text-left border ${
                    subTypeInfra === it ? 'bg-[#FF4D00] text-black font-bold border-[#FF4D00]' : 'bg-[#1C1C1C] hover:bg-[#252525] text-[#AAAAAA] hover:text-white border-[#2A2A2A]'
                  }`}
                >
                  {it.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Grid & Snapping Controls (Editor Aids) */}
      <div className="mt-auto p-2 border-t border-[#2A2A2A] space-y-1.5">
        <div className="text-[10px] font-bold text-[#777777] uppercase tracking-widest px-2 hidden md:block">
          AIDS & SNAPPING
        </div>

        {/* Toggle Grid */}
        <button
          onClick={toggleGrid}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-medium border ${
            showGrid ? 'bg-[#1C1C1C] text-[#E5E5E5] border-[#333333]' : 'text-[#777777] hover:bg-[#1A1A1A] hover:text-[#CCCCCC] border-transparent'
          }`}
          title="Toggle Canvas Grid"
        >
          <div className="flex items-center gap-2">
            <GridIcon className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Grid ({gridSpacing}m)</span>
          </div>
          <span className={`w-2 h-2 rounded-full ${showGrid ? 'bg-[#FF4D00]' : 'bg-[#333333]'}`} />
        </button>

        {/* Grid Spacing Select */}
        {showGrid && (
          <div className="hidden md:flex items-center gap-1 px-1">
            {[1, 5, 10].map(s => (
              <button
                key={s}
                onClick={() => setGridSpacing(s)}
                className={`flex-1 py-0.5 text-[10px] rounded font-mono border ${
                  gridSpacing === s ? 'bg-[#FF4D00] text-black font-bold border-[#FF4D00]' : 'bg-[#1C1C1C] text-[#AAAAAA] hover:bg-[#252525] border-[#2A2A2A]'
                }`}
              >
                {s}m
              </button>
            ))}
          </div>
        )}

        {/* Snap to Grid */}
        <button
          onClick={toggleSnapToGrid}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-medium border ${
            snapToGrid ? 'bg-[#1C1C1C] text-[#E5E5E5] border-[#333333]' : 'text-[#777777] hover:bg-[#1A1A1A] hover:text-[#CCCCCC] border-transparent'
          }`}
          title="Snap cursor to grid intervals"
        >
          <div className="flex items-center gap-2">
            <Magnet className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Snap to Grid</span>
          </div>
          <span className={`w-2 h-2 rounded-full ${snapToGrid ? 'bg-[#FF4D00]' : 'bg-[#333333]'}`} />
        </button>

        {/* Snap to Geometry */}
        <button
          onClick={toggleSnapToGeometry}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-medium border ${
            snapToGeometry ? 'bg-[#1C1C1C] text-[#E5E5E5] border-[#333333]' : 'text-[#777777] hover:bg-[#1A1A1A] hover:text-[#CCCCCC] border-transparent'
          }`}
          title="Snap cursor to endpoints, midpoints & corners"
        >
          <div className="flex items-center gap-2">
            <Square className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Snap Geometry</span>
          </div>
          <span className={`w-2 h-2 rounded-full ${snapToGeometry ? 'bg-[#FF4D00]' : 'bg-[#333333]'}`} />
        </button>

        {/* Show Plot Numbers Toggle */}
        <button
          onClick={togglePlotLabels}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-medium border ${
            showPlotLabels ? 'bg-[#1C1C1C] text-[#E5E5E5] border-[#333333]' : 'text-[#777777] hover:bg-[#1A1A1A] hover:text-[#CCCCCC] border-transparent'
          }`}
          title="Toggle Plot Number & Area Badges"
        >
          <div className="flex items-center gap-2">
            <Type className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Plot Labels</span>
          </div>
          <span className={`w-2 h-2 rounded-full ${showPlotLabels ? 'bg-[#FF4D00]' : 'bg-[#333333]'}`} />
        </button>

        {/* Fit to Site / Plan */}
        <div className="pt-1 flex gap-1">
          <button
            onClick={fitToSite}
            className="flex-1 flex items-center justify-center gap-1 py-1 text-[11px] font-semibold text-[#CCCCCC] bg-[#1C1C1C] hover:bg-[#262626] hover:text-white border border-[#2A2A2A] rounded transition-colors"
            title="Fit Entire Site"
          >
            <Maximize className="w-3 h-3" />
            <span className="hidden md:inline">Fit Site</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
