import { describe, it, expect } from "vitest";
import { calculatePricingOffline } from "./pricing-offline";

describe("calculatePricingOffline", () => {
  it("should calculate recommended price with default values when inputs are omitted", () => {
    const result = calculatePricingOffline({});
    expect(result.recommendedPrice).toBeGreaterThan(0);
    expect(result.minSuggestedPrice).toBeLessThan(result.recommendedPrice);
    expect(result.maxSuggestedPrice).toBeGreaterThan(result.recommendedPrice);
    expect(result.factors.length).toBe(3);
    expect(result.confidenceScore).toBeGreaterThanOrEqual(90);
  });

  it("should account for custom material cost and labour hours", () => {
    const result = calculatePricingOffline({
      materialCost: 1200,
      labourHours: 12,
      hourlyRate: 150,
      complexity: "intricate",
      desiredMarginPercent: 30,
    });
    expect(result.recommendedPrice).toBeGreaterThan(3000);
    expect(result.confidenceScore).toBe(95);
    expect(result.factors[0].label).toBe("Material cost");
    expect(result.factors[1].label).toBe("Your time & labour");
  });

  it("should scale with complexity multiplier", () => {
    const simple = calculatePricingOffline({
      materialCost: 500,
      labourHours: 4,
      hourlyRate: 120,
      complexity: "simple",
    });
    const masterpiece = calculatePricingOffline({
      materialCost: 500,
      labourHours: 4,
      hourlyRate: 120,
      complexity: "masterpiece",
    });
    expect(masterpiece.recommendedPrice).toBeGreaterThan(simple.recommendedPrice);
  });
});
