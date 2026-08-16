import React from "react";
import { cn } from "../../lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("rounded-2xl border border-slate-100 bg-white text-slate-900 shadow-xl shadow-slate-200/40 transition-all duration-300", className)} {...props} />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("font-semibold leading-none tracking-tight", className)} {...props} />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
));
CardFooter.displayName = "CardFooter";

const Button = React.forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => {
  const variants = {
    default: "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 active:scale-95 active:translate-y-0 cursor-pointer",
    destructive: "bg-red-500 text-white shadow-sm hover:bg-red-600 hover:-translate-y-0.5 active:scale-95 cursor-pointer",
    outline: "border-2 border-slate-200 bg-transparent hover:border-indigo-600 hover:text-indigo-600 hover:bg-indigo-50 active:scale-95 cursor-pointer",
    secondary: "bg-indigo-100 text-indigo-900 hover:bg-indigo-200 active:scale-95 cursor-pointer",
    ghost: "hover:bg-slate-100 hover:text-slate-900 active:scale-95 cursor-pointer",
    link: "text-indigo-600 underline-offset-4 hover:underline cursor-pointer",
  };
  const sizes = {
    default: "h-11 px-6 py-2",
    sm: "h-9 rounded-md px-4",
    lg: "h-12 rounded-lg px-8 text-base",
    icon: "h-11 w-11",
  };
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
});
Button.displayName = "Button";

const Input = React.forwardRef(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      "flex h-11 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm transition-all duration-200 ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    ref={ref}
    {...props}
  />
));
Input.displayName = "Input";

const Label = React.forwardRef(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700",
      className
    )}
    {...props}
  />
));
Label.displayName = "Label";

const Select = React.forwardRef(({ className, options = [], ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "flex h-11 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm transition-all duration-200 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
      className
    )}
    {...props}
  >
    <option value="" disabled>Select an option</option>
    {options.map((opt) => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
));
Select.displayName = "Select";

const Progress = React.forwardRef(({ className, value, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("relative h-2 w-full overflow-hidden rounded-full bg-slate-100", className)}
    {...props}
  >
    <div
      className="h-full w-full flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-in-out"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </div>
));
Progress.displayName = "Progress";

const Toast = ({ isVisible, message }) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 bg-slate-900 text-white px-6 py-3.5 rounded-full shadow-2xl shadow-indigo-500/20 border border-slate-700/50"
      >
        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
        <span className="font-semibold text-sm tracking-wide">{message}</span>
      </motion.div>
    )}
  </AnimatePresence>
);

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button, Input, Label, Select, Progress, Toast };
