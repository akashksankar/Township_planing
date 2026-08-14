import React, { useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import { exportSvgString, exportPng, exportA4Pdf, downloadFile } from '../utils/export';
import { X, FileText, Image as ImageIcon, Code2, Check, Loader2 } from 'lucide-react';

interface ExportModalProps {
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ onClose }) => {
  const { project } = useProjectStore();

  const [exportFormat, setExportFormat] = useState<'pdf' | 'svg' | 'png'>('pdf');
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [scale, setScale] = useState<'1:100' | '1:200' | '1:500' | '1:1000'>('1:500');
  const [includeSummary, setIncludeSummary] = useState(true);
  const [includeTitleBlock, setIncludeTitleBlock] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      if (exportFormat === 'pdf') {
        await exportA4Pdf(project, {
          format: 'pdf',
          orientation,
          scale,
          includeSummary,
          includeTitleBlock
        });
      } else if (exportFormat === 'svg') {
        const svgContent = exportSvgString(project);
        const filename = `${project.project.name.toLowerCase().replace(/\s+/g, '_')}_plan.svg`;
        downloadFile(svgContent, filename, 'image/svg+xml;charset=utf-8');
      } else if (exportFormat === 'png') {
        const filename = `${project.project.name.toLowerCase().replace(/\s+/g, '_')}_plan.png`;
        await exportPng(project, filename, 2);
      }
      onClose();
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150 text-[#E5E5E5]">
      <div className="bg-[#141414] rounded-xl shadow-2xl border border-[#2A2A2A] w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#2A2A2A] flex items-center justify-between bg-[#181818]">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#E5E5E5]">
              Export Conceptual Township Plan
            </h2>
            <p className="text-xs text-[#888888] font-mono mt-0.5">
              Production Output (A4 Technical PDF, Vector SVG, PNG)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#777777] hover:text-[#FF4D00] p-1.5 rounded-md hover:bg-[#222222] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 text-xs text-[#CCCCCC]">
          {/* Format Tabs */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#888888] mb-2">Export Format</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setExportFormat('pdf')}
                className={`p-3 rounded-lg border flex flex-col items-center gap-1.5 transition-all ${
                  exportFormat === 'pdf'
                    ? 'border-[#FF4D00] bg-[#2A1810] text-white font-bold'
                    : 'border-[#2A2A2A] bg-[#1A1A1A] hover:bg-[#222222] text-[#CCCCCC]'
                }`}
              >
                <FileText className="w-5 h-5 text-[#FF4D00]" />
                <span className="font-mono text-[11px]">A4 Technical PDF</span>
              </button>

              <button
                onClick={() => setExportFormat('svg')}
                className={`p-3 rounded-lg border flex flex-col items-center gap-1.5 transition-all ${
                  exportFormat === 'svg'
                    ? 'border-[#FF4D00] bg-[#2A1810] text-white font-bold'
                    : 'border-[#2A2A2A] bg-[#1A1A1A] hover:bg-[#222222] text-[#CCCCCC]'
                }`}
              >
                <Code2 className="w-5 h-5 text-[#FF4D00]" />
                <span className="font-mono text-[11px]">Vector SVG</span>
              </button>

              <button
                onClick={() => setExportFormat('png')}
                className={`p-3 rounded-lg border flex flex-col items-center gap-1.5 transition-all ${
                  exportFormat === 'png'
                    ? 'border-[#FF4D00] bg-[#2A1810] text-white font-bold'
                    : 'border-[#2A2A2A] bg-[#1A1A1A] hover:bg-[#222222] text-[#CCCCCC]'
                }`}
              >
                <ImageIcon className="w-5 h-5 text-[#FF4D00]" />
                <span className="font-mono text-[11px]">High-Res PNG</span>
              </button>
            </div>
          </div>

          {/* PDF Options */}
          {exportFormat === 'pdf' && (
            <div className="space-y-3 pt-3 border-t border-[#2A2A2A]">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#888888] mb-1 uppercase tracking-wider">Orientation</label>
                  <select
                    value={orientation}
                    onChange={e => setOrientation(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-[#1C1C1C] border border-[#2A2A2A] rounded-md text-xs text-[#E5E5E5] focus:border-[#FF4D00] outline-hidden"
                  >
                    <option value="landscape">A4 Landscape (Recommended)</option>
                    <option value="portrait">A4 Portrait</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#888888] mb-1 uppercase tracking-wider">Conceptual Scale</label>
                  <select
                    value={scale}
                    onChange={e => setScale(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-[#1C1C1C] border border-[#2A2A2A] rounded-md text-xs text-[#E5E5E5] focus:border-[#FF4D00] outline-hidden"
                  >
                    <option value="1:100">1:100 Detail</option>
                    <option value="1:200">1:200 Layout</option>
                    <option value="1:500">1:500 Master Plan</option>
                    <option value="1:1000">1:1000 Township Overview</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-[#CCCCCC]">
                  <input
                    type="checkbox"
                    checked={includeTitleBlock}
                    onChange={e => setIncludeTitleBlock(e.target.checked)}
                    className="accent-[#FF4D00] rounded"
                  />
                  <span>Include Technical Drawing Title Block (Date, Scale, Project)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-[#CCCCCC]">
                  <input
                    type="checkbox"
                    checked={includeSummary}
                    onChange={e => setIncludeSummary(e.target.checked)}
                    className="accent-[#FF4D00] rounded"
                  />
                  <span>Include Civil Planning Metrics & Calculations Table</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-[#2A2A2A] bg-[#181818] flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-semibold text-[#888888] hover:text-[#E5E5E5] rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-5 py-2 bg-[#FF4D00] hover:bg-[#FF6622] text-black font-bold text-xs rounded-md shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50 tracking-wide uppercase"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            <span>{isExporting ? 'Generating...' : 'Export File'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
