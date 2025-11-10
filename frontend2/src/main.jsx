import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { CmsProvider } from "./context/CmsContext.jsx";

console.log("🧠 [main.jsx] App starting...");

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <CmsProvider>
      <App />
    </CmsProvider>
  </StrictMode>
);
