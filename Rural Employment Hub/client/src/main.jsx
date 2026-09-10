import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HelmetProvider>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <App />
    </HelmetProvider>
  </React.StrictMode>
);
