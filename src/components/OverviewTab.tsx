import React from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Users, 
  ArrowRight,
  TrendingDown,
  Sparkles,
  CloudRain
} from 'lucide-react';
import { FullEventPlan, PlanHealth } from '../types';
import { formatINR, calculateBudgetSummary, calculateTaskSummary } from '../lib/calculations';

interface OverviewTabProps {
  plan: FullEventPlan;
  health: PlanHealth;
  onNavigateTab: (tab: string) => void;
  onOpenScenarioPreset: (scenarioType: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  plan,
  health,
  onNavigateTab,
  onOpenScenarioPreset,
}) => {
  const { event, budgetItems, tasks } = plan;
  const budgetSummary = calculateBudgetSummary(event.budgetLimit, budgetItems);
  const taskSummary = calculateTaskSummary(tasks);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-[#FFFFFF] rounded-xl border border-[#E8E6DF] p-4 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-[#EFF4EE] text-[#40533C]">
                {event.eventType}
              </span>
              <span className="text-xs text-[#777A72] flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1" />
                {event.location}
              </span>
              <span className="text-xs text-[#777A72] flex items-center">
                <Users className="w-3.5 h-3.5 mr-1" />
                {event.guestCount} Guests
              </span>
              <span className="text-xs text-[#777A72] capitalize">
                • {event.venueType} Venue
              </span>
            </div>
            <h1 className="font-editorial text-xl sm:text-2xl md:text-3xl font-medium text-[#252722]">
              {event.name}
            </h1>
            <p className="text-xs sm:text-sm text-[#777A72] max-w-3xl leading-relaxed">
              {event.description || 'Structured digital planning model ready for budgeting, vendor tracking, and scenario stress-testing.'}
            </p>
          </div>

          <div className="bg-[#F8F7F3] rounded-lg p-3 sm:p-3.5 border border-[#E8E6DF] flex flex-col space-y-2 shrink-0 lg:w-72">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-[#94442A]" />
                <span className="text-xs font-semibold text-[#252722]">AI Event Twin Ready</span>
              </div>
              <span className="text-[10px] uppercase font-semibold text-[#788A72]">Simulate</span>
            </div>
            <p className="text-[11px] text-[#777A72]">
              Simulate disruptions before altering your actual event plan.
            </p>
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button
                onClick={() => onOpenScenarioPreset('budget_reduction')}
                className="py-1.5 px-2 rounded bg-white hover:bg-[#EFECE5] text-[#252722] text-[11px] font-medium border border-[#E8E6DF] flex items-center justify-center space-x-1 transition-colors"
                title="Simulate 20% budget reduction"
              >
                <TrendingDown className="w-3 h-3 text-[#94442A]" />
                <span>-20% Budget</span>
              </button>
              <button
                onClick={() => onOpenScenarioPreset('bad_weather')}
                className="py-1.5 px-2 rounded bg-white hover:bg-[#EFECE5] text-[#252722] text-[11px] font-medium border border-[#E8E6DF] flex items-center justify-center space-x-1 transition-colors"
                title="Simulate outdoor rain contingency"
              >
                <CloudRain className="w-3 h-3 text-[#52634D]" />
                <span>Rain Plan</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg border border-[#E8E6DF] p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#777A72] text-[11px] sm:text-xs mb-1">
            <span>Planned Spending</span>
            <span className="text-[10px] font-mono">{budgetSummary.usagePercentage}%</span>
          </div>
          <p className="text-lg sm:text-xl font-semibold text-[#252722] tabular-nums">
            {formatINR(budgetSummary.totalPlanned)}
          </p>
          <div className="w-full bg-[#EFECE5] h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className={`h-full rounded-full ${budgetSummary.isOverBudget ? 'bg-[#DC2626]' : 'bg-[#94442A]'}`}
              style={{ width: `${Math.min(100, budgetSummary.usagePercentage)}%` }}
            />
          </div>
          <p className="text-[10px] text-[#777A72] mt-1.5 truncate">
            Limit: {formatINR(event.budgetLimit)}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-[#E8E6DF] p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#777A72] text-[11px] sm:text-xs mb-1">
            <span>Remaining Buffer</span>
            <span className={`text-[9px] sm:text-[10px] font-semibold ${budgetSummary.isOverBudget ? 'text-[#DC2626]' : 'text-[#788A72]'}`}>
              {budgetSummary.isOverBudget ? 'OVER' : 'AVAILABLE'}
            </span>
          </div>
          <p className={`text-lg sm:text-xl font-semibold tabular-nums ${budgetSummary.isOverBudget ? 'text-[#DC2626]' : 'text-[#252722]'}`}>
            {formatINR(budgetSummary.remainingBudget)}
          </p>
          <p className="text-[10px] sm:text-[11px] text-[#777A72] mt-2 sm:mt-3 truncate">
            {budgetSummary.isOverBudget
              ? `Exceeds by ${formatINR(budgetSummary.overageAmount)}`
              : `${formatINR(budgetSummary.remainingBudget)} buffer`}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-[#E8E6DF] p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#777A72] text-[11px] sm:text-xs mb-1">
            <span>Actual Spending</span>
            <span className="text-[10px] text-[#788A72]">Recorded</span>
          </div>
          <p className="text-lg sm:text-xl font-semibold text-[#252722] tabular-nums">
            {formatINR(budgetSummary.totalActual)}
          </p>
          <p className="text-[10px] sm:text-[11px] text-[#777A72] mt-2 sm:mt-3 truncate">
            {Math.round((budgetSummary.totalActual / (budgetSummary.totalPlanned || 1)) * 100)}% disbursed
          </p>
        </div>

        <div className="bg-white rounded-lg border border-[#E8E6DF] p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#777A72] text-[11px] sm:text-xs mb-1">
            <span>Preparation Radar</span>
            <span className="text-[10px] text-[#555850]">{taskSummary.completed}/{taskSummary.total} Done</span>
          </div>
          <div className="flex items-baseline space-x-1.5 sm:space-x-2">
            <p className="text-lg sm:text-xl font-semibold text-[#252722] tabular-nums">
              {taskSummary.completionPercentage}%
            </p>
            {taskSummary.overdue > 0 && (
              <span className="text-[10px] font-semibold text-[#DC2626] bg-[#FEE2E2] px-1 py-0.5 rounded truncate">
                {taskSummary.overdue} Overdue
              </span>
            )}
          </div>
          <p className="text-[10px] sm:text-[11px] text-[#777A72] mt-2 sm:mt-3 truncate">
            {taskSummary.dueSoon > 0 ? `${taskSummary.dueSoon} tasks due soon` : 'All on track'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl border border-[#E8E6DF] p-4 sm:p-5 shadow-xs lg:col-span-1 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8E6DF] pb-2.5 sm:pb-3">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-[#94442A]" />
              <h3 className="font-editorial text-base sm:text-lg font-medium text-[#252722]">Plan Health Score</h3>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EFECE5] text-[#555850]">
              Rule-Derived
            </span>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 border-[#94442A] flex items-center justify-center bg-[#F8F7F3] shrink-0">
              <span className="font-editorial text-xl sm:text-2xl font-bold text-[#252722] tabular-nums">
                {health.overallScore}
              </span>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-[#252722]">{health.rating}</p>
              <p className="text-[11px] text-[#777A72] leading-tight">
                Evaluates budget limits, overdue deadlines, and contingency backups.
              </p>
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2 text-xs pt-1">
            <div className="p-2 sm:p-2.5 rounded-md bg-[#F8F7F3] border border-[#E8E6DF] space-y-0.5">
              <div className="flex justify-between font-medium">
                <span className="text-[#555850]">Budget Allocation:</span>
                <span className="tabular-nums font-semibold">{health.budgetHealth.score}/{health.budgetHealth.maxScore} pts</span>
              </div>
              <p className="text-[11px] text-[#777A72]">{health.budgetHealth.message}</p>
            </div>

            <div className="p-2 sm:p-2.5 rounded-md bg-[#F8F7F3] border border-[#E8E6DF] space-y-0.5">
              <div className="flex justify-between font-medium">
                <span className="text-[#555850]">Timeline Radar:</span>
                <span className="tabular-nums font-semibold">{health.timelineHealth.score}/{health.timelineHealth.maxScore} pts</span>
              </div>
              <p className="text-[11px] text-[#777A72]">{health.timelineHealth.message}</p>
            </div>

            <div className="p-2 sm:p-2.5 rounded-md bg-[#F8F7F3] border border-[#E8E6DF] space-y-0.5">
              <div className="flex justify-between font-medium">
                <span className="text-[#555850]">Vendor Confirmation:</span>
                <span className="tabular-nums font-semibold">{health.vendorHealth.score}/{health.vendorHealth.maxScore} pts</span>
              </div>
              <p className="text-[11px] text-[#777A72]">{health.vendorHealth.message}</p>
            </div>

            <div className="p-2 sm:p-2.5 rounded-md bg-[#F8F7F3] border border-[#E8E6DF] space-y-0.5">
              <div className="flex justify-between font-medium">
                <span className="text-[#555850]">Contingency Reserve:</span>
                <span className="tabular-nums font-semibold">{health.contingencyHealth.score}/{health.contingencyHealth.maxScore} pts</span>
              </div>
              <p className="text-[11px] text-[#777A72]">{health.contingencyHealth.message}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E8E6DF] p-4 sm:p-5 shadow-xs lg:col-span-2 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8E6DF] pb-2.5 sm:pb-3">
            <h3 className="font-editorial text-base sm:text-lg font-medium text-[#252722]">Recommended Actions</h3>
            <span className="text-xs text-[#777A72]">
              {health.deductions.length} items to optimize
            </span>
          </div>

          {health.deductions.length === 0 ? (
            <div className="p-6 text-center text-[#788A72] bg-[#EFF4EE] rounded-lg border border-[#D8E2D5]">
              <p className="text-sm font-semibold">Your plan is in pristine condition!</p>
              <p className="text-xs text-[#40533C] mt-1">All budget allocations, deadlines, and contingency reserves are balanced.</p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {health.deductions.map((d, index) => (
                <div key={index} className="p-3 sm:p-3.5 rounded-lg border border-[#E8E6DF] hover:border-[#94442A] transition-colors bg-[#FAF9F6] flex items-start justify-between gap-2">
                  <div className="space-y-0.5 sm:space-y-1">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[11px] sm:text-xs font-semibold text-[#DC2626]">-{d.points} pts</span>
                      <span className="text-xs font-medium text-[#252722]">{d.reason}</span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-[#777A72] leading-relaxed">{d.recommendation}</p>
                  </div>
                  <button
                    onClick={() => {
                      if (d.reason.includes('budget') || d.reason.includes('Contingency')) onNavigateTab('budget');
                      else if (d.reason.includes('deadline') || d.reason.includes('Overdue')) onNavigateTab('timeline');
                      else if (d.reason.includes('vendor')) onNavigateTab('vendors');
                      else onNavigateTab('scenarios');
                    }}
                    className="p-1.5 rounded hover:bg-[#EFECE5] text-[#94442A] shrink-0"
                    title="Jump to section"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-[#E8E6DF]">
            <div className="p-3 rounded-lg bg-[#EFF4EE] border border-[#D8E2D5] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <p className="text-xs font-semibold text-[#40533C]">Explore Alternate Futures in Scenario Lab</p>
                <p className="text-[11px] text-[#52634D]">Simulate price spikes, heavy rain, or vendor drops without changing your live plan.</p>
              </div>
              <button
                onClick={() => onNavigateTab('scenarios')}
                className="px-3 py-1.5 rounded-md text-xs font-medium bg-[#52634D] text-white hover:bg-[#40533C] shadow-xs flex items-center justify-center space-x-1 shrink-0"
              >
                <span>Open Twin Lab</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
