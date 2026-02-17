import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

// SSF Steady-State Removal Model Explorer
// Based on Schijven et al. (2013) two-site kinetic model

const SSFModelExplorer = () => {
  // Hydraulic parameters
  const [velocity, setVelocity] = useState(0.5); // m/day
  const [dispersivity, setDispersivity] = useState(0.005); // m
  const [filterDepth, setFilterDepth] = useState(1.0); // m
  
  // Site 1 parameters (slow detachment - governs removal)
  const [kAtt1, setKAtt1] = useState(50); // day⁻¹
  const [kDet1, setKDet1] = useState(0.1); // day⁻¹
  const [muS1, setMuS1] = useState(0.5); // day⁻¹
  
  // Site 2 parameters (fast detachment - governs tailing)
  const [kAtt2, setKAtt2] = useState(30); // day⁻¹
  const [kDet2, setKDet2] = useState(10); // day⁻¹
  const [muS2, setMuS2] = useState(0.5); // day⁻¹
  
  // Liquid phase inactivation
  const [muL, setMuL] = useState(0.1); // day⁻¹
  
  // UI state
  const [activePreset, setActivePreset] = useState(null);

  // Presets based on typical SSF conditions
  const presets = {
    cleanBed: {
      name: 'Clean Bed (New Filter)',
      params: { velocity: 0.5, dispersivity: 0.005, filterDepth: 1.0, kAtt1: 20, kDet1: 0.5, muS1: 0.3, kAtt2: 15, kDet2: 15, muS2: 0.3, muL: 0.1 },
      description: 'Fresh filter bed without developed Schmutzdecke'
    },
    matureFilter: {
      name: 'Mature Filter (6+ weeks)',
      params: { velocity: 0.5, dispersivity: 0.005, filterDepth: 1.0, kAtt1: 80, kDet1: 0.05, muS1: 0.8, kAtt2: 40, kDet2: 8, muS2: 0.6, muL: 0.1 },
      description: 'Well-ripened filter with active Schmutzdecke'
    },
    dutchSSF: {
      name: 'Dutch Practice (QMRA)',
      params: { velocity: 0.3, dispersivity: 0.008, filterDepth: 0.8, kAtt1: 60, kDet1: 0.1, muS1: 0.5, kAtt2: 35, kDet2: 12, muS2: 0.5, muL: 0.05 },
      description: 'Typical parameters for Dutch waterworks'
    },
    highLoading: {
      name: 'High Hydraulic Loading',
      params: { velocity: 1.2, dispersivity: 0.003, filterDepth: 1.2, kAtt1: 50, kDet1: 0.1, muS1: 0.5, kAtt2: 30, kDet2: 10, muS2: 0.5, muL: 0.1 },
      description: 'Increased flow rate scenario'
    }
  };

  const applyPreset = (presetKey) => {
    const p = presets[presetKey].params;
    setVelocity(p.velocity);
    setDispersivity(p.dispersivity);
    setFilterDepth(p.filterDepth);
    setKAtt1(p.kAtt1);
    setKDet1(p.kDet1);
    setMuS1(p.muS1);
    setKAtt2(p.kAtt2);
    setKDet2(p.kDet2);
    setMuS2(p.muS2);
    setMuL(p.muL);
    setActivePreset(presetKey);
  };

  // Compute effective removal coefficient λ
  const lambda = useMemo(() => {
    const site1Contribution = kAtt1 / (1 + kDet1 / muS1);
    const site2Contribution = kAtt2 / (1 + kDet2 / muS2);
    return muL + site1Contribution + site2Contribution;
  }, [kAtt1, kDet1, muS1, kAtt2, kDet2, muS2, muL]);

  // Compute concentration profile data
  const profileData = useMemo(() => {
    const data = [];
    const numPoints = 100;
    const alphaL = dispersivity;
    const v = velocity;
    
    // Compute the exponent coefficient
    const discriminant = 1 + (4 * alphaL * lambda) / v;
    const exponentCoeff = (1 - Math.sqrt(discriminant)) / (2 * alphaL);
    
    for (let i = 0; i <= numPoints; i++) {
      const x = (i / numPoints) * filterDepth;
      const CoverC0 = Math.exp(exponentCoeff * x);
      const logRemoval = -Math.log10(CoverC0);
      
      data.push({
        depth: x,
        concentration: CoverC0 * 100, // as percentage
        logRemoval: logRemoval,
        lnRatio: Math.log(CoverC0)
      });
    }
    return data;
  }, [velocity, dispersivity, filterDepth, lambda]);

  // Compute key metrics
  const metrics = useMemo(() => {
    const alphaL = dispersivity;
    const v = velocity;
    const discriminant = 1 + (4 * alphaL * lambda) / v;
    const exponentCoeff = (1 - Math.sqrt(discriminant)) / (2 * alphaL);
    
    const effluentRatio = Math.exp(exponentCoeff * filterDepth);
    const totalLogRemoval = -Math.log10(effluentRatio);
    
    // Depth for 2-log removal
    const target2Log = 0.01; // C/C0 = 0.01
    const depth2Log = Math.log(target2Log) / exponentCoeff;
    
    // Depth for 4-log removal
    const target4Log = 0.0001;
    const depth4Log = Math.log(target4Log) / exponentCoeff;
    
    // Site contributions
    const site1Contribution = kAtt1 / (1 + kDet1 / muS1);
    const site2Contribution = kAtt2 / (1 + kDet2 / muS2);
    
    return {
      totalLogRemoval,
      effluentPercent: effluentRatio * 100,
      depth2Log: depth2Log > 0 ? depth2Log : null,
      depth4Log: depth4Log > 0 ? depth4Log : null,
      site1Contribution,
      site2Contribution,
      liquidContribution: muL
    };
  }, [velocity, dispersivity, filterDepth, lambda, kAtt1, kDet1, muS1, kAtt2, kDet2, muS2, muL]);

  // Slider component
  const Slider = ({ label, value, setValue, min, max, step, unit }) => (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700">{label}</span>
        <span className="font-mono text-blue-700">{value.toFixed(step < 0.1 ? 3 : step < 1 ? 2 : 1)} {unit}</span>
      </div>
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
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <h1 className="text-xl font-bold text-gray-800">SSF Steady-State Removal Model</h1>
          <p className="text-sm text-gray-600 mt-1">
            Two-site kinetic model based on Schijven et al. (2013) — Interactive concentration profile explorer
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Parameters Panel */}
          <div className="lg:col-span-1 space-y-4">
            {/* Presets */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Scenario Presets</h2>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(presets).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => applyPreset(key)}
                    className={`text-xs p-2 rounded border transition-colors ${
                      activePreset === key
                        ? 'bg-blue-100 border-blue-400 text-blue-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
              {activePreset && (
                <p className="text-xs text-gray-500 mt-2 italic">
                  {presets[activePreset].description}
                </p>
              )}
            </div>

            {/* Hydraulic Parameters */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Hydraulic Parameters</h2>
              <Slider label="Pore velocity (v)" value={velocity} setValue={setVelocity} min={0.1} max={2.0} step={0.05} unit="m/d" />
              <Slider label="Dispersivity (αL)" value={dispersivity} setValue={setDispersivity} min={0.001} max={0.02} step={0.001} unit="m" />
              <Slider label="Filter depth (L)" value={filterDepth} setValue={setFilterDepth} min={0.3} max={1.5} step={0.05} unit="m" />
            </div>

            {/* Site 1 Parameters */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">Site 1 — Slow Detachment</h2>
              <p className="text-xs text-gray-500 mb-3">Governs primary removal</p>
              <Slider label="Attachment rate (katt,1)" value={kAtt1} setValue={setKAtt1} min={5} max={150} step={1} unit="d⁻¹" />
              <Slider label="Detachment rate (kdet,1)" value={kDet1} setValue={setKDet1} min={0.01} max={2} step={0.01} unit="d⁻¹" />
              <Slider label="Solid inactivation (μs,1)" value={muS1} setValue={setMuS1} min={0.1} max={1.5} step={0.05} unit="d⁻¹" />
            </div>

            {/* Site 2 Parameters */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">Site 2 — Fast Detachment</h2>
              <p className="text-xs text-gray-500 mb-3">Governs tailing behaviour</p>
              <Slider label="Attachment rate (katt,2)" value={kAtt2} setValue={setKAtt2} min={5} max={100} step={1} unit="d⁻¹" />
              <Slider label="Detachment rate (kdet,2)" value={kDet2} setValue={setKDet2} min={1} max={50} step={0.5} unit="d⁻¹" />
              <Slider label="Solid inactivation (μs,2)" value={muS2} setValue={setMuS2} min={0.1} max={1.5} step={0.05} unit="d⁻¹" />
            </div>

            {/* Liquid Phase */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Liquid Phase</h2>
              <Slider label="Inactivation rate (μl)" value={muL} setValue={setMuL} min={0} max={0.5} step={0.01} unit="d⁻¹" />
            </div>
          </div>

          {/* Visualisation Panel */}
          <div className="lg:col-span-2 space-y-4">
            {/* Key Metrics */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Model Output</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded p-3">
                  <div className="text-xs text-blue-600 mb-1">Effective λ</div>
                  <div className="text-lg font-bold text-blue-800">{lambda.toFixed(2)} d⁻¹</div>
                </div>
                <div className="bg-green-50 rounded p-3">
                  <div className="text-xs text-green-600 mb-1">Total Log Removal</div>
                  <div className="text-lg font-bold text-green-800">{metrics.totalLogRemoval.toFixed(2)}</div>
                </div>
                <div className="bg-amber-50 rounded p-3">
                  <div className="text-xs text-amber-600 mb-1">Effluent C/C₀</div>
                  <div className="text-lg font-bold text-amber-800">{metrics.effluentPercent.toExponential(2)}</div>
                </div>
                <div className="bg-purple-50 rounded p-3">
                  <div className="text-xs text-purple-600 mb-1">Depth for 2-log</div>
                  <div className="text-lg font-bold text-purple-800">
                    {metrics.depth2Log && metrics.depth2Log <= filterDepth * 2 
                      ? `${metrics.depth2Log.toFixed(2)} m` 
                      : '> range'}
                  </div>
                </div>
              </div>
              
              {/* Lambda breakdown */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="text-xs text-gray-600 mb-2">Contribution to λ:</div>
                <div className="flex gap-4 text-xs">
                  <span className="text-blue-600">Site 1: {metrics.site1Contribution.toFixed(2)} d⁻¹ ({((metrics.site1Contribution/lambda)*100).toFixed(0)}%)</span>
                  <span className="text-green-600">Site 2: {metrics.site2Contribution.toFixed(2)} d⁻¹ ({((metrics.site2Contribution/lambda)*100).toFixed(0)}%)</span>
                  <span className="text-amber-600">Liquid: {metrics.liquidContribution.toFixed(2)} d⁻¹ ({((metrics.liquidContribution/lambda)*100).toFixed(0)}%)</span>
                </div>
              </div>
            </div>

            {/* Concentration Profile Chart */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Concentration Profile — C(x)/C₀</h2>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={profileData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="depth" 
                    label={{ value: 'Filter Depth (m)', position: 'bottom', offset: 0, fontSize: 12 }}
                    tickFormatter={(v) => v.toFixed(2)}
                    fontSize={11}
                  />
                  <YAxis 
                    label={{ value: 'C/C₀ (%)', angle: -90, position: 'insideLeft', offset: 10, fontSize: 12 }}
                    domain={[0, 100]}
                    tickFormatter={(v) => v.toFixed(0)}
                    fontSize={11}
                  />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'concentration' ? `${value.toFixed(2)}%` : value.toFixed(3),
                      name === 'concentration' ? 'C/C₀' : name
                    ]}
                    labelFormatter={(label) => `Depth: ${label.toFixed(3)} m`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="concentration" 
                    stroke="#2563eb" 
                    strokeWidth={2.5}
                    dot={false}
                    name="concentration"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Log Removal Chart */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Log₁₀ Removal vs Depth</h2>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={profileData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="depth" 
                    label={{ value: 'Filter Depth (m)', position: 'bottom', offset: 0, fontSize: 12 }}
                    tickFormatter={(v) => v.toFixed(2)}
                    fontSize={11}
                  />
                  <YAxis 
                    label={{ value: '-log₁₀(C/C₀)', angle: -90, position: 'insideLeft', offset: 10, fontSize: 12 }}
                    domain={[0, 'auto']}
                    tickFormatter={(v) => v.toFixed(1)}
                    fontSize={11}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value.toFixed(3)}`, 'Log Removal']}
                    labelFormatter={(label) => `Depth: ${label.toFixed(3)} m`}
                  />
                  <ReferenceLine y={2} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: '2-log', position: 'right', fontSize: 10, fill: '#f59e0b' }} />
                  <ReferenceLine y={4} stroke="#ef4444" strokeDasharray="5 5" label={{ value: '4-log', position: 'right', fontSize: 10, fill: '#ef4444' }} />
                  <Line 
                    type="monotone" 
                    dataKey="logRemoval" 
                    stroke="#059669" 
                    strokeWidth={2.5}
                    dot={false}
                    name="logRemoval"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Equation Display */}
            <div className="bg-gray-800 rounded-lg shadow-sm p-4 text-white">
              <h2 className="text-sm font-semibold mb-3">Governing Equations</h2>
              <div className="space-y-3 font-mono text-sm">
                <div>
                  <span className="text-gray-400">Effective removal coefficient:</span>
                  <div className="mt-1 text-green-300">
                    λ = μₗ + k<sub>att,1</sub>/(1 + k<sub>det,1</sub>/μ<sub>s,1</sub>) + k<sub>att,2</sub>/(1 + k<sub>det,2</sub>/μ<sub>s,2</sub>)
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">Steady-state solution (Schijven et al., 2013 Eq. 4):</span>
                  <div className="mt-1 text-blue-300">
                    ln(C/C₀) = [(1 − √(1 + 4α<sub>L</sub>λ/v)) / (2α<sub>L</sub>)] · x
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center text-xs text-gray-500">
          Based on: Schijven et al. (2013) — Removal of microorganisms by slow sand filtration. 
          PhD Thesis: <em>From Pores to Pilot Filters: Biofilm-Driven Bacterial Removal in Slow Sand Filtration</em>
        </div>
      </div>
    </div>
  );
};

export default SSFModelExplorer;
