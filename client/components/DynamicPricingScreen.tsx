import React, { useState, useEffect } from "react";
import {
  Sparkles, Sliders, IndianRupee, Clock, Package, Truck,
  CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, ShieldCheck,
  RotateCcw, Layers, Scale, HeartHandshake, Eye, Pencil
} from "lucide-react";

export interface DynamicPricingProps {
  draft: any;
  updateDraft: (updates: any) => void;
  onNavigateNext?: () => void;
  onNavigateBack?: () => void;
  externalLoading?: boolean;
  externalError?: string | null;
}

export function DynamicPricingScreen({
  draft,
  updateDraft,
  onNavigateNext,
  onNavigateBack,
  externalLoading = false,
  externalError = null
}: DynamicPricingProps) {
  // Mode switcher for UI demonstration states
  const [uiStateView, setUiStateView] = useState<"normal" | "loading" | "empty" | "error">("normal");

  // Production cost states (with artisan-friendly defaults)
  const [materialCost, setMaterialCost] = useState<number>(draft.material_cost ?? 680);
  const [labourHours, setLabourHours] = useState<number>(draft.labour_hours ?? 8);
  const [hourlyRate, setHourlyRate] = useState<number>(draft.hourly_rate ?? 140);
  const [packagingCost, setPackagingCost] = useState<number>(draft.packaging_cost ?? 80);
  const [logisticsCost, setLogisticsCost] = useState<number>(draft.logistics_cost ?? 120);
  const [complexity, setComplexity] = useState<"simple" | "medium" | "intricate" | "masterpiece">(
    draft.complexity || "medium"
  );
  const [desiredMarginPercent, setDesiredMarginPercent] = useState<number>(
    draft.desired_margin_percent ?? 25
  );

  // Complexity multiplier
  const complexityMultiplier =
    complexity === "simple" ? 1.0 :
    complexity === "medium" ? 1.15 :
    complexity === "intricate" ? 1.30 : 1.50;

  // Real-time calculated costs
  const labourCostTotal = Math.round(labourHours * hourlyRate * complexityMultiplier);
  const totalProductionCost = Math.round(materialCost + labourCostTotal + packagingCost + logisticsCost);

  // Recommendation tiers
  const minimumFairPrice = Math.round(totalProductionCost * 1.15); // 15% living wage
  const recommendedWinWinPrice = Math.round(totalProductionCost * (1 + desiredMarginPercent / 100));
  const premiumPrice = Math.round(totalProductionCost * 1.55); // 55% gallery tier

  // Manual selling price state (initialized from draft or recommended)
  const [manualPrice, setManualPrice] = useState<number>(
    draft.price && draft.price > 0 ? draft.price : recommendedWinWinPrice
  );

  // Track if artisan has manually customized their price
  const [isManuallyCustomized, setIsManuallyCustomized] = useState<boolean>(
    Boolean(draft.price && draft.price !== recommendedWinWinPrice)
  );

  // When cost breakdown or margin slider changes (and artisan hasn't manually overridden), sync price
  useEffect(() => {
    if (!isManuallyCustomized) {
      setManualPrice(recommendedWinWinPrice);
    }
  }, [recommendedWinWinPrice, isManuallyCustomized]);

  // Derived earnings based on current manual price
  const currentPrice = manualPrice > 0 ? manualPrice : recommendedWinWinPrice;
  const artisanEarnings = Math.max(0, currentPrice - totalProductionCost);
  const currentMarginPercent = totalProductionCost > 0
    ? Math.round((artisanEarnings / totalProductionCost) * 100)
    : desiredMarginPercent;

  // Sync with parent draft
  const syncDraft = (priceToSave: number) => {
    updateDraft({
      price: priceToSave,
      production_cost: totalProductionCost,
      minimum_fair_price: minimumFairPrice,
      recommended_price: recommendedWinWinPrice,
      premium_price: premiumPrice,
      artisan_profit: Math.max(0, priceToSave - totalProductionCost),
      material_cost: materialCost,
      labour_hours: labourHours,
      hourly_rate: hourlyRate,
      packaging_cost: packagingCost,
      logistics_cost: logisticsCost,
      complexity: complexity,
      desired_margin_percent: desiredMarginPercent,
    });
  };

  // Handler for manual price typing
  const handlePriceChange = (newVal: number) => {
    setIsManuallyCustomized(true);
    setManualPrice(newVal);
    syncDraft(newVal);
  };

  // Quick preset button handler
  const handleSelectPreset = (presetVal: number) => {
    setIsManuallyCustomized(presetVal !== recommendedWinWinPrice);
    setManualPrice(presetVal);
    syncDraft(presetVal);
  };

  // Reset to AI recommendation
  const handleResetToRecommended = () => {
    setIsManuallyCustomized(false);
    setManualPrice(recommendedWinWinPrice);
    syncDraft(recommendedWinWinPrice);
  };

  // Reset to default benchmarks
  const handleResetBenchmarks = () => {
    setMaterialCost(680);
    setLabourHours(8);
    setHourlyRate(140);
    setPackagingCost(80);
    setLogisticsCost(120);
    setComplexity("medium");
    setDesiredMarginPercent(25);
    setIsManuallyCustomized(false);
    setUiStateView("normal");
  };

  // Margin quick presets
  const marginPresets = [
    { label: "15% Fair Wage", value: 15 },
    { label: "25% Win-Win", value: 25 },
    { label: "40% Growth", value: 40 },
    { label: "60% Masterwork", value: 60 },
  ];

  return (
    <div className="space-y-8 w-full">
      {/* TOP NAVIGATION & DEMO BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-[#E8DEC7]/60">
        {onNavigateBack ? (
          <button
            type="button"
            id="pricing-back-top-btn"
            onClick={onNavigateBack}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FFFDF8] hover:bg-[#FFF4DC] border border-[#E8DEC7] text-xs sm:text-sm font-semibold text-[#5C3B30] hover:text-[#9C0000] hover:border-[#D4AF37] transition-all shadow-xs"
          >
            <ArrowLeft size={16} className="text-[#9C0000]" />
            <span>← Back to Craft Story</span>
          </button>
        ) : (
          <div />
        )}

        {/* Discreet Demo Switcher */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFFDF8] border border-[#E8DEC7] text-xs text-[#765B4F]">
          <span className="flex items-center gap-1.5 font-medium text-[11px]">
            <Eye size={13} className="text-[#9C0000]" /> Preview State:
          </span>
          <div className="flex items-center gap-1">
            {(["normal", "loading", "empty", "error"] as const).map(state => (
              <button
                key={state}
                type="button"
                onClick={() => setUiStateView(state)}
                className={`px-2 py-0.5 rounded capitalize transition-all text-[11px] ${
                  uiStateView === state
                    ? "bg-[#9C0000] text-white font-semibold shadow-xs"
                    : "text-[#765B4F] hover:bg-[#FFF2C9]"
                }`}
              >
                {state}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 1. LOADING STATE */}
      {(uiStateView === "loading" || externalLoading) && (
        <div className="rounded-2xl border border-[#E9DAC1] bg-[#FFFBF0] p-12 text-center shadow-xs space-y-5">
          <div className="ai-spinner mx-auto">
            <Sparkles size={28} className="animate-spin text-[#9C0000]" />
          </div>
          <div>
            <h3 className="font-serif text-2xl text-[#2C1710]">
              Calculating fair dynamic price…
            </h3>
            <p className="mt-1.5 text-sm text-[#765B4F]">
              Combining craft materials, living fair wage, and market demand.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {onNavigateBack && (
              <button
                type="button"
                onClick={onNavigateBack}
                className="small-btn inline-flex items-center gap-1.5"
              >
                <ArrowLeft size={14} /> Back to Craft Story
              </button>
            )}
            <button
              type="button"
              onClick={() => setUiStateView("normal")}
              className="text-xs text-[#9C0000] underline font-medium px-2 py-1"
            >
              Back to Pricing Controls
            </button>
          </div>
        </div>
      )}

      {/* 2. ERROR STATE */}
      {(uiStateView === "error" || (externalError && uiStateView !== "loading")) && (
        <div className="rounded-2xl border border-red-200 bg-red-50/90 p-6 shadow-xs flex items-start gap-4">
          <div className="p-2.5 bg-red-100 rounded-xl text-red-600 shrink-0 mt-0.5">
            <AlertCircle size={22} />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-red-900 text-base">Offline Valuation Active</h4>
            <p className="mt-1 text-sm text-red-800">
              {externalError || "Market connection is offline. KalaSetu is using verified local craft benchmarks."}
            </p>
            <div className="mt-3.5 flex flex-wrap items-center gap-3">
              {onNavigateBack && (
                <button
                  type="button"
                  onClick={onNavigateBack}
                  className="small-btn inline-flex items-center gap-1.5"
                >
                  <ArrowLeft size={14} /> Back to Craft Story
                </button>
              )}
              <button
                type="button"
                onClick={() => setUiStateView("normal")}
                className="px-3.5 py-1.5 rounded-lg bg-white border border-red-300 text-xs font-semibold text-red-800 hover:bg-red-50"
              >
                Continue Offline
              </button>
              <button
                type="button"
                onClick={handleResetBenchmarks}
                className="text-xs text-red-700 underline font-medium"
              >
                Reset Benchmarks
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. EMPTY STATE */}
      {uiStateView === "empty" && (
        <div className="rounded-2xl border border-[#E9DAC1] bg-[#FFFBF0] p-12 text-center shadow-xs space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#FFF2C9] border border-[#D4AF37] flex items-center justify-center mx-auto text-[#9C0000]">
            <Scale size={26} />
          </div>
          <h3 className="font-serif text-2xl text-[#2C1710]">
            No Production Costs Yet
          </h3>
          <p className="text-sm text-[#765B4F] max-w-md mx-auto">
            Add your raw materials and crafting time to see a fair price calculation.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {onNavigateBack && (
              <button
                type="button"
                onClick={onNavigateBack}
                className="small-btn inline-flex items-center gap-1.5"
              >
                <ArrowLeft size={14} /> Back to Craft Story
              </button>
            )}
            <button
              type="button"
              onClick={handleResetBenchmarks}
              className="gold-btn inline-flex items-center gap-2"
            >
              <Sparkles size={16} /> Load Craft Benchmarks
            </button>
          </div>
        </div>
      )}

      {/* 4. MAIN LIVE VIEW */}
      {uiStateView === "normal" && (
        <>
          {/* SECTION 1: Product Header Summary */}
          <div className="rounded-2xl border border-[#E9DAC1] bg-white p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#FFF8DF] border border-[#D4AF37] flex items-center justify-center shrink-0">
                {draft.enhanced_image_url || draft.image_url ? (
                  <img
                    src={draft.enhanced_image_url || draft.image_url}
                    alt={draft.name || "Craft"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package size={26} className="text-[#9C0000]" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FFF2C9] text-[#9C0000] border border-[#E5D7B7]">
                    {draft.category || "Handmade Craft"}
                  </span>
                  <span className="text-[11px] text-[#8E7265]">
                    {draft.craft_tradition || draft.craft_origin || draft.state || "Indian Heritage Craft"}
                  </span>
                </div>
                <h3 className="font-serif text-xl sm:text-2xl text-[#2C1710] font-semibold mt-0.5">
                  {draft.name || "Handcrafted Traditional Piece"}
                </h3>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <CheckCircle2 size={14} className="text-emerald-600" />
              Living Wage Standard: ₹{hourlyRate}/hr
            </div>
          </div>

          {/* SECTION 2: HERO PRICING CARD WITH DIRECT MANUAL EDITING */}
          <div className="rounded-2xl bg-gradient-to-br from-[#8C0000] via-[#7B0000] to-[#550000] p-6 sm:p-8 text-[#FFF4D1] shadow-lg relative overflow-hidden space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-white/15">
              {/* Left: Selling Price Title & Editable Input */}
              <div className="flex-1 w-full">
                <div className="flex items-center gap-2 text-[#E8C754] text-xs font-bold uppercase tracking-wider mb-2">
                  <Sparkles size={16} className="text-[#E8C754]" />
                  Your Selling Price
                  <span className="text-[10px] font-normal normal-case text-white/80 bg-white/15 px-2 py-0.5 rounded-full flex items-center gap-1 ml-1">
                    <Pencil size={11} /> Artisan Editable
                  </span>
                </div>

                {/* Big Interactive Price Input */}
                <div className="flex flex-wrap items-center gap-3 mt-1">
                  <div className="relative flex items-center">
                    <span className="absolute left-4 font-serif text-3xl font-bold text-[#9C0000] pointer-events-none">
                      ₹
                    </span>
                    <input
                      type="number"
                      min={1}
                      step={10}
                      value={currentPrice}
                      onChange={e => handlePriceChange(Math.max(1, Number(e.target.value) || 0))}
                      className="h-14 w-52 sm:w-60 rounded-xl bg-white text-[#9C0000] pl-10 pr-4 font-serif text-3xl font-extrabold shadow-inner border-2 border-[#E8C754] focus:outline-none focus:ring-4 focus:ring-[#E8C754]/40"
                      aria-label="Artisan custom selling price"
                    />
                  </div>

                  {isManuallyCustomized && (
                    <button
                      type="button"
                      onClick={handleResetToRecommended}
                      className="px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-xs text-[#FFF4D1] font-medium flex items-center gap-1.5 transition-all"
                      title="Reset back to AI recommended price"
                    >
                      <RotateCcw size={13} />
                      Use Suggested (₹{recommendedWinWinPrice.toLocaleString("en-IN")})
                    </button>
                  )}
                </div>

                <p className="text-xs text-[#EBCABD]/85 mt-2">
                  {isManuallyCustomized
                    ? "Custom price active. You can edit this anytime."
                    : `Suggested based on ₹${totalProductionCost.toLocaleString("en-IN")} cost + ${desiredMarginPercent}% profit margin.`}
                </p>
              </div>

              {/* Right: Profit & Breakdown Callout */}
              <div className="grid grid-cols-2 gap-3.5 w-full md:w-auto shrink-0">
                {/* Net Profit */}
                <div className="rounded-xl bg-white/10 p-4 border border-white/15 backdrop-blur-xs min-w-[140px]">
                  <span className="text-[11px] uppercase tracking-wider text-[#E8C754] font-semibold block">
                    Your Take-Home
                  </span>
                  <div className="mt-1 font-serif text-2xl sm:text-3xl text-white font-bold">
                    +₹{artisanEarnings.toLocaleString("en-IN")}
                  </div>
                  <span className="text-[11px] text-emerald-300 font-semibold block mt-0.5">
                    {currentMarginPercent}% net profit
                  </span>
                </div>

                {/* Total Cost */}
                <div className="rounded-xl bg-black/20 p-4 border border-white/10 min-w-[140px]">
                  <span className="text-[11px] uppercase tracking-wider text-[#EBCABD]/80 font-medium block">
                    Total Cost
                  </span>
                  <div className="mt-1 font-serif text-2xl sm:text-3xl text-white/90 font-semibold">
                    ₹{totalProductionCost.toLocaleString("en-IN")}
                  </div>
                  <span className="text-[11px] text-white/60 block mt-0.5">
                    100% covered
                  </span>
                </div>
              </div>
            </div>

            {/* Quick One-Click Price Tiers */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <span className="text-xs font-semibold text-[#EBCABD]/90">
                Quick Recommendations:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectPreset(minimumFairPrice)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    currentPrice === minimumFairPrice
                      ? "bg-white text-[#9C0000] font-bold shadow-md"
                      : "bg-black/30 hover:bg-black/45 border border-white/15 text-[#FFF4D1]"
                  }`}
                >
                  Min Fair (₹{minimumFairPrice.toLocaleString("en-IN")})
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset(recommendedWinWinPrice)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    currentPrice === recommendedWinWinPrice
                      ? "bg-[#D4AF37] text-[#3D0000] ring-2 ring-white shadow-md"
                      : "bg-[#D4AF37]/90 hover:bg-[#D4AF37] text-[#3D0000]"
                  }`}
                >
                  <Sparkles size={13} />
                  Win-Win (₹{recommendedWinWinPrice.toLocaleString("en-IN")})
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset(premiumPrice)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    currentPrice === premiumPrice
                      ? "bg-white text-[#9C0000] font-bold shadow-md"
                      : "bg-black/30 hover:bg-black/45 border border-white/15 text-[#FFF4D1]"
                  }`}
                >
                  Premium Gallery (₹{premiumPrice.toLocaleString("en-IN")})
                </button>
              </div>
            </div>

            {/* Clean Segmented Bar */}
            <div className="pt-2">
              <div className="h-2.5 w-full rounded-full bg-black/30 overflow-hidden flex">
                <div
                  className="h-full bg-amber-400 transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.round((totalProductionCost / (currentPrice || 1)) * 100))}%` }}
                />
                <div
                  className="h-full bg-emerald-400 transition-all duration-300"
                  style={{ width: `${Math.max(0, 100 - Math.round((totalProductionCost / (currentPrice || 1)) * 100))}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#EBCABD]/80 mt-1.5">
                <span>Production Cost: ₹{totalProductionCost.toLocaleString("en-IN")}</span>
                <span className="text-emerald-300 font-medium">Your Take-Home: +₹{artisanEarnings.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* SECTION 3: PRODUCTION COST BREAKDOWN */}
          <div className="rounded-2xl border border-[#E9DAC1] bg-[#FFFDF8] p-6 sm:p-7 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#EEE4CB]">
              <div className="flex items-center gap-2 text-[#4A2D23] font-semibold text-base">
                <Sliders size={18} className="text-[#9C0000]" />
                Production Cost Breakdown
              </div>
              <span className="text-xs text-[#876C5C]">Adjust any item below</span>
            </div>

            {/* 4 Clean Cost Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* 1. Raw Materials */}
              <div className="p-4 rounded-xl bg-white border border-[#E6D8BC] shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#50352B] flex items-center gap-1.5">
                    <Layers size={15} className="text-[#9C0000]" />
                    Raw Materials
                  </label>
                  <span className="text-xs font-semibold text-[#8E7265]">₹{materialCost}</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-[#9C0000] font-bold text-sm">₹</span>
                  <input
                    type="number"
                    min={0}
                    step={50}
                    className="field pl-7 py-2 text-sm font-semibold"
                    value={materialCost}
                    onChange={e => setMaterialCost(Math.max(0, Number(e.target.value) || 0))}
                  />
                </div>
                <p className="text-[11px] text-[#8E7265]">Clay, fabric, natural dyes, glazes, wood</p>
              </div>

              {/* 2. Labour & Skill */}
              <div className="p-4 rounded-xl bg-white border border-[#E6D8BC] shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#50352B] flex items-center gap-1.5">
                    <Clock size={15} className="text-[#9C0000]" />
                    Labour Time & Rate
                  </label>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                    ₹{labourCostTotal}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <input
                      type="number"
                      min={0.5}
                      step={0.5}
                      className="field py-2 text-xs font-semibold"
                      value={labourHours}
                      onChange={e => setLabourHours(Math.max(0, Number(e.target.value) || 0))}
                    />
                    <span className="text-[10px] text-[#8E7265] mt-1 block">Hours spent</span>
                  </div>
                  <div>
                    <input
                      type="number"
                      min={50}
                      step={10}
                      className="field py-2 text-xs font-semibold"
                      value={hourlyRate}
                      onChange={e => setHourlyRate(Math.max(0, Number(e.target.value) || 0))}
                    />
                    <span className="text-[10px] text-[#8E7265] mt-1 block">₹/Hour rate</span>
                  </div>
                </div>
              </div>

              {/* 3. Packaging */}
              <div className="p-4 rounded-xl bg-white border border-[#E6D8BC] shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#50352B] flex items-center gap-1.5">
                    <Package size={15} className="text-[#9C0000]" />
                    Packaging
                  </label>
                  <span className="text-xs font-semibold text-[#8E7265]">₹{packagingCost}</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-[#9C0000] font-bold text-sm">₹</span>
                  <input
                    type="number"
                    min={0}
                    step={10}
                    className="field pl-7 py-2 text-sm font-semibold"
                    value={packagingCost}
                    onChange={e => setPackagingCost(Math.max(0, Number(e.target.value) || 0))}
                  />
                </div>
                <p className="text-[11px] text-[#8E7265]">Protective wrap, paper box, artisan tag</p>
              </div>

              {/* 4. Shipping */}
              <div className="p-4 rounded-xl bg-white border border-[#E6D8BC] shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#50352B] flex items-center gap-1.5">
                    <Truck size={15} className="text-[#9C0000]" />
                    Shipping & Logistics
                  </label>
                  <span className="text-xs font-semibold text-[#8E7265]">₹{logisticsCost}</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-[#9C0000] font-bold text-sm">₹</span>
                  <input
                    type="number"
                    min={0}
                    step={10}
                    className="field pl-7 py-2 text-sm font-semibold"
                    value={logisticsCost}
                    onChange={e => setLogisticsCost(Math.max(0, Number(e.target.value) || 0))}
                  />
                </div>
                <p className="text-[11px] text-[#8E7265]">Delivery buffer & transport to hub</p>
              </div>
            </div>

            {/* Craft Complexity Level */}
            <div className="pt-2">
              <label className="text-xs font-bold text-[#50352B] block mb-2">
                Craft Complexity
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(["simple", "medium", "intricate", "masterpiece"] as const).map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setComplexity(lvl)}
                    className={`py-2.5 px-3 rounded-xl border text-center transition-all ${
                      complexity === lvl
                        ? "bg-[#9C0000] text-white border-[#9C0000] font-bold shadow-xs"
                        : "bg-white text-[#50352B] border-[#DDD0B9] hover:bg-[#F9F3E8] font-medium"
                    }`}
                  >
                    <span className="text-xs capitalize block">{lvl}</span>
                    <span className="text-[10px] opacity-80 mt-0.5 block">
                      {lvl === "simple" ? "1.0×" : lvl === "medium" ? "1.15×" : lvl === "intricate" ? "1.30×" : "1.50×"} wage
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Total Cost Banner */}
            <div className="p-4.5 rounded-xl bg-white border border-[#D4AF37] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#765B4F] uppercase tracking-wider block">
                  Total Production Cost
                </span>
                <span className="text-xs text-[#8E7265]">
                  Materials + Labour + Packaging + Shipping
                </span>
              </div>
              <div className="font-serif text-2xl sm:text-3xl text-[#9C0000] font-bold">
                ₹{totalProductionCost.toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          {/* SECTION 4: ARTISAN PROFIT MARGIN CONTROL */}
          <div className="rounded-2xl border border-[#E9DAC1] bg-white p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#EEE4CB]">
              <div className="flex items-center gap-2 text-[#4A2D23] font-semibold text-base">
                <HeartHandshake size={18} className="text-[#9C0000]" />
                Desired Profit Margin
              </div>
              <span className="font-serif text-xl font-bold text-[#9C0000]">
                {desiredMarginPercent}%
              </span>
            </div>

            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={desiredMarginPercent}
              onChange={e => {
                const val = Number(e.target.value);
                setDesiredMarginPercent(val);
                if (!isManuallyCustomized) {
                  const newRec = Math.round(totalProductionCost * (1 + val / 100));
                  setManualPrice(newRec);
                  syncDraft(newRec);
                }
              }}
              className="w-full accent-[#9C0000] h-2.5 bg-[#EFE4CD] rounded-lg cursor-pointer"
            />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {marginPresets.map(p => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => {
                    setDesiredMarginPercent(p.value);
                    if (!isManuallyCustomized) {
                      const newRec = Math.round(totalProductionCost * (1 + p.value / 100));
                      setManualPrice(newRec);
                      syncDraft(newRec);
                    }
                  }}
                  className={`py-2.5 px-3 rounded-xl border text-center transition-all text-xs ${
                    desiredMarginPercent === p.value
                      ? "bg-[#FFF2C9] border-[#9C0000] text-[#9C0000] font-bold shadow-xs"
                      : "bg-[#FFFDF8] border-[#E8DEC7] text-[#6F5246] hover:bg-[#FFF9EA]"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 5: 3 CONCISE ARTISAN ASSURANCES (MINIMAL TEXT) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-3.5 rounded-xl bg-[#FFFBF0] border border-[#EBDCB7] flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-sm">
                ✓
              </div>
              <div className="text-xs text-[#50352B]">
                <b className="block text-[#2C1710]">100% Costs Recovered</b>
                Materials & delivery fully safe
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FFFBF0] border border-[#EBDCB7] flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-sm">
                ✓
              </div>
              <div className="text-xs text-[#50352B]">
                <b className="block text-[#2C1710]">Fair Living Wage</b>
                Honours your time & ancestral skill
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FFFBF0] border border-[#EBDCB7] flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-sm">
                ✓
              </div>
              <div className="text-xs text-[#50352B]">
                <b className="block text-[#2C1710]">You Decide The Price</b>
                Type any custom price you want
              </div>
            </div>
          </div>
        </>
      )}

      {/* FOOTER ACTIONS */}
      <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#E8DEC7]">
        {onNavigateBack && (
          <button
            type="button"
            id="pricing-back-footer-btn"
            onClick={onNavigateBack}
            className="small-btn w-full sm:w-auto justify-center inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold"
          >
            <ArrowLeft size={16} /> Back to Craft Story
          </button>
        )}
        <div className="flex-1" />
        <button
          type="button"
          id="pricing-accept-next-btn"
          onClick={() => {
            syncDraft(currentPrice);
            if (onNavigateNext) onNavigateNext();
          }}
          className="gold-btn w-full sm:w-auto justify-center px-6 py-3 text-sm font-bold shadow-md hover:shadow-lg transition-all"
        >
          Accept Price & Check Similarity <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
