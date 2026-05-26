const driver = require('../config/neo4j');

class KnowledgeRepository {
  async createNode(nodeData) {
    const session = driver.session();
    try {
      const result = await session.run(`
        CREATE (k:KnowledgeNode {
          id: $id,
          label: $label,
          category: $category,
          description: $description,
          createdAt: datetime()
        })
        RETURN k
      `, nodeData);

      return result.records[0].get('k').properties;
    } finally {
      await session.close();
    }
  }

  async createRelationship(sourceId, targetId, relationType) {
    const session = driver.session();
    try {
      const result = await session.run(`
        MATCH (a:KnowledgeNode {id: $sourceId})
        MATCH (b:KnowledgeNode {id: $targetId})
        CREATE (a)-[r:RELATES_TO {type: $relationType}]->(b)
        RETURN a, r, b
      `, { sourceId, targetId, relationType });

      return {
        sourceId,
        targetId,
        relationType
      };
    } finally {
      await session.close();
    }
  }

  async getGraphByUser(userId) {
    const session = driver.session();
    try {
      const result = await session.run(`
        MATCH (u:User {id: $userId})-[:CREATED]->(c:KanbanCard)-[:CONTAINS]->(k:KnowledgeNode)
        OPTIONAL MATCH (k)-[r:RELATES_TO]->(k2:KnowledgeNode)
        RETURN collect(DISTINCT k) as nodes, 
               collect(DISTINCT {
                 sourceId: k.id, 
                 targetId: k2.id, 
                 relationType: r.type
               }) as edges
      `, { userId });

      if (result.records.length === 0) {
        return { nodes: [], edges: [] };
      }

      const record = result.records[0];
      return {
        nodes: record.get('nodes').map(n => n.properties),
        edges: record.get('edges').filter(e => e.targetId) // 过滤null
      };
    } finally {
      await session.close();
    }
  }
}

module.exports = new KnowledgeRepository();