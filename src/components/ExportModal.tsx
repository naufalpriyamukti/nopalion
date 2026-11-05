import React, { useState } from 'react';
import { MindmapNode, NodeConnection, Workspace } from '../types/mindmap';
import { X, Download, Upload, FileCode, Check, Image as ImageIcon } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspace: Workspace | null;
  nodes: MindmapNode[];
  connections: NodeConnection[];
  onImportWorkspace: (importedData: {
    workspace: Workspace;
    nodes: MindmapNode[];
    connections: NodeConnection[];
  }) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  workspace,
  nodes,
  connections,
  onImportWorkspace,
}) => {
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);

  if (!isOpen) return null;

  const currentWorkspaceName = workspace?.name || 'Mindmap';

  const handleExportJson = () => {
    const data = {
      workspace,
      nodes,
      connections,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentWorkspaceName.toLowerCase().replace(/\s+/g, '-')}-backup.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyJson = () => {
    const data = {
      workspace,
      nodes,
      connections,
      exportedAt: new Date().toISOString(),
    };
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleExportSvg = () => {
    // Generate standalone SVG
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodes.forEach((n) => {
      minX = Math.min(minX, n.x);
      minY = Math.min(minY, n.y);
      maxX = Math.max(maxX, n.x + 240);
      maxY = Math.max(maxY, n.y + 120);
    });

    const padding = 60;
    const width = Math.max(800, maxX - minX + padding * 2);
    const height = Math.max(600, maxY - minY + padding * 2);

    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX - padding} ${minY - padding} ${width} ${height}" width="${width}" height="${height}" style="background:#FBFBFA;font-family:'Plus Jakarta Sans',sans-serif;">\n`;
    svgContent += `<!-- Nopalion Export -->\n`;

    // Connectors
    connections.forEach((conn) => {
      const s = nodes.find((n) => n.id === conn.sourceNodeId);
      const t = nodes.find((n) => n.id === conn.targetNodeId);
      if (s && t) {
        const sx = s.x + 120;
        const sy = s.y + 25;
        const tx = t.x;
        const ty = t.y + 25;
        const dx = Math.abs(tx - sx) * 0.55;
        const dash = conn.style === 'dashed' ? 'stroke-dasharray="6,4"' : '';
        svgContent += `<path d="M ${sx} ${sy} C ${sx + dx} ${sy}, ${tx - dx} ${ty}, ${tx} ${ty}" fill="none" stroke="${conn.color || '#9B9A97'}" stroke-width="${conn.width || 2}" ${dash} />\n`;
      }
    });

    // Nodes
    nodes.forEach((n) => {
      svgContent += `<rect x="${n.x}" y="${n.y}" width="160" height="48" rx="6" fill="${n.bgColor || '#FFFFFF'}" stroke="${n.borderColor || '#E9E9E7'}" stroke-width="1.5" />\n`;
      svgContent += `<text x="${n.x + 12}" y="${n.y + 28}" font-size="13" font-weight="${n.bold ? 'bold' : 'normal'}" fill="${n.textColor || '#37352F'}">${n.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>\n`;
    });

    svgContent += `</svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentWorkspaceName.toLowerCase().replace(/\s+/g, '-')}-diagram.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setImportError(null);
    try {
      const parsed = JSON.parse(importJsonText);
      if (!parsed.nodes || !Array.isArray(parsed.nodes)) {
        throw new Error('Invalid file structure: missing nodes array');
      }
      onImportWorkspace({
        workspace: parsed.workspace || {
          id: 'ws-' + Date.now(),
          name: 'Imported Workspace',
          icon: '📥',
          description: 'Imported from JSON backup',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        nodes: parsed.nodes,
        connections: parsed.connections || [],
      });
      onClose();
    } catch (err: any) {
      setImportError(err.message || 'Invalid JSON format');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setImportJsonText(event.target?.result as string);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-[#202020] text-[#37352F] dark:text-[#E6E6E5] border border-[#E9E9E7] dark:border-[#2E2E2E] rounded-xl shadow-2xl p-6 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E9E9E7] dark:border-[#2E2E2E]">
          <h2 className="text-base font-bold">Export & Backup Workspace</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-[#787774] hover:text-[#37352F] dark:hover:text-white rounded hover:bg-[#F1F1EF] dark:hover:bg-[#2B2B2B] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-5">
          {/* Export Formats */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-[#787774] dark:text-[#9B9A97] uppercase tracking-wider block">
              Export Formats
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleExportJson}
                className="flex items-center gap-2 p-3 rounded-lg border border-[#E9E9E7] dark:border-[#2E2E2E] hover:bg-[#F7F7F5] dark:hover:bg-[#282828] text-xs font-medium text-left transition-colors cursor-pointer"
              >
                <FileCode className="w-4 h-4 text-[#2383E2]" />
                <div>
                  <div className="font-semibold">JSON Backup</div>
                  <div className="text-[10px] text-[#9B9A97]">Complete structure & styles</div>
                </div>
              </button>

              <button
                onClick={handleExportSvg}
                className="flex items-center gap-2 p-3 rounded-lg border border-[#E9E9E7] dark:border-[#2E2E2E] hover:bg-[#F7F7F5] dark:hover:bg-[#282828] text-xs font-medium text-left transition-colors cursor-pointer"
              >
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="font-semibold">Vector SVG</div>
                  <div className="text-[10px] text-[#9B9A97]">Infinite resolution diagram</div>
                </div>
              </button>
            </div>

            <div className="pt-1">
              <button
                onClick={handleCopyJson}
                className="text-xs text-[#787774] hover:text-[#37352F] dark:hover:text-white flex items-center gap-1.5 cursor-pointer"
              >
                {copiedJson ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Copied JSON data to clipboard!</span>
                  </>
                ) : (
                  <span>Copy raw JSON to clipboard</span>
                )}
              </button>
            </div>
          </div>

          {/* Import Section */}
          <div className="pt-4 border-t border-[#E9E9E7] dark:border-[#2E2E2E] space-y-2.5">
            <span className="text-xs font-semibold text-[#787774] dark:text-[#9B9A97] uppercase tracking-wider block">
              Import Existing Workspace
            </span>

            {importError && (
              <div className="p-2 text-xs bg-red-50 dark:bg-red-950/40 text-red-600 border border-red-200 rounded">
                {importError}
              </div>
            )}

            <div className="flex items-center gap-2">
              <label className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 border border-dashed border-[#D3D3D0] dark:border-[#383838] hover:border-[#2383E2] rounded-lg text-xs font-medium text-[#787774] hover:text-[#2383E2] cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload .json File</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {importJsonText && (
              <form onSubmit={handleImportSubmit} className="space-y-2 pt-1">
                <textarea
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder="Paste JSON here..."
                  rows={4}
                  className="w-full p-2 text-xs font-mono bg-[#FBFBFA] dark:bg-[#181818] border border-[#E9E9E7] dark:border-[#2E2E2E] rounded focus:outline-none text-[#37352F] dark:text-[#E6E6E5]"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-[#37352F] dark:bg-[#E6E6E5] text-white dark:text-[#191919] text-xs font-medium rounded-lg cursor-pointer shadow-xs"
                >
                  Load Imported Workspace
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
