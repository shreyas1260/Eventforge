import React from 'react';
import { Calendar, Sparkles, FileDown, PlusCircle, ShieldCheck, ArrowLeft, Home } from 'lucide-react';
import { FullEventPlan, PlanHealth } from '../types';
import { getDaysUntil } from '../lib/calculations';

interface NavbarProps {
  plan: FullEventPlan | null;
  health: PlanHealth | null;
  onOpenWizard: () => void;
  onGoHome: () => void;
  onPrint: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  plan,
  health,
  onOpenWizard,
  onGoHome,
  onPrint,
}) => {
  const daysUntil = plan ? getDaysUntil(plan.event.eventDate) : 0;

  const getHealthBadgeColor = () => {
    if (!health) return '';
    if (health.overallScore >= 80) return 'bg-[#EFF4EE] text-[#40533C] border-[#D8E2D5]';
    if (health.overallScore >= 60) return 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]';
    return 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]';
  };

  return (
    <header className="border-b border-[#E8E6DF] bg-[#FFFFFF] sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer shrink-0" onClick={onGoHome}>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-md bg-[#94442A] flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFFDF9]" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="font-editorial text-lg sm:text-xl font-semibold tracking-tight text-[#252722]">EventForge AI</span>
                <span className="hidden sm:inline-block text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-[#EFECE5] text-[#555850]">
                  Decision Twin
                </span>
              </div>
              <p className="text-[11px] text-[#777A72] hidden md:block">Plan the event. Prepare for anything.</p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 sm:space-x-3">
            {plan && health ? (
              <>
                <button
                  onClick={onGoHome}
                  className="flex items-center space-x-1 p-1.5 sm:px-2.5 sm:py-1.5 rounded-md text-xs font-medium text-[#777A72] hover:text-[#252722] hover:bg-[#F3F1EB] transition-colors"
                  title="Return to Home screen"
                >
                  <Home className="w-4 h-4 sm:hidden" />
                  <span className="hidden sm:flex items-center space-x-1">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Home</span>
                  </span>
                </button>

                <div 
                  className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getHealthBadgeColor()}`}
                  title="Deterministic Plan Health Score"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{health.overallScore}/100</span>
                  <span className="text-[10px] opacity-80 hidden lg:inline">({health.rating})</span>
                </div>

                <div className="hidden lg:flex items-center space-x-1 px-2.5 py-1 rounded-md bg-[#F3F1EB] text-xs font-medium text-[#555850]">
                  <Calendar className="w-3.5 h-3.5 text-[#94442A]" />
                  <span>{daysUntil > 0 ? `${daysUntil}d left` : daysUntil === 0 ? 'Today!' : `${Math.abs(daysUntil)}d ago`}</span>
                </div>

                <button
                  onClick={onPrint}
                  className="p-1.5 sm:px-3 sm:py-1.5 rounded-md text-xs font-medium text-[#252722] hover:bg-[#F3F1EB] border border-[#E8E6DF] flex items-center space-x-1 transition-colors shadow-xs"
                  title="Download / Export as PDF"
                >
                  <FileDown className="w-3.5 h-3.5 text-[#94442A]" />
                  <span className="hidden sm:inline">Export PDF</span>
                </button>

                <button
                  onClick={onOpenWizard}
                  className="px-2.5 py-1.5 sm:px-3.5 sm:py-1.5 rounded-md text-xs font-medium bg-[#94442A] text-white hover:bg-[#B35C40] flex items-center space-x-1 transition-colors shadow-xs"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">New Event</span>
                  <span className="sm:hidden">New</span>
                </button>
              </>
            ) : (
              <button
                onClick={onOpenWizard}
                className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs font-medium bg-[#94442A] text-white hover:bg-[#B35C40] flex items-center space-x-1.5 transition-colors shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Plan Event</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
