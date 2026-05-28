const test = require('node:test');
const assert = require('node:assert/strict');

function makeRecord(properties) {
  return {
    get(key) {
      if (key !== 'c') return undefined;
      return { properties };
    },
  };
}

function loadKanbanRepository(fakeDriver) {
  const repoPath = require.resolve('../../repositories/kanban.repository');
  const driverPath = require.resolve('../../config/neo4j');

  delete require.cache[repoPath];
  require.cache[driverPath] = {
    id: driverPath,
    filename: driverPath,
    loaded: true,
    exports: fakeDriver,
  };

  return require('../../repositories/kanban.repository');
}

test('createCard reuses the same card for repeated idempotency keys', async () => {
  const cardsByKey = new Map();
  const runCalls = [];
  let closeCount = 0;

  const fakeSession = {
    async run(query, params) {
      runCalls.push({ query, params });

      if (params.idempotencyKey) {
        if (!cardsByKey.has(params.idempotencyKey)) {
          cardsByKey.set(params.idempotencyKey, {
            id: params.cardId,
            idempotencyKey: params.idempotencyKey,
            title: params.title,
            content: params.content,
            columnId: params.columnId,
            tags: params.tags,
          });
        }

        return { records: [makeRecord(cardsByKey.get(params.idempotencyKey))] };
      }

      return {
        records: [
          makeRecord({
            id: params.cardId,
            title: params.title,
            content: params.content,
            columnId: params.columnId,
            tags: params.tags,
          }),
        ],
      };
    },
    async close() {
      closeCount += 1;
    },
  };

  const kanbanRepository = loadKanbanRepository({
    session() {
      return fakeSession;
    },
  });

  const first = await kanbanRepository.createCard('user-1', {
    title: '<b>Museum visit</b>',
    content: '<i>Compare artifacts</i>',
    columnId: 'RESEARCH_INQUIRY',
    idempotencyKey: 'idem-123456',
  });

  const second = await kanbanRepository.createCard('user-1', {
    title: 'Different retry title should not replace original',
    content: 'Different retry content',
    columnId: 'TRIP_PLANNING_LOGISTICS',
    idempotencyKey: 'idem-123456',
  });

  assert.equal(first.id, second.id);
  assert.equal(first.title, 'Museum visit');
  assert.equal(first.content, 'Compare artifacts');
  assert.equal(first.columnId, 'RESEARCH_INQUIRY');
  assert.equal(cardsByKey.size, 1);
  assert.equal(closeCount, 2);
  assert.equal(runCalls.every(call => call.query.includes('MERGE')), true);
});

test('createCard without an idempotency key creates separate cards', async () => {
  const runCalls = [];

  const fakeSession = {
    async run(query, params) {
      runCalls.push({ query, params });
      return {
        records: [
          makeRecord({
            id: params.cardId,
            title: params.title,
            content: params.content,
            columnId: params.columnId,
            tags: params.tags,
          }),
        ],
      };
    },
    async close() {},
  };

  const kanbanRepository = loadKanbanRepository({
    session() {
      return fakeSession;
    },
  });

  const first = await kanbanRepository.createCard('user-1', {
    title: 'First card',
    content: 'First content',
  });
  const second = await kanbanRepository.createCard('user-1', {
    title: 'First card',
    content: 'First content',
  });

  assert.notEqual(first.id, second.id);
  assert.equal(first.columnId, 'IDEATION_DISCOVERY');
  assert.equal(runCalls.every(call => call.query.includes('CREATE')), true);
});
