const kanbanService = require('../services/kanban.service');
const knowledgeService = require('../services/knowledge.service');
const aiService = require('../services/ai.service');
const safetyService = require('../services/safety.service');

module.exports = {
  Query: {
    getBoard: async (_, { userId }) => {
      return await kanbanService.getUserBoard(userId);
    },

    getCard: async (_, { cardId }) => {
      return await kanbanService.getCard(cardId);
    },

    getKnowledgeGraph: async (_, { userId }) => {
      return await knowledgeService.getUserKnowledgeGraph(userId);
    }
  },

  Mutation: {
    createCard: async (_, { input }) => {
      safetyService.validateCardInput(input);
      const userId = 'default-user-id'; // Just for demo, should come from auth context
      return await kanbanService.createCard(userId, input);
    },

    moveCard: async (_, { cardId, newColumnId }) => {
      return await kanbanService.moveCard(cardId, newColumnId);
    },

    startAIInquiry: async (_, { cardId, userQuestion }) => {
      // 1. Get card details
      const card = await kanbanService.getCard(cardId);
      if (!card) throw new Error('Card not found');

      // 2. Safety check on user question
      safetyService.moderateContent(userQuestion);

      // 3. AI inquiry on card content + user question
      const aiResponse = await aiService.inquireOnCard(card, userQuestion);

      // 4. Create knowledge graph from AI response
      const userId = 'default-user-id';
      const graphData = await knowledgeService.buildKnowledgeGraph(userId, aiResponse);

      // 5. Link extracted knowledge nodes to the card
      await kanbanService.linkKnowledgeToCard(cardId, graphData.nodes.map(n => n.id));

      // 6. Return AI answer and extracted graph data
      return {
        inquiryId: `inquiry-${Date.now()}`,
        answer: aiResponse.answer,
        extractedNodes: graphData.nodes,
        extractedEdges: graphData.edges
      };
    }
  }
};