import React from 'react';
import { ParkingEntity, LayerConfig } from '../../types/project';
import { calculatePolygonArea, calculateCentroid, generateParkingBays } from '../../utils/geometry';

interface ParkingRendererProps {
  parking: ParkingEntity[];
  layer?: LayerConfig;
  selectedId: string | null;
  onSelectParking: (id: string) => void;
}

export const ParkingRenderer: React.FC<ParkingRendererProps> = ({
  parking,
  layer,
  selectedId,
  onSelectParking
}) => {
  if (layer && !layer.visible) return null;

  return (
    <g id="layer-parking" opacity={layer?.opacity ?? 1}>
      {parking.map(prk => {
        const isSelected = selectedId === prk.id;
        const pointsString = prk.polygon.map(p => `${p[0]},${p[1]}`).join(' ');
        const centroid = calculateCentroid(prk.polygon);
        const area = calculatePolygonArea(prk.polygon);
        const { bays, count } = generateParkingBays(prk.polygon);
        const totalBays = prk.capacity || count;

        return (
          <g
            key={prk.id}
            id={`parking-${prk.id}`}
            className="cursor-pointer"
            onClick={e => {
              e.stopPropagation();
              onSelectParking(prk.id);
            }}
          >
            {/* Parking Lot Surface */}
            <polygon
              points={pointsString}
              fill={isSelected ? '#fef3c7' : '#f8fafc'}
              stroke={isSelected ? '#e11d48' : '#d97706'}
              strokeWidth={isSelected ? 1.4 : 0.8}
              strokeLinejoin="round"
            />

            {/* Auto-rendered Parking Stall Bay Lines */}
            {bays.map((bay, idx) => (
              <line
                key={`bay-${idx}`}
                x1={bay.p1[0]}
                y1={bay.p1[1]}
                x2={bay.p2[0]}
                y2={bay.p2[1]}
                stroke="#d97706"
                strokeWidth="0.4"
                strokeDasharray="2 0.5"
                opacity={0.8}
              />
            ))}

            {/* Parking Label & Bay Count */}
            <g transform={`translate(${centroid[0]}, ${centroid[1]})`} pointerEvents="none">
              <rect
                x="-8"
                y="-4.5"
                width="16"
                height="9"
                rx="1"
                fill="#ffffff"
                stroke="#d97706"
                strokeWidth="0.4"
                opacity={0.9}
              />
              <text
                x="0"
                y="-1"
                fontSize="2.6"
                fontFamily="sans-serif"
                fontWeight="bold"
                textAnchor="middle"
                fill="#b45309"
              >
                🅿️ {prk.name}
              </text>
              <text
                x="0"
                y="2.8"
                fontSize="2.2"
                fontFamily="monospace"
                textAnchor="middle"
                fill="#78350f"
              >
                {totalBays} Spaces ({Math.round(area)} m²)
              </text>
            </g>
          </g>
        );
      })}
    </g>
  );
};
