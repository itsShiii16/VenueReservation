/**
 * App.jsx — Root application component
 *
 * Wraps the app in AuthProvider and BrowserRouter,
 * then renders the route configuration.
 */

import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "sonner";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </BrowserRouter>
  );
}
