import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell, ReferenceLine } from 'recharts';

// Tufenkji-Elimelech (2004) Single-Collector Contact Efficiency Calculator
// Reference: Tufenkji, N. & Elimelech, M. (2004). Environ. Sci. Technol., 38(2), 529-536.

const TufenkjiElimelech = () => {
  // ============== PHYSICAL CONSTANTS ==============
  const kB = 1.38065e-23;  // Boltzmann constant [J/K]
  const g = 9.81;           // Gravitational acceleration [m/s²]

  // ============== STATE ==============
  const [dp, setDp] = useState(1.0);           // Particle diameter [µm]
  const [dc, setDc] = useState(0.5);           // Collector diameter [mm]
  const [velocity, setVelocity] = useState(0.5); // Darcy velocity [m/h]
  const [porosity, setPorosity] = useState(0.4);  // Bed porosity [-]
  const [rhoP, setRhoP] = useState(1050);      // Particle density [kg/m³]
  const [temp, setTemp] = useState(20);         // Temperature [°C]
  const [hamaker, setHamaker] = useState(1.0);  // Hamaker constant [×10⁻²⁰ J]
  const [alpha, setAlpha] = useState(0.1);      // Sticking efficiency [-]

  const [activePreset, setActivePreset] = useState(null);

  // ============== PRESETS ==============
  const presets = {
    bacteria: {
      name: 'E. coli (Fine Sand)',
      params: { dp: 1.0, dc: 0.2, velocity: 0.5, porosity: 0.4, rhoP: 1050, temp: 20, hamaker: 1.0, alpha: 0.1 },
      description: 'Typical bacteria capture in fine-grained SSF',
      color: '#06b6d4'
    },
    virus: {
      name: 'Virus (50 nm)',
      params: { dp: 0.05, dc: 0.2, velocity: 0.5, porosity: 0.4, rhoP: 1200, temp: 20, hamaker: 1.0, alpha: 0.01 },
      description: 'Diffusion-dominated regime — very small particles',
      color: '#8b5cf6'
    },
    coarseSand: {
      name: 'Coarse Sand (0.5 mm)',
      params: { dp: 1.0, dc: 0.5, velocity: 0.5, porosity: 0.4, rhoP: 1050, temp: 20, hamaker: 1.0, alpha: 0.1 },
      description: 'Larger grains reduce collection efficiency',
      color: '#f59e0b'
    },
    highFlow: {
      name: 'High Flow Rate',
      params: { dp: 1.0, dc: 0.2, velocity: 1.8, porosity: 0.4, rhoP: 1050, temp: 20, hamaker: 1.0, alpha: 0.1 },
      description: 'Increased velocity reduces contact time',
      color: '#ef4444'
    }
  };

  const applyPreset = (key) => {
    const p = presets[key].params;
    setDp(p.dp); setDc(p.dc); setVelocity(p.velocity); setPorosity(p.porosity);
    setRhoP(p.rhoP); setTemp(p.temp); setHamaker(p.hamaker); setAlpha(p.alpha);
    setActivePreset(key);
  };

  // ============== CORE TE CALCULATION ==============
  const computeTE = (dpM, dcM, U, f, rhoParticle, T_K, A) => {
    // Fluid properties from temperature
    const mu = 2.414e-5 * Math.pow(10, 247.8 / (T_K - 140)); // Dynamic viscosity [Pa·s]
    const rhoF = 1000 * (1 - Math.pow(T_K - 273.15 - 4, 2) / 180000); // Water density [kg/m³]

    // Stokes-Einstein diffusion coefficient
    const D_inf = kB * T_K / (3 * Math.PI * mu * dpM);

    // Happel parameter
    const gamma = Math.pow(1 - f, 1 / 3);
    const As = 2 * (1 - Math.pow(gamma, 5)) / (2 - 3 * gamma + 3 * Math.pow(gamma, 5) - 2 * Math.pow(gamma, 6));

    // Dimensionless numbers
    const NR = dpM / dcM;
    const NPe = U * dcM / D_inf;
    const NvdW = A / (kB * T_K);
    const NG = (2 / 9) * (rhoParticle - rhoF) * g * Math.pow(dpM, 2) / (mu * U);
    const NA = A / (12 * Math.PI * mu * Math.pow(dpM, 2) * U);

    // TE correlation (Eq. 17)
    const etaD = 2.4 * Math.pow(As, 1 / 3) * Math.pow(NR, -0.081) * Math.pow(NPe, -0.715) * Math.pow(NvdW, 0.052);
    const etaI = 0.55 * As * Math.pow(NR, 1.675) * Math.pow(NA, 0.125);
    const etaG = 0.22 * Math.pow(NR, -0.24) * Math.pow(NG, 1.11) * Math.pow(NvdW, 0.053);
    const eta0 = etaD + etaI + etaG;

    return { D_inf, As, gamma, NR, NPe, NvdW, NG, NA, etaD, etaI, etaG, eta0, mu, rhoF };
  };

  // ============== MAIN RESULT ==============
  const teResults = useMemo(() => {
    const dpM = dp * 1e-6;        // µm → m
    const dcM = dc * 1e-3;        // mm → m
    const U = velocity / 3600;     // m/h → m/s
    const T_K = temp + 273.15;     // °C → K
    const A = hamaker * 1e-20;     // ×10⁻²⁰ J → J

    const res = computeTE(dpM, dcM, U, porosity, rhoP, T_K, A);

    // Filter-scale removal
    const katt = (3 / 2) * ((1 - porosity) / dcM) * U * alpha * res.eta0;
    const L = 0.8; // m
    const logRemoval = (3 / 2) * ((1 - porosity) / dcM) * (L / Math.LN10) * alpha * res.eta0;

    // Dominant mechanism
    const dominant = res.etaD >= res.etaI && res.etaD >= res.etaG ? 'Diffusion'
      : res.etaI >= res.etaG ? 'Interception' : 'Gravity';

    // Validity checks
    const validNR = res.NR >= 0.01 && res.NR <= 0.1;
    const validNPe = res.NPe >= 1e2 && res.NPe <= 1e7;
    const isValid = validNR && validNPe;

    return { ...res, katt, logRemoval, dominant, validNR, validNPe, isValid };
  }, [dp, dc, velocity, porosity, rhoP, temp, hamaker, alpha]);

  // ============== PARTICLE SIZE SWEEP ==============
  const particleSizeSweep = useMemo(() => {
    const dcM = dc * 1e-3;
    const U = velocity / 3600;
    const T_K = temp + 273.15;
    const A = hamaker * 1e-20;
    const data = [];

    // Log-spaced points from 0.01 to 10 µm
    for (let exp = -2; exp <= 1; exp += 0.05) {
      const dpUm = Math.pow(10, exp);
      const dpM = dpUm * 1e-6;
      const res = computeTE(dpM, dcM, U, porosity, rhoP, T_K, A);
      data.push({
        dp: parseFloat(dpUm.toFixed(4)),
        etaD: res.etaD,
        etaI: res.etaI,
        etaG: res.etaG,
        eta0: res.eta0
      });
    }
    return data;
  }, [dc, velocity, porosity, rhoP, temp, hamaker]);

  // ============== VELOCITY SWEEP ==============
  const velocitySweep = useMemo(() => {
    const dpM = dp * 1e-6;
    const dcM = dc * 1e-3;
    const T_K = temp + 273.15;
    const A = hamaker * 1e-20;
    const data = [];

    for (let v = 0.05; v <= 5.0; v += 0.1) {
      const U = v / 3600;
      const res = computeTE(dpM, dcM, U, porosity, rhoP, T_K, A);
      data.push({
        velocity: parseFloat(v.toFixed(2)),
        etaD: res.etaD,
        etaI: res.etaI,
        etaG: res.etaG,
        eta0: res.eta0
      });
    }
    return data;
  }, [dp, dc, porosity, rhoP, temp, hamaker]);

  // ============== MECHANISM BREAKDOWN DATA ==============
  const mechanismData = useMemo(() => {
    const total = teResults.eta0;
    if (total === 0) return [];
    return [
      { name: 'Diffusion (η_D)', value: teResults.etaD, percent: (teResults.etaD / total * 100), color: '#3b82f6' },
      { name: 'Interception (η_I)', value: teResults.etaI, percent: (teResults.etaI / total * 100), color: '#22c55e' },
      { name: 'Gravity (η_G)', value: teResults.etaG, percent: (teResults.etaG / total * 100), color: '#f59e0b' }
    ];
  }, [teResults]);

  // ============== UI COMPONENTS ==============
  const Slider = ({ label, value, setValue, min, max, step, unit, description }) => (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700 font-medium">{label}</span>
        <span className="font-mono text-cyan-700 font-semibold">
          {typeof value === 'number' && step < 0.01 ? value.toExponential(2) : value} {unit}
        </span>
      </div>
      {description && <p className="text-xs text-gray-500 mb-1">{description}</p>}
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={(e) => { setValue(parseFloat(e.target.value)); setActivePreset(null); }}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
      />
      <div className="flex justify-between text-xs text-gray-400 mt-0.5">
        <span>{min}</span><span>{max}</span>
      </div>
    </div>
  );

  const MetricCard = ({ title, value, unit, subtitle, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      amber: 'bg-amber-50 text-amber-600 border-amber-200',
      red: 'bg-red-50 text-red-600 border-red-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      cyan: 'bg-cyan-50 text-cyan-600 border-cyan-200'
    };
    return (
      <div className={`rounded-lg p-3 border ${colorClasses[color] || colorClasses.blue}`}>
        <div className="text-xs font-medium mb-1">{title}</div>
        <div className="text-xl font-bold">{value} <span className="text-sm font-normal">{unit}</span></div>
        {subtitle && <div className="text-xs mt-1 opacity-75">{subtitle}</div>}
      </div>
    );
  };

  const formatSci = (val, digits = 2) => {
    if (val === 0) return '0';
    if (Math.abs(val) >= 0.01 && Math.abs(val) < 1000) return val.toFixed(digits);
    return val.toExponential(digits);
  };

  // ============== RENDER ==============
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-4 border border-gray-100">
          <h1 className="text-2xl font-bold text-gray-800">Tufenkji-Elimelech Single-Collector Efficiency</h1>
          <p className="text-sm text-gray-600 mt-1">
            Predict particle capture efficiency in granular media — Tufenkji & Elimelech (2004)
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="text-xs px-2 py-1 bg-cyan-100 text-cyan-700 rounded-full">Single-Collector Theory</span>
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">TE Correlation</span>
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">Foundation</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Panel: Controls */}
          <div className="lg:col-span-1 space-y-4">
            {/* Presets */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Scenario Presets</h2>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(presets).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => applyPreset(key)}
                    className={`text-xs p-2 rounded-lg border transition-all text-left ${
                      activePreset === key
                        ? 'border-cyan-400 bg-cyan-50 text-cyan-800 shadow-sm'
                        : 'border-gray-200 hover:border-cyan-300 hover:bg-cyan-50/50 text-gray-700'
                    }`}
                  >
                    <div className="font-semibold">{preset.name}</div>
                  </button>
                ))}
              </div>
              {activePreset && (
                <p className="text-xs text-gray-500 mt-2 italic">
                  {presets[activePreset].description}
                </p>
              )}
            </div>

            {/* Particle Properties */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Particle Properties</h2>
              <Slider label="Particle diameter (d_p)" value={dp} setValue={setDp}
                min={0.01} max={10} step={0.01} unit="µm"
                description="Virus ~0.05 µm, bacteria ~1 µm, protozoa ~5 µm" />
              <Slider label="Particle density (ρ_p)" value={rhoP} setValue={setRhoP}
                min={900} max={2500} step={10} unit="kg/m³"
                description="Bacteria ~1050, clay ~2650" />
            </div>

            {/* Filter Media */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Filter Media</h2>
              <Slider label="Collector diameter (d_c)" value={dc} setValue={setDc}
                min={0.1} max={2.0} step={0.05} unit="mm"
                description="Fine sand ~0.2 mm, coarse ~0.5 mm" />
              <Slider label="Bed porosity (f)" value={porosity} setValue={setPorosity}
                min={0.25} max={0.55} step={0.01} unit="" />
            </div>

            {/* Flow & Temperature */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Flow & Temperature</h2>
              <Slider label="Darcy velocity (U)" value={velocity} setValue={setVelocity}
                min={0.05} max={5.0} step={0.05} unit="m/h"
                description="Typical SSF: 0.1–0.4 m/h" />
              <Slider label="Temperature" value={temp} setValue={setTemp}
                min={5} max={35} step={1} unit="°C" />
              <div className="text-xs text-gray-400 mt-1">
                μ = {formatSci(teResults.mu)} Pa·s, ρ_f = {teResults.rhoF.toFixed(1)} kg/m³
              </div>
            </div>

            {/* Interaction Forces */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Interaction Forces</h2>
              <Slider label="Hamaker constant (A)" value={hamaker} setValue={setHamaker}
                min={0.1} max={10} step={0.1} unit="×10⁻²⁰ J"
                description="Particle-water-grain attraction" />
              <Slider label="Sticking efficiency (α)" value={alpha} setValue={setAlpha}
                min={0.001} max={1.0} step={0.001} unit=""
                description="Fraction of collisions that attach (0–1)" />
            </div>

            {/* Validity Check */}
            {!teResults.isValid && (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-xs text-amber-800 font-semibold mb-1">Outside recommended validity range:</p>
                {!teResults.validNR && (
                  <p className="text-xs text-amber-700">N_R = {formatSci(teResults.NR)} (valid: 0.01–0.1)</p>
                )}
                {!teResults.validNPe && (
                  <p className="text-xs text-amber-700">N_Pe = {formatSci(teResults.NPe)} (valid: 10²–10⁷)</p>
                )}
              </div>
            )}
          </div>

          {/* Right Panel: Results */}
          <div className="lg:col-span-2 space-y-4">
            {/* Key Metrics */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Collection Efficiency</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MetricCard
                  title="η₀ (Total)"
                  value={formatSci(teResults.eta0, 3)}
                  unit=""
                  subtitle={`Dominant: ${teResults.dominant}`}
                  color="cyan"
                />
                <MetricCard
                  title="η_D (Diffusion)"
                  value={formatSci(teResults.etaD, 3)}
                  unit=""
                  subtitle={`${(teResults.etaD / teResults.eta0 * 100).toFixed(1)}% of total`}
                  color="blue"
                />
                <MetricCard
                  title="η_I (Interception)"
                  value={formatSci(teResults.etaI, 3)}
                  unit=""
                  subtitle={`${(teResults.etaI / teResults.eta0 * 100).toFixed(1)}% of total`}
                  color="green"
                />
                <MetricCard
                  title="η_G (Gravity)"
                  value={formatSci(teResults.etaG, 3)}
                  unit=""
                  subtitle={`${(teResults.etaG / teResults.eta0 * 100).toFixed(1)}% of total`}
                  color="amber"
                />
              </div>
            </div>

            {/* Dimensionless Numbers */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Dimensionless Numbers</h2>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {[
                  { label: 'N_R', value: teResults.NR, desc: 'd_p/d_c' },
                  { label: 'N_Pe', value: teResults.NPe, desc: 'Ud_c/D_∞' },
                  { label: 'N_vdW', value: teResults.NvdW, desc: 'A/k_BT' },
                  { label: 'N_G', value: teResults.NG, desc: 'Gravity' },
                  { label: 'N_A', value: teResults.NA, desc: 'Attraction' },
                  { label: 'A_s', value: teResults.As, desc: 'Happel' }
                ].map(({ label, value, desc }) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-2 text-center border border-gray-100">
                    <div className="text-xs font-semibold text-gray-600">{label}</div>
                    <div className="text-sm font-mono font-bold text-gray-800 mt-1">{formatSci(value)}</div>
                    <div className="text-xs text-gray-400">{desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mechanism Breakdown */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Mechanism Breakdown</h2>
              <ResponsiveContainer width="100%" height={80}>
                <BarChart data={[{ name: 'Efficiency', etaD: teResults.etaD, etaI: teResults.etaI, etaG: teResults.etaG }]}
                  layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
                  <XAxis type="number" fontSize={11} tickFormatter={(v) => formatSci(v)} />
                  <YAxis dataKey="name" type="category" fontSize={11} hide />
                  <Tooltip formatter={(value) => formatSci(value, 4)} contentStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="etaD" stackId="a" fill="#3b82f6" name="Diffusion (η_D)" />
                  <Bar dataKey="etaI" stackId="a" fill="#22c55e" name="Interception (η_I)" />
                  <Bar dataKey="etaG" stackId="a" fill="#f59e0b" name="Gravity (η_G)" />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-2 text-xs">
                {mechanismData.map((m) => (
                  <span key={m.name} className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: m.color }} />
                    {m.name}: {m.percent.toFixed(1)}%
                  </span>
                ))}
              </div>
            </div>

            {/* η₀ vs Particle Size — the signature TE curve */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">
                Collection Efficiency vs Particle Size
              </h2>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={particleSizeSweep} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="dp"
                    scale="log"
                    domain={[0.01, 10]}
                    type="number"
                    fontSize={11}
                    tickFormatter={(v) => v >= 1 ? v.toFixed(0) : v < 0.1 ? v.toFixed(2) : v.toFixed(1)}
                    label={{ value: 'Particle diameter d_p (µm)', position: 'bottom', offset: 5, fontSize: 12 }}
                  />
                  <YAxis
                    scale="log"
                    domain={['auto', 'auto']}
                    fontSize={11}
                    tickFormatter={(v) => formatSci(v)}
                    label={{ value: 'η', angle: -90, position: 'insideLeft', fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value, name) => [formatSci(value, 4), name]}
                    labelFormatter={(label) => `d_p = ${label} µm`}
                    contentStyle={{ fontSize: '12px' }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <ReferenceLine x={dp} stroke="#ef4444" strokeDasharray="5 5"
                    label={{ value: 'Current', position: 'top', fontSize: 10, fill: '#ef4444' }} />
                  <Line type="monotone" dataKey="eta0" stroke="#06b6d4" strokeWidth={2.5} dot={false} name="η₀ (total)" />
                  <Line type="monotone" dataKey="etaD" stroke="#3b82f6" strokeWidth={1.5} dot={false} name="η_D (diffusion)" strokeDasharray="4 2" />
                  <Line type="monotone" dataKey="etaI" stroke="#22c55e" strokeWidth={1.5} dot={false} name="η_I (interception)" strokeDasharray="4 2" />
                  <Line type="monotone" dataKey="etaG" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="η_G (gravity)" strokeDasharray="4 2" />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-2 text-xs text-gray-500 text-center">
                The classic TE curve shows a minimum efficiency near 0.5–2 µm where neither diffusion nor interception/gravity dominates.
              </div>
            </div>

            {/* η₀ vs Velocity */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">
                Collection Efficiency vs Flow Velocity
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={velocitySweep} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="velocity"
                    fontSize={11}
                    label={{ value: 'Darcy velocity U (m/h)', position: 'bottom', offset: 5, fontSize: 12 }}
                  />
                  <YAxis
                    fontSize={11}
                    tickFormatter={(v) => formatSci(v)}
                    label={{ value: 'η', angle: -90, position: 'insideLeft', fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value, name) => [formatSci(value, 4), name]}
                    labelFormatter={(label) => `U = ${label} m/h`}
                    contentStyle={{ fontSize: '12px' }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <ReferenceLine x={velocity} stroke="#ef4444" strokeDasharray="5 5"
                    label={{ value: 'Current', position: 'top', fontSize: 10, fill: '#ef4444' }} />
                  <Line type="monotone" dataKey="eta0" stroke="#06b6d4" strokeWidth={2.5} dot={false} name="η₀ (total)" />
                  <Line type="monotone" dataKey="etaD" stroke="#3b82f6" strokeWidth={1.5} dot={false} name="η_D" strokeDasharray="4 2" />
                  <Line type="monotone" dataKey="etaI" stroke="#22c55e" strokeWidth={1.5} dot={false} name="η_I" strokeDasharray="4 2" />
                  <Line type="monotone" dataKey="etaG" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="η_G" strokeDasharray="4 2" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Filter-Scale Removal */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Filter-Scale Removal (0.8 m bed)</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <MetricCard
                  title="k_att"
                  value={formatSci(teResults.katt)}
                  unit="s⁻¹"
                  subtitle="Attachment rate"
                  color="cyan"
                />
                <MetricCard
                  title="Log₁₀ Removal"
                  value={teResults.logRemoval.toFixed(2)}
                  unit=""
                  subtitle={`α = ${alpha}, L = 0.8 m`}
                  color="blue"
                />
                <MetricCard
                  title="% Removal"
                  value={teResults.logRemoval > 0 ? ((1 - Math.pow(10, -teResults.logRemoval)) * 100).toFixed(1) : '0.0'}
                  unit="%"
                  subtitle="1 − C/C₀"
                  color="green"
                />
              </div>
              <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs text-gray-600 font-mono">
                −log₁₀(C/C₀) = (3/2) × (1−f)/d_c × (L/ln10) × α × η₀
                = (3/2) × {((1 - porosity) / (dc * 1e-3)).toFixed(0)} × {(0.8 / Math.LN10).toFixed(2)} × {alpha} × {formatSci(teResults.eta0)}
                = {teResults.logRemoval.toFixed(3)}
              </div>
            </div>

            {/* Governing Equation */}
            <div className="bg-gray-800 rounded-xl shadow-sm p-4 text-white">
              <h2 className="text-sm font-semibold mb-3">Governing Equation (Tufenkji & Elimelech, 2004 — Eq. 17)</h2>
              <div className="font-mono text-sm space-y-2">
                <div>
                  <span className="text-cyan-300 font-bold">η₀</span> = <span className="text-blue-300">η_D</span> + <span className="text-green-300">η_I</span> + <span className="text-amber-300">η_G</span>
                </div>
                <div className="text-blue-300 text-xs mt-2">
                  η_D = 2.4 × A_s^(1/3) × N_R^(−0.081) × N_Pe^(−0.715) × N_vdW^(0.052)
                </div>
                <div className="text-green-300 text-xs">
                  η_I = 0.55 × A_s × N_R^(1.675) × N_A^(0.125)
                </div>
                <div className="text-amber-300 text-xs">
                  η_G = 0.22 × N_R^(−0.24) × N_G^(1.11) × N_vdW^(0.053)
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div className="bg-gray-700 rounded p-2 text-center">
                  <div className="text-blue-300">η_D</div>
                  <div className="font-bold">{formatSci(teResults.etaD, 3)}</div>
                </div>
                <div className="bg-gray-700 rounded p-2 text-center">
                  <div className="text-green-300">η_I</div>
                  <div className="font-bold">{formatSci(teResults.etaI, 3)}</div>
                </div>
                <div className="bg-gray-700 rounded p-2 text-center">
                  <div className="text-amber-300">η_G</div>
                  <div className="font-bold">{formatSci(teResults.etaG, 3)}</div>
                </div>
              </div>
            </div>

            {/* Key Insight */}
            <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-200">
              <h3 className="text-sm font-semibold text-cyan-800 mb-2">Key Insight</h3>
              <p className="text-xs text-cyan-700">
                The TE correlation predicts a <strong>minimum collection efficiency</strong> for particles near 0.5–2 µm diameter.
                Smaller particles (viruses) are captured efficiently by <strong>Brownian diffusion</strong>, while larger particles
                (protozoa) are captured by <strong>interception and gravity</strong>. Bacteria (~1 µm) fall near this minimum,
                explaining why biofilm enhancement (Extended CFT) is critical for SSF performance.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center text-xs text-gray-500 pb-4">
          Based on: Tufenkji, N. & Elimelech, M. (2004). Correlation equation for predicting single-collector efficiency
          in physicochemical filtration in saturated porous media. <em>Environ. Sci. Technol.</em>, 38(2), 529-536.
          <br />
          PhD Thesis: <em>From Pores to Pilot Filters: Biofilm-Driven Bacterial Removal in Slow Sand Filtration</em> — Utrecht University
        </div>
      </div>
    </div>
  );
};

export default TufenkjiElimelech;
