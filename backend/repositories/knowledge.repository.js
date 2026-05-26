const driver = require('../config/neo4j');

class KnowledgeRepository {
  async createNode(nodeData) {
    const session = driver.session();
    try {
      // We could link to User here, but for now they are linked to Cards.
      // To ensure ownership, we should probably link to User.
      const result = await session.run(`
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
      await session.close();
    }
  }

  async createRelationship(sourceId, targetId, relationType) {
    const session = driver.session();
    try {
      const result = await session.run(`
        MATCH (a:KnowledgeNode {id: $sourceId})
        MATCH (b:KnowledgeNode {id: $targetId})
        MERGE (a)-[r:RELATES_TO {type: $relationType}]->(b)
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
      // Get nodes owned by user (either via card or direct ownership)
      const result = await session.run(`
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
      await session.close();
    }
  }
}

module.exports = new KnowledgeRepository();
