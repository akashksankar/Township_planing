import React from 'react';
import { useProjectStore } from '../store/projectStore';
import { Eye, EyeOff, Lock, Unlock, X } from 'lucide-react';

interface LayersPanelProps {
  onClose: () => void;
}

export const LayersPanel: React.FC<LayersPanelProps> = ({ onClose }) => {
  const { project, setLayerVisibility, setLayerLocked, setLayerOpacity } = useProjectStore();

  return (
    <div className="w-80 bg-[#141414] border-l border-[#2A2A2A] p-4 flex flex-col shrink-0 overflow-y-auto select-none shadow-2xl z-40 text-[#E5E5E5]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3 mb-3">
        <div>
          <h3 className="text-xs font-bold text-[#E5E5E5] uppercase tracking-widest">Project Layers</h3>
          <span className="text-[11px] text-[#888888] font-mono">Manage Layer Visibility & Opacity</span>
        </div>
        <button onClick={onClose} className="text-[#777777] hover:text-[#FF4D00] p-1 rounded transition-colors" title="Close">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Layer List */}
      <div className="space-y-2 flex-1 overflow-y-auto pr-1">
        {project.layers.map(layer => (
          <div
            key={layer.id}
            className="p-2.5 bg-[#1A1A1A] hover:bg-[#202020] rounded-md border border-[#2A2A2A] transition-colors space-y-1.5"
          >
            <div className="flex items-center justify-between">
              {/* Layer color indicator & name */}
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-xs" style={{ backgroundColor: layer.color }} />
                <span className={`text-xs font-semibold ${layer.visible ? 'text-[#E5E5E5]' : 'text-[#666666] line-through'}`}>
                  {layer.name}
                </span>
              </div>

              {/* Toggles (Visibility & Lock) */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setLayerVisibility(layer.id, !layer.visible)}
                  className={`p-1 rounded transition-colors ${layer.visible ? 'text-[#CCCCCC] hover:bg-[#2A2A2A] hover:text-[#FF4D00]' : 'text-[#555555] hover:bg-[#2A2A2A]'}`}
                  title={layer.visible ? 'Hide Layer' : 'Show Layer'}
                >
                  {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-[#555555]" />}
                </button>

                <button
                  onClick={() => setLayerLocked(layer.id, !layer.locked)}
                  className={`p-1 rounded transition-colors ${layer.locked ? 'text-[#FF4D00] bg-[#2A1810]' : 'text-[#555555] hover:bg-[#2A2A2A] hover:text-[#CCCCCC]'}`}
                  title={layer.locked ? 'Unlock Layer' : 'Lock Layer'}
                >
                  {layer.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Opacity slider */}
            <div className="flex items-center gap-2 pt-0.5">
              <span className="text-[10px] text-[#777777] w-12 font-mono uppercase">Opacity:</span>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={layer.opacity}
                onChange={e => setLayerOpacity(layer.id, Number(e.target.value))}
                className="flex-1 accent-[#FF4D00] h-1 bg-[#2A2A2A] rounded appearance-none cursor-pointer"
              />
              <span className="text-[10px] font-mono text-[#888888] w-8 text-right">
                {Math.round(layer.opacity * 100)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
