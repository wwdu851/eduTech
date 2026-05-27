import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import client from '../apollo/client';
import { GET_KNOWLEDGE_GRAPH } from '../apollo/operations/knowledge';

export function normalizeGraphNode(n) {
  if (!n) return null;
  return {
    id: String(n.id),
    label: String(n.label || ''),
    category: n.category ? String(n.category) : null,
    description: String(n.description || ''),
  };
}

function normalizeGraphPayload(payload) {
  return {
    nodes: (payload?.nodes || []).map(normalizeGraphNode).filter(Boolean),
    edges: (payload?.edges || []).map(e => ({
      sourceId: String(e.sourceId),
      targetId: String(e.targetId),
      relationType: String(e.relationType || ''),
    })),
  };
}

export const fetchKnowledgeGraph = createAsyncThunk('knowledge/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await client.query({ query: GET_KNOWLEDGE_GRAPH, fetchPolicy: 'network-only' });
    return normalizeGraphPayload(data.getKnowledgeGraph);
  } catch (err) {
    return rejectWithValue(err.graphQLErrors?.[0]?.message || err.message);
  }
});

const knowledgeSlice = createSlice({
  name: 'knowledge',
  initialState: {
    nodes: [],
    edges: [],
    loading: false,
    error: null,
  },
  reducers: {
    appendGraphData(state, action) {
      const { nodes = [], edges = [] } = action.payload;
      const existingNodeIds = new Set(state.nodes.map(n => n.id));
      const existingEdgeKeys = new Set(state.edges.map(e => `${e.sourceId}-${e.targetId}`));

      nodes.map(normalizeGraphNode).filter(Boolean).forEach(n => {
        if (!existingNodeIds.has(n.id)) state.nodes.push(n);
      });
      edges.forEach(e => {
        const key = `${e.sourceId}-${e.targetId}`;
        if (!existingEdgeKeys.has(key)) state.edges.push(e);
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchKnowledgeGraph.pending, (state) => { state.loading = true; })
      .addCase(fetchKnowledgeGraph.fulfilled, (state, action) => {
        state.loading = false;
        state.nodes = action.payload.nodes;
        state.edges = action.payload.edges;
      })
      .addCase(fetchKnowledgeGraph.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { appendGraphData } = knowledgeSlice.actions;
export default knowledgeSlice.reducer;
