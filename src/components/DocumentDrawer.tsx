import React, { useState, useEffect } from 'react';
import { NodeDocument } from '../types/mindmap';
import { X, CheckSquare, Plus, Trash2, FileText, Calendar } from 'lucide-react';

interface DocumentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  document: NodeDocument | null;
  nodeTitle: string;
  onSaveDocument: (doc: NodeDocument | null) => void;
}

export const DocumentDrawer: React.FC<DocumentDrawerProps> = ({
  isOpen,
  onClose,
  document,
  nodeTitle,
  onSaveDocument,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [checklists, setChecklists] = useState<{ id: string; text: string; done: boolean }[]>([]);
  const [newChecklistText, setNewChecklistText] = useState('');

  useEffect(() => {
    if (document) {
      setTitle(document.title || `Notes on ${nodeTitle}`);
      setContent(document.content || '');
      setChecklists(document.checklists || []);
    } else {
      setTitle(`Notes on ${nodeTitle}`);
      setContent('');
      setChecklists([]);
    }
  }, [document, nodeTitle, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!content.trim() && checklists.length === 0 && !title.trim()) {
      onSaveDocument(null);
    } else {
      onSaveDocument({
        title: title.trim() || nodeTitle,
        content,
        checklists,
        updatedAt: new Date().toISOString(),
      });
    }
    onClose();
  };

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;
    setChecklists([
      ...checklists,
      {
        id: 'chk-' + Date.now(),
        text: newChecklistText.trim(),
        done: false,
      },
    ]);
    setNewChecklistText('');
  };

  const handleToggleChecklist = (id: string) => {
    setChecklists(
      checklists.map((c) => (c.id === id ? { ...c, done: !c.done } : c))
    );
  };

  const handleDeleteChecklist = (id: string) => {
    setChecklists(checklists.filter((c) => c.id !== id));
  };

  const handleDeleteAll = () => {
    onSaveDocument(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
      <div className="w-full max-w-xl h-full bg-[#FFFFFF] dark:bg-[#1E1E1E] text-[#37352F] dark:text-[#E6E6E5] border-l border-[#E9E9E7] dark:border-[#2E2E2E] shadow-2xl flex flex-col font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E9E9E7] dark:border-[#2E2E2E]">
          <div className="flex items-center gap-2 text-sm text-[#787774] dark:text-[#9B9A97]">
            <FileText className="w-4 h-4 text-[#2383E2]" />
            <span className="truncate max-w-[280px]">Node Document · {nodeTitle}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDeleteAll}
              title="Remove document from node"
              className="p-1.5 text-xs text-red-500 hover:text-red-700 rounded hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-[#37352F] hover:bg-[#202020] dark:bg-[#E6E6E5] dark:hover:bg-white text-white dark:text-[#191919] rounded-md text-xs font-medium cursor-pointer shadow-xs"
            >
              Done & Save
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#787774] hover:text-[#37352F] dark:hover:text-white rounded hover:bg-[#F1F1EF] dark:hover:bg-[#2B2B2B] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Document Body */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          {/* Document Title input like Notion page title */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled Document"
              className="w-full text-2xl font-bold font-serif tracking-tight bg-transparent border-0 focus:outline-none placeholder-[#9B9A97] text-[#37352F] dark:text-[#E6E6E5]"
            />
            <div className="flex items-center gap-2 text-[11px] text-[#9B9A97] mt-1">
              <Calendar className="w-3 h-3" />
              <span>
                {document?.updatedAt
                  ? `Last edited on ${new Date(document.updatedAt).toLocaleDateString()}`
                  : 'New attached document'}
              </span>
            </div>
          </div>

          {/* Markdown Content Area */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#787774] dark:text-[#9B9A97]">
              Content & Structured Notes
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type your structured notes, specifications, or markdown here..."
              rows={10}
              className="w-full p-3.5 text-sm font-sans bg-[#FBFBFA] dark:bg-[#181818] border border-[#E9E9E7] dark:border-[#2E2E2E] rounded-lg focus:outline-none focus:border-[#2383E2] text-[#37352F] dark:text-[#E6E6E5] leading-relaxed resize-y"
            />
          </div>

          {/* Actionable Checklists Section */}
          <div className="space-y-3 pt-4 border-t border-[#F1F1EF] dark:border-[#282828]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#787774] dark:text-[#9B9A97] flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Action Checklist</span>
              </span>
              <span className="text-[11px] text-[#9B9A97]">
                {checklists.filter((c) => c.done).length} / {checklists.length} completed
              </span>
            </div>

            {/* Checklist items */}
            <div className="space-y-1.5">
              {checklists.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between group p-2 rounded-md hover:bg-[#F7F7F5] dark:hover:bg-[#252525] transition-colors"
                >
                  <label className="flex items-center gap-2.5 cursor-pointer flex-1 mr-2">
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => handleToggleChecklist(item.id)}
                      className="w-4 h-4 rounded border-[#D3D3D0] text-[#2383E2] focus:ring-0 cursor-pointer"
                    />
                    <span
                      className={`text-sm ${
                        item.done
                          ? 'line-through text-[#9B9A97]'
                          : 'text-[#37352F] dark:text-[#E6E6E5]'
                      }`}
                    >
                      {item.text}
                    </span>
                  </label>
                  <button
                    onClick={() => handleDeleteChecklist(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 rounded transition-opacity cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add checklist item form */}
            <form onSubmit={handleAddChecklist} className="flex gap-2 pt-1">
              <input
                type="text"
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                placeholder="Add checklist item..."
                className="flex-1 px-3 py-1.5 text-xs bg-[#FBFBFA] dark:bg-[#181818] border border-[#E9E9E7] dark:border-[#2E2E2E] rounded-md focus:outline-none focus:border-[#2383E2] text-[#37352F] dark:text-[#E6E6E5]"
              />
              <button
                type="submit"
                disabled={!newChecklistText.trim()}
                className="px-3 py-1.5 text-xs bg-[#37352F] dark:bg-[#E6E6E5] text-white dark:text-[#191919] font-medium rounded-md disabled:opacity-40 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
