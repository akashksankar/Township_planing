import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { useProjectStore } from '../store/projectStore';
import { Point2D, SnapTarget, BoundingBox } from '../types/project';
import {
  distance,
  getBoundingBox,
  findSnapPoint,
  rotatePoint
} from '../utils/geometry';
import { isBuildingInsideSite } from '../utils/collision';

import { SiteRenderer } from './canvas/SiteRenderer';
import { RoadsRenderer } from './canvas/RoadsRenderer';
import { PlotsRenderer } from './canvas/PlotsRenderer';
import { BuildingsRenderer } from './canvas/BuildingsRenderer';
import { LandscapeRenderer } from './canvas/LandscapeRenderer';
import { FacilitiesRenderer } from './canvas/FacilitiesRenderer';
import { ParkingRenderer } from './canvas/ParkingRenderer';
import { InfrastructureRenderer } from './canvas/InfrastructureRenderer';
import { AnnotationsRenderer } from './canvas/AnnotationsRenderer';
import { DimensionsRenderer } from './canvas/DimensionsRenderer';
import { InteractiveOverlay } from './canvas/InteractiveOverlay';

export const Canvas: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Store state
  const {
    project,
    activeMode,
    selectedId,
    selectedType,
    subTypeRoad,
    subTypeLandUse,
    subTypeBuilding,
    subTypeLandscape,
    subTypeFacility,
    subTypeInfra,
    subTypeDimension,
    subTypeTree,
    transform,
    showGrid,
    gridSpacing,
    snapToGrid,
    snapToGeometry,
    snapTolerance,
    showPlotLabels,
    draftPoints,
    cursorPos,
    measurePoints,
    setMode,
    setSelected,
    setTransform,
    setCursorPos,
    addDraftPoint,
    clearDraft,
    addMeasurePoint,
    recordHistory,
    addRoad,
    addPlot,
    addBuilding,
    updateBuilding,
    addPark,
    addFacility,
    addParking,
    addTree,
    updateTree,
    addInfrastructure,
    addAnnotation,
    addDimension
  } = useProjectStore();

  // Local drag & interaction state
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const [isDraggingEntity, setIsDraggingEntity] = useState(false);
  const [dragOffset, setDragOffset] = useState<Point2D>([0, 0]);
  const [dragEntityInitialPos, setDragEntityInitialPos] = useState<Point2D | null>(null);

  const [activeSnap, setActiveSnap] = useState<SnapTarget | null>(null);
  const [collisionWarning, setCollisionWarning] = useState<string | null>(null);

  // Convert browser client coords to Site Meter coordinates
  const clientToSiteCoords = useCallback(
    (clientX: number, clientY: number): Point2D => {
      if (!svgRef.current) return [0, 0];
      const rect = svgRef.current.getBoundingClientRect();
      const rawX = clientX - rect.left;
      const rawY = clientY - rect.top;

      // Base site dimensions
      const siteW = project.site.width || 200;
      const siteH = project.site.height || 150;

      // Account for aspect ratio and SVG viewport scaling
      const viewX = (rawX - transform.panX) / transform.zoom;
      const viewY = (rawY - transform.panY) / transform.zoom;

      // Scale factor from SVG viewbox to screen
      const scaleX = siteW / rect.width;
      const scaleY = siteH / rect.height;

      const meterX = viewX * scaleX;
      const meterY = viewY * scaleY;

      return [meterX, meterY];
    },
    [project.site.width, project.site.height, transform]
  );

  // Compute all potential snap targets from geometric objects
  const snapTargets = useMemo<SnapTarget[]>(() => {
    if (!snapToGeometry) return [];
    const targets: SnapTarget[] = [];

    // Site boundary corners
    project.site.boundary.forEach((p, idx) => {
      targets.push({ point: p, type: 'corner', description: `Site Corner ${idx + 1}` });
    });

    // Road endpoints and midpoints
    project.roads.forEach(r => {
      if (r.points.length >= 2) {
        targets.push({ point: r.points[0], type: 'endpoint', description: `${r.name} Start` });
        targets.push({ point: r.points[r.points.length - 1], type: 'endpoint', description: `${r.name} End` });
        for (let i = 0; i < r.points.length - 1; i++) {
          const mid: Point2D = [(r.points[i][0] + r.points[i + 1][0]) / 2, (r.points[i][1] + r.points[i + 1][1]) / 2];
          targets.push({ point: mid, type: 'midpoint', description: 'Road Midpoint' });
        }
      }
    });

    // Plot corners
    project.plots.forEach(p => {
      p.polygon.forEach((pt, idx) => {
        targets.push({ point: pt, type: 'corner', description: `Plot ${p.number} Corner ${idx + 1}` });
      });
    });

    return targets;
  }, [snapToGeometry, project.site.boundary, project.roads, project.plots]);

  // Handle entity selection helper
  const handleSelectEntity = useCallback(
    (id: string, type: string) => {
      if (activeMode === 'select') {
        setSelected(id, type);
      }
    },
    [activeMode, setSelected]
  );

  // Pointer Down (Mouse click / Touch start)
  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.target && (e.target as Element).setPointerCapture) {
      try {
        (e.target as Element).setPointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }

    // Pan with middle mouse button or space+click
    if (e.button === 1 || e.buttons === 4 || e.altKey) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - transform.panX, y: e.clientY - transform.panY });
      return;
    }

    const rawSitePos = clientToSiteCoords(e.clientX, e.clientY);
    const { point: snappedPos, target: snapHit } = findSnapPoint(
      rawSitePos,
      snapTargets,
      gridSpacing,
      snapToGrid,
      snapTolerance
    );
    setActiveSnap(snapHit);

    // MODE SPECIFIC ACTIONS
    if (activeMode === 'select') {
      if (selectedId && selectedType) {
        // Start dragging selected entity
        setIsDraggingEntity(true);
        if (selectedType === 'building') {
          const bld = project.buildings.find(b => b.id === selectedId);
          if (bld) {
            setDragEntityInitialPos([bld.position.x, bld.position.y]);
            setDragOffset([snappedPos[0] - bld.position.x, snappedPos[1] - bld.position.y]);
          }
        } else if (selectedType === 'tree') {
          const tr = (project.trees || []).find(t => t.id === selectedId);
          if (tr) {
            setDragEntityInitialPos([tr.position.x, tr.position.y]);
            setDragOffset([snappedPos[0] - tr.position.x, snappedPos[1] - tr.position.y]);
          }
        }
      } else {
        // Clicked empty canvas -> deselect
        setSelected(null, null);
      }
    } else if (activeMode === 'measure') {
      addMeasurePoint(snappedPos);
    } else if (activeMode === 'road') {
      addDraftPoint(snappedPos);
    } else if (activeMode === 'plot') {
      addDraftPoint(snappedPos);
    } else if (activeMode === 'landscape') {
      if (subTypeLandscape === 'park') {
        addDraftPoint(snappedPos);
      } else {
        // Stamp tree
        addTree({
          treeType: subTypeTree,
          position: { x: snappedPos[0], y: snappedPos[1] },
          diameter: subTypeTree === 'canopy' ? 6 : 5
        });
      }
    } else if (activeMode === 'building') {
      // Stamp Building at click point
      const width = subTypeBuilding === 'apartment' ? 18 : subTypeBuilding === 'commercial' ? 22 : 14;
      const depth = subTypeBuilding === 'apartment' ? 16 : subTypeBuilding === 'commercial' ? 20 : 12;

      // Find if clicking inside a plot
      const containingPlot = project.plots.find(p => {
        // quick bbox test
        const b = getBoundingBox(p.polygon);
        return snappedPos[0] >= b.minX && snappedPos[0] <= b.maxX && snappedPos[1] >= b.minY && snappedPos[1] <= b.maxY;
      });

      addBuilding({
        buildingType: subTypeBuilding,
        name: `${subTypeBuilding.charAt(0).toUpperCase() + subTypeBuilding.slice(1)} Unit`,
        position: { x: snappedPos[0] - width / 2, y: snappedPos[1] - depth / 2 },
        width,
        depth,
        rotation: 0,
        plotId: containingPlot?.id,
        setbacks: { front: 3, rear: 2, left: 2, right: 2 },
        showSetback: true
      });
      setMode('select');
    } else if (activeMode === 'facility') {
      // Stamp Public Facility
      const width = subTypeFacility === 'school' ? 32 : subTypeFacility === 'hospital' ? 36 : 24;
      const depth = subTypeFacility === 'school' ? 24 : subTypeFacility === 'hospital' ? 26 : 18;

      addFacility({
        facilityType: subTypeFacility,
        name: subTypeFacility.toUpperCase().replace('_', ' '),
        position: { x: snappedPos[0] - width / 2, y: snappedPos[1] - depth / 2 },
        width,
        depth,
        rotation: 0
      });
      setMode('select');
    } else if (activeMode === 'parking') {
      addDraftPoint(snappedPos);
    } else if (activeMode === 'infrastructure') {
      if (subTypeInfra === 'water_pipe' || subTypeInfra === 'drain') {
        addDraftPoint(snappedPos);
      } else {
        // Stamp Point Infrastructure (Tank / Manhole)
        addInfrastructure({
          infraType: subTypeInfra,
          name: subTypeInfra.toUpperCase().replace('_', ' '),
          position: { x: snappedPos[0], y: snappedPos[1] },
          diameter: subTypeInfra === 'water_tank' ? 8 : 1.5
        });
      }
    } else if (activeMode === 'dimension') {
      if (draftPoints.length === 0) {
        addDraftPoint(snappedPos);
      } else if (draftPoints.length === 1) {
        addDimension({
          dimensionType: subTypeDimension,
          startPoint: draftPoints[0],
          endPoint: snappedPos,
          offset: 4
        });
        clearDraft();
        setMode('select');
      }
    } else if (activeMode === 'text') {
      const text = window.prompt('Enter label text:', 'TOWNSHIP SECTOR') || 'TOWNSHIP LABEL';
      if (text) {
        addAnnotation({
          text,
          position: snappedPos,
          fontSize: 10,
          bold: true,
          color: '#1e293b'
        });
      }
      setMode('select');
    }
  };

  // Pointer Move (Mouse move / Touch drag)
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (isPanning) {
      setTransform({
        panX: e.clientX - panStart.x,
        panY: e.clientY - panStart.y
      });
      return;
    }

    const rawSitePos = clientToSiteCoords(e.clientX, e.clientY);
    const { point: snappedPos, target: snapHit } = findSnapPoint(
      rawSitePos,
      snapTargets,
      gridSpacing,
      snapToGrid,
      snapTolerance
    );

    setCursorPos(snappedPos);
    setActiveSnap(snapHit);

    // Entity live dragging
    if (isDraggingEntity && selectedId && selectedType) {
      const newX = snappedPos[0] - dragOffset[0];
      const newY = snappedPos[1] - dragOffset[1];

      if (selectedType === 'building') {
        const bld = project.buildings.find(b => b.id === selectedId);
        if (bld) {
          const testBld = { ...bld, position: { x: newX, y: newY } };
          const insideSite = isBuildingInsideSite(testBld, project.site.boundary);
          if (!insideSite) {
            setCollisionWarning('Warning: Building placed outside site boundary');
          } else {
            setCollisionWarning(null);
          }
          updateBuilding(selectedId, { position: { x: newX, y: newY } });
        }
      } else if (selectedType === 'tree') {
        updateTree(selectedId, { position: { x: newX, y: newY } });
      }
    }
  };

  // Pointer Up (Mouse release / Touch end)
  const handlePointerUp = () => {
    if (isPanning) {
      setIsPanning(false);
    }
    if (isDraggingEntity) {
      setIsDraggingEntity(false);
      recordHistory(); // Drag finished -> 1 clean undo history entry!
      setDragEntityInitialPos(null);
    }
  };

  // Double click to finish drafting polylines / polygons
  const handleDoubleClick = () => {
    if (draftPoints.length < 2) return;

    if (activeMode === 'road') {
      addRoad({
        roadType: subTypeRoad,
        name: `${subTypeRoad.charAt(0).toUpperCase() + subTypeRoad.slice(1)} Road`,
        width: subTypeRoad === 'main' ? 12 : subTypeRoad === 'secondary' ? 8 : 6,
        points: draftPoints,
        direction: 'bidirectional',
        laneCount: subTypeRoad === 'main' ? 4 : 2
      });
      clearDraft();
      setMode('select');
    } else if (activeMode === 'plot') {
      if (draftPoints.length >= 3) {
        addPlot({
          number: `P-${project.plots.length + 1}`,
          landUse: subTypeLandUse,
          polygon: draftPoints,
          status: 'available'
        });
      }
      clearDraft();
      setMode('select');
    } else if (activeMode === 'landscape' && subTypeLandscape === 'park') {
      if (draftPoints.length >= 3) {
        addPark({
          landscapeType: subTypeLandscape,
          name: 'Green Park',
          polygon: draftPoints
        });
      }
      clearDraft();
      setMode('select');
    } else if (activeMode === 'parking') {
      if (draftPoints.length >= 3) {
        addParking({
          name: 'Parking Lot',
          polygon: draftPoints,
          bayOrientation: 'perpendicular'
        });
      }
      clearDraft();
      setMode('select');
    } else if (activeMode === 'infrastructure') {
      if (draftPoints.length >= 2) {
        addInfrastructure({
          infraType: subTypeInfra,
          name: subTypeInfra === 'water_pipe' ? 'Water Pipe' : 'Drainage Line',
          points: draftPoints,
          flowDirection: 'forward'
        });
      }
      clearDraft();
      setMode('select');
    }
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    const newZoom = Math.min(Math.max(transform.zoom * zoomFactor, 0.2), 6.0);
    setTransform({ zoom: newZoom });
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        useProjectStore.getState().undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) {
        e.preventDefault();
        useProjectStore.getState().redo();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        useProjectStore.getState().deleteSelected();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        useProjectStore.getState().duplicateSelected();
      } else if (e.key === 'Escape') {
        clearDraft();
        useProjectStore.getState().clearMeasure();
        setMode('select');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [clearDraft, setMode]);

  // Compute selected bounding box
  const selectedBBox = useMemo<BoundingBox | null>(() => {
    if (!selectedId || !selectedType) return null;
    if (selectedType === 'building') {
      const bld = project.buildings.find(b => b.id === selectedId);
      if (bld) {
        return {
          minX: bld.position.x,
          minY: bld.position.y,
          maxX: bld.position.x + bld.width,
          maxY: bld.position.y + bld.depth
        };
      }
    } else if (selectedType === 'plot') {
      const plot = project.plots.find(p => p.id === selectedId);
      if (plot) return getBoundingBox(plot.polygon);
    } else if (selectedType === 'tree') {
      const tree = (project.trees || []).find(t => t.id === selectedId);
      if (tree) {
        const r = tree.diameter / 2;
        return {
          minX: tree.position.x - r,
          minY: tree.position.y - r,
          maxX: tree.position.x + r,
          maxY: tree.position.y + r
        };
      }
    }
    return null;
  }, [selectedId, selectedType, project]);

  // Selected building rotation angle
  const selectedRotation = useMemo<number>(() => {
    if (selectedType === 'building' && selectedId) {
      const bld = project.buildings.find(b => b.id === selectedId);
      return bld?.rotation || 0;
    }
    return 0;
  }, [selectedType, selectedId, project.buildings]);

  // Rotate handle interaction
  const handleStartRotate = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (!selectedBBox || selectedType !== 'building' || !selectedId) return;

    const bld = project.buildings.find(b => b.id === selectedId);
    if (!bld) return;

    const centerX = bld.position.x + bld.width / 2;
    const centerY = bld.position.y + bld.depth / 2;

    const onPointerMoveRot = (moveEvent: PointerEvent) => {
      const currentSite = clientToSiteCoords(moveEvent.clientX, moveEvent.clientY);
      const angleRad = Math.atan2(currentSite[1] - centerY, currentSite[0] - centerX);
      let angleDeg = (angleRad * 180) / Math.PI + 90; // Top is 0 deg
      if (angleDeg < 0) angleDeg += 360;
      // Snap rotation to 15 degrees if Ctrl held
      if (moveEvent.ctrlKey) angleDeg = Math.round(angleDeg / 15) * 15;
      updateBuilding(selectedId, { rotation: Math.round(angleDeg) });
    };

    const onPointerUpRot = () => {
      window.removeEventListener('pointermove', onPointerMoveRot);
      window.removeEventListener('pointerup', onPointerUpRot);
      recordHistory();
    };

    window.addEventListener('pointermove', onPointerMoveRot);
    window.addEventListener('pointerup', onPointerUpRot);
  };

  // Base dimensions of the site in meters
  const siteW = project.site.width || 200;
  const siteH = project.site.height || 150;
  const marginOffset = 15; // margin around site in meters

  // Grid lines generation
  const gridLines = useMemo(() => {
    if (!showGrid || gridSpacing <= 0) return null;
    const lines: React.ReactNode[] = [];
    const step = gridSpacing;

    // Vertical grid lines
    for (let x = 0; x <= siteW; x += step) {
      lines.push(
        <line
          key={`grid-v-${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={siteH}
          stroke={x % (step * 5) === 0 ? '#333333' : '#1A1A1A'}
          strokeWidth={x % (step * 5) === 0 ? 0.4 : 0.2}
        />
      );
    }

    // Horizontal grid lines
    for (let y = 0; y <= siteH; y += step) {
      lines.push(
        <line
          key={`grid-h-${y}`}
          x1={0}
          y1={y}
          x2={siteW}
          y2={y}
          stroke={y % (step * 5) === 0 ? '#333333' : '#1A1A1A'}
          strokeWidth={y % (step * 5) === 0 ? 0.4 : 0.2}
        />
      );
    }

    return <g id="editor-grid" className="editor-grid" pointerEvents="none">{lines}</g>;
  }, [showGrid, gridSpacing, siteW, siteH]);

  return (
    <div className="relative w-full h-full bg-[#0C0C0C] overflow-hidden select-none flex flex-col">
      {/* Collision / Notice Banner */}
      {collisionWarning && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-[#FF4D00] text-black text-xs font-bold px-3.5 py-1.5 rounded-md shadow-lg flex items-center gap-1.5 animate-pulse tracking-wide uppercase">
          <span>⚠️</span> {collisionWarning}
        </div>
      )}

      {/* Draft Instruction Tooltip */}
      {draftPoints.length > 0 && (
        <div className="absolute top-3 right-4 z-20 bg-[#141414]/95 backdrop-blur border border-[#2A2A2A] text-[#E5E5E5] text-xs px-3.5 py-2 rounded-md shadow-xl flex items-center gap-2">
          <span>Drawing {activeMode}: Click points, <strong className="text-[#FF4D00]">Double Click</strong> to complete.</span>
          <button
            onClick={clearDraft}
            className="text-[#FF4D00] hover:text-[#FF7033] font-bold ml-1 text-xs"
          >
            Cancel [ESC]
          </button>
        </div>
      )}

      {/* Main SVG Canvas */}
      <svg
        id="township-svg-plan"
        ref={svgRef}
        className="w-full h-full cursor-crosshair touch-none bg-[#0C0C0C]"
        viewBox={`${-marginOffset} ${-marginOffset} ${siteW + marginOffset * 2} ${siteH + marginOffset * 2}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onDoubleClick={handleDoubleClick}
        onWheel={handleWheel}
      >
        <defs>
          {/* Subtle drop shadows and pattern hatches */}
          <pattern id="site-grid-dots" width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="0.4" fill="#333333" />
          </pattern>
        </defs>

        {/* Scaled/Panned Container */}
        <g transform={`translate(${transform.panX}, ${transform.panY}) scale(${transform.zoom})`}>
          {/* Background Grid */}
          {gridLines}

          {/* 1. Site Boundary Layer */}
          <SiteRenderer
            site={project.site}
            layer={project.layers.find(l => l.id === 'SITE')}
            isSelected={selectedType === 'site'}
          />

          {/* 2. Road Corridors & Paths */}
          <RoadsRenderer
            roads={project.roads}
            footpaths={project.footpaths}
            layer={project.layers.find(l => l.id === 'ROADS')}
            selectedId={selectedId}
            onSelectRoad={id => handleSelectEntity(id, 'road')}
          />

          {/* 3. Plots & Land Use Subdivisions */}
          <PlotsRenderer
            plots={project.plots}
            layer={project.layers.find(l => l.id === 'PLOTS')}
            selectedId={selectedId}
            showLabels={showPlotLabels}
            onSelectPlot={id => handleSelectEntity(id, 'plot')}
          />

          {/* 4. Parking Lots */}
          <ParkingRenderer
            parking={project.parking}
            layer={project.layers.find(l => l.id === 'PARKING')}
            selectedId={selectedId}
            onSelectParking={id => handleSelectEntity(id, 'parking')}
          />

          {/* 5. Landscape, Parks, Trees & Lights */}
          <LandscapeRenderer
            parks={project.parks}
            trees={project.trees}
            streetLights={project.streetLights}
            layer={project.layers.find(l => l.id === 'LANDSCAPE')}
            selectedId={selectedId}
            onSelectEntity={handleSelectEntity}
          />

          {/* 6. Public Facilities */}
          <FacilitiesRenderer
            facilities={project.facilities}
            layer={project.layers.find(l => l.id === 'FACILITIES')}
            selectedId={selectedId}
            onSelectFacility={id => handleSelectEntity(id, 'facility')}
          />

          {/* 7. Building Footprints */}
          <BuildingsRenderer
            buildings={project.buildings}
            layer={project.layers.find(l => l.id === 'BUILDINGS')}
            selectedId={selectedId}
            onSelectBuilding={id => handleSelectEntity(id, 'building')}
          />

          {/* 8. Infrastructure (Water & Drainage) */}
          <InfrastructureRenderer
            infrastructure={project.infrastructure}
            layers={project.layers}
            selectedId={selectedId}
            onSelectInfrastructure={id => handleSelectEntity(id, 'infrastructure')}
          />

          {/* 9. Technical Dimensions */}
          <DimensionsRenderer
            dimensions={project.dimensions}
            layer={project.layers.find(l => l.id === 'DIMENSIONS')}
            selectedId={selectedId}
            onSelectDimension={id => handleSelectEntity(id, 'dimension')}
          />

          {/* 10. Text Annotations & North Arrow */}
          <AnnotationsRenderer
            annotations={project.annotations}
            northArrow={project.northArrow}
            layer={project.layers.find(l => l.id === 'ANNOTATIONS')}
            selectedId={selectedId}
            onSelectAnnotation={id => handleSelectEntity(id, 'text')}
          />

          {/* 11. Interactive Overlay (Selection, Handles, Snapping, Drafts) */}
          <InteractiveOverlay
            selectionBBox={selectedBBox}
            rotationAngle={selectedRotation}
            onStartRotate={handleStartRotate}
            snapTarget={activeSnap}
            draftPoints={draftPoints}
            cursorPos={cursorPos}
            activeMode={activeMode}
            measurePoints={measurePoints}
          />
        </g>
      </svg>

      {/* Floating Viewport Controls (Bottom Right) */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 bg-[#141414]/95 backdrop-blur-md px-2 py-1.5 rounded-md border border-[#2A2A2A] shadow-xl text-xs text-[#E5E5E5] font-medium">
        <button
          id="btn-zoom-in"
          onClick={() => setTransform({ zoom: Math.min(transform.zoom * 1.25, 6.0) })}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#252525] hover:text-[#FF4D00] font-bold text-sm transition-colors"
          title="Zoom In"
        >
          +
        </button>
        <span className="w-12 text-center font-mono text-[#CCCCCC]">{Math.round(transform.zoom * 100)}%</span>
        <button
          id="btn-zoom-out"
          onClick={() => setTransform({ zoom: Math.max(transform.zoom * 0.8, 0.2) })}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#252525] hover:text-[#FF4D00] font-bold text-sm transition-colors"
          title="Zoom Out"
        >
          −
        </button>
        <div className="w-px h-4 bg-[#2A2A2A] mx-0.5" />
        <button
          id="btn-fit-site"
          onClick={() => useProjectStore.getState().fitToSite()}
          className="px-2 py-1 rounded hover:bg-[#252525] hover:text-[#FF4D00] text-xs font-semibold transition-colors"
          title="Fit Site to Viewport"
        >
          Fit Site
        </button>
      </div>

      {/* Floating Technical Scale Bar (Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-20 bg-[#141414]/95 backdrop-blur-md px-3 py-1.5 rounded-md border border-[#2A2A2A] shadow-xl flex flex-col gap-0.5 pointer-events-none">
        <div className="flex items-center justify-between text-[10px] font-mono text-[#888888] w-32">
          <span>0m</span>
          <span>10m</span>
          <span>20m</span>
          <span>30m</span>
        </div>
        <div className="w-32 h-1.5 flex border border-[#2A2A2A] bg-[#1E1E1E]">
          <div className="w-1/3 h-full bg-[#FF4D00]" />
          <div className="w-1/3 h-full bg-[#141414]" />
          <div className="w-1/3 h-full bg-[#FF4D00]" />
        </div>
        <span className="text-[9px] font-mono text-[#777777] text-center uppercase tracking-wider">Scale {project.project.scale}</span>
      </div>
    </div>
  );
};
