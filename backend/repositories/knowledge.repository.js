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
      const nodesResult = await runner.run(`
        MATCH (u:User {id: $userId})-[:OWNS_KNOWLEDGE]->(k:KnowledgeNode)
        RETURN collect(DISTINCT k) AS nodes
      `, { userId });

      const edgesResult = await runner.run(`
        MATCH (u:User {id: $userId})-[:OWNS_KNOWLEDGE]->(a:KnowledgeNode)-[r:RELATES_TO]->(b:KnowledgeNode)
        WHERE (u)-[:OWNS_KNOWLEDGE]->(b)
        RETURN collect(DISTINCT {
          sourceId: a.id,
          targetId: b.id,
          relationType: r.type
        }) AS edges
      `, { userId });

      const nodeRecords = nodesResult.records[0];
      const edgeRecords = edgesResult.records[0];
      const rawNodes = nodeRecords ? nodeRecords.get('nodes') : [];
      const rawEdges = edgeRecords ? edgeRecords.get('edges') : [];

      return {
        nodes: rawNodes.map(n => n?.properties).filter(n => n?.id),
        edges: rawEdges.filter(e => e?.sourceId && e?.targetId),
      };
    } finally {
      if (session) await session.close();
    }
  }

  async deleteNode(userId, nodeId) {
    const session = driver.session();
    try {
      const result = await session.run(`
        MATCH (u:User {id: $userId})-[:OWNS_KNOWLEDGE]->(k:KnowledgeNode {id: $nodeId})
        DETACH DELETE k
        RETURN count(k) as deleted
      `, { userId, nodeId });

      const deleted = result.records[0]?.get('deleted')?.toNumber?.() ?? result.records[0]?.get('deleted') ?? 0;
      return deleted > 0;
    } finally {
      await session.close();
    }
  }
}

module.exports = new KnowledgeRepository();
