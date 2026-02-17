# Tufenkji-Elimelech Correlation

**Reference:** Tufenkji, N., & Elimelech, M. (2004). Correlation equation for predicting single-collector efficiency in physicochemical filtration in saturated porous media. *Environmental Science & Technology, 38*(2), 529-536.

---

## Overview

The Tufenkji-Elimelech (TE) correlation predicts the **single-collector contact efficiency (η₀)** for particle filtration in saturated porous media. It accounts for:

1. **Brownian diffusion** (η_D)
2. **Interception** (η_I)
3. **Gravitational sedimentation** (η_G)

The overall efficiency is the sum of individual contributions:
```
η₀ = η_D + η_I + η_G
```

---

## The Correlation Equations

### Diffusion (η_D)
```
η_D = 2.4 × A_s^(1/3) × N_R^(-0.081) × N_Pe^(-0.715) × N_vdW^(0.052)
```

### Interception (η_I)
```
η_I = 0.55 × A_s × N_R^(1.675) × N_A^(0.125)
```

### Gravitational Sedimentation (η_G)
```
η_G = 0.22 × N_R^(-0.24) × N_G^(1.11) × N_vdW^(0.053)
```

### Combined (Equation 17 from paper)
```
η₀ = 2.4 × A_s^(1/3) × N_R^(-0.081) × N_Pe^(-0.715) × N_vdW^(0.052)
   + 0.55 × A_s × N_R^(1.675) × N_A^(0.125)
   + 0.22 × N_R^(-0.24) × N_G^(1.11) × N_vdW^(0.053)
```

---

## Dimensionless Parameters

| Symbol | Name | Definition | Description |
|--------|------|------------|-------------|
| N_R | Aspect ratio | d_p / d_c | Particle to collector size ratio |
| N_Pe | Peclet number | U × d_c / D_∞ | Advection to diffusion ratio |
| N_vdW | van der Waals number | A / (k_B × T) | Attraction force parameter |
| N_G | Gravity number | (2/9) × (ρ_p - ρ_f) × g × d_p² / (μ × U) | Gravitational settling |
| N_A | Attraction number | A / (12 × π × μ × d_p² × U) | = N_vdW / (N_R × N_Pe) |
| A_s | Happel parameter | 2(1-γ⁵) / (2-3γ+3γ⁵-2γ⁶) | Porosity correction |

Where:
- γ = (1 - f)^(1/3)
- f = porosity

---

## Input Parameters

| Symbol | Name | Unit | Typical Range |
|--------|------|------|---------------|
| d_p | Particle diameter | m | 10⁻⁸ to 10⁻⁵ |
| d_c | Collector (grain) diameter | m | 10⁻⁴ to 10⁻³ |
| U | Approach (Darcy) velocity | m/s | 10⁻⁶ to 10⁻³ |
| f | Porosity | - | 0.3 to 0.5 |
| ρ_p | Particle density | kg/m³ | 1000 to 2000 |
| ρ_f | Fluid density | kg/m³ | 998 (water) |
| μ | Dynamic viscosity | Pa·s | 10⁻³ (water) |
| T | Temperature | K | 273 to 303 |
| A | Hamaker constant | J | 10⁻²¹ to 10⁻¹⁹ |

---

## Physical Constants

| Constant | Value | Unit |
|----------|-------|------|
| k_B (Boltzmann) | 1.38065 × 10⁻²³ | J/K |
| g (gravity) | 9.81 | m/s² |

---

## Diffusion Coefficient (D_∞)

Stokes-Einstein equation:
```
D_∞ = k_B × T / (3 × π × μ × d_p)
```

---

## JavaScript Implementation

```javascript
// Constants
const kB = 1.38065e-23; // Boltzmann constant (J/K)
const g = 9.81;         // Gravity (m/s²)

// Calculate Happel parameter A_s
const calculateAs = (porosity) => {
  const gamma = Math.pow(1 - porosity, 1/3);
  const gamma5 = Math.pow(gamma, 5);
  const gamma6 = Math.pow(gamma, 6);
  return 2 * (1 - gamma5) / (2 - 3*gamma + 3*gamma5 - 2*gamma6);
};

// Calculate diffusion coefficient
const calculateDiffusivity = (T, mu, dp) => {
  return (kB * T) / (3 * Math.PI * mu * dp);
};

// Calculate dimensionless numbers
const calculateDimensionless = (params) => {
  const { dp, dc, U, porosity, rhoP, rhoF, mu, T, A } = params;
  
  const D_inf = calculateDiffusivity(T, mu, dp);
  const As = calculateAs(porosity);
  
  return {
    NR: dp / dc,
    NPe: (U * dc) / D_inf,
    NvdW: A / (kB * T),
    NG: (2/9) * ((rhoP - rhoF) * g * dp * dp) / (mu * U),
    NA: A / (12 * Math.PI * mu * dp * dp * U),
    As: As
  };
};

// Tufenkji-Elimelech correlation
const tufenkjiElimelech = (params) => {
  const dim = calculateDimensionless(params);
  const { NR, NPe, NvdW, NG, NA, As } = dim;
  
  // Diffusion
  const etaD = 2.4 * Math.pow(As, 1/3) * Math.pow(NR, -0.081) 
             * Math.pow(NPe, -0.715) * Math.pow(NvdW, 0.052);
  
  // Interception
  const etaI = 0.55 * As * Math.pow(NR, 1.675) * Math.pow(NA, 0.125);
  
  // Gravity
  const etaG = 0.22 * Math.pow(NR, -0.24) * Math.pow(NG, 1.11) 
             * Math.pow(NvdW, 0.053);
  
  return {
    etaD,
    etaI,
    etaG,
    eta0: etaD + etaI + etaG,
    dimensionless: dim
  };
};

// Example usage for E. coli (1 µm)
const params = {
  dp: 1e-6,           // 1 µm particle
  dc: 0.5e-3,         // 0.5 mm collector
  U: 1.4e-4,          // 0.5 m/h = 1.4e-4 m/s
  porosity: 0.4,
  rhoP: 1050,         // Bacteria density kg/m³
  rhoF: 998,          // Water density kg/m³
  mu: 1e-3,           // Water viscosity Pa·s
  T: 293,             // 20°C
  A: 1e-20            // Hamaker constant J
};

const result = tufenkjiElimelech(params);
console.log(`η₀ = ${result.eta0.toExponential(3)}`);
```

---

## Typical Results

### For bacteria (~1 µm) in sand filters:
| Condition | η_D | η_I | η_G | η₀ |
|-----------|-----|-----|-----|-----|
| Fine sand (0.2 mm), slow flow | 0.02 | 0.001 | 0.0005 | ~0.02 |
| Coarse sand (0.5 mm), slow flow | 0.008 | 0.0002 | 0.0002 | ~0.008 |
| Coarse sand, fast flow | 0.003 | 0.0001 | 0.0001 | ~0.003 |

### For viruses (~50 nm):
| Condition | η_D | η_I | η_G | η₀ |
|-----------|-----|-----|-----|-----|
| Fine sand, slow flow | 0.15 | ~0 | ~0 | ~0.15 |
| Coarse sand, slow flow | 0.06 | ~0 | ~0 | ~0.06 |

---

## Connection to Filter Removal

The attachment rate coefficient relates to η₀ via:
```
k_att = (3/2) × (1-f)/d_c × U × α × η₀
```

Where α is the **sticking efficiency** (attachment probability per collision).

Log removal over length L:
```
-log₁₀(C/C₀) = (3/2) × (1-f)/d_c × (L/ln(10)) × α × η₀
```

---

## Validity Range

The TE correlation is valid for:
- 0.01 ≤ N_R ≤ 0.1
- 10² ≤ N_Pe ≤ 10⁷
- 10⁻¹⁰ ≤ N_vdW ≤ 10⁻⁷
- Porosity 0.3 ≤ f ≤ 0.5

For particles outside this range (e.g., large protozoa), accuracy may decrease.

---

## Comparison with Yao-RT Equation

The older Rajagopalan-Tien (RT) equation:
```
η₀ = 4 × A_s^(1/3) × N_Pe^(-2/3) + A_s × N_R^(15/8) + 0.00338 × A_s × N_G^(1.2) × N_R^(-0.4)
```

**Key differences:**
1. TE includes van der Waals forces (N_vdW)
2. TE includes hydrodynamic interactions
3. TE is more accurate for Brownian-dominated deposition
4. TE better predicts the "minimum efficiency" region (~2 µm particles)

---

## References

- Tufenkji, N., & Elimelech, M. (2004). ES&T, 38(2), 529-536.
- Yao, K.M., Habibian, M.T., & O'Melia, C.R. (1971). ES&T, 5, 1105-1112.
- Rajagopalan, R., & Tien, C. (1976). AIChE J., 22, 523-533.
