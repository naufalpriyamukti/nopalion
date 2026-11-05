import React, { useState } from 'react';
import { parseNotionOutlineToMindmap } from '../lib/notionParser';
import { MindmapNode, NodeConnection } from '../types/mindmap';
import { X, Sparkles, FileText, Check, Copy, ArrowRight, Key } from 'lucide-react';

interface NotionImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  onImportGenerated: (nodes: MindmapNode[], connections: NodeConnection[]) => void;
}

const NOTION_TEMPLATES: Record<string, { label: string; text: string }> = {
  architecture: {
    label: 'System Architecture',
    text: `Nopalion Platform Architecture
  Frontend Tier (React 19 + Vite)
    Canvas Vector Geometry Engine
    Notion-Style Markdown Drawer
    Multi-directional Bezier Mesh
  Notion Embedded Integration
    Slash Command /embed Handler
    URL Parameter & Token Auth
    Markdown Hierarchy Parser
  Supabase Cloud Database
    PostgreSQL Schemas & Migrations
    Row Level Security (RLS)
    Realtime Mindmap Synchronization
  Hosting & Edge
    Vercel Edge Network
    Self-hosted Ready`,
  },
  roadmap: {
    label: 'Product Roadmap',
    text: `Product Roadmap 2026
  Q1: Foundation
    Multi-parent Mindmaps
    Color Themes & Typography
    Image Frame Zoom & Resizing
  Q2: Notion Ecosystem
    Embedded Frame Code
    Toggle Block Import
    Shared Workspace Tokens
  Q3: Collaboration
    Multi-user Live Cursors
    Sticky Note Reactions
    PDF & SVG Export`,
  },
  brainstorm: {
    label: 'Brainstorming & Ideas',
    text: `Growth Strategy
  Organic Acquisition
    Notion Community Templates
    Interactive Live Demos
    Developer Documentation
  Product Led Growth
    One-click Notion Embeds
    Zero-config Vercel Deploy
    Fast Canvas Performance
  Retention
    Personal Knowledge Graphs
    Daily Workspaces`,
  },
};

export const NotionImportModal: React.FC<NotionImportModalProps> = ({
  isOpen,
  onClose,
  workspaceId,
  onImportGenerated,
}) => {
  const [activeTab, setActiveTab] = useState<'paste' | 'token'>('paste');
  const [notionText, setNotionText] = useState(NOTION_TEMPLATES.architecture.text);
  const [notionToken, setNotionToken] = useState(
    () => localStorage.getItem('nopalion_notion_token') || ''
  );
  const [savedTokenMsg, setSavedTokenMsg] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notionText.trim()) return;

    const { nodes, connections } = parseNotionOutlineToMindmap(
      notionText.trim(),
      workspaceId,
      360,
      200
    );

    if (nodes.length > 0) {
      onImportGenerated(nodes, connections);
      onClose();
    }
  };

  const handleSaveToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (notionToken.trim()) {
      localStorage.setItem('nopalion_notion_token', notionToken.trim());
      setSavedTokenMsg(true);
      setTimeout(() => setSavedTokenMsg(false), 2000);
    } else {
      localStorage.removeItem('nopalion_notion_token');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white dark:bg-[#202020] text-[#37352F] dark:text-[#E6E6E5] border border-[#E9E9E7] dark:border-[#2E2E2E] rounded-xl shadow-2xl p-6 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E9E9E7] dark:border-[#2E2E2E]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-[#242426] text-white flex items-center justify-center text-xs font-bold font-serif">
              N
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Create Mind Map from Notion</h2>
              <p className="text-xs text-[#787774] dark:text-[#9B9A97]">
                Import Notion outlines, toggle lists, or connect your Notion integration
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#787774] hover:text-[#37352F] dark:hover:text-white rounded hover:bg-[#F1F1EF] dark:hover:bg-[#2B2B2B] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex p-1 bg-[#F1F1EF] dark:bg-[#2B2B2B] rounded-lg my-4 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`flex-1 py-1.5 rounded-md transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'paste'
                ? 'bg-white dark:bg-[#1E1E20] text-[#37352F] dark:text-[#E6E6E5] shadow-xs'
                : 'text-[#787774] dark:text-[#9B9A97] hover:text-[#37352F]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Paste Notion Content</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('token')}
            className={`flex-1 py-1.5 rounded-md transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'token'
                ? 'bg-white dark:bg-[#1E1E20] text-[#37352F] dark:text-[#E6E6E5] shadow-xs'
                : 'text-[#787774] dark:text-[#9B9A97] hover:text-[#37352F]'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Notion Integration Token</span>
          </button>
        </div>

        {activeTab === 'paste' ? (
          <form onSubmit={handleGenerate} className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#787774] dark:text-[#9B9A97]">
                Paste your bullet list, toggle list, or outline from Notion:
              </span>
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="text-[#9B9A97]">Templates:</span>
                <button
                  type="button"
                  onClick={() => setNotionText(NOTION_TEMPLATES.architecture.text)}
                  className="text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                >
                  Architecture
                </button>
                <span className="text-neutral-300">·</span>
                <button
                  type="button"
                  onClick={() => setNotionText(NOTION_TEMPLATES.roadmap.text)}
                  className="text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                >
                  Roadmap
                </button>
                <span className="text-neutral-300">·</span>
                <button
                  type="button"
                  onClick={() => setNotionText(NOTION_TEMPLATES.brainstorm.text)}
                  className="text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                >
                  Brainstorm
                </button>
              </div>
            </div>

            <textarea
              value={notionText}
              onChange={(e) => setNotionText(e.target.value)}
              placeholder={`• Main Topic\n  • Subtopic A\n    • Detail 1\n    • Detail 2\n  • Subtopic B`}
              rows={8}
              className="w-full p-3 text-xs font-mono bg-[#FBFBFA] dark:bg-[#181818] border border-[#E9E9E7] dark:border-[#2E2E2E] rounded-lg focus:outline-none focus:border-purple-600 text-[#37352F] dark:text-[#E6E6E5] leading-relaxed"
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-[#9B9A97]">
                Automatic indentation & bullet level detection
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 text-xs text-[#787774] hover:text-[#37352F] rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!notionText.trim()}
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium disabled:opacity-40 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Mind Map</span>
                </button>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSaveToken} className="space-y-4 py-2">
            <div className="p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 rounded-lg text-xs text-purple-900 dark:text-purple-200">
              Connect your Notion workspace integration to sync database pages and blocks directly.
            </div>

            <div>
              <label className="block text-xs font-medium text-[#787774] dark:text-[#9B9A97] mb-1">
                Notion Internal Integration Token (secret_...)
              </label>
              <input
                type="password"
                value={notionToken}
                onChange={(e) => setNotionToken(e.target.value)}
                placeholder="secret_abc123xyz..."
                className="w-full px-3 py-2 text-xs font-mono bg-[#FBFBFA] dark:bg-[#181818] border border-[#E9E9E7] dark:border-[#2E2E2E] rounded-lg focus:outline-none focus:border-purple-600 text-[#37352F] dark:text-[#E6E6E5]"
              />
              <p className="text-[11px] text-[#9B9A97] mt-1">
                Obtain from <a href="https://www.notion.so/my-integrations" target="_blank" rel="noreferrer" className="text-purple-600 underline">notion.so/my-integrations</a>
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-[#787774] hover:text-[#37352F] rounded cursor-pointer"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#242426] text-white rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {savedTokenMsg ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Save Integration Token</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
