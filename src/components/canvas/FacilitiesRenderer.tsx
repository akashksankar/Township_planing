import React from 'react';
import { FacilityEntity, LayerConfig } from '../../types/project';
import { getOrientedRectCorners } from '../../utils/geometry';

interface FacilitiesRendererProps {
  facilities: FacilityEntity[];
  layer?: LayerConfig;
  selectedId: string | null;
  onSelectFacility: (id: string) => void;
}

const FACILITY_ICONS: Record<string, string> = {
  school: '🏫 SCHOOL',
  hospital: '🏥 HOSPITAL',
  community_center: '🏛️ CIVIC HALL',
  fire_station: '🚒 FIRE STATION',
  police_station: '👮 POLICE',
  religious_facility: '⛪ SANCTUARY',
  market: '🏪 MARKET',
  office: '🏢 CIVIC OFFICE'
};

export const FacilitiesRenderer: React.FC<FacilitiesRendererProps> = ({
  facilities,
  layer,
  selectedId,
  onSelectFacility
}) => {
  if (layer && !layer.visible) return null;

  return (
    <g id="layer-facilities" opacity={layer?.opacity ?? 1}>
      {facilities.map(fac => {
        const isSelected = selectedId === fac.id;
        const corners = getOrientedRectCorners(fac.position, fac.width, fac.depth, fac.rotation);
        const pointsString = corners.map(p => `${p[0]},${p[1]}`).join(' ');
        const centerX = fac.position.x + fac.width / 2;
        const centerY = fac.position.y + fac.depth / 2;

        return (
          <g
            key={fac.id}
            id={`facility-${fac.id}`}
            className="cursor-pointer"
            onClick={e => {
              e.stopPropagation();
              onSelectFacility(fac.id);
            }}
          >
            {/* Facility Footprint */}
            <polygon
              points={pointsString}
              fill={isSelected ? '#f3e8ff' : '#faf5ff'}
              stroke={isSelected ? '#e11d48' : '#7e22ce'}
              strokeWidth={isSelected ? 1.5 : 1.0}
              strokeLinejoin="round"
            />

            {/* Architectural Border Trim */}
            <polygon
              points={pointsString}
              fill="none"
              stroke="#c084fc"
              strokeWidth={0.4}
              strokeDasharray="2 1"
            />

            {/* Label and Badge */}
            <g transform={`translate(${centerX}, ${centerY})`} pointerEvents="none">
              <text
                x="0"
                y="-2"
                fontSize={Math.max(2.4, Math.min(3.6, fac.width * 0.18))}
                fontFamily="sans-serif"
                fontWeight="bold"
                textAnchor="middle"
                fill="#581c87"
              >
                {fac.name}
              </text>
              <text
                x="0"
                y="2.5"
                fontSize="2.2"
                fontFamily="monospace"
                textAnchor="middle"
                fill="#7e22ce"
              >
                {FACILITY_ICONS[fac.facilityType] || 'FACILITY'}
              </text>
              <text
                x="0"
                y="5.5"
                fontSize="1.9"
                fontFamily="monospace"
                textAnchor="middle"
                fill="#9333ea"
              >
                {fac.width}m × {fac.depth}m
              </text>
            </g>
          </g>
        );
      })}
    </g>
  );
};
