const kanbanService = require('../services/kanban.service');
const knowledgeService = require('../services/knowledge.service');
const aiService = require('../services/ai.service');
const safetyService = require('../services/safety.service');
const authService = require('../services/auth.service');

module.exports = {
  Query: {
    getBoard: async (_, __, { userId }) => {
      if (!userId) throw new Error('Unauthorized');
      return await kanbanService.getUserBoard(userId);
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
          secure: process.env.NODE_ENV === 'production',
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
          secure: process.env.NODE_ENV === 'production',
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

    moveCard: async (_, { cardId, newColumnId }, { userId }) => {
      if (!userId) throw new Error('Unauthorized');
      // IDOR protection should be handled in the repository/service
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
