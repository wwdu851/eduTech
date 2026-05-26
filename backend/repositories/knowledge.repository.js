const driver = require('../config/neo4j');

class KnowledgeRepository {
  async createNode(nodeData, tx = null) {
    const session = tx ? null : driver.session();
    const runner = tx || session;
    try {
      const result = await runner.run(`
        MATCH (u:User {id: $userId})
        CREATE (u)-[:OWNS_KNOWLEDGE]->(k:KnowledgeNode {
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
      if (session) await session.close();
    }
  }

  async createRelationship(sourceId, targetId, relationType, userId, tx = null) {
    const session = tx ? null : driver.session();
    const runner = tx || session;
    try {
      const result = await runner.run(`
        MATCH (u:User {id: $userId})-[:OWNS_KNOWLEDGE]->(a:KnowledgeNode {id: $sourceId})
        MATCH (u)-[:OWNS_KNOWLEDGE]->(b:KnowledgeNode {id: $targetId})
        MERGE (a)-[r:RELATES_TO {type: $relationType}]->(b)
        RETURN a, r, b
      `, { sourceId, targetId, relationType, userId });

      return {
        sourceId,
        targetId,
        relationType
      };
    } finally {
      if (session) await session.close();
    }
  }

  async getGraphByUser(userId, tx = null) {
    const session = tx ? null : driver.session();
    const runner = tx || session;
    try {
      const result = await runner.run(`
        MATCH (u:User {id: $userId})
        OPTIONAL MATCH (u)-[:OWNS_KNOWLEDGE]->(k:KnowledgeNode)
        OPTIONAL MATCH (k)-[r:RELATES_TO]->(k2:KnowledgeNode)
        WHERE (u)-[:OWNS_KNOWLEDGE]->(k2)
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
        nodes: record.get('nodes').map(n => n.properties).filter(Boolean),
        edges: record.get('edges').filter(e => e.sourceId && e.targetId)
      };
    } finally {
      if (session) await session.close();
    }
  }
}

module.exports = new KnowledgeRepository();
