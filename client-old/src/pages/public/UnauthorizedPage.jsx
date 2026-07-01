/**
 * UnauthorizedPage.jsx — Shown when a user doesn't have the required role
 */

import { Link } from "react-router-dom";
import Button from "../../components/Button";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center text-center">
      <div>
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-100">Access Denied</h1>
        <p className="text-gray-400 mt-2 max-w-md">
          You don't have permission to access this page. Please contact your administrator
          if you believe this is a mistake.
        </p>
        <div className="mt-6">
          <Link to="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
