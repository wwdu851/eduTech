// Kanban CRUD Operations
const driver = require('../config/neo4j');
const { v4: uuidv4 } = require('uuid');

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
        title: input.title,
        content: input.content || '',
        columnId: input.columnId || '1'
      });

      const card = result.records[0].get('c').properties;
      return { ...card, id: card.id };
    } finally {
      await session.close();
    }
  }

  async getCardsByUser(userId) {
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

  async getCard(cardId) {
    const session = driver.session();
    try {
      const result = await session.run(`
        MATCH (c:KanbanCard {id: $cardId})
        OPTIONAL MATCH (c)-[:CONTAINS]->(k:KnowledgeNode)
        RETURN c, collect(k) as knowledgePoints
      `, { cardId });

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

  async moveCard(cardId, newColumnId) {
    const session = driver.session();
    try {
      const result = await session.run(`
        MATCH (c:KanbanCard {id: $cardId})
        SET c.columnId = $newColumnId
        RETURN c
      `, { cardId, newColumnId });

      return result.records[0].get('c').properties;
    } finally {
      await session.close();
    }
  }

  async linkKnowledgeToCard(cardId, knowledgeNodeId) {
    const session = driver.session();
    try {
      await session.run(`
        MATCH (c:KanbanCard {id: $cardId})
        MATCH (k:KnowledgeNode {id: $knowledgeNodeId})
        MERGE (c)-[:CONTAINS]->(k)
      `, { cardId, knowledgeNodeId });
    } finally {
      await session.close();
    }
  }
}

module.exports = new KanbanRepository();