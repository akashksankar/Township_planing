import React from 'react';
import { ParkEntity, TreeEntity, StreetLightEntity, LayerConfig } from '../../types/project';
import { calculatePolygonArea, calculateCentroid } from '../../utils/geometry';

interface LandscapeRendererProps {
  parks: ParkEntity[];
  trees?: TreeEntity[];
  streetLights?: StreetLightEntity[];
  layer?: LayerConfig;
  selectedId: string | null;
  onSelectEntity: (id: string, type: string) => void;
}

export const LandscapeRenderer: React.FC<LandscapeRendererProps> = ({
  parks,
  trees = [],
  streetLights = [],
  layer,
  selectedId,
  onSelectEntity
}) => {
  if (layer && !layer.visible) return null;

  return (
    <g id="layer-landscape" opacity={layer?.opacity ?? 1}>
      {/* 1. Parks & Open Space Polygons */}
      {parks.map(park => {
        const isSelected = selectedId === park.id;
        const pointsString = park.polygon.map(p => `${p[0]},${p[1]}`).join(' ');
        const centroid = calculateCentroid(park.polygon);
        const area = calculatePolygonArea(park.polygon);

        return (
          <g
            key={park.id}
            id={`park-${park.id}`}
            className="cursor-pointer"
            onClick={e => {
              e.stopPropagation();
              onSelectEntity(park.id, 'park');
            }}
          >
            {/* Park Fill (Lush architectural soft green) */}
            <polygon
              points={pointsString}
              fill={isSelected ? '#bbf7d0' : '#dcfce7'}
              stroke={isSelected ? '#e11d48' : '#16a34a'}
              strokeWidth={isSelected ? 1.4 : 0.8}
              strokeLinejoin="round"
            />

            {/* Subtle inner greenery contour */}
            <polygon
              points={pointsString}
              fill="none"
              stroke="#86efac"
              strokeWidth={0.4}
              strokeDasharray="4 2"
            />

            {/* Park Label */}
            <g transform={`translate(${centroid[0]}, ${centroid[1]})`} pointerEvents="none">
              <text
                x="0"
                y="-1"
                fontSize="3.2"
                fontFamily="sans-serif"
                fontWeight="bold"
                textAnchor="middle"
                fill="#15803d"
              >
                {park.name}
              </text>
              <text
                x="0"
                y="3"
                fontSize="2.4"
                fontFamily="monospace"
                textAnchor="middle"
                fill="#166534"
              >
                {Math.round(area)} m²
              </text>
            </g>
          </g>
        );
      })}

      {/* 2. Trees (Architectural 2D Canopy circles + trunk) */}
      {trees.map(tree => {
        const isSelected = selectedId === tree.id;
        const radius = tree.diameter / 2;
        const { x, y } = tree.position;

        return (
          <g
            key={tree.id}
            id={`tree-${tree.id}`}
            className="cursor-pointer"
            transform={`translate(${x}, ${y})`}
            onClick={e => {
              e.stopPropagation();
              onSelectEntity(tree.id, 'tree');
            }}
          >
            {/* Outer Canopy Shadow/Base */}
            <circle
              r={radius}
              fill={isSelected ? '#fed7aa' : '#86efac'}
              fillOpacity={0.6}
              stroke={isSelected ? '#e11d48' : '#15803d'}
              strokeWidth={isSelected ? 1.2 : 0.6}
            />

            {/* Inner Canopy Scallops/Ring */}
            <circle
              r={radius * 0.7}
              fill="none"
              stroke="#16a34a"
              strokeWidth={0.4}
              strokeDasharray="2 1"
            />

            {/* Center Trunk Dot */}
            <circle r="0.6" fill="#78350f" />
            <line x1="-0.8" y1="0" x2="0.8" y2="0" stroke="#78350f" strokeWidth="0.3" />
            <line x1="0" y1="-0.8" x2="0" y2="0.8" stroke="#78350f" strokeWidth="0.3" />
          </g>
        );
      })}

      {/* 3. Street Lights */}
      {streetLights.map(light => {
        const isSelected = selectedId === light.id;
        const { x, y } = light.position;

        return (
          <g
            key={light.id}
            id={`street-light-${light.id}`}
            className="cursor-pointer"
            transform={`translate(${x}, ${y})`}
            onClick={e => {
              e.stopPropagation();
              onSelectEntity(light.id, 'street_light');
            }}
          >
            {/* Light Cone / Illumination Glow */}
            <circle r="2.2" fill="#fef08a" opacity={0.35} />
            {/* Pole Base */}
            <circle
              r="0.8"
              fill={isSelected ? '#e11d48' : '#0f172a'}
              stroke="#ffffff"
              strokeWidth="0.3"
            />
            {/* Lamp Arm & Fixture */}
            <line x1="0" y1="0" x2="1.2" y2="0" stroke="#0f172a" strokeWidth="0.5" />
            <circle r="0.4" cx="1.2" cy="0" fill="#f59e0b" />
          </g>
        );
      })}
    </g>
  );
};
