import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// 1. Fetch full bookmarked blog documents for the bookmarks page
export const fetchBookmarks = createAsyncThunk(
  "bookmarks/fetchBookmarks",
  async (email) => {
    if (!email) return [];
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/bookmarks?email=${email}`
    );
    return res.data;
  }
);

// 2. Fetch list of IDs for instant check across cards and details
export const fetchBookmarkIds = createAsyncThunk(
  "bookmarks/fetchBookmarkIds",
  async (email) => {
    if (!email) return [];
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/bookmarks/ids?email=${email}`
    );
    return res.data;
  }
);

// 3. Toggle a bookmark
export const toggleBookmark = createAsyncThunk(
  "bookmarks/toggleBookmark",
  async ({ email, blogId }, { dispatch }) => {
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/bookmarks/toggle`,
      { email, blogId }
    );
    // Refresh bookmark IDs and full bookmarks list
    dispatch(fetchBookmarkIds(email));
    dispatch(fetchBookmarks(email));
    return { blogId, bookmarked: res.data.bookmarked, message: res.data.message };
  }
);

const bookmarkSlice = createSlice({
  name: "bookmarks",
  initialState: {
    isLoading: false,
    bookmarks: [],
    bookmarkedIds: [],
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchBookmarks
      .addCase(fetchBookmarks.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchBookmarks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bookmarks = action.payload || [];
      })
      .addCase(fetchBookmarks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // fetchBookmarkIds
      .addCase(fetchBookmarkIds.fulfilled, (state, action) => {
        state.bookmarkedIds = action.payload || [];
      });
  },
});

export default bookmarkSlice.reducer;

