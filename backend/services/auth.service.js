const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');
const env = require('../config/env');

const JWT_SECRET = env.JWT_SECRET;

class AuthService {
  async register(email, password) {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userRepository.createUser(email, hashedPassword);

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });

    return { token, user };
  }

  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error('Invalid email or password');
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });

    return { token, user };
  }

  verifyToken(token) {
    try {
      if (!token) return null;
      const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
      return decoded.userId;
    } catch (err) {
      return null;
    }
  }
}

module.exports = new AuthService();
