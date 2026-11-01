import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
export const fetchUsers = createAsyncThunk("users/fetchUsers", async () => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/users`
    );
    console.log(response.data);
    return response?.data;
  } catch (error) {
    throw error;
  }
});

const usersSlice = createSlice({
  name: "Users",
  initialState: {
    isUsersLoading: false,
    Users: [],
    isUsersError: null,
  },
  extraReducers: (builder) => {
    builder.addCase(fetchUsers.pending, (state) => {
      state.isUsersLoading = true;
    });
    builder.addCase(fetchUsers.fulfilled, (state, action) => {
      state.isUsersLoading = false;
      state.Users = action.payload;
    });
    builder.addCase(fetchUsers.rejected, (state, action) => {
      state.isUsersLoading = false;
      state.Users = [];
      state.isUsersError = action.error.message;
    });
  },
});

export default usersSlice.reducer;
