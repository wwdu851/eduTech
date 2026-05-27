const fs = require('fs');
const path = require('path');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@as-integrations/express5');
const { ApolloServerPluginLandingPageLocalDefault } = require('@apollo/server/plugin/landingPage/default');
const { ApolloServerPluginLandingPageDisabled } = require('@apollo/server/plugin/disabled');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const { parse } = require('graphql');
const env = require('./config/env');

const PUBLIC_GRAPHQL_FIELDS = new Set(['login', 'register', '__schema', '__type', '__typename']);

function collectSelectionFields(selectionSet, fragments, fields, visitedFragments = new Set()) {
  for (const selection of selectionSet?.selections || []) {
    if (selection.kind === 'Field') {
      fields.add(selection.name.value);
    }

    if (selection.kind === 'InlineFragment') {
      collectSelectionFields(selection.selectionSet, fragments, fields, visitedFragments);
    }

    if (selection.kind === 'FragmentSpread' && !visitedFragments.has(selection.name.value)) {
      visitedFragments.add(selection.name.value);
      collectSelectionFields(fragments.get(selection.name.value)?.selectionSet, fragments, fields, visitedFragments);
    }
  }
}

function getRootOperationFields(query, operationName) {
  if (typeof query !== 'string') return new Set();

  const document = parse(query);
  const fragments = new Map();
  const operations = [];

  for (const definition of document.definitions) {
    if (definition.kind === 'FragmentDefinition') {
      fragments.set(definition.name.value, definition);
    }

    if (definition.kind === 'OperationDefinition') {
      operations.push(definition);
    }
  }

  const selectedOperations = operationName
    ? operations.filter(operation => operation.name?.value === operationName)
    : operations;

  const fields = new Set();
  for (const operation of selectedOperations) {
    collectSelectionFields(operation.selectionSet, fragments, fields);
  }

  return fields;
}

function documentContainsField(query, fieldName, operationName) {
  try {
    return getRootOperationFields(query, operationName).has(fieldName);
  } catch {
    return typeof query === 'string' && query.includes(fieldName);
  }
}

function requestContainsAIInquiry(body) {
  const operations = Array.isArray(body) ? body : [body];
  return operations.some(operation => documentContainsField(operation?.query, 'startAIInquiry', operation?.operationName));
}

function isPublicGraphQLRequest(body) {
  const operations = Array.isArray(body) ? body : [body];
  return operations.every(operation => {
    try {
      const fields = getRootOperationFields(operation?.query, operation?.operationName);
      return fields.size > 0 && [...fields].every(field => PUBLIC_GRAPHQL_FIELDS.has(field));
    } catch {
      return false;
    }
  });
}

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 50, // Reduced from 100 to be tighter
	standardHeaders: 'draft-7',
	legacyHeaders: false,
});

// Specific limiter for AI inquiries to prevent "Wallet Stress"
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 50, // Increased to 50 as requested
  message: 'Too many AI inquiries from this IP, please try again after an hour',
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: (req) => {
    return !requestContainsAIInquiry(req.body);
  }
});

const typeDefs = fs.readFileSync(path.join(__dirname, 'models', 'schema.graphql'), 'utf8');
const resolvers = require('./resolvers');
const authService = require('./services/auth.service');
const driver = require('./config/neo4j');

async function startServer() {
  const app = express();

  if (env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }

  // Health check — includes Neo4j connectivity for Render readiness probes
  app.get('/health', async (req, res) => {
    const payload = {
      timestamp: new Date().toISOString(),
      env: env.NODE_ENV,
    };

    try {
      const session = driver.session();
      try {
        await session.run('RETURN 1');
      } finally {
        await session.close();
      }
      res.json({ status: 'ok', database: 'connected', ...payload });
    } catch (err) {
      console.error('Health check failed:', err.message);
      res.status(503).json({
        status: 'error',
        database: 'unavailable',
        ...payload,
      });
    }
  });

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
          manifestSrc: [
            "'self'",
            "https://apollo-server-landing-page.cdn.apollographql.com"
          ],
          frameAncestors: [
            "'self'",
            "https://studio.apollographql.com",
            "https://sandbox.embed.apollographql.com",
            "https://embeddable-sandbox.netlify.app"
          ]
        },
      },
    })
  );
  
  // Tighten CORS
  const allowedOrigins = env.NODE_ENV === 'production'
    ? [env.FRONTEND_URL]
    : [
        env.FRONTEND_URL || 'http://localhost:3000',
        'https://studio.apollographql.com',
        'https://sandbox.embed.apollographql.com'
      ];

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  }));

  app.use(express.json());
  app.use('/graphql', aiLimiter);
  if (env.NODE_ENV === 'production') {
    app.use(limiter);
  }

  // Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: env.NODE_ENV !== 'production', // Disable in production
    formatError: (formattedError, error) => {
      // Don't leak internal error details in production
      if (env.NODE_ENV === 'production') {
        return {
          message: formattedError.message,
          path: formattedError.path,
          extensions: {
            code: formattedError.extensions?.code
          }
        };
      }
      return formattedError;
    },
    plugins: env.NODE_ENV === 'production'
      ? [ApolloServerPluginLandingPageDisabled()]
      : [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
  });
  await server.start();

  // GraphQL endpoint
  app.use('/graphql', expressMiddleware(server, {
    context: async ({ req, res }) => {
      const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '') || '';
      const userId = authService.verifyToken(token);
      if (!userId && !isPublicGraphQLRequest(req.body)) {
        throw new Error('Unauthorized');
      }
      return { userId, res };
    },
  }));

  // Start the server
  const PORT = env.PORT;
  app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
    console.log(`🏥 Health check at http://localhost:${PORT}/health`);
  });
}

startServer();
