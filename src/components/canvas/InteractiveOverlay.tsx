import React from 'react';
import { Point2D, SnapTarget, BoundingBox } from '../../types/project';
import { distance, calculatePolygonArea, calculatePolylineLength, calculateAngle } from '../../utils/geometry';

interface InteractiveOverlayProps {
  selectionBBox: BoundingBox | null;
  rotationAngle?: number;
  onStartRotate?: (e: React.PointerEvent) => void;
  onStartResize?: (handle: string, e: React.PointerEvent) => void;
  snapTarget: SnapTarget | null;
  draftPoints: Point2D[];
  cursorPos: Point2D;
  activeMode: string;
  measurePoints: Point2D[];
}

export const InteractiveOverlay: React.FC<InteractiveOverlayProps> = ({
  selectionBBox,
  rotationAngle = 0,
  onStartRotate,
  onStartResize,
  snapTarget,
  draftPoints,
  cursorPos,
  activeMode,
  measurePoints
}) => {
  // 1. Selection Bounding Box & Transformation Handles
  const renderSelectionHandles = () => {
    if (!selectionBBox) return null;
    const { minX, minY, maxX, maxY } = selectionBBox;
    const width = maxX - minX;
    const height = maxY - minY;
    const centerX = minX + width / 2;
    const centerY = minY + height / 2;

    const handleSize = 2.2;
    const rotOffset = 5;

    return (
      <g
        id="selection-transform-overlay"
        className="editor-overlay"
        transform={`translate(${centerX}, ${centerY}) rotate(${rotationAngle}) translate(${-centerX}, ${-centerY})`}
      >
        {/* Selection Rectangle */}
        <rect
          x={minX - 0.5}
          y={minY - 0.5}
          width={width + 1}
          height={height + 1}
          fill="none"
          stroke="#FF4D00"
          strokeWidth="0.8"
          strokeDasharray="2 1"
        />

        {/* 4 Corner Resize Handles */}
        <rect
          x={minX - handleSize / 2}
          y={minY - handleSize / 2}
          width={handleSize}
          height={handleSize}
          fill="#141414"
          stroke="#FF4D00"
          strokeWidth="0.6"
          className="cursor-nwse-resize"
          onPointerDown={e => onStartResize && onStartResize('nw', e)}
        />
        <rect
          x={maxX - handleSize / 2}
          y={minY - handleSize / 2}
          width={handleSize}
          height={handleSize}
          fill="#141414"
          stroke="#FF4D00"
          strokeWidth="0.6"
          className="cursor-nesw-resize"
          onPointerDown={e => onStartResize && onStartResize('ne', e)}
        />
        <rect
          x={maxX - handleSize / 2}
          y={maxY - handleSize / 2}
          width={handleSize}
          height={handleSize}
          fill="#141414"
          stroke="#FF4D00"
          strokeWidth="0.6"
          className="cursor-nwse-resize"
          onPointerDown={e => onStartResize && onStartResize('se', e)}
        />
        <rect
          x={minX - handleSize / 2}
          y={maxY - handleSize / 2}
          width={handleSize}
          height={handleSize}
          fill="#141414"
          stroke="#FF4D00"
          strokeWidth="0.6"
          className="cursor-nesw-resize"
          onPointerDown={e => onStartResize && onStartResize('sw', e)}
        />

        {/* Rotation Handle Stem and Circle */}
        <line
          x1={centerX}
          y1={minY - 0.5}
          x2={centerX}
          y2={minY - rotOffset}
          stroke="#FF4D00"
          strokeWidth="0.6"
        />
        <circle
          cx={centerX}
          cy={minY - rotOffset}
          r={handleSize / 2}
          fill="#FF4D00"
          stroke="#000000"
          strokeWidth="0.6"
          className="cursor-grab"
          onPointerDown={e => onStartRotate && onStartRotate(e)}
        />
      </g>
    );
  };

  // 2. Draft Drawing Rubberband
  const renderDraft = () => {
    if (draftPoints.length === 0) return null;
    const allPoints = [...draftPoints, cursorPos];
    const pathData = allPoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');

    const isPolygonMode = activeMode === 'plot' || activeMode === 'landscape' || activeMode === 'parking' || activeMode === 'site';

    return (
      <g id="draft-overlay" className="editor-overlay" pointerEvents="none">
        {/* Rubberband path line */}
        <path
          d={pathData}
          stroke="#FF4D00"
          strokeWidth="1.0"
          strokeDasharray="3 2"
          fill={isPolygonMode && allPoints.length >= 3 ? '#FF4D0025' : 'none'}
        />

        {/* Vertex markers */}
        {draftPoints.map(([x, y], idx) => (
          <circle key={`draft-pt-${idx}`} cx={x} cy={y} r="1.2" fill="#FF4D00" stroke="#000000" strokeWidth="0.4" />
        ))}

        {/* Live Segment Distance label */}
        {draftPoints.length > 0 && (
          <g transform={`translate(${(draftPoints[draftPoints.length - 1][0] + cursorPos[0]) / 2}, ${(draftPoints[draftPoints.length - 1][1] + cursorPos[1]) / 2 - 2})`}>
            <rect x="-6" y="-3" width="12" height="4.5" rx="0.8" fill="#141414" stroke="#2A2A2A" strokeWidth="0.4" opacity={0.95} />
            <text x="0" y="0" fontSize="2.2" fontFamily="monospace" fill="#E5E5E5" textAnchor="middle">
              {distance(draftPoints[draftPoints.length - 1], cursorPos).toFixed(1)} m
            </text>
          </g>
        )}
      </g>
    );
  };

  // 3. Measurement Tool Overlay
  const renderMeasure = () => {
    if (activeMode !== 'measure') return null;
    const points = [...measurePoints];
    if (points.length === 1) points.push(cursorPos);

    if (points.length < 2) return null;
    const pathData = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');
    const dist = calculatePolylineLength(points);

    return (
      <g id="measure-overlay" className="editor-overlay" pointerEvents="none">
        <path d={pathData} stroke="#0284c7" strokeWidth="1.2" strokeDasharray="3 2" fill="none" />
        {points.map(([x, y], idx) => (
          <g key={`m-pt-${idx}`} transform={`translate(${x}, ${y})`}>
            <circle r="1.5" fill="#0284c7" stroke="#ffffff" strokeWidth="0.5" />
            <text y="-2.5" fontSize="2.4" fontFamily="monospace" fontWeight="bold" fill="#0369a1" textAnchor="middle">
              {String.fromCharCode(65 + idx)}
            </text>
          </g>
        ))}

        {/* Polygon Area / Angle if 3 points */}
        {points.length === 3 && (
          <g transform={`translate(${points[1][0]}, ${points[1][1] - 4})`}>
            <rect x="-10" y="-3.5" width="20" height="5" rx="1" fill="#0284c7" opacity={0.9} />
            <text x="0" y="0" fontSize="2.3" fontFamily="monospace" fill="#ffffff" textAnchor="middle">
              ∠ {calculateAngle(points[0], points[1], points[2]).toFixed(1)}° | {calculatePolygonArea(points).toFixed(0)} m²
            </text>
          </g>
        )}

        {/* Distance label */}
        <g transform={`translate(${(points[0][0] + points[1][0]) / 2}, ${(points[0][1] + points[1][1]) / 2 - 2})`}>
          <rect x="-8" y="-3" width="16" height="4.5" rx="0.8" fill="#0284c7" opacity={0.9} />
          <text x="0" y="0" fontSize="2.2" fontFamily="monospace" fill="#ffffff" textAnchor="middle">
            Dist: {dist.toFixed(2)} m
          </text>
        </g>
      </g>
    );
  };

  // 4. Snap Target Glyph Indicator
  const renderSnapIndicator = () => {
    if (!snapTarget) return null;
    const [sx, sy] = snapTarget.point;

    return (
      <g id="snap-indicator" className="snap-indicator" transform={`translate(${sx}, ${sy})`} pointerEvents="none">
        <circle r="1.8" fill="none" stroke="#22c55e" strokeWidth="0.8" />
        <circle r="0.8" fill="#22c55e" />
        {snapTarget.description && (
          <text x="3" y="1" fontSize="2.0" fontFamily="sans-serif" fontWeight="bold" fill="#15803d">
            {snapTarget.description}
          </text>
        )}
      </g>
    );
  };

  return (
    <>
      {renderDraft()}
      {renderMeasure()}
      {renderSelectionHandles()}
      {renderSnapIndicator()}
    </>
  );
};
