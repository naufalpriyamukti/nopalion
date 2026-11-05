import React, { useState, useRef, useEffect } from 'react';
import {
  MindmapNode,
  NodeConnection,
  ConnectorStyle,
} from '../types/mindmap';
import { NodeFloatingToolbar } from './NodeFloatingToolbar';
import { STICKY_PALETTE } from '../constants/notionPalette';
import {
  Plus,
  StickyNote,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ExternalLink,
  FileText,
  Trash2,
  GitBranch,
  Cable,
  X,
  Maximize2,
  Move,
} from 'lucide-react';

interface MindmapCanvasProps {
  nodes: MindmapNode[];
  connections: NodeConnection[];
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  onUpdateNodes: (nodes: MindmapNode[]) => void;
  onUpdateConnections: (connections: NodeConnection[]) => void;
  onOpenDocument: (node: MindmapNode) => void;
}

export const MindmapCanvas: React.FC<MindmapCanvasProps> = ({
  nodes,
  connections,
  selectedNodeId,
  onSelectNode,
  onUpdateNodes,
  onUpdateConnections,
  onOpenDocument,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Viewport Transform (Pan & Zoom)
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 140, y: 160 });
  const [isPanning, setIsPanning] = useState(false);
  const startPanRef = useRef({ x: 0, y: 0 });

  // Node Dragging State via Ref for butter-smooth 60fps dragging
  const dragRef = useRef<{
    activeId: string | null;
    startClientX: number;
    startClientY: number;
    startNodeX: number;
    startNodeY: number;
  }>({
    activeId: null,
    startClientX: 0,
    startClientY: 0,
    startNodeX: 0,
    startNodeY: 0,
  });

  // Node Resizing State (Width & Height)
  const resizeRef = useRef<{
    activeId: string | null;
    direction: 'se' | 'e' | 's' | null;
    startClientX: number;
    startClientY: number;
    startWidth: number;
    startHeight: number;
  }>({
    activeId: null,
    direction: null,
    startClientX: 0,
    startClientY: 0,
    startWidth: 0,
    startHeight: 0,
  });

  // Image Pan / Reposition inside frame
  const imagePanRef = useRef<{
    activeNodeId: string | null;
    startClientX: number;
    startClientY: number;
    startPanX: number;
    startPanY: number;
  }>({
    activeNodeId: null,
    startClientX: 0,
    startClientY: 0,
    startPanX: 0,
    startPanY: 0,
  });

  // Image Frame Height Resize
  const imageResizeRef = useRef<{
    activeNodeId: string | null;
    startClientY: number;
    startHeight: number;
  }>({
    activeNodeId: null,
    startClientY: 0,
    startHeight: 160,
  });

  // Inline editing node
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);

  // Connection Mode State (either dragging handle or clicked 'Connect to...' in toolbar)
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);
  const [isClickConnectMode, setIsClickConnectMode] = useState<string | null>(null);
  const [mouseCanvasPos, setMouseCanvasPos] = useState({ x: 0, y: 0 });

  // Selected Connector for style editing
  const [selectedConnId, setSelectedConnId] = useState<string | null>(null);

  // Space key detection for pan
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Keyboard navigation & shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (e.target as HTMLElement).tagName;
      if (
        activeTag === 'INPUT' ||
        activeTag === 'TEXTAREA' ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      if (e.code === 'Space') {
        setIsSpacePressed(true);
      }

      if (e.key === 'Escape') {
        setIsClickConnectMode(null);
        setConnectingSourceId(null);
        setSelectedConnId(null);
      }

      if (selectedNodeId) {
        const activeNode = nodes.find((n) => n.id === selectedNodeId);
        if (activeNode) {
          if (e.key === 'Tab') {
            e.preventDefault();
            handleAddChildToRight(activeNode);
          } else if (e.key === 'Enter') {
            e.preventDefault();
            setEditingNodeId(selectedNodeId);
          } else if (e.key === 'Delete' || e.key === 'Backspace') {
            e.preventDefault();
            handleDeleteNode(selectedNodeId);
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedNodeId, nodes]);

  // Global Pointer Events for Dragging, Resizing, and Panning
  useEffect(() => {
    const handleWindowPointerMove = (e: PointerEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const currentCanvasX = (e.clientX - rect.left - pan.x) / zoom;
      const currentCanvasY = (e.clientY - rect.top - pan.y) / zoom;
      setMouseCanvasPos({ x: currentCanvasX, y: currentCanvasY });

      // 0. Image Panning (Reposition inside frame)
      if (imagePanRef.current.activeNodeId) {
        const deltaX = (e.clientX - imagePanRef.current.startClientX) / zoom;
        const deltaY = (e.clientY - imagePanRef.current.startClientY) / zoom;
        onUpdateNodes(
          nodes.map((n) =>
            n.id === imagePanRef.current.activeNodeId && n.image
              ? {
                  ...n,
                  image: {
                    ...n.image,
                    panX: Math.round(imagePanRef.current.startPanX + deltaX),
                    panY: Math.round(imagePanRef.current.startPanY + deltaY),
                  },
                }
              : n
          )
        );
        return;
      }

      // 0.5 Image Frame Height Resize Handle
      if (imageResizeRef.current.activeNodeId) {
        const deltaY = (e.clientY - imageResizeRef.current.startClientY) / zoom;
        const newHeight = Math.max(
          50,
          Math.min(700, Math.round(imageResizeRef.current.startHeight + deltaY))
        );
        onUpdateNodes(
          nodes.map((n) =>
            n.id === imageResizeRef.current.activeNodeId && n.image
              ? {
                  ...n,
                  image: {
                    ...n.image,
                    height: newHeight,
                    fit: n.image.fit === 'auto' ? 'contain' : n.image.fit,
                  },
                }
              : n
          )
        );
        return;
      }

      // 1. Canvas Pan
      if (isPanning) {
        setPan({
          x: e.clientX - startPanRef.current.x,
          y: e.clientY - startPanRef.current.y,
        });
        return;
      }

      // 2. Node Resizing (Width & Height)
      if (resizeRef.current.activeId) {
        const deltaX = (e.clientX - resizeRef.current.startClientX) / zoom;
        const deltaY = (e.clientY - resizeRef.current.startClientY) / zoom;
        const dir = resizeRef.current.direction;

        const newWidth =
          dir === 'se' || dir === 'e'
            ? Math.max(110, Math.round(resizeRef.current.startWidth + deltaX))
            : resizeRef.current.startWidth;

        const newHeight =
          dir === 'se' || dir === 's'
            ? Math.max(38, Math.round(resizeRef.current.startHeight + deltaY))
            : resizeRef.current.startHeight;

        const targetNode = nodes.find((n) => n.id === resizeRef.current.activeId);
        let updatedImage = targetNode?.image;
        if (targetNode?.image && (dir === 'se' || dir === 's')) {
          const deltaH = newHeight - resizeRef.current.startHeight;
          const currentImgH = targetNode.image.height || 160;
          updatedImage = {
            ...targetNode.image,
            height: Math.max(60, Math.round(currentImgH + deltaH)),
          };
        }

        onUpdateNodes(
          nodes.map((n) =>
            n.id === resizeRef.current.activeId
              ? { ...n, width: newWidth, height: newHeight, image: updatedImage }
              : n
          )
        );
        return;
      }

      // 3. Node Dragging
      if (dragRef.current.activeId) {
        const deltaX = (e.clientX - dragRef.current.startClientX) / zoom;
        const deltaY = (e.clientY - dragRef.current.startClientY) / zoom;

        const newX = Math.round(dragRef.current.startNodeX + deltaX);
        const newY = Math.round(dragRef.current.startNodeY + deltaY);

        onUpdateNodes(
          nodes.map((n) => (n.id === dragRef.current.activeId ? { ...n, x: newX, y: newY } : n))
        );
      }
    };

    const handleWindowPointerUp = () => {
      setIsPanning(false);
      dragRef.current.activeId = null;
      resizeRef.current.activeId = null;
      imagePanRef.current.activeNodeId = null;
      imageResizeRef.current.activeNodeId = null;
    };

    window.addEventListener('pointermove', handleWindowPointerMove);
    window.addEventListener('pointerup', handleWindowPointerUp);
    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', handleWindowPointerUp);
    };
  }, [isPanning, pan, zoom, nodes, onUpdateNodes]);

  // Wheel Zoom & Pan
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey || isSpacePressed) {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      setZoom((prev) => Math.min(2.5, Math.max(0.25, prev * zoomFactor)));
    } else {
      setPan((prev) => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }));
    }
  };

  // Canvas background pointer down
  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    if (
      e.button === 1 ||
      isSpacePressed ||
      e.target === containerRef.current ||
      (e.target as HTMLElement).id === 'canvas-bg'
    ) {
      setIsPanning(true);
      startPanRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      if (!isSpacePressed && e.button !== 1) {
        onSelectNode(null);
        setSelectedConnId(null);
        setEditingNodeId(null);
        setIsClickConnectMode(null);
      }
    }
  };

  // Node pointer down
  const handleNodePointerDown = (e: React.PointerEvent, node: MindmapNode) => {
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'BUTTON' ||
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.closest('button') ||
      target.closest('a') ||
      target.dataset.resize
    ) {
      return;
    }

    e.stopPropagation();

    // If in click-to-connect mode: clicking this node links it with the source node!
    if (isClickConnectMode) {
      if (isClickConnectMode !== node.id) {
        createConnection(isClickConnectMode, node.id);
      }
      setIsClickConnectMode(null);
      return;
    }

    onSelectNode(node.id);
    setSelectedConnId(null);

    const defaultWidth = node.width || (node.type === 'sticky' ? 160 : 150);
    const defaultHeight = node.height || (node.type === 'sticky' ? 130 : 44);

    dragRef.current = {
      activeId: node.id,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startNodeX: node.x,
      startNodeY: node.y,
    };
  };

  // Start Node Resizing
  const handleStartResize = (
    e: React.PointerEvent,
    node: MindmapNode,
    direction: 'se' | 'e' | 's'
  ) => {
    e.stopPropagation();
    const defaultWidth = node.width || (node.type === 'sticky' ? 160 : 150);
    const defaultHeight = node.height || (node.type === 'sticky' ? 130 : 44);

    resizeRef.current = {
      activeId: node.id,
      direction,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startWidth: defaultWidth,
      startHeight: defaultHeight,
    };
  };

  // Create Connection between ANY two nodes
  const createConnection = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;

    // Check if connection already exists
    const exists = connections.some(
      (c) =>
        (c.sourceNodeId === sourceId && c.targetNodeId === targetId) ||
        (c.sourceNodeId === targetId && c.targetNodeId === sourceId)
    );
    if (exists) return;

    const sourceNode = nodes.find((n) => n.id === sourceId);
    const targetNode = nodes.find((n) => n.id === targetId);
    const isSticky = sourceNode?.type === 'sticky' || targetNode?.type === 'sticky';

    const newConnection: NodeConnection = {
      id: 'conn-' + Date.now(),
      workspaceId: sourceNode?.workspaceId || 'ws-default',
      sourceNodeId: sourceId,
      targetNodeId: targetId,
      type: 'bezier',
      style: isSticky ? 'dashed' : 'solid',
      color: '#B0B0B5',
      width: 1.5,
      showArrow: false,
    };

    onUpdateConnections([...connections, newConnection]);
  };

  // Add Child to Right with clean layout (no messy overlaps!)
  const handleAddChildToRight = (sourceNode: MindmapNode) => {
    const newChildId = 'node-' + Date.now();
    const sourceWidth = sourceNode.width || (sourceNode.type === 'sticky' ? 160 : 150);

    // Find all existing children to place this new child neatly below the last child!
    const existingChildrenConns = connections.filter((c) => c.sourceNodeId === sourceNode.id);
    const existingChildren = nodes.filter((n) =>
      existingChildrenConns.some((c) => c.targetNodeId === n.id && n.x > sourceNode.x)
    );

    let nextY = sourceNode.y;
    if (existingChildren.length > 0) {
      // Find the child with maximum Y
      const maxYChild = existingChildren.reduce((max, c) => (c.y > max.y ? c : max), existingChildren[0]);
      const childHeight = maxYChild.height || 44;
      nextY = maxYChild.y + childHeight + 20;
    }

    const childNode: MindmapNode = {
      id: newChildId,
      workspaceId: sourceNode.workspaceId,
      type: 'child',
      isParent: false,
      parentId: sourceNode.id,
      text: 'New topic',
      x: sourceNode.x + sourceWidth + 70,
      y: nextY,
      width: 150,
      fontFamily: sourceNode.fontFamily || 'sans',
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
    };

    onUpdateNodes([...nodes, childNode]);
    createConnection(sourceNode.id, newChildId);
    onSelectNode(newChildId);
    setEditingNodeId(newChildId);
  };

  // Add Node to Left with clean spacing
  const handleAddNodeToLeft = (sourceNode: MindmapNode) => {
    const newLeftId = 'node-' + Date.now();

    const existingLeftConns = connections.filter(
      (c) => c.targetNodeId === sourceNode.id || c.sourceNodeId === sourceNode.id
    );
    const existingLeftNodes = nodes.filter(
      (n) => n.id !== sourceNode.id && n.x < sourceNode.x && existingLeftConns.some((c) => c.sourceNodeId === n.id || c.targetNodeId === n.id)
    );

    let nextY = sourceNode.y;
    if (existingLeftNodes.length > 0) {
      const maxYNode = existingLeftNodes.reduce((max, c) => (c.y > max.y ? c : max), existingLeftNodes[0]);
      nextY = maxYNode.y + (maxYNode.height || 44) + 20;
    }

    const leftNode: MindmapNode = {
      id: newLeftId,
      workspaceId: sourceNode.workspaceId,
      type: 'child',
      isParent: false,
      text: 'New topic',
      x: sourceNode.x - 220,
      y: nextY,
      width: 150,
      fontFamily: sourceNode.fontFamily || 'sans',
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
    };

    onUpdateNodes([...nodes, leftNode]);
    createConnection(sourceNode.id, newLeftId);
    onSelectNode(newLeftId);
    setEditingNodeId(newLeftId);
  };

  // Add Parent Node (Multiple parent nodes supported!)
  const handleAddParentNode = () => {
    const newParentId = 'node-' + Date.now();
    const wsId = nodes[0]?.workspaceId || 'ws-default';

    const parentNode: MindmapNode = {
      id: newParentId,
      workspaceId: wsId,
      type: 'parent',
      isParent: true,
      text: 'Main Topic',
      x: (440 - pan.x) / zoom,
      y: (260 - pan.y) / zoom,
      width: 160,
      height: 48,
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

    onUpdateNodes([...nodes, parentNode]);
    onSelectNode(newParentId);
    setEditingNodeId(newParentId);
  };

  // Add Sticky Note
  const handleAddStickyNote = (connectedNodeId?: string) => {
    const newStickyId = 'sticky-' + Date.now();
    const wsId = nodes[0]?.workspaceId || 'ws-default';

    let targetX = (500 - pan.x) / zoom;
    let targetY = (340 - pan.y) / zoom;

    if (connectedNodeId) {
      const refNode = nodes.find((n) => n.id === connectedNodeId);
      if (refNode) {
        targetX = refNode.x + 40;
        targetY = refNode.y + (refNode.height || 50) + 60;
      }
    }

    const stickyNode: MindmapNode = {
      id: newStickyId,
      workspaceId: wsId,
      type: 'sticky',
      isParent: false,
      text: 'Note details...',
      x: targetX,
      y: targetY,
      width: 170,
      height: 140,
      fontFamily: 'sans',
      fontSize: 'sm',
      bold: false,
      italic: false,
      underline: false,
      strikethrough: false,
      textAlign: 'left',
      bgColor: '#FEF9C3',
      textColor: '#422006',
      borderColor: '#FDE047',
      borderWidth: 1,
      borderStyle: 'solid',
      shape: 'rounded',
      shadow: 'subtle',
      opacity: 98,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onUpdateNodes([...nodes, stickyNode]);
    if (connectedNodeId) {
      createConnection(connectedNodeId, newStickyId);
    }
    onSelectNode(newStickyId);
    setEditingNodeId(newStickyId);
  };

  const handleDeleteNode = (id: string) => {
    onUpdateNodes(nodes.filter((n) => n.id !== id));
    onUpdateConnections(connections.filter((c) => c.sourceNodeId !== id && c.targetNodeId !== id));
    if (selectedNodeId === id) onSelectNode(null);
  };

  const handleDuplicateNode = (node: MindmapNode) => {
    const dupId = 'node-' + Date.now();
    const dupNode: MindmapNode = {
      ...node,
      id: dupId,
      text: `${node.text} (Copy)`,
      x: node.x + 30,
      y: node.y + 40,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onUpdateNodes([...nodes, dupNode]);
    onSelectNode(dupId);
  };

  const handleToggleConnectorStyle = (style: ConnectorStyle) => {
    if (!selectedNodeId) return;
    const updated = connections.map((c) => {
      if (c.sourceNodeId === selectedNodeId || c.targetNodeId === selectedNodeId) {
        return { ...c, style };
      }
      return c;
    });
    onUpdateConnections(updated);
  };

  // SMART CONNECTOR ROUTER: Dynamically computes best exit & entry anchors based on relative node positions!
  const getSmartConnectorPath = (conn: NodeConnection) => {
    const s = nodes.find((n) => n.id === conn.sourceNodeId);
    const t = nodes.find((n) => n.id === conn.targetNodeId);
    if (!s || !t) return '';

    const sWidth = s.width || (s.type === 'sticky' ? 170 : 150);
    const sHeight = s.height || (s.type === 'sticky' ? 140 : 44);
    const tWidth = t.width || (t.type === 'sticky' ? 170 : 150);
    const tHeight = t.height || (t.type === 'sticky' ? 140 : 44);

    // Centers
    const scx = s.x + sWidth / 2;
    const scy = s.y + sHeight / 2;
    const tcx = t.x + tWidth / 2;
    const tcy = t.y + tHeight / 2;

    const dx = tcx - scx;
    const dy = tcy - scy;

    let sx = s.x + sWidth;
    let sy = scy;
    let tx = t.x;
    let ty = tcy;

    // Horizontal vs Vertical alignment
    if (Math.abs(dx) >= Math.abs(dy)) {
      if (dx >= 0) {
        // Target is to the RIGHT
        sx = s.x + sWidth;
        sy = scy;
        tx = t.x;
        ty = tcy;
        const curveOffset = Math.max(30, Math.abs(tx - sx) * 0.5);
        return `M ${sx} ${sy} C ${sx + curveOffset} ${sy}, ${tx - curveOffset} ${ty}, ${tx} ${ty}`;
      } else {
        // Target is to the LEFT
        sx = s.x;
        sy = scy;
        tx = t.x + tWidth;
        ty = tcy;
        const curveOffset = Math.max(30, Math.abs(sx - tx) * 0.5);
        return `M ${sx} ${sy} C ${sx - curveOffset} ${sy}, ${tx + curveOffset} ${ty}, ${tx} ${ty}`;
      }
    } else {
      if (dy >= 0) {
        // Target is BELOW
        sx = scx;
        sy = s.y + sHeight;
        tx = tcx;
        ty = t.y;
        const curveOffset = Math.max(30, Math.abs(ty - sy) * 0.5);
        return `M ${sx} ${sy} C ${sx} ${sy + curveOffset}, ${tx} ${ty - curveOffset}, ${tx} ${ty}`;
      } else {
        // Target is ABOVE
        sx = scx;
        sy = s.y;
        tx = tcx;
        ty = t.y + tHeight;
        const curveOffset = Math.max(30, Math.abs(sy - ty) * 0.5);
        return `M ${sx} ${sy} C ${sx} ${sy - curveOffset}, ${tx} ${ty + curveOffset}, ${tx} ${ty}`;
      }
    }
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onPointerDown={handleCanvasPointerDown}
      className={`relative flex-1 h-full overflow-hidden select-none bg-[#FBFBFA] dark:bg-[#191919] bg-notion-dots ${
        isSpacePressed || isPanning ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
      }`}
    >
      <div id="canvas-bg" className="absolute inset-0 pointer-events-auto" />

      {/* Top Left Tool Strip */}
      <div className="absolute top-4 left-6 z-30 flex items-center gap-2">
        <button
          onClick={handleAddParentNode}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#202020] hover:bg-[#F1F1EF] dark:hover:bg-[#2B2B2B] border border-[#E9E9E7] dark:border-[#2E2E2E] rounded-lg text-xs font-semibold text-[#37352F] dark:text-[#E6E6E5] shadow-xs transition-colors cursor-pointer"
          title="Add independent Root / Parent node"
        >
          <GitBranch className="w-3.5 h-3.5 text-purple-600" />
          <span>+ Parent Node</span>
        </button>

        <button
          onClick={() => handleAddStickyNote()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#202020] hover:bg-[#F1F1EF] dark:hover:bg-[#2B2B2B] border border-[#E9E9E7] dark:border-[#2E2E2E] rounded-lg text-xs font-medium text-[#37352F] dark:text-[#E6E6E5] shadow-xs transition-colors cursor-pointer"
          title="Add flexible sticky note"
        >
          <StickyNote className="w-3.5 h-3.5 text-amber-500" />
          <span>+ Sticky Note</span>
        </button>

        {/* Click-to-Connect Active Notice Banner */}
        {isClickConnectMode && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-medium shadow-md animate-in fade-in">
            <Cable className="w-3.5 h-3.5 animate-pulse" />
            <span>Click any node to connect</span>
            <button
              onClick={() => setIsClickConnectMode(null)}
              className="p-0.5 hover:bg-purple-700 rounded cursor-pointer ml-1"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Bottom Right Zoom HUD */}
      <div className="absolute bottom-6 right-6 z-30 flex items-center gap-1 bg-white/90 dark:bg-[#202020]/90 backdrop-blur-xs border border-[#E9E9E7] dark:border-[#2E2E2E] rounded-lg p-1 shadow-sm text-xs text-[#37352F] dark:text-[#E6E6E5]">
        <button
          onClick={() => setZoom((z) => Math.max(0.25, z - 0.1))}
          className="p-1.5 rounded hover:bg-[#F1F1EF] dark:hover:bg-[#2B2B2B] cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <span className="px-2 font-mono text-[11px] tabular-nums min-w-[42px] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom((z) => Math.min(2.5, z + 0.1))}
          className="p-1.5 rounded hover:bg-[#F1F1EF] dark:hover:bg-[#2B2B2B] cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <div className="w-[1px] h-3 bg-[#E9E9E7] dark:bg-[#2E2E2E] mx-0.5" />
        <button
          onClick={() => {
            setZoom(1);
            setPan({ x: 140, y: 160 });
          }}
          className="p-1.5 rounded hover:bg-[#F1F1EF] dark:hover:bg-[#2B2B2B] cursor-pointer"
          title="Reset Canvas View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Transformed World Layer */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
        className="absolute inset-0 pointer-events-none"
      >
        {/* SVG Connectors */}
        <svg className="absolute overflow-visible w-full h-full pointer-events-none">
          {connections.map((conn) => {
            const pathData = getSmartConnectorPath(conn);
            if (!pathData) return null;

            const isSelected = conn.id === selectedConnId;
            const isDashed = conn.style === 'dashed';
            const isDotted = conn.style === 'dotted';

            return (
              <g
                key={conn.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedConnId(conn.id);
                  onSelectNode(null);
                }}
                className="pointer-events-auto cursor-pointer group"
              >
                {/* Thick invisible hit-test area */}
                <path d={pathData} fill="none" stroke="transparent" strokeWidth="18" />
                {/* Visible stroke */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={isSelected ? '#9333EA' : conn.color || '#C0C0C6'}
                  strokeWidth={isSelected ? 2.5 : conn.width || 1.5}
                  strokeDasharray={isDashed ? '6,5' : isDotted ? '2,4' : undefined}
                  className="transition-all"
                />
              </g>
            );
          })}

          {/* Interactive line when dragging connector */}
          {connectingSourceId && (
            <line
              x1={
                (nodes.find((n) => n.id === connectingSourceId)?.x || 0) +
                ((nodes.find((n) => n.id === connectingSourceId)?.width || 150) / 2)
              }
              y1={
                (nodes.find((n) => n.id === connectingSourceId)?.y || 0) +
                ((nodes.find((n) => n.id === connectingSourceId)?.height || 44) / 2)
              }
              x2={mouseCanvasPos.x}
              y2={mouseCanvasPos.y}
              stroke="#9333EA"
              strokeWidth="2"
              strokeDasharray="4,4"
            />
          )}
        </svg>

        {/* Nodes Layer */}
        {nodes.map((node) => {
          const isSelected = node.id === selectedNodeId;
          const isEditing = node.id === editingNodeId;
          const isSticky = node.type === 'sticky';
          const nodeWidth = node.width || (isSticky ? 170 : 150);
          const nodeHeight = node.height || (isSticky ? 140 : 44);

          return (
            <div
              key={node.id}
              id={`node-${node.id}`}
              onPointerDown={(e) => handleNodePointerDown(e, node)}
              onPointerUp={(e) => {
                // If dragging a connection handle and dropping on another node
                if (connectingSourceId && connectingSourceId !== node.id) {
                  createConnection(connectingSourceId, node.id);
                  setConnectingSourceId(null);
                }
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                setEditingNodeId(node.id);
              }}
              style={{
                transform: `translate(${node.x}px, ${node.y}px)`,
                backgroundColor: node.bgColor || (isSticky ? '#FEF9C3' : '#FFFFFF'),
                color: node.textColor || (isSticky ? '#422006' : '#242426'),
                borderColor: isSelected
                  ? '#9333EA'
                  : node.borderColor || (isSticky ? '#FDE047' : '#E3E2E0'),
                borderWidth: isSelected ? '2px' : `${node.borderWidth || 1}px`,
                borderStyle: node.borderStyle || 'solid',
                borderRadius: isSticky ? '6px' : node.shape === 'sharp' ? '0px' : '12px',
                boxShadow: isSelected
                  ? '0 0 0 3px rgba(147, 51, 234, 0.25), 0 4px 14px rgba(0,0,0,0.08)'
                  : isSticky
                  ? '0 2px 8px rgba(0,0,0,0.06)'
                  : '0 1px 4px rgba(0,0,0,0.05)',
                fontFamily:
                  node.fontFamily === 'serif'
                    ? 'Source Serif 4, Georgia, serif'
                    : node.fontFamily === 'mono'
                    ? 'JetBrains Mono, monospace'
                    : 'Plus Jakarta Sans, sans-serif',
                opacity: (node.opacity ?? 100) / 100,
                width: `${nodeWidth}px`,
                minHeight: `${nodeHeight}px`,
              }}
              className={`absolute pointer-events-auto cursor-grab active:cursor-grabbing p-3 transition-shadow group flex flex-col justify-between ${
                isSelected ? 'z-30' : 'z-10'
              } ${isClickConnectMode && isClickConnectMode !== node.id ? 'ring-2 ring-purple-400 ring-dashed' : ''}`}
            >
              {/* Floating Toolbar above Selected Node */}
              {isSelected && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 pointer-events-auto">
                  <NodeFloatingToolbar
                    node={node}
                    onUpdateNode={(updated) => {
                      onUpdateNodes(nodes.map((n) => (n.id === updated.id ? updated : n)));
                    }}
                    onDeleteNode={handleDeleteNode}
                    onDuplicateNode={handleDuplicateNode}
                    onAddChild={handleAddChildToRight}
                    onAddSibling={(ref) => handleAddChildToRight(ref)}
                    onAddStickyNote={handleAddStickyNote}
                    onOpenDocument={onOpenDocument}
                    onStartConnecting={(id) => setIsClickConnectMode(id)}
                    onToggleConnectorStyle={handleToggleConnectorStyle}
                  />
                </div>
              )}

              {/* Purple '+' Button on Left Edge */}
              {isSelected && !isSticky && (
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddNodeToLeft(node);
                  }}
                  title="Add node to the left"
                  className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#9333EA] hover:bg-[#7E22CE] text-white flex items-center justify-center shadow-md hover:scale-110 transition-transform cursor-pointer z-40"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              )}

              {/* Purple '+' Button on Right Edge */}
              {isSelected && !isSticky && (
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddChildToRight(node);
                  }}
                  title="Add child node to the right (Tab)"
                  className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#9333EA] hover:bg-[#7E22CE] text-white flex items-center justify-center shadow-md hover:scale-110 transition-transform cursor-pointer z-40"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              )}

              {/* 4 Multi-Directional Connector Anchor Dots (Top, Right, Bottom, Left) to connect ANY node to ANY node */}
              <div
                onPointerDown={(e) => {
                  e.stopPropagation();
                  setConnectingSourceId(node.id);
                }}
                title="Drag to connect"
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white dark:bg-[#202020] border-2 border-purple-500 opacity-0 group-hover:opacity-100 hover:scale-125 transition-all cursor-crosshair z-40"
              />
              <div
                onPointerDown={(e) => {
                  e.stopPropagation();
                  setConnectingSourceId(node.id);
                }}
                title="Drag to connect"
                className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 rounded-full bg-white dark:bg-[#202020] border-2 border-purple-500 opacity-0 group-hover:opacity-100 hover:scale-125 transition-all cursor-crosshair z-40"
              />
              <div
                onPointerDown={(e) => {
                  e.stopPropagation();
                  setConnectingSourceId(node.id);
                }}
                title="Drag to connect"
                className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white dark:bg-[#202020] border-2 border-purple-500 opacity-0 group-hover:opacity-100 hover:scale-125 transition-all cursor-crosshair z-40"
              />
              <div
                onPointerDown={(e) => {
                  e.stopPropagation();
                  setConnectingSourceId(node.id);
                }}
                title="Drag to connect"
                className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white dark:bg-[#202020] border-2 border-purple-500 opacity-0 group-hover:opacity-100 hover:scale-125 transition-all cursor-crosshair z-40"
              />

              {/* Image Frame with in-place pan/crop, height resize handle, and auto-fit controls */}
              {node.image && (() => {
                const effectiveImageHeight =
                  node.image.fit === 'auto' && node.image.naturalAspectRatio
                    ? Math.round((node.width || 180) / node.image.naturalAspectRatio)
                    : node.image.height || 180;

                const isAutoFit = node.image.fit === 'auto';
                const isContain = node.image.fit === 'contain';
                const isCover = node.image.fit === 'cover' || (!node.image.fit && !isAutoFit);

                return (
                  <div className="relative mb-2 rounded-md overflow-hidden bg-neutral-100 dark:bg-neutral-800/90 border border-neutral-200/90 dark:border-neutral-700/80 group/img select-none">
                    {/* Image Viewport (Draggable to Pan & Crop) */}
                    <div
                      onPointerDown={(e) => {
                        if ((e.target as HTMLElement).closest('button')) return;
                        e.stopPropagation();
                        imagePanRef.current = {
                          activeNodeId: node.id,
                          startClientX: e.clientX,
                          startClientY: e.clientY,
                          startPanX: node.image?.panX || 0,
                          startPanY: node.image?.panY || 0,
                        };
                      }}
                      style={{
                        height: `${effectiveImageHeight}px`,
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                      className="cursor-grab active:cursor-grabbing relative flex items-center justify-center transition-[height] duration-75"
                      title="Drag to reposition / pan image inside frame"
                    >
                      <img
                        src={node.image.url}
                        alt={node.text}
                        referrerPolicy="no-referrer"
                        onLoad={(e) => {
                          const naturalW = e.currentTarget.naturalWidth;
                          const naturalH = e.currentTarget.naturalHeight;
                          if (naturalW && naturalH) {
                            const aspect = naturalW / naturalH;
                            if (node.image && !node.image.naturalAspectRatio) {
                              onUpdateNodes(
                                nodes.map((n) =>
                                  n.id === node.id && n.image
                                    ? {
                                        ...n,
                                        image: {
                                          ...n.image,
                                          naturalAspectRatio: aspect,
                                          height:
                                            n.image.fit === 'auto'
                                              ? Math.round((n.width || 180) / aspect)
                                              : n.image.height || 180,
                                        },
                                      }
                                    : n
                                )
                              );
                            }
                          }
                        }}
                        style={{
                          transform: `translate(${node.image.panX || 0}px, ${
                            node.image.panY || 0
                          }px) scale(${node.image.zoom || 1})`,
                          transformOrigin: 'center center',
                          objectFit: isCover ? 'cover' : 'contain',
                          width: '100%',
                          height: '100%',
                        }}
                        className="pointer-events-none select-none transition-transform duration-75"
                      />

                      {/* Top Overlay HUD: Fit Mode & Reset */}
                      <div className="absolute top-1.5 inset-x-1.5 flex items-center justify-between opacity-0 group-hover/img:opacity-100 transition-opacity z-20 pointer-events-auto">
                        {/* Fit Modes (Auto, Fit, Fill) */}
                        <div className="flex items-center gap-0.5 bg-black/75 backdrop-blur-md rounded-md p-0.5 text-[9px] text-white shadow-md">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const aspect = node.image?.naturalAspectRatio || 1;
                              const autoH = Math.round((node.width || 180) / aspect);
                              onUpdateNodes(
                                nodes.map((n) =>
                                  n.id === node.id && n.image
                                    ? {
                                        ...n,
                                        image: {
                                          ...n.image,
                                          fit: 'auto',
                                          height: autoH,
                                          panX: 0,
                                          panY: 0,
                                        },
                                      }
                                    : n
                                )
                              );
                            }}
                            className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                              isAutoFit
                                ? 'bg-purple-600 text-white font-semibold'
                                : 'hover:bg-white/20 text-neutral-300'
                            }`}
                            title="Auto (Original aspect ratio, never cut off)"
                          >
                            Auto
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateNodes(
                                nodes.map((n) =>
                                  n.id === node.id && n.image
                                    ? { ...n, image: { ...n.image, fit: 'contain' } }
                                    : n
                                )
                              );
                            }}
                            className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                              isContain
                                ? 'bg-purple-600 text-white font-semibold'
                                : 'hover:bg-white/20 text-neutral-300'
                            }`}
                            title="Fit (Fit entire image in frame)"
                          >
                            Fit
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateNodes(
                                nodes.map((n) =>
                                  n.id === node.id && n.image
                                    ? { ...n, image: { ...n.image, fit: 'cover' } }
                                    : n
                                )
                              );
                            }}
                            className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                              isCover && !isAutoFit
                                ? 'bg-purple-600 text-white font-semibold'
                                : 'hover:bg-white/20 text-neutral-300'
                            }`}
                            title="Fill (Fill entire frame)"
                          >
                            Fill
                          </button>
                        </div>

                        {/* Reset Zoom & Pan button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateNodes(
                              nodes.map((n) =>
                                n.id === node.id && n.image
                                  ? {
                                      ...n,
                                      image: {
                                        ...n.image,
                                        zoom: 1,
                                        panX: 0,
                                        panY: 0,
                                      },
                                    }
                                  : n
                              )
                            );
                          }}
                          className="flex items-center gap-1 bg-black/75 hover:bg-black/90 backdrop-blur-md rounded-md px-1.5 py-0.5 text-[9px] text-neutral-200 hover:text-white cursor-pointer shadow-md transition-colors"
                          title="Reset zoom and center image"
                        >
                          <RotateCcw className="w-2.5 h-2.5" />
                          <span>Reset</span>
                        </button>
                      </div>

                      {/* Bottom Overlay HUD: Pan hint & Zoom controls */}
                      <div className="absolute bottom-1.5 inset-x-1.5 flex items-center justify-between opacity-0 group-hover/img:opacity-100 transition-opacity z-20 pointer-events-auto">
                        <div className="flex items-center gap-1 bg-black/75 backdrop-blur-md rounded px-1.5 py-0.5 text-[9px] text-neutral-300 shadow-md">
                          <Move className="w-2.5 h-2.5" />
                          <span>Drag to pan</span>
                        </div>

                        <div className="flex items-center gap-1 bg-black/75 backdrop-blur-md rounded px-1.5 py-0.5 text-white shadow-md text-[9px]">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateNodes(
                                nodes.map((n) =>
                                  n.id === node.id && n.image
                                    ? {
                                        ...n,
                                        image: {
                                          ...n.image,
                                          zoom: Math.max(0.4, Number(((n.image.zoom || 1) - 0.1).toFixed(2))),
                                        },
                                      }
                                    : n
                                )
                              );
                            }}
                            className="hover:text-purple-400 cursor-pointer p-0.5"
                            title="Zoom Out"
                          >
                            <ZoomOut className="w-3 h-3" />
                          </button>
                          <span className="font-mono text-[9px] tabular-nums min-w-[30px] text-center">
                            {Math.round((node.image.zoom || 1) * 100)}%
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateNodes(
                                nodes.map((n) =>
                                  n.id === node.id && n.image
                                    ? {
                                        ...n,
                                        image: {
                                          ...n.image,
                                          zoom: Math.min(3.0, Number(((n.image.zoom || 1) + 0.1).toFixed(2))),
                                        },
                                      }
                                    : n
                                )
                              );
                            }}
                            className="hover:text-purple-400 cursor-pointer p-0.5"
                            title="Zoom In"
                          >
                            <ZoomIn className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Frame Height Resize Bar */}
                    <div
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        imageResizeRef.current = {
                          activeNodeId: node.id,
                          startClientY: e.clientY,
                          startHeight: effectiveImageHeight,
                        };
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        // Double-click auto-fits to natural aspect ratio
                        if (node.image?.naturalAspectRatio) {
                          const autoH = Math.round((node.width || 180) / node.image.naturalAspectRatio);
                          onUpdateNodes(
                            nodes.map((n) =>
                              n.id === node.id && n.image
                                ? { ...n, image: { ...n.image, height: autoH, fit: 'auto' } }
                                : n
                            )
                          );
                        }
                      }}
                      title="Drag down to expand image height, double-click to auto-fit aspect ratio"
                      className="h-2 w-full bg-neutral-200/80 dark:bg-neutral-700/80 hover:bg-purple-500 active:bg-purple-600 cursor-row-resize flex items-center justify-center transition-colors group/grip z-30"
                    >
                      <div className="w-6 h-0.5 rounded-full bg-neutral-400 dark:bg-neutral-500 group-hover/grip:bg-white transition-colors" />
                    </div>
                  </div>
                );
              })()}

              {/* Text Area / Content */}
              {isEditing ? (
                <textarea
                  value={node.text}
                  onChange={(e) => {
                    const newText = e.target.value;
                    onUpdateNodes(
                      nodes.map((n) => (n.id === node.id ? { ...n, text: newText } : n))
                    );
                  }}
                  onBlur={() => setEditingNodeId(null)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      setEditingNodeId(null);
                    }
                  }}
                  autoFocus
                  rows={isSticky ? 4 : 2}
                  className="w-full bg-transparent border-0 focus:outline-none resize-none text-inherit font-inherit leading-snug p-0"
                />
              ) : (
                <div
                  style={{
                    textAlign: node.textAlign,
                    fontWeight: node.bold ? 700 : 400,
                    fontStyle: node.italic ? 'italic' : 'normal',
                    textDecoration: [
                      node.underline ? 'underline' : '',
                      node.strikethrough ? 'line-through' : '',
                    ]
                      .filter(Boolean)
                      .join(' '),
                  }}
                  className={`leading-snug break-words ${
                    node.fontSize === 'xs'
                      ? 'text-xs'
                      : node.fontSize === 'sm'
                      ? 'text-sm'
                      : node.fontSize === 'lg'
                      ? 'text-base font-semibold'
                      : node.fontSize === 'xl'
                      ? 'text-lg font-bold'
                      : node.fontSize === '2xl'
                      ? 'text-xl font-bold'
                      : 'text-sm'
                  }`}
                >
                  {node.text}
                </div>
              )}

              {/* Document & Link Badges */}
              {(node.document || node.link) && !isSticky && (
                <div className="flex items-center gap-1.5 mt-2 pt-1.5 border-t border-black/5 dark:border-white/10 text-[10px]">
                  {node.document && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDocument(node);
                      }}
                      className="flex items-center gap-1 text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                    >
                      <FileText className="w-3 h-3" />
                      <span>Note</span>
                    </button>
                  )}
                  {node.link?.url && (
                    <a
                      href={node.link.url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <ExternalLink className="w-2.5 h-2.5" />
                      <span className="truncate max-w-[80px]">{node.link.title || 'Link'}</span>
                    </a>
                  )}
                </div>
              )}

              {/* INTERACTIVE RESIZE HANDLES (Bottom-Right, Right Edge, Bottom Edge) */}
              {isSelected && (
                <>
                  {/* Bottom-Right Corner (Resize Both Width & Height) */}
                  <div
                    data-resize="se"
                    onPointerDown={(e) => handleStartResize(e, node, 'se')}
                    title="Drag to resize width and height"
                    className="absolute -right-1.5 -bottom-1.5 w-3.5 h-3.5 rounded bg-purple-600 border border-white dark:border-[#202020] cursor-se-resize z-50 shadow-xs hover:scale-125 transition-transform"
                  />
                  {/* Right Edge (Resize Width) */}
                  <div
                    data-resize="e"
                    onPointerDown={(e) => handleStartResize(e, node, 'e')}
                    title="Drag to resize width"
                    className="absolute right-0 top-3 bottom-3 w-1.5 cursor-e-resize hover:bg-purple-500/50 z-40"
                  />
                  {/* Bottom Edge (Resize Height) */}
                  <div
                    data-resize="s"
                    onPointerDown={(e) => handleStartResize(e, node, 's')}
                    title="Drag to resize height"
                    className="absolute bottom-0 left-3 right-3 h-1.5 cursor-s-resize hover:bg-purple-500/50 z-40"
                  />
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Connector Quick Controls */}
      {selectedConnId && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 bg-[#1F1F23] text-white border border-[#38383D] rounded-xl px-3 py-2 shadow-2xl text-xs font-sans animate-in fade-in">
          <span className="text-neutral-400 font-medium">Connector:</span>

          <button
            onClick={() => {
              onUpdateConnections(
                connections.map((c) => (c.id === selectedConnId ? { ...c, style: 'solid' } : c))
              );
            }}
            className={`px-2 py-0.5 rounded cursor-pointer ${
              connections.find((c) => c.id === selectedConnId)?.style === 'solid'
                ? 'bg-purple-600 text-white font-medium'
                : 'text-neutral-300 hover:bg-[#34343A]'
            }`}
          >
            Solid
          </button>

          <button
            onClick={() => {
              onUpdateConnections(
                connections.map((c) => (c.id === selectedConnId ? { ...c, style: 'dashed' } : c))
              );
            }}
            className={`px-2 py-0.5 rounded cursor-pointer ${
              connections.find((c) => c.id === selectedConnId)?.style === 'dashed'
                ? 'bg-purple-600 text-white font-medium'
                : 'text-neutral-300 hover:bg-[#34343A]'
            }`}
          >
            Dashed (Putus)
          </button>

          <button
            onClick={() => {
              onUpdateConnections(
                connections.map((c) => (c.id === selectedConnId ? { ...c, style: 'dotted' } : c))
              );
            }}
            className={`px-2 py-0.5 rounded cursor-pointer ${
              connections.find((c) => c.id === selectedConnId)?.style === 'dotted'
                ? 'bg-purple-600 text-white font-medium'
                : 'text-neutral-300 hover:bg-[#34343A]'
            }`}
          >
            Dotted
          </button>

          <div className="w-[1px] h-3.5 bg-[#38383D] mx-1" />

          <button
            onClick={() => {
              onUpdateConnections(connections.filter((c) => c.id !== selectedConnId));
              setSelectedConnId(null);
            }}
            className="p-1 text-red-400 hover:text-red-300 rounded hover:bg-red-950/60 cursor-pointer flex items-center gap-1"
            title="Delete connector"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
};
