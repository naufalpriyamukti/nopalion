import React, { useState, useRef, useEffect } from 'react';
import {
  MindmapNode,
  FontFamily,
  FontSize,
  TextAlign,
  ConnectorStyle,
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
  StickyNote,
  Trash2,
  Copy,
  GitBranch,
  ChevronDown,
  Spline,
  MoreHorizontal,
  Check,
  Cable,
  Maximize2,
  RotateCcw,
} from 'lucide-react';

interface NodeFloatingToolbarProps {
  node: MindmapNode;
  onUpdateNode: (updatedNode: MindmapNode) => void;
  onDeleteNode: (id: string) => void;
  onDuplicateNode: (node: MindmapNode) => void;
  onAddChild: (node: MindmapNode) => void;
  onAddSibling: (node: MindmapNode) => void;
  onAddStickyNote: (connectedNodeId?: string) => void;
  onOpenDocument: (node: MindmapNode) => void;
  onStartConnecting: (nodeId: string) => void;
  onToggleConnectorStyle?: (style: ConnectorStyle) => void;
}

export const NodeFloatingToolbar: React.FC<NodeFloatingToolbarProps> = ({
  node,
  onUpdateNode,
  onDeleteNode,
  onDuplicateNode,
  onAddChild,
  onAddSibling,
  onAddStickyNote,
  onOpenDocument,
  onStartConnecting,
  onToggleConnectorStyle,
}) => {
  const [activeDropdown, setActiveDropdown] = useState<
    'font' | 'size' | 'color' | 'format' | 'align' | 'link' | 'image' | 'connector' | 'more' | null
  >(null);

  const [linkUrl, setLinkUrl] = useState(node.link?.url || '');
  const [linkTitle, setLinkTitle] = useState(node.link?.title || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as HTMLElement)) {
        setActiveDropdown(null);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          fit: 'contain',
          aspectRatio: '16:9',
          height: 180,
        },
      });
      setActiveDropdown(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (linkUrl.trim()) {
      update({
        link: {
          url: linkUrl.trim().startsWith('http') ? linkUrl.trim() : `https://${linkUrl.trim()}`,
          title: linkTitle.trim() || 'Link',
        },
      });
    } else {
      update({ link: undefined });
    }
    setActiveDropdown(null);
  };

  const fontSizeLabels: Record<FontSize, string> = {
    xs: 'XS',
    sm: 'Small',
    base: 'Medium',
    lg: 'Large',
    xl: 'Title',
    '2xl': 'Heading',
  };

  return (
    <div
      ref={toolbarRef}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      className="flex items-center gap-0.5 bg-[#1F1F23] text-white border border-[#38383D] rounded-xl px-2 py-1.5 shadow-2xl select-none text-xs font-sans pointer-events-auto z-40 transition-all"
    >
      {/* 1. Hierarchy badge */}
      <div
        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium ${
          node.isParent
            ? 'bg-purple-900/60 text-purple-300'
            : node.type === 'sticky'
            ? 'bg-amber-900/60 text-amber-300'
            : 'bg-neutral-800 text-neutral-400'
        }`}
      >
        {node.isParent ? 'Parent' : node.type === 'sticky' ? 'Sticky' : 'Node'}
      </div>

      <div className="w-[1px] h-4 bg-[#38383D] mx-0.5" />

      {/* 2. Connect Button: Click to connect to any other node! */}
      <button
        onClick={() => onStartConnecting(node.id)}
        className="flex items-center gap-1 px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-medium cursor-pointer transition-colors shadow-xs"
        title="Connect this node to any other node (including parent nodes)"
      >
        <Cable className="w-3.5 h-3.5" />
        <span>Connect</span>
      </button>

      <div className="w-[1px] h-4 bg-[#38383D] mx-0.5" />

      {/* 3. Font Family (Aa ▾) */}
      <div className="relative">
        <button
          onClick={() => setActiveDropdown(activeDropdown === 'font' ? null : 'font')}
          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-[#2D2D32] transition-colors cursor-pointer text-xs"
          title="Font Family"
        >
          <span className="font-medium capitalize">{node.fontFamily || 'Sans'}</span>
          <ChevronDown className="w-3 h-3 opacity-60" />
        </button>

        {activeDropdown === 'font' && (
          <div className="absolute top-full left-0 mt-2 bg-[#242428] border border-[#3A3A40] rounded-lg shadow-xl p-1 z-50 w-28 space-y-0.5">
            {(['sans', 'serif', 'mono'] as FontFamily[]).map((f) => (
              <button
                key={f}
                onClick={() => {
                  update({ fontFamily: f });
                  setActiveDropdown(null);
                }}
                className={`w-full text-left px-2 py-1.5 rounded text-xs capitalize flex items-center justify-between hover:bg-[#34343A] cursor-pointer ${
                  node.fontFamily === f ? 'text-purple-400 font-semibold' : 'text-neutral-200'
                }`}
              >
                <span>{f}</span>
                {node.fontFamily === f && <Check className="w-3 h-3" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 4. Font Size (Small ▾) */}
      <div className="relative">
        <button
          onClick={() => setActiveDropdown(activeDropdown === 'size' ? null : 'size')}
          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-[#2D2D32] transition-colors cursor-pointer text-xs"
          title="Font Size"
        >
          <span>{fontSizeLabels[node.fontSize] || 'Small'}</span>
          <ChevronDown className="w-3 h-3 opacity-60" />
        </button>

        {activeDropdown === 'size' && (
          <div className="absolute top-full left-0 mt-2 bg-[#242428] border border-[#3A3A40] rounded-lg shadow-xl p-1 z-50 w-28 space-y-0.5">
            {(['xs', 'sm', 'base', 'lg', 'xl', '2xl'] as FontSize[]).map((s) => (
              <button
                key={s}
                onClick={() => {
                  update({ fontSize: s });
                  setActiveDropdown(null);
                }}
                className={`w-full text-left px-2 py-1.5 rounded text-xs flex items-center justify-between hover:bg-[#34343A] cursor-pointer ${
                  node.fontSize === s ? 'text-purple-400 font-semibold' : 'text-neutral-200'
                }`}
              >
                <span>{fontSizeLabels[s]}</span>
                {node.fontSize === s && <Check className="w-3 h-3" />}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-[1px] h-4 bg-[#38383D] mx-0.5" />

      {/* 5. Color Swatch */}
      <div className="relative">
        <button
          onClick={() => setActiveDropdown(activeDropdown === 'color' ? null : 'color')}
          className="flex items-center gap-1 px-1.5 py-1 rounded hover:bg-[#2D2D32] transition-colors cursor-pointer"
          title="Colors"
        >
          <div
            className="w-4 h-4 rounded border border-white/20 shadow-xs"
            style={{ backgroundColor: node.bgColor || '#FFFFFF' }}
          />
          <ChevronDown className="w-3 h-3 opacity-60" />
        </button>

        {activeDropdown === 'color' && (
          <div className="absolute top-full left-0 mt-2 bg-[#242428] border border-[#3A3A40] rounded-xl shadow-2xl p-3 z-50 w-52 space-y-2.5">
            <div className="text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">
              Background Color
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              <button
                onClick={() =>
                  update({
                    bgColor: '#242426',
                    textColor: '#FFFFFF',
                    borderColor: '#3D3D42',
                  })
                }
                title="Dark"
                className="w-8 h-8 rounded border border-neutral-600 bg-[#242426] text-white flex items-center justify-center text-[10px] font-bold hover:scale-105 cursor-pointer"
              >
                Aa
              </button>
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
                  className="w-8 h-8 rounded border flex items-center justify-center text-[10px] font-medium hover:scale-105 cursor-pointer"
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

            <div className="pt-2 border-t border-[#3A3A40] flex items-center justify-between text-xs">
              <span className="text-neutral-400">Custom</span>
              <div className="flex gap-1.5 items-center">
                <input
                  type="color"
                  value={node.bgColor.startsWith('#') ? node.bgColor : '#FFFFFF'}
                  onChange={(e) => update({ bgColor: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                  title="Background"
                />
                <input
                  type="color"
                  value={node.textColor.startsWith('#') ? node.textColor : '#000000'}
                  onChange={(e) => update({ textColor: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                  title="Text color"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 6. Bold & Formatting */}
      <div className="relative">
        <button
          onClick={() => setActiveDropdown(activeDropdown === 'format' ? null : 'format')}
          className={`flex items-center gap-1 px-2 py-1 rounded hover:bg-[#2D2D32] transition-colors cursor-pointer ${
            node.bold ? 'text-purple-400 font-bold' : ''
          }`}
          title="Format text"
        >
          <span className="font-bold">B</span>
          <ChevronDown className="w-3 h-3 opacity-60" />
        </button>

        {activeDropdown === 'format' && (
          <div className="absolute top-full left-0 mt-2 bg-[#242428] border border-[#3A3A40] rounded-lg shadow-xl p-1 z-50 flex gap-0.5">
            <button
              onClick={() => update({ bold: !node.bold })}
              className={`p-1.5 rounded cursor-pointer ${
                node.bold ? 'bg-purple-600 text-white' : 'text-neutral-300 hover:bg-[#34343A]'
              }`}
              title="Bold"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => update({ italic: !node.italic })}
              className={`p-1.5 rounded cursor-pointer ${
                node.italic ? 'bg-purple-600 text-white' : 'text-neutral-300 hover:bg-[#34343A]'
              }`}
              title="Italic"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => update({ underline: !node.underline })}
              className={`p-1.5 rounded cursor-pointer ${
                node.underline ? 'bg-purple-600 text-white' : 'text-neutral-300 hover:bg-[#34343A]'
              }`}
              title="Underline"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => update({ strikethrough: !node.strikethrough })}
              className={`p-1.5 rounded cursor-pointer ${
                node.strikethrough ? 'bg-purple-600 text-white' : 'text-neutral-300 hover:bg-[#34343A]'
              }`}
              title="Strikethrough"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 7. Alignment */}
      <div className="relative">
        <button
          onClick={() => setActiveDropdown(activeDropdown === 'align' ? null : 'align')}
          className="flex items-center gap-0.5 px-1.5 py-1 rounded hover:bg-[#2D2D32] transition-colors cursor-pointer"
          title="Alignment"
        >
          {node.textAlign === 'left' ? (
            <AlignLeft className="w-3.5 h-3.5" />
          ) : node.textAlign === 'center' ? (
            <AlignCenter className="w-3.5 h-3.5" />
          ) : (
            <AlignRight className="w-3.5 h-3.5" />
          )}
          <ChevronDown className="w-2.5 h-2.5 opacity-60" />
        </button>

        {activeDropdown === 'align' && (
          <div className="absolute top-full left-0 mt-2 bg-[#242428] border border-[#3A3A40] rounded-lg shadow-xl p-1 z-50 flex gap-0.5">
            {(['left', 'center', 'right'] as TextAlign[]).map((a) => (
              <button
                key={a}
                onClick={() => {
                  update({ textAlign: a });
                  setActiveDropdown(null);
                }}
                className={`p-1.5 rounded cursor-pointer ${
                  node.textAlign === a ? 'bg-purple-600 text-white' : 'text-neutral-300 hover:bg-[#34343A]'
                }`}
              >
                {a === 'left' ? (
                  <AlignLeft className="w-3.5 h-3.5" />
                ) : a === 'center' ? (
                  <AlignCenter className="w-3.5 h-3.5" />
                ) : (
                  <AlignRight className="w-3.5 h-3.5" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-[1px] h-4 bg-[#38383D] mx-0.5" />

      {/* 8. Link */}
      <div className="relative">
        <button
          onClick={() => setActiveDropdown(activeDropdown === 'link' ? null : 'link')}
          className={`p-1.5 rounded hover:bg-[#2D2D32] transition-colors cursor-pointer ${
            node.link ? 'text-purple-400' : 'text-neutral-300'
          }`}
          title="Insert Link"
        >
          <Link className="w-3.5 h-3.5" />
        </button>

        {activeDropdown === 'link' && (
          <form
            onSubmit={handleSaveLink}
            className="absolute top-full left-0 mt-2 bg-[#242428] border border-[#3A3A40] rounded-xl shadow-2xl p-3 z-50 w-64 space-y-2 text-xs"
          >
            <div className="font-semibold text-neutral-200">Insert Web Link</div>
            <input
              type="text"
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-[#1B1B1E] border border-[#3A3A40] rounded text-white text-xs focus:outline-none focus:border-purple-500"
              autoFocus
            />
            <input
              type="text"
              placeholder="Display title (optional)"
              value={linkTitle}
              onChange={(e) => setLinkTitle(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-[#1B1B1E] border border-[#3A3A40] rounded text-white text-xs focus:outline-none focus:border-purple-500"
            />
            <div className="flex justify-between items-center pt-1">
              {node.link && (
                <button
                  type="button"
                  onClick={() => {
                    update({ link: undefined });
                    setLinkUrl('');
                    setActiveDropdown(null);
                  }}
                  className="text-red-400 hover:underline text-[11px] cursor-pointer"
                >
                  Remove
                </button>
              )}
              <div className="flex gap-1.5 ml-auto">
                <button
                  type="button"
                  onClick={() => setActiveDropdown(null)}
                  className="px-2 py-1 text-neutral-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded font-medium cursor-pointer"
                >
                  Save
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* 9. Attached Document */}
      <button
        onClick={() => onOpenDocument(node)}
        className={`p-1.5 rounded hover:bg-[#2D2D32] transition-colors cursor-pointer ${
          node.document ? 'text-purple-400' : 'text-neutral-300'
        }`}
        title="Open Attached Document & Notes"
      >
        <FileText className="w-3.5 h-3.5" />
      </button>

      {/* 10. Image & Frame Zoom / Height Controls */}
      <div className="relative">
        <button
          onClick={() => setActiveDropdown(activeDropdown === 'image' ? null : 'image')}
          className={`p-1.5 rounded hover:bg-[#2D2D32] transition-colors cursor-pointer ${
            node.image ? 'text-purple-400' : 'text-neutral-300'
          }`}
          title="Image & Frame Controls"
        >
          <ImageIcon className="w-3.5 h-3.5" />
        </button>

        {activeDropdown === 'image' && (
          <div className="absolute top-full left-0 mt-2 bg-[#242428] border border-[#3A3A40] rounded-xl shadow-2xl p-3 z-50 w-72 space-y-3 text-xs">
            <div className="font-semibold text-neutral-200">Image & Frame Settings</div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {node.image ? (
              <div className="space-y-3">
                {/* Frame Height Slider */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-neutral-400 text-[11px]">
                    <span>Frame Height</span>
                    <span className="font-mono text-purple-400">{node.image.height || 180}px</span>
                  </div>
                  <input
                    type="range"
                    min="80"
                    max="450"
                    step="10"
                    value={node.image.height || 180}
                    onChange={(e) =>
                      update({
                        image: {
                          ...node.image!,
                          height: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>

                {/* Frame Zoom */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-neutral-400 text-[11px]">
                    <span>Image Zoom In/Out</span>
                    <span className="font-mono text-purple-400">
                      {Math.round((node.image.zoom || 1) * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        update({
                          image: {
                            ...node.image!,
                            zoom: Math.max(0.4, (node.image!.zoom || 1) - 0.1),
                          },
                        })
                      }
                      className="p-1 rounded bg-[#34343A] hover:bg-[#3E3E46] cursor-pointer"
                    >
                      <ZoomOut className="w-3 h-3" />
                    </button>
                    <input
                      type="range"
                      min="0.4"
                      max="3.0"
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
                      className="flex-1 accent-purple-500 cursor-pointer"
                    />
                    <button
                      onClick={() =>
                        update({
                          image: {
                            ...node.image!,
                            zoom: Math.min(3.0, (node.image!.zoom || 1) + 0.1),
                          },
                        })
                      }
                      className="p-1 rounded bg-[#34343A] hover:bg-[#3E3E46] cursor-pointer"
                    >
                      <ZoomIn className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Fit Mode */}
                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-neutral-400">Fit Mode</span>
                  <div className="flex gap-1">
                    {[
                      { key: 'auto', label: 'Auto (No Crop)' },
                      { key: 'contain', label: 'Fit' },
                      { key: 'cover', label: 'Fill' },
                    ].map((m) => (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => {
                          const fitKey = m.key as 'auto' | 'contain' | 'cover';
                          const autoH =
                            fitKey === 'auto' && node.image?.naturalAspectRatio
                              ? Math.round((node.width || 180) / node.image.naturalAspectRatio)
                              : node.image?.height || 180;

                          update({
                            image: {
                              ...node.image!,
                              fit: fitKey,
                              height: autoH,
                              panX: fitKey === 'auto' ? 0 : node.image?.panX || 0,
                              panY: fitKey === 'auto' ? 0 : node.image?.panY || 0,
                            },
                          });
                        }}
                        className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                          (node.image?.fit || 'cover') === m.key
                            ? 'bg-purple-600 text-white font-medium'
                            : 'bg-[#34343A] text-neutral-300 hover:text-white'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reset Zoom & Pan */}
                <div className="flex justify-end pt-0.5">
                  <button
                    type="button"
                    onClick={() =>
                      update({
                        image: {
                          ...node.image!,
                          zoom: 1,
                          panX: 0,
                          panY: 0,
                        },
                      })
                    }
                    className="text-[11px] text-neutral-400 hover:text-purple-400 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Position & Zoom</span>
                  </button>
                </div>

                <div className="flex justify-between pt-1 border-t border-[#3A3A40]">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-purple-400 hover:underline cursor-pointer text-[11px]"
                  >
                    Replace Image
                  </button>
                  <button
                    onClick={() => update({ image: undefined })}
                    className="text-red-400 hover:underline cursor-pointer text-[11px]"
                  >
                    Remove Image
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-3 border border-dashed border-[#44444C] hover:border-purple-500 rounded-lg text-neutral-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Upload Image to Node</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 11. Sticky Note */}
      <button
        onClick={() => onAddStickyNote(node.id)}
        className="p-1.5 rounded hover:bg-[#2D2D32] text-amber-400 transition-colors cursor-pointer"
        title="Add connected sticky note (dashed connector)"
      >
        <StickyNote className="w-3.5 h-3.5" />
      </button>

      {/* 12. Connector Style Toggle */}
      {onToggleConnectorStyle && (
        <div className="relative">
          <button
            onClick={() => setActiveDropdown(activeDropdown === 'connector' ? null : 'connector')}
            className="flex items-center gap-0.5 px-1.5 py-1 rounded hover:bg-[#2D2D32] transition-colors cursor-pointer text-neutral-300"
            title="Line Style (Solid / Putus-putus)"
          >
            <Spline className="w-3.5 h-3.5" />
            <ChevronDown className="w-2.5 h-2.5 opacity-60" />
          </button>

          {activeDropdown === 'connector' && (
            <div className="absolute top-full left-0 mt-2 bg-[#242428] border border-[#3A3A40] rounded-lg shadow-xl p-1 z-50 w-32 space-y-0.5 text-xs">
              <button
                onClick={() => {
                  onToggleConnectorStyle('solid');
                  setActiveDropdown(null);
                }}
                className="w-full text-left px-2 py-1.5 rounded hover:bg-[#34343A] cursor-pointer flex items-center gap-2"
              >
                <div className="w-5 h-[2px] bg-white" />
                <span>Solid</span>
              </button>
              <button
                onClick={() => {
                  onToggleConnectorStyle('dashed');
                  setActiveDropdown(null);
                }}
                className="w-full text-left px-2 py-1.5 rounded hover:bg-[#34343A] cursor-pointer flex items-center gap-2 text-purple-400 font-medium"
              >
                <div className="w-5 h-[2px] border-b-2 border-dashed border-purple-400" />
                <span>Dashed (Putus)</span>
              </button>
              <button
                onClick={() => {
                  onToggleConnectorStyle('dotted');
                  setActiveDropdown(null);
                }}
                className="w-full text-left px-2 py-1.5 rounded hover:bg-[#34343A] cursor-pointer flex items-center gap-2"
              >
                <div className="w-5 h-[2px] border-b-2 border-dotted border-white" />
                <span>Dotted</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 13. More Options */}
      <div className="relative">
        <button
          onClick={() => setActiveDropdown(activeDropdown === 'more' ? null : 'more')}
          className="p-1.5 rounded hover:bg-[#2D2D32] text-neutral-300 transition-colors cursor-pointer"
          title="More options"
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>

        {activeDropdown === 'more' && (
          <div className="absolute top-full right-0 mt-2 bg-[#242428] border border-[#3A3A40] rounded-xl shadow-2xl p-1 z-50 w-44 space-y-0.5 text-xs">
            <button
              onClick={() => {
                update({ isParent: !node.isParent });
                setActiveDropdown(null);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#34343A] cursor-pointer flex items-center gap-2 text-neutral-200"
            >
              <GitBranch className="w-3.5 h-3.5 text-purple-400" />
              <span>{node.isParent ? 'Normal Node' : 'Make Root Parent'}</span>
            </button>
            <button
              onClick={() => {
                onDuplicateNode(node);
                setActiveDropdown(null);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#34343A] cursor-pointer flex items-center gap-2 text-neutral-200"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Duplicate Node</span>
            </button>
            <div className="h-[1px] bg-[#3A3A40] my-1" />
            <button
              onClick={() => {
                onDeleteNode(node.id);
                setActiveDropdown(null);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded hover:bg-red-950/60 text-red-400 cursor-pointer flex items-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Node</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
