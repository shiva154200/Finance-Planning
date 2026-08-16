import React from "react";
import { Button } from "../components/ui";
import {
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  PieChart,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";

export const LandingPage = ({ user }) => {
  const navigate = useNavigate();

  const handleStart = () => {
    if (user) {
      navigate("/form");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="flex-1 bg-slate-50 overflow-hidden relative flex flex-col">
      {/* Animated Background Mesh */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-indigo-400/20 blur-[120px] animate-pulse" />
        <div
          className="absolute top-[20%] -right-[20%] w-[60%] h-[60%] rounded-full bg-purple-400/20 blur-[120px] animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Hero Section */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-20 lg:pt-32">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-semibold mb-8 cursor-pointer hover:bg-indigo-100 transition-colors"
          >
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-ping"></span>
            AI-Powered Wealth Management
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl md:text-7xl"
          >
            Take Control of Your <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Financial Future
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed"
          >
            Our advanced AI analyzes your complete financial profile to create
            a personalized, actionable roadmap designed for your unique goals.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex justify-center"
          >
            <Button
              size="lg"
              className="text-lg h-14 px-10 rounded-full gap-2 shadow-xl shadow-indigo-600/20 group cursor-pointer"
              onClick={handleStart}
            >
              Get Your Plan
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>

        {/* Features */}
        <div className="mt-32 grid grid-cols-1 gap-8 sm:grid-cols-3 max-w-5xl mx-auto relative z-10">
          {[
            {
              icon: <PieChart className="h-6 w-6" />,
              title: "Smart Allocation",
              desc: "Optimal portfolio mix dynamically adjusted based on your risk profile and timeline.",
              color: "text-indigo-600",
              bg: "bg-indigo-50",
            },
            {
              icon: <ShieldCheck className="h-6 w-6" />,
              title: "Risk Management",
              desc: "Comprehensive safety net planning to protect you from unforeseen circumstances.",
              color: "text-emerald-600",
              bg: "bg-emerald-50",
            },
            {
              icon: <TrendingUp className="h-6 w-6" />,
              title: "Goal Tracking",
              desc: "Clear pathways and milestones to accelerate achieving your financial objectives.",
              color: "text-purple-600",
              bg: "bg-purple-50",
            },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.5 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group flex flex-col items-center text-center p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 transition-all cursor-pointer"
            >
              <div
                className={`p-4 rounded-2xl ${feature.color} ${feature.bg} mb-5 group-hover:scale-110 transition-transform duration-300`}
              >
                {feature.icon}
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-3">
                {feature.title}
              </h3>

              <p className="text-slate-600 text-sm leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-slate-900 pt-20 pb-10 mt-20 border-t border-slate-800 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">

            {/* Branding */}
            <div className="md:col-span-2">
              <Link to="/" className="inline-block mb-6 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <span className="text-2xl font-extrabold tracking-tight text-white group-hover:text-indigo-400 transition-colors duration-300">
                  AI Finance Planner
                </span>
              </Link>
              <p className="text-sm text-slate-400 leading-relaxed mb-8 max-w-sm">
                Empowering your financial future with advanced artificial intelligence. Secure, personalized, and data-driven financial planning.
              </p>
              <div className="flex items-center gap-4">
                <a href="#!" className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-indigo-600 hover:border-indigo-500 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-1">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                </a>
                <a href="#!" className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 hover:border-slate-500 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-slate-900/50 hover:-translate-y-1">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                </a>
              </div>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-semibold text-white mb-6 tracking-wide">Company</h3>
              <ul className="space-y-4 text-sm text-slate-400">
                <li><a href="#!" className="hover:text-indigo-400 hover:translate-x-1 inline-block transition-all duration-300 cursor-pointer">Product</a></li>
                <li><a href="#!" className="hover:text-indigo-400 hover:translate-x-1 inline-block transition-all duration-300 cursor-pointer">About</a></li>
                <li><a href="#!" className="hover:text-indigo-400 hover:translate-x-1 inline-block transition-all duration-300 cursor-pointer">Contact Us</a></li>
                <li><a href="#!" className="hover:text-indigo-400 hover:translate-x-1 inline-block transition-all duration-300 cursor-pointer">FAQ</a></li>
              </ul>
            </div>

            {/* Legal & Support */}
            <div>
              <h3 className="font-semibold text-white mb-6 tracking-wide">Legal & Support</h3>
              <ul className="space-y-4 text-sm text-slate-400">
                <li><a href="#!" className="hover:text-indigo-400 hover:translate-x-1 inline-block transition-all duration-300 cursor-pointer">Privacy Policy</a></li>
                <li><a href="#!" className="hover:text-indigo-400 hover:translate-x-1 inline-block transition-all duration-300 cursor-pointer">Terms & Conditions</a></li>
                <li><a href="mailto:support@aifinance.com" className="hover:text-indigo-400 hover:translate-x-1 inline-block transition-all duration-300 cursor-pointer">support@aifinance.com</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col lg:flex-row items-center justify-between gap-6">
            <p className="text-xs text-slate-500 whitespace-nowrap">
              © {new Date().getFullYear()} AI Finance Planner. All rights reserved.
            </p>
            <p className="text-[10px] text-slate-500 max-w-3xl text-center lg:text-right leading-relaxed">
              Disclaimer: The information provided by AI Finance Planner is for educational and informational purposes only and does not constitute financial, investment, or legal advice. Always consult with a qualified financial advisor before making investment decisions.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};