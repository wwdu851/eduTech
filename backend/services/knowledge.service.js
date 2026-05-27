const knowledgeRepo = require('../repositories/knowledge.repository');
const { v4: uuidv4 } = require('uuid');
const driver = require('../config/neo4j');
const safetyService = require('./safety.service');

const VALID_CATEGORIES = new Set([
  'HISTORY', 'ARCHITECTURE', 'TRADE', 'CULTURE', 'FOOD', 'POLITICS',
  'LOGISTICS', 'PLANNING', 'SCIENCE', 'ENGINEERING', 'GEOGRAPHY', 'ECONOMICS'
]);

function normalizeCategory(category) {
  const upper = String(category || '').toUpperCase().trim();
  if (VALID_CATEGORIES.has(upper)) return upper;
  return 'CULTURE';
}

function normalizeLabel(label) {
  return String(label || '').trim();
}

class KnowledgeService {
  async buildKnowledgeGraph(userId, knowledgeData) {
    const { knowledgePoints = [], relationships = [] } = knowledgeData;
    const session = driver.session();

    try {
      return await session.executeWrite(async (tx) => {
        const createdNodes = [];
        const labelToNode = new Map();

        for (const point of knowledgePoints) {
          try {
            const rawLabel = normalizeLabel(point.label);
            if (!rawLabel) continue;

            const label = safetyService.sanitizeInput(rawLabel, { allowedTags: [] });
            const category = normalizeCategory(point.category);
            const description = safetyService.sanitizeInput(String(point.description || point.label || rawLabel).trim());
            
            if (!label || !description) continue;

            const nodeId = uuidv4();
            const node = await knowledgeRepo.createNode({
              id: nodeId,
              label,
              category,
              description,
              userId
            }, tx);

            const normalized = {
              id: String(node.id),
              label: String(node.label),
              category: String(node.category),
              description: String(node.description)
            };
            createdNodes.push(normalized);
            labelToNode.set(label.toLowerCase(), normalized);
          } catch (err) {
            console.warn('Skipped invalid knowledge point:', err.message);
          }
        }

        const createdEdges = [];
        for (const rel of relationships) {
          try {
            const sourceLabel = normalizeLabel(rel.source);
            const targetLabel = normalizeLabel(rel.target);
            let sourceNode = labelToNode.get(sourceLabel.toLowerCase());
            let targetNode = labelToNode.get(targetLabel.toLowerCase());

            if (!sourceNode || !targetNode) {
              const sourceIdx = parseInt(rel.source, 10);
              const targetIdx = parseInt(rel.target, 10);
              if (!Number.isNaN(sourceIdx) && createdNodes[sourceIdx]) {
                sourceNode = createdNodes[sourceIdx];
              }
              if (!Number.isNaN(targetIdx) && createdNodes[targetIdx]) {
                targetNode = createdNodes[targetIdx];
              }
            }

            if (sourceNode && targetNode) {
              const edge = await knowledgeRepo.createRelationship(
                sourceNode.id,
                targetNode.id,
                rel.type || 'relates_to',
                userId,
                tx
              );
              createdEdges.push(edge);
            }
          } catch (err) {
            console.warn('Skipped invalid relationship:', err.message);
          }
        }

        return { nodes: createdNodes, edges: createdEdges };
      });
    } finally {
      await session.close();
    }
  }

  async getUserKnowledgeGraph(userId) {
    const graph = await knowledgeRepo.getGraphByUser(userId);
    return {
      nodes: (graph.nodes || []).map(n => ({
        id: String(n.id),
        label: String(n.label || ''),
        category: n.category ? String(n.category) : null,
        description: String(n.description || '')
      })),
      edges: (graph.edges || []).map(e => ({
        sourceId: String(e.sourceId),
        targetId: String(e.targetId),
        relationType: String(e.relationType || '')
      }))
    };
  }

  async deleteNode(userId, nodeId) {
    return await knowledgeRepo.deleteNode(userId, nodeId);
  }
}

module.exports = new KnowledgeService();
