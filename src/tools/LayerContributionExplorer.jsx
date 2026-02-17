import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell, AreaChart, Area, ComposedChart, ReferenceLine, PieChart, Pie } from 'recharts';

// Schmutzdecke Layer Contribution Explorer
// Based on: Bai, Samari-Kermani et al. (2025) - Schmutzdecke maturation and layers' contribution
// Thesis Chapter 6

const LayerContributionExplorer = () => {
  // ============== STATE ==============
  // EPS Composition (Schmutzdecke top 10 cm)
  const [protein, setProtein] = useState(180);           // µg/g
  const [carbohydrate, setCarbohydrate] = useState(350); // µg/g
  const [biomass, setBiomass] = useState(1e8);           // copies/g
  
  // Filter Parameters
  const [sdAge, setSdAge] = useState(365);               // days
  const [inoculated, setInoculated] = useState(true);
  
  // Visualization
  const [selectedModel, setSelectedModel] = useState('C');
  const [activePreset, setActivePreset] = useState(null);

  // ============== PILOT FILTER SPECIFICATIONS ==============
  const pilotSpecs = {
    totalDepth: 80,           // cm total sand bed
    upperLayerDepth: 10,      // cm (Schmutzdecke zone, INF to P1)
    deeperLayerDepth: 70,     // cm (P1 to P8/EFF)
    operationPeriod: 24,      // months
    location: 'Scheveningen DWTP, Netherlands'
  };

  // ============== REGRESSION MODELS (Table 6.3) ==============
  // Note: These models are for UPPER LAYER removal (top 10 cm only)
  const models = {
    A: {
      name: 'Model A (EPS Components)',
      equation: 'λ = a₀ + a₁ × carbohydrate + a₂ × protein',
      description: 'Biochemical parameters only',
      coefficients: { a0: -2.1110, a1: 4.16e-3, a2: 0.0133 },
      rSquared: 0.95,
      pValue: 0.0059,
      color: '#22c55e',
      calculate: (params) => -2.1110 + 4.16e-3 * params.carbohydrate + 0.0133 * params.protein
    },
    B: {
      name: 'Model B (Age Only)',
      equation: 'λ = a₀ + a₁ × SD_age',
      description: 'Physical parameters only',
      coefficients: { a0: -0.3748, a1: 0.0029 },
      rSquared: 0.83,
      pValue: 0.0074,
      color: '#f59e0b',
      calculate: (params) => -0.3748 + 0.0029 * params.sdAge
    },
    C: {
      name: 'Model C (Full Model)',
      equation: 'λ = a₀ + a₁ × carb + a₂ × prot + a₃ × inoc',
      description: 'All parameters combined',
      coefficients: { a0: -2.2556, a1: 4.78e-3, a2: 0.0124, a3: -0.1935 },
      rSquared: 0.99,
      pValue: 0.0041,
      color: '#8b5cf6',
      calculate: (params) => {
        const inoc = params.inoculated ? 1 : 0;
        return -2.2556 + 4.78e-3 * params.carbohydrate + 0.0124 * params.protein + (-0.1935) * inoc;
      }
    }
  };

  // ============== EXPERIMENTAL DATA (from Figure 6.3) ==============
  // Depth-resolved removal over time for both pilot filters
  const experimentalData = {
    // PF-1: Inoculated filter
    inoculated: [
      { month: 6, upperLayer: 0.35, deeperLayer: 0.75, total: 1.10 },
      { month: 12, upperLayer: 0.85, deeperLayer: 0.35, total: 1.20 },
      { month: 18, upperLayer: 1.20, deeperLayer: 0.15, total: 1.35 },
      { month: 24, upperLayer: 1.30, deeperLayer: 0.10, total: 1.40 }
    ],
    // PF-2: Control (non-inoculated) filter
    control: [
      { month: 6, upperLayer: 0.20, deeperLayer: 0.80, total: 1.00 },
      { month: 12, upperLayer: 0.60, deeperLayer: 0.50, total: 1.10 },
      { month: 18, upperLayer: 1.00, deeperLayer: 0.25, total: 1.25 },
      { month: 24, upperLayer: 1.25, deeperLayer: 0.12, total: 1.37 }
    ]
  };

  // ============== PRESETS ==============
  const presets = {
    earlyRipening: {
      name: 'Early Ripening (6 months)',
      params: { protein: 80, carbohydrate: 200, biomass: 5e7, sdAge: 180, inoculated: false },
      description: 'Young filter — deeper layer still contributes significantly',
      color: '#86efac'
    },
    matureFilter: {
      name: 'Mature Filter (12 months)',
      params: { protein: 150, carbohydrate: 300, biomass: 1e8, sdAge: 365, inoculated: true },
      description: 'Well-developed Schmutzdecke — upper layer dominates',
      color: '#22c55e'
    },
    fullyMature: {
      name: 'Fully Mature (24 months)',
      params: { protein: 200, carbohydrate: 400, biomass: 1.5e8, sdAge: 730, inoculated: true },
      description: 'Converged performance — deeper layer negligible',
      color: '#15803d'
    },
    inoculatedEarly: {
      name: 'Inoculated (6 months)',
      params: { protein: 120, carbohydrate: 280, biomass: 8e7, sdAge: 180, inoculated: true },
      description: 'Accelerated development via inoculation',
      color: '#3b82f6'
    },
    lowEPS: {
      name: 'Low EPS Development',
      params: { protein: 50, carbohydrate: 150, biomass: 3e7, sdAge: 365, inoculated: false },
      description: 'Slow biochemical maturation scenario',
      color: '#f59e0b'
    }
  };

  const applyPreset = (presetKey) => {
    const p = presets[presetKey].params;
    setProtein(p.protein);
    setCarbohydrate(p.carbohydrate);
    setBiomass(p.biomass);
    setSdAge(p.sdAge);
    setInoculated(p.inoculated);
    setActivePreset(presetKey);
  };

  // ============== CALCULATIONS ==============
  
  const currentParams = useMemo(() => ({
    protein,
    carbohydrate,
    biomass,
    sdAge,
    inoculated
  }), [protein, carbohydrate, biomass, sdAge, inoculated]);

  // Calculate all model predictions
  const predictions = useMemo(() => {
    const results = {};
    Object.entries(models).forEach(([key, model]) => {
      const value = model.calculate(currentParams);
      results[key] = {
        value: Math.max(0, value),
        model
      };
    });
    return results;
  }, [currentParams]);

  // Current selected model prediction
  const currentPrediction = predictions[selectedModel];

  // Estimate layer contributions based on age
  const layerContributions = useMemo(() => {
    // Based on experimental observations: upper layer contribution increases with age
    // At 6 months: ~30% upper, ~70% deeper
    // At 24 months: ~90% upper, ~10% deeper
    const ageMonths = sdAge / 30;
    
    // Logistic-like transition
    const upperFraction = Math.min(0.95, 0.25 + 0.70 * (1 - Math.exp(-0.15 * ageMonths)));
    const deeperFraction = 1 - upperFraction;
    
    // Inoculation accelerates transition
    const inocBonus = inoculated ? 0.1 : 0;
    const adjustedUpperFraction = Math.min(0.98, upperFraction + inocBonus);
    
    const totalRemoval = currentPrediction?.value || 0;
    
    return {
      upperFraction: adjustedUpperFraction,
      deeperFraction: 1 - adjustedUpperFraction,
      upperRemoval: totalRemoval, // Upper layer removal is what model predicts
      // Deeper layer removal decreases as filter matures
      deeperRemoval: totalRemoval * (1 - adjustedUpperFraction) / adjustedUpperFraction * 0.3,
      totalRemoval: totalRemoval + totalRemoval * (1 - adjustedUpperFraction) / adjustedUpperFraction * 0.3
    };
  }, [sdAge, inoculated, currentPrediction]);

  // Layer contribution over time data
  const layerTimeData = useMemo(() => {
    const data = [];
    for (let month = 1; month <= 24; month++) {
      const upperFrac = Math.min(0.95, 0.25 + 0.70 * (1 - Math.exp(-0.15 * month)));
      const deeperFrac = 1 - upperFrac;
      
      // Estimate removal based on age
      const ageParams = { ...currentParams, sdAge: month * 30 };
      const removalEstimate = models.B.calculate(ageParams);
      
      data.push({
        month,
        upperLayer: Math.max(0, removalEstimate * upperFrac),
        deeperLayer: Math.max(0, removalEstimate * deeperFrac * 0.8),
        upperPercent: upperFrac * 100,
        deeperPercent: deeperFrac * 100,
        current: Math.abs(month - sdAge / 30) < 1
      });
    }
    return data;
  }, [currentParams, sdAge]);

  // EPS sensitivity data
  const epsSensitivityData = useMemo(() => {
    const data = [];
    for (let prot = 50; prot <= 300; prot += 25) {
      const testParams = { ...currentParams, protein: prot };
      const modelA = models.A.calculate(testParams);
      const modelC = models.C.calculate(testParams);
      
      data.push({
        protein: prot,
        modelA: Math.max(0, modelA),
        modelC: Math.max(0, modelC),
        current: Math.abs(prot - protein) < 15
      });
    }
    return data;
  }, [currentParams, protein]);

  // Model comparison data
  const modelComparisonData = useMemo(() => {
    return Object.entries(models).map(([key, model]) => ({
      name: `Model ${key}`,
      fullName: model.name,
      value: predictions[key]?.value || 0,
      rSquared: model.rSquared,
      color: model.color,
      isSelected: key === selectedModel
    }));
  }, [predictions, selectedModel]);

  // Pie chart data for layer contribution
  const pieData = useMemo(() => [
    { name: 'Upper Layer (0-10 cm)', value: layerContributions.upperFraction * 100, fill: '#22c55e' },
    { name: 'Deeper Layer (10-80 cm)', value: layerContributions.deeperFraction * 100, fill: '#94a3b8' }
  ], [layerContributions]);

  // ============== UI COMPONENTS ==============
  
  const Slider = ({ label, value, setValue, min, max, step, unit, logScale = false }) => {
    const displayValue = logScale ? value.toExponential(1) : 
      (step < 1 ? value.toFixed(1) : value.toFixed(0));
    
    return (
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-700 font-medium">{label}</span>
          <span className="font-mono text-blue-700 font-semibold">{displayValue} {unit}</span>
        </div>
        <input
          type="range"
          min={logScale ? Math.log10(min) : min}
          max={logScale ? Math.log10(max) : max}
          step={logScale ? 0.1 : step}
          value={logScale ? Math.log10(value) : value}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            setValue(logScale ? Math.pow(10, val) : val);
            setActivePreset(null);
          }}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
        />
      </div>
    );
  };

  const MetricCard = ({ title, value, unit, subtitle, color = 'green' }) => {
    const colorClasses = {
      green: 'bg-green-50 text-green-600 border-green-200',
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      amber: 'bg-amber-50 text-amber-600 border-amber-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      gray: 'bg-gray-50 text-gray-600 border-gray-200'
    };
    return (
      <div className={`rounded-lg p-3 border ${colorClasses[color]}`}>
        <div className="text-xs font-medium mb-1">{title}</div>
        <div className="text-xl font-bold">{value} <span className="text-sm font-normal">{unit}</span></div>
        {subtitle && <div className="text-xs mt-1 opacity-75">{subtitle}</div>}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-4 border border-gray-100">
          <h1 className="text-2xl font-bold text-gray-800">Schmutzdecke Layer Contribution Explorer</h1>
          <p className="text-sm text-gray-600 mt-1">
            Depth-resolved removal analysis in pilot-scale SSF — Bai, Samari-Kermani et al. (2025) — Thesis Chapter 6
          </p>
          <div className="flex gap-2 mt-3 flex-wrap">
            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Top 10 cm dominates</span>
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">24-month pilot study</span>
            <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">R² = 0.99 (Model C)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Panel: Parameters */}
          <div className="lg:col-span-1 space-y-4">
            {/* Model Selection */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Regression Model</h2>
              <div className="space-y-2">
                {Object.entries(models).map(([key, model]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedModel(key)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      selectedModel === key
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-gray-700">{model.name}</div>
                        <div className="text-xs text-gray-500">{model.description}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold" style={{ color: model.color }}>R² = {model.rSquared}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Presets */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Maturation Presets</h2>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(presets).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => applyPreset(key)}
                    className={`text-left p-2 rounded-lg border transition-all ${
                      activePreset === key
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.color }}></div>
                      <span className="text-xs font-semibold text-gray-700">{preset.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* EPS Parameters */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Schmutzdecke EPS (Top 10 cm)</h2>
              
              <Slider 
                label="Protein" 
                value={protein} 
                setValue={setProtein} 
                min={30} max={350} step={10} 
                unit="µg/g"
              />
              
              <Slider 
                label="Carbohydrate" 
                value={carbohydrate} 
                setValue={setCarbohydrate} 
                min={100} max={500} step={20} 
                unit="µg/g"
              />
              
              <Slider 
                label="Biomass" 
                value={biomass} 
                setValue={setBiomass} 
                min={1e7} max={5e8} step={1e7} 
                unit="copies/g"
                logScale={true}
              />
            </div>

            {/* Filter Parameters */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Filter Parameters</h2>
              
              <Slider 
                label="Schmutzdecke Age" 
                value={sdAge} 
                setValue={setSdAge} 
                min={30} max={730} step={30} 
                unit="days"
              />
              
              <div className="flex items-center justify-between mt-3">
                <span className="text-sm text-gray-700">Inoculated</span>
                <button
                  onClick={() => { setInoculated(!inoculated); setActivePreset(null); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    inoculated ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {inoculated ? 'Yes (PF-1)' : 'No (PF-2)'}
                </button>
              </div>
              
              <div className="mt-3 p-2 bg-blue-50 rounded-lg text-xs text-blue-700">
                <strong>Note:</strong> Inoculation coefficient is negative (−0.19) after accounting for EPS, 
                indicating time-dependent benefit that diminishes as filter matures.
              </div>
            </div>

            {/* Filter Schematic */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Filter Cross-Section</h2>
              <div className="relative h-48 bg-gradient-to-b from-amber-100 to-amber-200 rounded-lg overflow-hidden">
                {/* Water layer */}
                <div className="absolute top-0 left-0 right-0 h-6 bg-blue-200 flex items-center justify-center">
                  <span className="text-xs text-blue-700">Supernatant water</span>
                </div>
                
                {/* Schmutzdecke (top 10 cm) */}
                <div 
                  className="absolute left-0 right-0 bg-gradient-to-b from-green-600 to-green-500 flex items-center justify-center border-b-2 border-green-700"
                  style={{ top: '24px', height: '40px' }}
                >
                  <div className="text-center">
                    <div className="text-xs font-bold text-white">Schmutzdecke</div>
                    <div className="text-xs text-green-100">0–10 cm ({(layerContributions.upperFraction * 100).toFixed(0)}% removal)</div>
                  </div>
                </div>
                
                {/* Deeper sand layer */}
                <div 
                  className="absolute left-0 right-0 bottom-0 bg-amber-300 flex items-center justify-center"
                  style={{ top: '64px' }}
                >
                  <div className="text-center">
                    <div className="text-xs font-medium text-amber-800">Deeper Sand Layer</div>
                    <div className="text-xs text-amber-700">10–80 cm ({(layerContributions.deeperFraction * 100).toFixed(0)}% removal)</div>
                  </div>
                </div>
                
                {/* Sampling points */}
                <div className="absolute right-2 top-8 text-xs text-gray-600">INF →</div>
                <div className="absolute right-2 top-16 text-xs text-green-800">P1 →</div>
                <div className="absolute right-2 bottom-2 text-xs text-amber-800">P8/EFF →</div>
              </div>
            </div>
          </div>

          {/* Right Panel: Results */}
          <div className="lg:col-span-2 space-y-4">
            {/* Key Metrics */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Predicted Upper Layer Removal (INF → P1)</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MetricCard 
                  title="Upper Layer Removal" 
                  value={currentPrediction?.value.toFixed(2) || '—'} 
                  unit="log₁₀" 
                  subtitle="Top 10 cm (Model)"
                  color="green"
                />
                <MetricCard 
                  title="Layer Contribution" 
                  value={(layerContributions.upperFraction * 100).toFixed(0)} 
                  unit="%" 
                  subtitle="Upper layer share"
                  color="blue"
                />
                <MetricCard 
                  title="Model R²" 
                  value={models[selectedModel].rSquared.toFixed(2)} 
                  unit="" 
                  subtitle={`Model ${selectedModel}`}
                  color="purple"
                />
                <MetricCard 
                  title="Filter Age" 
                  value={(sdAge / 30).toFixed(0)} 
                  unit="months" 
                  subtitle={inoculated ? 'Inoculated' : 'Control'}
                  color="amber"
                />
              </div>
            </div>

            {/* Layer Contribution Pie + Bar */}
            <div className="grid grid-cols-2 gap-4">
              {/* Pie Chart */}
              <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">Current Layer Contribution</h2>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      dataKey="value"
                      label={({ name, value }) => `${value.toFixed(0)}%`}
                      labelLine={false}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 text-xs mt-2">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-green-500"></div>
                    <span>Upper (0–10 cm)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-gray-400"></div>
                    <span>Deeper (10–80 cm)</span>
                  </div>
                </div>
              </div>

              {/* Model Comparison */}
              <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">Model Comparison</h2>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={modelComparisonData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip formatter={(value) => [`${value.toFixed(2)} log₁₀`, 'Removal']} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {modelComparisonData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          stroke={entry.isSelected ? '#1e40af' : 'none'}
                          strokeWidth={entry.isSelected ? 3 : 0}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Layer Contribution Over Time */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Layer Contribution Over Filter Maturation</h2>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={layerTimeData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="month" 
                    label={{ value: 'Filter Age (months)', position: 'bottom', offset: 0, fontSize: 12 }}
                    fontSize={11}
                  />
                  <YAxis 
                    label={{ value: 'Log₁₀ Removal', angle: -90, position: 'insideLeft', fontSize: 12 }}
                    fontSize={11}
                  />
                  <Tooltip 
                    formatter={(value, name) => [
                      `${value.toFixed(2)} log₁₀`,
                      name === 'upperLayer' ? 'Upper Layer (0–10 cm)' : 'Deeper Layer (10–80 cm)'
                    ]}
                    labelFormatter={(label) => `Month ${label}`}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Area type="monotone" dataKey="deeperLayer" stackId="1" stroke="#94a3b8" fill="#cbd5e1" name="Deeper Layer" />
                  <Area type="monotone" dataKey="upperLayer" stackId="1" stroke="#22c55e" fill="#86efac" name="Upper Layer" />
                  <ReferenceLine x={sdAge / 30} stroke="#ef4444" strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-2 text-xs text-gray-500 text-center">
                The upper ~10 cm (Schmutzdecke) progressively dominates removal as the filter matures.
              </div>
            </div>

            {/* EPS Sensitivity */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Protein Effect on Upper Layer Removal</h2>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={epsSensitivityData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="protein" 
                    label={{ value: 'Protein (µg/g)', position: 'bottom', offset: 0, fontSize: 12 }}
                    fontSize={11}
                  />
                  <YAxis 
                    label={{ value: 'Log₁₀ Removal', angle: -90, position: 'insideLeft', fontSize: 12 }}
                    fontSize={11}
                  />
                  <Tooltip 
                    formatter={(value, name) => [`${value.toFixed(2)}`, name === 'modelA' ? 'Model A' : 'Model C']}
                    labelFormatter={(label) => `Protein: ${label} µg/g`}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <ReferenceLine x={protein} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'Current', position: 'top', fontSize: 10, fill: '#ef4444' }} />
                  <Line type="monotone" dataKey="modelA" stroke="#22c55e" strokeWidth={2} dot={false} name="Model A (EPS only)" />
                  <Line type="monotone" dataKey="modelC" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Model C (Full)" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Current Model Equation */}
            <div className="bg-gray-800 rounded-xl shadow-sm p-4 text-white">
              <h2 className="text-sm font-semibold mb-2">{models[selectedModel].name}</h2>
              <div className="font-mono text-sm text-green-300 mb-3">
                {models[selectedModel].equation}
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs">
                {Object.entries(models[selectedModel].coefficients).map(([key, val]) => (
                  <div key={key} className="bg-gray-700 rounded p-2 text-center">
                    <div className="text-gray-400">{key}</div>
                    <div className="font-bold text-green-300">
                      {Math.abs(val) < 0.01 ? val.toExponential(2) : val.toFixed(4)}
                    </div>
                  </div>
                ))}
                <div className="bg-gray-700 rounded p-2 text-center">
                  <div className="text-gray-400">R²</div>
                  <div className="font-bold text-amber-300">{models[selectedModel].rSquared}</div>
                </div>
              </div>
            </div>

            {/* Key Insight */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-sm p-4 border border-green-200">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">💡 Key Thesis Insight (Chapter 6)</h2>
              <p className="text-sm text-gray-600">
                <strong>The upper ~10 cm (Schmutzdecke zone) becomes the dominant removal zone in mature SSFs.</strong> 
                Depth-resolved modelling showed that as filters mature, the deeper sand layer contribution 
                declines and eventually becomes negligible. Protein and carbohydrate together explain nearly 
                all variability in upper-layer removal (R² = 0.95–0.99), while age-only models achieve 
                R² = 0.83. This confirms that <strong>EPS composition is mechanistically superior to chronological 
                age</strong> as an indicator of Schmutzdecke functional maturity.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center text-xs text-gray-500">
          Based on: Bai, X., Samari-Kermani, M., et al. (2025). Schmutzdecke maturation and layers' contribution.
          <br />
          PhD Thesis Chapter 6: <em>From Pores to Pilot Filters</em> — Utrecht University | Pilot study: Scheveningen DWTP, Netherlands
        </div>
      </div>
    </div>
  );
};

export default LayerContributionExplorer;
