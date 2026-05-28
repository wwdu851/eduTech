const test = require('node:test');
const assert = require('node:assert/strict');

function loadKnowledgeService({ knowledgeRepo, fakeDriver }) {
  const servicePath = require.resolve('../../services/knowledge.service');
  const repoPath = require.resolve('../../repositories/knowledge.repository');
  const driverPath = require.resolve('../../config/neo4j');

  delete require.cache[servicePath];
  require.cache[repoPath] = {
    id: repoPath,
    filename: repoPath,
    loaded: true,
    exports: knowledgeRepo,
  };
  require.cache[driverPath] = {
    id: driverPath,
    filename: driverPath,
    loaded: true,
    exports: fakeDriver,
  };

  return require('../../services/knowledge.service');
}

test('buildKnowledgeGraph normalizes AI nodes and only creates valid relationships', async () => {
  const createdNodeInputs = [];
  const createdRelationshipInputs = [];
  let closeCount = 0;

  const knowledgeRepo = {
    async createNode(nodeData, tx) {
      assert.equal(tx, 'tx');
      createdNodeInputs.push(nodeData);
      return nodeData;
    },
    async createRelationship(sourceId, targetId, relationType, userId, tx) {
      assert.equal(tx, 'tx');
      createdRelationshipInputs.push({ sourceId, targetId, relationType, userId });
      return { sourceId, targetId, relationType };
    },
  };

  const fakeDriver = {
    session() {
      return {
        async executeWrite(callback) {
          return callback('tx');
        },
        async close() {
          closeCount += 1;
        },
      };
    },
  };

  const knowledgeService = loadKnowledgeService({ knowledgeRepo, fakeDriver });

  const graph = await knowledgeService.buildKnowledgeGraph('user-1', {
    knowledgePoints: [
      {
        label: 'Silk Road',
        category: 'not-a-real-category',
        description: '<b>Trade network</b>',
      },
      {
        label: '  ',
        category: 'HISTORY',
        description: 'Should be skipped',
      },
      {
        label: 'Harbor',
        category: 'GEOGRAPHY',
        description: 'Port geography',
      },
    ],
    relationships: [
      { source: 'Silk Road', target: 'Harbor', type: 'connects' },
      { source: 'Silk Road', target: 'Missing node', type: 'invalid' },
      { source: '0', target: '1', type: 'indexed' },
    ],
  });

  assert.equal(createdNodeInputs.length, 2);
  assert.equal(createdNodeInputs[0].category, 'CULTURE');
  assert.equal(createdNodeInputs[0].description, 'Trade network');
  assert.equal(createdNodeInputs[0].isAIGenerated, true);
  assert.equal(createdNodeInputs[0].verificationStatus, 'UNVERIFIED');
  assert.equal(createdNodeInputs[1].category, 'GEOGRAPHY');

  assert.equal(graph.nodes.length, 2);
  assert.equal(graph.nodes[0].isAIGenerated, true);
  assert.equal(graph.nodes[0].verificationStatus, 'UNVERIFIED');

  assert.deepEqual(
    createdRelationshipInputs.map(rel => rel.relationType),
    ['connects', 'indexed']
  );
  assert.equal(createdRelationshipInputs.every(rel => rel.userId === 'user-1'), true);
  assert.equal(graph.edges.length, 2);
  assert.equal(closeCount, 1);
});
