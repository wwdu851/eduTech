const kanbanRepo = require('../repositories/kanban.repository');

class KanbanService {
  async createCard(userId, input) {
    return await kanbanRepo.createCard(userId, input);
  }

  async getUserBoard(userId) {
    return await kanbanRepo.getUserBoard(userId);
  }

  async getCard(userId, cardId) {
    return await kanbanRepo.getCard(userId, cardId);
  }

  async moveCard(userId, cardId, newColumnId) {
    return await kanbanRepo.moveCard(userId, cardId, newColumnId);
  }

  async linkKnowledgeToCard(userId, cardId, knowledgeNodeIds) {
    return await kanbanRepo.linkKnowledgeToCard(userId, cardId, knowledgeNodeIds);
  }
}

module.exports = new KanbanService();
