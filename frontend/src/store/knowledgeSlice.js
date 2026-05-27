import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import client from '../apollo/client';
import { GET_KNOWLEDGE_GRAPH } from '../apollo/operations/knowledge';

export const fetchKnowledgeGraph = createAsyncThunk('knowledge/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await client.query({ query: GET_KNOWLEDGE_GRAPH, fetchPolicy: 'network-only' });
    return data.getKnowledgeGraph;
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
    // Append new nodes/edges from AI inquiry without full refetch
    appendGraphData(state, action) {
      const { nodes = [], edges = [] } = action.payload;
      const existingNodeIds = new Set(state.nodes.map(n => n.id));
      const existingEdgeKeys = new Set(state.edges.map(e => `${e.sourceId}-${e.targetId}`));

      nodes.forEach(n => { if (!existingNodeIds.has(n.id)) state.nodes.push(n); });
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
