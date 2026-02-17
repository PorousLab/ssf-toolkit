# Extended Colloid Filtration Theory (Chapter 3)

**Source:** Samari-Kermani, M., Schijven, J.F., de Vries, E.T., & Raoof, A. (2025). From Roughness to Occlusion: Image-Informed Extended Colloid Filtration Theory for Biofilm-Laden Porous Media.

---

## Overview

Chapter 3 extends Classical Colloid Filtration Theory (CFT) to account for biofilm effects in porous media. The extension adds **three biofilm-specific efficiency terms** (η₁, η₂, η₃) that capture the mechanistic progression from initial biofilm colonization to mature pore occlusion.

---

## Core Concept

### Classical CFT (Clean Bed)
```
η_base = η_D + η_I + η_G
```

### Extended CFT (Biofilm-Laden)
```
η_total = η_base + η_extra = η_D + η_I + η_G,mod + η₁ + η₂ + η₃
```

Where:
- **η_D**: Brownian diffusion (Tufenkji-Elimelech)
- **η_I**: Interception (Tufenkji-Elimelech)
- **η_G,mod**: Gravitational settling (modified for orthogonal flow)
- **η₁**: Early-stage roughness and crevice effects
- **η₂**: Mid-stage network retention
- **η₃**: Late-stage occlusion and straining

---

## Biofilm Efficiency Terms

### η₁: Roughness-Based (Early Stage)

Captures retention driven by macroscale surface complexity:
```
η₁ = c₁ × ((f_shape + f_concave) / f₀)^n
```

| Parameter | Definition |
|-----------|------------|
| f_shape | Inverse of grain circularity = 1 / (4π × area / perimeter²) |
| f_concave | 1 - solidity (surface indentations) |
| f₀ | Reference = 1 (smooth sphere) |
| c₁, n | Empirical fitting parameters |

**Physical meaning:** Rougher, more angular grains and early biofilm create crevices that trap particles.

---

### η₂: Network-Mediated (Mid Stage)

Captures retention in filamentous, network-structured biofilms:
```
η₂ = c₂ × ((SVR) × (d_p / R_C))^m
```

| Parameter | Definition | Unit |
|-----------|------------|------|
| SVR | Surface area-to-volume ratio of biofilm | µm⁻¹ |
| d_p | Particle diameter | µm |
| R_C | Topographic roughness coefficient | - |
| c₂, m | Empirical fitting parameters | - |

**Physical meaning:** Increased biofilm surface area and porous matrix structure enhances intra-biofilm capture.

---

### η₃: Flow Exclusion (Late Stage)

Captures straining and occlusion in dense, mature biofilms:
```
η₃ = c₃ × ((1 - √(HC_bio/HC₀)) × d_p / (d_p + d_th,eff))^p
```

With effective throat diameter:
```
d_th,grain = d_th,0² / (d_th,0 + (d_g - d_g,0))
d_th,θ = d_th,0 × [(θ/(1-θ)) / (θ₀/(1-θ₀))]
d_th,eff = min(d_th,grain, d_th,θ)
```

| Parameter | Definition | Unit |
|-----------|------------|------|
| HC_bio | Hydraulic conductivity with biofilm | m/s |
| HC₀ | Clean-bed hydraulic conductivity | m/s |
| d_th,0 | Clean-bed throat diameter | µm |
| d_g, d_g,0 | Grain diameter (biofilm/clean) | µm |
| θ, θ₀ | Porosity (biofilm/clean) | - |
| c₃, p | Empirical fitting parameters | - |

**Physical meaning:** As biofilm blocks pores, throats narrow and particles strain.

---

## Stage Weights (Bernstein-Softmax)

The model shifts emphasis between η₁, η₂, η₃ based on porosity:

```
t = clamp[0,1][(θ_max - θ) / (θ_max - θ_min)]

b₁ = (1-t)²        (early stage)
b₂ = 2t(1-t)       (mid stage)
b₃ = t²            (late stage)

c_i(θ) = exp(λ × b_i) / Σ exp(λ × b_j)    for i = 1, 2, 3
```

Where λ controls sharpness of transitions between stages.

---

## Calibrated Parameters

From microfluidic experiments (8 data points):

| Parameter | Value | Description |
|-----------|-------|-------------|
| λ | 10 | Stage transition sharpness |
| n | 0.948 | Roughness exponent |
| m | -0.416 | Network exponent |
| p | 0.235 | Occlusion exponent |
| γ | 0.401 | Global scale factor |
| k_shrink | 0.45 | Capacity limiter |
| θ_min | 0 | Minimum porosity |
| θ_max | 0.34 | Maximum porosity (clean) |
| GM(T₁) | 1.689 | Geometric mean of driver T₁ |
| GM(T₂) | 0.0014 | Geometric mean of driver T₂ |
| GM(T₃) | 0.00031 | Geometric mean of driver T₃ |

---

## Modified Attachment Rate

The complete expression for attachment rate:
```
K_CFT^mod = γ × (K_I + K_D + K_G,mod + K₁ + K₂ + K₃)
```

Where:
```
K_I + K_D = α × (η_I + η_D) × (U/θ) × A_vx
K_G = α × η_G,mod × v_s × A_G
K_j = α × η_j × (U/θ) × A_vx     for j = 1, 2, 3
```

---

## Projected Surface Areas

### Flow-Aligned (A_vx)
```
A_vx = [4(1-θ) / (π × d_g)] × (θ/θ₀) × τ
```

### Gravity-Directed (A_G)
```
A_G = θ / (h × τ)
```

Where:
- τ = tortuosity (increases with biofilm)
- h = channel height (microfluidic)

---

## Modified Gravitational Term

For orthogonal flow-gravity configuration (as in microfluidics):
```
η_G,mod = U_s × L × θ / (U_Darcy × (h - 2r_p))
```

Where U_s is Stokes settling velocity.

---

## System Property Regression (Alternative)

A simpler regression using bulk system properties (Equation 3.31):
```
-ln(C_eff/C₀) = 18.33 - 13.29θ - 15.34HC - 10.12τ - 0.11SVR
```

**R² = 0.98**

**Note:** This equation uses **natural log** (-ln), not log₁₀. To convert: -log₁₀(C/C₀) = -ln(C/C₀) / ln(10) ≈ -ln(C/C₀) / 2.303

| Variable | Coefficient | Description |
|----------|-------------|-------------|
| Intercept | 18.33 | Baseline |
| θ | -13.29 | Porosity (negative: more pores = less removal) |
| HC | -15.34 | Hydraulic conductivity (negative: faster flow = less removal) |
| τ | -10.12 | Tortuosity (negative: longer paths but more bypass) |
| SVR | -0.11 | Surface-to-volume ratio (complex trade-off) |

---

## JavaScript Implementation

```javascript
// Extended CFT Calculator
const extendedCFT = (params) => {
  const {
    theta, theta0, HC, HC0, dg, dg0, dth0, dp,
    fShape, fConcave, SVR, RC, tau,
    U, alpha,
    // Calibrated constants
    lambda = 10, n = 0.948, m = -0.416, p = 0.235,
    gamma = 0.401, kShrink = 0.45,
    thetaMin = 0, thetaMax = 0.34,
    GMT1 = 1.689, GMT2 = 0.0014, GMT3 = 0.00031
  } = params;
  
  // Stage parameter
  const t = Math.max(0, Math.min(1, (thetaMax - theta) / (thetaMax - thetaMin)));
  
  // Bernstein basis
  const b1 = Math.pow(1 - t, 2);
  const b2 = 2 * t * (1 - t);
  const b3 = Math.pow(t, 2);
  
  // Softmax weights
  const expB1 = Math.exp(lambda * b1);
  const expB2 = Math.exp(lambda * b2);
  const expB3 = Math.exp(lambda * b3);
  const sumExp = expB1 + expB2 + expB3;
  const c1 = expB1 / sumExp;
  const c2 = expB2 / sumExp;
  const c3 = expB3 / sumExp;
  
  // Drivers (normalized)
  const T1 = (fShape + fConcave) / 1.0;  // f0 = 1
  const T2 = SVR * dp / RC;
  const T3 = (1 - Math.sqrt(HC / HC0)) * dp / (dp + calculateDthEff(params));
  
  // Normalized drivers
  const T1norm = T1 / GMT1;
  const T2norm = T2 / GMT2;
  const T3norm = T3 / GMT3;
  
  // Raw biofilm efficiencies
  const eta1raw = c1 * Math.pow(T1norm, n);
  const eta2raw = c2 * Math.pow(T2norm, m);
  const eta3raw = c3 * Math.pow(T3norm, p);
  
  // Bounded (monotone clip)
  const B1 = 1 - Math.exp(-eta1raw);
  const B2 = 1 - Math.exp(-eta2raw);
  const B3 = 1 - Math.exp(-eta3raw);
  
  // Get base efficiency from Tufenkji-Elimelech
  const etaBase = calculateTEBase(params);  // η_D + η_I + η_G,mod
  
  // Capacity scaling
  const cap = 1 - etaBase;
  const s = cap / (B1 + B2 + B3 + kShrink * cap);
  
  const eta1 = B1 * s;
  const eta2 = B2 * s;
  const eta3 = B3 * s;
  
  const etaTotal = etaBase + eta1 + eta2 + eta3;
  
  // Attachment rate
  const Avx = 4 * (1 - theta) / (Math.PI * dg) * (theta / theta0) * tau;
  const Katt = gamma * alpha * etaTotal * (U / theta) * Avx;
  
  return {
    eta1, eta2, eta3,
    etaBase, etaTotal,
    weights: { c1, c2, c3 },
    Katt
  };
};

// Effective throat diameter
const calculateDthEff = ({ dth0, dg, dg0, theta, theta0 }) => {
  const dthGrain = dth0 * dth0 / (dth0 + (dg - dg0));
  const dthTheta = dth0 * ((theta / (1 - theta)) / (theta0 / (1 - theta0)));
  return Math.min(dthGrain, dthTheta);
};
```

---

## Key Findings

1. **Dynamic properties (θ, HC) are stronger predictors than biofilm age**
2. **Tortuosity extends travel paths but promotes preferential flow**
3. **SVR reflects trade-off between available area and accessible surface**
4. **The three-stage model captures mechanistic progression**:
   - Early: Roughness enhances contact
   - Mid: Network structure traps particles
   - Late: Occlusion causes straining

---

## Connection to Thesis

This framework provides the **pore-scale mechanistic foundation** that is then linked to:
- **Chapter 4-5:** EPS composition as measurable biofilm indicator
- **Chapter 6:** Pilot-scale validation of biofilm-dependent removal

The key insight: Rather than using age as a proxy, measure θ, HC, and EPS to predict removal mechanistically.
