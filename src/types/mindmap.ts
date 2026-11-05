export type FontFamily = 'sans' | 'serif' | 'mono';
export type FontSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
export type TextAlign = 'left' | 'center' | 'right';
export type NodeShape = 'rounded' | 'sharp' | 'pill';
export type ShadowLevel = 'none' | 'subtle' | 'medium' | 'deep' | 'glow';
export type ConnectorType = 'bezier' | 'straight' | 'step';
export type ConnectorStyle = 'solid' | 'dashed' | 'dotted';
export type NodeType = 'parent' | 'child' | 'sticky' | 'image';

export interface NodeImageSettings {
  url: string;
  zoom: number; // 0.4 to 3.0
  panX: number; // px or % offset
  panY: number;
  fit: 'cover' | 'contain' | 'auto';
  aspectRatio: '16:9' | '4:3' | '1:1' | 'free' | 'auto';
  height: number;
  naturalAspectRatio?: number; // width / height
  isAutoHeight?: boolean;
}

export interface NodeDocument {
  title: string;
  content: string; // Markdown formatted
  checklists?: { id: string; text: string; done: boolean }[];
  updatedAt: string;
}

export interface NodeLink {
  title: string;
  url: string;
}

export interface MindmapNode {
  id: string;
  workspaceId: string;
  type: NodeType;
  isParent: boolean;
  parentId?: string | null;
  text: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  
  // Notion Typography
  fontFamily: FontFamily;
  fontSize: FontSize;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  textAlign: TextAlign;

  // Colors & Aesthetic (Notion color names or hex)
  bgColor: string; // e.g. 'transparent', '#FFFFFF', 'notion-yellow', etc.
  textColor: string; // e.g. '#37352F', 'notion-red-text', etc.
  borderColor: string;
  borderWidth: number; // 0, 1, 2
  borderStyle: 'solid' | 'dashed' | 'dotted';
  shape: NodeShape;
  shadow: ShadowLevel;
  opacity: number; // 10 to 100

  // Attachments
  link?: NodeLink;
  document?: NodeDocument;
  image?: NodeImageSettings;
  
  // Sticky note specific
  stickyRotation?: number; // e.g. -3 to 3 deg for realistic post-it feel

  createdAt: string;
  updatedAt: string;
}

export interface NodeConnection {
  id: string;
  workspaceId: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourceHandle?: 'top' | 'right' | 'bottom' | 'left' | 'auto';
  targetHandle?: 'top' | 'right' | 'bottom' | 'left' | 'auto';
  type: ConnectorType; // bezier, straight, step
  style: ConnectorStyle; // solid, dashed, dotted
  color: string;
  width: number;
  showArrow: boolean;
  label?: string;
}

export interface Workspace {
  id: string;
  name: string;
  icon: string;
  description: string;
  isDefaultSample?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  provider: 'google' | 'supabase' | 'demo';
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
}
