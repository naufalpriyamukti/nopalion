import { MindmapNode, NodeConnection } from '../types/mindmap';

interface ParsedOutlineItem {
  id: string;
  text: string;
  level: number;
  parentId?: string | null;
  children: ParsedOutlineItem[];
}

/**
 * Parses Notion outlines (bullet points, toggle lists, numbered items, indentations)
 * and generates structured Mindmap nodes and connections with auto-layout.
 */
export function parseNotionOutlineToMindmap(
  rawText: string,
  workspaceId: string,
  baseX = 300,
  baseY = 240
): { nodes: MindmapNode[]; connections: NodeConnection[] } {
  const lines = rawText
    .split('\n')
    .map((l) => l.replace(/\r/g, ''))
    .filter((l) => l.trim().length > 0);

  if (lines.length === 0) {
    return { nodes: [], connections: [] };
  }

  // Parse lines into hierarchy based on leading spaces/tabs, markdown headings, or bullet levels
  const items: { text: string; level: number }[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check if line is a markdown heading (#, ##, ###)
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const headingLevel = headingMatch[1].length - 1; // # -> 0, ## -> 1, ### -> 2
      items.push({
        text: headingMatch[2].trim(),
        level: headingLevel,
      });
      continue;
    }

    // Count leading indentation (tabs = 2 spaces, 2 spaces = 1 indent level)
    const leadingWhitespaceMatch = line.match(/^(\s*)/);
    const leadingSpaces = leadingWhitespaceMatch
      ? leadingWhitespaceMatch[1].replace(/\t/g, '  ').length
      : 0;
    const indentLevel = Math.floor(leadingSpaces / 2);

    // Clean Notion markers: bullets (- * •), numbers (1., 2.), toggles (> ), checkboxes (- [ ] / - [x])
    let cleanText = trimmed;
    cleanText = cleanText.replace(/^([-*•+]|\d+\.|\>\s*|- \[[ xX]\])\s*/, '').trim();

    if (cleanText) {
      items.push({ text: cleanText, level: indentLevel });
    }
  }

  if (items.length === 0) {
    return { nodes: [], connections: [] };
  }

  // Build tree structure
  const nodes: MindmapNode[] = [];
  const connections: NodeConnection[] = [];

  // Track parent at each level
  const parentStack: { id: string; level: number; x: number; y: number; childCount: number }[] = [];
  let rootYTracker = baseY;
  const levelYTracker: Record<number, number> = {};

  items.forEach((item, index) => {
    const nodeId = 'notion-node-' + Date.now() + '-' + index;
    const isRoot = item.level === 0 || parentStack.length === 0;

    // Pop stack until we find the parent of this level
    while (parentStack.length > 0 && parentStack[parentStack.length - 1].level >= item.level) {
      parentStack.pop();
    }

    const currentParent = parentStack.length > 0 ? parentStack[parentStack.length - 1] : null;

    // Compute coordinates
    let x = baseX;
    let y = baseY;

    if (isRoot) {
      // Root parent node (can be multiple root parents in the same workspace)
      x = baseX;
      y = rootYTracker;
      rootYTracker += 220;
      levelYTracker[0] = y;
      levelYTracker[1] = y - 40;
    } else if (currentParent) {
      // Child node placed to the right of its parent
      x = currentParent.x + (currentParent.level === 0 ? 240 : 200);
      const prevLevelY = levelYTracker[item.level] ?? currentParent.y;
      y = Math.max(prevLevelY + 58, currentParent.y + (currentParent.childCount - 1) * 58);
      levelYTracker[item.level] = y;
      currentParent.childCount += 1;
    }

    const isParentNode = isRoot || item.level === 0;
    const isLevelOne = item.level === 1;

    const newNode: MindmapNode = {
      id: nodeId,
      workspaceId,
      type: isParentNode ? 'parent' : 'child',
      isParent: isParentNode,
      parentId: currentParent?.id || null,
      text: item.text,
      x,
      y,
      width: isParentNode ? 180 : isLevelOne ? 160 : 145,
      fontFamily: isParentNode ? 'serif' : 'sans',
      fontSize: isParentNode ? 'base' : isLevelOne ? 'sm' : 'xs',
      bold: isParentNode || isLevelOne,
      italic: false,
      underline: false,
      strikethrough: false,
      textAlign: isParentNode ? 'center' : 'left',
      bgColor: isParentNode ? '#242426' : '#FFFFFF',
      textColor: isParentNode ? '#FFFFFF' : '#242426',
      borderColor: isParentNode ? '#3D3D42' : '#E3E2E0',
      borderWidth: 1,
      borderStyle: 'solid',
      shape: 'rounded',
      shadow: isParentNode ? 'medium' : 'subtle',
      opacity: 100,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    nodes.push(newNode);

    if (currentParent) {
      connections.push({
        id: 'conn-notion-' + Date.now() + '-' + index,
        workspaceId,
        sourceNodeId: currentParent.id,
        targetNodeId: nodeId,
        type: 'bezier',
        style: 'solid',
        color: '#B0B0B5',
        width: 1.5,
        showArrow: false,
      });
    }

    parentStack.push({
      id: nodeId,
      level: item.level,
      x,
      y,
      childCount: 0,
    });
  });

  return { nodes, connections };
}
