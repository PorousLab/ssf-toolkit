# Regression Equations Reference

All regression models from the thesis for predicting E. coli removal in slow sand filters.

---

## Notation

- **λ** = −log₁₀(C_eff/C₀) = log₁₀ removal
- **protein** = protein content (µg/g)
- **carbohydrate** or **carb** = carbohydrate content (µg/g)
- **P/C ratio** = protein/carbohydrate ratio
- **biomass** = 16S/18S rRNA gene copies per gram
- **SD_age** = Schmutzdecke age (days)
- **SD_inoc** = inoculation status (1 = Yes, 0 = No)
- **grain_size** = D₅₀ (mm)

---

## Chapter 4: Mini-Scale (75 days)

**Source:** Bai, Samari-Kermani et al. (2024) - Water Research 262:122059

### Model A (Biochemical only)
```
λ = a₀ + a₁ × (protein/carbohydrate)
```
| Coefficient | Value | SE | P-value |
|-------------|-------|-----|---------|
| a₀ | −0.17 | 0.13 | 0.222 |
| a₁ | 2.14 | 0.36 | 5.62×10⁻⁴ |

**R² = 0.81**, Model P = 5.62×10⁻⁴

### Model B (Abiotic only)
```
λ = a₀ + a₁ × grain_size + a₂ × SD_inoc
```
| Coefficient | Value | SE | P-value |
|-------------|-------|-----|---------|
| a₀ | 0.86 | 0.31 | 0.033 |
| a₁ | −1.44 | 0.59 | 0.050 |
| a₂ | 0.64 | 0.27 | 0.053 |

**R² = 0.55**, Model P = 0.039

### Model C (Combined) ⭐ BEST
```
λ = a₀ + a₁ × (protein/carbohydrate) + a₂ × SD_inoc
```
| Coefficient | Value | SE | P-value |
|-------------|-------|-----|---------|
| a₀ | −0.22 | 0.10 | 0.071 |
| a₁ | 1.90 | 0.29 | 0.001 |
| a₂ | 0.34 | 0.14 | 0.054 |

**R² = 0.89**, Model P = 5.97×10⁻⁴

---

## Chapter 5: Mini-Scale (4 months)

**Source:** Bai, Samari-Kermani et al. (2025) - Scale comparison study

### Model A & C (Mini)
```
λ = a₀ + a₁ × protein
```
| Coefficient | Value | SE | P-value |
|-------------|-------|-----|---------|
| a₀ | −0.21 | 0.12 | 0.1229 |
| a₁ | 5.71×10⁻³ | 2.38×10⁻³ | 0.0477 |

**R² = 0.37**, Model P = 0.0477

*Note: Model B (abiotic only) was not significant at 5% level*

---

## Chapter 5: Midi-Scale (12 months)

### Model A (Biochemical only)
```
λ = a₀ + a₁ × biomass
```
| Coefficient | Value | SE | P-value |
|-------------|-------|-----|---------|
| a₀ | 0.128 | 0.0668 | 0.075 |
| a₁ | 1.85×10⁻⁹ | 6.28×10⁻¹⁰ | 0.0113 |

**R² = 0.35**, Model P = 0.0113

### Model B (Abiotic only) ⭐ BEST FOR MIDI
```
λ = a₀ + a₁ × SD_age
```
| Coefficient | Value | SE | P-value |
|-------------|-------|-----|---------|
| a₀ | −0.0106 | 0.06 | 0.854 |
| a₁ | 1.36×10⁻³ | 2.29×10⁻⁴ | 4.8×10⁻⁵ |

**R² = 0.71**, Model P = 4.8×10⁻⁵

---

## Chapter 5: Combined Scales (Mini + Midi)

### Model A (Biochemical)
```
λ = a₀ + a₁ × biomass
```
| Coefficient | Value | SE | P-value |
|-------------|-------|-----|---------|
| a₀ | 0.0884 | — | — |
| a₁ | 2.10×10⁻⁹ | — | 3.30×10⁻⁴ |

**R² = 0.43**, Model P = 3.30×10⁻⁴

### Model B (Abiotic) ⭐ BEST COMBINED
```
λ = a₀ + a₁ × SD_age
```
| Coefficient | Value | SE | P-value |
|-------------|-------|-----|---------|
| a₀ | −0.017 | — | — |
| a₁ | 1.37×10⁻³ | — | 1.9×10⁻⁷ |

**R² = 0.70**, Model P = 1.9×10⁻⁷

---

## Chapter 6: Pilot-Scale (24 months, Top 10 cm)

**Source:** Bai, Samari-Kermani et al. (2025) - Schmutzdecke maturation study  
**Note:** These models apply to upper layer removal (INF → P1, ~10 cm)

### Model A (Biochemical only)
```
λ = a₀ + a₁ × carbohydrate + a₂ × protein
```
| Coefficient | Value | SE | P-value |
|-------------|-------|-----|---------|
| a₀ | −2.1110 | 0.4559 | 0.0190 |
| a₁ | 4.16×10⁻³ | 1.30×10⁻³ | 0.0494 |
| a₂ | 0.0133 | 4.23×10⁻³ | 0.0518 |

**R² = 0.95**, Model P = 0.0059

### Model B (Abiotic only)
```
λ = a₀ + a₁ × SD_age
```
| Coefficient | Value | SE | P-value |
|-------------|-------|-----|---------|
| a₀ | −0.3748 | 0.2607 | 0.2240 |
| a₁ | 0.0029 | 5.87×10⁻⁴ | 0.0074 |

**R² = 0.83**, Model P = 0.0074

### Model C (Full Model) ⭐⭐ BEST OVERALL
```
λ = a₀ + a₁ × carbohydrate + a₂ × protein + a₃ × SD_inoc
```
| Coefficient | Value | SE | P-value |
|-------------|-------|-----|---------|
| a₀ | −2.2556 | 0.1654 | 0.0053 |
| a₁ | 4.78×10⁻³ | 4.82×10⁻⁴ | 0.0100 |
| a₂ | 0.0124 | 1.52×10⁻³ | 0.0147 |
| a₃ | −0.1935 | 0.0416 | 0.0433 |

**R² = 0.99**, Model P = 0.0041

---

## Chapter 3: Extended CFT (Microfluidic)

**Source:** Samari-Kermani et al. (2025) - Extended CFT paper

**Note:** This chapter uses **natural log** (-ln), not log₁₀ like other chapters.

### System Property Regression (Eq. 3.31)
```
-ln(C_eff/C₀) = β₀ + β₁×θ + β₂×HC + β₃×τ + β₄×SVR
```
| Coefficient | Value | Description |
|-------------|-------|-------------|
| β₀ | 18.33 | Intercept |
| β₁ | −13.29 | Porosity effect |
| β₂ | −15.34 | Hydraulic conductivity effect |
| β₃ | −10.12 | Tortuosity effect |
| β₄ | −0.11 | Surface-to-volume ratio effect |

**R² = 0.98**

*To convert to log₁₀: divide by ln(10) ≈ 2.303*

---

## Summary Table

| Chapter | Scale | Best Model | R² | Key Predictor |
|---------|-------|------------|-----|---------------|
| 3 | Pore | System properties | 0.98 | θ, HC, τ, SVR |
| 4 | Mini (75d) | Model C | 0.89 | P/C ratio + inoc |
| 5 | Mini (4mo) | Model A | 0.37 | Protein |
| 5 | Midi (12mo) | Model B | 0.71 | SD_age |
| 5 | Combined | Model B | 0.70 | SD_age |
| 6 | Pilot (24mo) | Model C | 0.99 | Carb + Prot + Inoc |

---

## Implementation Notes

### For JavaScript/React tools:
```javascript
// Chapter 4 Model C
const ch4ModelC = (proteinCarbRatio, inoculated) => {
  const inoc = inoculated ? 1 : 0;
  return -0.22 + 1.90 * proteinCarbRatio + 0.34 * inoc;
};

// Chapter 5 Midi Model B
const ch5MidiModelB = (sdAgeDays) => {
  return -0.0106 + 1.36e-3 * sdAgeDays;
};

// Chapter 6 Model C (BEST)
const ch6ModelC = (carbohydrate, protein, inoculated) => {
  const inoc = inoculated ? 1 : 0;
  return -2.2556 + 4.78e-3 * carbohydrate + 0.0124 * protein + (-0.1935) * inoc;
};
```

### Parameter Ranges (for sliders)
| Parameter | Min | Max | Typical | Unit |
|-----------|-----|-----|---------|------|
| Protein | 20 | 500 | 100-200 | µg/g |
| Carbohydrate | 100 | 500 | 200-350 | µg/g |
| P/C ratio | 0.1 | 2.0 | 0.3-0.7 | - |
| Biomass | 10⁵ | 10⁹ | 10⁷-10⁸ | copies/g |
| SD_age | 0 | 730 | 180-365 | days |
| Grain size | 0.15 | 0.65 | 0.3-0.5 | mm |
