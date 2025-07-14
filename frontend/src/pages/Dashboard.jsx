
import React from 'react';
import { KPI, TrendChart, SeasonalityChart, ForecastChart } from '../charts/index.jsx';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <KPI />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TrendChart />
        <SeasonalityChart />
      </div>
      <ForecastChart />
    </div>
  );
};

export default Dashboard;
