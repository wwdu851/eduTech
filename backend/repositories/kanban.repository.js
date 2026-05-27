const neo4j = require('neo4j-driver');
const driver = require('../config/neo4j');
const { v4: uuidv4 } = require('uuid');
const safetyService = require('../services/safety.service');

class KanbanRepository {
  async createCard(userId, input) {
    const session = driver.session();
    try {
      const title = safetyService.sanitizeInput(input.title);
      const content = safetyService.sanitizeInput(input.content || '');
      const columnId = input.columnId || 'IDEATION_DISCOVERY';
      const idempotencyKey = input.idempotencyKey;

      // Idempotent create prevents duplicate cards when the frontend retries
      // (e.g., Safari lag/double-click). Key is scoped per user relationship.
      if (idempotencyKey) {
        const cardId = uuidv4();
        const result = await session.run(`
          MATCH (u:User {id: $userId})
          MERGE (u)-[:CREATED]->(c:KanbanCard { idempotencyKey: $idempotencyKey })
          ON CREATE SET
            c.id = $cardId,
            c.title = $title,
            c.content = $content,
            c.columnId = $columnId,
            c.tags = $tags,
            c.createdAt = datetime()
          RETURN c
        `, {
          userId,
          cardId,
          idempotencyKey,
          title,
          content,
          columnId,
          tags: []
        });

        const card = result.records[0].get('c').properties;
        return { ...card, id: card.id, tags: card.tags || [] };
      }

      // Fallback to non-idempotent create when no key is provided.
      const cardId = uuidv4();
      const result = await session.run(`
        MATCH (u:User {id: $userId})
        CREATE (u)-[:CREATED]->(c:KanbanCard {
          id: $cardId,
          title: $title,
          content: $content,
          columnId: $columnId,
          tags: $tags,
          createdAt: datetime()
        })
        RETURN c
      `, {
        userId,
        cardId,
        title,
        content,
        columnId,
        tags: []
      });

      const card = result.records[0].get('c').properties;
      return { ...card, id: card.id, tags: card.tags || [] };
    } finally {
      await session.close();
    }
  }

  async getUserBoard(userId, limit = 50, offset = 0) {
    const session = driver.session();
    try {
      const result = await session.run(`
        MATCH (u:User {id: $userId})-[:CREATED]->(c:KanbanCard)
        OPTIONAL MATCH (c)-[:CONTAINS]->(k:KnowledgeNode)
        RETURN c, collect(k) as knowledgePoints
        ORDER BY c.createdAt DESC
        SKIP $offset
        LIMIT $limit
      `, { 
        userId, 
        offset: neo4j.int(offset), 
        limit: neo4j.int(limit) 
      });

      return result.records.map(record => {
        const card = record.get('c').properties;
        return {
          ...card,
          tags: card.tags || [],
          knowledgePoints: record.get('knowledgePoints').map(k => k?.properties || null).filter(Boolean)
        };
      });
    } finally {
      await session.close();
    }
  }

  async getCard(userId, cardId) {
    const session = driver.session();
    try {
      const result = await session.run(`
        MATCH (u:User {id: $userId})-[:CREATED]->(c:KanbanCard {id: $cardId})
        OPTIONAL MATCH (c)-[:CONTAINS]->(k:KnowledgeNode)
        RETURN c, collect(k) as knowledgePoints
      `, { userId, cardId });

      if (result.records.length === 0) return null;

      const record = result.records[0];
      const card = record.get('c').properties;
      return {
        ...card,
        tags: card.tags || [],
        knowledgePoints: record.get('knowledgePoints').map(k => k?.properties || null).filter(Boolean)
      };
    } finally {
      await session.close();
    }
  }

  async moveCard(userId, cardId, newColumnId) {
    const session = driver.session();
    try {
      const result = await session.run(`
        MATCH (u:User {id: $userId})-[:CREATED]->(c:KanbanCard {id: $cardId})
        SET c.columnId = $newColumnId
        RETURN c
      `, { userId, cardId, newColumnId });

      if (result.records.length === 0) throw new Error('Card not found or access denied');
      return result.records[0].get('c').properties;
    } finally {
      await session.close();
    }
  }

  async updateCard(userId, cardId, input) {
    const session = driver.session();
    try {
      const sets = [];
      const params = { userId, cardId };

      if (input.title !== undefined) {
        sets.push('c.title = $title');
        params.title = safetyService.sanitizeInput(input.title);
      }
      if (input.content !== undefined) {
        sets.push('c.content = $content');
        params.content = safetyService.sanitizeInput(input.content);
      }
      if (input.columnId !== undefined) {
        sets.push('c.columnId = $columnId');
        params.columnId = input.columnId;
      }

      if (sets.length === 0) {
        return await this.getCard(userId, cardId);
      }

      const result = await session.run(`
        MATCH (u:User {id: $userId})-[:CREATED]->(c:KanbanCard {id: $cardId})
        SET ${sets.join(', ')}
        RETURN c
      `, params);

      if (result.records.length === 0) throw new Error('Card not found or access denied');

      const card = result.records[0].get('c').properties;
      return { ...card, tags: card.tags || [] };
    } finally {
      await session.close();
    }
  }

  async deleteCard(userId, cardId) {
    const session = driver.session();
    try {
      const result = await session.run(`
        MATCH (u:User {id: $userId})-[:CREATED]->(c:KanbanCard {id: $cardId})
        DETACH DELETE c
        RETURN count(c) as deleted
      `, { userId, cardId });

      const deleted = result.records[0]?.get('deleted')?.toNumber?.() ?? result.records[0]?.get('deleted') ?? 0;
      return deleted > 0;
    } finally {
      await session.close();
    }
  }

  async linkKnowledgeToCard(userId, cardId, knowledgeNodeIds) {
    const session = driver.session();
    try {
      for (const nodeId of knowledgeNodeIds) {
        await session.run(`
          MATCH (u:User {id: $userId})-[:CREATED]->(c:KanbanCard {id: $cardId})
          MATCH (u)-[:OWNS_KNOWLEDGE]->(k:KnowledgeNode {id: $nodeId})
          MERGE (c)-[:CONTAINS]->(k)
        `, { userId, cardId, nodeId });
      }
    } finally {
      await session.close();
    }
  }
}

module.exports = new KanbanRepository();
