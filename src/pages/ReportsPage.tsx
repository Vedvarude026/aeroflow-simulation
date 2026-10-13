import React, { useEffect, useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  Area, 
  AreaChart 
} from 'recharts';
import { 
  BarChart2, 
  Download, 
  Send, 
  Bot, 
  Database, 
  CheckCircle, 
  Zap, 
  Sparkles 
} from 'lucide-react';
import { ForecastModelMetrics, GroundedAnswer, MonteCarloResult } from '../types/index';

export const ReportsPage: React.FC = () => {
  const [forecastMetrics, setForecastMetrics] = useState<ForecastModelMetrics[]>([]);
  const [monteCarlo, setMonteCarlo] = useState<MonteCarloResult | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('Linear Regression (Feature-based)');
  
  const [askQuery, setAskQuery] = useState('');
  const [groundedAnswer, setGroundedAnswer] = useState<GroundedAnswer | null>(null);
  const [isAsking, setIsAsking] = useState(false);

  useEffect(() => {
    fetch('/api/forecast')
      .then(r => r.json())
      .then(data => setForecastMetrics(data));

    fetch('/api/monte-carlo')
      .then(r => r.json())
      .then(data => setMonteCarlo(data));
  }, []);

  const handleAskPlanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!askQuery.trim()) return;
    setIsAsking(true);

    try {
      const res = await fetch('/api/ask-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: askQuery })
      });
      const data = await res.json();
      setGroundedAnswer(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAsking(false);
    }
  };

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8,Model,MAE,RMSE,MAPE\n" +
      forecastMetrics.map(m => `${m.modelName},${m.mae},${m.rmse},${m.mape}%`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "AEROFLOW_Predictive_Metrics.csv");
    document.body.appendChild(link);
    link.click();
  };

  const currentModelData = forecastMetrics.find(m => m.modelName === selectedModel);

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto font-mono text-xs select-none text-[#362419]">
      {/* Header & Export Controls */}
      <div className="bg-[#FFFFFF] border border-[#DFD7C8] p-3 rounded-md flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-[#1E40AF]" />
          <h1 className="text-sm font-bold text-[#362419] uppercase tracking-wider">
            PREDICTIVE ANALYTICS & OPERATIONAL KPI REPORTS
          </h1>
        </div>

        <button
          onClick={handleExportCSV}
          className="bg-[#1E40AF] hover:bg-[#1D4ED8] text-[#FFFFFF] font-bold px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors shadow-2xs"
        >
          <Download className="w-3.5 h-3.5" /> Export Report CSV
        </button>
      </div>

      {/* Grounded "Ask the Planner" Section */}
      <div className="bg-[#FFFFFF] border border-[#DFD7C8] p-4 rounded-md flex flex-col gap-3 shadow-2xs">
        <div className="flex items-center gap-2 border-b border-[#DFD7C8] pb-2">
          <Sparkles className="w-4 h-4 text-[#1E40AF]" />
          <span className="font-bold text-[#362419] uppercase text-xs">
            GROUNDED "ASK THE PLANNER" QUERY ENGINE
          </span>
          <span className="bg-[#1E40AF] text-[#FFFFFF] text-[10px] px-2 py-0.5 rounded font-bold shadow-2xs">
            STRICT DATABASE CITED
          </span>
        </div>

        <form onSubmit={handleAskPlanner} className="flex gap-2">
          <input
            type="text"
            value={askQuery}
            onChange={(e) => setAskQuery(e.target.value)}
            placeholder="Ask strict rule-based question (e.g., 'Which aircraft are free at Brightwater tomorrow 10:00?')..."
            className="flex-1 bg-[#F1ECE1] border border-[#DFD7C8] text-[#362419] px-3 py-2 rounded focus:ring-1 focus:ring-[#1E40AF] placeholder-[#6C584C]"
          />
          <button
            type="submit"
            disabled={isAsking}
            className="bg-[#1E40AF] hover:bg-[#1D4ED8] disabled:opacity-50 text-[#FFFFFF] font-bold px-4 py-2 rounded flex items-center gap-2 transition-colors shadow-2xs"
          >
            <Send className="w-3.5 h-3.5" /> {isAsking ? 'Querying...' : 'Ask Engine'}
          </button>
        </form>

        {groundedAnswer && (
          <div className="bg-[#F1ECE1] border border-[#DFD7C8] p-3 rounded flex flex-col gap-2">
            <div className="font-bold text-[#362419] text-xs">
              Answer: {groundedAnswer.answer}
            </div>
            <div className="flex flex-col gap-1 border-t border-[#DFD7C8] pt-2">
              <span className="text-[10px] text-[#1E40AF] font-bold uppercase">Cited Records:</span>
              {groundedAnswer.citedRecords?.map((rec, i) => (
                <div key={i} className="text-[10px] text-[#6C584C] flex items-center justify-between">
                  <span>Record: <span className="text-[#362419] font-bold">{rec.id}</span> ({rec.details})</span>
                  <span className="bg-[#FFFFFF] px-1.5 py-0.5 rounded text-[#1E40AF] font-bold border border-[#DFD7C8]">{rec.provenance}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Model Comparison Table */}
      <div className="bg-[#FFFFFF] border border-[#DFD7C8] p-4 rounded-md flex flex-col gap-3 shadow-2xs">
        <span className="font-bold text-[#362419] uppercase text-xs border-b border-[#DFD7C8] pb-2">
          PREDICTIVE MAINTENANCE MODEL EVALUATION (20% HELD-OUT TEST SPLIT)
        </span>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F1ECE1] text-[#6C584C] text-[10px] uppercase border-b border-[#DFD7C8]">
              <th className="p-2">Model Name</th>
              <th className="p-2">MAE (Mean Abs Error)</th>
              <th className="p-2">RMSE (Root Mean Sq Error)</th>
              <th className="p-2">MAPE %</th>
              <th className="p-2 text-right">Select for Chart</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DFD7C8]">
            {forecastMetrics.map(m => (
              <tr 
                key={m.modelName}
                className={`hover:bg-[#F1ECE1] transition-colors cursor-pointer ${
                  selectedModel === m.modelName ? 'bg-[#F1ECE1] font-bold text-[#362419]' : 'text-[#362419]'
                }`}
                onClick={() => setSelectedModel(m.modelName)}
              >
                <td className="p-2 font-bold">{m.modelName}</td>
                <td className="p-2">{m.mae}</td>
                <td className="p-2">{m.rmse}</td>
                <td className="p-2 text-[#1E40AF] font-bold">{m.mape}%</td>
                <td className="p-2 text-right">
                  <button className="text-[#1E40AF] hover:underline font-bold">
                    {selectedModel === m.modelName ? 'Active Chart' : 'Select'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Chart: Held-out Predicted vs Actual with 80%/95% Prediction Interval Bands */}
      {currentModelData && (
        <div className="bg-[#FFFFFF] border border-[#DFD7C8] p-4 rounded-md flex flex-col gap-3 shadow-2xs">
          <div className="flex items-center justify-between border-b border-[#DFD7C8] pb-2">
            <span className="font-bold text-[#362419] uppercase text-xs">
              PREDICTED VS ACTUAL MAINTENANCE UNAVAILABILITY ({selectedModel})
            </span>
            <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-bold">
              FORECAST – NOT A GUARANTEE
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentModelData.series}>
                <CartesianGrid strokeDasharray="3 3" stroke="#DFD7C8" />
                <XAxis dataKey="date" stroke="#6C584C" fontSize={10} />
                <YAxis stroke="#6C584C" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#DFD7C8', color: '#362419', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="upper95" stroke="none" fill="#1E40AF" fillOpacity={0.15} name="95% Confidence Band" />
                <Area type="monotone" dataKey="upper80" stroke="none" fill="#1E40AF" fillOpacity={0.25} name="80% Confidence Band" />
                <Line type="monotone" dataKey="actual" stroke="#10B981" strokeWidth={2} name="Actual Unserviceable Count" />
                <Line type="monotone" dataKey="predicted" stroke="#1E40AF" strokeWidth={2} strokeDasharray="4 4" name="Model Forecast" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Monte Carlo Robustness Percentiles */}
      {monteCarlo && (
        <div className="bg-[#FFFFFF] border border-[#DFD7C8] p-4 rounded-md flex flex-col gap-3 shadow-2xs">
          <span className="font-bold text-[#362419] uppercase text-xs border-b border-[#DFD7C8] pb-2">
            MONTE CARLO ROBUSTNESS SIMULATION ({monteCarlo.simulationsRun} PERTURBED RUNS)
          </span>

          <div className="grid grid-cols-3 gap-4 font-mono text-center">
            <div className="bg-[#F1ECE1] p-3 rounded border border-[#DFD7C8]">
              <div className="text-[#6C584C] text-[10px]">P10 (Pessimistic)</div>
              <div className="text-lg font-bold text-red-600">{monteCarlo.p10CoveragePct}%</div>
            </div>
            <div className="bg-[#F1ECE1] p-3 rounded border border-[#DFD7C8]">
              <div className="text-[#6C584C] text-[10px]">P50 (Median Expected)</div>
              <div className="text-lg font-bold text-amber-600">{monteCarlo.p50CoveragePct}%</div>
            </div>
            <div className="bg-[#F1ECE1] p-3 rounded border border-[#DFD7C8]">
              <div className="text-[#6C584C] text-[10px]">P90 (Optimistic)</div>
              <div className="text-lg font-bold text-emerald-600">{monteCarlo.p90CoveragePct}%</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
