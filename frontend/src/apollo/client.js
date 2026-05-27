import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client/core';
import { onError } from '@apollo/client/link/error';

const uri = import.meta.env.VITE_GRAPHQL_URL || '/graphql';

const httpLink = createHttpLink({
  uri,
  credentials: 'include',
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, path }) => {
      console.error(`[GraphQL error] ${path}: ${message}`);
    });
  }
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

const client = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          getBoard: { merge: false },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: { fetchPolicy: 'cache-and-network' },
  },
});

export default client;