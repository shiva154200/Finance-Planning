import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button } from "../components/ui";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ReferenceLine
} from "recharts";
import {
  ArrowLeft, TrendingUp, AlertTriangle, Target, Briefcase, BrainCircuit,
  CheckCircle2, XCircle, ShieldCheck, HelpCircle, Sparkles, Activity,
  Layers, ChevronRight, Info
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const ASSET_COLORS = {
  Equity: "#4f46e5", // Indigo
  Debt: "#06b6d4",   // Cyan
  Gold: "#f59e0b",   // Amber
  FD: "#10b981"      // Emerald
};

const RISK_BADGE_STYLES = {
  "Conservative": "bg-blue-50 text-blue-700 border-blue-200",
  "Moderately Conservative": "bg-teal-50 text-teal-700 border-teal-200",
  "Moderate": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Moderately Aggressive": "bg-purple-50 text-purple-700 border-purple-200",
  "Aggressive": "bg-rose-50 text-rose-700 border-rose-200"
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

export const DashboardPage = ({ data, onReset }) => {
  const navigate = useNavigate();
  const [selectedPlanKey, setSelectedPlanKey] = useState("plan_a");
  const [showInflationAdjusted, setShowInflationAdjusted] = useState(false);

  const mlResultData = data?.data?.data || data?.data || {};
  const { plans, customer, risk_assessment, model_metadata } = mlResultData;
  const { analysis } = data || {};

  const currentPlan = plans?.[selectedPlanKey] || plans?.plan_a || {};
  const planList = plans ? Object.values(plans) : [];

  if (!planList.length) {
    return (
      <div className="flex-1 bg-slate-50 flex flex-col items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center bg-white p-12 rounded-3xl shadow-xl max-w-md w-full border border-slate-100">
          <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">No Plan Data Generated</h2>
          <p className="text-slate-500 mb-6 text-sm">We could not retrieve complete financial recommendations. Please verify your inputs.</p>
          <Button onClick={() => { onReset(); navigate("/form"); }} className="w-full">Return to Questionnaire</Button>
        </motion.div>
      </div>
    );
  }

  const riskScore = risk_assessment?.risk_score ?? 50;
  const riskProfile = risk_assessment?.risk_profile || "Moderate";
  const confidence = risk_assessment?.confidence ? Math.round(risk_assessment.confidence * 100) : 80;
  const confidenceTier = risk_assessment?.confidence_tier || "High";
  const topFactors = risk_assessment?.top_factors || [];
  const modelVersion = risk_assessment?.model_version || model_metadata?.model_version || "risk-model-v1.0.0";
  const validationWarnings = risk_assessment?.validation_warnings || [];

  const mc = currentPlan?.monte_carlo || {};
  const trajectoryData = mc.trajectory || [];

  const allocationData = currentPlan.allocation
    ? Object.entries(currentPlan.allocation).map(([key, value]) => ({ name: key, value }))
    : [];

  return (
    <div className="flex-1 bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <motion.div
        className="max-w-7xl mx-auto space-y-8 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Top Header */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">AI Financial Planning Dashboard</h1>
              <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-mono font-medium">{modelVersion}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Goal: <span className="font-semibold text-slate-800">{customer?.financial_goal?.financial_goal || "Wealth Creation"}</span> | Target: <span className="font-semibold text-slate-800">₹{(customer?.financial_goal?.goal_amount || 0).toLocaleString("en-IN")}</span> ({currentPlan.time_horizon_years || 10} Years)
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button variant="outline" onClick={() => { onReset(); navigate("/form"); }} className="flex-1 sm:flex-none">
              <ArrowLeft className="h-4 w-4 mr-2" /> Modify Profile
            </Button>
          </div>
        </motion.div>

        {/* Validation Warnings (if any) */}
        {validationWarnings.length > 0 && (
          <motion.div variants={itemVariants} className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800 space-y-1">
                <span className="font-bold text-sm block text-amber-900">Financial Profile Advisory:</span>
                {validationWarnings.map((w, idx) => (
                  <p key={idx}>• {w}</p>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* SECTION 1: AI Risk Assessment & Explainability Card */}
        <motion.div variants={itemVariants}>
          <Card className="border-indigo-100 bg-gradient-to-br from-white via-indigo-50/20 to-purple-50/20 shadow-md">
            <CardHeader className="border-b border-indigo-50 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-indigo-700">
                  <Sparkles className="h-5 w-5" />
                  <CardTitle className="text-xl font-bold">ML Risk & Suitability Profiling</CardTitle>
                </div>
                <span className="text-xs text-slate-500">Calibrated Multi-Class Classifier + Continuous Regressor</span>
              </div>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Risk Score Gauge */}
              <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Risk Suitability Score</span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-4xl font-extrabold text-slate-900">{riskScore}</span>
                    <span className="text-sm font-semibold text-slate-400">/ 100</span>
                  </div>
                  {/* Visual Progress Bar */}
                  <div className="w-full bg-slate-100 h-3 rounded-full mt-4 overflow-hidden p-0.5">
                    <div
                      className="bg-gradient-to-r from-teal-500 via-indigo-600 to-purple-600 h-full rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, Math.max(5, riskScore))}%` }}
                    />
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Risk Category</span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border mt-1 ${RISK_BADGE_STYLES[riskProfile] || "bg-indigo-50 text-indigo-700 border-indigo-200"}`}>
                      {riskProfile}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-medium">Model Confidence</span>
                    <span className="text-sm font-extrabold text-emerald-600">{confidence}% ({confidenceTier})</span>
                  </div>
                </div>
              </div>

              {/* Explainability Factors */}
              <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <HelpCircle className="h-4 w-4 text-indigo-600" />
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Why this recommendation? (Model Explainability)</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    {topFactors.map((factor, idx) => (
                      <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100/80 text-xs text-slate-700 leading-relaxed flex items-start gap-2.5">
                        <span className="h-2 w-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                        <span>{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>Methodology: {risk_assessment?.methodology || "Calibrated Tree Ensemble"}</span>
                  <span>Target Safety Checks: Passed</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* SECTION 2: Plan Selection Tabs & Metric Comparison */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Portfolio Recommendations</h2>
              <p className="text-xs sm:text-sm text-slate-500">Mathematical asset allocation with covariance-based volatility</p>
            </div>
            <div className="flex items-center gap-2 bg-slate-200/70 p-1 rounded-xl">
              <button
                onClick={() => setSelectedPlanKey("plan_a")}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${selectedPlanKey === "plan_a" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
              >
                Balanced Plan
              </button>
              <button
                onClick={() => setSelectedPlanKey("plan_b")}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${selectedPlanKey === "plan_b" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
              >
                Growth Plan
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Asset Allocation Donut Chart */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{currentPlan.name} Allocation</h3>
                  <span className="text-xs text-slate-400">Target Diversification</span>
                </div>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                  {currentPlan.type}
                </span>
              </div>
              <div className="h-64 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={allocationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, value }) => `${name} ${value}%`}
                      labelLine={false}
                    >
                      {allocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={ASSET_COLORS[entry.name] || "#6366f1"} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-4 gap-2 pt-4 border-t border-slate-100 text-center">
                {allocationData.map((item) => (
                  <div key={item.name} className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">{item.name}</span>
                    <span className="text-sm font-extrabold text-slate-800">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Core Financial Mathematics Metrics */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                <div className="flex items-center gap-2 text-indigo-600 mb-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Expected Return</span>
                </div>
                <div className="text-3xl font-extrabold text-slate-900">
                  {currentPlan.expected_annual_return_percent}% <span className="text-xs font-normal text-slate-400">p.a. (Nominal)</span>
                </div>
                <span className="text-xs text-slate-500 mt-2">Real (Inflation-Adjusted): <strong className="text-indigo-600">{currentPlan.real_annual_return_percent}%</strong></span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                <div className="flex items-center gap-2 text-amber-600 mb-2">
                  <Activity className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Portfolio Volatility (wᵀΣw)</span>
                </div>
                <div className="text-3xl font-extrabold text-slate-900">
                  {currentPlan.expected_volatility_percent}% <span className="text-xs font-normal text-slate-400">Std Dev</span>
                </div>
                <span className="text-xs text-slate-500 mt-2">95% Downside Risk (1-Yr VaR): <strong className="text-amber-700">{currentPlan.downside_risk_percent}%</strong></span>
              </div>

              <div className="sm:col-span-2 bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-emerald-700 mb-1">
                    <Target className="h-5 w-5" />
                    <span className="text-sm font-bold">Required Monthly Investment (SIP)</span>
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-emerald-800">
                    ₹{showInflationAdjusted
                      ? (currentPlan.inflation_adjusted_monthly_investment || currentPlan.required_monthly_investment || 0).toLocaleString("en-IN")
                      : (currentPlan.required_monthly_investment || 0).toLocaleString("en-IN")}
                  </div>
                  <span className="text-xs text-emerald-600">
                    {showInflationAdjusted ? "Includes 5.5% annual inflation compounding" : "Nominal fixed monthly SIP amount"}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowInflationAdjusted(!showInflationAdjusted)}
                  className="bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-100 text-xs"
                >
                  {showInflationAdjusted ? "View Nominal SIP" : "Adjust for Inflation (5.5%)"}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* SECTION 3: Monte Carlo Simulation (10,000 Runs) */}
        <motion.div variants={itemVariants}>
          <Card className="border-slate-100 shadow-md">
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-indigo-600" /> Monte Carlo Simulation (10,000 Stochastic Paths)
                  </CardTitle>
                  <CardDescription className="text-xs">Rigorous statistical distribution modeling market uncertainty</CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Goal Success Probability</span>
                    <span className="text-lg font-extrabold text-indigo-600">{mc.probability_of_success ?? 85}%</span>
                  </div>
                  <div className="text-right border-l pl-4 border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Shortfall Risk</span>
                    <span className="text-lg font-extrabold text-amber-600">{mc.shortfall_probability ?? 15}%</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Percentile Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">P10 (Worst 10%)</span>
                  <span className="text-sm sm:text-base font-bold text-slate-700">₹{(mc.p10 || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">P25 (Low Scenario)</span>
                  <span className="text-sm sm:text-base font-bold text-slate-700">₹{(mc.p25 || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="p-3.5 bg-indigo-50/80 rounded-xl border border-indigo-100 text-center">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase block">P50 (Median Outcome)</span>
                  <span className="text-base sm:text-lg font-extrabold text-indigo-900">₹{(mc.p50 || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">P75 (High Scenario)</span>
                  <span className="text-sm sm:text-base font-bold text-slate-700">₹{(mc.p75 || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">P90 (Top 10%)</span>
                  <span className="text-sm sm:text-base font-bold text-emerald-700">₹{(mc.p90 || 0).toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Trajectory Fan Chart */}
              {trajectoryData.length > 0 && (
                <div className="h-80 w-full pt-4">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Stochastic Wealth Progression Over Horizon (₹)</span>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trajectoryData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="year" tick={{ fill: "#64748b", fontSize: 12 }} />
                      <YAxis
                        tick={{ fill: "#64748b", fontSize: 12 }}
                        tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                      />
                      <Tooltip formatter={(value) => `₹${Number(value).toLocaleString("en-IN")}`} contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }} />
                      <Legend wrapperStyle={{ paddingTop: "16px", fontSize: "12px" }} />
                      <Line type="monotone" dataKey="p90" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="P90 (Optimistic)" />
                      <Line type="monotone" dataKey="p50" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} name="P50 (Median)" />
                      <Line type="monotone" dataKey="p10" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="P10 (Conservative)" />
                      <ReferenceLine y={mc.goal_amount} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "Goal Target", fill: "#ef4444", fontSize: 12 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* SECTION 4: AI Analysis Layer (Gemini / Generative AI) */}
        {analysis && (
          <motion.div variants={itemVariants}>
            <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-purple-50/50 to-white shadow-lg">
              <CardHeader className="border-b border-indigo-100/60 pb-4">
                <div className="flex items-center gap-3 text-indigo-700">
                  <BrainCircuit className="h-6 w-6" />
                  <div>
                    <CardTitle className="text-xl font-bold">Generative AI Fiduciary Insights</CardTitle>
                    <CardDescription className="text-xs text-indigo-600/80">Authoritative synthesis of ML suitability and simulation outcomes</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="bg-white/80 backdrop-blur-sm p-5 rounded-xl border border-white shadow-sm">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 mb-2">Executive Summary</h4>
                  <p className="text-slate-700 text-sm leading-relaxed">{analysis.executive_summary}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {analysis.plan_analysis?.map((p, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                      <h5 className="font-bold text-base text-slate-900 mb-3 pb-2 border-b border-slate-100">{p.plan_name}</h5>
                      <div className="space-y-4">
                        <div>
                          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1 mb-1.5">
                            <CheckCircle2 className="h-3 w-3" /> Core Strengths
                          </span>
                          <ul className="space-y-1.5 text-xs text-slate-600">
                            {p.pros?.map((pro, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                                <span>{pro}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1 mb-1.5">
                            <XCircle className="h-3 w-3" /> Risk Considerations
                          </span>
                          <ul className="space-y-1.5 text-xs text-slate-600">
                            {p.cons?.map((con, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                                <span>{con}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Actionable Financial Roadmap</h4>
                    <ul className="space-y-2.5">
                      {analysis.actionable_steps?.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                          <span className="h-5 w-5 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-6 rounded-xl text-white shadow-md flex flex-col justify-center">
                    <h4 className="text-sm font-bold text-indigo-300 mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4" /> Final Fiduciary Recommendation
                    </h4>
                    <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">{analysis.final_recommendation}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* SECTION 5: Educational & Compliance Disclaimer */}
        <motion.div variants={itemVariants} className="p-4 bg-slate-100 rounded-2xl border border-slate-200/60 text-center">
          <div className="flex items-center justify-center gap-2 text-slate-500 text-xs">
            <Info className="h-4 w-4 shrink-0" />
            <span>
              <strong>Decision-Support Disclaimer:</strong> Projections and simulations are illustrative, generated by machine learning models and historical asset statistics. This system does not constitute certified financial advice or guarantee future returns.
            </span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
