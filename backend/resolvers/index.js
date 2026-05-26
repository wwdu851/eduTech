const { findAllNodes } = require('../repositories/neo4j.repository');

module.exports = {
  Query: {
    knowledgeNodes: async () => {
      return await findAllNodes();
    }
  }
};