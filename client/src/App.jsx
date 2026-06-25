/**
 * App.jsx — Root application component
 *
 * Wraps the app in AuthProvider and BrowserRouter,
 * then renders the route configuration.
 */

import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
