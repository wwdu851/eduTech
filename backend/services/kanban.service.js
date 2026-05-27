const kanbanRepo = require('../repositories/kanban.repository');

class KanbanService {
  async createCard(userId, input) {
    return await kanbanRepo.createCard(userId, input);
  }

  async getUserBoard(userId, limit, offset) {
    return await kanbanRepo.getUserBoard(userId, limit, offset);
  }

  async getCard(userId, cardId) {
    return await kanbanRepo.getCard(userId, cardId);
  }

  async updateCard(userId, cardId, input) {
    return await kanbanRepo.updateCard(userId, cardId, input);
  }

  async deleteCard(userId, cardId) {
    return await kanbanRepo.deleteCard(userId, cardId);
  }

  async moveCard(userId, cardId, newColumnId) {
    return await kanbanRepo.moveCard(userId, cardId, newColumnId);
  }

  async linkKnowledgeToCard(userId, cardId, knowledgeNodeIds) {
    return await kanbanRepo.linkKnowledgeToCard(userId, cardId, knowledgeNodeIds);
  }
}

module.exports = new KanbanService();
