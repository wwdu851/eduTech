const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async inquireOnCard(cardContent, userQuestion) {
    const prompt = `
You are an educational assistant helping students plan experiential learning trips.

Card Title: ${cardContent.title}
Card Content: ${cardContent.content}
Student Question: ${userQuestion}

Please provide:
1. A comprehensive answer to deepen their inquiry
2. Extract 3-5 key knowledge points as JSON array with structure:
   {
     "label": "knowledge point name",
     "category": "History|Geography|Culture|Logistics|etc",
     "description": "brief description"
   }
3. Suggest relationships between these knowledge points as JSON array:
   {
     "source": "label of source node",
     "target": "label of target node",
     "type": "enables|requires|relates_to|etc"
   }

Return ONLY valid JSON with this structure:
{
  "answer": "your detailed answer here",
  "knowledgePoints": [...],
  "relationships": [...]
}
`;

    const result = await this.model.generateContent(prompt);
    const response = result.response.text();
    
    // Parse JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid AI response format');
    
    return JSON.parse(jsonMatch[0]);
  }

  async extractKnowledgePoints(text) {
    const prompt = `Extract 3-5 key knowledge points from this text as JSON array: ${text}`;
    const result = await this.model.generateContent(prompt);
  }
}

module.exports = new AIService();