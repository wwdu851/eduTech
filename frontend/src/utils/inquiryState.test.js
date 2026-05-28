import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addConversationMessage,
  ensureConversation,
  getConversationByCardId,
} from './inquiryState.js';

test('inquiry state stores conversations by cardId', () => {
  const conversations = {};
  ensureConversation(conversations, 'card-a');
  addConversationMessage(conversations, 'card-a', { role: 'user', content: 'Question A' });
  addConversationMessage(conversations, 'card-b', { role: 'user', content: 'Question B' });

  assert.deepEqual(
    getConversationByCardId(conversations, 'card-a').map(message => message.content),
    ['Question A']
  );
  assert.deepEqual(
    getConversationByCardId(conversations, 'card-b').map(message => message.content),
    ['Question B']
  );
});

test('inquiry conversations remain keyed by cardId when board column changes elsewhere', () => {
  const conversations = {};
  addConversationMessage(conversations, 'card-a', { role: 'user', content: 'Original chat' });

  const appStateAfterMove = {
    inquiry: { conversations },
    board: {
      cards: {
        'card-a': { id: 'card-a', columnId: 'SYNTHESIS_KNOWLEDGE' },
      },
    },
  };

  assert.deepEqual(
    getConversationByCardId(appStateAfterMove.inquiry.conversations, 'card-a')
      .map(message => message.content),
    ['Original chat']
  );
});
