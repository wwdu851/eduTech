import { gql } from '@apollo/client/core';

export const GET_KNOWLEDGE_GRAPH = gql`
  query GetKnowledgeGraph {
    getKnowledgeGraph {
      nodes { id label category description }
      edges { sourceId targetId relationType }
    }
  }
`;
