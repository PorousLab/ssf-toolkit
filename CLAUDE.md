# CLAUDE.md — SSF Toolkit Project Guide

## Project Overview

**Repository:** `PorousLab/ssf-toolkit`  
**Live URL:** https://porouslab.github.io/ssf-toolkit/  
**Purpose:** Interactive web tools for slow sand filtration (SSF) research, supporting the PhD thesis "From Pores to Pilot Filters: Biofilm-Driven Bacterial Removal in Slow Sand Filtration"

---

## Tech Stack

- **Framework:** React 18
- **Build Tool:** Vite 5
- **Styling:** Tailwind CSS 3
- **Charts:** Recharts
- **Deployment:** GitHub Pages via GitHub Actions

---

## File Structure

```
ssf-toolkit/
├── .github/workflows/deploy.yml   # Auto-deploy on push to main
├── public/
│   └── favicon.svg
├── src/
│   ├── App.jsx                    # Main dashboard with navigation
│   ├── main.jsx                   # Entry point
│   ├── index.css                  # Tailwind imports
│   └── tools/                     # Individual tool components
│       ├── SSFModelExplorer.jsx         # Schijven et al. (2013) model
│       ├── ExtendedCFTCalculator.jsx    # Chapter 3 - biofilm CFT
│       ├── EPSRemovalPredictor.jsx      # Chapters 4-6 - EPS regression
│       ├── ScaleDependentPredictor.jsx  # Chapter 5 - mini/midi comparison
│       └── LayerContributionExplorer.jsx # Chapter 6 - depth-resolved
├── index.html
├── package.json
├── vite.config.js                 # base: '/ssf-toolkit/' for GitHub Pages
├── tailwind.config.js
└── postcss.config.js
```

---

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:5173/ssf-toolkit/)
npm run build        # Build for production
npm run preview      # Preview production build
```

---

## Git Workflow

```bash
git add .
git commit -m "Your message here"
git push origin main
```

Pushing to `main` triggers automatic deployment via GitHub Actions.

---

## Coding Conventions

### React Components
- Use functional components with hooks (`useState`, `useMemo`)
- Each tool is a self-contained component in `src/tools/`
- Export as default: `export default ComponentName;`

### Styling
- Use Tailwind CSS utility classes
- Color scheme:
  - Blue (`#3b82f6`) — SSF Model, general
  - Purple (`#8b5cf6`) — Extended CFT
  - Green (`#22c55e`) — EPS/biofilm related
  - Amber (`#f59e0b`) — Scale comparison, warnings
  - Emerald (`#10b981`) — Layer explorer

### Charts (Recharts)
- Use `ResponsiveContainer` with percentage width
- Standard margins: `{ top: 10, right: 30, left: 10, bottom: 20 }`
- Use `CartesianGrid strokeDasharray="3 3"` for consistency

### Sliders
- Common pattern for parameter sliders:
```jsx
const Slider = ({ label, value, setValue, min, max, step, unit }) => (
  <div className="mb-4">
    <div className="flex justify-between text-sm mb-1">
      <span className="text-gray-700 font-medium">{label}</span>
      <span className="font-mono text-blue-700 font-semibold">{value} {unit}</span>
    </div>
    <input
      type="range"
      min={min} max={max} step={step} value={value}
      onChange={(e) => setValue(parseFloat(e.target.value))}
      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
    />
  </div>
);
```

---

## Scientific Context

### Thesis
**Title:** From Pores to Pilot Filters: Biofilm-Driven Bacterial Removal in Slow Sand Filtration  
**Author:** Mandana Samari Kermani  
**Institution:** Utrecht University, Faculty of Geosciences

### Key Finding
EPS composition (protein/carbohydrate ratio) outperforms chronological age as a predictor of SSF removal performance, with R² up to 0.99 at pilot scale.

### Scale Progression
```
Pore Scale → Mini Scale → Midi Scale → Pilot Scale
(Microfluidics)  (10 cm)     (52 cm)     (DWTP 80 cm)
```

---

## Core Equations

### 1. SSF Steady-State Model (Schijven et al. 2013)
Overall removal coefficient:
```
λ = μₗ + k_att,1/(1 + k_det,1/μ_s,1) + k_att,2/(1 + k_det,2/μ_s,2)
```

Concentration profile:
```
ln(C/C₀) = [(1 − √(1 + 4αₗλ/v)) / (2αₗ)] × x
```

Parameters:
- `v` — pore water velocity (m/d)
- `αₗ` — longitudinal dispersivity (m)
- `k_att` — attachment rate coefficient (1/d)
- `k_det` — detachment rate coefficient (1/d)
- `μ_s` — inactivation rate on solid phase (1/d)
- `μₗ` — inactivation rate in liquid phase (1/d)

### 2. Extended CFT (Chapter 3)
Regression model:
```
λ = β₀ + β₁·θ + β₂·HC + β₃·τ + β₄·SVR
```

Coefficients (R² = 0.98):
- β₀ = 18.33 (baseline)
- β₁ = −13.29 (porosity θ)
- β₂ = −15.34 (hydraulic conductivity HC)
- β₃ = −10.12 (tortuosity τ)
- β₄ = −0.11 (surface-to-volume ratio SVR)

### 3. EPS-Based Removal (Chapters 4-6)

**Chapter 4 (Mini-scale, 75 days):**
```
Model A: λ = -0.17 + 2.14 × (protein/carbohydrate)     R² = 0.81
Model C: λ = -0.22 + 1.90 × (P/C) + 0.34 × inoc       R² = 0.89
```

**Chapter 5 (Mini-scale, 4 months):**
```
λ = -0.21 + 5.71×10⁻³ × protein                       R² = 0.37
```

**Chapter 5 (Midi-scale, 12 months):**
```
Model A: λ = 0.128 + 1.85×10⁻⁹ × biomass              R² = 0.35
Model B: λ = -0.0106 + 1.36×10⁻³ × SD_age             R² = 0.71
```

**Chapter 6 (Pilot-scale, top 10 cm):**
```
Model A: λ = -2.111 + 4.16×10⁻³×carb + 0.0133×prot    R² = 0.95
Model B: λ = -0.3748 + 0.0029 × SD_age                R² = 0.83
Model C: λ = -2.256 + 4.78×10⁻³×carb + 0.0124×prot − 0.194×inoc   R² = 0.99
```

### 4. Tufenkji-Elimelech Correlation (2004)
Single-collector efficiency:
```
η₀ = 2.4 × A_s^(1/3) × N_R^(-0.081) × N_Pe^(-0.715) × N_vdW^(0.052)
     + 0.55 × A_s × N_R^(1.675) × N_A^(0.125)
     + 0.22 × N_R^(-0.24) × N_G^(1.11) × N_vdW^(0.053)
```

---

## Adding a New Tool

1. Create component in `src/tools/NewTool.jsx`
2. Add to imports in `src/App.jsx`
3. Add entry in the `tools` object in `App.jsx`:
```jsx
'new-tool': {
  id: 'new-tool',
  name: 'New Tool Name',
  shortName: 'New Tool',
  description: 'What this tool does',
  source: 'Reference (Year)',
  chapter: 'Chapter X',
  icon: '🔧',
  color: '#hexcolor',
  component: NewTool
}
```

---

## Common Tasks

### Add a parameter slider to a tool
```jsx
<Slider 
  label="Parameter Name" 
  value={paramValue} 
  setValue={setParamValue} 
  min={0} max={100} step={1} 
  unit="units"
/>
```

### Add a chart
```jsx
<ResponsiveContainer width="100%" height={220}>
  <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
    <XAxis dataKey="x" fontSize={11} />
    <YAxis fontSize={11} />
    <Tooltip />
    <Legend />
    <Line type="monotone" dataKey="y" stroke="#3b82f6" strokeWidth={2} dot={false} />
  </LineChart>
</ResponsiveContainer>
```

### Add a preset scenario
```jsx
const presets = {
  scenarioName: {
    name: 'Display Name',
    params: { param1: value1, param2: value2 },
    description: 'What this scenario represents',
    color: '#hexcolor'
  }
};
```

---

## References

- Schijven, J.F., et al. (2013). Two-site kinetic modeling of bacteriophages transport. *J. Contam. Hydrol.*
- Tufenkji, N., & Elimelech, M. (2004). Correlation equation for single-collector efficiency. *Environ. Sci. Technol.*, 38(2), 529-536.
- Bai, X., Samari-Kermani, M., et al. (2024, 2025). SSF removal studies — Chapters 4-6.

---

## Tool Verification Status

### Verified Correct (DO NOT MODIFY coefficients)
- SSFModelExplorer.jsx — Schijven two-site model equations ✓
- ExtendedCFTCalculator.jsx — Eq. 3.31 coefficients (18.33, -13.29, -15.34, -10.12, -0.11) ✓
- EPSRemovalPredictor.jsx — All 11 regression models from Ch.4-6 ✓
- ScaleDependentPredictor.jsx — All 5 Ch.5 models ✓
- LayerContributionExplorer.jsx — Ch.6 Models A/B/C ✓

### Key Scientific Rules
- Chapter 3 regression outputs -ln(C/C₀), NOT log₁₀ or λ in d⁻¹
- Chapters 4-6 regressions output -log₁₀(C/C₀)
- Always verify coefficients against docs/regression-equations.md before changing
- Experimental data values are log₁₀ removal, not raw C/C₀ ratios

### Parameter Ranges (validated against thesis)
- Carbohydrate: 0-500 µg/g
- Protein: 0-300 µg/g
- SD_age: 0-730 days
- SSF log removal: typically 1-4 (not 20+)

---

## Notes for Claude Code

- Always run `npm run dev` to test changes locally before committing
- The base path is `/ssf-toolkit/` — important for routing and assets
- All tools should be self-contained (no cross-tool dependencies)
- Use `useMemo` for expensive calculations to avoid re-renders
- Maintain consistent UI patterns across tools (sliders, cards, charts)
- Scientific accuracy is critical — verify equations against source papers
