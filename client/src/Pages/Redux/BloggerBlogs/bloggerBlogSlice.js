import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchBloggerBlogs = createAsyncThunk(
  "bloggerBlogs/fetchBloggerBlogs",
  async (userEmail) => {
    try {
      // Send userEmail in the API request
      const response = await axios.get(
        `https://blogs-editor-server.vercel.app/bloggersBlog?email=${userEmail}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
);

const bloggerBlogSlice = createSlice({
  name: "BloggerBlog",
  initialState: {
    isBloggerBlogLoading: false,
    BloggerBlog: [],
    isBloggerBlogError: null,
  },
  extraReducers: (builder) => {
    builder.addCase(fetchBloggerBlogs.pending, (state) => {
      state.isBloggerBlogLoading = true;
    });
    builder.addCase(fetchBloggerBlogs.fulfilled, (state, action) => {
      state.isBloggerBlogLoading = false;
      state.BloggerBlog = action.payload;
    });
    builder.addCase(fetchBloggerBlogs.rejected, (state, action) => {
      state.isBloggerBlogLoading = false;
      state.BloggerBlog = [];
      state.isBloggerBlogError = action.error.message;
    });
  },
});

export default bloggerBlogSlice.reducer;
