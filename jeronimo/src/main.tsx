import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Sem StrictMode: em dev ele roda o carregamento inicial duas vezes e duplicaria os exemplos.
createRoot(document.getElementById("root")!).render(<App />);
