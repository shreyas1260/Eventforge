import React, { useState } from 'react';
import { 
  TrendingDown, 
  CloudRain, 
  Users, 
  UserX, 
  Check, 
  RotateCcw
} from 'lucide-react';
import { FullEventPlan, Scenario, ScenarioType } from '../types';
import { formatINR, calculateBudgetSummary } from '../lib/calculations';
import { createSnapshot } from '../lib/storage';

interface ScenarioLabTabProps {
  plan: FullEventPlan;
  onApplyScenario: (updatedPlan: FullEventPlan) => void;
  onRestoreSnapshot: (snapshotId: string) => void;
}

export const ScenarioLabTab: React.FC<ScenarioLabTabProps> = ({
  plan,
  onApplyScenario,
  onRestoreSnapshot,
}) => {
  const { event, budgetItems, tasks, vendors, ideas, snapshots } = plan;

  const [activeScenarioType, setActiveScenarioType] = useState<ScenarioType>('budget_reduction');
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(plan.activeScenario || null);

  const reducedBudget = Math.round(event.budgetLimit * 0.8);
  const addedGuests = 40;
  const cancelledVendor = 'Catering';

  const runSimulation = async (type: ScenarioType) => {
    setIsSimulating(true);
    try {
      const scenarioInput: Record<string, unknown> = {};
      if (type === 'budget_reduction') scenarioInput.newBudgetLimit = reducedBudget;
      if (type === 'increased_guests') scenarioInput.addedGuests = addedGuests;
      if (type === 'vendor_cancellation') scenarioInput.cancelledVendorCategory = cancelledVendor;

      const response = await fetch('/api/generate-scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPlan: plan,
          scenarioType: type,
          scenarioInput,
        }),
      });

      const resData = await response.json();
      if (!resData.success) {
        throw new Error(resData.error || 'Failed to simulate scenario');
      }

      setActiveScenario(resData.scenario);
    } catch (err: any) {
      alert(`Simulation error: ${err.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  const toggleBudgetChange = (id: string) => {
    if (!activeScenario) return;
    const updated = activeScenario.proposedBudgetChanges.map(c =>
      c.id === id ? { ...c, selectedForApply: !c.selectedForApply } : c
    );
    setActiveScenario({ ...activeScenario, proposedBudgetChanges: updated });
  };

  const toggleTaskChange = (id: string) => {
    if (!activeScenario) return;
    const updated = activeScenario.proposedTaskChanges.map(c =>
      c.id === id ? { ...c, selectedForApply: !c.selectedForApply } : c
    );
    setActiveScenario({ ...activeScenario, proposedTaskChanges: updated });
  };

  const handleApplyChanges = () => {
    if (!activeScenario) return;

    const safetySnapshot = createSnapshot(plan, `Before applying: ${activeScenario.title}`);

    let newBudgetItems = [...budgetItems];
    let newTasks = [...tasks];
    let newVendors = [...vendors];
    const newEvent = { ...event };

    if (activeScenario.scenarioType === 'budget_reduction' && activeScenario.scenarioInput.newBudgetLimit) {
      newEvent.budgetLimit = activeScenario.scenarioInput.newBudgetLimit;
    }
    if (activeScenario.scenarioType === 'increased_guests' && activeScenario.scenarioInput.addedGuests) {
      newEvent.guestCount = event.guestCount + activeScenario.scenarioInput.addedGuests;
    }

    activeScenario.proposedBudgetChanges.forEach(bc => {
      if (!bc.selectedForApply) return;
      if (bc.action === 'modify') {
        newBudgetItems = newBudgetItems.map(item =>
          item.id === bc.id
            ? { ...item, plannedAmount: bc.proposedAmount, notes: `${item.notes || ''} [Adapted via Scenario Lab: ${bc.reason}]`.trim() }
            : item
        );
      } else if (bc.action === 'add') {
        newBudgetItems.push({
          id: bc.id,
          eventId: event.id,
          category: bc.item.category,
          description: bc.item.description,
          plannedAmount: bc.proposedAmount,
          actualAmount: 0,
          priority: 'high',
          status: 'planned',
          notes: bc.reason,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    });

    activeScenario.proposedTaskChanges.forEach(tc => {
      if (!tc.selectedForApply) return;
      if (tc.action === 'add') {
        newTasks.push({
          id: tc.id,
          eventId: event.id,
          title: tc.task.title,
          description: `${tc.task.description || ''} (Scenario Lab adaptation)`.trim(),
          dueDate: tc.task.dueDate,
          priority: tc.task.priority || 'high',
          status: 'not_started',
          category: tc.task.category || 'Contingency',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    });

    activeScenario.proposedVendorChanges.forEach(vc => {
      if (!vc.selectedForApply) return;
      if (vc.action === 'add') {
        newVendors.push({
          id: vc.id,
          eventId: event.id,
          category: vc.vendor.category,
          description: vc.vendor.description,
          decisionDeadline: vc.vendor.decisionDeadline || new Date().toISOString().split('T')[0],
          priority: 'high',
          status: 'researching',
          quotedAmount: vc.vendor.quotedAmount || 0,
          contactNotes: vc.reason,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    });

    const updatedPlan: FullEventPlan = {
      event: newEvent,
      budgetItems: newBudgetItems,
      tasks: newTasks,
      vendors: newVendors,
      ideas,
      snapshots: [...snapshots, safetySnapshot],
      activeScenario: undefined,
    };

    onApplyScenario(updatedPlan);
    setActiveScenario(null);
    alert('Approved scenario changes applied to your live plan. A snapshot was saved for rollback.');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-[#E8E6DF] p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-[#94442A] text-white">
                Decision Support
              </span>
              <span className="text-xs text-[#777A72]">Non-destructive AI Event Twin</span>
            </div>
            <h2 className="font-editorial text-2xl font-medium text-[#252722]">
              AI Event Twin & Scenario Lab
            </h2>
            <p className="text-xs sm:text-sm text-[#777A72] max-w-2xl leading-relaxed">
              Stress-test unexpected challenges before changing your actual plan. Compare original vs. proposed side-by-side and selectively approve adjustments.
            </p>
          </div>

          {snapshots.length > 0 && (
            <div className="flex items-center space-x-2 text-xs text-[#555850] bg-[#F8F7F3] p-2.5 rounded-lg border border-[#E8E6DF]">
              <RotateCcw className="w-4 h-4 text-[#788A72]" />
              <span>{snapshots.length} Safety Snapshots available</span>
              <button
                onClick={() => {
                  const lastSnap = snapshots[snapshots.length - 1];
                  if (confirm(`Restore plan to Version #${lastSnap.versionNumber} ("${lastSnap.changeSummary}")?`)) {
                    onRestoreSnapshot(lastSnap.id);
                  }
                }}
                className="text-xs text-[#94442A] font-semibold hover:underline ml-1"
              >
                Rollback
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mt-4 sm:mt-6">
          <button
            onClick={() => {
              setActiveScenarioType('budget_reduction');
              runSimulation('budget_reduction');
            }}
            disabled={isSimulating}
            className={`p-3 rounded-lg border text-left transition-all ${
              activeScenarioType === 'budget_reduction' && activeScenario
                ? 'bg-[#F8F7F3] border-[#94442A] ring-1 ring-[#94442A]'
                : 'bg-white border-[#E8E6DF] hover:border-[#94442A]/60'
            }`}
          >
            <div className="flex items-center space-x-2 text-[#94442A] mb-1">
              <TrendingDown className="w-4 h-4" />
              <span className="text-xs font-semibold">Budget Reduction</span>
            </div>
            <p className="text-[11px] text-[#777A72]">Cut budget by 20% while safeguarding primary venue & food.</p>
          </button>

          <button
            onClick={() => {
              setActiveScenarioType('bad_weather');
              runSimulation('bad_weather');
            }}
            disabled={isSimulating}
            className={`p-3 rounded-lg border text-left transition-all ${
              activeScenarioType === 'bad_weather' && activeScenario
                ? 'bg-[#F8F7F3] border-[#52634D] ring-1 ring-[#52634D]'
                : 'bg-white border-[#E8E6DF] hover:border-[#52634D]/60'
            }`}
          >
            <div className="flex items-center space-x-2 text-[#52634D] mb-1">
              <CloudRain className="w-4 h-4" />
              <span className="text-xs font-semibold">Rain Contingency</span>
            </div>
            <p className="text-[11px] text-[#777A72]">Shift outdoor setups to waterproof canopy and indoor shelter.</p>
          </button>

          <button
            onClick={() => {
              setActiveScenarioType('increased_guests');
              runSimulation('increased_guests');
            }}
            disabled={isSimulating}
            className={`p-3 rounded-lg border text-left transition-all ${
              activeScenarioType === 'increased_guests' && activeScenario
                ? 'bg-[#F8F7F3] border-[#B15F00] ring-1 ring-[#B15F00]'
                : 'bg-white border-[#E8E6DF] hover:border-[#B15F00]/60'
            }`}
          >
            <div className="flex items-center space-x-2 text-[#B15F00] mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs font-semibold">+40 Extra Guests</span>
            </div>
            <p className="text-[11px] text-[#777A72]">Recalculate catering plates, dining tables, and venue capacity.</p>
          </button>

          <button
            onClick={() => {
              setActiveScenarioType('vendor_cancellation');
              runSimulation('vendor_cancellation');
            }}
            disabled={isSimulating}
            className={`p-3 rounded-lg border text-left transition-all ${
              activeScenarioType === 'vendor_cancellation' && activeScenario
                ? 'bg-[#F8F7F3] border-[#DC2626] ring-1 ring-[#DC2626]'
                : 'bg-white border-[#E8E6DF] hover:border-[#DC2626]/60'
            }`}
          >
            <div className="flex items-center space-x-2 text-[#DC2626] mb-1">
              <UserX className="w-4 h-4" />
              <span className="text-xs font-semibold">Vendor Cancelled</span>
            </div>
            <p className="text-[11px] text-[#777A72]">Rapid replacement checklist and timeline shift for lead supplier.</p>
          </button>
        </div>
      </div>

      {isSimulating && (
        <div className="p-12 text-center bg-white rounded-xl border border-[#E8E6DF] space-y-3">
          <div className="w-8 h-8 border-3 border-[#94442A] border-t-transparent rounded-full animate-spin mx-auto" />
          <h3 className="font-editorial text-lg font-medium text-[#252722]">Event Twin Calculating Alternate Plan...</h3>
          <p className="text-xs text-[#777A72]">Preserving original plan while calculating budget and schedule diffs.</p>
        </div>
      )}

      {activeScenario && !isSimulating && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-[#EFF4EE] border border-[#D8E2D5] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-[#40533C] text-white">
                  Simulation Draft
                </span>
                <span className="text-xs text-[#40533C] font-semibold">{activeScenario.title}</span>
              </div>
              <p className="text-xs text-[#52634D] leading-relaxed max-w-3xl">
                {activeScenario.rationale}
              </p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => setActiveScenario(null)}
                className="px-3 py-1.5 rounded-md text-xs font-medium bg-white text-[#252722] border border-[#E8E6DF] hover:bg-[#F8F7F3]"
              >
                Discard Simulation
              </button>
              <button
                onClick={handleApplyChanges}
                className="px-4 py-1.5 rounded-md text-xs font-medium bg-[#94442A] text-white hover:bg-[#B35C40] shadow-xs flex items-center space-x-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply Selected Changes</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-[#E8E6DF] p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E8E6DF] pb-3">
                <h3 className="font-editorial text-lg font-medium text-[#252722]">Original Plan (Current)</h3>
                <span className="text-[10px] uppercase font-semibold text-[#777A72] bg-[#F8F7F3] px-2 py-0.5 rounded">
                  Live Baseline
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-[#E8E6DF]">
                  <span className="text-[#777A72]">Budget Ceiling:</span>
                  <span className="font-semibold text-[#252722] tabular-nums">{formatINR(activeScenario.recalculatedTotals.originalLimit)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#E8E6DF]">
                  <span className="text-[#777A72]">Planned Spending:</span>
                  <span className="font-semibold text-[#252722] tabular-nums">{formatINR(activeScenario.recalculatedTotals.originalPlanned)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#E8E6DF]">
                  <span className="text-[#777A72]">Remaining Buffer:</span>
                  <span className="font-semibold text-[#40533C] tabular-nums">{formatINR(activeScenario.recalculatedTotals.originalRemaining)}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-[#777A72]">Total Scheduled Tasks:</span>
                  <span className="font-semibold text-[#252722]">{tasks.length} tasks</span>
                </div>
              </div>
            </div>

            <div className="bg-[#FAF9F6] rounded-xl border-2 border-[#94442A] p-5 shadow-xs space-y-4 relative">
              <div className="flex items-center justify-between border-b border-[#E8E6DF] pb-3">
                <h3 className="font-editorial text-lg font-medium text-[#94442A]">Proposed Alternative (Twin)</h3>
                <span className="text-[10px] uppercase font-semibold text-[#94442A] bg-[#FEE2E2] px-2 py-0.5 rounded">
                  Simulation Active
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-[#E8E6DF]">
                  <span className="text-[#777A72]">Proposed Limit:</span>
                  <span className="font-semibold text-[#252722] tabular-nums">{formatINR(activeScenario.recalculatedTotals.proposedLimit)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#E8E6DF]">
                  <span className="text-[#777A72]">Recalculated Spending:</span>
                  <div className="text-right">
                    <span className="font-semibold text-[#252722] tabular-nums">{formatINR(activeScenario.recalculatedTotals.proposedPlanned)}</span>
                    <span className={`text-[10px] ml-1.5 font-semibold ${activeScenario.recalculatedTotals.difference < 0 ? 'text-[#40533C]' : 'text-[#94442A]'}`}>
                      ({activeScenario.recalculatedTotals.difference > 0 ? '+' : ''}{formatINR(activeScenario.recalculatedTotals.difference)})
                    </span>
                  </div>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#E8E6DF]">
                  <span className="text-[#777A72]">Recalculated Buffer:</span>
                  <span className={`font-semibold tabular-nums ${activeScenario.recalculatedTotals.isOverBudget ? 'text-[#DC2626]' : 'text-[#40533C]'}`}>
                    {formatINR(activeScenario.recalculatedTotals.proposedRemaining)}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-[#777A72]">Net Action Changes:</span>
                  <span className="font-semibold text-[#94442A]">
                    +{activeScenario.proposedTaskChanges.length} tasks, +{activeScenario.proposedVendorChanges.length} vendor reviews
                  </span>
                </div>
              </div>
            </div>
          </div>

          {activeScenario.proposedBudgetChanges.length > 0 && (
            <div className="bg-white rounded-xl border border-[#E8E6DF] p-5 shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b border-[#E8E6DF] pb-3">
                <h3 className="font-editorial text-lg font-medium text-[#252722]">Proposed Budget Adjustments</h3>
                <span className="text-xs text-[#777A72]">Check items to approve</span>
              </div>

              <div className="space-y-3">
                {activeScenario.proposedBudgetChanges.map(change => (
                  <div 
                    key={change.id}
                    onClick={() => toggleBudgetChange(change.id)}
                    className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-start space-x-3 ${
                      change.selectedForApply 
                        ? 'bg-[#EFF4EE] border-[#788A72]' 
                        : 'bg-white border-[#E8E6DF] opacity-60'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={change.selectedForApply}
                      onChange={() => toggleBudgetChange(change.id)}
                      className="mt-1 w-4 h-4 rounded text-[#94442A] focus:ring-[#94442A]"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs font-semibold text-[#252722]">{change.item.description}</span>
                        <div className="text-right">
                          <span className="text-xs font-semibold tabular-nums text-[#252722]">
                            {formatINR(change.proposedAmount)}
                          </span>
                          <span className={`text-[10px] font-bold ml-1.5 ${change.difference < 0 ? 'text-[#40533C]' : 'text-[#94442A]'}`}>
                            ({change.difference > 0 ? '+' : ''}{formatINR(change.difference)})
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-[#555850]">{change.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeScenario.proposedTaskChanges.length > 0 && (
            <div className="bg-white rounded-xl border border-[#E8E6DF] p-5 shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b border-[#E8E6DF] pb-3">
                <h3 className="font-editorial text-lg font-medium text-[#252722]">Proposed Milestone & Action Tasks</h3>
                <span className="text-xs text-[#777A72]">Check tasks to inject into Timeline</span>
              </div>

              <div className="space-y-3">
                {activeScenario.proposedTaskChanges.map(change => (
                  <div 
                    key={change.id}
                    onClick={() => toggleTaskChange(change.id)}
                    className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-start space-x-3 ${
                      change.selectedForApply 
                        ? 'bg-[#EFF4EE] border-[#788A72]' 
                        : 'bg-white border-[#E8E6DF] opacity-60'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={change.selectedForApply}
                      onChange={() => toggleTaskChange(change.id)}
                      className="mt-1 w-4 h-4 rounded text-[#94442A] focus:ring-[#94442A]"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs font-semibold text-[#252722]">{change.task.title}</span>
                        <span className="text-[10px] text-[#777A72]">{change.task.dueDate}</span>
                      </div>
                      <p className="text-xs text-[#555850]">{change.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
