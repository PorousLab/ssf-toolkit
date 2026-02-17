# SSF Toolkit

**Interactive tools for slow sand filtration research**

[![Deploy to GitHub Pages](https://github.com/PorousLab/ssf-toolkit/actions/workflows/deploy.yml/badge.svg)](https://github.com/PorousLab/ssf-toolkit/actions/workflows/deploy.yml)

🔗 **Live Demo:** [porouslab.github.io/ssf-toolkit](https://porouslab.github.io/ssf-toolkit/)

---

## 🔬 Tools

| Tool | Description | Key Feature |
|------|-------------|-------------|
| **SSF Steady-State Model** | Two-site kinetic model for bacterial removal | Schijven et al. (2013) QMRA framework |
| **Extended CFT Calculator** | Image-informed colloid filtration theory | Biofilm efficiency terms (η₁, η₂, η₃) |
| **EPS-Based Predictor** | Regression models linking EPS to removal | Protein/carbohydrate ratio as key predictor |
| **Scale-Dependent Predictor** | Mini vs Midi scale comparison | Scale-independent mechanisms |
| **Layer Contribution Explorer** | Depth-resolved pilot-scale analysis | Top 10 cm dominance in mature filters |

---

## 📖 Research Context

These tools accompany the PhD thesis:

> **From Pores to Pilot Filters: Biofilm-Driven Bacterial Removal in Slow Sand Filtration**  
> Mandana Samari Kermani — Utrecht University, Faculty of Geosciences

### Key Finding

EPS composition (particularly the protein/carbohydrate ratio) outperforms chronological age as a predictor of SSF removal performance, achieving R² values up to 0.99 at pilot scale.

---

## 🚀 Multi-Scale Framework

```
Pore Scale → Mini Scale → Midi Scale → Pilot Scale
(Microfluidics)  (10 cm)     (52 cm)     (DWTP)
```

The toolkit demonstrates how mechanistic understanding at the pore scale translates to practical prediction at pilot scale.

---

## 🛠️ Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
# Clone repository
git clone https://github.com/PorousLab/ssf-toolkit.git
cd ssf-toolkit

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Tech Stack

- **React 18** — UI framework
- **Vite** — Build tool
- **Tailwind CSS** — Styling
- **Recharts** — Data visualisation
- **GitHub Pages** — Deployment

---

## 📚 References

### Core Models

- Schijven, J.F., et al. (2013). Two-site kinetic modeling of bacteriophages transport through columns of saturated dune sand. *Journal of Contaminant Hydrology*, 57, 259-279.

- Tufenkji, N., & Elimelech, M. (2004). Correlation equation for predicting single-collector efficiency in physicochemical filtration in saturated porous media. *Environmental Science & Technology*, 38(2), 529-536.

### Thesis Publications

- Samari-Kermani, M., et al. (2025). From Roughness to Occlusion: Image-Informed Extended Colloid Filtration Theory for Biofilm-Laden Porous Media. (Chapter 3)

- Bai, X., Samari-Kermani, M., et al. (2024). Enhancing slow sand filtration for safe drinking water production: effect of sand media and Schmutzdecke inoculation. (Chapter 4)

- Bai, X., Samari-Kermani, M., et al. (2025). Consistency and challenges in replicating slow sand filtration performance for safe drinking water production. (Chapter 5)

- Bai, X., Samari-Kermani, M., et al. (2025). Schmutzdecke maturation and layers' contribution to removal performance in slow sand filters. (Chapter 6)

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🔗 Links

- [PorousLab GitHub](https://github.com/PorousLab)
- [Utrecht University - Earth Sciences](https://www.uu.nl/en/research/department-of-earth-sciences)
- [Dutch QMRA](https://www.rivm.nl/qmra)

---

*Built with ❤️ for the water treatment research community*
