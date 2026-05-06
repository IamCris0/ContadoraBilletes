import React from "react";
import { createRoot } from "react-dom/client";
import { ToastProvider } from "@/componentes/compartidos/Toast";
import { AuthProvider } from "@/hooks/useAuth";
import { Shell } from "@/App";
import "@/index.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ToastProvider>
      <AuthProvider>
        <Shell />
      </AuthProvider>
    </ToastProvider>
  </React.StrictMode>
);
