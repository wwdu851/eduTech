const knowledgeRepo = require('../repositories/knowledge.repository');
const { v4: uuidv4 } = require('uuid');

class KnowledgeService {
  async buildKnowledgeGraph(userId, knowledgeData) {
    const { knowledgePoints, relationships } = knowledgeData;
    
    // 1. Create knowledge nodes
    const createdNodes = [];
    for (const point of knowledgePoints) {
      const nodeId = uuidv4();
      const node = await knowledgeRepo.createNode({
        id: nodeId,
        label: point.label,
        category: point.category,
        description: point.description,
        userId
      });
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
          rel.type
        );
        createdEdges.push(edge);
      }
    }

    return { nodes: createdNodes, edges: createdEdges };
  }

  async getUserKnowledgeGraph(userId) {
    return await knowledgeRepo.getGraphByUser(userId);
  }
}

module.exports = new KnowledgeService();