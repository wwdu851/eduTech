import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeGraphNode } from './knowledgeGraph.js';

test('normalizeGraphNode preserves AI generated metadata', () => {
  assert.deepEqual(
    normalizeGraphNode({
      id: 123,
      label: 'Harbor',
      category: 'GEOGRAPHY',
      description: 'Port geography',
      isAIGenerated: true,
      verificationStatus: 'UNVERIFIED',
    }),
    {
      id: '123',
      label: 'Harbor',
      category: 'GEOGRAPHY',
      description: 'Port geography',
      isAIGenerated: true,
      verificationStatus: 'UNVERIFIED',
    }
  );
});

test('normalizeGraphNode defaults verificationStatus from AI source', () => {
  assert.equal(
    normalizeGraphNode({ id: 'ai-node', isAIGenerated: true }).verificationStatus,
    'UNVERIFIED'
  );
  assert.equal(
    normalizeGraphNode({ id: 'human-node', isAIGenerated: false }).verificationStatus,
    'VERIFIED'
  );
});
