# SSF Toolkit Documentation for Claude Code

This folder contains scientific reference documentation extracted from Mandana Samari Kermani's PhD thesis and related publications. These files provide Claude Code with the context needed to accurately implement and extend the SSF interactive tools.

---

## Files Overview

| File | Content | Use When |
|------|---------|----------|
| `thesis-overview.md` | High-level thesis summary, research questions, key findings | Understanding overall project context |
| `regression-equations.md` | All regression models with coefficients | Implementing calculators, validating outputs |
| `schijven-model.md` | Two-site kinetic model (QMRA standard) | SSF Model Explorer tool |
| `tufenkji-elimelech.md` | Single-collector efficiency correlation | CFT Calculator tool |
| `extended-cft.md` | Biofilm-extended CFT (Chapter 3) | Extended CFT Calculator tool |
| `experimental-data.md` | Data tables for presets and validation | Creating realistic presets |
| `pilot-scale-chapter6.md` | Pilot-scale depth-resolved models | Layer Contribution Explorer tool |

---

## Quick Reference: Key Equations

### Most Important Models

**Mini-scale (Ch.4) - Best biochemical model:**
```
λ = -0.22 + 1.90 × (protein/carbohydrate) + 0.34 × SD_inoc
R² = 0.89
```

**Midi-scale (Ch.5) - Best when EPS is slow-changing:**
```
λ = -0.0106 + 1.36×10⁻³ × SD_age
R² = 0.71
```

**Pilot-scale (Ch.6) - Best overall model:**
```
λ = -2.2556 + 4.78×10⁻³ × carbohydrate + 0.0124 × protein - 0.1935 × SD_inoc
R² = 0.99
```

### Tufenkji-Elimelech Correlation
```
η₀ = η_D + η_I + η_G
```
See `tufenkji-elimelech.md` for full equations.

### Schijven Two-Site Model
```
λ = μ_L + k_att1/(1 + k_det1/μ_s1) + k_att2/(1 + k_det2/μ_s2)
```

---

## How to Use with Claude Code

1. **Reference before coding:**
   ```
   "Read docs/regression-equations.md to get the correct coefficients"
   ```

2. **Validate implementations:**
   ```
   "Check my removal calculation against the Chapter 6 Model C equation"
   ```

3. **Get parameter ranges:**
   ```
   "What are typical ranges for protein and carbohydrate in SSF?"
   → See experimental-data.md
   ```

4. **Create presets:**
   ```
   "Create presets for young, mature, and fully mature filters"
   → See experimental-data.md presets section
   ```

---

## Project Structure

```
ssf-toolkit/
├── CLAUDE.md              # Main project guide
├── docs/                  # ← THIS FOLDER
│   ├── thesis-overview.md
│   ├── regression-equations.md
│   ├── schijven-model.md
│   ├── tufenkji-elimelech.md
│   ├── extended-cft.md
│   ├── experimental-data.md
│   └── pilot-scale-chapter6.md
├── src/
│   └── tools/             # React components
└── ...
```

---

## Installation

1. Copy this entire `docs/` folder to your `ssf-toolkit` project root
2. Claude Code will automatically have access when working in the project

---

## Key Thesis Finding

> **EPS composition (protein/carbohydrate ratio, protein + carbohydrate sum) outperforms chronological age as a predictor of SSF removal performance**, achieving R² = 0.99 at pilot scale vs R² = 0.83 for age alone.

This should guide tool design: prioritize EPS-based inputs over age-based inputs.
