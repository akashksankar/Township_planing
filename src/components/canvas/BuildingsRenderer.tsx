import React from 'react';
import { BuildingEntity, LayerConfig } from '../../types/project';
import { getOrientedRectCorners } from '../../utils/geometry';

interface BuildingsRendererProps {
  buildings: BuildingEntity[];
  layer?: LayerConfig;
  selectedId: string | null;
  onSelectBuilding: (id: string) => void;
}

export const BuildingsRenderer: React.FC<BuildingsRendererProps> = ({
  buildings,
  layer,
  selectedId,
  onSelectBuilding
}) => {
  if (layer && !layer.visible) return null;

  return (
    <g id="layer-buildings" opacity={layer?.opacity ?? 1}>
      {buildings.map(bld => {
        const isSelected = selectedId === bld.id;
        const corners = getOrientedRectCorners(bld.position, bld.width, bld.depth, bld.rotation);
        const pointsString = corners.map(p => `${p[0]},${p[1]}`).join(' ');
        const centerX = bld.position.x + bld.width / 2;
        const centerY = bld.position.y + bld.depth / 2;

        return (
          <g
            key={bld.id}
            id={`building-${bld.id}`}
            className="cursor-pointer"
            onClick={e => {
              e.stopPropagation();
              onSelectBuilding(bld.id);
            }}
          >
            {/* Building Footprint Fill */}
            <polygon
              points={pointsString}
              fill={isSelected ? '#fee2e2' : '#f1f5f9'}
              stroke={isSelected ? '#e11d48' : '#0f172a'}
              strokeWidth={isSelected ? 1.4 : 0.9}
              strokeLinejoin="miter"
            />

            {/* Inner Wall Architectural Hatch / Offset Border */}
            <polygon
              points={pointsString}
              fill="none"
              stroke="#94a3b8"
              strokeWidth={0.3}
              strokeDasharray="1 1"
              transform={`scale(0.92) translate(${centerX * 0.08}, ${centerY * 0.08})`}
            />

            {/* Entrance Marker Arrow (Front entrance) */}
            <g
              transform={`translate(${centerX}, ${centerY}) rotate(${bld.rotation}) translate(${-centerX}, ${-centerY})`}
            >
              {/* Entrance Triangle on south edge */}
              <polygon
                points={`${centerX - 1.5},${bld.position.y + bld.depth} ${centerX + 1.5},${bld.position.y + bld.depth} ${centerX},${bld.position.y + bld.depth - 2}`}
                fill="#e11d48"
                opacity={0.8}
              />
            </g>

            {/* Building Label & Dimensions */}
            <g transform={`translate(${centerX}, ${centerY})`} pointerEvents="none">
              <text
                x="0"
                y="-1"
                fontSize={Math.max(2.4, Math.min(3.6, bld.width * 0.2))}
                fontFamily="sans-serif"
                fontWeight="bold"
                textAnchor="middle"
                fill="#0f172a"
              >
                {bld.name || bld.buildingType.toUpperCase()}
              </text>
              <text
                x="0"
                y="2.5"
                fontSize="2.0"
                fontFamily="monospace"
                textAnchor="middle"
                fill="#64748b"
              >
                {bld.width}m × {bld.depth}m {bld.floors && bld.floors > 1 ? `(${bld.floors}F)` : ''}
              </text>
            </g>

            {/* Setback Visual Guide (when selected or showSetback enabled) */}
            {(isSelected || bld.showSetback) && bld.setbacks && (
              <g pointerEvents="none">
                <rect
                  x={bld.position.x - bld.setbacks.left}
                  y={bld.position.y - bld.setbacks.rear}
                  width={bld.width + bld.setbacks.left + bld.setbacks.right}
                  height={bld.depth + bld.setbacks.rear + bld.setbacks.front}
                  fill="none"
                  stroke="#e11d48"
                  strokeWidth="0.5"
                  strokeDasharray="2 1.5"
                  opacity={0.8}
                />
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
};
