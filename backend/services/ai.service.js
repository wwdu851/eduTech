const { GoogleGenerativeAI } = require('@google/generative-ai');
const pRetry = require('p-retry');

class AIService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
      ]
    });
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
     "category": "HISTORY|ARCHITECTURE|TRADE|CULTURE|FOOD|POLITICS|LOGISTICS|PLANNING|SCIENCE|ENGINEERING|GEOGRAPHY|ECONOMICS",
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

    const runAIGeneration = async () => {
      try {
        const result = await this.model.generateContent(prompt);
        const response = result.response.text();
        
        // Parse JSON from response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('Invalid AI response format');
        
        return JSON.parse(jsonMatch[0]);
      } catch (error) {
        // If it's a transient error, retry. If it's a safety block, don't retry.
        if (error.message.includes('SAFETY')) {
          throw new pRetry.AbortError(error);
        }
        throw error;
      }
    };

    return await pRetry(runAIGeneration, {
      retries: 3,
      onFailedAttempt: error => {
        console.log(`AI Inquiry attempt ${error.attemptNumber} failed. ${error.retriesLeft} retries left.`);
      }
    }).catch(error => {
      if (error instanceof pRetry.AbortError) {
        throw new Error(`AI Safety Block: ${error.message}`);
      }
      throw new Error('AI Service Temporarily Unavailable. Please try again later.');
    });
  }
}

module.exports = new AIService();
