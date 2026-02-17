import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell, ReferenceLine } from 'recharts';

// Extended CFT Calculator
// Based on: Samari-Kermani et al. (2025) - From Roughness to Occlusion: 
// Image-Informed Extended Colloid Filtration Theory for Biofilm-Laden Porous Media

const ExtendedCFTCalculator = () => {
  // ============== STATE ==============
  // System-wide hydraulic properties
  const [porosity, setPorosity] = useState(0.26);           // θ [-]
  const [hydraulicCond, setHydraulicCond] = useState(0.68); // HC (normalized) [-]
  const [tortuosity, setTortuosity] = useState(1.25);       // τ [-]
  
  // Morphological descriptor
  const [svr, setSvr] = useState(0.21);                     // Surface-to-Volume Ratio [μm⁻¹]
  
  // UI state
  const [activePreset, setActivePreset] = useState(null);

  // ============== REGRESSION COEFFICIENTS (Table 6, Eq. 31) ==============
  const coefficients = {
    beta0: 18.33,    // Intercept
    beta1: -13.29,   // Porosity (θ)
    beta2: -15.34,   // Hydraulic Conductivity (HC)
    beta3: -10.12,   // Tortuosity (τ)
    beta4: -0.11,    // Surface-to-Volume Ratio (SVR)
    rSquared: 0.98
  };

  // ============== BIOFILM STAGE PRESETS (from experimental data) ==============
  const presets = {
    clean: {
      name: 'Clean Bed',
      stage: 'Stage 0',
      params: { porosity: 0.35, hydraulicCond: 1.0, tortuosity: 1.15, svr: 0.0 },
      description: 'No biofilm present — classical CFT baseline',
      color: '#3b82f6',
      days: 0
    },
    young: {
      name: 'Young Biofilm',
      stage: 'Stage 1 (1-day)',
      params: { porosity: 0.26, hydraulicCond: 0.68, tortuosity: 1.25, svr: 0.21 },
      description: 'Early roughening — η₁ dominates (crevice/roughness effects)',
      color: '#22c55e',
      days: 1
    },
    matured: {
      name: 'Matured Biofilm',
      stage: 'Stage 2 (2.5-day)',
      params: { porosity: 0.15, hydraulicCond: 0.46, tortuosity: 1.46, svr: 0.44 },
      description: 'Network formation — η₂ active (retention vs channelization)',
      color: '#f59e0b',
      days: 2.5
    },
    fullyMatured: {
      name: 'Fully Matured',
      stage: 'Stage 3 (7-day)',
      params: { porosity: 0.05, hydraulicCond: 0.0009, tortuosity: 1.24, svr: 1.0 },
      description: 'Occlusion/straining — η₃ dominates (pore blocking)',
      color: '#ef4444',
      days: 7
    }
  };

  const applyPreset = (presetKey) => {
    const p = presets[presetKey].params;
    setPorosity(p.porosity);
    setHydraulicCond(p.hydraulicCond);
    setTortuosity(p.tortuosity);
    setSvr(p.svr);
    setActivePreset(presetKey);
  };

  // ============== CALCULATIONS ==============
  
  // Extended CFT: λ from regression model (Eq. 31)
  const lambdaExtended = useMemo(() => {
    const { beta0, beta1, beta2, beta3, beta4 } = coefficients;
    return beta0 + beta1 * porosity + beta2 * hydraulicCond + beta3 * tortuosity + beta4 * svr;
  }, [porosity, hydraulicCond, tortuosity, svr]);

  // Parameter contributions to λ
  const contributions = useMemo(() => {
    const { beta0, beta1, beta2, beta3, beta4 } = coefficients;
    const porosityContrib = beta1 * porosity;
    const hcContrib = beta2 * hydraulicCond;
    const tortuosityContrib = beta3 * tortuosity;
    const svrContrib = beta4 * svr;
    const total = beta0 + porosityContrib + hcContrib + tortuosityContrib + svrContrib;
    
    return {
      intercept: { value: beta0, percent: (beta0 / total) * 100, label: 'Baseline (β₀)' },
      porosity: { value: porosityContrib, percent: (Math.abs(porosityContrib) / Math.abs(total)) * 100, label: 'Porosity (θ)' },
      hydraulicCond: { value: hcContrib, percent: (Math.abs(hcContrib) / Math.abs(total)) * 100, label: 'Hyd. Cond. (HC)' },
      tortuosity: { value: tortuosityContrib, percent: (Math.abs(tortuosityContrib) / Math.abs(total)) * 100, label: 'Tortuosity (τ)' },
      svr: { value: svrContrib, percent: (Math.abs(svrContrib) / Math.abs(total)) * 100, label: 'SVR' }
    };
  }, [porosity, hydraulicCond, tortuosity, svr]);

  // Clean-bed baseline: regression with θ₀=0.35, HC₀=1.0, τ₀=1.15, SVR₀=0
  const cleanBedLambda = useMemo(() => {
    const { beta0, beta1, beta2, beta3, beta4 } = coefficients;
    return beta0 + beta1 * 0.35 + beta2 * 1.0 + beta3 * 1.15 + beta4 * 0.0;
  }, []);

  // Derived removal metrics
  const removalMetrics = useMemo(() => {
    const log10Removal = Math.max(0, lambdaExtended / Math.LN10);
    const percentRemoval = lambdaExtended > 0 ? (1 - Math.exp(-lambdaExtended)) * 100 : 0;
    const cleanBedLog10 = Math.max(0, cleanBedLambda / Math.LN10);
    const enhancementRatio = cleanBedLambda > 0 ? lambdaExtended / cleanBedLambda : Infinity;
    return { log10Removal, percentRemoval, cleanBedLog10, enhancementRatio };
  }, [lambdaExtended, cleanBedLambda]);

  // Porosity sensitivity data: how removal changes as porosity decreases (biofilm grows)
  const porositySensitivity = useMemo(() => {
    const data = [];
    const { beta0, beta1, beta2, beta3, beta4 } = coefficients;
    for (let theta = 0.35; theta >= 0.02; theta -= 0.01) {
      const lambda = beta0 + beta1 * theta + beta2 * hydraulicCond + beta3 * tortuosity + beta4 * svr;
      const log10 = Math.max(0, lambda / Math.LN10);
      data.push({
        porosity: theta,
        lnRemoval: Math.max(0, lambda),
        log10Removal: log10
      });
    }
    return data;
  }, [hydraulicCond, tortuosity, svr]);

  // Biofilm stage comparison data
  const stageComparison = useMemo(() => {
    return Object.entries(presets).map(([key, preset]) => {
      const p = preset.params;
      const { beta0, beta1, beta2, beta3, beta4 } = coefficients;
      const lambda = beta0 + beta1 * p.porosity + beta2 * p.hydraulicCond + beta3 * p.tortuosity + beta4 * p.svr;
      return {
        name: preset.name,
        stage: preset.stage,
        days: preset.days,
        lambda: lambda,
        porosity: p.porosity,
        color: preset.color
      };
    });
  }, []);

  // Contribution bar chart data
  const contributionData = useMemo(() => {
    return [
      { name: 'β₀', value: coefficients.beta0, fill: '#6366f1' },
      { name: 'θ', value: contributions.porosity.value, fill: '#3b82f6' },
      { name: 'HC', value: contributions.hydraulicCond.value, fill: '#22c55e' },
      { name: 'τ', value: contributions.tortuosity.value, fill: '#f59e0b' },
      { name: 'SVR', value: contributions.svr.value, fill: '#ef4444' }
    ];
  }, [contributions]);

  // ============== UI COMPONENTS ==============
  
  const Slider = ({ label, value, setValue, min, max, step, unit, description }) => (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700 font-medium">{label}</span>
        <span className="font-mono text-blue-700 font-semibold">
          {value.toFixed(step < 0.01 ? 4 : step < 0.1 ? 2 : 2)} {unit}
        </span>
      </div>
      {description && <p className="text-xs text-gray-500 mb-2">{description}</p>}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => {
          setValue(parseFloat(e.target.value));
          setActivePreset(null);
        }}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );

  const MetricCard = ({ title, value, unit, subtitle, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      amber: 'bg-amber-50 text-amber-600 border-amber-200',
      red: 'bg-red-50 text-red-600 border-red-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200'
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-4 border border-gray-100">
          <h1 className="text-2xl font-bold text-gray-800">Extended Colloid Filtration Theory Calculator</h1>
          <p className="text-sm text-gray-600 mt-1">
            Image-informed model for biofilm-laden porous media — Samari-Kermani et al. (2025)
          </p>
          <div className="flex gap-2 mt-3">
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">Pore-scale imaging</span>
            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">R² = 0.98</span>
            <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">4 biofilm stages</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Panel: Parameters */}
          <div className="lg:col-span-1 space-y-4">
            {/* Biofilm Stage Presets */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Biofilm Development Stage</h2>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(presets).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => applyPreset(key)}
                    className={`text-left p-3 rounded-lg border-2 transition-all ${
                      activePreset === key
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.color }}></div>
                      <span className="text-xs font-semibold text-gray-700">{preset.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">{preset.stage}</span>
                  </button>
                ))}
              </div>
              {activePreset && (
                <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 italic">{presets[activePreset].description}</p>
                </div>
              )}
            </div>

            {/* System-Wide Hydraulic Properties */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">System-Wide Hydraulic Properties</h2>
              
              <Slider 
                label="Porosity (θ)" 
                value={porosity} 
                setValue={setPorosity} 
                min={0.02} max={0.45} step={0.01} 
                unit="–"
                description="Available pore space fraction"
              />
              
              <Slider 
                label="Hydraulic Conductivity (HC)" 
                value={hydraulicCond} 
                setValue={setHydraulicCond} 
                min={0.0001} max={1.0} step={0.01} 
                unit="–"
                description="Normalized flow capacity (0–1)"
              />
              
              <Slider 
                label="Tortuosity (τ)" 
                value={tortuosity} 
                setValue={setTortuosity} 
                min={1.0} max={2.0} step={0.01} 
                unit="–"
                description="Path length complexity (≥1)"
              />
            </div>

            {/* Morphological Descriptor */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Biofilm Morphology</h2>
              
              <Slider 
                label="Surface-to-Volume Ratio (SVR)" 
                value={svr} 
                setValue={setSvr} 
                min={0} max={1.5} step={0.01} 
                unit="μm⁻¹"
                description="Biofilm structure compactness"
              />
              
              <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-xs text-amber-800">
                  <strong>Note:</strong> Higher SVR can indicate compaction that increases total surface 
                  but reduces contacted surface (negative coefficient β₄ = {coefficients.beta4}).
                </p>
              </div>
            </div>

          </div>

          {/* Right Panel: Results */}
          <div className="lg:col-span-2 space-y-4">
            {/* Key Metrics */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Model Output</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MetricCard
                  title="−ln(C/C₀)"
                  value={lambdaExtended.toFixed(2)}
                  unit=""
                  subtitle="Natural log removal"
                  color="blue"
                />
                <MetricCard
                  title="Log₁₀ Removal"
                  value={removalMetrics.log10Removal.toFixed(2)}
                  unit=""
                  subtitle="= −ln(C/C₀) / 2.303"
                  color="green"
                />
                <MetricCard
                  title="% Removal"
                  value={removalMetrics.percentRemoval.toFixed(1)}
                  unit="%"
                  subtitle="1 − C/C₀"
                  color="amber"
                />
                <MetricCard
                  title="vs Clean Bed"
                  value={removalMetrics.enhancementRatio > 0 && isFinite(removalMetrics.enhancementRatio) ? removalMetrics.enhancementRatio.toFixed(1) : '—'}
                  unit="×"
                  subtitle={`Clean bed: ${cleanBedLambda.toFixed(1)}`}
                  color="purple"
                />
              </div>
            </div>

            {/* Parameter Contributions */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Parameter Contributions to −ln(C/C₀)</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={contributionData} layout="vertical" margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" fontSize={11} />
                  <YAxis dataKey="name" type="category" fontSize={11} width={40} />
                  <Tooltip 
                    formatter={(value) => [`${value.toFixed(2)}`, 'Contribution']}
                    contentStyle={{ fontSize: '12px' }}
                  />
                  <ReferenceLine x={0} stroke="#94a3b8" />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {contributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-2 grid grid-cols-5 gap-2 text-xs">
                <div className="text-center">
                  <div className="font-mono text-indigo-600">{coefficients.beta0.toFixed(2)}</div>
                  <div className="text-gray-500">Baseline</div>
                </div>
                <div className="text-center">
                  <div className="font-mono text-blue-600">{contributions.porosity.value.toFixed(2)}</div>
                  <div className="text-gray-500">θ effect</div>
                </div>
                <div className="text-center">
                  <div className="font-mono text-green-600">{contributions.hydraulicCond.value.toFixed(2)}</div>
                  <div className="text-gray-500">HC effect</div>
                </div>
                <div className="text-center">
                  <div className="font-mono text-amber-600">{contributions.tortuosity.value.toFixed(2)}</div>
                  <div className="text-gray-500">τ effect</div>
                </div>
                <div className="text-center">
                  <div className="font-mono text-red-600">{contributions.svr.value.toFixed(2)}</div>
                  <div className="text-gray-500">SVR effect</div>
                </div>
              </div>
            </div>

            {/* Biofilm Stage Comparison */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Removal Coefficient Across Biofilm Stages</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stageComparison} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    fontSize={11}
                    angle={-15}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis
                    label={{ value: '−ln(C/C₀)', angle: -90, position: 'insideLeft', fontSize: 12 }}
                    fontSize={11}
                  />
                  <Tooltip
                    formatter={(value, name, props) => [
                      `${value.toFixed(2)} (${(Math.max(0, value) / Math.LN10).toFixed(2)} log₁₀)`,
                      `${props.payload.stage}`
                    ]}
                    labelFormatter={(label) => label}
                  />
                  <Bar dataKey="lambda" radius={[4, 4, 0, 0]}>
                    {stageComparison.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                  {activePreset && (
                    <ReferenceLine 
                      y={lambdaExtended} 
                      stroke="#1e40af" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      label={{ value: 'Current', position: 'right', fontSize: 10, fill: '#1e40af' }}
                    />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Porosity Sensitivity */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Removal vs Porosity (Biofilm Growth Effect)</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={porositySensitivity} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="porosity"
                    label={{ value: 'Porosity (θ) — decreases as biofilm grows →', position: 'bottom', offset: 0, fontSize: 12 }}
                    fontSize={11}
                    reversed
                    tickFormatter={(v) => v.toFixed(2)}
                  />
                  <YAxis
                    label={{ value: 'Log₁₀ Removal', angle: -90, position: 'insideLeft', fontSize: 12 }}
                    fontSize={11}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      `${value.toFixed(2)}`,
                      name === 'log10Removal' ? 'Log₁₀ removal' : '−ln(C/C₀)'
                    ]}
                    labelFormatter={(label) => `θ = ${parseFloat(label).toFixed(2)}`}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <ReferenceLine x={porosity} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'Current θ', position: 'top', fontSize: 10, fill: '#ef4444' }} />
                  <Line
                    type="monotone"
                    dataKey="log10Removal"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    dot={false}
                    name="Log₁₀ removal"
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-2 text-xs text-gray-500 text-center">
                As biofilm grows, porosity decreases and removal increases non-linearly due to combined θ, HC, and τ effects.
              </div>
            </div>

            {/* Governing Equation */}
            <div className="bg-gray-800 rounded-xl shadow-sm p-4 text-white">
              <h2 className="text-sm font-semibold mb-3">Governing Equation (Eq. 31)</h2>
              <div className="font-mono text-sm space-y-2">
                <div className="text-blue-300">
                  −ln(C/C₀) = β₀ + β₁·θ + β₂·HC + β₃·τ + β₄·SVR
                </div>
                <div className="text-gray-400 text-xs mt-3">Fitted coefficients:</div>
                <div className="grid grid-cols-5 gap-2 text-xs">
                  <div className="bg-gray-700 rounded p-2 text-center">
                    <div className="text-indigo-300">β₀</div>
                    <div className="font-bold">{coefficients.beta0}</div>
                  </div>
                  <div className="bg-gray-700 rounded p-2 text-center">
                    <div className="text-blue-300">β₁ (θ)</div>
                    <div className="font-bold">{coefficients.beta1}</div>
                  </div>
                  <div className="bg-gray-700 rounded p-2 text-center">
                    <div className="text-green-300">β₂ (HC)</div>
                    <div className="font-bold">{coefficients.beta2}</div>
                  </div>
                  <div className="bg-gray-700 rounded p-2 text-center">
                    <div className="text-amber-300">β₃ (τ)</div>
                    <div className="font-bold">{coefficients.beta3}</div>
                  </div>
                  <div className="bg-gray-700 rounded p-2 text-center">
                    <div className="text-red-300">β₄ (SVR)</div>
                    <div className="font-bold">{coefficients.beta4}</div>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-700">
                <div className="text-xs text-gray-400">
                  <strong>Key insight:</strong> Dynamic hydraulic properties (θ, HC, τ) outperform chronological 
                  age as predictors of biofilm state. SVR reflects compaction-driven obstruction (negative coefficient).
                </div>
              </div>
            </div>

            {/* Three Biofilm Efficiencies */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Biofilm-Specific Collector Efficiencies (η₁–η₃)</h2>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-green-700 font-semibold text-sm mb-1">η₁ — Roughness</div>
                  <div className="text-xs text-green-600">
                    Geometric trapping, local impaction, crevice retention. Dominates in <strong>early stages</strong>.
                    <div className="mt-2 font-mono text-green-800">n ≈ 0.95 &gt; 0</div>
                  </div>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="text-amber-700 font-semibold text-sm mb-1">η₂ — Network</div>
                  <div className="text-xs text-amber-600">
                    Intra-biofilm retention vs channelization. Active in <strong>mid-stages</strong>.
                    <div className="mt-2 font-mono text-amber-800">m ≈ −0.42 &lt; 0</div>
                  </div>
                </div>
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-red-700 font-semibold text-sm mb-1">η₃ — Occlusion</div>
                  <div className="text-xs text-red-600">
                    Pore blocking, straining as pores constrict. Dominates in <strong>late stages</strong>.
                    <div className="mt-2 font-mono text-red-800">p ≈ 0.24 &gt; 0</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center text-xs text-gray-500">
          Based on: Samari-Kermani, M., Schijven, J.F., de Vries, E.T., & Raoof, A. (2025). 
          <em> From Roughness to Occlusion: Image-Informed Extended Colloid Filtration Theory for Biofilm-Laden Porous Media.</em>
          <br />
          PhD Thesis Chapter 3: <em>From Pores to Pilot Filters</em> — Utrecht University
        </div>
      </div>
    </div>
  );
};

export default ExtendedCFTCalculator;
