import React, { useRef } from 'react';
import {
  MindmapNode,
  FontFamily,
  FontSize,
  TextAlign,
  NodeShape,
  ShadowLevel,
} from '../types/mindmap';
import { NOTION_COLORS } from '../constants/notionPalette';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  FileText,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Trash2,
  Layers,
  Sparkles,
  ExternalLink,
  Plus,
} from 'lucide-react';

interface NodeInspectorProps {
  node: MindmapNode | null;
  onUpdateNode: (updatedNode: MindmapNode) => void;
  onDeleteNode: (id: string) => void;
  onOpenDocument: (node: MindmapNode) => void;
  onAddChild: (parentNode: MindmapNode) => void;
  onAddSibling: (node: MindmapNode) => void;
  onAddNewParent: () => void;
  onClose: () => void;
}

export const NodeInspector: React.FC<NodeInspectorProps> = ({
  node,
  onUpdateNode,
  onDeleteNode,
  onOpenDocument,
  onAddChild,
  onAddSibling,
  onAddNewParent,
  onClose,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!node) return null;

  const update = (partial: Partial<MindmapNode>) => {
    onUpdateNode({ ...node, ...partial, updatedAt: new Date().toISOString() });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      update({
        image: {
          url,
          zoom: 1.0,
          panX: 0,
          panY: 0,
          fit: 'cover',
          aspectRatio: '16:9',
          height: 160,
        },
      });
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    update({ image: undefined });
  };

  return (
    <div className="w-80 h-full bg-white dark:bg-[#202020] border-l border-[#E9E9E7] dark:border-[#2E2E2E] flex flex-col font-sans select-none overflow-y-auto text-[#37352F] dark:text-[#E6E6E5] z-30 shadow-sm">
      {/* Inspector Header */}
      <div className="px-4 py-3 border-b border-[#E9E9E7] dark:border-[#2E2E2E] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 text-[10px] font-mono rounded ${
              node.isParent
                ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                : node.type === 'sticky'
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}
          >
            {node.isParent ? 'Parent Node' : node.type === 'sticky' ? 'Sticky Note' : 'Child Node'}
          </span>
          <span className="text-xs font-semibold truncate max-w-[120px]">{node.text || 'Untitled'}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onDeleteNode(node.id)}
            title="Delete Node (Delete)"
            className="p-1.5 text-red-500 hover:text-red-700 rounded hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs text-[#787774] hover:text-[#37352F] rounded hover:bg-[#F1F1EF] dark:hover:bg-[#2B2B2B] cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      <div className="p-4 space-y-5 flex-1">
        {/* Node Hierarchy & Multiple Parent Toggle */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-[#787774] dark:text-[#9B9A97] uppercase tracking-wider">
            Hierarchy & Structure
          </label>
          <div className="flex items-center justify-between p-2.5 rounded-lg border border-[#E9E9E7] dark:border-[#2E2E2E] bg-[#FBFBFA] dark:bg-[#181818]">
            <span className="text-xs font-medium">Independent Parent Node</span>
            <input
              type="checkbox"
              checked={node.isParent}
              onChange={(e) => update({ isParent: e.target.checked, type: e.target.checked ? 'parent' : 'child' })}
              className="w-4 h-4 rounded text-[#2383E2] focus:ring-0 cursor-pointer"
            />
          </div>
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              onClick={() => onAddChild(node)}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-[#F1F1EF] dark:bg-[#2B2B2B] hover:bg-[#EAEAEA] dark:hover:bg-[#333333] text-xs font-medium rounded text-[#37352F] dark:text-[#E6E6E5] transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Child</span>
            </button>
            <button
              onClick={() => onAddSibling(node)}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-[#F1F1EF] dark:bg-[#2B2B2B] hover:bg-[#EAEAEA] dark:hover:bg-[#333333] text-xs font-medium rounded text-[#37352F] dark:text-[#E6E6E5] transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Sibling</span>
            </button>
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[#787774] dark:text-[#9B9A97] uppercase tracking-wider">
            Label / Text Content
          </label>
          <textarea
            value={node.text}
            onChange={(e) => update({ text: e.target.value })}
            rows={2}
            className="w-full p-2 text-xs bg-[#FBFBFA] dark:bg-[#181818] border border-[#E9E9E7] dark:border-[#2E2E2E] rounded-md text-[#37352F] dark:text-[#E6E6E5] focus:outline-none focus:border-[#2383E2] resize-none"
          />
        </div>

        {/* Notion Typography & Font Family */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-[#787774] dark:text-[#9B9A97] uppercase tracking-wider">
            Typography & Font Style
          </label>
          <div className="grid grid-cols-3 gap-1 bg-[#F1F1EF] dark:bg-[#2B2B2B] p-1 rounded-lg">
            {(['sans', 'serif', 'mono'] as FontFamily[]).map((font) => (
              <button
                key={font}
                onClick={() => update({ fontFamily: font })}
                className={`py-1 text-xs capitalize rounded transition-colors cursor-pointer ${
                  node.fontFamily === font
                    ? 'bg-white dark:bg-[#191919] text-[#37352F] dark:text-[#E6E6E5] font-semibold shadow-xs'
                    : 'text-[#787774] dark:text-[#9B9A97] hover:text-[#37352F]'
                }`}
                style={{
                  fontFamily:
                    font === 'serif'
                      ? 'Source Serif 4, Georgia, serif'
                      : font === 'mono'
                      ? 'JetBrains Mono, monospace'
                      : 'Plus Jakarta Sans, sans-serif',
                }}
              >
                {font}
              </button>
            ))}
          </div>

          {/* Font Size & Formats */}
          <div className="flex items-center gap-1 pt-1">
            <select
              value={node.fontSize}
              onChange={(e) => update({ fontSize: e.target.value as FontSize })}
              className="text-xs px-2 py-1 bg-[#FBFBFA] dark:bg-[#181818] border border-[#E9E9E7] dark:border-[#2E2E2E] rounded text-[#37352F] dark:text-[#E6E6E5] focus:outline-none"
            >
              <option value="xs">XS (12px)</option>
              <option value="sm">Small (14px)</option>
              <option value="base">Normal (16px)</option>
              <option value="lg">Large (18px)</option>
              <option value="xl">XL Title (22px)</option>
              <option value="2xl">2XL Heading (28px)</option>
            </select>

            <div className="flex items-center gap-0.5 ml-auto border border-[#E9E9E7] dark:border-[#2E2E2E] rounded p-0.5 bg-[#FBFBFA] dark:bg-[#181818]">
              <button
                onClick={() => update({ bold: !node.bold })}
                className={`p-1 rounded cursor-pointer ${
                  node.bold ? 'bg-[#37352F] text-white dark:bg-white dark:text-[#191919]' : 'text-[#787774]'
                }`}
                title="Bold"
              >
                <Bold className="w-3 h-3" />
              </button>
              <button
                onClick={() => update({ italic: !node.italic })}
                className={`p-1 rounded cursor-pointer ${
                  node.italic ? 'bg-[#37352F] text-white dark:bg-white dark:text-[#191919]' : 'text-[#787774]'
                }`}
                title="Italic"
              >
                <Italic className="w-3 h-3" />
              </button>
              <button
                onClick={() => update({ underline: !node.underline })}
                className={`p-1 rounded cursor-pointer ${
                  node.underline ? 'bg-[#37352F] text-white dark:bg-white dark:text-[#191919]' : 'text-[#787774]'
                }`}
                title="Underline"
              >
                <Underline className="w-3 h-3" />
              </button>
              <button
                onClick={() => update({ strikethrough: !node.strikethrough })}
                className={`p-1 rounded cursor-pointer ${
                  node.strikethrough
                    ? 'bg-[#37352F] text-white dark:bg-white dark:text-[#191919]'
                    : 'text-[#787774]'
                }`}
                title="Strikethrough"
              >
                <Strikethrough className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Alignment */}
          <div className="flex items-center gap-1 pt-1">
            <span className="text-xs text-[#787774]">Align</span>
            <div className="flex items-center gap-1 ml-auto">
              {(['left', 'center', 'right'] as TextAlign[]).map((align) => (
                <button
                  key={align}
                  onClick={() => update({ textAlign: align })}
                  className={`p-1 rounded border cursor-pointer ${
                    node.textAlign === align
                      ? 'bg-neutral-200 dark:bg-neutral-700 border-neutral-400'
                      : 'border-transparent text-[#787774]'
                  }`}
                >
                  {align === 'left' ? (
                    <AlignLeft className="w-3 h-3" />
                  ) : align === 'center' ? (
                    <AlignCenter className="w-3 h-3" />
                  ) : (
                    <AlignRight className="w-3 h-3" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Colors (Notion Palette Swatches) */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-[#787774] dark:text-[#9B9A97] uppercase tracking-wider">
            Background & Text Colors
          </label>
          <div className="space-y-1.5">
            <span className="text-[11px] text-[#787774]">Preset Colors</span>
            <div className="grid grid-cols-5 gap-1.5">
              {NOTION_COLORS.map((col) => (
                <button
                  key={col.id}
                  onClick={() =>
                    update({
                      bgColor: col.bgLight,
                      textColor: col.textLight,
                      borderColor: col.borderLight,
                    })
                  }
                  title={col.name}
                  className="h-6 rounded border flex items-center justify-center text-[10px] font-medium transition-transform hover:scale-105 cursor-pointer"
                  style={{
                    backgroundColor: col.bgLight,
                    color: col.textLight,
                    borderColor: col.borderLight,
                  }}
                >
                  Aa
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <span className="text-[10px] text-[#787774] block mb-1">Custom BG</span>
              <input
                type="color"
                value={node.bgColor.startsWith('#') ? node.bgColor : '#FFFFFF'}
                onChange={(e) => update({ bgColor: e.target.value })}
                className="w-full h-7 rounded border border-[#E9E9E7] dark:border-[#2E2E2E] cursor-pointer"
              />
            </div>
            <div>
              <span className="text-[10px] text-[#787774] block mb-1">Custom Text</span>
              <input
                type="color"
                value={node.textColor.startsWith('#') ? node.textColor : '#37352F'}
                onChange={(e) => update({ textColor: e.target.value })}
                className="w-full h-7 rounded border border-[#E9E9E7] dark:border-[#2E2E2E] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Shapes, Borders, Shadows & Opacity */}
        <div className="space-y-2.5">
          <label className="text-[11px] font-semibold text-[#787774] dark:text-[#9B9A97] uppercase tracking-wider">
            Border, Shadow & Opacity
          </label>

          {/* Shape */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#787774]">Node Shape</span>
            <div className="flex gap-1">
              {(['rounded', 'sharp', 'pill'] as NodeShape[]).map((shape) => (
                <button
                  key={shape}
                  onClick={() => update({ shape })}
                  className={`px-2 py-0.5 text-xs capitalize rounded border cursor-pointer ${
                    node.shape === shape
                      ? 'bg-neutral-200 dark:bg-neutral-700 border-neutral-400 font-medium'
                      : 'border-[#E9E9E7] dark:border-[#2E2E2E] text-[#787774]'
                  }`}
                >
                  {shape}
                </button>
              ))}
            </div>
          </div>

          {/* Shadow */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#787774]">Shadow</span>
            <select
              value={node.shadow}
              onChange={(e) => update({ shadow: e.target.value as ShadowLevel })}
              className="text-xs px-2 py-1 bg-[#FBFBFA] dark:bg-[#181818] border border-[#E9E9E7] dark:border-[#2E2E2E] rounded text-[#37352F] dark:text-[#E6E6E5]"
            >
              <option value="none">None</option>
              <option value="subtle">Notion Subtle</option>
              <option value="medium">Medium</option>
              <option value="deep">Elevated</option>
              <option value="glow">Soft Glow</option>
            </select>
          </div>

          {/* Opacity Slider (10% to 100%) */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-[#787774]">
              <span>Opacity</span>
              <span className="font-mono">{node.opacity ?? 100}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={node.opacity ?? 100}
              onChange={(e) => update({ opacity: Number(e.target.value) })}
              className="w-full accent-[#37352F] dark:accent-[#E6E6E5] cursor-pointer"
            />
          </div>
        </div>

        {/* Image Frame Controls (Zoom in, Zoom out, Pan, Aspect) */}
        <div className="space-y-2.5 pt-2 border-t border-[#E9E9E7] dark:border-[#2E2E2E]">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold text-[#787774] dark:text-[#9B9A97] uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Image & Frame Zoom</span>
            </label>
            {node.image && (
              <button
                onClick={removeImage}
                className="text-[11px] text-red-500 hover:text-red-700 cursor-pointer"
              >
                Remove
              </button>
            )}
          </div>

          {node.image ? (
            <div className="space-y-2.5 bg-[#FBFBFA] dark:bg-[#181818] p-2.5 rounded-lg border border-[#E9E9E7] dark:border-[#2E2E2E]">
              {/* Zoom Slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-[#787774]">
                  <span className="flex items-center gap-1">
                    <ZoomIn className="w-3 h-3" />
                    <span>Frame Zoom</span>
                  </span>
                  <span className="font-mono">{Math.round((node.image.zoom || 1) * 100)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      update({
                        image: {
                          ...node.image!,
                          zoom: Math.max(0.5, (node.image!.zoom || 1) - 0.1),
                        },
                      })
                    }
                    className="p-1 rounded bg-[#EAEAEA] dark:bg-[#2B2B2B] text-xs cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.05"
                    value={node.image.zoom || 1}
                    onChange={(e) =>
                      update({
                        image: {
                          ...node.image!,
                          zoom: parseFloat(e.target.value),
                        },
                      })
                    }
                    className="flex-1 accent-[#37352F] cursor-pointer"
                  />
                  <button
                    onClick={() =>
                      update({
                        image: {
                          ...node.image!,
                          zoom: Math.min(3, (node.image!.zoom || 1) + 0.1),
                        },
                      })
                    }
                    className="p-1 rounded bg-[#EAEAEA] dark:bg-[#2B2B2B] text-xs cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Pan Position Sliders */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-[#787774] block mb-0.5">Pan X</span>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={node.image.panX || 0}
                    onChange={(e) =>
                      update({
                        image: {
                          ...node.image!,
                          panX: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full accent-[#37352F] cursor-pointer"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-[#787774] block mb-0.5">Pan Y</span>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={node.image.panY || 0}
                    onChange={(e) =>
                      update({
                        image: {
                          ...node.image!,
                          panY: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full accent-[#37352F] cursor-pointer"
                  />
                </div>
              </div>

              {/* Fit Mode */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[#787774]">Frame Fit</span>
                <div className="flex gap-1">
                  {(['cover', 'contain'] as ('cover' | 'contain')[]).map((fit) => (
                    <button
                      key={fit}
                      onClick={() =>
                        update({
                          image: {
                            ...node.image!,
                            fit,
                          },
                        })
                      }
                      className={`px-2 py-0.5 capitalize rounded border cursor-pointer ${
                        node.image?.fit === fit
                          ? 'bg-neutral-200 dark:bg-neutral-700 font-medium'
                          : 'border-transparent text-[#787774]'
                      }`}
                    >
                      {fit}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 px-3 border border-dashed border-[#D3D3D0] dark:border-[#383838] hover:border-[#2383E2] rounded-lg text-xs font-medium text-[#787774] hover:text-[#2383E2] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Upload Image to Frame</span>
              </button>
            </div>
          )}
        </div>

        {/* Inclusions: Link & Documents */}
        <div className="space-y-2.5 pt-2 border-t border-[#E9E9E7] dark:border-[#2E2E2E]">
          <label className="text-[11px] font-semibold text-[#787774] dark:text-[#9B9A97] uppercase tracking-wider">
            Inclusions & Attachments
          </label>

          {/* Link Section */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-[#787774]">
                <Link className="w-3.5 h-3.5" />
                <span>External Web Link</span>
              </span>
              {node.link?.url && (
                <a
                  href={node.link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#2383E2] hover:underline flex items-center gap-0.5 text-[11px]"
                >
                  <span>Open</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </div>
            <input
              type="url"
              placeholder="https://example.com"
              value={node.link?.url || ''}
              onChange={(e) =>
                update({
                  link: e.target.value.trim()
                    ? {
                        title: node.link?.title || 'External Resource',
                        url: e.target.value.trim(),
                      }
                    : undefined,
                })
              }
              className="w-full px-2.5 py-1.5 text-xs bg-[#FBFBFA] dark:bg-[#181818] border border-[#E9E9E7] dark:border-[#2E2E2E] rounded text-[#37352F] dark:text-[#E6E6E5] focus:outline-none focus:border-[#2383E2]"
            />
          </div>

          {/* Document Button */}
          <div className="pt-1">
            <button
              onClick={() => onOpenDocument(node)}
              className="w-full py-2 px-3 bg-[#F1F1EF] dark:bg-[#2B2B2B] hover:bg-[#EAEAEA] dark:hover:bg-[#333333] rounded-lg text-xs font-medium text-[#37352F] dark:text-[#E6E6E5] flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#2383E2]" />
                <span>{node.document ? 'Edit Attached Document' : 'Attach Document to Node'}</span>
              </div>
              <span className="text-[10px] text-[#787774]">
                {node.document ? `${node.document.checklists?.length || 0} tasks` : 'Markdown'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
