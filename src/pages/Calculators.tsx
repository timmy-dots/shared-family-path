import React, { useState } from 'react';
import { Calculator, TrendingUp, Euro } from 'lucide-react';

const CalculatorsPage = () => {
  const [currentWealth, setCurrentWealth] = useState('');
  const [returnRate, setReturnRate] = useState('');
  const [investmentPeriod, setInvestmentPeriod] = useState('');
  const [result, setResult] = useState(null);

  // Compound interest calculation: A = P(1 + r)^t
  const calculateWealth = () => {
    const principal = parseFloat(currentWealth);
    const rate = parseFloat(returnRate) / 100; // Convert percentage to decimal
    const time = parseFloat(investmentPeriod);

    if (isNaN(principal) || isNaN(rate) || isNaN(time) || principal < 0 || time < 0) {
      alert('Please enter valid positive numbers for all fields.');
      return;
    }

    const futureWealth = principal * Math.pow(1 + rate, time);
    setResult({
      amount: futureWealth,
      years: time
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F6F8' }}>
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4" style={{ color: '#001F3F' }}>
            Financial Calculators
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Plan your family's financial future with our suite of calculators. 
            Make informed decisions together with clear, easy-to-understand projections.
          </p>
        </div>

        {/* Wealth Calculator Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8" style={{ borderRadius: '12px' }}>
          <div className="flex items-center mb-6">
            <div 
              className="p-3 rounded-lg mr-4"
              style={{ backgroundColor: '#002FA7', color: 'white' }}
            >
              <TrendingUp size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: '#001F3F' }}>
                Wealth Growth Calculator
              </h2>
              <p className="text-gray-600">
                Calculate how your wealth will grow over time with compound returns
              </p>
            </div>
          </div>

          {/* Input Form */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#001F3F' }}>
                Current Wealth (€)
              </label>
              <div className="relative">
                <Euro 
                  size={20} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="number"
                  value={currentWealth}
                  onChange={(e) => setCurrentWealth(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 focus:border-transparent"
                  style={{ 
                    borderRadius: '8px'
                  }}
                  placeholder="100000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#001F3F' }}>
                Expected Annual Return (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={returnRate}
                onChange={(e) => setReturnRate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 focus:border-transparent"
                style={{ 
                  borderRadius: '8px'
                }}
                placeholder="7.0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#001F3F' }}>
                Investment Period (Years)
              </label>
              <input
                type="number"
                value={investmentPeriod}
                onChange={(e) => setInvestmentPeriod(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 focus:border-transparent"
                style={{ 
                  borderRadius: '8px'
                }}
                placeholder="10"
              />
            </div>
          </div>

          {/* Calculate Button */}
          <div className="text-center mb-8">
            <button
              onClick={calculateWealth}
              className="px-8 py-3 text-white font-medium rounded-full transition-all duration-200 hover:shadow-lg transform hover:scale-105"
              style={{ 
                backgroundColor: '#001F3F'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#002FA7';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#001F3F';
              }}
            >
              <Calculator className="inline mr-2" size={20} />
              Calculate Wealth Growth
            </button>
          </div>

          {/* Results Display */}
          {result && (
            <div 
              className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border-l-4"
              style={{ 
                borderLeftColor: '#002FA7',
                borderRadius: '8px'
              }}
            >
              <h3 className="text-lg font-semibold mb-3" style={{ color: '#001F3F' }}>
                Your Wealth Projection
              </h3>
              <p className="text-gray-700 mb-2">
                Based on your inputs, your predicted net worth in{' '}
                <span className="font-semibold">{result.years} years</span> is:
              </p>
              <div className="text-3xl font-bold" style={{ color: '#002FA7' }}>
                {formatCurrency(result.amount)}
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p>
                  Growth from {formatCurrency(parseFloat(currentWealth))} to {formatCurrency(result.amount)} 
                  represents a {((result.amount / parseFloat(currentWealth) - 1) * 100).toFixed(1)}% total return.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Future Calculator Placeholders */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6" style={{ borderRadius: '12px' }}>
            <div className="text-center text-gray-500">
              <Calculator size={48} className="mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#001F3F' }}>
                Retirement Calculator
              </h3>
              <p className="text-sm">Coming Soon</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6" style={{ borderRadius: '12px' }}>
            <div className="text-center text-gray-500">
              <Calculator size={48} className="mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#001F3F' }}>
                Education Fund Calculator
              </h3>
              <p className="text-sm">Coming Soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculatorsPage;