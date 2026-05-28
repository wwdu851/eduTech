const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const TEST_JWT_SECRET = 'unit-test-secret-with-enough-length';

function loadAuthService(userRepository) {
  const authPath = require.resolve('../../services/auth.service');
  const repoPath = require.resolve('../../repositories/user.repository');
  const envPath = require.resolve('../../config/env');

  delete require.cache[authPath];
  require.cache[repoPath] = {
    id: repoPath,
    filename: repoPath,
    loaded: true,
    exports: userRepository,
  };
  require.cache[envPath] = {
    id: envPath,
    filename: envPath,
    loaded: true,
    exports: { JWT_SECRET: TEST_JWT_SECRET },
  };

  return require('../../services/auth.service');
}

test('register creates a user with a hashed password and returns a usable token', async () => {
  let createdUser;
  const authService = loadAuthService({
    async findByEmail(email) {
      assert.equal(email, 'student@example.com');
      return null;
    },
    async createUser(email, hashedPassword) {
      createdUser = { id: 'user-1', email, password: hashedPassword };
      return createdUser;
    },
  });

  const result = await authService.register('student@example.com', 'StrongPass123!');

  assert.equal(result.user.email, 'student@example.com');
  assert.equal(authService.verifyToken(result.token), 'user-1');
  assert.notEqual(createdUser.password, 'StrongPass123!');
  assert.equal(await bcrypt.compare('StrongPass123!', createdUser.password), true);
});

test('register hashes passwords with 10 salt rounds', async (t) => {
  const hashMock = t.mock.method(bcrypt, 'hash', async () => 'hashed-password');
  const authService = loadAuthService({
    async findByEmail() {
      return null;
    },
    async createUser(email, hashedPassword) {
      return { id: 'user-1', email, password: hashedPassword };
    },
  });

  await authService.register('student@example.com', 'StrongPass123!');

  assert.equal(hashMock.mock.callCount(), 1);
  assert.deepEqual(hashMock.mock.calls[0].arguments, ['StrongPass123!', 10]);
});

test('register rejects duplicate emails', async () => {
  const authService = loadAuthService({
    async findByEmail() {
      return { id: 'existing-user', email: 'student@example.com' };
    },
    async createUser() {
      throw new Error('createUser should not be called');
    },
  });

  await assert.rejects(
    () => authService.register('student@example.com', 'StrongPass123!'),
    /User already exists/
  );
});

test('login returns a token for valid credentials', async () => {
  const hashedPassword = await bcrypt.hash('StrongPass123!', 10);
  const authService = loadAuthService({
    async findByEmail(email) {
      assert.equal(email, 'student@example.com');
      return { id: 'user-1', email, password: hashedPassword };
    },
  });

  const result = await authService.login('student@example.com', 'StrongPass123!');

  assert.equal(result.user.id, 'user-1');
  assert.equal(authService.verifyToken(result.token), 'user-1');
});

test('login rejects unknown users and invalid passwords', async () => {
  const missingUserAuth = loadAuthService({
    async findByEmail() {
      return null;
    },
  });

  await assert.rejects(
    () => missingUserAuth.login('missing@example.com', 'StrongPass123!'),
    /Invalid email or password/
  );

  const hashedPassword = await bcrypt.hash('StrongPass123!', 10);
  const wrongPasswordAuth = loadAuthService({
    async findByEmail() {
      return { id: 'user-1', email: 'student@example.com', password: hashedPassword };
    },
  });

  await assert.rejects(
    () => wrongPasswordAuth.login('student@example.com', 'WrongPass123!'),
    /Invalid email or password/
  );
});

test('verifyToken returns null for empty, malformed, and expired tokens', () => {
  const authService = loadAuthService({
    async findByEmail() {
      return null;
    },
  });
  const expiredToken = jwt.sign({ userId: 'user-1' }, TEST_JWT_SECRET, { expiresIn: -1 });

  assert.equal(authService.verifyToken(''), null);
  assert.equal(authService.verifyToken('not-a-token'), null);
  assert.equal(authService.verifyToken(expiredToken), null);
});
