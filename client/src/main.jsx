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
            <Toaster
              position="top-right"
              reverseOrder={false}
              gutter={12}
              containerStyle={{
                top: 28,
                right: 28,
                zIndex: 999999,
              }}
              toastOptions={{
                className: "luxury-toast",
                duration: 3500,
                style: {
                  background: "rgba(15, 23, 42, 0.94)",
                  color: "#F8FAFC",
                  backdropFilter: "blur(18px)",
                  WebkitBackdropFilter: "blur(18px)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  boxShadow:
                    "0 20px 45px -10px rgba(0, 0, 0, 0.55), 0 0 1px 1px rgba(255, 255, 255, 0.08)",
                  padding: "13px 18px",
                  borderRadius: "14px",
                  fontSize: "13.5px",
                  fontWeight: "500",
                  letterSpacing: "0.015em",
                  fontFamily: "'Poppins', sans-serif",
                  maxWidth: "420px",
                },
                success: {
                  duration: 3200,
                  iconTheme: {
                    primary: "#10B981",
                    secondary: "#FFFFFF",
                  },
                  style: {
                    border: "1px solid rgba(16, 185, 129, 0.35)",
                    boxShadow:
                      "0 20px 40px -12px rgba(0, 0, 0, 0.5), 0 0 25px -4px rgba(16, 185, 129, 0.3)",
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: "#F43F5E",
                    secondary: "#FFFFFF",
                  },
                  style: {
                    border: "1px solid rgba(244, 63, 94, 0.35)",
                    boxShadow:
                      "0 20px 40px -12px rgba(0, 0, 0, 0.5), 0 0 25px -4px rgba(244, 63, 94, 0.3)",
                  },
                },
                loading: {
                  iconTheme: {
                    primary: "#818CF8",
                    secondary: "#FFFFFF",
                  },
                  style: {
                    border: "1px solid rgba(129, 140, 248, 0.35)",
                    boxShadow:
                      "0 20px 40px -12px rgba(0, 0, 0, 0.5), 0 0 20px -4px rgba(129, 140, 248, 0.25)",
                  },
                },
              }}
            />
            <RouterProvider router={router} />
          </Provider>
        </QueryClientProvider>
      </AuthProvider>
    </HelmetProvider>
  </StrictMode>
);
