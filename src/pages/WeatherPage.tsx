import React from 'react';
import { usePlannerStore } from '../store/usePlannerStore';
import { CloudRain, Wind, Eye, AlertOctagon, CheckCircle2 } from 'lucide-react';

export const WeatherPage: React.FC = () => {
  const { weatherZones } = usePlannerStore();

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto font-mono text-xs select-none text-[#362419]">
      <div className="bg-[#FFFFFF] border border-[#DFD7C8] p-3 rounded-md flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2">
          <CloudRain className="w-5 h-5 text-[#1E40AF]" />
          <h1 className="text-sm font-bold text-[#362419] uppercase tracking-wider">
            SYNTHETIC ATMOSPHERIC TELEMETRY & BASE MINIMA
          </h1>
        </div>
      </div>

      {/* Base Weather Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {weatherZones.map((wx) => {
          const isGo = wx.goNoGoStatus === 'GO';
          const isMarginal = wx.goNoGoStatus === 'MARGINAL';

          return (
            <div key={wx.id} className="bg-[#FFFFFF] border border-[#DFD7C8] p-4 rounded-md flex flex-col gap-3 shadow-2xs">
              <div className="flex items-center justify-between border-b border-[#DFD7C8] pb-2">
                <span className="font-bold text-[#362419] text-sm">{wx.base}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  isGo ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                  isMarginal ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                  'bg-red-100 text-red-900 border border-red-300'
                }`}>
                  {wx.goNoGoStatus}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-[#F1ECE1] p-2.5 rounded border border-[#DFD7C8] text-[11px]">
                <div>Category: <span className="font-bold text-[#362419]">{wx.condition}</span></div>
                <div>Ceiling: <span className="font-bold text-[#362419]">{wx.cloudCeilingFt} ft</span></div>
                <div>Visibility: <span className="font-bold text-[#362419]">{wx.visibilityMiles} SM</span></div>
                <div>Winds: <span className="font-bold text-[#362419]">{wx.windSpeedKt} G{wx.gustKt} kt</span></div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-[#6C584C] pt-1 border-t border-[#DFD7C8]">
                <span>Forecast Confidence: <span className="text-[#1E40AF] font-bold">{wx.confidencePct}%</span></span>
                <span className="bg-[#F1ECE1] px-1.5 py-0.5 rounded font-bold">{wx.provenance}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
