import React, { useState, useEffect } from 'react';
import { UserProfile, MindmapNode, NodeConnection } from '../types/mindmap';
import { isSupabaseConfigured, getSupabase } from '../lib/supabaseClient';
import { parseNotionOutlineToMindmap } from '../lib/notionParser';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Code,
  Sparkles,
  FileText,
  Key,
  Layers,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: (
    user: UserProfile,
    initialImport?: {
      nodes: MindmapNode[];
      connections: NodeConnection[];
      workspaceName?: string;
    }
  ) => void;
}

const SAMPLE_NOTION_OUTLINES = {
  roadmap: `Notion Product Roadmap Q3
  Core Mindmap Engine
    Notion Embedded Code Integration
    Bidirectional Bezier Connectors
    Flexible Resize & Zoom Frames
  Database & Cloud
    Supabase PostgreSQL Storage
    Vercel Edge Zero Config
    Realtime Session Sync
  User Experience
    Clean Notion Typography
    Sticky Notes & Markdown Docs
    Instant Embed Preview`,
  architecture: `System Architecture
  Frontend Client
    React 19 & Tailwind CSS v4
    Interactive SVG Connector Mesh
    Local & Remote State Machine
  Notion Gateway
    Embed iFrame Messaging
    Token & Markdown Parser
    Auto-Hierarchy Placement
  Database Tier
    Supabase Auth & RLS
    PostgreSQL Mindmap Nodes Table`,
};

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  // Navigation tabs: 'signin' | 'register' | 'notion_embed' | 'notion_create'
  const [activeTab, setActiveTab] = useState<'signin' | 'register' | 'notion_embed' | 'notion_create'>('signin');

  // Form states
  const [identifier, setIdentifier] = useState(''); // email or username
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Notion Embed & Create states
  const [embedCodeInput, setEmbedCodeInput] = useState('');
  const [notionTokenInput, setNotionTokenInput] = useState(
    () => localStorage.getItem('nopalion_notion_token') || ''
  );
  const [notionOutlineText, setNotionOutlineText] = useState(SAMPLE_NOTION_OUTLINES.roadmap);
  const [workspaceTitle, setWorkspaceTitle] = useState('Notion Mindmap');

  // Detect if inside an iframe / Notion embed
  const [isIframeDetected, setIsIframeDetected] = useState(false);

  useEffect(() => {
    try {
      if (window.self !== window.top || new URLSearchParams(window.location.search).get('embed') === 'true') {
        setIsIframeDetected(true);
      }
    } catch {
      setIsIframeDetected(true);
    }
  }, []);

  // Standard Login / Register submit
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanId) {
      setError('Please enter your email or username.');
      return;
    }
    if (!cleanPass) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    // If Supabase is configured, authenticate via Supabase
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        if (supabase) {
          if (activeTab === 'register') {
            // Supabase Sign Up
            const isEmail = cleanId.includes('@');
            const targetEmail = isEmail ? cleanId : `${cleanId}@nopalion.local`;

            const { data, error: signUpErr } = await supabase.auth.signUp({
              email: targetEmail,
              password: cleanPass,
            });

            // Also insert into public.accounts table for username mapping
            await supabase.from('accounts').upsert({
              email: targetEmail,
              username: cleanId.replace('@', '_'),
              full_name: fullName.trim() || cleanId,
              password_hash: cleanPass,
            });

            if (signUpErr) {
              console.warn('Supabase auth note:', signUpErr.message);
            }

            const newUser: UserProfile = {
              id: data.user?.id || 'usr-' + Date.now(),
              email: targetEmail,
              name: fullName.trim() || cleanId.split('@')[0],
              avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                cleanId
              )}&backgroundColor=9333ea,2383e2`,
              provider: 'supabase',
            };
            setIsLoading(false);
            onLoginSuccess(newUser);
            return;
          } else {
            // Supabase Sign In
            const isEmail = cleanId.includes('@');
            let loginEmail = cleanId;

            if (!isEmail) {
              const { data: acc } = await supabase
                .from('accounts')
                .select('email, password_hash, full_name')
                .eq('username', cleanId)
                .single();
              if (acc) {
                loginEmail = acc.email;
              } else {
                loginEmail = `${cleanId}@nopalion.local`;
              }
            }

            const { data } = await supabase.auth.signInWithPassword({
              email: loginEmail,
              password: cleanPass,
            });

            if (data?.user) {
              const user: UserProfile = {
                id: data.user.id,
                email: data.user.email || loginEmail,
                name: (data.user.email || loginEmail).split('@')[0],
                avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                  loginEmail
                )}`,
                provider: 'supabase',
              };
              setIsLoading(false);
              onLoginSuccess(user);
              return;
            }
          }
        }
      } catch (err) {
        console.warn('Supabase auth fallback:', err);
      }
    }

    // Default registered administrator account: novalpriya@gmail.com / pass123
    setTimeout(() => {
      const isDefaultAdmin =
        (cleanId === 'novalpriya@gmail.com' || cleanId === 'novalpriya') && cleanPass === 'pass123';

      if (activeTab === 'signin' && !isDefaultAdmin) {
        const storedUsers = JSON.parse(localStorage.getItem('notionmap_registered_users') || '[]');
        const match = storedUsers.find(
          (u: any) =>
            (u.email.toLowerCase() === cleanId || u.username?.toLowerCase() === cleanId) &&
            u.password === cleanPass
        );

        if (!match) {
          setError('Invalid email/username or password. Please verify your credentials.');
          setIsLoading(false);
          return;
        }

        const user: UserProfile = {
          id: match.id,
          email: match.email,
          name: match.name || match.email.split('@')[0],
          avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
            match.email
          )}&backgroundColor=9333ea,2383e2`,
          provider: 'demo',
        };
        setIsLoading(false);
        onLoginSuccess(user);
        return;
      }

      if (activeTab === 'register') {
        const storedUsers = JSON.parse(localStorage.getItem('notionmap_registered_users') || '[]');
        const newUserObj = {
          id: 'usr-' + Date.now(),
          email: cleanId.includes('@') ? cleanId : `${cleanId}@nopalion.local`,
          username: cleanId,
          password: cleanPass,
          name: fullName.trim() || cleanId.split('@')[0],
        };
        storedUsers.push(newUserObj);
        localStorage.setItem('notionmap_registered_users', JSON.stringify(storedUsers));

        const user: UserProfile = {
          id: newUserObj.id,
          email: newUserObj.email,
          name: newUserObj.name,
          avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
            newUserObj.email
          )}&backgroundColor=9333ea,2383e2`,
          provider: 'demo',
        };
        setIsLoading(false);
        onLoginSuccess(user);
        return;
      }

      // Default Admin Login
      const user: UserProfile = {
        id: 'usr-admin',
        email: 'novalpriya@gmail.com',
        name: 'Noval Priya',
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=novalpriya@gmail.com&backgroundColor=9333ea,2383e2`,
        provider: 'demo',
      };
      setIsLoading(false);
      onLoginSuccess(user);
    }, 250);
  };

  // Connect via Notion Embed Code / Access Key
  const handleNotionEmbedConnect = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Save Notion token if provided
    if (notionTokenInput.trim()) {
      localStorage.setItem('nopalion_notion_token', notionTokenInput.trim());
    }

    // Parse workspace ID if contained in embed code (e.g. ?ws=ws-xxx or src="...?ws=ws-xxx")
    let targetWsId = 'ws-notion-embed';
    const wsMatch = embedCodeInput.match(/[?&]ws=([^&"'\s]+)/);
    if (wsMatch && wsMatch[1]) {
      targetWsId = decodeURIComponent(wsMatch[1]);
    }

    setTimeout(() => {
      const notionUser: UserProfile = {
        id: 'usr-notion-' + Date.now(),
        email: 'notion.user@nopalion.io',
        name: 'Notion Connected User',
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=Notion&backgroundColor=242426,9333ea`,
        provider: 'demo',
      };
      setIsLoading(false);
      onLoginSuccess(notionUser);
    }, 250);
  };

  // Create Mind Map from Notion content directly
  const handleCreateFromNotion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notionOutlineText.trim()) {
      setError('Please provide a Notion outline or toggle list to generate the mind map.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const generated = parseNotionOutlineToMindmap(
      notionOutlineText.trim(),
      'ws-notion-imported',
      360,
      220
    );

    if (generated.nodes.length === 0) {
      setError('Could not extract any bullet points or topics from the provided text.');
      setIsLoading(false);
      return;
    }

    setTimeout(() => {
      const user: UserProfile = {
        id: 'usr-notion-creator',
        email: 'novalpriya@gmail.com',
        name: 'Noval Priya (Notion)',
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=novalpriya@gmail.com&backgroundColor=9333ea,2383e2`,
        provider: 'demo',
      };

      setIsLoading(false);
      onLoginSuccess(user, {
        nodes: generated.nodes,
        connections: generated.connections,
        workspaceName: workspaceTitle.trim() || 'Notion Mindmap',
      });
    }, 250);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#FBFBFA] dark:bg-[#191919] text-[#37352F] dark:text-[#E6E6E5] font-sans">
      <div className="w-full max-w-[440px] bg-white dark:bg-[#202020] border border-[#E9E9E7] dark:border-[#2E2E2E] rounded-xl p-6 sm:p-8 shadow-sm">
        {/* Header Icon & Brand */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-11 h-11 rounded-lg bg-[#242426] text-white flex items-center justify-center text-xl font-bold font-serif mb-2.5 shadow-xs">
            N
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#37352F] dark:text-[#E6E6E5]">
            Nopalion
          </h1>
          <p className="text-xs text-[#787774] dark:text-[#9B9A97] mt-0.5">
            Interactive Notion-Style Mindmap Studio
          </p>
        </div>

        {/* Notion Embed Detection Banner */}
        {isIframeDetected && (
          <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 rounded-lg flex items-center justify-between text-xs text-purple-900 dark:text-purple-200">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Notion embed frame detected.</span>
            </div>
            <button
              type="button"
              onClick={() => {
                const embedUser: UserProfile = {
                  id: 'usr-notion-embed',
                  email: 'novalpriya@gmail.com',
                  name: 'Noval Priya (Notion)',
                  provider: 'demo',
                };
                onLoginSuccess(embedUser);
              }}
              className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-[11px] font-medium cursor-pointer shrink-0 transition-colors"
            >
              Enter Canvas
            </button>
          </div>
        )}

        {/* Tab Switcher: Sign In, Register, Connect Notion, Create from Notion */}
        <div className="grid grid-cols-4 p-1 bg-[#F1F1EF] dark:bg-[#2B2B2B] rounded-lg mb-5 text-[11px] font-medium">
          <button
            type="button"
            onClick={() => {
              setActiveTab('signin');
              setError(null);
            }}
            className={`py-1.5 rounded-md transition-colors cursor-pointer text-center ${
              activeTab === 'signin'
                ? 'bg-white dark:bg-[#1E1E20] text-[#37352F] dark:text-[#E6E6E5] shadow-xs font-semibold'
                : 'text-[#787774] dark:text-[#9B9A97] hover:text-[#37352F]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setError(null);
            }}
            className={`py-1.5 rounded-md transition-colors cursor-pointer text-center ${
              activeTab === 'register'
                ? 'bg-white dark:bg-[#1E1E20] text-[#37352F] dark:text-[#E6E6E5] shadow-xs font-semibold'
                : 'text-[#787774] dark:text-[#9B9A97] hover:text-[#37352F]'
            }`}
          >
            Register
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('notion_embed');
              setError(null);
            }}
            className={`py-1.5 rounded-md transition-colors cursor-pointer text-center flex items-center justify-center gap-1 ${
              activeTab === 'notion_embed'
                ? 'bg-white dark:bg-[#1E1E20] text-[#37352F] dark:text-[#E6E6E5] shadow-xs font-semibold text-purple-600 dark:text-purple-400'
                : 'text-[#787774] dark:text-[#9B9A97] hover:text-[#37352F]'
            }`}
            title="Connect via Notion Embed Code or Token"
          >
            <Code className="w-3 h-3" />
            <span>Embed</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('notion_create');
              setError(null);
            }}
            className={`py-1.5 rounded-md transition-colors cursor-pointer text-center flex items-center justify-center gap-1 ${
              activeTab === 'notion_create'
                ? 'bg-white dark:bg-[#1E1E20] text-[#37352F] dark:text-[#E6E6E5] shadow-xs font-semibold text-purple-600 dark:text-purple-400'
                : 'text-[#787774] dark:text-[#9B9A97] hover:text-[#37352F]'
            }`}
            title="Create Mind Map directly from Notion"
          >
            <Sparkles className="w-3 h-3" />
            <span>Create</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2.5 text-xs bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-lg">
            {error}
          </div>
        )}

        {/* 1. SIGN IN & 2. REGISTER TAB */}
        {(activeTab === 'signin' || activeTab === 'register') && (
          <form onSubmit={handleAuthSubmit} className="space-y-3">
            {activeTab === 'register' && (
              <div>
                <label className="block text-xs font-medium text-[#787774] dark:text-[#9B9A97] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#191919] border border-[#D3D3D0] dark:border-[#383838] rounded-lg text-[#37352F] dark:text-[#E6E6E5] placeholder-[#9B9A97] focus:outline-none focus:border-purple-600 transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#787774] dark:text-[#9B9A97] mb-1">
                Email or Username
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#9B9A97]" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="name@example.com or username"
                  required
                  autoComplete="username"
                  className="w-full pl-9 pr-3.5 py-2 text-xs bg-white dark:bg-[#191919] border border-[#D3D3D0] dark:border-[#383838] rounded-lg text-[#37352F] dark:text-[#E6E6E5] placeholder-[#9B9A97] focus:outline-none focus:border-purple-600 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#787774] dark:text-[#9B9A97] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#9B9A97]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete={activeTab === 'register' ? 'new-password' : 'current-password'}
                  className="w-full pl-9 pr-9 py-2 text-xs bg-white dark:bg-[#191919] border border-[#D3D3D0] dark:border-[#383838] rounded-lg text-[#37352F] dark:text-[#E6E6E5] placeholder-[#9B9A97] focus:outline-none focus:border-purple-600 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[#9B9A97] hover:text-[#37352F] dark:hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !identifier.trim() || !password.trim()}
              className="w-full py-2.5 px-4 bg-[#242426] hover:bg-[#191919] text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs mt-3"
            >
              <span>{isLoading ? 'Authenticating...' : activeTab === 'register' ? 'Create Account' : 'Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* 3. CONNECT VIA NOTION EMBED CODE / TOKEN TAB */}
        {activeTab === 'notion_embed' && (
          <form onSubmit={handleNotionEmbedConnect} className="space-y-3.5">
            <div className="p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 rounded-lg text-xs text-[#5A5853] dark:text-[#D4D4D2]">
              <span className="font-semibold text-purple-700 dark:text-purple-300 block mb-1">
                Connect via Notion Embed Code
              </span>
              Paste your Notion embed code (`&lt;iframe...&gt;`), embed share link (`?embed=true`), or Notion integration secret to access your mindmap seamlessly inside Notion.
            </div>

            <div>
              <label className="block text-xs font-medium text-[#787774] dark:text-[#9B9A97] mb-1">
                Notion Embed Code or URL
              </label>
              <textarea
                value={embedCodeInput}
                onChange={(e) => setEmbedCodeInput(e.target.value)}
                placeholder='<iframe src="https://.../?embed=true&ws=ws-default" ...></iframe>'
                rows={3}
                className="w-full p-2.5 text-xs font-mono bg-white dark:bg-[#191919] border border-[#D3D3D0] dark:border-[#383838] rounded-lg text-[#37352F] dark:text-[#E6E6E5] placeholder-[#9B9A97] focus:outline-none focus:border-purple-600 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#787774] dark:text-[#9B9A97] mb-1">
                Notion Internal Integration Token (Optional)
              </label>
              <div className="relative">
                <Key className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#9B9A97]" />
                <input
                  type="password"
                  value={notionTokenInput}
                  onChange={(e) => setNotionTokenInput(e.target.value)}
                  placeholder="secret_abc123xyz..."
                  className="w-full pl-9 pr-3.5 py-2 text-xs font-mono bg-white dark:bg-[#191919] border border-[#D3D3D0] dark:border-[#383838] rounded-lg text-[#37352F] dark:text-[#E6E6E5] placeholder-[#9B9A97] focus:outline-none focus:border-purple-600 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs mt-2"
            >
              <Code className="w-3.5 h-3.5" />
              <span>{isLoading ? 'Connecting...' : 'Connect to Notion Mindmap'}</span>
            </button>
          </form>
        )}

        {/* 4. CREATE MIND MAP DIRECTLY FROM NOTION */}
        {activeTab === 'notion_create' && (
          <form onSubmit={handleCreateFromNotion} className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#787774] dark:text-[#9B9A97] font-medium">
                Workspace Name:
              </span>
              <input
                type="text"
                value={workspaceTitle}
                onChange={(e) => setWorkspaceTitle(e.target.value)}
                placeholder="Notion Mindmap"
                className="w-48 px-2 py-1 text-xs bg-white dark:bg-[#191919] border border-[#D3D3D0] dark:border-[#383838] rounded text-[#37352F] dark:text-[#E6E6E5] focus:outline-none focus:border-purple-600"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <label className="font-medium text-[#787774] dark:text-[#9B9A97]">
                  Paste Notion Outline / Bullets:
                </label>
                <div className="flex gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setNotionOutlineText(SAMPLE_NOTION_OUTLINES.roadmap)}
                    className="text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                  >
                    Roadmap
                  </button>
                  <span className="text-neutral-300">|</span>
                  <button
                    type="button"
                    onClick={() => setNotionOutlineText(SAMPLE_NOTION_OUTLINES.architecture)}
                    className="text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                  >
                    Architecture
                  </button>
                </div>
              </div>

              <textarea
                value={notionOutlineText}
                onChange={(e) => setNotionOutlineText(e.target.value)}
                placeholder={`• Main Topic\n  • Subtopic 1\n    • Detail A\n  • Subtopic 2`}
                rows={7}
                className="w-full p-2.5 text-xs font-mono bg-white dark:bg-[#191919] border border-[#D3D3D0] dark:border-[#383838] rounded-lg text-[#37352F] dark:text-[#E6E6E5] focus:outline-none focus:border-purple-600 leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !notionOutlineText.trim()}
              className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs mt-2 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isLoading ? 'Generating Mind Map...' : 'Create Mind Map from Notion'}</span>
            </button>
          </form>
        )}

        {/* Footer note mentioning Supabase SQL integration */}
        <div className="mt-5 pt-3.5 border-t border-[#F1F1EF] dark:border-[#2B2B2B] text-center">
          <p className="text-[11px] text-[#9B9A97]">
            Supabase PostgreSQL Ready · Schema in <code className="font-mono">supabase_schema.sql</code>
          </p>
        </div>
      </div>
    </div>
  );
};
