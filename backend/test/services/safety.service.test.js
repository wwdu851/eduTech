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

test('sanitizeInput returns non-string values unchanged', () => {
  assert.equal(safetyService.sanitizeInput(null), null);
  assert.equal(safetyService.sanitizeInput(undefined), undefined);
  assert.equal(safetyService.sanitizeInput(42), 42);
});

test('sanitizeInput can still accept an explicit allow-list when needed', () => {
  const sanitized = safetyService.sanitizeInput('<b>Hello</b> <i>student</i>', {
    allowedTags: ['b'],
  });

  assert.equal(sanitized, '<b>Hello</b> student');
});

test('validateCardInput enforces title, content, and idempotency key boundaries', () => {
  assert.throws(
    () => safetyService.validateCardInput({ title: 'Hi', content: '' }),
    /Too small/
  );

  assert.throws(
    () => safetyService.validateCardInput({ title: 'Valid title', content: 'x'.repeat(5001) }),
    /Too big/
  );

  assert.throws(
    () => safetyService.validateCardInput({
      title: 'Valid title',
      content: '',
      idempotencyKey: '1234567',
    }),
    /Too small/
  );
});
