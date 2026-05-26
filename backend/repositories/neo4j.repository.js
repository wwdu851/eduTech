const driver = require('../config/neo4j');

async function findAllNodes() {
  const session = driver.session();
  try {
    const result = await session.run('MATCH (n) RETURN n LIMIT 10');
    return result.records.map(record => ({
      id: record.get('n').identity.toString(),
      label: record.get('n').labels[0],
    }));
  } finally {
    await session.close();
  }
}

module.exports = { findAllNodes };