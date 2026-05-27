import { gql } from '@apollo/client/core';

export const START_AI_INQUIRY = gql`
  mutation StartAIInquiry($cardId: ID!, $userQuestion: String) {
    startAIInquiry(cardId: $cardId, userQuestion: $userQuestion) {
      inquiryId
      answer
      extractedNodes { id label category description }
      extractedEdges { sourceId targetId relationType }
      suggestedCards { title content columnId rationale }
    }
  }
`;
