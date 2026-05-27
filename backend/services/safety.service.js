const { z } = require('zod');
const sanitizeHtml = require('sanitize-html');

class SafetyService {
  constructor() {
    this.bannedKeywords = [
      'inappropriate', 'offensive', 'bannedword1', 'bannedword2'
    ];

    // Zod Schemas
    this.columnIdEnum = z.enum([
      'IDEATION_DISCOVERY', 'RESEARCH_INQUIRY', 'SYNTHESIS_KNOWLEDGE', 'TRIP_PLANNING_LOGISTICS'
    ]);

    this.createCardSchema = z.object({
      title: z.string().min(3).max(100),
      content: z.string().max(5000).optional(),
      columnId: this.columnIdEnum.optional(),
      idempotencyKey: z.string().min(8).max(200).optional()
    });

    this.updateCardSchema = z.object({
      title: z.string().min(3).max(100).optional(),
      content: z.string().max(5000).optional(),
      columnId: this.columnIdEnum.optional()
    }).refine(data => data.title !== undefined || data.content !== undefined || data.columnId !== undefined, {
      message: 'At least one field must be provided to update a card'
    });

    this.suggestedCardSchema = z.object({
      title: z.string().min(3).max(100),
      content: z.string().max(5000).optional(),
      columnId: this.columnIdEnum,
      rationale: z.string().max(500).optional()
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
    
    // Normalize text: remove common bypass characters and multiple spaces
    const normalizedText = text.toLowerCase()
      .replace(/[\s_\-\.\*\+\=\|]/g, ''); // Remove spaces and common separator chars
    
    for (const keyword of this.bannedKeywords) {
      if (normalizedText.includes(keyword.toLowerCase())) {
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

  validateUpdateCardInput(input) {
    this.updateCardSchema.parse(input);
    if (input.title !== undefined) this.moderateContent(input.title);
    if (input.content !== undefined) this.moderateContent(input.content);
    return true;
  }

  sanitizeSuggestedCards(suggestedCards = []) {
    const MAX = 10;
    const valid = [];

    for (const raw of suggestedCards.slice(0, MAX)) {
      try {
        const parsed = this.suggestedCardSchema.parse({
          title: raw.title,
          content: raw.content || '',
          columnId: raw.columnId,
          rationale: raw.rationale || ''
        });
        
        // For titles, we don't want ANY HTML tags
        const title = this.sanitizeInput(parsed.title, { allowedTags: [] });
        const content = this.sanitizeInput(parsed.content || '');
        const rationale = this.sanitizeInput(parsed.rationale || '');
        
        this.moderateContent(title);
        this.moderateContent(content);
        this.moderateContent(rationale);
        
        valid.push({
          title,
          content,
          columnId: parsed.columnId,
          rationale: rationale || null
        });
      } catch {
        // Drop invalid suggestions rather than failing the inquiry
      }
    }

    return valid;
  }

  sanitizeInput(input, options = {}) {
    if (typeof input !== 'string') return input;
    
    const allowedTags = options.allowedTags !== undefined 
      ? options.allowedTags 
      : [];

    const sanitized = sanitizeHtml(input, {
      allowedTags,
      allowedAttributes: {}
    }).trim();

    // Decode HTML entities that sanitize-html automatically creates.
    // We do this because React already protects against XSS when rendering strings,
    // and showing "&amp;" to users is confusing.
    return sanitized
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'");
  }
}

module.exports = new SafetyService();
