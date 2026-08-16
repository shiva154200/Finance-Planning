import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { ArrowLeft, TrendingUp, AlertTriangle, Target, Briefcase, BrainCircuit, CheckCircle2, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui";
import { motion } from "framer-motion";

const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#6366f1", "#8b5cf6", "#ec4899"];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export const DashboardPage = ({ data, onReset }) => {
  const navigate = useNavigate();
  const mlResultData = data?.data?.data || data?.data || {};
  const { plans, customer } = mlResultData;
  const { analysis } = data || {};
  const planList = plans ? Object.values(plans) : [];

  if (!planList.length) {
    return (
      <div className="flex-1 bg-slate-50 flex flex-col items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center bg-white p-12 rounded-3xl shadow-xl shadow-slate-200/50 max-w-md w-full border border-slate-100">
          <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-900 mb-4">No plans generated</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">It looks like we couldn't generate a financial plan with the provided details. Please try again.</p>
          <Button onClick={() => { onReset(); navigate("/form"); }} className="w-full cursor-pointer">Go Back</Button>
        </motion.div>
      </div>
    );
  }

  const projectionData = [];
  const yearsToProject = planList[0]?.time_horizon_years || 10;
  
  for (let year = 1; year <= yearsToProject; year += Math.max(1, Math.floor(yearsToProject / 5))) {
    const dataPoint = { year: `Year ${year}` };
    planList.forEach((plan) => {
      const monthly = plan.required_monthly_investment || 0;
      const rate = (plan.expected_annual_return_percent || 0) / 100;
      let futureValue = 0;
      if (rate > 0) {
        futureValue = monthly * 12 * ((Math.pow(1 + rate, year) - 1) / rate);
      } else {
        futureValue = monthly * 12 * year;
      }
      dataPoint[plan.name || plan.type] = Math.round(futureValue);
    });
    projectionData.push(dataPoint);
  }

  return (
    <div className="flex-1 bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <motion.div 
        className="max-w-7xl mx-auto space-y-8 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Your Financial Dashboard</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-slate-500">Risk Profile:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                {customer?.risk_profile?.risk_profile || "Unknown"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button variant="outline" onClick={() => { onReset(); navigate("/form"); }} className="flex-1 sm:flex-none cursor-pointer">
              <ArrowLeft className="h-4 w-4 mr-2" /> Start Over
            </Button>
          </div>
        </motion.div>

        {analysis && (
          <motion.div variants={itemVariants}>
            <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-purple-50/80 backdrop-blur-md shadow-lg shadow-indigo-100/50 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <BrainCircuit className="w-64 h-64 text-indigo-600" />
              </div>
              <CardHeader className="relative z-10 border-b border-indigo-100/50 bg-white/40">
                <div className="flex items-center gap-3 text-indigo-700">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <BrainCircuit className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold">AI Expert Analysis</CardTitle>
                    <CardDescription className="text-indigo-600/70 font-medium">Powered by Advanced Machine Learning</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-8 pt-8 relative z-10">
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white">
                  <h4 className="text-sm font-bold tracking-wider text-indigo-900 uppercase mb-3">Executive Summary</h4>
                  <p className="text-slate-700 leading-relaxed text-lg">{analysis.executive_summary}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {analysis.plan_analysis?.map((plan, idx) => (
                    <motion.div whileHover={{ y: -4 }} key={idx} className="bg-white rounded-xl p-6 border border-indigo-100/50 shadow-sm transition-all hover:shadow-md cursor-default">
                      <h5 className="font-bold text-xl text-indigo-950 mb-4 pb-2 border-b border-slate-100">{plan.plan_name}</h5>
                      <div className="space-y-5">
                        <div>
                          <h6 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Strengths
                          </h6>
                          <ul className="space-y-2">
                            {plan.pros?.map((pro, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-slate-600 leading-relaxed">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-2 shrink-0"></span>
                                <span>{pro}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h6 className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-2 flex items-center gap-1">
                            <XCircle className="h-3 w-3" /> Considerations
                          </h6>
                          <ul className="space-y-2">
                            {plan.cons?.map((con, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-slate-600 leading-relaxed">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-2 shrink-0"></span>
                                <span>{con}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
                    <h4 className="text-sm font-bold tracking-wider text-slate-900 uppercase mb-4">Actionable Steps</h4>
                    <ul className="space-y-4">
                      {analysis.actionable_steps?.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-slate-700">
                          <div className="h-6 w-6 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{idx + 1}</div>
                          <span className="leading-relaxed text-sm">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-xl p-8 text-white shadow-xl flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full"></div>
                    <h4 className="font-bold text-lg mb-4 flex items-center gap-2 text-indigo-200 relative z-10">
                      <Target className="h-5 w-5" /> Final Recommendation
                    </h4>
                    <p className="text-slate-200 leading-relaxed text-base relative z-10">
                      {analysis.final_recommendation}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {planList.map((plan, idx) => {
            const allocationData = plan.allocation ? Object.entries(plan.allocation).map(([key, value]) => ({ name: key, value })) : [];

            return (
              <motion.div variants={itemVariants} key={idx} className="h-full">
                <Card className="h-full border-slate-200 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                  <CardHeader className="border-b border-slate-100 bg-slate-50/50 rounded-t-2xl pb-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl text-slate-900 font-extrabold">{plan.name || plan.type || `Plan ${idx + 1}`}</CardTitle>
                        <CardDescription className="mt-1.5 flex items-center gap-2">
                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Goal:</span>
                          <span className="font-medium text-slate-700">{plan.financial_goal}</span>
                        </CardDescription>
                      </div>
                      <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-full text-xs font-bold text-indigo-700 shadow-sm flex items-center gap-1">
                        {plan.time_horizon_years} Years
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 flex-1 flex flex-col gap-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-indigo-50/50 rounded-xl p-5 border border-indigo-100">
                        <div className="flex items-center gap-2 text-indigo-600 mb-3">
                          <div className="p-1.5 bg-white rounded-md shadow-sm"><TrendingUp className="h-4 w-4" /></div>
                          <span className="text-xs font-bold uppercase tracking-wider">Return</span>
                        </div>
                        <div className="text-3xl font-extrabold text-slate-900">{plan.expected_annual_return_percent}% <span className="text-sm font-semibold text-slate-500">p.a.</span></div>
                      </div>
                      <div className="bg-amber-50/50 rounded-xl p-5 border border-amber-100">
                        <div className="flex items-center gap-2 text-amber-600 mb-3">
                          <div className="p-1.5 bg-white rounded-md shadow-sm"><AlertTriangle className="h-4 w-4" /></div>
                          <span className="text-xs font-bold uppercase tracking-wider">Volatility</span>
                        </div>
                        <div className="text-3xl font-extrabold text-slate-900">{plan.expected_volatility_percent}%</div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-100 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-emerald-700 mb-2">
                          <Target className="h-5 w-5" />
                          <span className="text-sm font-bold">Required Monthly Investment</span>
                        </div>
                        <div className="text-4xl font-extrabold text-emerald-700">
                          ₹{plan.required_monthly_investment?.toLocaleString() || 0}
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 flex-1">
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-6 border-b border-slate-100 pb-2">
                        <Briefcase className="h-4 w-4 text-indigo-500" /> Asset Allocation
                      </h4>
                      {allocationData.length > 0 ? (
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={allocationData}
                                cx="50%"
                                cy="50%"
                                innerRadius={65}
                                outerRadius={85}
                                paddingAngle={5}
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                labelLine={false}
                                stroke="none"
                              >
                                {allocationData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="cursor-pointer hover:opacity-80 transition-opacity" />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => `${value}%`} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="h-40 flex items-center justify-center text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
                          No allocation data available
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {planList.length > 0 && (
          <motion.div variants={itemVariants}>
            <Card className="border-slate-200 shadow-sm mt-4">
              <CardHeader className="border-b border-slate-100 pb-6">
                <CardTitle className="text-xl font-bold">Growth Projection</CardTitle>
                <CardDescription>Estimated portfolio value over time based on monthly investments and expected returns.</CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
                <div className="h-96 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={projectionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} dy={10} />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                        tickFormatter={(value) => `₹${(value/100000).toFixed(1)}L`}
                        dx={-10}
                      />
                      <Tooltip 
                        formatter={(value) => `₹${value.toLocaleString()}`}
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend wrapperStyle={{ paddingTop: '24px', fontSize: '14px', fontWeight: 500 }} iconType="circle" />
                      {planList.map((plan, idx) => (
                        <Bar 
                          key={idx} 
                          dataKey={plan.name || plan.type} 
                          fill={COLORS[idx % COLORS.length]} 
                          radius={[6, 6, 0, 0]}
                          maxBarSize={40}
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
