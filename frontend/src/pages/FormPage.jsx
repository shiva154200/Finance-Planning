import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter, Button, Input, Label, Select, Progress } from "../components/ui";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { generateFinancialPlan } from "../services/api";

const SparkleIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C12 6.627 17.373 12 24 12C17.373 12 12 17.373 12 24C12 17.373 6.627 12 0 12C6.627 12 12 6.627 12 0Z" />
  </svg>
);

const STEPS = [
  { id: "personal", title: "Personal Details" },
  { id: "cashflow", title: "Income & Expenses" },
  { id: "assets", title: "Assets & Liabilities" },
  { id: "safety", title: "Safety Net" },
  { id: "risk", title: "Risk Profile" },
  { id: "goals", title: "Financial Goals" },
];

export const FormPage = ({ onComplete }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    age: 30,
    occupation: "Software Engineer",
    dependents: 0,
    monthly_income: 100000,
    monthly_expenses: 40000,
    monthly_debt_payment: 10000,
    cash_savings: 500000,
    existing_investments: 1000000,
    property_value: 0,
    other_assets: 0,
    total_liabilities: 500000,
    emergency_fund: 200000,
    insurance_coverage: 5000000,
    credit_score: 750,
    risk_tolerance: "Moderate",
    investment_experience: "Intermediate",
    financial_goal: "Retirement",
    goal_amount: 50000000,
    current_goal_savings: 1000000,
    time_horizon_years: 20,
    preferred_investment: "Mutual Funds",
  });

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        total_assets:
          Number(formData.cash_savings) +
          Number(formData.existing_investments) +
          Number(formData.property_value) +
          Number(formData.other_assets),
        risk_score: formData.risk_tolerance === "Aggressive" ? 80 : formData.risk_tolerance === "Moderate" ? 50 : 20,
        age: Number(formData.age),
        dependents: Number(formData.dependents),
        monthly_income: Number(formData.monthly_income),
        monthly_expenses: Number(formData.monthly_expenses),
        monthly_debt_payment: Number(formData.monthly_debt_payment),
        cash_savings: Number(formData.cash_savings),
        existing_investments: Number(formData.existing_investments),
        property_value: Number(formData.property_value),
        other_assets: Number(formData.other_assets),
        total_liabilities: Number(formData.total_liabilities),
        emergency_fund: Number(formData.emergency_fund),
        insurance_coverage: Number(formData.insurance_coverage),
        credit_score: Number(formData.credit_score),
        goal_amount: Number(formData.goal_amount),
        current_goal_savings: Number(formData.current_goal_savings),
        time_horizon_years: Number(formData.time_horizon_years),
      };

      const result = await generateFinancialPlan(payload);
      onComplete(result);
      navigate("/dashboard");
    } catch (error) {
      alert("Error generating plan: " + error.message);
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return (
      <div className="flex-1 bg-slate-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-8 max-w-md mx-auto bg-white/80 backdrop-blur-xl p-12 rounded-3xl shadow-2xl shadow-indigo-500/10 border border-white relative overflow-hidden"
        >
          {/* Subtle background gradient inside card */}
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/30 to-transparent pointer-events-none" />
          
          <div className="relative w-48 h-40 mx-auto flex items-center justify-center">
            {/* Background ambient glow */}
            <motion.div 
              animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-gradient-to-tr from-indigo-300/30 to-purple-300/30 rounded-full blur-3xl"
            />

            {/* Large Center Star */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-500 drop-shadow-[0_0_20px_rgba(99,102,241,0.6)]"
              animate={{ scale: [0.85, 1.15, 0.85], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <SparkleIcon className="w-20 h-20" />
            </motion.div>

            {/* Medium Star (Top Left) */}
            <motion.div
              className="absolute top-[10%] left-[15%] text-purple-400 drop-shadow-[0_0_15px_rgba(192,132,252,0.6)]"
              animate={{ scale: [0.6, 1.1, 0.6], opacity: [0.4, 0.9, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
            >
              <SparkleIcon className="w-12 h-12" />
            </motion.div>

            {/* Small Star (Bottom Left) */}
            <motion.div
              className="absolute bottom-[20%] left-[25%] text-blue-400 drop-shadow-[0_0_12px_rgba(96,165,250,0.6)]"
              animate={{ scale: [0.5, 1.2, 0.5], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
            >
              <SparkleIcon className="w-8 h-8" />
            </motion.div>

            {/* Extra Small Star (Top Right) */}
            <motion.div
              className="absolute top-[25%] right-[20%] text-indigo-400 drop-shadow-[0_0_10px_rgba(129,140,248,0.6)]"
              animate={{ scale: [0.7, 1.3, 0.7], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 1.8 }}
            >
              <SparkleIcon className="w-7 h-7" />
            </motion.div>
          </div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">AI is Analyzing Your Profile</h2>
            <p className="text-slate-500 leading-relaxed">
              We are crunching the numbers, running Monte Carlo simulations, and crafting your optimal financial roadmap.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="cursor-pointer">Age</Label>
              <Input type="number" value={formData.age} onChange={(e) => handleChange("age", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="cursor-pointer">Occupation</Label>
              <Input type="text" value={formData.occupation} onChange={(e) => handleChange("occupation", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="cursor-pointer">Dependents</Label>
              <Input type="number" value={formData.dependents} onChange={(e) => handleChange("dependents", e.target.value)} />
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="cursor-pointer">Monthly Income (₹)</Label>
              <Input type="number" value={formData.monthly_income} onChange={(e) => handleChange("monthly_income", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="cursor-pointer">Monthly Expenses (₹)</Label>
              <Input type="number" value={formData.monthly_expenses} onChange={(e) => handleChange("monthly_expenses", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="cursor-pointer">Monthly Debt Payment (₹)</Label>
              <Input type="number" value={formData.monthly_debt_payment} onChange={(e) => handleChange("monthly_debt_payment", e.target.value)} />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="cursor-pointer">Cash Savings (₹)</Label>
                <Input type="number" value={formData.cash_savings} onChange={(e) => handleChange("cash_savings", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="cursor-pointer">Existing Investments (₹)</Label>
                <Input type="number" value={formData.existing_investments} onChange={(e) => handleChange("existing_investments", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="cursor-pointer">Property Value (₹)</Label>
                <Input type="number" value={formData.property_value} onChange={(e) => handleChange("property_value", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="cursor-pointer">Other Assets (₹)</Label>
                <Input type="number" value={formData.other_assets} onChange={(e) => handleChange("other_assets", e.target.value)} />
              </div>
            </div>
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <Label className="cursor-pointer text-amber-700">Total Liabilities/Loans (₹)</Label>
              <Input type="number" value={formData.total_liabilities} onChange={(e) => handleChange("total_liabilities", e.target.value)} className="border-amber-200 focus-visible:ring-amber-500" />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="cursor-pointer">Emergency Fund (₹)</Label>
              <Input type="number" value={formData.emergency_fund} onChange={(e) => handleChange("emergency_fund", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="cursor-pointer">Total Insurance Coverage (₹)</Label>
              <Input type="number" value={formData.insurance_coverage} onChange={(e) => handleChange("insurance_coverage", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="cursor-pointer">Credit Score</Label>
              <Input type="number" value={formData.credit_score} onChange={(e) => handleChange("credit_score", e.target.value)} />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="cursor-pointer">Risk Tolerance</Label>
              <Select
                value={formData.risk_tolerance}
                onChange={(e) => handleChange("risk_tolerance", e.target.value)}
                options={[
                  { label: "Conservative", value: "Conservative" },
                  { label: "Moderately Conservative", value: "Moderately Conservative" },
                  { label: "Moderate", value: "Moderate" },
                  { label: "Moderately Aggressive", value: "Moderately Aggressive" },
                  { label: "Aggressive", value: "Aggressive" },
                ]}
              />
            </div>
            <div className="space-y-2">
              <Label className="cursor-pointer">Investment Experience</Label>
              <Select
                value={formData.investment_experience}
                onChange={(e) => handleChange("investment_experience", e.target.value)}
                options={[
                  { label: "Beginner", value: "Beginner" },
                  { label: "Intermediate", value: "Intermediate" },
                  { label: "Advanced", value: "Advanced" },
                ]}
              />
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="cursor-pointer">Primary Financial Goal</Label>
              <Input type="text" value={formData.financial_goal} onChange={(e) => handleChange("financial_goal", e.target.value)} placeholder="e.g., Retirement, House, Education" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="cursor-pointer">Goal Amount (₹)</Label>
                <Input type="number" value={formData.goal_amount} onChange={(e) => handleChange("goal_amount", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="cursor-pointer">Current Savings for Goal (₹)</Label>
                <Input type="number" value={formData.current_goal_savings} onChange={(e) => handleChange("current_goal_savings", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="cursor-pointer">Time Horizon (Years)</Label>
                <Input type="number" value={formData.time_horizon_years} onChange={(e) => handleChange("time_horizon_years", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="cursor-pointer">Preferred Investment</Label>
                <Input type="text" value={formData.preferred_investment} onChange={(e) => handleChange("preferred_investment", e.target.value)} placeholder="e.g., Mutual Funds, Stocks" />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 text-center mb-10 tracking-tight">Let's build your profile</h2>
          
          <div className="relative">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 rounded-full z-0 hidden sm:block"></div>
            <div 
              className="absolute top-1/2 left-0 h-1 bg-indigo-600 -translate-y-1/2 rounded-full z-0 transition-all duration-500 hidden sm:block"
              style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
            ></div>
            
            <div className="flex justify-between items-center relative z-10 overflow-x-auto sm:overflow-visible pb-4 sm:pb-0 hide-scrollbar">
              {STEPS.map((step, idx) => (
                <div 
                  key={step.id} 
                  className={`flex flex-col items-center gap-3 min-w-[80px] sm:min-w-0 cursor-pointer ${idx <= currentStep ? 'opacity-100' : 'opacity-50 hover:opacity-75'}`}
                  onClick={() => idx < currentStep && setCurrentStep(idx)}
                >
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm transition-all duration-300 ${
                      idx < currentStep ? "bg-indigo-600 text-white" : 
                      idx === currentStep ? "bg-white border-2 border-indigo-600 text-indigo-600 ring-4 ring-indigo-50" : 
                      "bg-white border border-slate-200 text-slate-400"
                    }`}
                  >
                    {idx < currentStep ? <CheckCircle2 className="h-5 w-5" /> : idx + 1}
                  </div>
                  <span className={`text-xs font-semibold whitespace-nowrap ${idx <= currentStep ? "text-slate-900" : "text-slate-500"}`}>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Card className="border-slate-100 shadow-xl shadow-slate-200/50">
          <CardHeader className="border-b border-slate-100/50 bg-slate-50/50 pb-6">
            <CardTitle className="text-2xl">{STEPS[currentStep].title}</CardTitle>
            <CardDescription className="text-base mt-2">Please provide accurate information for the best AI-driven results.</CardDescription>
          </CardHeader>
          <CardContent className="pt-8 min-h-[360px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20, filter: "blur(4px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-slate-100/50 bg-slate-50/50 pt-6">
            <Button variant="outline" onClick={handlePrev} disabled={currentStep === 0} className="w-32 cursor-pointer">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <Button onClick={handleNext} className="w-40 cursor-pointer">
              {currentStep === STEPS.length - 1 ? "Generate Plan" : "Next Step"} <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
