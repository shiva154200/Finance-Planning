import React, { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { Button, Input, Label, Toast } from "../components/ui";
import { login } from "../services/api";
import { Link, useNavigate } from "react-router-dom";

export const LoginPage = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    try {
      const data = await login({ email, password });
      setShowSuccess(true);
      setTimeout(() => {
        onLogin(data.user, data.token);
        navigate("/");
      }, 1500);
    } catch (err) {
      setError(err.message || "Invalid credentials");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-50 flex relative">
      <Toast isVisible={showSuccess} message="Login successful!" />
      {/* Left side - Branding/Illustration */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center p-12 bg-slate-900">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay transition-transform duration-1000 hover:scale-105"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 via-slate-900/95 to-purple-900/90"></div>

        <div className="relative z-10 text-white max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 mb-8 shadow-lg shadow-indigo-500/30">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold mb-6 tracking-tight">AI Finance Planner</h1>
            <p className="text-xl text-indigo-100/80 leading-relaxed mb-10 font-light">
              Financial intelligence powered by AI. Build your customized financial roadmap and secure your future with our advanced planning algorithms.
            </p>
            <div className="grid grid-cols-2 gap-8 text-sm">
              <motion.div whileHover={{ y: -2 }} className="flex items-center gap-4 cursor-pointer group">
                <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10 group-hover:bg-white/20 transition-colors">
                  <svg className="h-5 w-5 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span className="text-indigo-50 font-medium">Bank-level Security</span>
              </motion.div>
              <motion.div whileHover={{ y: -2 }} className="flex items-center gap-4 cursor-pointer group">
                <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10 group-hover:bg-white/20 transition-colors">
                  <svg className="h-5 w-5 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-indigo-50 font-medium">Smart AI Analysis</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-white relative">
        <motion.div
          className="w-full max-w-md space-y-8"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back</h2>
            <p className="mt-3 text-sm text-slate-500">
              Welcome back to your financial future. Please enter your details.
            </p>
          </div>

          <form className="space-y-6 mt-8" onSubmit={handleSubmit}>
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-3">
                <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </motion.div>
            )}

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

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer transition-all"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 cursor-pointer hover:text-slate-900 transition-colors">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors cursor-pointer">
                  Forgot your password?
                </a>
              </div>
            </div>

            <Button type="submit" className="w-full mt-4 cursor-pointer" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-slate-500 pt-6">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500 focus:outline-none transition-colors inline-flex items-center justify-center gap-1 group cursor-pointer">
              Create an account <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
