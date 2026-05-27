export const CATEGORY_COLORS = {
  HISTORY: '#92400E',
  ARCHITECTURE: '#5B21B6',
  TRADE: '#991B1B',
  CULTURE: '#9D174D',
  FOOD: '#065F46',
  POLITICS: '#1E40AF',
  LOGISTICS: '#075985',
  PLANNING: '#3730A3',
  SCIENCE: '#14532D',
  ENGINEERING: '#9A3412',
  GEOGRAPHY: '#0C4A6E',
  ECONOMICS: '#701A75',
};

export function getCategoryColor(category) {
  return CATEGORY_COLORS[category] || '#475569';
}
