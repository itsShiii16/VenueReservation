/**
 * NotFoundPage.jsx — 404 page
 */

import { Link } from "react-router-dom";
import Button from "../../components/Button";

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center text-center">
      <div>
        <div className="text-6xl mb-4">🗺️</div>
        <h1 className="text-4xl font-bold text-gray-100">404</h1>
        <p className="text-gray-400 mt-2">The page you're looking for doesn't exist.</p>
        <div className="mt-6">
          <Link to="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
