import React, { useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import {
  FolderOpen,
  PlusCircle,
  Undo2,
  Redo2,
  Trash2,
  Copy,
  BarChart3,
  Download,
  FileCode,
  Sparkles,
  Layers,
  HelpCircle
} from 'lucide-react';

interface HeaderProps {
  onOpenSummary: () => void;
  onOpenImportExport: () => void;
  onOpenExport: () => void;
  onToggleLayers: () => void;
  showLayers: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSummary,
  onOpenImportExport,
  onOpenExport,
  onToggleLayers,
  showLayers
}) => {
  const {
    project,
    updateProjectMetadata,
    loadSampleProject,
    createNewProject,
    undo,
    redo,
    past,
    future,
    selectedId,
    deleteSelected,
    duplicateSelected,
    autoArrangeSite
  } = useProjectStore();

  const [isEditingName, setIsEditingName] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  return (
    <header className="h-14 bg-[#0F0F0F] border-b border-[#2A2A2A] px-4 flex items-center justify-between shrink-0 shadow-xs z-30 text-[#E5E5E5]">
      {/* Brand & Project Name */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-[#FF4D00] flex items-center justify-center text-black font-black text-xs tracking-tighter shadow-xs">
            TP
          </div>
          <div>
            <h1 className="text-xs font-bold tracking-widest uppercase text-[#E5E5E5] leading-none">
              Township <span className="text-[#FF4D00]">Studio</span>
            </h1>
            <span className="text-[10px] text-[#888888] font-mono tracking-wider">2D CONCEPTUAL PLANNING</span>
          </div>
        </div>

        <div className="h-5 w-px bg-[#2A2A2A] mx-1 hidden sm:block" />

        {/* Editable Project Name */}
        <div className="hidden sm:flex items-center">
          {isEditingName ? (
            <input
              type="text"
              defaultValue={project.project.name}
              onBlur={e => {
                updateProjectMetadata({ name: e.target.value.trim() || 'Township Plan' });
                setIsEditingName(false);
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  updateProjectMetadata({ name: e.currentTarget.value.trim() || 'Township Plan' });
                  setIsEditingName(false);
                }
              }}
              autoFocus
              className="px-2 py-0.5 border border-[#FF4D00] bg-[#1A1A1A] rounded text-xs font-semibold text-[#E5E5E5] outline-hidden"
            />
          ) : (
            <button
              onClick={() => setIsEditingName(true)}
              className="text-xs font-semibold text-[#CCCCCC] hover:text-[#FF4D00] hover:bg-[#1A1A1A] px-2 py-1 rounded transition-colors flex items-center gap-1.5 border border-transparent hover:border-[#2A2A2A]"
              title="Click to rename project"
            >
              <span>{project.project.name}</span>
              <span className="text-[10px] text-[#777777] font-normal">✎</span>
            </button>
          )}
        </div>
      </div>

      {/* Center Quick Actions */}
      <div className="flex items-center gap-1">
        <button
          id="btn-new-project"
          onClick={() => {
            if (window.confirm('Create new empty township project?')) {
              createNewProject();
            }
          }}
          className="p-1.5 rounded-md text-[#AAAAAA] hover:text-[#E5E5E5] hover:bg-[#1A1A1A] transition-colors"
          title="New Project"
        >
          <PlusCircle className="w-4 h-4" />
        </button>

        <button
          id="btn-sample-project"
          onClick={() => {
            if (window.confirm('Load Green Valley Township sample project?')) {
              loadSampleProject();
            }
          }}
          className="p-1.5 rounded-md text-[#AAAAAA] hover:text-[#E5E5E5] hover:bg-[#1A1A1A] transition-colors"
          title="Load Green Valley Sample"
        >
          <FolderOpen className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-[#2A2A2A] mx-1" />

        {/* Undo / Redo */}
        <button
          id="btn-undo"
          onClick={undo}
          disabled={past.length === 0}
          className="p-1.5 rounded-md text-[#AAAAAA] hover:text-[#E5E5E5] hover:bg-[#1A1A1A] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>

        <button
          id="btn-redo"
          onClick={redo}
          disabled={future.length === 0}
          className="p-1.5 rounded-md text-[#AAAAAA] hover:text-[#E5E5E5] hover:bg-[#1A1A1A] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-[#2A2A2A] mx-1" />

        {/* Selection Tools (Duplicate / Delete) */}
        <button
          id="btn-duplicate"
          onClick={duplicateSelected}
          disabled={!selectedId}
          className="p-1.5 rounded-md text-[#AAAAAA] hover:text-[#E5E5E5] hover:bg-[#1A1A1A] disabled:opacity-30 transition-colors"
          title="Duplicate Selected (Ctrl+D)"
        >
          <Copy className="w-4 h-4" />
        </button>

        <button
          id="btn-delete"
          onClick={deleteSelected}
          disabled={!selectedId}
          className="p-1.5 rounded-md text-[#FF5544] hover:text-[#FF3322] hover:bg-[#2A1515] disabled:opacity-30 transition-colors"
          title="Delete Selected (Delete key)"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <button
          id="btn-auto-arrange"
          onClick={autoArrangeSite}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#CCCCCC] bg-[#141414] hover:bg-[#1E1E1E] border border-[#2A2A2A] rounded-md transition-colors"
          title="Align buildings cleanly inside assigned plots"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#FF4D00]" />
          <span>Auto Arrange</span>
        </button>
      </div>

      {/* Right Primary Actions */}
      <div className="flex items-center gap-2">
        {/* Toggle Layers button */}
        <button
          id="btn-toggle-layers"
          onClick={onToggleLayers}
          className={`p-1.5 rounded-md transition-colors border ${showLayers ? 'bg-[#2A160A] text-[#FF4D00] border-[#FF4D00]/50' : 'text-[#AAAAAA] hover:text-[#E5E5E5] bg-[#141414] hover:bg-[#1E1E1E] border-[#2A2A2A]'}`}
          title="Manage Layers"
        >
          <Layers className="w-4 h-4" />
        </button>

        {/* Project Summary Modal Button */}
        <button
          id="btn-open-summary"
          onClick={onOpenSummary}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#CCCCCC] bg-[#141414] border border-[#2A2A2A] hover:bg-[#1E1E1E] hover:text-white rounded-md shadow-2xs transition-colors"
          title="View Township Statistics & Land-use metrics"
        >
          <BarChart3 className="w-3.5 h-3.5 text-[#FF4D00]" />
          <span>Metrics</span>
        </button>

        {/* JSON Import / Export Button */}
        <button
          id="btn-json-sync"
          onClick={onOpenImportExport}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#CCCCCC] bg-[#141414] border border-[#2A2A2A] hover:bg-[#1E1E1E] hover:text-white rounded-md shadow-2xs transition-colors"
          title="Import / Export Project JSON"
        >
          <FileCode className="w-3.5 h-3.5 text-[#AAAAAA]" />
          <span className="hidden md:inline">JSON</span>
        </button>

        {/* Primary Export Button */}
        <button
          id="btn-export-plan"
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-black bg-[#FF4D00] hover:bg-[#FF601C] rounded-md shadow-xs transition-colors tracking-wide"
          title="Export A4 PDF, SVG or PNG"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Plan</span>
        </button>

        {/* Help Toggle */}
        <button
          onClick={() => setShowHelp(prev => !prev)}
          className="p-1.5 text-[#777777] hover:text-[#E5E5E5] rounded-md transition-colors"
          title="Help & Shortcuts"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      {/* Help Popover */}
      {showHelp && (
        <div className="absolute top-16 right-4 w-80 bg-[#141414] rounded-lg shadow-2xl border border-[#2A2A2A] p-4 z-50 text-xs text-[#CCCCCC] space-y-3">
          <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-2">
            <h4 className="font-bold text-[#E5E5E5] tracking-wide">PLANNING STUDIO GUIDE</h4>
            <button onClick={() => setShowHelp(false)} className="text-[#777777] hover:text-[#FF4D00] font-bold">✕</button>
          </div>
          <div className="space-y-1.5 text-[#AAAAAA]">
            <p><strong className="text-[#E5E5E5]">Left Toolbar:</strong> Switch tools to draw roads, subdivide plots, stamp buildings, and add water/drainage infrastructure.</p>
            <p><strong className="text-[#E5E5E5]">Polylines & Polygons:</strong> Click points on canvas, then <strong className="text-[#FF4D00]">Double-Click</strong> to complete shape.</p>
            <p><strong className="text-[#E5E5E5]">Move & Rotate:</strong> Use Select tool, click any object, drag to move, or drag the top circle handle to rotate.</p>
            <p><strong className="text-[#E5E5E5]">Shortcuts:</strong> Ctrl+Z (Undo), Ctrl+Y (Redo), Ctrl+D (Duplicate), Delete (Remove), Esc (Cancel draft).</p>
          </div>
        </div>
      )}
    </header>
  );
};
