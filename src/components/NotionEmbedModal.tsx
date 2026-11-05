import React, { useState } from 'react';
import { X, Copy, Check, Code, ExternalLink, Globe } from 'lucide-react';

interface NotionEmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
}

export const NotionEmbedModal: React.FC<NotionEmbedModalProps> = ({
  isOpen,
  onClose,
  workspaceId,
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedIframe, setCopiedIframe] = useState(false);

  if (!isOpen) return null;

  const currentOrigin = window.location.origin;
  const embedUrl = `${currentOrigin}/?embed=true&ws=${workspaceId}`;
  const iframeCode = `<iframe\n  src="${embedUrl}"\n  width="100%"\n  height="650"\n  frameborder="0"\n  allow="clipboard-write"\n  allowfullscreen\n  style="border: 1px solid rgba(0,0,0,0.08); border-radius: 8px;"\n></iframe>`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(embedUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyIframe = () => {
    navigator.clipboard.writeText(iframeCode);
    setCopiedIframe(true);
    setTimeout(() => setCopiedIframe(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-[#202020] text-[#37352F] dark:text-[#E6E6E5] border border-[#E9E9E7] dark:border-[#2E2E2E] rounded-xl shadow-2xl p-6 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E9E9E7] dark:border-[#2E2E2E]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 rounded-lg">
              <Code className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Embed in Notion</h2>
              <p className="text-xs text-[#787774] dark:text-[#9B9A97]">
                Connect this live mindmap directly into your Notion pages
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

        <div className="py-4 space-y-4">
          {/* Quick Step Guide */}
          <div className="p-3 bg-[#FBFBFA] dark:bg-[#181818] border border-[#E9E9E7] dark:border-[#2E2E2E] rounded-lg space-y-1.5 text-xs">
            <span className="font-semibold text-purple-600 dark:text-purple-400">
              How to embed inside Notion:
            </span>
            <ol className="list-decimal list-inside space-y-1 text-[#5A5853] dark:text-[#9B9A97]">
              <li>Open any page in Notion and type <code className="font-mono bg-neutral-200 dark:bg-neutral-800 px-1 rounded">/embed</code>.</li>
              <li>Paste the link below into the Notion embed box and press Enter.</li>
              <li>Your Nopalion mind map will render live and interactive inside Notion!</li>
            </ol>
          </div>

          {/* Option 1: Direct Embed Link */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#787774] dark:text-[#9B9A97]">
              1. Notion Embed Link (Recommended)
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                readOnly
                value={embedUrl}
                className="flex-1 px-3 py-1.5 text-xs font-mono bg-[#FBFBFA] dark:bg-[#181818] border border-[#E9E9E7] dark:border-[#2E2E2E] rounded-lg text-[#37352F] dark:text-[#E6E6E5] select-all"
              />
              <button
                onClick={handleCopyUrl}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors shrink-0"
              >
                {copiedUrl ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Option 2: Embed Code / iFrame */}
          <div className="space-y-1.5 pt-2 border-t border-[#E9E9E7] dark:border-[#2E2E2E]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#787774] dark:text-[#9B9A97]">
                2. Embedded HTML Code (iFrame)
              </label>
              <button
                onClick={handleCopyIframe}
                className="text-xs text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedIframe ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-500" />
                    <span>Copied iFrame Code!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy iFrame</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              readOnly
              rows={4}
              value={iframeCode}
              className="w-full p-2.5 text-xs font-mono bg-[#FBFBFA] dark:bg-[#181818] border border-[#E9E9E7] dark:border-[#2E2E2E] rounded-lg text-[#37352F] dark:text-[#E6E6E5] leading-relaxed resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
