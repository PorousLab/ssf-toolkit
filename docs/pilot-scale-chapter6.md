# Pilot-Scale SSF Study (Chapter 6)

**Source:** Bai, X., Samari-Kermani, M., Schijven, J.F., Raoof, A., & Muyzer, G. (2025). Schmutzdecke Maturation and Depth-Resolved E. coli Removal in Pilot-Scale Slow Sand Filters.

---

## Study Design

### Pilot Filters
Two identical pilot-scale slow sand filters operated at Dunea's Scheveningen drinking water treatment plant for 24 months.

| Filter | Treatment | Description |
|--------|-----------|-------------|
| PF-1 | Inoculated | Received mature Schmutzdecke from full-scale filters |
| PF-2 | Control | No inoculation, natural development only |

### Specifications
- **Sand bed depth:** 80 cm
- **Sand type:** Standard SSF sand (D₅₀ ≈ 0.3 mm)
- **Flow rate:** Plant operational rate
- **Influent:** Pre-treated Rhine/Meuse water (post-rapid sand filtration)
- **Sampling depths:** P1 (~10 cm), P8 (~80 cm)

---

## Key Innovation: Depth-Resolved Analysis

Unlike previous chapters, Chapter 6 separately quantifies removal in:
1. **Upper layer (INF → P1):** Approximately 0-10 cm (Schmutzdecke zone)
2. **Deeper layer (P1 → P8):** Approximately 10-80 cm

This reveals that **the Schmutzdecke progressively dominates removal** as filters mature.

---

## Removal Performance Over Time

### Total Filter Removal (-log₁₀(C_eff/C₀))

| Month | PF-1 (Inoculated) | PF-2 (Control) |
|-------|-------------------|----------------|
| 6 | 1.10 | 1.00 |
| 12 | 1.20 | 1.10 |
| 18 | 1.35 | 1.25 |
| 24 | 1.40 | 1.37 |

### Upper Layer (0-10 cm) Contribution

| Month | PF-1 Upper | PF-2 Upper | % of Total (PF-1) |
|-------|------------|------------|-------------------|
| 6 | 0.35 | 0.20 | 32% |
| 12 | 0.85 | 0.60 | 71% |
| 18 | 1.20 | 1.00 | 89% |
| 24 | 1.30 | 1.25 | 93% |

### Key Finding
> In mature filters (18-24 months), **>90% of removal occurs in the upper 10 cm** (Schmutzdecke layer).

---

## Regression Models (Upper Layer)

### Model A: Biochemical Parameters Only
```
λ_upper = a₀ + a₁ × carbohydrate + a₂ × protein
```

| Coefficient | Value | SE | P-value |
|-------------|-------|-----|---------|
| a₀ | -2.1110 | 0.4559 | 0.0190 |
| a₁ | 4.16×10⁻³ | 1.30×10⁻³ | 0.0494 |
| a₂ | 0.0133 | 4.23×10⁻³ | 0.0518 |

**R² = 0.95**, Model P = 0.0059

### Model B: Abiotic Parameters Only
```
λ_upper = a₀ + a₁ × SD_age
```

| Coefficient | Value | SE | P-value |
|-------------|-------|-----|---------|
| a₀ | -0.3748 | 0.2607 | 0.2240 |
| a₁ | 0.0029 | 5.87×10⁻⁴ | 0.0074 |

**R² = 0.83**, Model P = 0.0074

### Model C: Full Model ⭐ BEST
```
λ_upper = a₀ + a₁ × carbohydrate + a₂ × protein + a₃ × SD_inoc
```

| Coefficient | Value | SE | P-value |
|-------------|-------|-----|---------|
| a₀ | -2.2556 | 0.1654 | 0.0053 |
| a₁ | 4.78×10⁻³ | 4.82×10⁻⁴ | 0.0100 |
| a₂ | 0.0124 | 1.52×10⁻³ | 0.0147 |
| a₃ | -0.1935 | 0.0416 | 0.0433 |

**R² = 0.99**, Model P = 0.0041

---

## Additional Regression Models (from Appendix F)

### By Carbohydrate Alone (F1)
```
λ = -2.7536 + 7.32×10⁻³ × carbohydrate
```
**R² = 0.83**, P = 0.0077

### By Protein Alone (F2)
```
λ = -0.7864 + 0.0238 × protein
```
**R² = 0.82**, P = 0.0082

### By Biomass Alone (F3)
```
λ = -0.3282 + 1.35×10⁻⁸ × biomass
```
**R² = 0.82**, P = 0.0085

### By Protein + Carbohydrate Sum (F4)
```
λ = -2.5665 + 0.0061 × (protein + carbohydrate)
```
**R² = 0.92**, P = 0.0016

---

## Schmutzdecke Development Data

### EPS Content Over Time (Upper Layer)

| Month | Protein (µg/g) | Carbohydrate (µg/g) | P+C Sum | Biomass (copies/g) |
|-------|----------------|---------------------|---------|-------------------|
| 0 | 25 ± 5 | 120 ± 20 | 145 | 5×10⁵ |
| 6 | 95 ± 15 | 245 ± 30 | 340 | 5×10⁷ |
| 12 | 135 ± 20 | 310 ± 35 | 445 | 1×10⁸ |
| 18 | 165 ± 20 | 355 ± 40 | 520 | 1.2×10⁸ |
| 24 | 185 ± 25 | 390 ± 45 | 575 | 1.5×10⁸ |

### Effect of Inoculation

| Parameter | PF-1 (Inoc) Month 6 | PF-2 (Control) Month 6 | Difference |
|-----------|---------------------|------------------------|------------|
| Protein | 110 µg/g | 80 µg/g | +38% |
| Carbohydrate | 270 µg/g | 220 µg/g | +23% |
| Upper layer removal | 0.35 log | 0.20 log | +75% |

**Conclusion:** Inoculation accelerates early development but filters converge by 18-24 months.

---

## Microbial Community Analysis

Chapter 6 includes both **DNA** and **RNA** community analysis:

- **DNA-based:** Total community (living + dead/dormant)
- **RNA-based:** Active community (metabolically active members)

### Key Findings
1. Community composition converged over time between PF-1 and PF-2
2. Active community showed seasonal fluctuations
3. Inoculation influenced early community structure but not long-term composition

---

## Kinetic Parameters (Two-Site Model)

### Upper Layer (0-10 cm)

| Month | k_att1 (d⁻¹) | k_det1 (d⁻¹) | k_att2 (d⁻¹) | k_det2 (d⁻¹) | μ_s (d⁻¹) |
|-------|--------------|--------------|--------------|--------------|-----------|
| 6 | 2.5 | 0.1 | 0.8 | 0.5 | 0.05 |
| 12 | 4.2 | 0.08 | 1.2 | 0.4 | 0.08 |
| 18 | 5.8 | 0.05 | 1.5 | 0.3 | 0.12 |
| 24 | 6.5 | 0.04 | 1.8 | 0.25 | 0.15 |

---

## Practical Implications

1. **Focus monitoring on the Schmutzdecke** (top 10 cm)
2. **EPS content (protein + carbohydrate) is the best predictor** (R² = 0.99)
3. **Inoculation provides early-stage advantage** but is not essential long-term
4. **Age alone underestimates the role of EPS development**

---

## JavaScript Implementation

```javascript
// Chapter 6 Model C - Pilot-scale upper layer
const chapter6ModelC = ({ carbohydrate, protein, inoculated }) => {
  const inoc = inoculated ? 1 : 0;
  const removal = -2.2556 
    + 4.78e-3 * carbohydrate 
    + 0.0124 * protein 
    + (-0.1935) * inoc;
  return Math.max(0, removal);
};

// Chapter 6 combined biochemical (F4)
const chapter6ModelF4 = ({ carbohydrate, protein }) => {
  const removal = -2.5665 + 0.0061 * (protein + carbohydrate);
  return Math.max(0, removal);
};

// Layer contribution estimator
const estimateLayerContribution = (totalRemoval, sdAge) => {
  // Based on observed trend: upper layer dominates as filter matures
  // At 6 months: ~30% upper, at 24 months: ~93% upper
  const upperFraction = Math.min(0.95, 0.3 + (sdAge / 365) * 0.5);
  return {
    upperLayer: totalRemoval * upperFraction,
    deeperLayer: totalRemoval * (1 - upperFraction),
    upperFraction: upperFraction
  };
};

// Presets
const pilotPresets = {
  young: {
    protein: 95,
    carbohydrate: 245,
    biomass: 5e7,
    sdAge: 180,
    inoculated: true,
    expectedRemoval: 0.35  // upper layer
  },
  mature: {
    protein: 165,
    carbohydrate: 355,
    biomass: 1.2e8,
    sdAge: 540,
    inoculated: true,
    expectedRemoval: 1.20  // upper layer
  },
  fullyMature: {
    protein: 185,
    carbohydrate: 390,
    biomass: 1.5e8,
    sdAge: 730,
    inoculated: true,
    expectedRemoval: 1.30  // upper layer
  }
};
```

---

## Parameter Ranges for Tool Sliders

| Parameter | Min | Max | Default | Unit |
|-----------|-----|-----|---------|------|
| Protein | 20 | 250 | 150 | µg/g |
| Carbohydrate | 100 | 500 | 300 | µg/g |
| P + C sum | 120 | 750 | 450 | µg/g |
| Biomass | 10⁵ | 2×10⁸ | 10⁸ | copies/g |
| SD_age | 0 | 730 | 365 | days |
| Inoculated | false/true | — | false | — |

---

## Connection to Thesis

Chapter 6 provides the **pilot-scale validation** that:
1. EPS-based models developed at mini/midi scales **translate to real DWTP operation**
2. The **Schmutzdecke becomes the dominant removal zone** as filters mature
3. **Model C (R² = 0.99) is the best predictor** for operational monitoring

This supports the thesis conclusion that **EPS composition should replace age in QMRA models**.
