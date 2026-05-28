export function normalizeGraphNode(n) {
  if (!n) return null;
  return {
    id: String(n.id),
    label: String(n.label || ''),
    category: n.category ? String(n.category) : null,
    description: String(n.description || ''),
    isAIGenerated: Boolean(n.isAIGenerated),
    verificationStatus: String(n.verificationStatus || (n.isAIGenerated ? 'UNVERIFIED' : 'VERIFIED')),
  };
}

export function normalizeGraphPayload(payload) {
  return {
    nodes: (payload?.nodes || []).map(normalizeGraphNode).filter(Boolean),
    edges: (payload?.edges || []).map(e => ({
      sourceId: String(e.sourceId),
      targetId: String(e.targetId),
      relationType: String(e.relationType || ''),
    })),
  };
}
