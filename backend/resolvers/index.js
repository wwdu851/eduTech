const kanbanService = require('../services/kanban.service');
const knowledgeService = require('../services/knowledge.service');
const aiService = require('../services/ai.service');
const safetyService = require('../services/safety.service');
const authService = require('../services/auth.service');

const env = require('../config/env');

module.exports = {
  Query: {
    getBoard: async (_, { limit, offset }, { userId }) => {
      if (!userId) throw new Error('Unauthorized');
      return await kanbanService.getUserBoard(userId, limit, offset);
    },

    getCard: async (_, { cardId }, { userId }) => {
      if (!userId) throw new Error('Unauthorized');
      return await kanbanService.getCard(userId, cardId);
    },

    getKnowledgeGraph: async (_, __, { userId }) => {
      if (!userId) throw new Error('Unauthorized');
      return await knowledgeService.getUserKnowledgeGraph(userId);
    }
  },

  Mutation: {
    register: async (_, { input }, { res }) => {
      safetyService.validateRegisterInput(input);
      const { token, user } = await authService.register(input.email, input.password);
      
      if (res) {
        res.cookie('token', token, {
          httpOnly: true,
          secure: env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 24 * 60 * 60 * 1000 // 1 day
        });
      }

      return { token, user };
    },

    login: async (_, { input }, { res }) => {
      safetyService.validateLoginInput(input);
      const { token, user } = await authService.login(input.email, input.password);

      if (res) {
        res.cookie('token', token, {
          httpOnly: true,
          secure: env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 24 * 60 * 60 * 1000 // 1 day
        });
      }

      return { token, user };
    },

    createCard: async (_, { input }, { userId }) => {
      if (!userId) throw new Error('Unauthorized');
      safetyService.validateCardInput(input);
      return await kanbanService.createCard(userId, input);
    },

    updateCard: async (_, { cardId, input }, { userId }) => {
      if (!userId) throw new Error('Unauthorized');
      safetyService.validateUpdateCardInput(input);
      const sanitized = {};
      if (input.title !== undefined) sanitized.title = safetyService.sanitizeInput(input.title);
      if (input.content !== undefined) sanitized.content = safetyService.sanitizeInput(input.content);
      if (input.columnId !== undefined) sanitized.columnId = input.columnId;
      return await kanbanService.updateCard(userId, cardId, sanitized);
    },

    deleteCard: async (_, { cardId }, { userId }) => {
      if (!userId) throw new Error('Unauthorized');
      return await kanbanService.deleteCard(userId, cardId);
    },

    moveCard: async (_, { cardId, newColumnId }, { userId }) => {
      if (!userId) throw new Error('Unauthorized');
      return await kanbanService.moveCard(userId, cardId, newColumnId);
    },

    startAIInquiry: async (_, { cardId, userQuestion }, { userId }) => {
      if (!userId) throw new Error('Unauthorized');
      
      // 1. Get card details
      const card = await kanbanService.getCard(userId, cardId);
      if (!card) throw new Error('Card not found');

      // 2. Safety check on user question
      const sanitizedQuestion = safetyService.sanitizeInput(userQuestion);
      safetyService.moderateContent(sanitizedQuestion);

      // 3. AI inquiry on card content + user question
      const aiResponse = await aiService.inquireOnCard(card, sanitizedQuestion);

      // 4. Create knowledge graph from AI response
      const graphData = await knowledgeService.buildKnowledgeGraph(userId, aiResponse);

      // 5. Link extracted knowledge nodes to the card
      await kanbanService.linkKnowledgeToCard(userId, cardId, graphData.nodes.map(n => n.id));

      const suggestedCards = safetyService.sanitizeSuggestedCards(aiResponse.suggestedCards);

      return {
        inquiryId: `inquiry-${Date.now()}`,
        answer: safetyService.sanitizeInput(aiResponse.answer || ''),
        extractedNodes: graphData.nodes,
        extractedEdges: graphData.edges,
        suggestedCards,
      };
    }
  }
};
