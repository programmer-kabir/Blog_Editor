import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
export const fetchBlogs = createAsyncThunk("blogs/fetchBlogs", async () => {
  try {
    const response = await axios.get(
      "https://blogs-editor-server.vercel.app/blogs"
    );
    return response.data;
  } catch (error) {
    throw error;
  }
});

const blogsSlice = createSlice({
  name: "Blogs",
  initialState: {
    isBlogLoading: false,
    Blogs: [],
    isBlogError: null,
  },
  extraReducers: (builder) => {
    builder.addCase(fetchBlogs.pending, (state) => {
      state.isBlogLoading = true;
    });
    builder.addCase(fetchBlogs.fulfilled, (state, action) => {
      state.isBlogLoading = false;
      state.Blogs = action.payload;
    });
    builder.addCase(fetchBlogs.rejected, (state, action) => {
      state.isBlogLoading = false;
      state.Blogs = [];
      state.isBlogError = action.error.message;
    });
  },
});

export default blogsSlice.reducer;
