import { MindmapNode, NodeConnection, UserProfile, Workspace } from '../types/mindmap';
import { getSupabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEY_WORKSPACES = 'notionmap_workspaces_v2';
const STORAGE_KEY_NODES_PREFIX = 'notionmap_nodes_v2_';
const STORAGE_KEY_CONNS_PREFIX = 'notionmap_conns_v2_';
const STORAGE_KEY_USER = 'notionmap_active_user';

export const INITIAL_SAMPLE_WORKSPACE_ID = 'ws-sample-blockchain';

export const INITIAL_SAMPLE_WORKSPACE: Workspace = {
  id: INITIAL_SAMPLE_WORKSPACE_ID,
  name: 'Blockchain Command Workspace',
  icon: '⚡',
  description: 'Notion mindmap with multiple nodes, sticky notes, and dashed connectors',
  isDefaultSample: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Initial nodes closely matching user's reference diagram
export const INITIAL_SAMPLE_NODES: MindmapNode[] = [
  // 1. Root Central Node (Selected like in the screenshot)
  {
    id: 'node-root-cmd',
    workspaceId: INITIAL_SAMPLE_WORKSPACE_ID,
    type: 'parent',
    isParent: true,
    text: 'Blockchain command',
    x: 440,
    y: 200,
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
  },

  // 2. Left Branch: Bikin node
  {
    id: 'node-left-bikin',
    workspaceId: INITIAL_SAMPLE_WORKSPACE_ID,
    type: 'child',
    isParent: false,
    parentId: 'node-root-cmd',
    text: 'Bikin node',
    x: 240,
    y: 200,
    fontFamily: 'sans',
    fontSize: 'sm',
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    textAlign: 'center',
    bgColor: '#FFFFFF',
    textColor: '#242426',
    borderColor: '#E3E2E0',
    borderWidth: 1,
    borderStyle: 'solid',
    shape: 'rounded',
    shadow: 'subtle',
    opacity: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // 3. Far Left: Long Command
  {
    id: 'node-left-cmd-detail',
    workspaceId: INITIAL_SAMPLE_WORKSPACE_ID,
    type: 'child',
    isParent: false,
    parentId: 'node-left-bikin',
    text: '1. cmu node start -m "nut announce enter town certain armor ten sibling nut stone kingdom elephant" -v --allow-cors',
    x: -40,
    y: 170,
    width: 220,
    fontFamily: 'mono',
    fontSize: 'xs',
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    textAlign: 'left',
    bgColor: '#FFFFFF',
    textColor: '#242426',
    borderColor: '#E3E2E0',
    borderWidth: 1,
    borderStyle: 'solid',
    shape: 'rounded',
    shadow: 'subtle',
    opacity: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // 4. Right Branch 1: update cmu
  {
    id: 'node-right-update-1',
    workspaceId: INITIAL_SAMPLE_WORKSPACE_ID,
    type: 'child',
    isParent: false,
    parentId: 'node-root-cmd',
    text: 'update cmu',
    x: 700,
    y: 100,
    fontFamily: 'sans',
    fontSize: 'sm',
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    textAlign: 'left',
    bgColor: '#FFFFFF',
    textColor: '#242426',
    borderColor: '#E3E2E0',
    borderWidth: 1,
    borderStyle: 'solid',
    shape: 'rounded',
    shadow: 'subtle',
    opacity: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'node-right-npm',
    workspaceId: INITIAL_SAMPLE_WORKSPACE_ID,
    type: 'child',
    isParent: false,
    parentId: 'node-right-update-1',
    text: 'npm install -g cmu@latest',
    x: 880,
    y: 100,
    fontFamily: 'mono',
    fontSize: 'xs',
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    textAlign: 'left',
    bgColor: '#FFFFFF',
    textColor: '#242426',
    borderColor: '#E3E2E0',
    borderWidth: 1,
    borderStyle: 'solid',
    shape: 'rounded',
    shadow: 'subtle',
    opacity: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // 5. Right Branch 2: daftarkan private key node
  {
    id: 'node-right-privkey',
    workspaceId: INITIAL_SAMPLE_WORKSPACE_ID,
    type: 'child',
    isParent: false,
    parentId: 'node-root-cmd',
    text: 'daftarkan private key node',
    x: 700,
    y: 160,
    fontFamily: 'sans',
    fontSize: 'sm',
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    textAlign: 'left',
    bgColor: '#FFFFFF',
    textColor: '#242426',
    borderColor: '#E3E2E0',
    borderWidth: 1,
    borderStyle: 'solid',
    shape: 'rounded',
    shadow: 'subtle',
    opacity: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'node-right-wallet',
    workspaceId: INITIAL_SAMPLE_WORKSPACE_ID,
    type: 'child',
    isParent: false,
    parentId: 'node-right-privkey',
    text: 'cmu wallet save <name>',
    x: 960,
    y: 160,
    fontFamily: 'mono',
    fontSize: 'xs',
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    textAlign: 'left',
    bgColor: '#FFFFFF',
    textColor: '#242426',
    borderColor: '#E3E2E0',
    borderWidth: 1,
    borderStyle: 'solid',
    shape: 'rounded',
    shadow: 'subtle',
    opacity: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // 6. Right Branch 3: Second Blockchain command
  {
    id: 'node-right-block-2',
    workspaceId: INITIAL_SAMPLE_WORKSPACE_ID,
    type: 'child',
    isParent: false,
    parentId: 'node-root-cmd',
    text: 'Blockchain command',
    x: 700,
    y: 330,
    fontFamily: 'sans',
    fontSize: 'sm',
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    textAlign: 'center',
    bgColor: '#FFFFFF',
    textColor: '#242426',
    borderColor: '#E3E2E0',
    borderWidth: 1,
    borderStyle: 'solid',
    shape: 'rounded',
    shadow: 'subtle',
    opacity: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'node-sub-bikin',
    workspaceId: INITIAL_SAMPLE_WORKSPACE_ID,
    type: 'child',
    isParent: false,
    parentId: 'node-right-block-2',
    text: 'Bikin node',
    x: 960,
    y: 280,
    fontFamily: 'sans',
    fontSize: 'sm',
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    textAlign: 'left',
    bgColor: '#FFFFFF',
    textColor: '#242426',
    borderColor: '#E3E2E0',
    borderWidth: 1,
    borderStyle: 'solid',
    shape: 'rounded',
    shadow: 'subtle',
    opacity: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'node-sub-detail-right',
    workspaceId: INITIAL_SAMPLE_WORKSPACE_ID,
    type: 'child',
    isParent: false,
    parentId: 'node-sub-bikin',
    text: '1. cmu node start -m "nut announce enter town certain armor ten sibling nut stone kingdom elephant" -v --allow-cors',
    x: 1140,
    y: 260,
    width: 220,
    fontFamily: 'mono',
    fontSize: 'xs',
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    textAlign: 'left',
    bgColor: '#FFFFFF',
    textColor: '#242426',
    borderColor: '#E3E2E0',
    borderWidth: 1,
    borderStyle: 'solid',
    shape: 'rounded',
    shadow: 'subtle',
    opacity: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'node-sub-update',
    workspaceId: INITIAL_SAMPLE_WORKSPACE_ID,
    type: 'child',
    isParent: false,
    parentId: 'node-right-block-2',
    text: 'update cmu',
    x: 960,
    y: 350,
    fontFamily: 'sans',
    fontSize: 'sm',
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    textAlign: 'left',
    bgColor: '#FFFFFF',
    textColor: '#242426',
    borderColor: '#E3E2E0',
    borderWidth: 1,
    borderStyle: 'solid',
    shape: 'rounded',
    shadow: 'subtle',
    opacity: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'node-sub-npm-right',
    workspaceId: INITIAL_SAMPLE_WORKSPACE_ID,
    type: 'child',
    isParent: false,
    parentId: 'node-sub-update',
    text: 'npm install -g cmu@latest',
    x: 1140,
    y: 350,
    fontFamily: 'mono',
    fontSize: 'xs',
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    textAlign: 'left',
    bgColor: '#FFFFFF',
    textColor: '#242426',
    borderColor: '#E3E2E0',
    borderWidth: 1,
    borderStyle: 'solid',
    shape: 'rounded',
    shadow: 'subtle',
    opacity: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // 7. Yellow Sticky Note ("hhh" as in the screenshot)
  {
    id: 'node-sticky-hhh',
    workspaceId: INITIAL_SAMPLE_WORKSPACE_ID,
    type: 'sticky',
    isParent: false,
    text: 'hhh',
    x: 700,
    y: 440,
    width: 140,
    height: 130,
    fontFamily: 'sans',
    fontSize: 'sm',
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    textAlign: 'left',
    bgColor: '#FEF9C3', // Yellow sticky note
    textColor: '#422006',
    borderColor: '#FDE047',
    borderWidth: 1,
    borderStyle: 'solid',
    shape: 'rounded',
    shadow: 'subtle',
    opacity: 98,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_SAMPLE_CONNECTIONS: NodeConnection[] = [
  // Left: Root to Bikin node
  {
    id: 'conn-left-1',
    workspaceId: INITIAL_SAMPLE_WORKSPACE_ID,
    sourceNodeId: 'node-left-bikin',
    targetNodeId: 'node-root-cmd',
    type: 'bezier',
    style: 'solid',
    color: '#D1D1D6',
    width: 1.5,
    showArrow: false,
  },
  // Far Left detail
  {
    id: 'conn-left-2',
    workspaceId: INITIAL_SAMPLE_WORKSPACE_ID,
    sourceNodeId: 'node-left-cmd-detail',
    targetNodeId: 'node-left-bikin',
    type: 'bezier',
    style: 'solid',
    color: '#D1D1D6',
    width: 1.5,
    showArrow: false,
  },

  // Right branch 1: update cmu
  {
    id: 'conn-right-1',
    workspaceId: INITIAL_SAMPLE_WORKSPACE_ID,
    sourceNodeId: 'node-root-cmd',
    targetNodeId: 'node-right-update-1',
    type: 'bezier',
    style: 'solid',
    color: '#D1D1D6',
    width: 1.5,
    showArrow: false,
  },
  {
    id: 'conn-right-npm',
    workspaceId: INITIAL_SAMPLE_WORKSPACE_ID,
    sourceNodeId: 'node-right-update-1',
    targetNodeId: 'node-right-npm',
    type: 'bezier',
    style: 'solid',
    color: '#D1D1D6',
    width: 1.5,
    showArrow: false,
  },

  // Right branch 2: daftarkan private key node (Dashed curve connector as in screenshot)
  {
    id: 'conn-right-2',
    workspaceId: INITIAL_SAMPLE_WORKSPACE_ID,
    sourceNodeId: 'node-root-cmd',
    targetNodeId: 'node-right-privkey',
    type: 'bezier',
    style: 'dashed', // putus-putus
    color: '#D1D1D6',
    width: 1.5,
    showArrow: false,
  },
  {
    id: 'conn-right-wallet',
    workspaceId: INITIAL_SAMPLE_WORKSPACE_ID,
    sourceNodeId: 'node-right-privkey',
    targetNodeId: 'node-right-wallet',
    type: 'bezier',
    style: 'solid',
    color: '#D1D1D6',
    width: 1.5,
    showArrow: false,
  },

  // Right branch 3: Blockchain command
  {
    id: 'conn-right-3',
    workspaceId: INITIAL_SAMPLE_WORKSPACE_ID,
    sourceNodeId: 'node-root-cmd',
    targetNodeId: 'node-right-block-2',
    type: 'bezier',
    style: 'solid',
    color: '#D1D1D6',
    width: 1.5,
    showArrow: false,
  },
  {
    id: 'conn-sub-1',
    workspaceId: INITIAL_SAMPLE_WORKSPACE_ID,
    sourceNodeId: 'node-right-block-2',
    targetNodeId: 'node-sub-bikin',
    type: 'bezier',
    style: 'solid',
    color: '#D1D1D6',
    width: 1.5,
    showArrow: false,
  },
  {
    id: 'conn-sub-detail',
    workspaceId: INITIAL_SAMPLE_WORKSPACE_ID,
    sourceNodeId: 'node-sub-bikin',
    targetNodeId: 'node-sub-detail-right',
    type: 'bezier',
    style: 'solid',
    color: '#D1D1D6',
    width: 1.5,
    showArrow: false,
  },
  {
    id: 'conn-sub-update',
    workspaceId: INITIAL_SAMPLE_WORKSPACE_ID,
    sourceNodeId: 'node-right-block-2',
    targetNodeId: 'node-sub-update',
    type: 'bezier',
    style: 'solid',
    color: '#D1D1D6',
    width: 1.5,
    showArrow: false,
  },
  {
    id: 'conn-sub-npm',
    workspaceId: INITIAL_SAMPLE_WORKSPACE_ID,
    sourceNodeId: 'node-sub-update',
    targetNodeId: 'node-sub-npm-right',
    type: 'bezier',
    style: 'solid',
    color: '#D1D1D6',
    width: 1.5,
    showArrow: false,
  },

  // Sticky note dashed connector ("connector sticky notes putus")
  {
    id: 'conn-sticky-dashed',
    workspaceId: INITIAL_SAMPLE_WORKSPACE_ID,
    sourceNodeId: 'node-root-cmd',
    targetNodeId: 'node-sticky-hhh',
    type: 'bezier',
    style: 'dashed', // putus-putus
    color: '#D1D1D6',
    width: 1.5,
    showArrow: false,
  },
];

export function getSavedWorkspaces(): Workspace[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_WORKSPACES);
    if (!raw) {
      const initial = [INITIAL_SAMPLE_WORKSPACE];
      localStorage.setItem(STORAGE_KEY_WORKSPACES, JSON.stringify(initial));
      saveWorkspaceNodes(INITIAL_SAMPLE_WORKSPACE_ID, INITIAL_SAMPLE_NODES);
      saveWorkspaceConnections(INITIAL_SAMPLE_WORKSPACE_ID, INITIAL_SAMPLE_CONNECTIONS);
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading workspaces:', e);
    return [INITIAL_SAMPLE_WORKSPACE];
  }
}

export function saveWorkspacesList(workspaces: Workspace[]): void {
  localStorage.setItem(STORAGE_KEY_WORKSPACES, JSON.stringify(workspaces));
}

export function getWorkspaceNodes(workspaceId: string): MindmapNode[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_NODES_PREFIX}${workspaceId}`);
    if (!raw) {
      if (workspaceId === INITIAL_SAMPLE_WORKSPACE_ID) {
        saveWorkspaceNodes(workspaceId, INITIAL_SAMPLE_NODES);
        return INITIAL_SAMPLE_NODES;
      }
      return [];
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading nodes:', e);
    return [];
  }
}

export function saveWorkspaceNodes(workspaceId: string, nodes: MindmapNode[]): void {
  localStorage.setItem(`${STORAGE_KEY_NODES_PREFIX}${workspaceId}`, JSON.stringify(nodes));
  if (isSupabaseConfigured()) {
    syncNodesToSupabase(workspaceId, nodes).catch((err) => console.warn('Supabase sync notice:', err));
  }
}

export function getWorkspaceConnections(workspaceId: string): NodeConnection[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_CONNS_PREFIX}${workspaceId}`);
    if (!raw) {
      if (workspaceId === INITIAL_SAMPLE_WORKSPACE_ID) {
        saveWorkspaceConnections(workspaceId, INITIAL_SAMPLE_CONNECTIONS);
        return INITIAL_SAMPLE_CONNECTIONS;
      }
      return [];
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading connections:', e);
    return [];
  }
}

export function saveWorkspaceConnections(workspaceId: string, connections: NodeConnection[]): void {
  localStorage.setItem(`${STORAGE_KEY_CONNS_PREFIX}${workspaceId}`, JSON.stringify(connections));
  if (isSupabaseConfigured()) {
    syncConnectionsToSupabase(workspaceId, connections).catch((err) => console.warn('Supabase sync notice:', err));
  }
}

export function getActiveUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setActiveUser(user: UserProfile | null): void {
  if (user) {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY_USER);
  }
}

export function clearSampleDummyData(): void {
  const allWorkspaces = getSavedWorkspaces();
  const filtered = allWorkspaces.filter((ws) => ws.id !== INITIAL_SAMPLE_WORKSPACE_ID);

  if (filtered.length === 0) {
    const emptyWorkspace: Workspace = {
      id: `ws-${Date.now()}`,
      name: 'Main Workspace',
      icon: '🧠',
      description: 'Clean production workspace ready for mindmapping',
      isDefaultSample: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    filtered.push(emptyWorkspace);
    saveWorkspaceNodes(emptyWorkspace.id, []);
    saveWorkspaceConnections(emptyWorkspace.id, []);
  }

  localStorage.removeItem(`${STORAGE_KEY_NODES_PREFIX}${INITIAL_SAMPLE_WORKSPACE_ID}`);
  localStorage.removeItem(`${STORAGE_KEY_CONNS_PREFIX}${INITIAL_SAMPLE_WORKSPACE_ID}`);
  saveWorkspacesList(filtered);
}

async function syncNodesToSupabase(workspaceId: string, nodes: MindmapNode[]) {
  const supabase = getSupabase();
  if (!supabase) return;
  for (const node of nodes) {
    await supabase.from('nodes').upsert({
      id: node.id,
      workspace_id: workspaceId,
      data: node,
      updated_at: new Date().toISOString(),
    });
  }
}

async function syncConnectionsToSupabase(workspaceId: string, connections: NodeConnection[]) {
  const supabase = getSupabase();
  if (!supabase) return;
  for (const conn of connections) {
    await supabase.from('connections').upsert({
      id: conn.id,
      workspace_id: workspaceId,
      data: conn,
      updated_at: new Date().toISOString(),
    });
  }
}
