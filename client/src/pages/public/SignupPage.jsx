/**
 * SignupPage.jsx — User registration page
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Input from "../../components/Input";
import Button from "../../components/Button";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    organization: "",
    position: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(formData);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-100">Create an account</h1>
          <p className="text-gray-400 mt-1">Join the UPD Venue Reservation System</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-surface border border-surface-lighter rounded-xl p-6 space-y-4"
        >
          {error && (
            <div className="bg-danger/10 border border-danger/30 text-danger text-sm rounded-lg p-3">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input id="firstName" label="First Name" name="firstName" placeholder="Juan" value={formData.firstName} onChange={handleChange} required />
            <Input id="lastName" label="Last Name" name="lastName" placeholder="Dela Cruz" value={formData.lastName} onChange={handleChange} required />
          </div>

          <Input id="email" label="Email" name="email" type="email" placeholder="you@upd.edu.ph" value={formData.email} onChange={handleChange} required />
          <Input id="password" label="Password" name="password" type="password" placeholder="At least 6 characters" value={formData.password} onChange={handleChange} required />
          <Input id="organization" label="Organization (optional)" name="organization" placeholder="e.g., College of Engineering" value={formData.organization} onChange={handleChange} />
          <Input id="position" label="Position (optional)" name="position" placeholder="e.g., Student, Faculty" value={formData.position} onChange={handleChange} />

          <Button type="submit" className="w-full" loading={loading}>
            Create Account
          </Button>

          <p className="text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:text-primary-light transition-colors">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
