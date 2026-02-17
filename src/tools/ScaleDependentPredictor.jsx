import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell, ScatterChart, Scatter, ReferenceLine, ComposedChart, Area } from 'recharts';

// Scale-Dependent Removal Predictor
// Based on: Bai, Samari-Kermani et al. (2025) - Consistency and Challenges in Replicating SSF
// Thesis Chapter 5

const ScaleDependentPredictor = () => {
  // ============== STATE ==============
  // Biochemical Parameters
  const [protein, setProtein] = useState(100);           // µg/g
  const [carbohydrate, setCarbohydrate] = useState(80);  // µg/g
  const [biomass, setBiomass] = useState(5e7);           // copies/g
  
  // Abiotic Parameters
  const [sdAge, setSdAge] = useState(100);               // days
  const [sandType, setSandType] = useState('fine');      // fine, coarse, mixed
  const [inoculated, setInoculated] = useState(true);
  
  // UI State
  const [activePreset, setActivePreset] = useState(null);
  const [showExperimentalData, setShowExperimentalData] = useState(true);

  // ============== FILTER SPECIFICATIONS ==============
  const filterSpecs = {
    mini: {
      name: 'Mini-scale',
      sandLength: 10,      // cm
      diameter: 2.7,       // cm
      operationTime: '4 months',
      color: '#22c55e',
      lightColor: '#dcfce7'
    },
    midi: {
      name: 'Midi-scale',
      sandLength: 52,      // cm
      diameter: 10,        // cm
      operationTime: '12 months',
      color: '#3b82f6',
      lightColor: '#dbeafe'
    }
  };

  // ============== MODEL COEFFICIENTS (from Tables 4, 5, 6) ==============
  const scaleModels = {
    mini: {
      name: 'Mini-scale',
      description: '4-month operation, protein as key predictor',
      models: {
        A: {
          name: 'Model A (Protein)',
          equation: 'λ = a₀ + a₁ × protein',
          coefficients: { a0: -0.21, a1: 5.71e-3 },
          rSquared: 0.37,
          pValue: 0.0477,
          keyPredictor: 'protein',
          calculate: (params) => -0.21 + 5.71e-3 * params.protein
        }
      },
      note: 'Model B (abiotic only) not significant (p > 0.05). Protein correlated with age (r = 0.88).'
    },
    midi: {
      name: 'Midi-scale',
      description: '12-month operation, biomass and age as predictors',
      models: {
        A: {
          name: 'Model A (Biomass)',
          equation: 'λ = a₀ + a₁ × biomass',
          coefficients: { a0: 0.128, a1: 1.85e-9 },
          rSquared: 0.35,
          pValue: 0.0113,
          keyPredictor: 'biomass',
          calculate: (params) => 0.128 + 1.85e-9 * params.biomass
        },
        B: {
          name: 'Model B (Age)',
          equation: 'λ = a₀ + a₁ × SD_age',
          coefficients: { a0: -0.0106, a1: 1.36e-3 },
          rSquared: 0.71,
          pValue: 4.8e-5,
          keyPredictor: 'age',
          calculate: (params) => -0.0106 + 1.36e-3 * params.sdAge
        }
      },
      note: 'Protein not significant at midi-scale due to minimal temporal variation in EPS.'
    },
    combined: {
      name: 'Combined Scales',
      description: 'Mini + Midi data pooled (24 data points)',
      models: {
        A: {
          name: 'Model A (Biomass)',
          equation: 'λ = a₀ + a₁ × biomass',
          coefficients: { a0: 0.0884, a1: 2.10e-9 },
          rSquared: 0.43,
          pValue: 3.30e-4,
          keyPredictor: 'biomass',
          calculate: (params) => 0.0884 + 2.10e-9 * params.biomass
        },
        B: {
          name: 'Model B (Age)',
          equation: 'λ = a₀ + a₁ × SD_age',
          coefficients: { a0: -0.017, a1: 1.37e-3 },
          rSquared: 0.70,
          pValue: 1.9e-7,
          keyPredictor: 'age',
          calculate: (params) => -0.017 + 1.37e-3 * params.sdAge
        }
      },
      note: 'Scale parameters (length, diameter ratios) not significant — retention mechanisms consistent.'
    }
  };

  // ============== EXPERIMENTAL DATA (from Table 3) ==============
  const experimentalData = {
    mini: [
      { filter: 'MN-C0-', age: 1, sandType: 'coarse', inoc: false, removal: 3.61e-6 },
      { filter: 'MN-C3-', age: 93, sandType: 'coarse', inoc: false, removal: 9.00e-6 },
      { filter: 'MN-C3+', age: 90, sandType: 'coarse', inoc: true, removal: 0.031 },
      { filter: 'MN-F0-', age: 1, sandType: 'fine', inoc: false, removal: 6.92e-4 },
      { filter: 'MN-F3-', age: 100, sandType: 'fine', inoc: false, removal: 0.0105 },
      { filter: 'MN-F3+', age: 96, sandType: 'fine', inoc: true, removal: 0.0155 },
      { filter: 'MN-M0-', age: 1, sandType: 'mixed', inoc: false, removal: 8.56e-6 },
      { filter: 'MN-M3-', age: 106, sandType: 'mixed', inoc: false, removal: 0.154 },
      { filter: 'MN-M3+', age: 103, sandType: 'mixed', inoc: true, removal: 0.389 }
    ],
    midi: [
      { filter: 'MD-C0+', age: 1, sandType: 'coarse', inoc: true, removal: 0.0455 },
      { filter: 'MD-C3+', age: 105, sandType: 'coarse', inoc: true, removal: 0.170 },
      { filter: 'MD-C7+', age: 230, sandType: 'coarse', inoc: true, removal: 0.203 },
      { filter: 'MD-C12+', age: 390, sandType: 'coarse', inoc: true, removal: 0.582 },
      { filter: 'MD-F0+', age: 1, sandType: 'fine', inoc: true, removal: 0.0955 },
      { filter: 'MD-F3+', age: 107, sandType: 'fine', inoc: true, removal: 0.321 },
      { filter: 'MD-F7+', age: 238, sandType: 'fine', inoc: true, removal: 0.245 },
      { filter: 'MD-F12+', age: 392, sandType: 'fine', inoc: true, removal: 0.570 },
      { filter: 'MD-M0+', age: 1, sandType: 'mixed', inoc: true, removal: 3.00e-6 },
      { filter: 'MD-M3+', age: 111, sandType: 'mixed', inoc: true, removal: 2.94e-6 },
      { filter: 'MD-M8+', age: 250, sandType: 'mixed', inoc: true, removal: 0.0688 },
      { filter: 'MD-M12+', age: 397, sandType: 'mixed', inoc: true, removal: 0.574 },
      { filter: 'MD-M3-', age: 113, sandType: 'mixed', inoc: false, removal: 2.47e-6 },
      { filter: 'MD-M8-', age: 258, sandType: 'mixed', inoc: false, removal: 0.489 },
      { filter: 'MD-M12-', age: 399, sandType: 'mixed', inoc: false, removal: 0.679 }
    ]
  };

  // ============== PRESETS ==============
  const presets = {
    youngMini: {
      name: 'Young Mini (1 month)',
      params: { protein: 40, carbohydrate: 50, biomass: 1e7, sdAge: 30, sandType: 'fine', inoculated: false },
      description: 'Early mini-scale filter with minimal EPS',
      color: '#86efac'
    },
    matureMini: {
      name: 'Mature Mini (4 months)',
      params: { protein: 150, carbohydrate: 90, biomass: 1e8, sdAge: 120, sandType: 'fine', inoculated: true },
      description: 'Well-developed mini-scale Schmutzdecke',
      color: '#22c55e'
    },
    youngMidi: {
      name: 'Young Midi (3 months)',
      params: { protein: 50, carbohydrate: 60, biomass: 5e7, sdAge: 100, sandType: 'mixed', inoculated: true },
      description: 'Early midi-scale filter',
      color: '#93c5fd'
    },
    matureMidi: {
      name: 'Mature Midi (12 months)',
      params: { protein: 80, carbohydrate: 100, biomass: 3e8, sdAge: 365, sandType: 'fine', inoculated: true },
      description: 'Well-developed midi-scale Schmutzdecke',
      color: '#3b82f6'
    },
    slowRipening: {
      name: 'Slow Ripening Scenario',
      params: { protein: 45, carbohydrate: 55, biomass: 2e7, sdAge: 200, sandType: 'coarse', inoculated: false },
      description: 'Limited EPS accumulation — age as proxy',
      color: '#f59e0b'
    }
  };

  const applyPreset = (presetKey) => {
    const p = presets[presetKey].params;
    setProtein(p.protein);
    setCarbohydrate(p.carbohydrate);
    setBiomass(p.biomass);
    setSdAge(p.sdAge);
    setSandType(p.sandType);
    setInoculated(p.inoculated);
    setActivePreset(presetKey);
  };

  // ============== CALCULATIONS ==============
  
  const currentParams = useMemo(() => ({
    protein,
    carbohydrate,
    biomass,
    sdAge,
    sandType,
    inoculated
  }), [protein, carbohydrate, biomass, sdAge, sandType, inoculated]);

  // Calculate predictions for all scales and models
  const predictions = useMemo(() => {
    const results = {};
    Object.entries(scaleModels).forEach(([scaleKey, scaleData]) => {
      results[scaleKey] = {};
      Object.entries(scaleData.models).forEach(([modelKey, modelData]) => {
        const prediction = modelData.calculate(currentParams);
        results[scaleKey][modelKey] = {
          value: Math.max(0, prediction),
          model: modelData
        };
      });
    });
    return results;
  }, [currentParams]);

  // Best prediction per scale
  const bestPredictions = useMemo(() => ({
    mini: predictions.mini?.A?.value || 0,
    midi: Math.max(predictions.midi?.A?.value || 0, predictions.midi?.B?.value || 0),
    combined: Math.max(predictions.combined?.A?.value || 0, predictions.combined?.B?.value || 0)
  }), [predictions]);

  // Age-removal relationship data for both scales
  const ageRemovalData = useMemo(() => {
    const data = [];
    for (let age = 0; age <= 400; age += 20) {
      const testParams = { ...currentParams, sdAge: age };
      
      // Mini: protein-based (indirect via age correlation)
      // Using approximate protein-age relationship from correlation (r=0.88)
      const estimatedProtein = 30 + 0.8 * age; // Simplified linear approximation
      const miniPred = scaleModels.mini.models.A.calculate({ ...testParams, protein: Math.min(estimatedProtein, 200) });
      
      // Midi: age-based directly
      const midiPred = scaleModels.midi.models.B.calculate(testParams);
      
      // Combined: age-based
      const combinedPred = scaleModels.combined.models.B.calculate(testParams);
      
      data.push({
        age,
        mini: Math.max(0, miniPred),
        midi: Math.max(0, midiPred),
        combined: Math.max(0, combinedPred),
        current: Math.abs(age - sdAge) < 10
      });
    }
    return data;
  }, [currentParams, sdAge]);

  // Biomass-removal relationship
  const biomassRemovalData = useMemo(() => {
    const data = [];
    for (let logBiomass = 6; logBiomass <= 10; logBiomass += 0.25) {
      const testBiomass = Math.pow(10, logBiomass);
      const testParams = { ...currentParams, biomass: testBiomass };
      
      const midiPred = scaleModels.midi.models.A.calculate(testParams);
      const combinedPred = scaleModels.combined.models.A.calculate(testParams);
      
      data.push({
        biomass: logBiomass,
        biomassLabel: `10^${logBiomass}`,
        midi: Math.max(0, midiPred),
        combined: Math.max(0, combinedPred),
        current: Math.abs(logBiomass - Math.log10(biomass)) < 0.2
      });
    }
    return data;
  }, [currentParams, biomass]);

  // Experimental data formatted for scatter plot
  const scatterData = useMemo(() => {
    const allData = [];
    
    experimentalData.mini.forEach(d => {
      allData.push({
        age: d.age,
        removal: d.removal,
        scale: 'mini',
        sandType: d.sandType,
        inoculated: d.inoc,
        filter: d.filter
      });
    });
    
    experimentalData.midi.forEach(d => {
      allData.push({
        age: d.age,
        removal: d.removal,
        scale: 'midi',
        sandType: d.sandType,
        inoculated: d.inoc,
        filter: d.filter
      });
    });
    
    return allData;
  }, []);

  // Filter experimental data by sand type
  const filteredExperimentalData = useMemo(() => {
    return scatterData.filter(d => d.sandType === sandType || sandType === 'all');
  }, [scatterData, sandType]);

  // Model comparison bar data
  const modelComparisonData = useMemo(() => {
    const data = [];
    
    // Mini
    data.push({
      name: 'Mini (Protein)',
      scale: 'mini',
      model: 'A',
      value: predictions.mini?.A?.value || 0,
      rSquared: scaleModels.mini.models.A.rSquared,
      fill: '#22c55e'
    });
    
    // Midi
    data.push({
      name: 'Midi (Biomass)',
      scale: 'midi',
      model: 'A',
      value: predictions.midi?.A?.value || 0,
      rSquared: scaleModels.midi.models.A.rSquared,
      fill: '#60a5fa'
    });
    data.push({
      name: 'Midi (Age)',
      scale: 'midi',
      model: 'B',
      value: predictions.midi?.B?.value || 0,
      rSquared: scaleModels.midi.models.B.rSquared,
      fill: '#3b82f6'
    });
    
    // Combined
    data.push({
      name: 'Combined (Biomass)',
      scale: 'combined',
      model: 'A',
      value: predictions.combined?.A?.value || 0,
      rSquared: scaleModels.combined.models.A.rSquared,
      fill: '#a78bfa'
    });
    data.push({
      name: 'Combined (Age)',
      scale: 'combined',
      model: 'B',
      value: predictions.combined?.B?.value || 0,
      rSquared: scaleModels.combined.models.B.rSquared,
      fill: '#8b5cf6'
    });
    
    return data;
  }, [predictions]);

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
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
      </div>
    );
  };

  const ScaleCard = ({ scale, specs, prediction, isActive }) => (
    <div className={`rounded-xl p-4 border-2 transition-all ${
      isActive ? 'border-blue-500 shadow-lg' : 'border-gray-200'
    }`} style={{ backgroundColor: specs.lightColor }}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: specs.color }}></div>
        <h3 className="font-semibold text-gray-800">{specs.name}</h3>
      </div>
      <div className="text-2xl font-bold mb-2" style={{ color: specs.color }}>
        {prediction.toFixed(3)} <span className="text-sm font-normal">log₁₀</span>
      </div>
      <div className="text-xs text-gray-600 space-y-1">
        <div>Sand length: {specs.sandLength} cm</div>
        <div>Diameter: {specs.diameter} cm</div>
        <div>Operation: {specs.operationTime}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-4 border border-gray-100">
          <h1 className="text-2xl font-bold text-gray-800">Scale-Dependent Removal Predictor</h1>
          <p className="text-sm text-gray-600 mt-1">
            Mini vs Midi scale comparison — Bai, Samari-Kermani et al. (2025) — Thesis Chapter 5
          </p>
          <div className="flex gap-2 mt-3 flex-wrap">
            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Mini: protein-driven</span>
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">Midi: age-driven</span>
            <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">Scale-independent mechanisms</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Panel: Parameters */}
          <div className="lg:col-span-1 space-y-4">
            {/* Presets */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Scenario Presets</h2>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(presets).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => applyPreset(key)}
                    className={`text-left p-2 rounded-lg border transition-all ${
                      activePreset === key
                        ? 'border-blue-500 bg-blue-50'
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

            {/* Biochemical Parameters */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Biochemical Parameters</h2>
              
              <Slider 
                label="Protein" 
                value={protein} 
                setValue={setProtein} 
                min={10} max={300} step={5} 
                unit="µg/g"
              />
              
              <Slider 
                label="Carbohydrate" 
                value={carbohydrate} 
                setValue={setCarbohydrate} 
                min={10} max={200} step={5} 
                unit="µg/g"
              />
              
              <Slider 
                label="Biomass" 
                value={biomass} 
                setValue={setBiomass} 
                min={1e6} max={1e10} step={1e6} 
                unit="copies/g"
                logScale={true}
              />
              
              <div className="mt-2 p-2 bg-green-50 rounded-lg text-xs text-green-700">
                <strong>Mini-scale key:</strong> Protein (r = 0.88 with age)
              </div>
            </div>

            {/* Abiotic Parameters */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Abiotic Parameters</h2>
              
              <Slider 
                label="Schmutzdecke Age" 
                value={sdAge} 
                setValue={setSdAge} 
                min={1} max={400} step={7} 
                unit="days"
              />
              
              <div className="mb-3">
                <label className="text-sm text-gray-700 mb-2 block">Sand Type (D₅₀)</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'fine', label: 'Fine', d50: '0.15 mm' },
                    { key: 'coarse', label: 'Coarse', d50: '0.5 mm' },
                    { key: 'mixed', label: 'Mixed', d50: 'Variable' }
                  ].map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => { setSandType(opt.key); setActivePreset(null); }}
                      className={`p-2 rounded-lg text-xs border-2 transition-all ${
                        sandType === opt.key
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-gray-50 text-gray-600'
                      }`}
                    >
                      <div className="font-semibold">{opt.label}</div>
                      <div className="text-xs opacity-75">{opt.d50}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Inoculated</span>
                <button
                  onClick={() => { setInoculated(!inoculated); setActivePreset(null); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    inoculated ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {inoculated ? 'Yes' : 'No'}
                </button>
              </div>
              
              <div className="mt-3 p-2 bg-blue-50 rounded-lg text-xs text-blue-700">
                <strong>Midi-scale key:</strong> Age (R² = 0.71, biomass correlated)
              </div>
            </div>

            {/* Filter Specifications */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Filter Dimensions</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg" style={{ backgroundColor: filterSpecs.mini.lightColor }}>
                  <div className="text-xs font-semibold" style={{ color: filterSpecs.mini.color }}>Mini-scale</div>
                  <div className="text-xs text-gray-600 mt-1">
                    <div>L: 10 cm</div>
                    <div>Ø: 2.7 cm</div>
                  </div>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: filterSpecs.midi.lightColor }}>
                  <div className="text-xs font-semibold" style={{ color: filterSpecs.midi.color }}>Midi-scale</div>
                  <div className="text-xs text-gray-600 mt-1">
                    <div>L: 52 cm</div>
                    <div>Ø: 10 cm</div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2 italic">
                Scale parameters not significant in combined regression — mechanisms are scale-independent.
              </p>
            </div>
          </div>

          {/* Right Panel: Results */}
          <div className="lg:col-span-2 space-y-4">
            {/* Scale Comparison Cards */}
            <div className="grid grid-cols-2 gap-4">
              <ScaleCard 
                scale="mini" 
                specs={filterSpecs.mini} 
                prediction={bestPredictions.mini}
                isActive={true}
              />
              <ScaleCard 
                scale="midi" 
                specs={filterSpecs.midi} 
                prediction={bestPredictions.midi}
                isActive={true}
              />
            </div>

            {/* Model Comparison Bar Chart */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">All Model Predictions</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={modelComparisonData} margin={{ top: 10, right: 30, left: 10, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    fontSize={10}
                    angle={-20}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis 
                    label={{ value: 'Log₁₀ Removal', angle: -90, position: 'insideLeft', fontSize: 12 }}
                    fontSize={11}
                  />
                  <Tooltip 
                    formatter={(value, name, props) => [
                      `${value.toFixed(3)} log₁₀ (R² = ${props.payload.rSquared})`,
                      'Predicted Removal'
                    ]}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {modelComparisonData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Age vs Removal with Experimental Data */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-sm font-semibold text-gray-700">Age–Removal Relationship</h2>
                <label className="flex items-center gap-2 text-xs">
                  <input 
                    type="checkbox" 
                    checked={showExperimentalData}
                    onChange={(e) => setShowExperimentalData(e.target.checked)}
                    className="rounded"
                  />
                  Show experimental data
                </label>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={ageRemovalData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="age" 
                    label={{ value: 'Schmutzdecke Age (days)', position: 'bottom', offset: 0, fontSize: 12 }}
                    fontSize={11}
                  />
                  <YAxis 
                    label={{ value: 'Log₁₀ Removal', angle: -90, position: 'insideLeft', fontSize: 12 }}
                    fontSize={11}
                    domain={[0, 'auto']}
                  />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'mini') return [`${value.toFixed(3)}`, 'Mini (protein-based)'];
                      if (name === 'midi') return [`${value.toFixed(3)}`, 'Midi (age-based)'];
                      if (name === 'combined') return [`${value.toFixed(3)}`, 'Combined'];
                      return [value, name];
                    }}
                    labelFormatter={(label) => `Age: ${label} days`}
                  />
                  <Legend verticalAlign="top" height={36} />
                  
                  {/* Model lines */}
                  <Line type="monotone" dataKey="mini" stroke="#22c55e" strokeWidth={2} dot={false} name="Mini-scale" />
                  <Line type="monotone" dataKey="midi" stroke="#3b82f6" strokeWidth={2} dot={false} name="Midi-scale" />
                  <Line type="monotone" dataKey="combined" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Combined" />
                  
                  {/* Experimental data points */}
                  {showExperimentalData && (
                    <>
                      <Scatter 
                        data={filteredExperimentalData.filter(d => d.scale === 'mini')}
                        dataKey="removal"
                        fill="#22c55e"
                        shape="circle"
                        name="Mini exp."
                      />
                      <Scatter 
                        data={filteredExperimentalData.filter(d => d.scale === 'midi')}
                        dataKey="removal"
                        fill="#3b82f6"
                        shape="diamond"
                        name="Midi exp."
                      />
                    </>
                  )}
                  
                  <ReferenceLine x={sdAge} stroke="#ef4444" strokeDasharray="5 5" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Biomass vs Removal */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Biomass–Removal Relationship (Midi & Combined)</h2>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={biomassRemovalData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="biomass" 
                    label={{ value: 'Biomass (log₁₀ copies/g)', position: 'bottom', offset: 0, fontSize: 12 }}
                    fontSize={11}
                    tickFormatter={(v) => `10^${v}`}
                  />
                  <YAxis 
                    label={{ value: 'Log₁₀ Removal', angle: -90, position: 'insideLeft', fontSize: 12 }}
                    fontSize={11}
                  />
                  <Tooltip 
                    formatter={(value, name) => [`${value.toFixed(3)}`, name === 'midi' ? 'Midi (biomass)' : 'Combined (biomass)']}
                    labelFormatter={(label) => `Biomass: 10^${label} copies/g`}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <ReferenceLine x={Math.log10(biomass)} stroke="#ef4444" strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="midi" stroke="#60a5fa" strokeWidth={2} dot={false} name="Midi-scale" />
                  <Line type="monotone" dataKey="combined" stroke="#a78bfa" strokeWidth={2} dot={false} name="Combined" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Key Findings */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Scale-Specific Key Predictors</h2>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg border-2" style={{ borderColor: filterSpecs.mini.color, backgroundColor: filterSpecs.mini.lightColor }}>
                  <div className="font-semibold text-sm mb-2" style={{ color: filterSpecs.mini.color }}>Mini-scale</div>
                  <div className="text-xs text-gray-700 space-y-1">
                    <div><strong>Key predictor:</strong> Protein</div>
                    <div><strong>R²:</strong> 0.37</div>
                    <div><strong>Note:</strong> Age-based model not significant (p &gt; 0.05)</div>
                  </div>
                </div>
                <div className="p-3 rounded-lg border-2" style={{ borderColor: filterSpecs.midi.color, backgroundColor: filterSpecs.midi.lightColor }}>
                  <div className="font-semibold text-sm mb-2" style={{ color: filterSpecs.midi.color }}>Midi-scale</div>
                  <div className="text-xs text-gray-700 space-y-1">
                    <div><strong>Key predictor:</strong> Age (or Biomass)</div>
                    <div><strong>R²:</strong> 0.71 (age), 0.35 (biomass)</div>
                    <div><strong>Note:</strong> Protein not significant (minimal variation)</div>
                  </div>
                </div>
                <div className="p-3 rounded-lg border-2 border-purple-400 bg-purple-50">
                  <div className="font-semibold text-sm mb-2 text-purple-700">Combined</div>
                  <div className="text-xs text-gray-700 space-y-1">
                    <div><strong>Key predictor:</strong> Age</div>
                    <div><strong>R²:</strong> 0.70</div>
                    <div><strong>Note:</strong> Scale dimensions not significant</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Thesis Insight */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl shadow-sm p-4 border border-green-200">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">💡 Key Thesis Insight (Chapter 5)</h2>
              <p className="text-sm text-gray-600">
                <strong>Different predictors dominate at different scales due to EPS development dynamics.</strong> At 
                mini-scale (4 months), protein accumulation varies sufficiently to drive removal predictions. At 
                midi-scale (12 months), EPS development is slow and shows minimal temporal variation, making 
                age a more practical (if mechanistically imprecise) proxy. When scales are combined, age emerges 
                as the common predictor, but <strong>scale parameters themselves are not significant</strong> — 
                indicating that retention mechanisms are fundamentally scale-independent.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center text-xs text-gray-500">
          Based on: Bai, X., Samari-Kermani, M., et al. (2025). Consistency and Challenges in Replicating SSF.
          <br />
          PhD Thesis Chapter 5: <em>From Pores to Pilot Filters</em> — Utrecht University
        </div>
      </div>
    </div>
  );
};

export default ScaleDependentPredictor;
