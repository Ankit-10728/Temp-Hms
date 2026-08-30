/* eslint-disable no-unused-vars */
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { Toaster } from "react-hot-toast";


ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: "#fff",
          color: "#1e293b",
          border: "1px solid #f97316",
          borderRadius: "12px",
          padding: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        },
      }}
    />
    <App />
  </BrowserRouter>
);