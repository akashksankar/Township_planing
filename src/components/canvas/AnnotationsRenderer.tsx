import React from 'react';
import { TextEntity, NorthArrowEntity, LayerConfig } from '../../types/project';

interface AnnotationsRendererProps {
  annotations: TextEntity[];
  northArrow?: NorthArrowEntity;
  layer?: LayerConfig;
  selectedId: string | null;
  onSelectAnnotation: (id: string) => void;
}

export const AnnotationsRenderer: React.FC<AnnotationsRendererProps> = ({
  annotations,
  northArrow,
  layer,
  selectedId,
  onSelectAnnotation
}) => {
  if (layer && !layer.visible) return null;

  return (
    <g id="layer-annotations" opacity={layer?.opacity ?? 1}>
      {/* 1. Text Annotations */}
      {annotations.map(ann => {
        const isSelected = selectedId === ann.id;
        const [x, y] = ann.position;

        return (
          <g
            key={ann.id}
            id={`annotation-${ann.id}`}
            className="cursor-pointer"
            transform={`translate(${x}, ${y}) rotate(${ann.rotation || 0})`}
            onClick={e => {
              e.stopPropagation();
              onSelectAnnotation(ann.id);
            }}
          >
            {/* Subtle selection highlight box behind text */}
            {isSelected && (
              <rect
                x="-12"
                y="-6"
                width="24"
                height="10"
                fill="#fee2e2"
                stroke="#e11d48"
                strokeWidth="0.5"
                rx="1"
                opacity={0.6}
              />
            )}

            <text
              x="0"
              y="0"
              fontSize={ann.fontSize || 10}
              fontFamily={ann.fontFamily || 'Helvetica, Arial, sans-serif'}
              fontWeight={ann.bold ? 'bold' : 'normal'}
              fontStyle={ann.italic ? 'italic' : 'normal'}
              textDecoration={ann.underline ? 'underline' : 'none'}
              textAnchor={ann.alignment || 'center'}
              fill={isSelected ? '#e11d48' : ann.color || '#1e293b'}
              stroke="#ffffff"
              strokeWidth={0.3}
              paintOrder="stroke"
            >
              {ann.text}
            </text>
          </g>
        );
      })}

      {/* 2. North Arrow Symbol */}
      {northArrow && northArrow.visible && (
        <g
          id="north-arrow"
          transform={`translate(${northArrow.position[0]}, ${northArrow.position[1]}) rotate(${northArrow.rotation}) scale(${northArrow.scale || 1})`}
          pointerEvents="none"
        >
          {/* Outer Compass Circle */}
          <circle r="6" fill="#ffffff" stroke="#0f172a" strokeWidth="0.8" opacity={0.9} />
          {/* North Pointing Black Needle */}
          <polygon points="0,-5.5 2,0 0,-1.5" fill="#0f172a" />
          {/* North Pointing White Needle Half */}
          <polygon points="0,-5.5 -2,0 0,-1.5" fill="#94a3b8" />
          {/* South Pointing Needle */}
          <polygon points="0,5.5 2,0 0,1.5" fill="#cbd5e1" />
          <polygon points="0,5.5 -2,0 0,1.5" fill="#e2e8f0" />
          {/* 'N' text */}
          <text
            x="0"
            y="-7.5"
            fontSize="3.8"
            fontFamily="sans-serif"
            fontWeight="bold"
            textAnchor="middle"
            fill="#0f172a"
          >
            N
          </text>
        </g>
      )}
    </g>
  );
};
