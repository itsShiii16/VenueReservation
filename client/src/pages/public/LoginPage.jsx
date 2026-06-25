/**
 * LoginPage.jsx — User login page
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getDefaultPath } from "../../utils/roleHelpers";
import Input from "../../components/Input";
import Button from "../../components/Button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(getDefaultPath(user.role));
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">V</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-100">Welcome back</h1>
          <p className="text-gray-400 mt-1">Sign in to your VRS account</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-surface border border-surface-lighter rounded-xl p-6 space-y-4"
        >
          {error && (
            <div className="bg-danger/10 border border-danger/30 text-danger text-sm rounded-lg p-3">
              {error}
            </div>
          )}

          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="you@upd.edu.ph"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" className="w-full" loading={loading}>
            Sign In
          </Button>

          <p className="text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:text-primary-light transition-colors">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
