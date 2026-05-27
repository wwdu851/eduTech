export const COLUMN_ACTIONS = {
  IDEATION_DISCOVERY: { label: 'Deepen Inquiry', showAi: true },
  RESEARCH_INQUIRY: { label: 'AI Assist', showAi: true },
  SYNTHESIS_KNOWLEDGE: { label: 'Extract Knowledge Points', showAi: true },
  TRIP_PLANNING_LOGISTICS: { label: null, showAi: false },
};

export function getColumnAction(columnId) {
  return COLUMN_ACTIONS[columnId] || { label: null, showAi: false };
}

export function getCardTags(card) {
  const fromTags = card.tags?.filter(Boolean) || [];
  if (fromTags.length > 0) return fromTags;

  const categories = new Set(
    (card.knowledgePoints || [])
      .map(kp => kp.category)
      .filter(Boolean)
  );
  return [...categories].map(c => `#${c.charAt(0) + c.slice(1).toLowerCase()}`);
}
