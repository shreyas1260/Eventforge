import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  DollarSign, 
  Calendar, 
  Users, 
  Sparkles, 
  Sliders, 
  Bot
} from 'lucide-react';
import { FullEventPlan } from './types';
import { getActiveEvent, saveEventPlan, restoreFromSnapshot, clearActiveEvent } from './lib/storage';
import { calculatePlanHealth } from './lib/calculations';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { OverviewTab } from './components/OverviewTab';
import { BudgetTab } from './components/BudgetTab';
import { TimelineTab } from './components/TimelineTab';
import { VendorsTab } from './components/VendorsTab';
import { IdeasTab } from './components/IdeasTab';
import { ScenarioLabTab } from './components/ScenarioLabTab';
import { AIAssistantTab } from './components/AIAssistantTab';
import { WizardModal } from './components/WizardModal';
import { PrintView } from './components/PrintView';

export function App() {
  const [plan, setPlan] = useState<FullEventPlan | null>(() => getActiveEvent());
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showWizard, setShowWizard] = useState<boolean>(false);
  const [isHomeView, setIsHomeView] = useState<boolean>(() => !getActiveEvent());

  useEffect(() => {
    if (plan) {
      saveEventPlan(plan);
    }
  }, [plan]);

  const health = plan
    ? calculatePlanHealth(plan.event, plan.budgetItems, plan.tasks, plan.vendors)
    : null;

  const handlePrint = () => {
    window.print();
  };

  const handlePlanCreated = (newPlan: FullEventPlan) => {
    setPlan(newPlan);
    setIsHomeView(false);
    setActiveTab('overview');
  };

  const handleRestoreSnapshot = (snapshotId: string) => {
    if (!plan) return;
    const restored = restoreFromSnapshot(plan, snapshotId);
    setPlan(restored);
  };

  return (
    <div className="min-h-screen bg-[#F8F7F3] flex flex-col font-sans">
      {plan && <PrintView plan={plan} />}

      <div className="no-print">
        <Navbar
          plan={isHomeView ? null : plan}
          health={isHomeView ? null : health}
          onOpenWizard={() => setShowWizard(true)}
          onGoHome={() => setIsHomeView(true)}
          onPrint={handlePrint}
        />

        {/* Workspace Navigation Tabs - Only visible when an event is planned and active */}
        {!isHomeView && plan && (
          <div className="bg-[#FFFFFF] border-b border-[#E8E6DF] px-3 sm:px-8">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 text-xs scrollbar-none whitespace-nowrap">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex items-center space-x-1.5 py-1.5 px-3 rounded-md font-medium transition-colors ${
                    activeTab === 'overview'
                      ? 'bg-[#94442A] text-white shadow-xs'
                      : 'text-[#777A72] hover:text-[#252722] hover:bg-[#F8F7F3]'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Overview</span>
                </button>

                <button
                  onClick={() => setActiveTab('budget')}
                  className={`flex items-center space-x-1.5 py-1.5 px-3 rounded-md font-medium transition-colors ${
                    activeTab === 'budget'
                      ? 'bg-[#94442A] text-white shadow-xs'
                      : 'text-[#777A72] hover:text-[#252722] hover:bg-[#F8F7F3]'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Budget</span>
                </button>

                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`flex items-center space-x-1.5 py-1.5 px-3 rounded-md font-medium transition-colors ${
                    activeTab === 'timeline'
                      ? 'bg-[#94442A] text-white shadow-xs'
                      : 'text-[#777A72] hover:text-[#252722] hover:bg-[#F8F7F3]'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Timeline & Radar</span>
                </button>

                <button
                  onClick={() => setActiveTab('vendors')}
                  className={`flex items-center space-x-1.5 py-1.5 px-3 rounded-md font-medium transition-colors ${
                    activeTab === 'vendors'
                      ? 'bg-[#94442A] text-white shadow-xs'
                      : 'text-[#777A72] hover:text-[#252722] hover:bg-[#F8F7F3]'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Vendors</span>
                </button>

                <button
                  onClick={() => setActiveTab('ideas')}
                  className={`flex items-center space-x-1.5 py-1.5 px-3 rounded-md font-medium transition-colors ${
                    activeTab === 'ideas'
                      ? 'bg-[#94442A] text-white shadow-xs'
                      : 'text-[#777A72] hover:text-[#252722] hover:bg-[#F8F7F3]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ideas Studio</span>
                </button>

                <button
                  onClick={() => setActiveTab('scenarios')}
                  className={`flex items-center space-x-1.5 py-1.5 px-3 rounded-md font-semibold transition-colors ${
                    activeTab === 'scenarios'
                      ? 'bg-[#94442A] text-white shadow-xs'
                      : 'text-[#94442A] bg-[#FEE2E2]/60 hover:bg-[#FEE2E2]'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>AI Scenario Lab</span>
                </button>

                <button
                  onClick={() => setActiveTab('assistant')}
                  className={`flex items-center space-x-1.5 py-1.5 px-3 rounded-md font-medium transition-colors ${
                    activeTab === 'assistant'
                      ? 'bg-[#94442A] text-white shadow-xs'
                      : 'text-[#777A72] hover:text-[#252722] hover:bg-[#F8F7F3]'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>AI Assistant</span>
                </button>
              </nav>
            </div>
          </div>
        )}

        {/* Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {isHomeView || !plan ? (
            <LandingPage onStartPlanning={() => setShowWizard(true)} />
          ) : (
            <>
              {activeTab === 'overview' && health && (
                <OverviewTab
                  plan={plan}
                  health={health}
                  onNavigateTab={tab => setActiveTab(tab)}
                  onOpenScenarioPreset={() => {
                    setActiveTab('scenarios');
                  }}
                />
              )}

              {activeTab === 'budget' && (
                <BudgetTab
                  budgetLimit={plan.event.budgetLimit}
                  items={plan.budgetItems}
                  onUpdateItems={newItems => setPlan({ ...plan, budgetItems: newItems })}
                  onUpdateBudgetLimit={newLimit =>
                    setPlan({ ...plan, event: { ...plan.event, budgetLimit: newLimit } })
                  }
                />
              )}

              {activeTab === 'timeline' && (
                <TimelineTab
                  tasks={plan.tasks}
                  eventDate={plan.event.eventDate}
                  onUpdateTasks={newTasks => setPlan({ ...plan, tasks: newTasks })}
                />
              )}

              {activeTab === 'vendors' && (
                <VendorsTab
                  vendors={plan.vendors}
                  onUpdateVendors={newVendors => setPlan({ ...plan, vendors: newVendors })}
                />
              )}

              {activeTab === 'ideas' && (
                <IdeasTab
                  ideas={plan.ideas}
                  onUpdateIdeas={newIdeas => setPlan({ ...plan, ideas: newIdeas })}
                  onAddBudgetItem={item =>
                    setPlan({ ...plan, budgetItems: [...plan.budgetItems, item] })
                  }
                  onAddTask={task =>
                    setPlan({ ...plan, tasks: [...plan.tasks, task] })
                  }
                />
              )}

              {activeTab === 'scenarios' && (
                <ScenarioLabTab
                  plan={plan}
                  onApplyScenario={updatedPlan => setPlan(updatedPlan)}
                  onRestoreSnapshot={handleRestoreSnapshot}
                />
              )}

              {activeTab === 'assistant' && (
                <AIAssistantTab plan={plan} />
              )}
            </>
          )}
        </main>
      </div>

      <WizardModal
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onPlanCreated={handlePlanCreated}
      />
    </div>
  );
}
