import React, { useEffect, useState } from 'react';
import { 
  X, 
  HelpCircle, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Database, 
  FileText, 
  Send 
} from 'lucide-react';
import { usePlannerStore } from '../../store/usePlannerStore';

export const ExplainabilityDrawer: React.FC = () => {
  const { 
    explainDrawerOpen, 
    closeExplainDrawer, 
    explainTaskId, 
    activeRole 
  } = usePlannerStore();

  const [explanation, setExplanation] = useState<any>(null);
  const [approvalNote, setApprovalNote] = useState('');
  const [approvedSuccess, setApprovedSuccess] = useState(false);

  useEffect(() => {
    if (explainDrawerOpen && explainTaskId) {
      fetch(`/api/explain/${explainTaskId}`)
        .then(r => r.json())
        .then(data => setExplanation(data))
        .catch(err => console.error(err));
    }
  }, [explainDrawerOpen, explainTaskId]);

  if (!explainDrawerOpen) return null;

  const handleApprovePlan = async () => {
    try {
      await fetch('/api/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planName: `Task ${explainTaskId} Allocation`,
          user: 'J. SMITH',
          role: activeRole,
          reason: approvalNote || 'Approved after human-in-the-loop explainability review.'
        })
      });
      setApprovedSuccess(true);
      setTimeout(() => {
        setApprovedSuccess(false);
        closeExplainDrawer();
      }, 1200);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#362419]/50 backdrop-blur-sm z-50 flex justify-end">
      <div className="w-full max-w-xl bg-[#FFFFFF] border-l border-[#DFD7C8] h-full flex flex-col p-4 overflow-y-auto text-xs shadow-2xl text-[#362419]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#DFD7C8] pb-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#1E40AF]" />
            <div>
              <h2 className="font-bold text-sm text-[#362419] uppercase tracking-wider">
                DECISION EXPLAINABILITY & PROVENANCE
              </h2>
              <span className="text-[10px] text-[#6C584C] font-mono">
                Task ID: {explainTaskId || 'ULA-3280'}
              </span>
            </div>
          </div>
          <button
            onClick={closeExplainDrawer}
            className="p-1 rounded text-[#6C584C] hover:text-[#362419] hover:bg-[#F1ECE1]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {explanation ? (
          <div className="flex flex-col gap-4 mt-4 text-[#362419]">
            {/* Target Assignment Box */}
            <div className="bg-[#F1ECE1] border border-[#DFD7C8] rounded p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between font-mono">
                <span className="font-bold text-[#362419] text-sm">
                  Assignment: {explanation.assignedAircraftId}
                </span>
                <span className="bg-[#1E40AF] text-[#FFFFFF] px-2 py-0.5 rounded font-bold">
                  {explanation.provenance}
                </span>
              </div>
              <p className="text-[#6C584C] text-xs">
                Allocated to task <span className="text-[#362419] font-semibold">{explanation.taskName}</span> satisfying asset availability, airframe qualification match, and weather minima parameters.
              </p>
            </div>

            {/* Input Data Sources */}
            <div className="flex flex-col gap-1.5">
              <span className="font-bold text-[#1E40AF] uppercase text-[10px] tracking-wider flex items-center gap-1">
                <Database className="w-3.5 h-3.5" /> Source Data Records Used
              </span>
              <div className="flex flex-col gap-1 font-mono text-[11px]">
                {explanation.sourceRecords?.map((rec: any, idx: number) => (
                  <div key={idx} className="bg-[#F8F6F0] border border-[#DFD7C8] p-2 rounded flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[#362419]">{rec.id}</span>
                      <span className="text-[#6C584C] ml-2">({rec.source})</span>
                    </div>
                    <span className="text-[#6C584C]">{rec.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Binding Constraints */}
            <div className="flex flex-col gap-1.5">
              <span className="font-bold text-[#362419] uppercase text-[10px] tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1E40AF]" /> Binding Constraints (Satisfied)
              </span>
              <ul className="list-disc list-inside bg-[#F8F6F0] border border-[#DFD7C8] p-2.5 rounded text-[11px] text-[#362419] space-y-1 font-mono">
                {explanation.bindingConstraints?.map((c: string, idx: number) => (
                  <li key={idx}>{c}</li>
                ))}
              </ul>
            </div>

            {/* Rejected Alternatives */}
            <div className="flex flex-col gap-1.5">
              <span className="font-bold text-red-800 uppercase text-[10px] tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" /> Rejected Alternatives & Reasons
              </span>
              <div className="flex flex-col gap-1 font-mono text-[11px]">
                {explanation.rejectedAlternatives?.map((alt: any, idx: number) => (
                  <div key={idx} className="bg-red-50 border border-red-200 p-2 rounded text-red-900">
                    {alt.reason}
                  </div>
                ))}
              </div>
            </div>

            {/* Sensitivity List */}
            <div className="flex flex-col gap-1.5">
              <span className="font-bold text-[#1E40AF] uppercase text-[10px] tracking-wider flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" /> What Would Change This Decision? (Sensitivity)
              </span>
              <ul className="list-disc list-inside bg-[#F8F6F0] border border-[#DFD7C8] p-2.5 rounded text-[11px] text-[#362419] space-y-1 font-mono">
                {explanation.sensitivityFactors?.map((s: string, idx: number) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>

            {/* Human In The Loop Actions */}
            <div className="border-t border-[#DFD7C8] pt-3 flex flex-col gap-2 mt-2">
              <span className="font-bold text-[#362419] uppercase text-[10px]">
                Human-in-the-Loop Approval Action
              </span>
              <input
                type="text"
                value={approvalNote}
                onChange={(e) => setApprovalNote(e.target.value)}
                placeholder="Optional approval note or operational reason..."
                className="bg-[#F8F6F0] border border-[#DFD7C8] text-[#362419] px-3 py-1.5 rounded focus:ring-1 focus:ring-[#1E40AF] font-mono"
              />

              <div className="flex items-center gap-2">
                <button
                  onClick={handleApprovePlan}
                  className="bg-[#1E40AF] hover:bg-[#1D4ED8] text-[#FFFFFF] font-bold py-2 px-4 rounded transition-colors flex items-center gap-1.5 flex-1 justify-center shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve Allocation ({activeRole})
                </button>
                <button
                  onClick={closeExplainDrawer}
                  className="bg-[#F1ECE1] hover:bg-[#DFD7C8] text-[#362419] py-2 px-4 rounded font-bold transition-colors border border-[#DFD7C8]"
                >
                  Reject / Close
                </button>
              </div>

              {approvedSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2 rounded text-center font-bold font-mono">
                  ✓ Approval written to Audit Log
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-[#6C584C] font-mono">
            Loading explainability graph...
          </div>
        )}
      </div>
    </div>
  );
};
