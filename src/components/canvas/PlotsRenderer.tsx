import React from 'react';
import { PlotEntity, LayerConfig } from '../../types/project';
import { calculatePolygonArea, calculateCentroid } from '../../utils/geometry';

interface PlotsRendererProps {
  plots: PlotEntity[];
  layer?: LayerConfig;
  selectedId: string | null;
  showLabels: boolean;
  onSelectPlot: (id: string) => void;
}

const LAND_USE_COLORS: Record<string, { fill: string; stroke: string; text: string }> = {
  residential: { fill: '#eff6ff', stroke: '#3b82f6', text: '#1d4ed8' }, // Soft technical sky/blue
  commercial: { fill: '#fef2f2', stroke: '#ef4444', text: '#b91c1c' }, // Soft rose/red
  mixed_use: { fill: '#faf5ff', stroke: '#a855f7', text: '#7e22ce' }, // Soft purple
  public: { fill: '#f0fdf4', stroke: '#22c55e', text: '#15803d' }, // Soft emerald
  institutional: { fill: '#fdf4ff', stroke: '#d946ef', text: '#a21caf' }, // Fuchsia
  open_space: { fill: '#ecfdf5', stroke: '#10b981', text: '#047857' }, // Mint
  industrial: { fill: '#f8fafc', stroke: '#64748b', text: '#334155' } // Slate
};

export const PlotsRenderer: React.FC<PlotsRendererProps> = ({
  plots,
  layer,
  selectedId,
  showLabels,
  onSelectPlot
}) => {
  if (layer && !layer.visible) return null;

  return (
    <g id="layer-plots" opacity={layer?.opacity ?? 1}>
      {plots.map(plot => {
        const isSelected = selectedId === plot.id;
        const color = LAND_USE_COLORS[plot.landUse] || LAND_USE_COLORS.residential;
        const pointsString = plot.polygon.map(p => `${p[0]},${p[1]}`).join(' ');
        const centroid = calculateCentroid(plot.polygon);
        const area = calculatePolygonArea(plot.polygon);

        return (
          <g
            key={plot.id}
            id={`plot-${plot.id}`}
            className="cursor-pointer transition-opacity"
            onClick={e => {
              e.stopPropagation();
              onSelectPlot(plot.id);
            }}
          >
            {/* Plot Polygon Boundary */}
            <polygon
              points={pointsString}
              fill={isSelected ? '#dbeafe' : color.fill}
              stroke={isSelected ? '#e11d48' : color.stroke}
              strokeWidth={isSelected ? 1.4 : 0.6}
              strokeDasharray={isSelected ? 'none' : '3 1.5'}
              strokeLinejoin="round"
            />

            {/* Plot Information Label */}
            {showLabels && (
              <g transform={`translate(${centroid[0]}, ${centroid[1]})`} pointerEvents="none">
                {/* Plot Number Badge */}
                <rect
                  x="-6"
                  y="-5"
                  width="12"
                  height="4.5"
                  rx="1"
                  fill="#ffffff"
                  stroke={color.stroke}
                  strokeWidth="0.4"
                  opacity={0.95}
                />
                <text
                  x="0"
                  y="-2"
                  fontSize="2.8"
                  fontFamily="sans-serif"
                  fontWeight="bold"
                  textAnchor="middle"
                  fill={color.text}
                >
                  {plot.number}
                </text>

                {/* Land Use Tag */}
                <text
                  x="0"
                  y="1.8"
                  fontSize="2.2"
                  fontFamily="sans-serif"
                  textAnchor="middle"
                  fill="#475569"
                >
                  {plot.landUse.charAt(0).toUpperCase() + plot.landUse.slice(1).replace('_', ' ')}
                </text>

                {/* Area Tag */}
                <text
                  x="0"
                  y="4.5"
                  fontSize="2.1"
                  fontFamily="monospace"
                  textAnchor="middle"
                  fill="#64748b"
                >
                  {Math.round(area)} m²
                </text>
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
};
