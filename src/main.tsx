import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "framer-motion";
import "./index.css";
import App from "./App.tsx";
import { QueryProvider } from "@/components/QueryProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <QueryProvider>
        <App />
      </QueryProvider>
    </MotionConfig>
  </StrictMode>,
);
