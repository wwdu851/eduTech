const test = require('node:test');
const assert = require('node:assert/strict');

function loadResolvers({ kanbanService = {}, knowledgeService = {}, aiService = {}, safetyService = {}, authService = {} } = {}) {
  const resolversPath = require.resolve('../../resolvers');
  const kanbanPath = require.resolve('../../services/kanban.service');
  const knowledgePath = require.resolve('../../services/knowledge.service');
  const aiPath = require.resolve('../../services/ai.service');
  const safetyPath = require.resolve('../../services/safety.service');
  const authPath = require.resolve('../../services/auth.service');
  const envPath = require.resolve('../../config/env');

  delete require.cache[resolversPath];
  require.cache[kanbanPath] = { id: kanbanPath, filename: kanbanPath, loaded: true, exports: kanbanService };
  require.cache[knowledgePath] = { id: knowledgePath, filename: knowledgePath, loaded: true, exports: knowledgeService };
  require.cache[aiPath] = { id: aiPath, filename: aiPath, loaded: true, exports: aiService };
  require.cache[safetyPath] = { id: safetyPath, filename: safetyPath, loaded: true, exports: safetyService };
  require.cache[authPath] = { id: authPath, filename: authPath, loaded: true, exports: authService };
  require.cache[envPath] = { id: envPath, filename: envPath, loaded: true, exports: { NODE_ENV: 'test' } };

  return require('../../resolvers');
}

test('getBoard rejects missing userId', async () => {
  const resolvers = loadResolvers();

  await assert.rejects(
    () => resolvers.Query.getBoard(null, {}, {}),
    /Unauthorized/
  );
});

test('createCard rejects missing userId', async () => {
  const resolvers = loadResolvers();

  await assert.rejects(
    () => resolvers.Mutation.createCard(null, { input: { title: 'Trip idea' } }, {}),
    /Unauthorized/
  );
});

test('startAIInquiry rejects when the card does not exist', async () => {
  const resolvers = loadResolvers({
    kanbanService: {
      async getCard() {
        return null;
      },
    },
  });

  await assert.rejects(
    () => resolvers.Mutation.startAIInquiry(
      null,
      { cardId: 'missing-card', userQuestion: 'What should I research?' },
      { userId: 'user-1' }
    ),
    /Card not found/
  );
});
