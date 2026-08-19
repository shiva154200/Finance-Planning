import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { FormPage } from "./pages/FormPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { Layout } from "./components/Layout";
import { getMe } from "./services/api";

function App() {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [planData, setPlanData] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const data = await getMe();
          setUser(data.user);
        } catch (error) {
          console.error("Auth check failed:", error);
          localStorage.removeItem("token");
        }
      }
      setIsAuthLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem("token", token);
    setUser(userData);
  };

  const handleRegister = (userData, token) => {
    localStorage.setItem("token", token);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setPlanData(null);
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-indigo-200 mb-4"></div>
          <div className="h-4 w-24 bg-indigo-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout user={user} onLogout={handleLogout} />}>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage user={user} />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/register" element={<RegisterPage onRegister={handleRegister} />} />
          
          {/* Protected Routes */}
          <Route 
            path="/form" 
            element={user ? <FormPage onComplete={setPlanData} /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <DashboardPage data={planData} onReset={() => setPlanData(null)} /> : <Navigate to="/login" replace />} 
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
