import React from 'react';
import { useProjectStore } from '../store/projectStore';
import { calculatePolygonArea, calculatePolygonPerimeter, calculatePolylineLength } from '../utils/geometry';
import { RoadType, LandUseType, BuildingType, LandscapeType, FacilityType, TreeType, PlotStatus } from '../types/project';
import { Trash2, Copy, X } from 'lucide-react';

export const PropertiesPanel: React.FC = () => {
  const {
    project,
    selectedId,
    selectedType,
    setSelected,
    updateRoad,
    updatePlot,
    updateBuilding,
    updatePark,
    updateFacility,
    updateParking,
    updateTree,
    updateAnnotation,
    updateDimension,
    updateSite,
    deleteSelected,
    duplicateSelected
  } = useProjectStore();

  if (!selectedId || !selectedType) {
    // Show Global Site Properties
    const siteArea = calculatePolygonArea(project.site.boundary);
    const sitePerimeter = calculatePolygonPerimeter(project.site.boundary);

    return (
      <aside className="w-72 bg-[#141414] border-l border-[#2A2A2A] p-4 flex flex-col shrink-0 overflow-y-auto select-none text-[#E5E5E5]">
        <div className="border-b border-[#2A2A2A] pb-3 mb-4">
          <h3 className="text-xs font-bold text-[#E5E5E5] uppercase tracking-widest">Site Plan Properties</h3>
          <span className="text-[11px] text-[#888888] font-mono">Master Boundary & Overview</span>
        </div>

        <div className="space-y-3.5 text-xs text-[#CCCCCC]">
          <div>
            <label className="block text-[11px] font-semibold text-[#888888] mb-1 uppercase tracking-wider">Site Name</label>
            <input
              type="text"
              value={project.site.name}
              onChange={e => updateSite({ name: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-[#1C1C1C] border border-[#2A2A2A] rounded-md focus:border-[#FF4D00] focus:ring-1 focus:ring-[#FF4D00] outline-hidden font-medium text-[#E5E5E5]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-[#888888] mb-1 uppercase tracking-wider">Width (m)</label>
              <input
                type="number"
                value={project.site.width || 200}
                onChange={e => {
                  const w = Math.max(20, Number(e.target.value) || 200);
                  const h = project.site.height || 150;
                  updateSite({
                    width: w,
                    boundary: [[0, 0], [w, 0], [w, h], [0, h]]
                  });
                }}
                className="w-full px-2.5 py-1.5 bg-[#1C1C1C] border border-[#2A2A2A] rounded-md focus:border-[#FF4D00] outline-hidden font-mono text-[#E5E5E5]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#888888] mb-1 uppercase tracking-wider">Depth (m)</label>
              <input
                type="number"
                value={project.site.height || 150}
                onChange={e => {
                  const h = Math.max(20, Number(e.target.value) || 150);
                  const w = project.site.width || 200;
                  updateSite({
                    height: h,
                    boundary: [[0, 0], [w, 0], [w, h], [0, h]]
                  });
                }}
                className="w-full px-2.5 py-1.5 bg-[#1C1C1C] border border-[#2A2A2A] rounded-md focus:border-[#FF4D00] outline-hidden font-mono text-[#E5E5E5]"
              />
            </div>
          </div>

          <div className="bg-[#1A1A1A] p-3 rounded-md border border-[#2A2A2A] space-y-2">
            <div className="flex justify-between">
              <span className="text-[#888888]">Total Site Area:</span>
              <span className="font-mono font-bold text-[#E5E5E5]">{siteArea.toLocaleString()} m²</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#888888]">Perimeter:</span>
              <span className="font-mono text-[#CCCCCC]">{sitePerimeter.toFixed(1)} m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#888888]">Active Plots:</span>
              <span className="font-mono font-bold text-[#FF4D00]">{project.plots.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#888888]">Buildings:</span>
              <span className="font-mono font-bold text-[#FF4D00]">{project.buildings.length}</span>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // Selected Object Properties
  const renderObjectFields = () => {
    // 1. BUILDING PROPERTIES
    if (selectedType === 'building') {
      const bld = project.buildings.find(b => b.id === selectedId);
      if (!bld) return null;

      return (
        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-[#888888] mb-1 uppercase tracking-wider">Building Name</label>
            <input
              type="text"
              value={bld.name || ''}
              onChange={e => updateBuilding(bld.id, { name: e.target.value })}
              className="w-full px-2 py-1 bg-[#1C1C1C] border border-[#2A2A2A] rounded text-xs text-[#E5E5E5] focus:border-[#FF4D00] outline-hidden"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#888888] mb-1 uppercase tracking-wider">Building Type</label>
            <select
              value={bld.buildingType}
              onChange={e => updateBuilding(bld.id, { buildingType: e.target.value as BuildingType })}
              className="w-full px-2 py-1 bg-[#1C1C1C] border border-[#2A2A2A] rounded text-xs capitalize text-[#E5E5E5] focus:border-[#FF4D00] outline-hidden"
            >
              {['residential', 'apartment', 'commercial', 'school', 'hospital', 'community_center', 'office'].map(t => (
                <option key={t} value={t}>{t.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-[#888888] mb-1 uppercase tracking-wider">Width (m)</label>
              <input
                type="number"
                value={bld.width}
                onChange={e => updateBuilding(bld.id, { width: Math.max(2, Number(e.target.value)) })}
                className="w-full px-2 py-1 bg-[#1C1C1C] border border-[#2A2A2A] rounded text-xs font-mono text-[#E5E5E5] focus:border-[#FF4D00] outline-hidden"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#888888] mb-1 uppercase tracking-wider">Depth (m)</label>
              <input
                type="number"
                value={bld.depth}
                onChange={e => updateBuilding(bld.id, { depth: Math.max(2, Number(e.target.value)) })}
                className="w-full px-2 py-1 bg-[#1C1C1C] border border-[#2A2A2A] rounded text-xs font-mono text-[#E5E5E5] focus:border-[#FF4D00] outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-[#888888] mb-1 uppercase tracking-wider">Rotation (°)</label>
              <input
                type="number"
                value={bld.rotation || 0}
                onChange={e => updateBuilding(bld.id, { rotation: Number(e.target.value) || 0 })}
                className="w-full px-2 py-1 bg-[#1C1C1C] border border-[#2A2A2A] rounded text-xs font-mono text-[#E5E5E5] focus:border-[#FF4D00] outline-hidden"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#888888] mb-1 uppercase tracking-wider">Floors</label>
              <input
                type="number"
                value={bld.floors || 1}
                min={1}
                max={50}
                onChange={e => updateBuilding(bld.id, { floors: Math.max(1, Number(e.target.value)) })}
                className="w-full px-2 py-1 bg-[#1C1C1C] border border-[#2A2A2A] rounded text-xs font-mono text-[#E5E5E5] focus:border-[#FF4D00] outline-hidden"
              />
            </div>
          </div>

          {/* Setbacks */}
          <div className="border-t border-[#2A2A2A] pt-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-[#CCCCCC] uppercase tracking-wider">Setbacks (m)</span>
              <button
                onClick={() => updateBuilding(bld.id, { showSetback: !bld.showSetback })}
                className="text-[10px] text-[#FF4D00] hover:underline"
              >
                {bld.showSetback ? 'Hide Guides' : 'Show Guides'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <div>
                <span className="text-[#888888]">Front:</span>
                <input
                  type="number"
                  value={bld.setbacks?.front ?? 3}
                  onChange={e => updateBuilding(bld.id, { setbacks: { ...(bld.setbacks || { front: 3, rear: 2, left: 2, right: 2 }), front: Number(e.target.value) } })}
                  className="w-full px-1.5 py-0.5 bg-[#1C1C1C] border border-[#2A2A2A] rounded font-mono text-[#E5E5E5]"
                />
              </div>
              <div>
                <span className="text-[#888888]">Rear:</span>
                <input
                  type="number"
                  value={bld.setbacks?.rear ?? 2}
                  onChange={e => updateBuilding(bld.id, { setbacks: { ...(bld.setbacks || { front: 3, rear: 2, left: 2, right: 2 }), rear: Number(e.target.value) } })}
                  className="w-full px-1.5 py-0.5 bg-[#1C1C1C] border border-[#2A2A2A] rounded font-mono text-[#E5E5E5]"
                />
              </div>
              <div>
                <span className="text-[#888888]">Left:</span>
                <input
                  type="number"
                  value={bld.setbacks?.left ?? 2}
                  onChange={e => updateBuilding(bld.id, { setbacks: { ...(bld.setbacks || { front: 3, rear: 2, left: 2, right: 2 }), left: Number(e.target.value) } })}
                  className="w-full px-1.5 py-0.5 bg-[#1C1C1C] border border-[#2A2A2A] rounded font-mono text-[#E5E5E5]"
                />
              </div>
              <div>
                <span className="text-[#888888]">Right:</span>
                <input
                  type="number"
                  value={bld.setbacks?.right ?? 2}
                  onChange={e => updateBuilding(bld.id, { setbacks: { ...(bld.setbacks || { front: 3, rear: 2, left: 2, right: 2 }), right: Number(e.target.value) } })}
                  className="w-full px-1.5 py-0.5 bg-[#1C1C1C] border border-[#2A2A2A] rounded font-mono text-[#E5E5E5]"
                />
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 2. ROAD PROPERTIES
    if (selectedType === 'road') {
      const road = project.roads.find(r => r.id === selectedId);
      if (!road) return null;
      const roadLen = calculatePolylineLength(road.points);

      return (
        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-[#888888] mb-1 uppercase tracking-wider">Road Name</label>
            <input
              type="text"
              value={road.name}
              onChange={e => updateRoad(road.id, { name: e.target.value })}
              className="w-full px-2 py-1 bg-[#1C1C1C] border border-[#2A2A2A] rounded text-xs font-medium text-[#E5E5E5] focus:border-[#FF4D00] outline-hidden"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#888888] mb-1 uppercase tracking-wider">Road Classification</label>
            <select
              value={road.roadType}
              onChange={e => updateRoad(road.id, { roadType: e.target.value as RoadType })}
              className="w-full px-2 py-1 bg-[#1C1C1C] border border-[#2A2A2A] rounded text-xs capitalize text-[#E5E5E5] focus:border-[#FF4D00] outline-hidden"
            >
              {['main', 'secondary', 'local', 'service', 'pedestrian', 'cycle'].map(t => (
                <option key={t} value={t}>{t} road</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-[#888888] mb-1 uppercase tracking-wider">Width / ROW (m)</label>
              <input
                type="number"
                value={road.width}
                onChange={e => updateRoad(road.id, { width: Math.max(1.5, Number(e.target.value)) })}
                className="w-full px-2 py-1 bg-[#1C1C1C] border border-[#2A2A2A] rounded text-xs font-mono text-[#E5E5E5] focus:border-[#FF4D00] outline-hidden"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#888888] mb-1 uppercase tracking-wider">Direction</label>
              <select
                value={road.direction || 'bidirectional'}
                onChange={e => updateRoad(road.id, { direction: e.target.value as any })}
                className="w-full px-2 py-1 bg-[#1C1C1C] border border-[#2A2A2A] rounded text-xs text-[#E5E5E5] focus:border-[#FF4D00] outline-hidden"
              >
                <option value="bidirectional">Two-Way</option>
                <option value="forward">One-Way</option>
              </select>
            </div>
          </div>

          <div className="bg-[#1A1A1A] p-2.5 rounded border border-[#2A2A2A] text-[11px] space-y-1">
            <div className="flex justify-between text-[#888888]">
              <span>Segment Length:</span>
              <span className="font-mono font-bold text-[#E5E5E5]">{roadLen.toFixed(1)} m</span>
            </div>
            <div className="flex justify-between text-[#888888]">
              <span>Corridor Area:</span>
              <span className="font-mono text-[#E5E5E5]">{(roadLen * road.width).toFixed(0)} m²</span>
            </div>
          </div>
        </div>
      );
    }

    // 3. PLOT PROPERTIES
    if (selectedType === 'plot') {
      const plot = project.plots.find(p => p.id === selectedId);
      if (!plot) return null;
      const area = calculatePolygonArea(plot.polygon);
      const perim = calculatePolygonPerimeter(plot.polygon);

      return (
        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-[#888888] mb-1 uppercase tracking-wider">Plot Identifier</label>
            <input
              type="text"
              value={plot.number}
              onChange={e => updatePlot(plot.id, { number: e.target.value })}
              className="w-full px-2 py-1 bg-[#1C1C1C] border border-[#2A2A2A] rounded text-xs font-bold text-[#E5E5E5] focus:border-[#FF4D00] outline-hidden"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#888888] mb-1 uppercase tracking-wider">Land Use Zoning</label>
            <select
              value={plot.landUse}
              onChange={e => updatePlot(plot.id, { landUse: e.target.value as LandUseType })}
              className="w-full px-2 py-1 bg-[#1C1C1C] border border-[#2A2A2A] rounded text-xs capitalize text-[#E5E5E5] focus:border-[#FF4D00] outline-hidden"
            >
              {['residential', 'commercial', 'mixed_use', 'public', 'institutional', 'open_space', 'industrial'].map(t => (
                <option key={t} value={t}>{t.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#888888] mb-1 uppercase tracking-wider">Allocation Status</label>
            <select
              value={plot.status || 'available'}
              onChange={e => updatePlot(plot.id, { status: e.target.value as PlotStatus })}
              className="w-full px-2 py-1 bg-[#1C1C1C] border border-[#2A2A2A] rounded text-xs capitalize text-[#E5E5E5] focus:border-[#FF4D00] outline-hidden"
            >
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="allocated">Allocated</option>
            </select>
          </div>

          <div className="bg-[#1A1A1A] p-2.5 rounded border border-[#2A2A2A] text-[11px] space-y-1">
            <div className="flex justify-between">
              <span className="text-[#888888]">Plot Area:</span>
              <span className="font-mono font-bold text-[#E5E5E5]">{Math.round(area)} m²</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#888888]">Perimeter:</span>
              <span className="font-mono text-[#CCCCCC]">{perim.toFixed(1)} m</span>
            </div>
          </div>
        </div>
      );
    }

    // 4. TREE PROPERTIES
    if (selectedType === 'tree') {
      const tree = (project.trees || []).find(t => t.id === selectedId);
      if (!tree) return null;

      return (
        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-[#888888] mb-1 uppercase tracking-wider">Tree Canopy Type</label>
            <select
              value={tree.treeType}
              onChange={e => updateTree(tree.id, { treeType: e.target.value as TreeType })}
              className="w-full px-2 py-1 bg-[#1C1C1C] border border-[#2A2A2A] rounded text-xs capitalize text-[#E5E5E5] focus:border-[#FF4D00] outline-hidden"
            >
              {['canopy', 'palm', 'evergreen', 'ornamental'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#888888] mb-1 uppercase tracking-wider">Canopy Diameter (m)</label>
            <input
              type="number"
              value={tree.diameter}
              onChange={e => updateTree(tree.id, { diameter: Math.max(1, Number(e.target.value)) })}
              className="w-full px-2 py-1 bg-[#1C1C1C] border border-[#2A2A2A] rounded text-xs font-mono text-[#E5E5E5] focus:border-[#FF4D00] outline-hidden"
            />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <aside className="w-72 bg-[#141414] border-l border-[#2A2A2A] p-4 flex flex-col shrink-0 overflow-y-auto select-none text-[#E5E5E5]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-2.5 mb-3">
        <div>
          <h3 className="text-xs font-bold text-[#E5E5E5] uppercase tracking-widest">
            {selectedType} Properties
          </h3>
          <span className="text-[10px] text-[#777777] font-mono">{selectedId}</span>
        </div>
        <button
          onClick={() => setSelected(null, null)}
          className="text-[#777777] hover:text-[#FF4D00] p-1 rounded transition-colors"
          title="Deselect"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-y-auto">{renderObjectFields()}</div>

      {/* Action Buttons (Duplicate & Delete) */}
      <div className="border-t border-[#2A2A2A] pt-3 mt-4 flex gap-2">
        <button
          onClick={duplicateSelected}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-[#CCCCCC] bg-[#1C1C1C] hover:bg-[#262626] hover:text-white border border-[#2A2A2A] rounded-md transition-colors"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Duplicate</span>
        </button>
        <button
          onClick={deleteSelected}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-[#FF5544] bg-[#2A1515] hover:bg-[#381818] border border-[#441C1C] rounded-md transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>
      </div>
    </aside>
  );
};
