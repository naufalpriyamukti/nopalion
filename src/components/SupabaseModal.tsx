import React, { useState } from 'react';
import {
  getStoredSupabaseConfig,
  saveStoredSupabaseConfig,
  isSupabaseConfigured,
  SUPABASE_SQL_MIGRATION,
} from '../lib/supabaseClient';
import { X, Check, Copy, Database, ExternalLink, HelpCircle } from 'lucide-react';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose }) => {
  const currentConfig = getStoredSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey);
  const [copiedSql, setCopiedSql] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredSupabaseConfig(url.trim(), anonKey.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_MIGRATION);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const isConfigured = isSupabaseConfigured();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white dark:bg-[#202020] text-[#37352F] dark:text-[#E6E6E5] border border-[#E9E9E7] dark:border-[#2E2E2E] rounded-xl shadow-2xl p-6 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E9E9E7] dark:border-[#2E2E2E]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Supabase & Vercel Integration</h2>
              <p className="text-xs text-[#787774] dark:text-[#9B9A97]">
                Connect your database for real-time cloud sync and self-hosting
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

        {/* Content */}
        <div className="py-4 space-y-5">
          {/* Status banner */}
          <div
            className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
              isConfigured
                ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                : 'bg-neutral-50 dark:bg-[#191919] border-[#E9E9E7] dark:border-[#2E2E2E] text-[#787774] dark:text-[#9B9A97]'
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isConfigured ? 'bg-emerald-500' : 'bg-neutral-400'
                }`}
              />
              <span className="font-medium">
                {isConfigured
                  ? 'Connected to Supabase PostgreSQL Database'
                  : 'Running in Local Mode (Ready for Supabase credentials)'}
              </span>
            </div>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:underline text-[#2383E2]"
            >
              <span>Supabase Console</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Configuration Form */}
          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#787774] dark:text-[#9B9A97] mb-1">
                Supabase Project URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-project.supabase.co"
                className="w-full px-3 py-2 text-xs font-mono bg-[#FBFBFA] dark:bg-[#181818] border border-[#E9E9E7] dark:border-[#2E2E2E] rounded-lg focus:outline-none focus:border-[#2383E2] text-[#37352F] dark:text-[#E6E6E5]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#787774] dark:text-[#9B9A97] mb-1">
                Supabase Anon / Public API Key
              </label>
              <input
                type="password"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3 py-2 text-xs font-mono bg-[#FBFBFA] dark:bg-[#181818] border border-[#E9E9E7] dark:border-[#2E2E2E] rounded-lg focus:outline-none focus:border-[#2383E2] text-[#37352F] dark:text-[#E6E6E5]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-[#787774] hover:text-[#37352F] rounded cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs bg-[#37352F] dark:bg-[#E6E6E5] text-white dark:text-[#191919] font-medium rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Save Configuration</span>
                )}
              </button>
            </div>
          </form>

          {/* Database Schema Setup & Copy */}
          <div className="pt-4 border-t border-[#E9E9E7] dark:border-[#2E2E2E] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#787774] dark:text-[#9B9A97]">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Supabase SQL Migration Script</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    const blob = new Blob([SUPABASE_SQL_MIGRATION], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'supabase_schema.sql';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs bg-[#F1F1EF] dark:bg-[#2B2B2B] hover:bg-[#EAEAEA] dark:hover:bg-[#333333] rounded text-[#37352F] dark:text-[#E6E6E5] font-medium transition-colors cursor-pointer"
                  title="Download supabase_schema.sql file"
                >
                  <span>Download .sql</span>
                </button>
                <button
                  onClick={handleCopySql}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded font-medium transition-colors cursor-pointer"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy SQL Schema</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-[#9B9A97] leading-relaxed">
              When hosting on Vercel, copy this schema or execute <code className="font-mono text-[#37352F] dark:text-[#E6E6E5]">supabase_schema.sql</code> in your Supabase Dashboard
              (SQL Editor). It provisions <code className="font-mono text-[#37352F] dark:text-[#E6E6E5]">accounts</code>, <code className="font-mono text-[#37352F] dark:text-[#E6E6E5]">workspaces</code>, <code className="font-mono text-[#37352F] dark:text-[#E6E6E5]">nodes</code>, and <code className="font-mono text-[#37352F] dark:text-[#E6E6E5]">connections</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
