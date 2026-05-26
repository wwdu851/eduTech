const kanbanRepo = require('../repositories/kanban.repository');

class KanbanService {
  async createCard(userId, input) {
    return await kanbanRepo.createCard(userId, input);
  }

  async getUserBoard(userId) {
    return await kanbanRepo.getCardsByUser(userId);
  }

  async getCard(cardId) {
    return await kanbanRepo.getCard(cardId);
  }

  async moveCard(cardId, newColumnId) {
    return await kanbanRepo.moveCard(cardId, newColumnId);
  }

  async linkKnowledgeToCard(cardId, knowledgeNodeIds) {
    for (const nodeId of knowledgeNodeIds) {
      await kanbanRepo.linkKnowledgeToCard(cardId, nodeId);
    }
  }
}

module.exports = new KanbanService();