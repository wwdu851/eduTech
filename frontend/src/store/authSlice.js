import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import client from '../apollo/client';
import { LOGIN_MUTATION, REGISTER_MUTATION } from '../apollo/operations/auth';

export const loginUser = createAsyncThunk('auth/login', async (input, { rejectWithValue }) => {
  try {
    const { data } = await client.mutate({ mutation: LOGIN_MUTATION, variables: { input } });
    return data.login;
  } catch (err) {
    return rejectWithValue(err.graphQLErrors?.[0]?.message || err.message);
  }
});

export const registerUser = createAsyncThunk('auth/register', async (input, { rejectWithValue }) => {
  try {
    const { data } = await client.mutate({ mutation: REGISTER_MUTATION, variables: { input } });
    return data.register;
  } catch (err) {
    return rejectWithValue(err.graphQLErrors?.[0]?.message || err.message);
  }
});

const stored = (() => {
  try { return JSON.parse(localStorage.getItem('auth_user')); } catch { return null; }
})();

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: stored?.user || null,
    token: stored?.token || null,
    loading: false,
    error: null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem('auth_user');
      client.clearStore();
    },
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    const handlePending = (state) => { state.loading = true; state.error = null; };
    const handleFulfilled = (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem('auth_user', JSON.stringify(action.payload));
    };
    const handleRejected = (state, action) => {
      state.loading = false;
      state.error = action.payload;
    };
    builder
      .addCase(loginUser.pending, handlePending)
      .addCase(loginUser.fulfilled, handleFulfilled)
      .addCase(loginUser.rejected, handleRejected)
      .addCase(registerUser.pending, handlePending)
      .addCase(registerUser.fulfilled, handleFulfilled)
      .addCase(registerUser.rejected, handleRejected);
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
