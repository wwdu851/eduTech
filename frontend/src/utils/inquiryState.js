export function ensureConversation(conversations, cardId) {
  if (!conversations[cardId]) conversations[cardId] = [];
  return conversations[cardId];
}

export function addConversationMessage(conversations, cardId, message) {
  ensureConversation(conversations, cardId).push(message);
}

export function getConversationByCardId(conversations, cardId) {
  return conversations[cardId] || [];
}
