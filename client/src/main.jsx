import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import router from "./Router/Router.jsx";
import { RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./Pages/Redux/store.js";
import { Toaster } from "react-hot-toast";
import AuthProvider from "./Pages/Provider/AuthProvider.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HelmetProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <Provider store={store}>
            <Toaster />
            <RouterProvider router={router} />
          </Provider>
        </QueryClientProvider>
      </AuthProvider>
    </HelmetProvider>
  </StrictMode>
);
