import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter, Button, Input, Label, Select } from "../components/ui";
import { ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, Sparkles, ShieldCheck, TrendingUp, PiggyBank, Target, UserCheck } from "lucide-react";
import { generateFinancialPlan } from "../services/api";

const SparkleIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C12 6.627 17.373 12 24 12C17.373 12 12 17.373 12 24C12 17.373 6.627 12 0 12C6.627 12 12 6.627 12 0Z" />
  </svg>
);

const STEPS = [
  { id: "personal", title: "Personal", icon: UserCheck },
  { id: "cashflow", title: "Cash Flow", icon: TrendingUp },
  { id: "assets", title: "Assets & Debt", icon: PiggyBank },
  { id: "safety", title: "Safety Net", icon: ShieldCheck },
  { id: "risk", title: "Risk Profile", icon: Sparkles },
  { id: "goals", title: "Goals", icon: Target },
];

export const FormPage = ({ onComplete }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState("");

  const [formData, setFormData] = useState({
    age: 30,
    occupation: "Software Engineer",
    dependents: 0,
    monthly_income: 120000,
    monthly_expenses: 45000,
    monthly_debt_payment: 10000,
    cash_savings: 500000,
    existing_investments: 1000000,
    property_value: 0,
    other_assets: 0,
    total_liabilities: 300000,
    emergency_fund: 250000,
    insurance_coverage: 7500000,
    credit_score: 760,
    risk_tolerance: "Moderate",
    investment_experience: "Intermediate",
    financial_goal: "Wealth Creation",
    goal_amount: 10000000,
    current_goal_savings: 1000000,
    time_horizon_years: 12,
    preferred_investment: "Equity MF",
  });

  const handleChange = (field, value) => {
    setValidationError("");
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateCurrentStep = () => {
    if (currentStep === 0) {
      if (formData.age < 18 || formData.age > 100) {
        setValidationError("Age must be between 18 and 100 years.");
        return false;
      }
      if (formData.dependents < 0) {
        setValidationError("Dependents cannot be negative.");
        return false;
      }
    } else if (currentStep === 1) {
      if (Number(formData.monthly_income) <= 0) {
        setValidationError("Monthly income must be greater than 0.");
        return false;
      }
      if (Number(formData.monthly_expenses) < 0 || Number(formData.monthly_debt_payment) < 0) {
        setValidationError("Expenses and debt payments cannot be negative.");
        return false;
      }
    } else if (currentStep === 2) {
      if (Number(formData.cash_savings) < 0 || Number(formData.existing_investments) < 0 || Number(formData.total_liabilities) < 0) {
        setValidationError("Asset and liability amounts cannot be negative.");
        return false;
      }
    } else if (currentStep === 3) {
      if (Number(formData.credit_score) < 300 || Number(formData.credit_score) > 850) {
        setValidationError("Credit score must be between 300 and 850.");
        return false;
      }
    } else if (currentStep === 5) {
      if (Number(formData.goal_amount) <= 0) {
        setValidationError("Goal amount must be greater than 0.");
        return false;
      }
      if (Number(formData.time_horizon_years) < 1 || Number(formData.time_horizon_years) > 50) {
        setValidationError("Time horizon must be between 1 and 50 years.");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;

    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    setValidationError("");
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;
    setIsSubmitting(true);
    try {
      const calculatedTotalAssets =
        Number(formData.cash_savings) +
        Number(formData.existing_investments) +
        Number(formData.property_value || 0) +
        Number(formData.other_assets || 0);

      const payload = {
        ...formData,
        age: Number(formData.age),
        dependents: Number(formData.dependents),
        monthly_income: Number(formData.monthly_income),
        monthly_expenses: Number(formData.monthly_expenses),
        monthly_debt_payment: Number(formData.monthly_debt_payment),
        cash_savings: Number(formData.cash_savings),
        existing_investments: Number(formData.existing_investments),
        property_value: Number(formData.property_value || 0),
        other_assets: Number(formData.other_assets || 0),
        total_assets: calculatedTotalAssets,
        total_liabilities: Number(formData.total_liabilities || 0),
        emergency_fund: Number(formData.emergency_fund || 0),
        insurance_coverage: Number(formData.insurance_coverage || 0),
        credit_score: Number(formData.credit_score || 750),
        goal_amount: Number(formData.goal_amount),
        current_goal_savings: Number(formData.current_goal_savings || 0),
        time_horizon_years: Number(formData.time_horizon_years),
      };

      const result = await generateFinancialPlan(payload);
      onComplete(result);
      navigate("/dashboard");
    } catch (error) {
      setValidationError("Error generating plan: " + error.message);
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return (
      <div className="flex-1 bg-slate-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-8 max-w-md mx-auto bg-white/90 backdrop-blur-xl p-12 rounded-3xl shadow-2xl shadow-indigo-500/10 border border-white relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/40 to-transparent pointer-events-none" />
          
          <div className="relative w-48 h-40 mx-auto flex items-center justify-center">
            <motion.div
              animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-gradient-to-tr from-indigo-400/30 to-purple-400/30 rounded-full blur-3xl"
            />
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600 drop-shadow-[0_0_20px_rgba(99,102,241,0.6)]"
              animate={{ scale: [0.85, 1.15, 0.85], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <SparkleIcon className="w-20 h-20" />
            </motion.div>
          </div>

          <div className="relative z-10 space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">AI Financial Planning Engine Active</h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Evaluating risk suitability, solving covariance asset allocations, and executing 10,000 Monte Carlo simulations...
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
              <Label>Age (Years)</Label>
              <Input type="number" min="18" max="100" value={formData.age} onChange={(e) => handleChange("age", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Occupation</Label>
              <Select
                value={formData.occupation}
                onChange={(e) => handleChange("occupation", e.target.value)}
                options={[
                  { label: "Software Engineer / Tech", value: "Software Engineer" },
                  { label: "Doctor / Healthcare", value: "Doctor" },
                  { label: "Business Owner / Entrepreneur", value: "Business Owner" },
                  { label: "Accountant / Finance", value: "Accountant" },
                  { label: "Government Employee", value: "Government Employee" },
                  { label: "Bank Employee", value: "Bank Employee" },
                  { label: "Teacher / Academic", value: "Teacher" },
                  { label: "Sales & Marketing", value: "Sales Executive" },
                  { label: "Freelancer / Consultant", value: "Freelancer" },
                  { label: "Designer / Creative", value: "Designer" },
                ]}
              />
            </div>
            <div className="space-y-2">
              <Label>Financial Dependents</Label>
              <Input type="number" min="0" max="10" value={formData.dependents} onChange={(e) => handleChange("dependents", e.target.value)} />
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Gross Monthly Income (₹)</Label>
              <Input type="number" min="1000" value={formData.monthly_income} onChange={(e) => handleChange("monthly_income", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Monthly Living Expenses (₹)</Label>
              <Input type="number" min="0" value={formData.monthly_expenses} onChange={(e) => handleChange("monthly_expenses", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Monthly Debt / Loan EMI (₹)</Label>
              <Input type="number" min="0" value={formData.monthly_debt_payment} onChange={(e) => handleChange("monthly_debt_payment", e.target.value)} />
            </div>
            <div className="p-3.5 bg-indigo-50/70 rounded-xl text-xs text-indigo-800 font-medium flex justify-between">
              <span>Estimated Monthly Surplus:</span>
              <span className="font-bold">₹{Math.max(0, formData.monthly_income - formData.monthly_expenses - formData.monthly_debt_payment).toLocaleString("en-IN")}</span>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Cash & Bank Savings (₹)</Label>
                <Input type="number" min="0" value={formData.cash_savings} onChange={(e) => handleChange("cash_savings", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Existing Investments (₹)</Label>
                <Input type="number" min="0" value={formData.existing_investments} onChange={(e) => handleChange("existing_investments", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Real Estate / Property Value (₹)</Label>
                <Input type="number" min="0" value={formData.property_value} onChange={(e) => handleChange("property_value", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Other Assets (₹)</Label>
                <Input type="number" min="0" value={formData.other_assets} onChange={(e) => handleChange("other_assets", e.target.value)} />
              </div>
            </div>
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <Label className="text-amber-800 font-semibold">Total Outstanding Liabilities / Loans (₹)</Label>
              <Input type="number" min="0" value={formData.total_liabilities} onChange={(e) => handleChange("total_liabilities", e.target.value)} className="border-amber-200 focus-visible:ring-amber-500" />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Dedicated Emergency Fund (₹)</Label>
              <Input type="number" min="0" value={formData.emergency_fund} onChange={(e) => handleChange("emergency_fund", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Total Insurance Coverage (Term + Health) (₹)</Label>
              <Input type="number" min="0" value={formData.insurance_coverage} onChange={(e) => handleChange("insurance_coverage", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Credit Score (CIBIL: 300 - 850)</Label>
              <Input type="number" min="300" max="850" value={formData.credit_score} onChange={(e) => handleChange("credit_score", e.target.value)} />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Self-Assessed Risk Tolerance</Label>
              <Select
                value={formData.risk_tolerance}
                onChange={(e) => handleChange("risk_tolerance", e.target.value)}
                options={[
                  { label: "Conservative (Capital preservation priority)", value: "Conservative" },
                  { label: "Moderately Conservative (Low volatility)", value: "Moderately Conservative" },
                  { label: "Moderate (Balanced growth and stability)", value: "Moderate" },
                  { label: "Moderately Aggressive (Growth oriented)", value: "Moderately Aggressive" },
                  { label: "Aggressive (Maximum compounding growth)", value: "Aggressive" },
                ]}
              />
            </div>
            <div className="space-y-2">
              <Label>Investment Experience</Label>
              <Select
                value={formData.investment_experience}
                onChange={(e) => handleChange("investment_experience", e.target.value)}
                options={[
                  { label: "Beginner (< 2 years, Fixed Deposits / Gold)", value: "Beginner" },
                  { label: "Intermediate (2-5 years, Mutual Funds / Index)", value: "Intermediate" },
                  { label: "Advanced (> 5 years, Direct Equities / Derivatives)", value: "Advanced" },
                ]}
              />
            </div>
            <div className="space-y-2">
              <Label>Preferred Asset Style</Label>
              <Select
                value={formData.preferred_investment}
                onChange={(e) => handleChange("preferred_investment", e.target.value)}
                options={[
                  { label: "Equity Mutual Funds & Index ETFs", value: "Equity MF" },
                  { label: "Hybrid Balanced Funds", value: "Hybrid MF" },
                  { label: "Debt Mutual Funds & Bonds", value: "Debt MF" },
                  { label: "Fixed Deposits & Government PPF", value: "FD" },
                  { label: "Direct Stocks & Equities", value: "Stocks" },
                  { label: "Gold & Sovereign Gold Bonds", value: "Gold" },
                ]}
              />
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Primary Financial Goal</Label>
              <Select
                value={formData.financial_goal}
                onChange={(e) => handleChange("financial_goal", e.target.value)}
                options={[
                  { label: "Wealth Creation / Long-term Compounding", value: "Wealth Creation" },
                  { label: "Retirement Corpus Planning", value: "Retirement" },
                  { label: "House / Real Estate Purchase", value: "Buy House" },
                  { label: "Child Higher Education", value: "Child Education" },
                  { label: "Emergency Reserve Building", value: "Emergency Fund" },
                  { label: "International Travel / Dream Vacation", value: "Travel" },
                ]}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Target Goal Amount (₹)</Label>
                <Input type="number" min="10000" value={formData.goal_amount} onChange={(e) => handleChange("goal_amount", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Current Savings for this Goal (₹)</Label>
                <Input type="number" min="0" value={formData.current_goal_savings} onChange={(e) => handleChange("current_goal_savings", e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Time Horizon (Years)</Label>
              <Input type="number" min="1" max="50" value={formData.time_horizon_years} onChange={(e) => handleChange("time_horizon_years", e.target.value)} />
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
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">AI Financial Suitability Questionnaire</h2>
          <p className="text-slate-500 mt-2 text-sm">Provide your financial information for machine-learning suitability analysis.</p>

          <div className="relative mt-8">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 rounded-full z-0 hidden sm:block"></div>
            <div
              className="absolute top-1/2 left-0 h-1 bg-indigo-600 -translate-y-1/2 rounded-full z-0 transition-all duration-500 hidden sm:block"
              style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
            ></div>

            <div className="flex justify-between items-center relative z-10 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0">
              {STEPS.map((step, idx) => {
                const IconComponent = step.icon;
                return (
                  <div
                    key={step.id}
                    className={`flex flex-col items-center gap-2 min-w-[70px] cursor-pointer ${idx <= currentStep ? "opacity-100" : "opacity-50"}`}
                    onClick={() => idx < currentStep && setCurrentStep(idx)}
                  >
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm transition-all duration-300 ${
                        idx < currentStep ? "bg-indigo-600 text-white" :
                        idx === currentStep ? "bg-white border-2 border-indigo-600 text-indigo-600 ring-4 ring-indigo-50" :
                        "bg-white border border-slate-200 text-slate-400"
                      }`}
                    >
                      {idx < currentStep ? <CheckCircle2 className="h-5 w-5" /> : <IconComponent className="h-4 w-4" />}
                    </div>
                    <span className={`text-xs font-semibold whitespace-nowrap ${idx <= currentStep ? "text-slate-900" : "text-slate-500"}`}>
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {validationError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <Card className="border-slate-100 shadow-xl shadow-slate-200/50">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-5">
            <CardTitle className="text-xl font-bold">{STEPS[currentStep].title}</CardTitle>
            <CardDescription className="text-sm">Step {currentStep + 1} of {STEPS.length}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 min-h-[320px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-slate-100 bg-slate-50/50 pt-5">
            <Button variant="outline" onClick={handlePrev} disabled={currentStep === 0} className="w-32">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <Button onClick={handleNext} className="w-44">
              {currentStep === STEPS.length - 1 ? "Generate AI Plan" : "Continue"} <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
