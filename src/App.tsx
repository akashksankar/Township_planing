import React, { useState } from 'react';
import { Header } from './components/Header';
import { Toolbar } from './components/Toolbar';
import { Canvas } from './components/Canvas';
import { PropertiesPanel } from './components/PropertiesPanel';
import { LayersPanel } from './components/LayersPanel';
import { SummaryModal } from './components/SummaryModal';
import { ImportExportModal } from './components/ImportExportModal';
import { ExportModal } from './components/ExportModal';
import { Footer } from './components/Footer';

export default function App() {
  const [showSummary, setShowSummary] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showLayers, setShowLayers] = useState(false);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0F0F0F] font-sans text-[#E5E5E5] overflow-hidden antialiased">
      {/* 1. Top Navbar Header */}
      <Header
        onOpenSummary={() => setShowSummary(true)}
        onOpenImportExport={() => setShowImportExport(true)}
        onOpenExport={() => setShowExport(true)}
        onToggleLayers={() => setShowLayers(prev => !prev)}
        showLayers={showLayers}
      />

      {/* 2. Main Studio Workspace Area */}
      <div className="flex flex-1 overflow-hidden relative bg-[#0F0F0F]">
        {/* Left Vertical Tool Palette */}
        <Toolbar />

        {/* Center SVG Interactive Canvas */}
        <main className="flex-1 h-full relative overflow-hidden bg-[#0F0F0F] flex flex-col">
          <Canvas />
        </main>

        {/* Right Sidebar: Properties Inspector */}
        <PropertiesPanel />

        {/* Collapsible Overlaid Layers Manager */}
        {showLayers && (
          <div className="absolute top-0 right-72 bottom-0 z-40">
            <LayersPanel onClose={() => setShowLayers(false)} />
          </div>
        )}
      </div>

      {/* 3. Bottom Status Bar */}
      <Footer />

      {/* 4. Modals */}
      {showSummary && <SummaryModal onClose={() => setShowSummary(false)} />}
      {showImportExport && <ImportExportModal onClose={() => setShowImportExport(false)} />}
      {showExport && <ExportModal onClose={() => setShowExport(false)} />}
    </div>
  );
}

