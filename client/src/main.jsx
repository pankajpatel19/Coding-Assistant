import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RagProvider } from "./context/RagContext";
import { ThemeProvider } from "./context/ThemeContext";
import "./index.css";
import App from "./App.jsx";

const queryClient = new QueryClient({
  defaultOptions: { mutations: { retry: 0 } },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RagProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </RagProvider>
    </QueryClientProvider>
  </StrictMode>,
);
