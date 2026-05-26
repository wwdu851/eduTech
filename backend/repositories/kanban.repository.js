// Kanban CRUD Operations
const driver = require('../config/neo4j');
const { v4: uuidv4 } = require('uuid');
const safetyService = require('../services/safety.service');

class KanbanRepository {
  async createCard(userId, input) {
    const session = driver.session();
    try {
      const cardId = uuidv4();
      const result = await session.run(`
        MATCH (u:User {id: $userId})
        CREATE (u)-[:CREATED]->(c:KanbanCard {
          id: $cardId,
          title: $title,
          content: $content,
          columnId: $columnId,
          createdAt: datetime()
        })
        RETURN c
      `, {
        userId,
        cardId,
        title: safetyService.sanitizeInput(input.title),
        content: safetyService.sanitizeInput(input.content || ''),
        columnId: input.columnId || 'IDEATION_DISCOVERY'
      });

      const card = result.records[0].get('c').properties;
      return { ...card, id: card.id };
    } finally {
      await session.close();
    }
  }

  async getUserBoard(userId) {
    const session = driver.session();
    try {
      const result = await session.run(`
        MATCH (u:User {id: $userId})-[:CREATED]->(c:KanbanCard)
        OPTIONAL MATCH (c)-[:CONTAINS]->(k:KnowledgeNode)
        RETURN c, collect(k) as knowledgePoints
        ORDER BY c.createdAt DESC
      `, { userId });

      return result.records.map(record => ({
        ...record.get('c').properties,
        knowledgePoints: record.get('knowledgePoints').map(k => k?.properties || null).filter(Boolean)
      }));
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
      return {
        ...record.get('c').properties,
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

  async linkKnowledgeToCard(userId, cardId, knowledgeNodeIds) {
    const session = driver.session();
    try {
      for (const nodeId of knowledgeNodeIds) {
        await session.run(`
          MATCH (u:User {id: $userId})-[:CREATED]->(c:KanbanCard {id: $cardId})
          MATCH (k:KnowledgeNode {id: $nodeId})
          MERGE (c)-[:CONTAINS]->(k)
        `, { userId, cardId, nodeId });
      }
    } finally {
      await session.close();
    }
  }
}

module.exports = new KanbanRepository();
