import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App";

// StrictMode removed to prevent double effect execution
// This fixes notification duplication issues caused by effects running twice
createRoot(document.getElementById("root")!).render(<App />);
