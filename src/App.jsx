import React, { useState } from 'react';

// Import all tool components
import SSFModelExplorer from './tools/SSFModelExplorer';
import ExtendedCFTCalculator from './tools/ExtendedCFTCalculator';
import EPSRemovalPredictor from './tools/EPSRemovalPredictor';
import ScaleDependentPredictor from './tools/ScaleDependentPredictor';
import LayerContributionExplorer from './tools/LayerContributionExplorer';

// SSF Toolkit - Unified Dashboard
const SSFToolkit = () => {
  const [activeTool, setActiveTool] = useState('home');

  const tools = {
    'ssf-model': {
      id: 'ssf-model',
      name: 'SSF Steady-State Model',
      shortName: 'SSF Model',
      description: 'Two-site kinetic model for bacterial removal prediction',
      source: 'Schijven et al. (2013)',
      chapter: 'Foundation',
      icon: '📊',
      color: '#3b82f6',
      component: SSFModelExplorer
    },
    'extended-cft': {
      id: 'extended-cft',
      name: 'Extended CFT Calculator',
      shortName: 'Extended CFT',
      description: 'Image-informed colloid filtration theory with biofilm effects',
      source: 'Samari-Kermani et al. (2025)',
      chapter: 'Chapter 3',
      icon: '🔬',
      color: '#8b5cf6',
      component: ExtendedCFTCalculator
    },
    'eps-predictor': {
      id: 'eps-predictor',
      name: 'EPS-Based Removal Predictor',
      shortName: 'EPS Predictor',
      description: 'Regression models linking EPS composition to removal efficiency',
      source: 'Bai, Samari-Kermani et al. (2024, 2025)',
      chapter: 'Chapters 4–6',
      icon: '🧬',
      color: '#22c55e',
      component: EPSRemovalPredictor
    },
    'scale-comparison': {
      id: 'scale-comparison',
      name: 'Scale-Dependent Predictor',
      shortName: 'Scale Comparison',
      description: 'Mini vs Midi scale removal model comparison',
      source: 'Bai, Samari-Kermani et al. (2025)',
      chapter: 'Chapter 5',
      icon: '📏',
      color: '#f59e0b',
      component: ScaleDependentPredictor
    },
    'layer-explorer': {
      id: 'layer-explorer',
      name: 'Schmutzdecke Layer Explorer',
      shortName: 'Layer Explorer',
      description: 'Depth-resolved removal analysis in pilot-scale SSF',
      source: 'Bai, Samari-Kermani et al. (2025)',
      chapter: 'Chapter 6',
      icon: '🌿',
      color: '#10b981',
      component: LayerContributionExplorer
    }
  };

  const renderContent = () => {
    if (activeTool === 'home') {
      return <HomePage tools={tools} setActiveTool={setActiveTool} />;
    }
    const ToolComponent = tools[activeTool]?.component;
    if (ToolComponent) {
      return <ToolComponent />;
    }
    return <HomePage tools={tools} setActiveTool={setActiveTool} />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <button
              onClick={() => setActiveTool('home')}
              className="flex items-center gap-2 text-gray-800 hover:text-blue-600 transition-colors"
            >
              <span className="text-xl">💧</span>
              <span className="font-bold text-lg hidden sm:inline">SSF Toolkit</span>
            </button>

            <div className="flex items-center gap-1 overflow-x-auto">
              {Object.entries(tools).map(([key, tool]) => (
                <button
                  key={key}
                  onClick={() => setActiveTool(key)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    activeTool === key
                      ? 'text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  style={activeTool === key ? { backgroundColor: tool.color } : {}}
                >
                  <span className="mr-1">{tool.icon}</span>
                  <span className="hidden md:inline">{tool.shortName}</span>
                </button>
              ))}
            </div>

            <a
              href="https://github.com/PorousLab/ssf-toolkit"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </nav>

      <main>{renderContent()}</main>

      {activeTool === 'home' && (
        <footer className="bg-white border-t border-gray-200 py-8 mt-8">
          <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
            <p>SSF Toolkit — Interactive tools for slow sand filtration research</p>
            <p className="mt-2">
              <a href="https://github.com/PorousLab" className="text-blue-600 hover:underline">PorousLab</a>
              {' · '}
              <a href="https://www.uu.nl" className="text-blue-600 hover:underline">Utrecht University</a>
            </p>
          </div>
        </footer>
      )}
    </div>
  );
};

// Home Page Component
const HomePage = ({ tools, setActiveTool }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">SSF Toolkit</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Interactive tools for exploring slow sand filtration mechanisms, 
          from pore-scale biofilm effects to pilot-scale removal prediction.
        </p>
        <div className="flex justify-center gap-3 mt-6 flex-wrap">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">Colloid Filtration Theory</span>
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">Biofilm & EPS</span>
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">Multi-Scale Validation</span>
          <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">QMRA Applications</span>
        </div>
      </div>

      {/* Tool Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {Object.entries(tools).map(([key, tool]) => (
          <div
            key={key}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => setActiveTool(key)}
          >
            <div className="p-4 text-white" style={{ backgroundColor: tool.color }}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{tool.icon}</span>
                <div>
                  <h3 className="font-bold text-lg">{tool.name}</h3>
                  <span className="text-sm opacity-90">{tool.chapter}</span>
                </div>
              </div>
            </div>
            <div className="p-4">
              <p className="text-gray-600 text-sm mb-3">{tool.description}</p>
              <p className="text-xs text-gray-400">{tool.source}</p>
            </div>
            <div className="px-4 pb-4">
              <button
                className="w-full py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ backgroundColor: `${tool.color}20`, color: tool.color }}
              >
                Launch Tool →
              </button>
            </div>
          </div>
        ))}

        {/* Coming Soon */}
        <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-6 flex flex-col items-center justify-center text-center">
          <span className="text-4xl mb-3">🔧</span>
          <h3 className="font-semibold text-gray-600 mb-2">More Tools Coming</h3>
          <p className="text-sm text-gray-500">Additional SSF tools will be added.</p>
        </div>
      </div>

      {/* Scale Progression */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
        <h2 className="text-lg font-bold text-gray-800 mb-4 text-center">
          Pore → Mini → Midi → Pilot: Multi-Scale Framework
        </h2>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {[
            { icon: '🔬', name: 'Pore Scale', desc: 'Microfluidics' },
            { icon: '🧪', name: 'Mini Scale', desc: '10 cm columns' },
            { icon: '🏗️', name: 'Midi Scale', desc: '52 cm columns' },
            { icon: '🏭', name: 'Pilot Scale', desc: 'DWTP filters' }
          ].map((scale, i) => (
            <React.Fragment key={scale.name}>
              {i > 0 && <span className="text-gray-400">→</span>}
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm">
                <span className="text-xl">{scale.icon}</span>
                <div>
                  <div className="text-xs font-semibold text-gray-700">{scale.name}</div>
                  <div className="text-xs text-gray-500">{scale.desc}</div>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SSFToolkit;
