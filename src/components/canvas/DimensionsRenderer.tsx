import React from 'react';
import { DimensionEntity, LayerConfig } from '../../types/project';
import { distance } from '../../utils/geometry';

interface DimensionsRendererProps {
  dimensions: DimensionEntity[];
  layer?: LayerConfig;
  selectedId: string | null;
  onSelectDimension: (id: string) => void;
}

export const DimensionsRenderer: React.FC<DimensionsRendererProps> = ({
  dimensions,
  layer,
  selectedId,
  onSelectDimension
}) => {
  if (layer && !layer.visible) return null;

  return (
    <g id="layer-dimensions" opacity={layer?.opacity ?? 1}>
      {dimensions.map(dim => {
        const isSelected = selectedId === dim.id;
        const [x1, y1] = dim.startPoint;
        const [x2, y2] = dim.endPoint;
        const dist = distance(dim.startPoint, dim.endPoint);
        const labelText = dim.customLabel || `${dist.toFixed(2)} m`;

        // Calculate perpendicular offset
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len;
        const ny = dx / len;

        const offset = dim.offset || 4;
        const ox1 = x1 + nx * offset;
        const oy1 = y1 + ny * offset;
        const ox2 = x2 + nx * offset;
        const oy2 = y2 + ny * offset;

        const midX = (ox1 + ox2) / 2;
        const midY = (oy1 + oy2) / 2;
        const angle = (Math.atan2(oy2 - oy1, ox2 - ox1) * 180) / Math.PI;
        // Keep text readable (not upside down)
        const adjustedAngle = angle > 90 || angle < -90 ? angle + 180 : angle;

        return (
          <g
            key={dim.id}
            id={`dimension-${dim.id}`}
            className="cursor-pointer"
            onClick={e => {
              e.stopPropagation();
              onSelectDimension(dim.id);
            }}
          >
            {/* Extension Lines from geometry to dimension line */}
            <line
              x1={x1}
              y1={y1}
              x2={ox1 + nx * (offset > 0 ? 1 : -1)}
              y2={oy1 + ny * (offset > 0 ? 1 : -1)}
              stroke={isSelected ? '#e11d48' : '#94a3b8'}
              strokeWidth="0.4"
            />
            <line
              x1={x2}
              y1={y2}
              x2={ox2 + nx * (offset > 0 ? 1 : -1)}
              y2={oy2 + ny * (offset > 0 ? 1 : -1)}
              stroke={isSelected ? '#e11d48' : '#94a3b8'}
              strokeWidth="0.4"
            />

            {/* Main Dimension Line */}
            <line
              x1={ox1}
              y1={oy1}
              x2={ox2}
              y2={oy2}
              stroke={isSelected ? '#e11d48' : '#be123c'}
              strokeWidth={isSelected ? 1.0 : 0.6}
            />

            {/* Technical Arrow/Tick Endpoints */}
            <circle cx={ox1} cy={oy1} r="0.6" fill={isSelected ? '#e11d48' : '#be123c'} />
            <circle cx={ox2} cy={oy2} r="0.6" fill={isSelected ? '#e11d48' : '#be123c'} />

            {/* Dimension Text Label */}
            <g transform={`translate(${midX}, ${midY}) rotate(${adjustedAngle})`}>
              <rect
                x="-8"
                y="-3.5"
                width="16"
                height="4.5"
                rx="0.8"
                fill="#ffffff"
                stroke={isSelected ? '#e11d48' : '#cbd5e1'}
                strokeWidth="0.3"
                opacity={0.95}
              />
              <text
                x="0"
                y="-0.5"
                fontSize="2.4"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
                fill={isSelected ? '#e11d48' : '#9f1239'}
              >
                {labelText}
              </text>
            </g>
          </g>
        );
      })}
    </g>
  );
};
