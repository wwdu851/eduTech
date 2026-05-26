const driver = require('../config/neo4j');

async function initDatabase() {
  const session = driver.session();
  try {
    console.log('🔧 Initializing database...');

    // Optional: Clear existing data (use with caution in production)
    // await session.run('MATCH (n) DETACH DELETE n');
    // console.log('✅ Cleared existing data');

    // Create sample user for testing
    await session.run(`
      MERGE (u:User {id: 'default-user-id'})
      SET u.name = 'Test Student'
    `);
    console.log('✅ Created default user');

    // Create indexes to optimize query performance
    await session.run('CREATE INDEX IF NOT EXISTS FOR (c:KanbanCard) ON (c.id)');
    await session.run('CREATE INDEX IF NOT EXISTS FOR (k:KnowledgeNode) ON (k.id)');
    await session.run('CREATE INDEX IF NOT EXISTS FOR (u:User) ON (u.id)');
    console.log('✅ Created indexes');

    console.log('🎉 Database initialization complete!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  } finally {
    await session.close();
    await driver.close();
  }
}

initDatabase();