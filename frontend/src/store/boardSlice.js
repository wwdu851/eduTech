import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import client from '../apollo/client';
import { GET_BOARD, CREATE_CARD, MOVE_CARD } from '../apollo/operations/board';

export const fetchBoard = createAsyncThunk('board/fetch', async ({ limit = 50, offset = 0 } = {}, { rejectWithValue }) => {
  try {
    const { data } = await client.query({ query: GET_BOARD, variables: { limit, offset }, fetchPolicy: 'network-only' });
    return data.getBoard;
  } catch (err) {
    return rejectWithValue(err.graphQLErrors?.[0]?.message || err.message);
  }
});

export const createCard = createAsyncThunk('board/createCard', async (input, { rejectWithValue }) => {
  try {
    const { data } = await client.mutate({ mutation: CREATE_CARD, variables: { input } });
    return data.createCard;
  } catch (err) {
    return rejectWithValue(err.graphQLErrors?.[0]?.message || err.message);
  }
});

export const moveCard = createAsyncThunk('board/moveCard', async ({ cardId, newColumnId }, { rejectWithValue }) => {
  try {
    const { data } = await client.mutate({ mutation: MOVE_CARD, variables: { cardId, newColumnId } });
    return data.moveCard;
  } catch (err) {
    return rejectWithValue(err.graphQLErrors?.[0]?.message || err.message);
  }
});

const COLUMNS = [
  { id: 'IDEATION_DISCOVERY',      label: '1. Ideation & Discovery' },
  { id: 'RESEARCH_INQUIRY',        label: '2. Research & Inquiry' },
  { id: 'SYNTHESIS_KNOWLEDGE',     label: '3. Synthesis & Knowledge' },
  { id: 'TRIP_PLANNING_LOGISTICS', label: '4. Trip Planning & Logistics' },
];

const boardSlice = createSlice({
  name: 'board',
  initialState: {
    cards: {},       // normalized: { [id]: card }
    columns: COLUMNS,
    loading: false,
    error: null,
  },
  reducers: {
    // Optimistic move for drag-and-drop
    optimisticMove(state, action) {
      const { cardId, newColumnId } = action.payload;
      if (state.cards[cardId]) {
        state.cards[cardId].columnId = newColumnId;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBoard.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchBoard.fulfilled, (state, action) => {
        state.loading = false;
        state.cards = {};
        action.payload.forEach(card => { state.cards[card.id] = card; });
      })
      .addCase(fetchBoard.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createCard.fulfilled, (state, action) => {
        const card = action.payload;
        state.cards[card.id] = card;
      })
      .addCase(moveCard.fulfilled, (state, action) => {
        const { id, columnId } = action.payload;
        if (state.cards[id]) state.cards[id].columnId = columnId;
      });
  },
});

export const { optimisticMove } = boardSlice.actions;
export const selectColumns = (state) => state.board.columns;
export const selectCardsByColumn = (columnId) => (state) =>
  Object.values(state.board.cards).filter(c => c.columnId === columnId);

export default boardSlice.reducer;
