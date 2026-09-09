/**
 * KalaSetu Offline Smart Pricing Engine
 * Mirrors the server-side smartPricingService so pricing
 * works 100% offline without any network call.
 */

export interface OfflinePricingInput {
  materialCost?: number;
  labourHours?: number;
  hourlyRate?: number;
  complexity?: "simple" | "medium" | "intricate" | "masterpiece";
  category?: string;
  craftTradition?: string;
  desiredMarginPercent?: number;
}

export interface OfflinePricingResult {
  recommendedPrice: number;
  minSuggestedPrice: number;
  maxSuggestedPrice: number;
  confidenceScore: number;
  factors: Array<{ label: string; amount: string; percent: string }>;
  notice: string;
  explanation: string;
}

export function calculatePricingOffline(input: OfflinePricingInput): OfflinePricingResult {
  const matCost = Math.max(200, Number(input.materialCost) || 680);
  const labourHrs = Math.max(1, Number(input.labourHours) || 8);
  const wageRate = Math.max(100, Number(input.hourlyRate) || 140);
  const labourCost = labourHrs * wageRate;

  const complexityMultipliers = {
    simple: 1.0,
    medium: 1.25,
    intricate: 1.45,
    masterpiece: 1.75,
  };
  const compMultiplier = complexityMultipliers[input.complexity || "medium"] || 1.25;

  const baseDirectCost = matCost + labourCost;
  const margin = (input.desiredMarginPercent || 25) / 100;
  const rawRecommended = Math.round((baseDirectCost * compMultiplier * (1 + margin)) / 50) * 50;

  const recommendedPrice = Math.max(500, rawRecommended);
  const minSuggestedPrice = Math.round((recommendedPrice * 0.86) / 50) * 50;
  const maxSuggestedPrice = Math.round((recommendedPrice * 1.15) / 50) * 50;

  const marketTrendVal = Math.round(recommendedPrice - baseDirectCost);
  const totalVal = matCost + labourCost + marketTrendVal;

  const matPercent = `${Math.round((matCost / totalVal) * 100)}%`;
  const labourPercent = `${Math.round((labourCost / totalVal) * 100)}%`;
  const marketPercent = `${Math.max(15, 100 - parseInt(matPercent) - parseInt(labourPercent))}%`;

  const factors = [
    { label: "Material cost", amount: `\u20B9${matCost.toLocaleString("en-IN")}`, percent: matPercent },
    { label: "Your time & labour", amount: `\u20B9${labourCost.toLocaleString("en-IN")}`, percent: labourPercent },
    { label: "Market trend & heritage markup", amount: `\u20B9${marketTrendVal.toLocaleString("en-IN")}`, percent: marketPercent },
  ];

  const confidenceScore = input.materialCost && input.labourHours ? 95 : 92;

  return {
    recommendedPrice,
    minSuggestedPrice,
    maxSuggestedPrice,
    confidenceScore,
    factors,
    notice: "Price Recommendation — KalaSetu pricing is an artisan valuation guide, not a guaranteed price.",
    explanation: `Calculated based on fair wage standard (\u20B9${wageRate}/hr across ${labourHrs}h), direct material inputs (\u20B9${matCost}), and living heritage benchmarks.`,
  };
}
