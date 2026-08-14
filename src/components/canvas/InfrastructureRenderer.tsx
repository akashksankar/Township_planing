import React from 'react';
import { InfrastructureEntity, LayerConfig } from '../../types/project';

interface InfrastructureRendererProps {
  infrastructure: InfrastructureEntity[];
  layers: LayerConfig[];
  selectedId: string | null;
  onSelectInfrastructure: (id: string) => void;
}

export const InfrastructureRenderer: React.FC<InfrastructureRendererProps> = ({
  infrastructure,
  layers,
  selectedId,
  onSelectInfrastructure
}) => {
  const waterLayer = layers.find(l => l.id === 'WATER');
  const drainLayer = layers.find(l => l.id === 'DRAINAGE');

  return (
    <g id="layer-infrastructure">
      {infrastructure.map(inf => {
        const isWater = inf.infraType.startsWith('water_');
        const activeLayer = isWater ? waterLayer : drainLayer;
        if (activeLayer && !activeLayer.visible) return null;

        const isSelected = selectedId === inf.id;
        const color = isWater ? '#0284c7' : '#7c3aed';

        return (
          <g
            key={inf.id}
            id={`infra-${inf.id}`}
            className="cursor-pointer"
            opacity={activeLayer?.opacity ?? 1}
            onClick={e => {
              e.stopPropagation();
              onSelectInfrastructure(inf.id);
            }}
          >
            {/* 1. Polyline Pipe or Drain */}
            {inf.points && inf.points.length >= 2 && (
              <g>
                <path
                  d={inf.points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ')}
                  stroke={isSelected ? '#e11d48' : color}
                  strokeWidth={isSelected ? 1.6 : 1.0}
                  strokeDasharray={isWater ? '4 1' : '3 1.5'}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Flow indicator chevrons */}
                {inf.flowDirection && inf.points.length >= 2 && (
                  <path
                    d={inf.points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ')}
                    stroke="#f59e0b"
                    strokeWidth="0.8"
                    strokeDasharray="1 8"
                    fill="none"
                  />
                )}
              </g>
            )}

            {/* 2. Water Tank */}
            {inf.infraType === 'water_tank' && inf.position && (
              <g transform={`translate(${inf.position.x}, ${inf.position.y})`}>
                <circle
                  r={inf.diameter ? inf.diameter / 2 : 4}
                  fill={isSelected ? '#bae6fd' : '#e0f2fe'}
                  stroke={isSelected ? '#e11d48' : '#0284c7'}
                  strokeWidth={isSelected ? 1.4 : 0.8}
                />
                <circle r={(inf.diameter ? inf.diameter / 2 : 4) * 0.7} fill="none" stroke="#0284c7" strokeWidth="0.4" />
                <text y="1" fontSize="2.0" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle" fill="#0369a1">
                  TANK
                </text>
              </g>
            )}

            {/* 3. Manhole Symbol */}
            {inf.infraType === 'manhole' && inf.position && (
              <g transform={`translate(${inf.position.x}, ${inf.position.y})`}>
                <circle
                  r={inf.diameter ? inf.diameter / 2 : 1}
                  fill={isSelected ? '#ddd6fe' : '#ede9fe'}
                  stroke={isSelected ? '#e11d48' : '#7c3aed'}
                  strokeWidth={isSelected ? 1.0 : 0.6}
                />
                <line x1="-0.7" y1="0" x2="0.7" y2="0" stroke="#7c3aed" strokeWidth="0.3" />
                <line x1="0" y1="-0.7" x2="0" y2="0.7" stroke="#7c3aed" strokeWidth="0.3" />
              </g>
            )}

            {/* 4. Valve or Pump */}
            {(inf.infraType === 'water_valve' || inf.infraType === 'water_pump') && inf.position && (
              <g transform={`translate(${inf.position.x}, ${inf.position.y})`}>
                <polygon points="-1.5,-1.5 1.5,1.5 1.5,-1.5 -1.5,1.5" fill={color} stroke="#0f172a" strokeWidth="0.3" />
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
};
