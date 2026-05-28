const test = require('node:test');
const assert = require('node:assert/strict');
const {
  isPublicGraphQLRequest,
  requestContainsAIInquiry,
} = require('../../utils/graphqlRequest');

test('requestContainsAIInquiry detects aliased startAIInquiry mutations', () => {
  assert.equal(
    requestContainsAIInquiry({
      query: `
        mutation X($cardId: ID!) {
          renamed: startAIInquiry(cardId: $cardId, userQuestion: "why?") {
            answer
          }
        }
      `,
      operationName: 'X',
    }),
    true
  );
});

test('requestContainsAIInquiry detects startAIInquiry inside fragments', () => {
  assert.equal(
    requestContainsAIInquiry({
      query: `
        mutation X($cardId: ID!) {
          ...InquiryFields
        }

        fragment InquiryFields on Mutation {
          startAIInquiry(cardId: $cardId, userQuestion: "why?") {
            answer
          }
        }
      `,
      operationName: 'X',
    }),
    true
  );
});

test('requestContainsAIInquiry ignores ordinary board queries', () => {
  assert.equal(
    requestContainsAIInquiry({
      query: `
        query GetBoard {
          getBoard {
            id
            title
          }
        }
      `,
    }),
    false
  );
});

test('requestContainsAIInquiry detects AI inquiry in batched requests', () => {
  assert.equal(
    requestContainsAIInquiry([
      {
        query: 'query GetBoard { getBoard { id title } }',
      },
      {
        query: `
          mutation StartAIInquiry($cardId: ID!) {
            startAIInquiry(cardId: $cardId, userQuestion: "why?") {
              answer
            }
          }
        `,
      },
    ]),
    true
  );
});

test('isPublicGraphQLRequest allows only public root fields', () => {
  assert.equal(
    isPublicGraphQLRequest({
      query: 'mutation Login($input: LoginInput!) { login(input: $input) { token } }',
    }),
    true
  );
  assert.equal(
    isPublicGraphQLRequest({
      query: 'query GetBoard { getBoard { id } }',
    }),
    false
  );
});
