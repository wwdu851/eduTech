import { gql } from '@apollo/client/core';

export const GET_KNOWLEDGE_GRAPH = gql`
  query GetKnowledgeGraph {
    getKnowledgeGraph {
      nodes { id label category description isAIGenerated verificationStatus }
      edges { sourceId targetId relationType }
    }
  }
`;

export const DELETE_KNOWLEDGE_NODE = gql`
  mutation DeleteKnowledgeNode($nodeId: ID!) {
    deleteKnowledgeNode(nodeId: $nodeId)
  }
`;
