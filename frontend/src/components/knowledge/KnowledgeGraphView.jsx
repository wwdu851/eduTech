import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import ForceGraph2D from 'react-force-graph-2d';
import LoadingSpinner from '../shared/LoadingSpinner';
import NodeDetailPanel from './NodeDetailPanel';
import { getCategoryColor } from '../../utils/graphColors';

export default function KnowledgeGraphView() {
  const { nodes: rawNodes, edges: rawEdges, loading } = useSelector(state => state.knowledge);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [hoverNode, setHoverNode] = useState(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 400 });

  // Map data to ForceGraph format
  const graphData = useMemo(() => {
    return {
      nodes: rawNodes.map(n => ({ ...n })),
      links: rawEdges.map(e => ({
        source: e.sourceId,
        target: e.targetId,
        relationType: e.relationType
      }))
    };
  }, [rawNodes, rawEdges]);

  // Handle container resizing
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: Math.max(400, entry.contentRect.height)
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const selectedNode = useMemo(() => 
    rawNodes.find(n => n.id === selectedNodeId), 
    [rawNodes, selectedNodeId]
  );

  const handleNodeClick = useCallback((node) => {
    setSelectedNodeId(prev => prev === node.id ? null : node.id);
  }, []);

  const drawNode = useCallback((node, ctx, globalScale) => {
    const label = node.label;
    const fontSize = 12 / globalScale;
    ctx.font = `${fontSize}px Sans-Serif`;
    const textWidth = ctx.measureText(label).width;
    const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

    const isHovered = hoverNode === node || selectedNodeId === node.id;
    const color = getCategoryColor(node.category);

    // Draw circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();

    if (isHovered) {
      ctx.strokeStyle = '#2563EB';
      ctx.lineWidth = 2 / globalScale;
      ctx.stroke();
    }

    // Draw label
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y + 7, bckgDimensions[0], bckgDimensions[1]);
    
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#0F172A';
    ctx.fillText(label, node.x, node.y + 7 + bckgDimensions[1] / 2);
  }, [hoverNode, selectedNodeId]);

  return (
    <div ref={containerRef} className="graph-container relative h-full w-full overflow-hidden min-h-[400px]">
      {loading && rawNodes.length === 0 ? (
        <div className="flex h-full items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : !rawNodes.length ? (
        <div className="flex h-full flex-col items-center justify-center p-8 text-center">
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            Your knowledge graph is empty
          </p>
          <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
            Start an AI inquiry from a board card to extract knowledge points.
          </p>
        </div>
      ) : (
        <>
          {dimensions.width > 0 && (
            <ForceGraph2D
              graphData={graphData}
              width={dimensions.width}
              height={dimensions.height}
              nodeLabel="label"
              nodeColor={n => getCategoryColor(n.category)}
              linkColor={() => 'var(--border)'}
              linkDirectionalArrowLength={3.5}
              linkDirectionalArrowRelPos={1}
              linkCurvature={0.25}
              nodeCanvasObject={drawNode}
              onNodeClick={handleNodeClick}
              onNodeHover={setHoverNode}
              cooldownTicks={100}
              d3AlphaDecay={0.02}
              d3VelocityDecay={0.3}
            />
          )}

          <NodeDetailPanel 
            node={selectedNode} 
            onClose={() => setSelectedNodeId(null)} 
          />

          <div className="absolute bottom-4 left-4 flex gap-2">
            <div className="rounded-lg border bg-white/80 p-2 text-[10px] backdrop-blur-sm" style={{ borderColor: 'var(--border)' }}>
              <p className="font-semibold mb-1">Legend</p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                {Object.entries({
                  'HISTORY': '#92400E',
                  'CULTURE': '#9D174D',
                  'SCIENCE': '#14532D',
                  'TRADE': '#991B1B',
                }).map(([cat, col]) => (
                  <div key={cat} className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: col }} />
                    <span>{cat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
