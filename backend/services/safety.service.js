const { z } = require('zod');
const sanitizeHtml = require('sanitize-html');

class SafetyService {
  constructor() {
    this.bannedKeywords = [
      'inappropriate', 'offensive', 'bannedword1', 'bannedword2'
    ];

    // Zod Schemas
    this.createCardSchema = z.object({
      title: z.string().min(3).max(100),
      content: z.string().max(5000).optional(),
      columnId: z.enum(['IDEATION_DISCOVERY', 'RESEARCH_INQUIRY', 'SYNTHESIS_KNOWLEDGE', 'TRIP_PLANNING_LOGISTICS']).optional()
    });

    this.registerSchema = z.object({
      email: z.string().email(),
      password: z.string().min(8).max(100)
    });

    this.loginSchema = z.object({
      email: z.string().email(),
      password: z.string()
    });
  }

  moderateContent(text) {
    if (!text) return true;
    const lower = text.toLowerCase();
    for (const keyword of this.bannedKeywords) {
      if (lower.includes(keyword)) {
        throw new Error(`Content contains inappropriate material`);
      }
    }
    return true;
  }

  validateRegisterInput(input) {
    this.registerSchema.parse(input);
    return true;
  }

  validateLoginInput(input) {
    this.loginSchema.parse(input);
    return true;
  }

  validateCardInput(input) {
    this.createCardSchema.parse(input);
    this.moderateContent(input.title);
    this.moderateContent(input.content);
    return true;
  }

  sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    return sanitizeHtml(input, {
      allowedTags: [], // Strip all tags for now, as we don't support Rich Text yet
      allowedAttributes: {}
    }).trim();
  }
}

module.exports = new SafetyService();
