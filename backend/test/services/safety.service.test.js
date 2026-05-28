const test = require('node:test');
const assert = require('node:assert/strict');
const safetyService = require('../../services/safety.service');

test('moderateContent allows ordinary educational content', () => {
  assert.equal(
    safetyService.moderateContent('Research ferry schedules and museum opening hours.'),
    true
  );
});

test('moderateContent blocks banned words even with simple separator bypasses', () => {
  assert.throws(
    () => safetyService.moderateContent('This is in app-ropriate content.'),
    /Content contains inappropriate material/
  );

  assert.throws(
    () => safetyService.moderateContent('This is o*f*f*e*n*s*i*v*e content.'),
    /Content contains inappropriate material/
  );
});

test('sanitizeInput strips HTML tags by default and decodes display entities', () => {
  const sanitized = safetyService.sanitizeInput(
    '<p>Hello <strong>student</strong></p><script>alert("x")</script>&amp; welcome'
  );

  assert.equal(sanitized, 'Hello student& welcome');
  assert.equal(sanitized.includes('<strong>'), false);
  assert.equal(sanitized.includes('<script>'), false);
});

test('sanitizeInput can still accept an explicit allow-list when needed', () => {
  const sanitized = safetyService.sanitizeInput('<b>Hello</b> <i>student</i>', {
    allowedTags: ['b'],
  });

  assert.equal(sanitized, '<b>Hello</b> student');
});
