const fs = require('fs');
const path = require('path');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@as-integrations/express5');
const { ApolloServerPluginLandingPageLocalDefault } = require('@apollo/server/plugin/landingPage/default');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const typeDefs = fs.readFileSync(path.join(__dirname, 'models', 'schema.graphql'), 'utf8');
const resolvers = require('./resolvers');

async function startServer() {
  const app = express();
  
  // Middleware
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            "https://embeddable-sandbox.cdn.apollographql.com",
            "https://apollo-server-landing-page.cdn.apollographql.com",
          ],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            "https://fonts.googleapis.com",
            "https://embeddable-sandbox.cdn.apollographql.com",
            "https://apollo-server-landing-page.cdn.apollographql.com",
          ],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          frameSrc: ["'self'", "https://sandbox.embed.apollographql.com"],
          imgSrc: [
            "'self'",
            "data:",
            "https://apollo-server-landing-page.cdn.apollographql.com",
          ],
          connectSrc: [
            "'self'",
            "http://localhost:4000",
            "https://sandbox.embed.apollographql.com",
            "https://apollo-server-landing-page.cdn.apollographql.com",
          ],
        },
      },
    })
  );
  app.use(cors());
  app.use(express.json());

  // Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
    plugins: [
      ApolloServerPluginLandingPageLocalDefault({ embed: true }),
    ],
  });
  await server.start();

  // GraphQL endpoint
  app.use('/graphql', expressMiddleware(server));

  // Start the server
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server ready at http://localhost:${PORT}/graphql`);
  });
}

startServer();