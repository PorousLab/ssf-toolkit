# Thesis Overview

**Title:** From Pores to Pilot Filters: Biofilm-Driven Bacterial Removal in Slow Sand Filtration  
**Author:** Mandana Samari Kermani  
**Institution:** Utrecht University, Faculty of Geosciences  
**Year:** 2026

---

## Central Research Question

How does biofilm development enhance bacterial removal in slow sand filters, and can EPS composition serve as a more reliable indicator of filter performance than chronological age?

---

## Key Finding

**EPS composition (particularly the protein/carbohydrate ratio) outperforms chronological age as a predictor of SSF removal performance**, achieving R² values up to 0.99 at pilot scale. When biofilm maturation is slow, age becomes a coarse proxy; when EPS accumulation is measurable, biochemical composition is the most reliable indicator.

---

## Multi-Scale Framework

```
Pore Scale → Mini Scale → Midi Scale → Pilot Scale
(Microfluidics)  (10 cm)     (52 cm)     (80 cm DWTP)
  Chapter 2-3    Chapter 4    Chapter 5    Chapter 6
```

### Scale Specifications

| Scale | Sand Length | Diameter | Operation Period | Location |
|-------|-------------|----------|------------------|----------|
| Pore (Microfluidic) | 30 mm | 60 µm depth | 7 days | Lab |
| Mini | 10 cm | 2.7 cm | 75 days / 4 months | Lab |
| Midi | 52 cm | 10 cm | 12 months | Lab |
| Pilot | 80 cm | — | 24 months | Scheveningen DWTP |

---

## Chapter Structure

### Chapter 1: Introduction
- Problem definition: Limitations of current SSF models
- Research objectives (7 objectives)
- Thesis outline

### Chapter 2: Pore-Scale Biofilm Visualization
- Microfluidic models to visualize biofilm effects on pore geometry
- Biofilm creates roughness, crevices, dead-end pores
- Mechanistic foundation for enhanced retention

### Chapter 3: Extended Colloid Filtration Theory
- Classical CFT underestimates attachment in biofilm-covered media
- Three biofilm efficiency terms: η₁, η₂, η₃
- Porosity and hydraulic conductivity as functional indicators
- **Key regression:** λ = 18.33 − 13.29θ − 15.34HC − 10.12τ − 0.11SVR (R² = 0.98)

### Chapter 4: Mini-Scale SSF (75 days)
- Effect of sand type, grain size, inoculation
- Protein/carbohydrate ratio as key predictor
- **Best model:** λ = −0.22 + 1.90×(P/C) + 0.34×inoc (R² = 0.89)

### Chapter 5: Scale Comparison (Mini vs Midi)
- Mini: 4 months, Midi: 12 months
- Slow biochemical development → age as practical proxy
- Scale dimensions NOT significant predictors
- **Midi Model B:** λ = −0.0106 + 1.36×10⁻³ × SD_age (R² = 0.71)

### Chapter 6: Pilot-Scale SSF (24 months)
- Depth-resolved removal: top 10 cm becomes dominant
- Inoculation accelerates early development
- DNA vs RNA community analysis
- **Best model:** λ = −2.26 + 4.78×10⁻³×carb + 0.0124×prot − 0.19×inoc (R² = 0.99)

### Chapter 7: Synthesis & Conclusions
- Unified picture across scales
- Practical implications for QMRA
- Outlook for model refinement

---

## Key Variables

### EPS Components
- **Protein** (µg/g): 20–500 typical range
- **Carbohydrate** (µg/g): 100–500 typical range
- **Protein/Carbohydrate ratio**: Higher = "stickier" EPS, better removal
- **Biomass** (16S/18S copies/g): 10⁵–10⁸ typical range

### Physical Parameters
- **Porosity (θ)**: 0.33–0.45
- **Hydraulic Conductivity (HC)**: Decreases with biofilm growth
- **Tortuosity (τ)**: Increases with biofilm growth
- **Grain size (D₅₀)**: 0.15 mm (fine) to 0.65 mm (coarse)

### Kinetic Parameters
- **k_att**: Attachment rate coefficient (min⁻¹ or d⁻¹)
- **k_det**: Detachment rate coefficient (min⁻¹ or d⁻¹)
- **μ_s**: Solid-phase inactivation rate (d⁻¹)
- **μ_l**: Liquid-phase inactivation rate (d⁻¹)
- **λ**: Overall removal coefficient (log₁₀ removal per unit length)

---

## Indicator Organisms

- **E. coli WR1** (NCTC 13167): Primary indicator bacterium
- **1.5 µm polystyrene microspheres**: Surrogate particles for CFT validation
- **MS2 bacteriophage**: Reference for Schijven et al. (2013) model

---

## Key Correlations Found

| Scale | Best Predictor | R² | Finding |
|-------|----------------|-----|---------|
| Mini (Ch.4) | Protein/Carbohydrate ratio | 0.89 | EPS composition > age |
| Mini (Ch.5) | Protein | 0.37 | Limited EPS variation |
| Midi (Ch.5) | SD_age | 0.71 | Age as proxy when EPS slow |
| Pilot (Ch.6) | Protein + Carbohydrate + Inoc | 0.99 | Full model best |

---

## Practical Implications

1. **For water utilities:** Monitor EPS (protein, carbohydrate) rather than just filter age
2. **For QMRA:** Replace age-based parameters with EPS-based indicators when available
3. **For new filters:** Inoculation with mature Schmutzdecke can accelerate ripening
4. **For monitoring:** The top 10 cm (Schmutzdecke) dominates removal in mature filters
