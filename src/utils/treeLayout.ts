import {MindMapNode} from '../common/structs';

export type PositionedNode = {
  id: string;
  name: string;
  depth: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
};

export type Edge = {
  from: string;
  to: string;
};

export type LayoutConfig = {
  nodeWidth: number;
  nodeHeight: number;
  hGap: number;
  vGap: number;
};

type BuildNode = {
  id: string;
  data: MindMapNode;
  depth: number;
  children: BuildNode[];
};

export function computeTreeLayout(
  root: MindMapNode,
  config: LayoutConfig,
): {nodes: PositionedNode[]; edges: Edge[]; rootId: string} {
  
  const build = (data: MindMapNode, depth: number): BuildNode => ({
    id: data.id,
    data,
    depth,
    children: (data.children ?? []).map((c) => build(c, depth + 1)),
  });

  const tree = build(root, 0);

  let leaf = 0;
  const yIndex = new Map<string, number>();

  const assignY = (node: BuildNode) => {
    if (node.children.length === 0) {
      yIndex.set(node.id, leaf);
      leaf += 1;
      return yIndex.get(node.id)!;
    }
    let sum = 0;
    for (const child of node.children) {
      sum += assignY(child);
    }
    const avg = sum / node.children.length;
    yIndex.set(node.id, avg);
    return avg;
  };
  assignY(tree);

  const nodes: PositionedNode[] = [];
  const edges: Edge[] = [];

  const walk = (node: BuildNode) => {
    const x = node.depth * (config.nodeWidth + config.hGap);
    const y = (yIndex.get(node.id)! * (config.nodeHeight + config.vGap));
    
    nodes.push({
      id: node.id,
      name: node.data.name,
      depth: node.depth,
      x,
      y,
      width: config.nodeWidth,
      height: config.nodeHeight,
      color: node.data.color || '#333333',
    });
    for (const child of node.children) {
      edges.push({from: node.id, to: child.id});
      walk(child);
    }
  };
  walk(tree);

  return {nodes, edges, rootId: tree.id};
}
