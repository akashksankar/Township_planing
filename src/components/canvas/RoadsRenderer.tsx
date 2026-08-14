import React from 'react';
import { RoadEntity, FootpathEntity, LayerConfig } from '../../types/project';
import { computeRoadCorridor } from '../../utils/geometry';

interface RoadsRendererProps {
  roads: RoadEntity[];
  footpaths?: FootpathEntity[];
  layer?: LayerConfig;
  selectedId: string | null;
  onSelectRoad: (id: string) => void;
}

export const RoadsRenderer: React.FC<RoadsRendererProps> = ({
  roads,
  footpaths = [],
  layer,
  selectedId,
  onSelectRoad
}) => {
  if (layer && !layer.visible) return null;

  return (
    <g id="layer-roads" opacity={layer?.opacity ?? 1}>
      {/* 1. Footpaths Base */}
      {footpaths.map(fp => {
        const pathData = fp.points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');
        return (
          <g key={fp.id} id={`footpath-${fp.id}`}>
            <path
              d={pathData}
              stroke="#e2e8f0"
              strokeWidth={fp.width}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d={pathData}
              stroke="#cbd5e1"
              strokeWidth={fp.width * 0.9}
              strokeDasharray="1 1"
              fill="none"
            />
          </g>
        );
      })}

      {/* 2. Road Corridors & Asphalt fills */}
      {roads.map(road => {
        const corridor = computeRoadCorridor(road.points, road.width);
        const isSelected = selectedId === road.id;
        const corridorPoints = corridor.map(p => `${p[0]},${p[1]}`).join(' ');
        const centerlineData = road.points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');

        let roadFill = '#334155'; // Main road slate
        if (road.roadType === 'secondary') roadFill = '#475569';
        if (road.roadType === 'local') roadFill = '#64748b';
        if (road.roadType === 'service') roadFill = '#94a3b8';
        if (road.roadType === 'pedestrian') roadFill = '#d1d5db';
        if (road.roadType === 'cycle') roadFill = '#0d9488';

        return (
          <g
            key={road.id}
            id={`road-${road.id}`}
            className="cursor-pointer transition-opacity"
            onClick={e => {
              e.stopPropagation();
              onSelectRoad(road.id);
            }}
          >
            {/* Road Corridor Surface */}
            {corridor.length > 0 && (
              <polygon
                points={corridorPoints}
                fill={roadFill}
                stroke={isSelected ? '#e11d48' : '#1e293b'}
                strokeWidth={isSelected ? 1.5 : 0.6}
                strokeLinejoin="round"
              />
            )}

            {/* Road Centerline */}
            <path
              d={centerlineData}
              stroke="#ffffff"
              strokeWidth={road.width > 8 ? 0.8 : 0.5}
              strokeDasharray={road.direction === 'bidirectional' ? '4 2' : 'none'}
              strokeLinecap="round"
              fill="none"
              opacity={0.9}
            />

            {/* Direction chevrons if one-way */}
            {road.direction === 'forward' && road.points.length >= 2 && (
              <path
                d={centerlineData}
                stroke="#facc15"
                strokeWidth="0.8"
                strokeDasharray="2 6"
                fill="none"
              />
            )}

            {/* Road Name Label */}
            {road.points.length >= 2 && (
              <text
                x={(road.points[0][0] + road.points[road.points.length - 1][0]) / 2}
                y={(road.points[0][1] + road.points[road.points.length - 1][1]) / 2 - road.width / 2 - 1.2}
                fontSize={Math.max(2.8, Math.min(4.2, road.width * 0.4))}
                fontFamily="sans-serif"
                fontWeight="bold"
                textAnchor="middle"
                fill={isSelected ? '#e11d48' : '#1e293b'}
                stroke="#ffffff"
                strokeWidth={0.5}
                paintOrder="stroke"
              >
                {road.name}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
};
