import test from 'node:test';
import assert from 'node:assert/strict';
import { getAiTargetCardId } from './addCardBar.js';

test('getAiTargetCardId returns null for an empty board', () => {
  assert.equal(getAiTargetCardId({ cards: {}, lastCardId: null }), null);
});

test('getAiTargetCardId returns lastCardId when that card still exists', () => {
  assert.equal(
    getAiTargetCardId({
      cards: {
        older: { id: 'older', createdAt: '2026-01-01T00:00:00.000Z' },
        latest: { id: 'latest', createdAt: '2026-01-02T00:00:00.000Z' },
      },
      lastCardId: 'older',
    }),
    'older'
  );
});

test('getAiTargetCardId falls back to the newest existing card when lastCardId was deleted', () => {
  assert.equal(
    getAiTargetCardId({
      cards: {
        older: { id: 'older', createdAt: '2026-01-01T00:00:00.000Z' },
        latest: { id: 'latest', createdAt: '2026-01-02T00:00:00.000Z' },
      },
      lastCardId: 'deleted-card',
    }),
    'latest'
  );
});
