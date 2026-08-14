import React, { useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import { validateTownshipProject } from '../utils/validation';
import { downloadFile } from '../utils/export';
import { X, Download, Upload, Copy, Check, AlertCircle } from 'lucide-react';

interface ImportExportModalProps {
  onClose: () => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({ onClose }) => {
  const { project, setProject } = useProjectStore();
  const [jsonText, setJsonText] = useState(() => JSON.stringify(project, null, 2));
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = `${project.project.name.toLowerCase().replace(/\s+/g, '_')}_project.json`;
    downloadFile(jsonText, filename, 'application/json');
  };

  const handleImport = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const raw = JSON.parse(jsonText);
      const validation = validateTownshipProject(raw);
      if (validation.success && validation.data) {
        setProject(validation.data);
        setSuccessMessage('Project JSON loaded successfully!');
        setTimeout(() => onClose(), 1200);
      } else {
        setErrorMessage(`Schema Validation Failed: ${validation.error}`);
      }
    } catch (err: unknown) {
      setErrorMessage(`Invalid JSON syntax: ${err instanceof Error ? err.message : 'Unknown parse error'}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      setJsonText(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150 text-[#E5E5E5]">
      <div className="bg-[#141414] rounded-xl shadow-2xl border border-[#2A2A2A] w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#2A2A2A] flex items-center justify-between bg-[#181818]">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#E5E5E5]">
              Township JSON Project Sync & Schema
            </h2>
            <p className="text-xs text-[#888888] font-mono mt-0.5">
              Canonical JSON Format with Zod Schema Validation
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#777777] hover:text-[#FF4D00] p-1.5 rounded-md hover:bg-[#222222] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-[#CCCCCC]">
          {/* Notifications */}
          {errorMessage && (
            <div className="bg-[#2A1515] border border-[#552020] text-[#FF7766] p-3 rounded-md flex items-start gap-2 text-xs font-mono">
              <AlertCircle className="w-4 h-4 text-[#FF4D00] shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="bg-[#152A1A] border border-[#205528] text-[#66FF88] p-3 rounded-md flex items-center gap-2 text-xs font-mono">
              <Check className="w-4 h-4 text-[#66FF88] shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* JSON Text Editor */}
          <div className="relative">
            <textarea
              value={jsonText}
              onChange={e => setJsonText(e.target.value)}
              className="w-full h-80 font-mono text-[11px] p-3.5 bg-[#0A0A0A] text-[#FF8544] rounded-md border border-[#2A2A2A] focus:outline-hidden focus:border-[#FF4D00] shadow-inner resize-none leading-relaxed"
              spellCheck={false}
            />
          </div>

          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1C1C1C] hover:bg-[#252525] border border-[#2A2A2A] text-[#CCCCCC] hover:text-white rounded-md cursor-pointer text-xs font-medium transition-colors">
                <Upload className="w-3.5 h-3.5 text-[#FF4D00]" />
                <span>Upload File</span>
                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
              </label>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1C1C1C] hover:bg-[#252525] border border-[#2A2A2A] text-[#CCCCCC] hover:text-white rounded-md text-xs font-medium transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#FF4D00]" /> : <Copy className="w-3.5 h-3.5 text-[#888888]" />}
                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#222222] hover:bg-[#2C2C2C] border border-[#2A2A2A] text-[#E5E5E5] rounded-md text-xs font-medium transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-[#FF4D00]" />
                <span>Download JSON</span>
              </button>

              <button
                onClick={handleImport}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-[#FF4D00] hover:bg-[#FF6622] text-black font-bold rounded-md text-xs transition-colors shadow-xs uppercase tracking-wider"
              >
                <span>Apply / Import JSON</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
