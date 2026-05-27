# ExploreIQ Frontend

Educational Kanban app for experiential learning trip planning with AI inquiry and knowledge graph visualization.

## Development

```bash
npm install
npm run dev
```

Opens at http://localhost:3000. GraphQL requests proxy to `/graphql`.

### Environment variables

| Variable | Description |
|----------|-------------|
| `VITE_GRAPHQL_URL` | Full GraphQL endpoint (optional; defaults to `/graphql` proxy) |
| `VITE_GRAPHQL_PROXY` | Dev proxy target for `/graphql` (default: production Render URL). Set to `http://localhost:4000` for local backend. |

Example `.env.local`:

```
VITE_GRAPHQL_PROXY=http://localhost:4000
```

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run preview` — preview production build
- `npm run lint` — ESLint

## Routes

- `/login` — authentication
- `/board` — Kanban board
- `/inquiry/:cardId` — AI chat + knowledge graph
- `/explorer/:cardId` — alias for inquiry
