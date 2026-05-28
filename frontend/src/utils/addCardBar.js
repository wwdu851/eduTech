export function getAiTargetCardId({ cards, lastCardId }) {
  const cardList = Object.values(cards || {});

  if (lastCardId && cards?.[lastCardId]) return lastCardId;
  if (cardList.length === 0) return null;

  const newestCard = [...cardList].sort((a, b) =>
    new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  )[0];
  return newestCard?.id || null;
}
