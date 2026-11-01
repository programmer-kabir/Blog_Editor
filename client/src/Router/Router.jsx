import React, { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../Layout/MainLayout";
import PrivateRoute from "./PrivetRoute";
import AdminRoute from "./AdminRoute";
import BloggerRoute from "./BloggerRoute";
import Error from "../Pages/Error/ErrorPage";
import Loader from "../Components/Loader/Loader";

// Lazy-loaded Routes for Code Splitting & Performance
const Home = lazy(() => import("../Pages/Home/Home"));
const Add = lazy(() => import("../Components/Home/Add"));
const Blogs = lazy(() => import("../Pages/Blogs/Blogs"));
const DetailsBlog = lazy(() => import("../Components/Blog/DetailsBlog"));
const Blog = lazy(() => import("../Components/Blog/Blog"));
const Signin = lazy(() => import("../Pages/Authentication/Signin/Signin"));
const Signup = lazy(() => import("../Pages/Authentication/Signup/Signup"));
const Dashboard = lazy(() => import("../Pages/Dashboard/Dashboard"));
const AdminBoard = lazy(() => import("../Pages/Dashboard/Admin/AdminBoard"));
const Blogger = lazy(() => import("../Pages/Dashboard/Blogger/Blogger"));
const AddBlog = lazy(() => import("../Pages/Dashboard/Blogger/AddBlog"));
const ShowBlog = lazy(() => import("../Pages/Dashboard/Blogger/ShowBlog"));
const AllBloggers = lazy(() => import("../Pages/Dashboard/Admin/AllBloggers"));
const AllUser = lazy(() => import("../Pages/Dashboard/Admin/AllUser"));
const AdminBlogs = lazy(() => import("../Pages/Dashboard/Admin/AdminBlogs"));
const ManageCategories = lazy(() => import("../Pages/Dashboard/Admin/ManageCategories"));
const MyBookmarks = lazy(() => import("../Pages/Dashboard/Bookmarks/MyBookmarks"));
const AboutUs = lazy(() => import("../Pages/FooterPages/AboutUs"));
const ContactUs = lazy(() => import("../Pages/FooterPages/ContactUs"));
const Terms = lazy(() => import("../Pages/FooterPages/Terms"));
const FAQs = lazy(() => import("../Pages/FooterPages/FAQs"));
const AuthorProfile = lazy(() => import("../Pages/Author/AuthorProfile"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <Error />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/AddBlog",
        element: <Add />,
      },
      {
        path: "/author/:email",
        element: <AuthorProfile />,
      },
      {
        path: "/signup",
        element: <Signup />,
      },
      {
        path: "/signin",
        element: <Signin />,
      },
      {
        path: "/about-us",
        element: <AboutUs />,
      },
      {
        path: "/contact-us",
        element: <ContactUs />,
      },
      {
        path: "/trems-conditions",
        element: <Terms />,
      },
      {
        path: "/faqs",
        element: <FAQs />,
      },
    ],
  },
  {
    path: "/blogs",
    element: (
      <Suspense fallback={<Loader />}>
        <Blogs />
      </Suspense>
    ),
    children: [
      {
        path: "",
        element: <Blog />,
      },
      {
        path: "category/:name",
        element: <Blog />,
      },
      {
        path: "tag/:name",
        element: <Blog />,
      },
      {
        path: "details/:id",
        element: <DetailsBlog />,
      },
      {
        path: "details/:id/:slug",
        element: <DetailsBlog />,
      },
    ],
  },
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <Suspense fallback={<Loader />}>
          <Dashboard />
        </Suspense>
      </PrivateRoute>
    ),
    children: [
      {
        path: "admin",
        element: (
          <AdminRoute>
            <AdminBoard />
          </AdminRoute>
        ),
      },
      {
        path: "admin/show-bloggers",
        element: (
          <AdminRoute>
            <AllBloggers />
          </AdminRoute>
        ),
      },
      {
        path: "admin/show-users",
        element: (
          <AdminRoute>
            <AllUser />
          </AdminRoute>
        ),
      },
      {
        path: "admin/blogs",
        element: (
          <AdminRoute>
            <AdminBlogs />
          </AdminRoute>
        ),
      },
      {
        path: "admin/categories",
        element: (
          <AdminRoute>
            <ManageCategories />
          </AdminRoute>
        ),
      },
      {
        path: "blogger",
        element: (
          <BloggerRoute>
            <Blogger />
          </BloggerRoute>
        ),
      },
      {
        path: "blogger/add-blog",
        element: (
          <BloggerRoute>
            <AddBlog />
          </BloggerRoute>
        ),
      },
      {
        path: "blogger/show-blog",
        element: (
          <BloggerRoute>
            <ShowBlog />
          </BloggerRoute>
        ),
      },
      {
        path: "blogger/blog-details/:id",
        element: (
          <BloggerRoute>
            <DetailsBlog />
          </BloggerRoute>
        ),
      },
      {
        path: "bookmarks",
        element: <MyBookmarks />,
      },
    ],
  },
]);

export default router;
