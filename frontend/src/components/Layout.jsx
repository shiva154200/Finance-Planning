import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";

export const Layout = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar user={user} onLogout={onLogout} />
      <div className="flex-grow flex flex-col">
        <Outlet />
      </div>
    </div>
  );
};
