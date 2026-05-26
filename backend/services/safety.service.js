// Harness and guardrails for content safety and moderation
class SafetyService {
  constructor() {
    this.bannedKeywords = [
      'inappropriate', 'offensive', 'bannedword1', 'bannedword2', 'bannedword3'
    ];
  }

  moderateContent(text) {
    const lower = text.toLowerCase();
    for (const keyword of this.bannedKeywords) {
      if (lower.includes(keyword)) {
        throw new Error(`Content contains inappropriate material: ${keyword}`);
      }
    }
    return true;
  }

  sanitizeInput(input) {
    // Standard XSS prevention: escape < and >, trim whitespace, and limit length
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .trim()
      .slice(0, 5000); // Limit length
  }

  validateCardInput(input) {
    if (!input.title || input.title.length < 3) {
      throw new Error('Title must be at least 3 characters');
    }
    this.moderateContent(input.title);
    if (input.content) {
      this.moderateContent(input.content);
    }
    return true;
  }
}

module.exports = new SafetyService();