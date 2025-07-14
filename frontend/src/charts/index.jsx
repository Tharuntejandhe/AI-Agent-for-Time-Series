
export const KPI = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {['Total Sales', 'Active Users', 'Total Products', 'Avg. Growth'].map((kpi) => (
      <div key={kpi} className="bg-white p-4 rounded-2xl shadow-md">
        <h3 className="text-sm text-gray-500">{kpi}</h3>
        <p className="text-xl font-bold">1234</p>
      </div>
    ))}
  </div>
);

export const TrendChart = () => (
  <div className="bg-white p-4 rounded-2xl shadow-md h-64">Trend Line Chart</div>
);

export const SeasonalityChart = () => (
  <div className="bg-white p-4 rounded-2xl shadow-md h-64">Seasonality Chart</div>
);

export const ForecastChart = () => (
  <div className="bg-white p-4 rounded-2xl shadow-md h-64">Forecast Chart</div>
);
