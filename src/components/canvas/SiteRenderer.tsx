import React from 'react';
import { SiteEntity, LayerConfig } from '../../types/project';
import { calculatePolygonArea } from '../../utils/geometry';

interface SiteRendererProps {
  site: SiteEntity;
  layer?: LayerConfig;
  isSelected?: boolean;
}

export const SiteRenderer: React.FC<SiteRendererProps> = ({ site, layer, isSelected }) => {
  if (layer && !layer.visible) return null;
  if (!site.boundary || site.boundary.length < 3) return null;

  const pointsString = site.boundary.map(p => `${p[0]},${p[1]}`).join(' ');
  const area = calculatePolygonArea(site.boundary);

  return (
    <g id="layer-site" opacity={layer?.opacity ?? 1}>
      {/* Site Ground Base */}
      <polygon
        id="site-polygon-base"
        points={pointsString}
        fill="#16181B"
        stroke="#2E343D"
        strokeWidth={1.2}
        strokeLinejoin="round"
      />

      {/* Subtle Technical Site Boundary Dash */}
      <polygon
        id="site-polygon-dash"
        points={pointsString}
        fill="none"
        stroke={isSelected ? '#FF4D00' : '#3E4652'}
        strokeWidth={isSelected ? 1.8 : 0.8}
        strokeDasharray="6 3"
      />

      {/* Boundary Corner Markers */}
      {site.boundary.map(([x, y], idx) => (
        <g key={`site-corner-${idx}`} transform={`translate(${x}, ${y})`}>
          <line x1="-2" y1="0" x2="2" y2="0" stroke="#FF4D00" strokeWidth="0.6" />
          <line x1="0" y1="-2" x2="0" y2="2" stroke="#FF4D00" strokeWidth="0.6" />
          <circle r="0.8" fill="#FF4D00" />
        </g>
      ))}

      {/* Site Name & Area watermark tag */}
      {site.boundary.length > 0 && (
        <text
          x={site.boundary[0][0] + 6}
          y={site.boundary[0][1] + 10}
          fontSize="4"
          fontFamily="monospace"
          fontWeight="600"
          fill="#5A6472"
          letterSpacing="1"
        >
          {site.name.toUpperCase()} — {area.toLocaleString(undefined, { maximumFractionDigits: 0 })} m²
        </text>
      )}
    </g>
  );
};
