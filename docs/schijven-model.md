# Schijven et al. (2013) SSF Model

**Reference:** Schijven, J.F., van den Berg, H.H.J.L., Colin, M., Dullemont, Y., Hijnen, W.A.M., Magic-Knezev, A., Oorthuizen, W.A., & Wubbels, G. (2013). A mathematical model for removal of human pathogenic viruses and bacteria by slow sand filtration under variable operational conditions. *Water Research, 47*(7), 2592-2602.

---

## Model Purpose

The Schijven model predicts steady-state removal of microorganisms in slow sand filters as a function of:
- Filter operational parameters (velocity, bed depth)
- Attachment/detachment kinetics
- Inactivation rates (liquid and solid phase)
- Biofilm age/maturity

This model is used in **Dutch QMRA practice** for drinking water safety assessment.

---

## Core Equations

### 1. Advection-Dispersion Equation with Two-Site Kinetics

```
∂C/∂t + (ρ_b/θ)∂S₁/∂t + (ρ_b/θ)∂S₂/∂t = α_L·v·∂²C/∂x² - v·∂C/∂x - μ_L·C
```

```
(ρ_b/θ)·∂Sᵢ/∂t = k_att,i·C - k_det,i·(ρ_b/θ)·Sᵢ - μ_s,i·(ρ_b/θ)·Sᵢ    (i = 1, 2)
```

### 2. Overall Removal Rate Coefficient (λ)

```
λ = μ_L + k_att,1/(1 + k_det,1/μ_s,1) + k_att,2/(1 + k_det,2/μ_s,2)
```

For most SSF conditions, when μ_L ≈ 0:
```
λ ≈ k_att,1/(1 + k_det,1/μ_s,1) + k_att,2/(1 + k_det,2/μ_s,2)
```

### 3. Steady-State Concentration Profile

```
ln(C/C₀) = [(1 - √(1 + 4α_L·λ/v)) / (2α_L)] × x
```

Or simplified when dispersivity is small (α_L → 0):
```
C/C₀ = exp(-λ·x/v)
```

### 4. Log₁₀ Removal

```
-log₁₀(C_eff/C₀) = λ·L / (v·ln(10))
```

Where L is the filter bed length.

---

## Parameter Definitions

| Symbol | Name | Unit | Description |
|--------|------|------|-------------|
| C | Concentration | CFU/mL | Microorganism concentration in liquid |
| C₀ | Influent concentration | CFU/mL | Initial concentration |
| Sᵢ | Attached concentration | CFU/g | Attached to site i |
| v | Pore water velocity | m/d | = U_Darcy/θ |
| α_L | Longitudinal dispersivity | m | Spreading coefficient |
| θ | Porosity | - | Void fraction |
| ρ_b | Bulk density | kg/m³ | Dry bulk density of sand |
| x | Distance | m | Travel distance in filter |
| L | Bed length | m | Total filter depth |

### Kinetic Parameters

| Symbol | Name | Unit | Typical Range |
|--------|------|------|---------------|
| k_att,1 | Attachment rate (site 1) | d⁻¹ | 0.1 - 50 |
| k_det,1 | Detachment rate (site 1) | d⁻¹ | 0.001 - 1 |
| k_att,2 | Attachment rate (site 2) | d⁻¹ | 0.01 - 10 |
| k_det,2 | Detachment rate (site 2) | d⁻¹ | 0.1 - 10 |
| μ_s,1 | Solid inactivation (site 1) | d⁻¹ | 0 - 5 |
| μ_s,2 | Solid inactivation (site 2) | d⁻¹ | 0 - 5 |
| μ_L | Liquid inactivation | d⁻¹ | 0 - 1 |
| λ | Overall removal coefficient | m⁻¹ | 0.1 - 10 |

---

## Two-Site Conceptualization

### Site 1 (Favorable)
- **Characteristics:** Strong, quasi-irreversible attachment
- **Mechanism:** Favorable surface sites, biofilm patches
- **Behavior:** k_att,1 >> k_det,1; dominates early removal
- **Location:** Often associated with Schmutzdecke

### Site 2 (Less Favorable)
- **Characteristics:** Weaker, reversible attachment
- **Mechanism:** Secondary energy minimum, EPS surfaces
- **Behavior:** k_det,2 may exceed k_att,2; governs tailing
- **Location:** Distributed throughout sand bed

---

## Temperature Dependence

The model includes temperature corrections:
```
k_att(T) = k_att(T_ref) × exp[E_a/R × (1/T_ref - 1/T)]
μ_s(T) = μ_s(T_ref) × exp[E_a/R × (1/T_ref - 1/T)]
```

Where:
- E_a = activation energy (J/mol)
- R = gas constant (8.314 J/mol·K)
- T_ref = reference temperature (typically 283 K = 10°C)

---

## Age Dependence (Original Model)

The original Schijven model used **chronological age** as a proxy for biofilm maturity:
```
k_att(age) = k_att,max × (1 - exp(-age/τ_ripen))
```

**This is what the thesis extends:** Rather than using age alone, the thesis demonstrates that EPS composition (protein, carbohydrate) provides more mechanistic and predictive power.

---

## Typical SSF Operating Conditions

| Parameter | Typical Value | Range |
|-----------|---------------|-------|
| Flow rate (v) | 0.1-0.3 m/h | 0.05-0.5 m/h |
| Bed depth (L) | 0.8-1.2 m | 0.5-2.0 m |
| Sand size (d₅₀) | 0.15-0.35 mm | 0.1-0.5 mm |
| Porosity (θ) | 0.35-0.45 | 0.3-0.5 |
| Temperature | 5-20°C | 2-25°C |
| Ripening time | 2-8 weeks | 1-16 weeks |

---

## Model Limitations

1. **Age as proxy:** Using chronological age assumes consistent maturation rates
2. **Uniform biofilm:** Assumes biofilm is uniformly distributed
3. **Steady-state:** Assumes quasi-steady-state conditions
4. **No depth resolution:** Does not explicitly model Schmutzdecke vs deeper layers

---

## Connection to Thesis Findings

The thesis extends the Schijven framework by:

1. **Replacing age** with EPS-based indicators (protein, carbohydrate, P/C ratio)
2. **Adding depth resolution:** Top 10 cm vs deeper sand layer
3. **Incorporating biofilm morphology:** Via Extended CFT (Chapter 3)
4. **Scale validation:** Mini → Midi → Pilot consistency

### Suggested Model Refinement

Instead of:
```
λ = f(age, temperature)
```

Use:
```
λ = f(protein, carbohydrate, inoculation_status)
```

With the Chapter 6 Model C providing R² = 0.99 compared to age-only R² = 0.83.

---

## JavaScript Implementation

```javascript
// Schijven two-site model
const calculateLambda = (params) => {
  const { kAtt1, kDet1, muS1, kAtt2, kDet2, muS2, muL } = params;
  
  const site1 = kAtt1 / (1 + kDet1 / muS1);
  const site2 = kAtt2 / (1 + kDet2 / muS2);
  
  return muL + site1 + site2;
};

// Steady-state removal
const steadyStateRemoval = (lambda, velocity, dispersivity, distance) => {
  const term = Math.sqrt(1 + 4 * dispersivity * lambda / velocity);
  const exponent = (1 - term) / (2 * dispersivity) * distance;
  return Math.exp(exponent);
};

// Log removal
const logRemoval = (Ceff, C0) => -Math.log10(Ceff / C0);
```

---

## References

- Schijven, J.F., & Hassanizadeh, S.M. (2000). Removal of viruses by soil passage: Overview of modeling, processes, and parameters. *Critical Reviews in Environmental Science and Technology*, 30(1), 49-127.
- Schijven, J.F., et al. (2013). Water Research, 47(7), 2592-2602.
- Schijven, J.F., et al. (2014). QMRAspot: A tool for Quantitative Microbial Risk Assessment. *Water Research*, 60, 69-79.
