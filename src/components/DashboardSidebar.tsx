import React, { useState } from 'react';
import { UserProfile, Workspace } from '../types/mindmap';
import {
  FolderPlus,
  Trash2,
  Copy,
  Moon,
  Sun,
  LogOut,
  ChevronLeft,
  Search,
} from 'lucide-react';

interface DashboardSidebarProps {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  onSelectWorkspace: (id: string) => void;
  onCreateWorkspace: (name: string, icon: string) => void;
  onDeleteWorkspace: (id: string) => void;
  onDuplicateWorkspace: (id: string) => void;
  user: UserProfile;
  onLogout: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onCreateWorkspace,
  onDeleteWorkspace,
  onDuplicateWorkspace,
  user,
  onLogout,
  isDark,
  onToggleTheme,
  isOpen,
  onToggleOpen,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newIcon, setNewIcon] = useState('⚡');

  const filteredWorkspaces = workspaces.filter((ws) =>
    ws.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onCreateWorkspace(newTitle.trim(), newIcon);
    setNewTitle('');
    setIsCreating(false);
  };

  const sampleIcons = ['⚡', '🧠', '🗺️', '🚀', '💡', '📊', '📐', '🎯', '📚'];

  if (!isOpen) {
    return null;
  }

  return (
    <aside className="w-64 h-screen shrink-0 bg-[#F7F7F5] dark:bg-[#202020] border-r border-[#E9E9E7] dark:border-[#2E2E2E] flex flex-col justify-between font-sans select-none z-30 transition-all">
      {/* Top Section */}
      <div className="p-3 flex flex-col gap-3 flex-1 overflow-hidden">
        {/* Workspace Brand Header - Nopalion */}
        <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-[#E9E9E7] dark:border-[#2E2E2E]">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-6 h-6 rounded bg-[#242426] dark:bg-[#E6E6E5] text-white dark:text-[#191919] flex items-center justify-center text-xs font-serif font-bold shadow-xs">
              N
            </div>
            <span className="font-semibold text-sm text-[#37352F] dark:text-[#E6E6E5] tracking-tight">
              Nopalion
            </span>
          </div>

          <button
            onClick={onToggleOpen}
            title="Collapse Sidebar"
            className="p-1 text-[#787774] dark:text-[#9B9A97] hover:text-[#37352F] dark:hover:text-[#E6E6E5] rounded hover:bg-[#EAEAEA] dark:hover:bg-[#2B2B2B] transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#9B9A97]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search workspaces..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-[#191919] border border-[#E9E9E7] dark:border-[#2E2E2E] rounded-md text-[#37352F] dark:text-[#E6E6E5] placeholder-[#9B9A97] focus:outline-none focus:border-purple-600"
          />
        </div>

        {/* Workspaces List Header & New Action */}
        <div className="flex items-center justify-between px-2 text-xs font-medium text-[#787774] dark:text-[#9B9A97]">
          <span>Workspaces</span>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-1 hover:text-[#37352F] dark:hover:text-[#E6E6E5] p-1 rounded hover:bg-[#EAEAEA] dark:hover:bg-[#2B2B2B] transition-colors cursor-pointer"
            title="New Workspace"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>

        {/* Create workspace inline form */}
        {isCreating && (
          <form
            onSubmit={handleCreateSubmit}
            className="p-2.5 bg-white dark:bg-[#191919] border border-[#E9E9E7] dark:border-[#2E2E2E] rounded-lg space-y-2 shadow-xs"
          >
            <div className="flex items-center gap-2">
              <select
                value={newIcon}
                onChange={(e) => setNewIcon(e.target.value)}
                className="text-base bg-transparent border-0 cursor-pointer focus:outline-none"
              >
                {sampleIcons.map((ic) => (
                  <option key={ic} value={ic}>
                    {ic}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Workspace name..."
                autoFocus
                className="flex-1 text-xs px-2 py-1 bg-transparent border-b border-[#E9E9E7] dark:border-[#2E2E2E] focus:outline-none focus:border-purple-600 text-[#37352F] dark:text-[#E6E6E5]"
              />
            </div>
            <div className="flex justify-end gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-2 py-1 text-[11px] text-[#787774] hover:text-[#37352F] rounded cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newTitle.trim()}
                className="px-2.5 py-1 text-[11px] bg-[#242426] text-white rounded font-medium disabled:opacity-40 cursor-pointer"
              >
                Create
              </button>
            </div>
          </form>
        )}

        {/* Workspaces Scrollable List */}
        <div className="flex-1 overflow-y-auto space-y-0.5 pr-1">
          {filteredWorkspaces.map((ws) => {
            const isActive = ws.id === activeWorkspaceId;
            return (
              <div
                key={ws.id}
                onClick={() => onSelectWorkspace(ws.id)}
                className={`group flex items-center justify-between px-2.5 py-2 rounded-md text-xs cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-white dark:bg-[#2B2B2B] text-[#37352F] dark:text-[#E6E6E5] shadow-xs font-medium'
                    : 'text-[#5A5853] dark:text-[#9B9A97] hover:bg-[#EAEAEA] dark:hover:bg-[#282828] hover:text-[#37352F] dark:hover:text-[#E6E6E5]'
                }`}
              >
                <div className="flex items-center gap-2 truncate flex-1 mr-2">
                  <span className="text-sm shrink-0">{ws.icon || '⚡'}</span>
                  <span className="truncate">{ws.name}</span>
                </div>

                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicateWorkspace(ws.id);
                    }}
                    title="Duplicate workspace"
                    className="p-1 hover:text-[#37352F] dark:hover:text-white rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  {workspaces.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteWorkspace(ws.id);
                      }}
                      title="Delete workspace"
                      className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Profile Section */}
      <div className="p-3 border-t border-[#E9E9E7] dark:border-[#2E2E2E] bg-white/50 dark:bg-[#1C1C1C]/60 flex items-center justify-between">
        <div className="flex items-center gap-2 truncate mr-2">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-7 h-7 rounded-full bg-[#EAEAEA] shrink-0"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-[#242426] text-white flex items-center justify-center text-xs font-bold shrink-0">
              {user.name.charAt(0)}
            </div>
          )}
          <div className="truncate">
            <div className="text-xs font-semibold text-[#37352F] dark:text-[#E6E6E5] truncate">
              {user.name}
            </div>
            <div className="text-[10px] text-[#787774] dark:text-[#9B9A97] truncate">
              {user.email}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onToggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-1.5 rounded hover:bg-[#EAEAEA] dark:hover:bg-[#2B2B2B] text-[#787774] dark:text-[#9B9A97] hover:text-[#37352F] dark:hover:text-[#E6E6E5] cursor-pointer transition-colors"
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onLogout}
            title="Log out"
            className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/40 text-[#787774] hover:text-red-600 dark:hover:text-red-400 cursor-pointer transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
