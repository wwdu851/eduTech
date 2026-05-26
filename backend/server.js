const fs = require('fs');
const path = require('path');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@as-integrations/express5');
const { ApolloServerPluginLandingPageLocalDefault } = require('@apollo/server/plugin/landingPage/default');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window`
	standardHeaders: 'draft-7',
	legacyHeaders: false,
});

// Specific limiter for AI inquiries to prevent "Wallet Stress"
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 10, // Limit each IP to 10 AI inquiries per hour
  message: 'Too many AI inquiries from this IP, please try again after an hour',
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: (req) => {
    // Skip if it's not a startAIInquiry mutation
    // This is a bit hacky for express middleware, but works if we can see the body
    return !req.body?.query?.includes('startAIInquiry');
  }
});

const typeDefs = fs.readFileSync(path.join(__dirname, 'models', 'schema.graphql'), 'utf8');
const resolvers = require('./resolvers');
const authService = require('./services/auth.service');

async function startServer() {
  const app = express();
  
  // Middleware
  app.use(cookieParser());
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
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }));
  app.use(express.json());
  app.use(limiter);
  app.use('/graphql', aiLimiter);

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
  app.use('/graphql', expressMiddleware(server, {
    context: async ({ req, res }) => {
      const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '') || '';
      const userId = authService.verifyToken(token);
      return { userId, res };
    },
  }));

  // Start the server
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server ready at http://localhost:${PORT}/graphql`);
  });
}

startServer();