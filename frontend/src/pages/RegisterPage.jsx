import React, { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { Button, Input, Label, Toast } from "../components/ui";
import { register } from "../services/api";
import { Link, useNavigate } from "react-router-dom";

export const RegisterPage = ({ onRegister }) => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    try {
      const data = await register({ name, email, password });
      setShowSuccess(true);
      setTimeout(() => {
        onRegister(data.user, data.token);
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      setError(err.message || "Registration failed");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-50 flex flex-row-reverse relative">
      <Toast isVisible={showSuccess} message="Account created successfully!" />
      {/* Right side - Branding/Illustration */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center p-12 bg-slate-900">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay transition-transform duration-1000 hover:scale-105"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-indigo-900/90 via-slate-900/95 to-purple-900/90"></div>

        <div className="relative z-10 text-white max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 mb-8 shadow-lg shadow-purple-500/30">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold mb-6 tracking-tight">Start Your Journey</h1>
            <p className="text-xl text-purple-100/80 leading-relaxed mb-8 font-light">
              Join thousands of others who have taken control of their financial destiny using our intelligent planning tools.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Left side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-white relative">
        <Link
          to="/login"
          className="absolute top-6 left-6 sm:top-10 sm:left-10 flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-semibold cursor-pointer group p-2 rounded-lg hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to login
        </Link>

        <motion.div
          className="w-full max-w-md space-y-8 mt-12"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create an account</h2>
            <p className="mt-3 text-sm text-slate-500">
              Enter your details to get started with AI Finance Planner.
            </p>
          </div>

          <form className="space-y-5 mt-8" onSubmit={handleSubmit}>
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-3">
                <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </motion.div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="cursor-pointer">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="cursor-pointer">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="cursor-pointer">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 focus:outline-none cursor-pointer transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="cursor-pointer">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full"
                required
              />
            </div>

            <Button type="submit" className="w-full mt-6 cursor-pointer" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};
