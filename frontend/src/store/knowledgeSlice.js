import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import client from '../apollo/client';
import { GET_KNOWLEDGE_GRAPH, DELETE_KNOWLEDGE_NODE } from '../apollo/operations/knowledge';
import { normalizeGraphNode, normalizeGraphPayload } from '../utils/knowledgeGraph';

export const fetchKnowledgeGraph = createAsyncThunk('knowledge/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await client.query({ query: GET_KNOWLEDGE_GRAPH, fetchPolicy: 'network-only' });
    return normalizeGraphPayload(data.getKnowledgeGraph);
  } catch (err) {
    return rejectWithValue(err.graphQLErrors?.[0]?.message || err.message);
  }
});

export const deleteKnowledgeNode = createAsyncThunk(
  'knowledge/delete',
  async (nodeId, { rejectWithValue }) => {
    try {
      await client.mutate({
        mutation: DELETE_KNOWLEDGE_NODE,
        variables: { nodeId }
      });
      return nodeId;
    } catch (err) {
      return rejectWithValue(err.graphQLErrors?.[0]?.message || err.message);
    }
  }
);

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
      })
      .addCase(deleteKnowledgeNode.fulfilled, (state, action) => {
        const nodeId = action.payload;
        state.nodes = state.nodes.filter(n => n.id !== nodeId);
        state.edges = state.edges.filter(e => e.sourceId !== nodeId && e.targetId !== nodeId);
      });
  },
});

export const { appendGraphData } = knowledgeSlice.actions;
export default knowledgeSlice.reducer;
