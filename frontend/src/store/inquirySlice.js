import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import client from '../apollo/client';
import { START_AI_INQUIRY } from '../apollo/operations/inquiry';
import { fetchKnowledgeGraph } from './knowledgeSlice';

// Multi-turn: build prompt context from history
const buildContextualQuestion = (history, newQuestion) => {
  if (history.length === 0) return newQuestion;
  const context = history
    .slice(-6) // last 3 turns
    .map(m => `${m.role === 'user' ? 'Student' : 'AI'}: ${m.content}`)
    .join('\n');
  return `Previous conversation:\n${context}\n\nStudent's new question: ${newQuestion}`;
};

export const sendInquiry = createAsyncThunk(
  'inquiry/send',
  async ({ cardId, question }, { getState, rejectWithValue, dispatch }) => {
    const history = getState().inquiry.conversations[cardId] || [];
    const contextualQuestion = buildContextualQuestion(history, question);

    // Add user message immediately
    dispatch(addMessage({ cardId, message: { role: 'user', content: question, timestamp: Date.now() } }));

    try {
      const { data } = await client.mutate({
        mutation: START_AI_INQUIRY,
        variables: { cardId, userQuestion: contextualQuestion },
      });
      const result = data.startAIInquiry;
      dispatch(fetchKnowledgeGraph());
      return { cardId, result };
    } catch (err) {
      return rejectWithValue(err.graphQLErrors?.[0]?.message || err.message);
    }
  }
);

const inquirySlice = createSlice({
  name: 'inquiry',
  initialState: {
    activeCardId: null,
    conversations: {},   // { [cardId]: Message[] }
    loading: false,
    error: null,
  },
  reducers: {
    setActiveCard(state, action) {
      state.activeCardId = action.payload;
      state.error = null;
      if (!state.conversations[action.payload]) {
        state.conversations[action.payload] = [];
      }
    },
    addMessage(state, action) {
      const { cardId, message } = action.payload;
      if (!state.conversations[cardId]) state.conversations[cardId] = [];
      state.conversations[cardId].push(message);
    },
    clearConversation(state, action) {
      state.conversations[action.payload] = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendInquiry.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(sendInquiry.fulfilled, (state, action) => {
        state.loading = false;
        const { cardId, result } = action.payload;
        if (!state.conversations[cardId]) state.conversations[cardId] = [];
        state.conversations[cardId].push({
          role: 'ai',
          content: result.answer,
          timestamp: Date.now(),
          suggestedCards: result.suggestedCards || [],
        });
      })
      .addCase(sendInquiry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setActiveCard, addMessage, clearConversation } = inquirySlice.actions;
export const selectConversation = (cardId) => (state) => state.inquiry.conversations[cardId] || [];
export default inquirySlice.reducer;
