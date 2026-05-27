import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import ForceGraph2D from 'react-force-graph-2d';
import { getCategoryColor } from '../../utils/graphColors';
import LoadingSpinner from '../shared/LoadingSpinner';
import NodeDetailPanel from './NodeDetailPanel';

const BOX_W = 140;
const BOX_H = 52;
const RADIUS = 8;
const DESC_MAX = 60;

function drawRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function truncate(text, max) {
  if (!text || text.length <= max) return text || '';
  return `${text.slice(0, max - 1)}…`;
}

function wrapLines(ctx, text, maxWidth, maxLines = 2) {
  const words = (text || '').split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
    if (lines.length >= maxLines) break;
  }
  if (line && lines.length < maxLines) lines.push(line);
  if (words.length > 0 && lines.length === 0) lines.push(truncate(text, 24));
  return lines.slice(0, maxLines);
}

export default function KnowledgeGraphView() {
  const { nodes, edges, loading } = useSelector(state => state.knowledge);
  const [selectedNode, setSelectedNode] = useState(null);
  const graphRef = useRef();

  const graphData = useMemo(() => {
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    return {
      nodes: nodes.map(n => ({
        id: n.id,
        label: n.label,
        category: n.category,
        description: n.description,
        color: getCategoryColor(n.category),
      })),
      links: edges
        .filter(e => nodeMap.has(e.sourceId) && nodeMap.has(e.targetId))
        .map(e => ({
          source: e.sourceId,
          target: e.targetId,
          relationType: e.relationType,
        })),
    };
  }, [nodes, edges]);

  useEffect(() => {
    if (graphRef.current && graphData.nodes.length > 0) {
      graphRef.current.d3Force('link')?.distance(120);
      graphRef.current.d3Force('charge')?.strength(-280);
      graphRef.current.zoomToFit(400, 60);
    }
  }, [graphData.nodes.length]);

  const handleNodeClick = useCallback((node) => {
    setSelectedNode(node);
  }, []);

  const drawNode = useCallback((node, ctx, globalScale) => {
    const x = node.x;
    const y = node.y;
    const w = BOX_W / globalScale;
    const h = BOX_H / globalScale;
    const r = RADIUS / globalScale;
    const left = x - w / 2;
    const top = y - h / 2;

    drawRoundRect(ctx, left, top, w, h, r);
    ctx.fillStyle = `${node.color}22`;
    ctx.fill();
    ctx.strokeStyle = node.color || '#94A3B8';
    ctx.lineWidth = 1.5 / globalScale;
    ctx.stroke();

    const fontSize = Math.max(10, 11 / globalScale);
    ctx.font = `600 ${fontSize}px DM Sans, sans-serif`;
    ctx.fillStyle = '#0F172A';
    ctx.textAlign = 'center';
    const lines = wrapLines(ctx, node.label || '', w - 12 / globalScale);
    const lineHeight = fontSize * 1.2;
    const textStartY = y - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((line, i) => {
      ctx.fillText(line, x, textStartY + i * lineHeight);
    });

    const descSize = Math.max(8, 9 / globalScale);
    ctx.font = `${descSize}px DM Sans, sans-serif`;
    ctx.fillStyle = '#64748B';
    ctx.fillText(truncate(node.description, DESC_MAX), x, y + h / 2 + descSize + 4 / globalScale);
  }, []);

  if (loading && nodes.length === 0) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center p-8 text-center">
        <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          Your knowledge graph is empty
        </p>
        <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
          Start an AI inquiry from a board card to extract knowledge points.
        </p>
      </div>
    );
  }

  return (
    <div className="graph-container relative h-full min-h-[400px] w-full">
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        nodeId="id"
        nodeLabel={node => `${node.label}\n${node.description || ''}`}
        nodeCanvasObject={drawNode}
        nodePointerAreaPaint={(node, color, ctx) => {
          const w = BOX_W;
          const h = BOX_H + 24;
          ctx.fillStyle = color;
          ctx.fillRect(node.x - w / 2, node.y - h / 2, w, h);
        }}
        linkLabel={link => link.relationType || ''}
        linkDirectionalArrowLength={5}
        linkDirectionalArrowRelPos={1}
        linkColor={() => '#94A3B8'}
        linkWidth={1.5}
        onNodeClick={handleNodeClick}
        cooldownTicks={100}
      />
      <NodeDetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
    </div>
  );
}
