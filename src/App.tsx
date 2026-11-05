import React, { useState, useEffect } from 'react';
import {
  MindmapNode,
  NodeConnection,
  UserProfile,
  Workspace,
} from './types/mindmap';
import {
  getActiveUser,
  setActiveUser,
  getSavedWorkspaces,
  saveWorkspacesList,
  getWorkspaceNodes,
  saveWorkspaceNodes,
  getWorkspaceConnections,
  saveWorkspaceConnections,
} from './lib/storage';
import { AuthScreen } from './components/AuthScreen';
import { DashboardSidebar } from './components/DashboardSidebar';
import { MindmapCanvas } from './components/MindmapCanvas';
import { DocumentDrawer } from './components/DocumentDrawer';
import { ExportModal } from './components/ExportModal';
import { NotionImportModal } from './components/NotionImportModal';
import { NotionEmbedModal } from './components/NotionEmbedModal';
import {
  Download,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
  Code,
} from 'lucide-react';

export default function App() {
  // Check if running in Notion embed iframe mode (?embed=true)
  const isEmbedMode = new URLSearchParams(window.location.search).get('embed') === 'true';

  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    return (
      localStorage.getItem('notionmap_theme') === 'dark' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('notionmap_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('notionmap_theme', 'light');
    }
  }, [isDark]);

  // Auth User state (in embed mode, auto-provide session if empty)
  const [user, setUser] = useState<UserProfile | null>(() => {
    const existing = getActiveUser();
    if (!existing && isEmbedMode) {
      const embedUser: UserProfile = {
        id: 'usr-notion-embed',
        email: 'novalpriya@gmail.com',
        name: 'Noval Priya (Notion)',
        provider: 'demo',
      };
      setActiveUser(embedUser);
      return embedUser;
    }
    return existing;
  });

  // Workspaces state
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => getSavedWorkspaces());
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(() => {
    const urlWs = new URLSearchParams(window.location.search).get('ws');
    const saved = getSavedWorkspaces();
    if (urlWs && saved.some((w) => w.id === urlWs)) {
      return urlWs;
    }
    return saved[0]?.id || 'ws-default';
  });

  // Current Workspace Nodes & Connections
  const [nodes, setNodes] = useState<MindmapNode[]>([]);
  const [connections, setConnections] = useState<NodeConnection[]>([]);

  // Selection & UI Panels state
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('node-root-cmd');
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isEmbedMode);

  // Modals state
  const [activeDocumentNode, setActiveDocumentNode] = useState<MindmapNode | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isNotionImportModalOpen, setIsNotionImportModalOpen] = useState(false);
  const [isNotionEmbedModalOpen, setIsNotionEmbedModalOpen] = useState(false);

  // Load active workspace content on mount or change
  useEffect(() => {
    if (activeWorkspaceId) {
      const loadedNodes = getWorkspaceNodes(activeWorkspaceId);
      const loadedConns = getWorkspaceConnections(activeWorkspaceId);
      setNodes(loadedNodes);
      setConnections(loadedConns);
      setSelectedNodeId(loadedNodes[0]?.id || null);
    }
  }, [activeWorkspaceId]);

  // Handle Updates
  const handleUpdateNodes = (newNodes: MindmapNode[]) => {
    setNodes(newNodes);
    saveWorkspaceNodes(activeWorkspaceId, newNodes);
  };

  const handleUpdateConnections = (newConns: NodeConnection[]) => {
    setConnections(newConns);
    saveWorkspaceConnections(activeWorkspaceId, newConns);
  };

  const handleUpdateSingleNode = (updatedNode: MindmapNode) => {
    const updated = nodes.map((n) => (n.id === updatedNode.id ? updatedNode : n));
    handleUpdateNodes(updated);
  };

  // Workspace Management
  const handleSelectWorkspace = (id: string) => {
    setActiveWorkspaceId(id);
  };

  const handleCreateWorkspace = (name: string, icon: string) => {
    const newWs: Workspace = {
      id: 'ws-' + Date.now(),
      name,
      icon,
      description: 'Custom mindmap workspace',
      isDefaultSample: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const initialParentNode: MindmapNode = {
      id: 'node-root-' + Date.now(),
      workspaceId: newWs.id,
      type: 'parent',
      isParent: true,
      text: name,
      x: 400,
      y: 240,
      fontFamily: 'sans',
      fontSize: 'base',
      bold: true,
      italic: false,
      underline: false,
      strikethrough: false,
      textAlign: 'center',
      bgColor: '#242426',
      textColor: '#FFFFFF',
      borderColor: '#3D3D42',
      borderWidth: 2,
      borderStyle: 'solid',
      shape: 'rounded',
      shadow: 'medium',
      opacity: 100,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newWorkspaces = [...workspaces, newWs];
    setWorkspaces(newWorkspaces);
    saveWorkspacesList(newWorkspaces);
    saveWorkspaceNodes(newWs.id, [initialParentNode]);
    saveWorkspaceConnections(newWs.id, []);
    setActiveWorkspaceId(newWs.id);
  };

  const handleDeleteWorkspace = (id: string) => {
    if (workspaces.length <= 1) return;
    const filtered = workspaces.filter((w) => w.id !== id);
    setWorkspaces(filtered);
    saveWorkspacesList(filtered);
    if (activeWorkspaceId === id) {
      setActiveWorkspaceId(filtered[0].id);
    }
  };

  const handleDuplicateWorkspace = (id: string) => {
    const sourceWs = workspaces.find((w) => w.id === id);
    if (!sourceWs) return;

    const newWs: Workspace = {
      ...sourceWs,
      id: 'ws-' + Date.now(),
      name: `${sourceWs.name} (Copy)`,
      isDefaultSample: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const sourceNodes = getWorkspaceNodes(id);
    const sourceConns = getWorkspaceConnections(id);

    const newWorkspaces = [...workspaces, newWs];
    setWorkspaces(newWorkspaces);
    saveWorkspacesList(newWorkspaces);
    saveWorkspaceNodes(newWs.id, sourceNodes);
    saveWorkspaceConnections(newWs.id, sourceConns);
    setActiveWorkspaceId(newWs.id);
  };

  const handleImportWorkspace = (imported: {
    workspace: Workspace;
    nodes: MindmapNode[];
    connections: NodeConnection[];
  }) => {
    const newWs: Workspace = {
      ...imported.workspace,
      id: 'ws-import-' + Date.now(),
      isDefaultSample: false,
      updatedAt: new Date().toISOString(),
    };
    const newNodes = imported.nodes.map((n) => ({ ...n, workspaceId: newWs.id }));
    const newConns = imported.connections.map((c) => ({ ...c, workspaceId: newWs.id }));

    const updatedWorkspaces = [...workspaces, newWs];
    setWorkspaces(updatedWorkspaces);
    saveWorkspacesList(updatedWorkspaces);
    saveWorkspaceNodes(newWs.id, newNodes);
    saveWorkspaceConnections(newWs.id, newConns);
    setActiveWorkspaceId(newWs.id);
  };

  // Generate mind map from Notion import
  const handleImportFromNotion = (
    generatedNodes: MindmapNode[],
    generatedConns: NodeConnection[]
  ) => {
    const combinedNodes = [...nodes, ...generatedNodes];
    const combinedConns = [...connections, ...generatedConns];
    handleUpdateNodes(combinedNodes);
    handleUpdateConnections(combinedConns);
    if (generatedNodes.length > 0) {
      setSelectedNodeId(generatedNodes[0].id);
    }
  };

  // Auth Handlers
  const handleLoginSuccess = (
    profile: UserProfile,
    initialImport?: {
      nodes: MindmapNode[];
      connections: NodeConnection[];
      workspaceName?: string;
    }
  ) => {
    setUser(profile);
    setActiveUser(profile);

    if (initialImport && initialImport.nodes.length > 0) {
      const newWsId = 'ws-notion-' + Date.now();
      const newWs: Workspace = {
        id: newWsId,
        name: initialImport.workspaceName || 'Notion Mindmap',
        icon: '📝',
        description: 'Generated directly from Notion outline',
        isDefaultSample: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const remappedNodes = initialImport.nodes.map((n) => ({ ...n, workspaceId: newWsId }));
      const remappedConns = initialImport.connections.map((c) => ({ ...c, workspaceId: newWsId }));

      const updated = [newWs, ...workspaces];
      setWorkspaces(updated);
      saveWorkspacesList(updated);
      saveWorkspaceNodes(newWsId, remappedNodes);
      saveWorkspaceConnections(newWsId, remappedConns);
      setActiveWorkspaceId(newWsId);
      setNodes(remappedNodes);
      setConnections(remappedConns);
      if (remappedNodes.length > 0) {
        setSelectedNodeId(remappedNodes[0].id);
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    setActiveUser(null);
  };

  if (!user) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  const currentWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FBFBFA] dark:bg-[#191919] text-[#37352F] dark:text-[#E6E6E5] font-sans antialiased">
      {/* Sidebar (Collapsible) */}
      <DashboardSidebar
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspaceId}
        onSelectWorkspace={handleSelectWorkspace}
        onCreateWorkspace={handleCreateWorkspace}
        onDeleteWorkspace={handleDeleteWorkspace}
        onDuplicateWorkspace={handleDuplicateWorkspace}
        user={user}
        onLogout={handleLogout}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        isOpen={isSidebarOpen}
        onToggleOpen={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Mindmap Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top Header */}
        <header className="h-11 border-b border-[#E9E9E7] dark:border-[#2E2E2E] px-4 flex items-center justify-between bg-white/70 dark:bg-[#202020]/70 backdrop-blur-xs select-none z-20 shrink-0">
          <div className="flex items-center gap-2 truncate">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[#E9E9E7] dark:border-[#2E2E2E] hover:bg-[#F1F1EF] dark:hover:bg-[#2B2B2B] text-xs text-[#5A5853] dark:text-[#E6E6E5] font-medium transition-colors cursor-pointer shadow-xs"
              title={isSidebarOpen ? 'Hide workspaces sidebar' : 'Show workspaces sidebar'}
            >
              {isSidebarOpen ? (
                <PanelLeftClose className="w-3.5 h-3.5 text-purple-600" />
              ) : (
                <PanelLeft className="w-3.5 h-3.5 text-purple-600" />
              )}
              <span>Workspaces</span>
            </button>

            <span className="text-xs text-[#787774] dark:text-[#9B9A97]">Workspaces</span>
            <span className="text-xs text-[#D3D3D0] dark:text-[#383838]">/</span>
            <span className="text-xs font-semibold text-[#37352F] dark:text-[#E6E6E5] flex items-center gap-1.5 truncate">
              <span>{currentWorkspace?.icon || '⚡'}</span>
              <span className="truncate">{currentWorkspace?.name || 'Untitled Mindmap'}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Create from Notion */}
            <button
              onClick={() => setIsNotionImportModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 rounded-md font-medium transition-colors cursor-pointer shadow-xs"
              title="Create mind map from Notion outline or toggle list"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">From Notion</span>
            </button>

            {/* Embed in Notion */}
            <button
              onClick={() => setIsNotionEmbedModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-white dark:bg-[#252528] hover:bg-[#F1F1EF] dark:hover:bg-[#2E2E32] text-[#37352F] dark:text-[#E6E6E5] border border-[#E9E9E7] dark:border-[#2E2E2E] rounded-md font-medium transition-colors cursor-pointer shadow-xs"
              title="Get Notion embed URL and code"
            >
              <Code className="w-3.5 h-3.5 text-purple-600" />
              <span className="hidden sm:inline">Embed in Notion</span>
            </button>

            {/* Export */}
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1 text-xs bg-[#F1F1EF] dark:bg-[#2B2B2B] hover:bg-[#EAEAEA] dark:hover:bg-[#333333] rounded-md text-[#37352F] dark:text-[#E6E6E5] font-medium transition-colors cursor-pointer"
              title="Export mindmap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </header>

        {/* Full Canvas Viewport */}
        <div className="flex-1 overflow-hidden relative">
          <MindmapCanvas
            nodes={nodes}
            connections={connections}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            onUpdateNodes={handleUpdateNodes}
            onUpdateConnections={handleUpdateConnections}
            onOpenDocument={(node) => setActiveDocumentNode(node)}
          />
        </div>
      </div>

      {/* Document Notes Drawer */}
      <DocumentDrawer
        isOpen={Boolean(activeDocumentNode)}
        onClose={() => setActiveDocumentNode(null)}
        document={activeDocumentNode?.document || null}
        nodeTitle={activeDocumentNode?.text || ''}
        onSaveDocument={(doc) => {
          if (activeDocumentNode) {
            handleUpdateSingleNode({
              ...activeDocumentNode,
              document: doc || undefined,
            });
          }
        }}
      />

      {/* Create Mind Map from Notion Modal */}
      <NotionImportModal
        isOpen={isNotionImportModalOpen}
        onClose={() => setIsNotionImportModalOpen(false)}
        workspaceId={activeWorkspaceId}
        onImportGenerated={handleImportFromNotion}
      />

      {/* Embed in Notion Modal */}
      <NotionEmbedModal
        isOpen={isNotionEmbedModalOpen}
        onClose={() => setIsNotionEmbedModalOpen(false)}
        workspaceId={activeWorkspaceId}
      />

      {/* Export & Backup Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        workspace={currentWorkspace}
        nodes={nodes}
        connections={connections}
        onImportWorkspace={handleImportWorkspace}
      />
    </div>
  );
}
