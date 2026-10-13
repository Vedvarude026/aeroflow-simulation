import React, { useState, useEffect } from 'react';
import { X, SlidersHorizontal, Fuel, ShieldAlert, RotateCcw, Check, Save, Flame, Clock } from 'lucide-react';
import { usePlannerStore } from '../../store/usePlannerStore';

export const AlertSettingsModal: React.FC = () => {
  const { 
    alertSettingsModalOpen, 
    setAlertSettingsModalOpen, 
    alertThresholds, 
    updateAlertThresholds 
  } = usePlannerStore();

  const [formState, setFormState] = useState(alertThresholds);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setFormState(alertThresholds);
  }, [alertThresholds, alertSettingsModalOpen]);

  if (!alertSettingsModalOpen) return null;

  const handleSave = () => {
    updateAlertThresholds(formState);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setAlertSettingsModalOpen(false);
    }, 600);
  };

  const handleResetDefaults = () => {
    const defaults = {
      minFuelReservePct: 20,
      suboptimalAltitudeBurnPct: 15,
      standOverlapMarginMins: 15,
      conflictRadiusNmi: 15,
      weatherCeilingThresholdFt: 1000,
      autoResolveMinorAlerts: false
    };
    setFormState(defaults);
  };

  return (
    <div className="fixed inset-0 bg-[#362419]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-[#FFFFFF] border border-[#DFD7C8] rounded-lg shadow-2xl w-full max-w-xl flex flex-col overflow-hidden text-[#362419]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#F8F6F0] border-b border-[#DFD7C8] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#1E40AF]/10 border border-[#1E40AF]/30 flex items-center justify-center text-[#1E40AF]">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#362419] tracking-wide">
                ALERT THRESHOLD CONFIGURATION
              </h3>
              <p className="text-[10px] font-mono text-[#6C584C]">
                CUSTOMIZE OPERATIONAL WARNING & CONFLICT DETECTION SENSITIVITY
              </p>
            </div>
          </div>

          <button
            onClick={() => setAlertSettingsModalOpen(false)}
            className="text-[#6C584C] hover:text-[#362419] p-1 rounded hover:bg-[#F1ECE1] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex flex-col gap-5 overflow-y-auto max-h-[75vh] custom-scrollbar text-xs font-mono">
          {/* Section 1: Fuel Efficiency Parameters */}
          <div className="bg-[#F1ECE1] border border-[#DFD7C8] p-3.5 rounded-md flex flex-col gap-3">
            <div className="flex items-center gap-2 border-b border-[#DFD7C8] pb-2 text-[#1E40AF] font-bold uppercase text-[11px]">
              <Fuel className="w-4 h-4" />
              <span>Fuel Efficiency & Burn Anomaly Thresholds</span>
            </div>

            {/* Min Fuel Reserve */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[#362419]">
                <span>Minimum Fuel Reserve Warning Level:</span>
                <span className="font-bold text-[#1E40AF] bg-[#FFFFFF] px-2 py-0.5 rounded border border-[#DFD7C8]">
                  {formState.minFuelReservePct}%
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={40}
                step={1}
                value={formState.minFuelReservePct}
                onChange={(e) => setFormState({ ...formState, minFuelReservePct: Number(e.target.value) })}
                className="w-full accent-[#1E40AF] cursor-pointer bg-[#DFD7C8] h-1.5 rounded"
              />
              <span className="text-[10px] text-[#6C584C]">
                Trigger critical fuel warning if aircraft landing fuel reserve drops below {formState.minFuelReservePct}%.
              </span>
            </div>

            {/* Fuel Burn Anomaly Threshold */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[#362419]">
                <span>Fuel Burn Anomaly Sensitivity:</span>
                <span className="font-bold text-[#1E40AF] bg-[#FFFFFF] px-2 py-0.5 rounded border border-[#DFD7C8]">
                  +{formState.suboptimalAltitudeBurnPct}%
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={30}
                step={1}
                value={formState.suboptimalAltitudeBurnPct}
                onChange={(e) => setFormState({ ...formState, suboptimalAltitudeBurnPct: Number(e.target.value) })}
                className="w-full accent-[#1E40AF] cursor-pointer bg-[#DFD7C8] h-1.5 rounded"
              />
              <span className="text-[10px] text-[#6C584C]">
                Flag sortie if altitude cruise profile causes fuel burn rate to exceed optimal plan by +{formState.suboptimalAltitudeBurnPct}%.
              </span>
            </div>
          </div>

          {/* Section 2: Conflict Radius & Airspace Parameters */}
          <div className="bg-[#F1ECE1] border border-[#DFD7C8] p-3.5 rounded-md flex flex-col gap-3">
            <div className="flex items-center gap-2 border-b border-[#DFD7C8] pb-2 text-[#362419] font-bold uppercase text-[11px]">
              <Flame className="w-4 h-4 text-[#1E40AF]" />
              <span>Airspace Conflict & Ramp Stand Parameters</span>
            </div>

            {/* Conflict Proximity Radius */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[#362419]">
                <span>Airspace Conflict Proximity Radius:</span>
                <span className="font-bold text-[#1E40AF] bg-[#FFFFFF] px-2 py-0.5 rounded border border-[#DFD7C8]">
                  {formState.conflictRadiusNmi} NMi
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={50}
                step={1}
                value={formState.conflictRadiusNmi}
                onChange={(e) => setFormState({ ...formState, conflictRadiusNmi: Number(e.target.value) })}
                className="w-full accent-[#1E40AF] cursor-pointer bg-[#DFD7C8] h-1.5 rounded"
              />
              <span className="text-[10px] text-[#6C584C]">
                Detect potential airway conflict if airborne separation decreases within {formState.conflictRadiusNmi} Nautical Miles.
              </span>
            </div>

            {/* Stand Overlap Margin */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[#362419]">
                <span>Ramp Stand Turnaround Buffer Margin:</span>
                <span className="font-bold text-[#1E40AF] bg-[#FFFFFF] px-2 py-0.5 rounded border border-[#DFD7C8]">
                  {formState.standOverlapMarginMins} mins
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={45}
                step={5}
                value={formState.standOverlapMarginMins}
                onChange={(e) => setFormState({ ...formState, standOverlapMarginMins: Number(e.target.value) })}
                className="w-full accent-[#1E40AF] cursor-pointer bg-[#DFD7C8] h-1.5 rounded"
              />
              <span className="text-[10px] text-[#6C584C]">
                Flag stand overlap conflict if gate turnaround buffer between sorties is under {formState.standOverlapMarginMins} minutes.
              </span>
            </div>

            {/* Weather Ceiling Threshold */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[#362419]">
                <span>IFR Weather Ceiling Closure Threshold:</span>
                <span className="font-bold text-[#1E40AF] bg-[#FFFFFF] px-2 py-0.5 rounded border border-[#DFD7C8]">
                  {formState.weatherCeilingThresholdFt} ft
                </span>
              </div>
              <input
                type="range"
                min={300}
                max={2500}
                step={50}
                value={formState.weatherCeilingThresholdFt}
                onChange={(e) => setFormState({ ...formState, weatherCeilingThresholdFt: Number(e.target.value) })}
                className="w-full accent-[#1E40AF] cursor-pointer bg-[#DFD7C8] h-1.5 rounded"
              />
              <span className="text-[10px] text-[#6C584C]">
                Trigger airfield operational closure alert if base cloud ceiling falls below {formState.weatherCeilingThresholdFt} feet.
              </span>
            </div>
          </div>

          {/* Section 3: Automation Options */}
          <div className="bg-[#F1ECE1] border border-[#DFD7C8] p-3.5 rounded-md flex items-center justify-between cursor-pointer">
            <div>
              <div className="font-bold text-[#362419] text-xs">Auto-Acknowledge Advisory Alerts</div>
              <div className="text-[10px] text-[#6C584C]">Automatically acknowledge minor advisory alerts after 10 minutes.</div>
            </div>
            <input
              type="checkbox"
              checked={formState.autoResolveMinorAlerts}
              onChange={(e) => setFormState({ ...formState, autoResolveMinorAlerts: e.target.checked })}
              className="w-4 h-4 rounded bg-[#FFFFFF] border-[#DFD7C8] text-[#1E40AF] focus:ring-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-[#F8F6F0] border-t border-[#DFD7C8] flex items-center justify-between">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 text-xs text-[#6C584C] hover:text-[#362419] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAlertSettingsModalOpen(false)}
              className="px-3.5 py-1.5 rounded text-xs bg-[#F1ECE1] border border-[#DFD7C8] text-[#362419] hover:bg-[#DFD7C8] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded text-xs bg-[#1E40AF] hover:bg-[#1D4ED8] text-[#FFFFFF] font-bold flex items-center gap-1.5 transition-all shadow-md"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-200" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Thresholds</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
