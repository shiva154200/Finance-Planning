import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Toast } from "./ui";
import { TrendingUp, LogOut } from "lucide-react";

export const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [showLogoutSuccess, setShowLogoutSuccess] = useState(false);

  const handleLogout = () => {
    setShowLogoutSuccess(true);
    setTimeout(() => {
      onLogout();
      navigate("/login");
      setShowLogoutSuccess(false);
    }, 1500);
  };

  return (
    <nav className="relative z-50 border-b border-slate-200/50 bg-white/80 backdrop-blur-md sticky top-0">
      <Toast isVisible={showLogoutSuccess} message="Logged out successfully!" />
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Clickable Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 cursor-pointer group outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg p-1 transition-all"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-sm group-hover:scale-110 transition-transform duration-300">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>

          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 group-hover:from-indigo-700 group-hover:to-purple-700 transition-all duration-300">
            AI Finance Planner
          </span>
        </Link>

        {/* Auth / User Actions */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm font-medium text-slate-600 hidden sm:block">
                Welcome,{" "}
                <span className="text-indigo-600">
                  {user.name}
                </span>
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="cursor-pointer flex items-center gap-2 text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
              >
                <LogOut className="h-4 w-4 hidden sm:block" />
                Logout
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="cursor-pointer hidden sm:flex"
                >
                  Sign In
                </Button>
              </Link>

              <Link to="/register">
                <Button size="sm" className="cursor-pointer">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
};