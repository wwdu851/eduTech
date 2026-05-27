import { gql } from '@apollo/client/core';

export const GET_BOARD = gql`
  query GetBoard($limit: Int, $offset: Int) {
    getBoard(limit: $limit, offset: $offset) {
      id title content columnId tags
      knowledgePoints { id label category description }
    }
  }
`;

export const GET_CARD = gql`
  query GetCard($cardId: ID!) {
    getCard(cardId: $cardId) {
      id title content columnId tags
      knowledgePoints { id label category description }
    }
  }
`;

export const CREATE_CARD = gql`
  mutation CreateCard($input: CreateCardInput!) {
    createCard(input: $input) {
      id title content columnId tags
      knowledgePoints { id label category description }
    }
  }
`;

export const UPDATE_CARD = gql`
  mutation UpdateCard($cardId: ID!, $input: UpdateCardInput!) {
    updateCard(cardId: $cardId, input: $input) {
      id title content columnId tags
      knowledgePoints { id label category description }
    }
  }
`;

export const DELETE_CARD = gql`
  mutation DeleteCard($cardId: ID!) {
    deleteCard(cardId: $cardId)
  }
`;

export const MOVE_CARD = gql`
  mutation MoveCard($cardId: ID!, $newColumnId: KanbanColumn!) {
    moveCard(cardId: $cardId, newColumnId: $newColumnId) {
      id columnId
    }
  }
`;
