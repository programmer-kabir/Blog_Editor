import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
export const fetchComments = createAsyncThunk(
  "comments/fetchComments",
  async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/comments`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
);

const commentSlice = createSlice({
  name: "Comments",
  initialState: {
    isCommentsLoading: false,
    Comments: [],
    isCommentsError: null,
  },
  extraReducers: (builder) => {
    builder.addCase(fetchComments.pending, (state) => {
      state.isCommentsLoading = true;
    });
    builder.addCase(fetchComments.fulfilled, (state, action) => {
      state.isCommentsLoading = false;
      state.Comments = action.payload;
    });
    builder.addCase(fetchComments.rejected, (state, action) => {
      state.isCommentsLoading = false;
      state.Comments = [];
      state.isCommentsError = action.error.message;
    });
  },
});

export default commentSlice.reducer;
