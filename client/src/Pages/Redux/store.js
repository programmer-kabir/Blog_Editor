import { configureStore } from "@reduxjs/toolkit";
import blogSlice from "./Blogs/blogSlice";
import usersSlice from "./Users/userSlice";
import bloggerBlogSlice from "./BloggerBlogs/bloggerBlogSlice";
import commentSlice from "./Comments/commentSlice";
import categorySlice from "./Categories/categorySlice";
import bookmarkSlice from "./Bookmarks/bookmarkSlice";

const store = configureStore({
  reducer: {
    Blogs: blogSlice,
    Users: usersSlice,
    BloggerBlog: bloggerBlogSlice,
    Comments: commentSlice,
    Categories: categorySlice,
    Bookmarks: bookmarkSlice,
  },
});

export default store;
