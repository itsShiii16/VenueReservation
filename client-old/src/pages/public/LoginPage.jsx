/**
 * LoginPage.jsx - User login page
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
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

  const handleSubmit = async (event) => {
    event.preventDefault();
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
    <div className="flex min-h-[76vh] items-center justify-center py-12">
      <div className="w-full max-w-xl rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
          <span className="text-2xl font-extrabold text-white">UP</span>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-100">Welcome Back</h1>
        <p className="mt-4 text-lg text-gray-400">
          Sign in to submit and track your reservation requests.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-4 text-left">
          {error && (
            <div className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="email"
              label="UP Mail"
              type="email"
              placeholder="you@upd.edu.ph"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <Button type="submit" className="min-h-14 w-full gap-3 text-base" loading={loading}>
            <Mail className="h-5 w-5" aria-hidden="true" />
            Sign in with UP Mail
          </Button>
        </form>

        <div className="my-10 flex items-center gap-3 text-sm uppercase text-gray-400">
          <span className="h-px flex-1 bg-zinc-200" />
          Or continue without account
          <span className="h-px flex-1 bg-zinc-200" />
        </div>

        <Link
          to="/venues"
          className="flex min-h-14 items-center justify-center rounded-lg border border-zinc-200 text-base font-bold text-gray-100 transition hover:border-primary hover:text-primary"
        >
          Browse as Guest
        </Link>

        <p className="mx-auto mt-12 max-w-md text-sm leading-relaxed text-gray-400">
          Guests can browse venues, but must sign in using UP Mail to submit a reservation request.
        </p>
      </div>
    </div>
  );
}
