import React from 'react';
import { ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onStartPlanning: () => void;
  onExploreSample?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartPlanning,
}) => {
  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="pt-10 sm:pt-16 pb-8 text-center max-w-4xl mx-auto px-4">
        <h1 className="font-editorial text-4xl sm:text-6xl font-medium tracking-tight text-[#252722] leading-[1.15]">
          Plan the event.<br />
          <span className="italic text-[#94442A]">Prepare for anything.</span>
        </h1>

        <p className="mt-5 text-sm sm:text-base text-[#777A72] max-w-2xl mx-auto leading-relaxed">
          EventForge AI transforms your celebration ideas into complete, editable, budget-aware plans.
          Featuring the <strong>AI Event Twin</strong>: test budget drops, rain forecasts, and supplier changes before touching your real plan.
        </p>

        <div className="mt-8 flex justify-center">
          <button
            onClick={onStartPlanning}
            className="w-full sm:w-auto px-6 py-3 rounded-md text-sm font-medium bg-[#94442A] text-white hover:bg-[#B35C40] transition-colors shadow-xs flex items-center justify-center space-x-2"
          >
            <span>Plan My Event</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Signature Workflow Banner: Plan -> Simulate -> Compare -> Decide -> Apply */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-xl border border-[#E8E6DF] p-6 shadow-xs">
          <p className="text-[10px] uppercase font-semibold tracking-wider text-[#94442A] text-center mb-4">
            The EventForge AI Signature Planning Loop
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3 text-center">
            {[
              { step: '1. Plan', desc: 'Synthesize structured budgets & timelines with Gemini' },
              { step: '2. Simulate', desc: 'Stress-test changes in the AI Event Twin' },
              { step: '3. Compare', desc: 'Inspect side-by-side calculated differences' },
              { step: '4. Decide', desc: 'Selectively check changes you agree with' },
              { step: '5. Apply', desc: 'Commit updates with automatic rollback snapshot' },
            ].map((s, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-[#F8F7F3] border border-[#E8E6DF]">
                <h4 className="font-editorial text-sm font-semibold text-[#252722]">{s.step}</h4>
                <p className="text-[11px] text-[#777A72] mt-1 leading-tight">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 Categories Grid */}
      <section className="max-w-6xl mx-auto px-4 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="font-editorial text-2xl sm:text-3xl font-medium text-[#252722]">Built for Milestones That Matter</h2>
          <p className="text-xs text-[#777A72]">From grand Pune weddings to high-energy college fests.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Wedding */}
          <div className="bg-white rounded-xl border border-[#E8E6DF] p-6 shadow-xs space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-semibold text-[#94442A] px-2 py-0.5 rounded bg-[#F8F7F3] border border-[#E8E6DF]">
                Weddings & Sangeets
              </span>
              <h3 className="font-editorial text-xl font-medium text-[#252722]">Large Scale & Multi-Function</h3>
              <p className="text-xs text-[#777A72] leading-relaxed">
                Coordinate multiple ceremonies, 200+ guest dining buffers, lawn sound curfews, and vendor advances without spreadsheet chaos.
              </p>
            </div>
            <button
              onClick={onStartPlanning}
              className="text-xs font-semibold text-[#94442A] hover:underline flex items-center space-x-1 pt-2"
            >
              <span>Build Wedding Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: Birthdays */}
          <div className="bg-white rounded-xl border border-[#E8E6DF] p-6 shadow-xs space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-semibold text-[#52634D] px-2 py-0.5 rounded bg-[#F8F7F3] border border-[#E8E6DF]">
                Birthdays & Anniversaries
              </span>
              <h3 className="font-editorial text-xl font-medium text-[#252722]">Boutique & Family Celebrations</h3>
              <p className="text-xs text-[#777A72] leading-relaxed">
                Keep spending strictly bounded. Discover creative theme palettes, interactive games, and artisan food counters that wow guests.
              </p>
            </div>
            <button
              onClick={onStartPlanning}
              className="text-xs font-semibold text-[#94442A] hover:underline flex items-center space-x-1 pt-2"
            >
              <span>Build Birthday Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3: Community & College */}
          <div className="bg-white rounded-xl border border-[#E8E6DF] p-6 shadow-xs space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-semibold text-[#B15F00] px-2 py-0.5 rounded bg-[#F8F7F3] border border-[#E8E6DF]">
                Community & College Fests
              </span>
              <h3 className="font-editorial text-xl font-medium text-[#252722]">Club Fests & Cultural Gatherings</h3>
              <p className="text-xs text-[#777A72] leading-relaxed">
                Organize equipment rentals, volunteer task matrices, stage audio setups, and strict sponsorship budget caps with clarity.
              </p>
            </div>
            <button
              onClick={onStartPlanning}
              className="text-xs font-semibold text-[#94442A] hover:underline flex items-center space-x-1 pt-2"
            >
              <span>Start Community Event</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
