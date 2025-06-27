import React from "react";

interface NodeData {
  id: string;
  label: string;
}

interface EdgeData {
  from: string;
  to: string;
  type: string;
  description: string;
}

export interface ConnectionsGraphProps {
  data: {
    nodes: NodeData[];
    edges: EdgeData[];
  };
  width?: number;
  height?: number;
}

const getNodeLayer = (id: string): number => {
  if (id === "app" || id === "modules") return 0;
  if (id === "api") return 1;
  if (id === "server" || id === "plugins" || id === "agents") return 2;
  if (id === "llm_models" || id === "llm_runners") return 3;
  if (id === "database" || id === "websocket") return 4;
  return 2;
};

interface NodePosition extends NodeData {
  x: number;
  y: number;
  layer: number;
}

function getLayeredPositions(
  nodes: NodeData[],
  width: number,
  height: number
): NodePosition[] {
  // Group nodes by layer
  const layerMap = new Map<number, NodeData[]>();
  nodes.forEach((n) => {
    const layer = getNodeLayer(n.id);
    if (!layerMap.has(layer)) layerMap.set(layer, []);
    (layerMap.get(layer) as NodeData[]).push(n);
  });
  const layers = Array.from(layerMap.entries()).sort((a, b) => a[0] - b[0]);
  // Calculate y for each layer
  const layerCount = layers.length;
  const layerGap = width / (layerCount + 1);
  const positions: NodePosition[] = [];
  layers.forEach(([layerIdx, layerNodes], i) => {
    const yGap = height / (layerNodes.length + 1);
    layerNodes.forEach((node, j) => {
      positions.push({
        ...node,
        x: layerGap * (i + 1),
        y: yGap * (j + 1),
        layer: layerIdx,
      });
    });
  });
  return positions;
}

export const ConnectionsGraph: React.FC<ConnectionsGraphProps> = ({ data, width = 900, height = 600 }) => {
  const nodePositions = getLayeredPositions(data.nodes, width, height);
  const nodePosMap: Record<string, NodePosition> = Object.fromEntries(
    nodePositions.map((n) => [n.id, n])
  );

  return (
    <svg width={width} height={height} style={{ background: '#fafbfc', border: '1px solid #e5e7eb', borderRadius: 8 }}>
      {/* Edges */}
      {data.edges.map((edge, i) => {
        const from = nodePosMap[edge.from];
        const to = nodePosMap[edge.to];
        if (!from || !to) return null;
        // Arrowhead
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const angle = Math.atan2(dy, dx);
        const r = 32;
        const arrowX = to.x - Math.cos(angle) * r;
        const arrowY = to.y - Math.sin(angle) * r;
        return (
          <g key={`${edge.from}->${edge.to}-${i}`}>
            <line
              x1={from.x}
              y1={from.y}
              x2={arrowX}
              y2={arrowY}
              stroke="#8884d6"
              strokeWidth={2}
              markerEnd={`url(#arrow-${i})`}
            />
            <marker
              id={`arrow-${i}`}
              markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L9,3 z" fill="#8884d6" />
            </marker>
            {/* Edge label */}
            <text
              x={(from.x + to.x) / 2 + 8}
              y={(from.y + to.y) / 2 - 8}
              textAnchor="middle"
              fontSize={11}
              fill="#444"
              fontFamily="monospace"
              opacity={0.75}
            >
              {edge.type}
            </text>
          </g>
        );
      })}
      {/* Nodes */}
      {nodePositions.map((node) => (
        <g key={node.id}>
          <circle
            cx={node.x}
            cy={node.y}
            r={28}
            fill="#fff"
            stroke="#8884d6"
            strokeWidth={3}
            filter="url(#nodeShadow)"
          />
          <text
            x={node.x}
            y={node.y}
            textAnchor="middle"
            fontSize={12}
            fill="#222"
            fontFamily="monospace"
            dy={0}
            style={{ userSelect: 'none', fontWeight: 600 }}
          >
            {node.label.split(" ")[0]}
          </text>
          <title>{node.label}</title>
        </g>
      ))}
      {/* Node shadow filter */}
      <defs>
        <filter id="nodeShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#d1d5db" floodOpacity="0.6" />
        </filter>
      </defs>
    </svg>
  );
};
