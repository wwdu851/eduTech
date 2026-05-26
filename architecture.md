Client (React)
      ↓ (GraphQL over HTTP)
API Gateway / GraphQL Layer (Express + Apollo Server)
      ↓
Resolver Layer     <-- Only responsible for validation of parameters and return data
      ↓
Service Layer      <-- Safety feature, knowledge point retrieval, AI fetch
      ↓
Repository Layer   <-- Database layer (Neo4j / SQL)
      ↓
Database (Neo4j)
