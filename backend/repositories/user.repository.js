const driver = require('../config/neo4j');
const { v4: uuidv4 } = require('uuid');

class UserRepository {
  async findByEmail(email) {
    const session = driver.session();
    try {
      const result = await session.run(
        'MATCH (u:User {email: $email}) RETURN u',
        { email }
      );
      if (result.records.length === 0) return null;
      return result.records[0].get('u').properties;
    } finally {
      await session.close();
    }
  }

  async findById(id) {
    const session = driver.session();
    try {
      const result = await session.run(
        'MATCH (u:User {id: $id}) RETURN u',
        { id }
      );
      if (result.records.length === 0) return null;
      return result.records[0].get('u').properties;
    } finally {
      await session.close();
    }
  }

  async createUser(email, hashedPassword) {
    const session = driver.session();
    try {
      const id = uuidv4();
      const result = await session.run(
        'CREATE (u:User {id: $id, email: $email, password: $hashedPassword}) RETURN u',
        { id, email, hashedPassword }
      );
      return result.records[0].get('u').properties;
    } finally {
      await session.close();
    }
  }
}

module.exports = new UserRepository();
