const knowledgeRepo = require('../repositories/knowledge.repository');
const { v4: uuidv4 } = require('uuid');
const driver = require('../config/neo4j');

class KnowledgeService {
  async buildKnowledgeGraph(userId, knowledgeData) {
    const { knowledgePoints = [], relationships = [] } = knowledgeData;
    const validCategories = new Set([
      'HISTORY','ARCHITECTURE','TRADE','CULTURE','FOOD','POLITICS',
      'LOGISTICS','PLANNING','SCIENCE','ENGINEERING','GEOGRAPHY','ECONOMICS'
    ]);

    const session = driver.session();
    
    try {
      return await session.executeWrite(async tx => {
        // 1. Create knowledge nodes
        const createdNodes = [];
        for (const point of knowledgePoints) {
          const category = String(point.category || '').toUpperCase();
          if (!validCategories.has(category)) {
            throw new Error(`Invalid knowledge category: ${point.category}`);
          }
          if (!point.label || !point.description) {
            throw new Error('Knowledge point must include label and description');
          }

          const nodeId = uuidv4();
          const node = await knowledgeRepo.createNode({
            id: nodeId,
            label: point.label,
            category,
            description: point.description,
            userId
          }, tx);
          createdNodes.push(node);
        }

        // 2. Create relationships between knowledge nodes
        const createdEdges = [];
        for (const rel of relationships) {
          const sourceNode = createdNodes.find(n => n.label === rel.source);
          const targetNode = createdNodes.find(n => n.label === rel.target);
          
          if (sourceNode && targetNode) {
            const edge = await knowledgeRepo.createRelationship(
              sourceNode.id,
              targetNode.id,
              rel.type,
              userId,
              tx
            );
            createdEdges.push(edge);
          }
        }

        return { nodes: createdNodes, edges: createdEdges };
      });
    } finally {
      await session.close();
    }
  }

  async getUserKnowledgeGraph(userId) {
    return await knowledgeRepo.getGraphByUser(userId);
  }
}

module.exports = new KnowledgeService();