import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';
import { EventType, VenueType, BudgetFlexibility, BudgetPriority, FullEventPlan, Event } from '../types';

interface WizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanCreated: (plan: FullEventPlan) => void;
}

export const WizardModal: React.FC<WizardModalProps> = ({ isOpen, onClose, onPlanCreated }) => {
  const [step, setStep] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Start completely empty as requested
  const [name, setName] = useState('');
  const [eventType, setEventType] = useState<EventType>('wedding');
  const [eventDate, setEventDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [location, setLocation] = useState('');
  const [guestCount, setGuestCount] = useState<number | ''>('');
  const [venueType, setVenueType] = useState<VenueType>('indoor');
  const [description, setDescription] = useState('');

  const [budgetLimit, setBudgetLimit] = useState<number | ''>('');
  const [budgetFlexibility, setBudgetFlexibility] = useState<BudgetFlexibility>('moderate');
  const [budgetPriority, setBudgetPriority] = useState<BudgetPriority>('balanced');
  const [mustHaves, setMustHaves] = useState('');
  const [avoidItems, setAvoidItems] = useState('');

  const [theme, setTheme] = useState('');
  const [foodPreferences, setFoodPreferences] = useState('');
  const [dietaryRequirements, setDietaryRequirements] = useState('');
  const [entertainmentPreferences, setEntertainmentPreferences] = useState('');

  if (!isOpen) return null;

  const validateStep = (s: number) => {
    setErrorMsg('');
    if (s === 1) {
      if (!name.trim()) {
        setErrorMsg('Please enter an event name.');
        return false;
      }
      if (!location.trim()) {
        setErrorMsg('Please specify the city or location.');
        return false;
      }
      if (!guestCount || Number(guestCount) <= 0) {
        setErrorMsg('Guest count must be greater than zero.');
        return false;
      }
    }
    if (s === 2) {
      if (!budgetLimit || Number(budgetLimit) <= 0) {
        setErrorMsg('Please enter a target budget amount in ₹ INR.');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(4, prev + 1));
    }
  };

  const prevStep = () => {
    setErrorMsg('');
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMsg('');

    const newEvent: Event = {
      id: `event-${Date.now()}`,
      name: name.trim(),
      eventType,
      eventDate,
      location: location.trim(),
      guestCount: Number(guestCount) || 100,
      currency: 'INR',
      budgetLimit: Number(budgetLimit) || 500000,
      venueType,
      description: description.trim(),
      preferences: {
        theme: theme.trim(),
        colors: ['#C66B4E', '#788A72', '#F8FAF0'],
        foodPreferences: foodPreferences.trim(),
        dietaryRequirements: dietaryRequirements.trim(),
        entertainmentPreferences: entertainmentPreferences.trim(),
        budgetFlexibility,
        budgetPriority,
        mustHaves: mustHaves.trim(),
        avoidItems: avoidItems.trim(),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const response = await fetch('/api/generate-blueprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent),
      });

      const resData = await response.json();
      if (!resData.success) {
        throw new Error(resData.error || 'Failed to generate event blueprint.');
      }

      const generated = resData.data;

      const fullPlan: FullEventPlan = {
        event: newEvent,
        budgetItems: (generated.budgetItems || []).map((b: any, index: number) => ({
          ...b,
          id: b.id || `bi-${Date.now()}-${index}`,
          eventId: newEvent.id,
          actualAmount: 0,
          status: 'planned',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
        tasks: (generated.tasks || []).map((t: any, index: number) => ({
          ...t,
          id: t.id || `task-${Date.now()}-${index}`,
          eventId: newEvent.id,
          status: 'not_started',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
        vendors: (generated.vendors || []).map((v: any, index: number) => ({
          ...v,
          id: v.id || `vendor-${Date.now()}-${index}`,
          eventId: newEvent.id,
          status: 'researching',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
        ideas: (generated.ideas || []).map((idea: any, index: number) => ({
          ...idea,
          id: idea.id || `idea-${Date.now()}-${index}`,
          eventId: newEvent.id,
          saved: true,
          appliedToPlan: false,
          createdAt: new Date().toISOString(),
        })),
        snapshots: [],
      };

      onPlanCreated(fullPlan);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred while contacting backend.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#191D17]/40 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-[#FFFFFF] rounded-xl border border-[#E8E6DF] shadow-xl max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col my-auto">
        <div className="p-4 sm:p-6 border-b border-[#E8E6DF] flex items-center justify-between bg-[#F8F7F3]">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] sm:text-xs uppercase font-semibold tracking-wider text-[#94442A]">EventForge Wizard</span>
              <span className="text-[10px] sm:text-xs text-[#777A72]">Step {step} of 4</span>
            </div>
            <h2 className="font-editorial text-lg sm:text-2xl font-medium text-[#252722] mt-0.5">
              {step === 1 && 'Basic Event Details'}
              {step === 2 && 'Budget & Spending Priorities'}
              {step === 3 && 'Theme & Experiential Preferences'}
              {step === 4 && 'Review & Forge AI Blueprint'}
            </h2>
          </div>
          <button onClick={onClose} className="text-[#777A72] hover:text-[#252722] p-1.5 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="w-full bg-[#E8E6DF] h-1">
          <div 
            className="bg-[#94442A] h-1 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 max-h-[62vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-md bg-[#FEE2E2] border border-[#FECACA] text-[#991B1B] text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#555850] mb-1">Event Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Rahul & Priya's Wedding Reception"
                  className="w-full px-3 py-2 text-sm bg-white border border-[#E8E6DF] rounded-md focus:outline-none focus:border-[#94442A]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#555850] mb-1">Event Type *</label>
                  <select
                    value={eventType}
                    onChange={e => setEventType(e.target.value as EventType)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E8E6DF] rounded-md focus:outline-none focus:border-[#94442A]"
                  >
                    <option value="wedding">Wedding / Sangeet</option>
                    <option value="birthday">Birthday Celebration</option>
                    <option value="community">Community / Cultural Gathering</option>
                    <option value="college">College Fest / Competition</option>
                    <option value="anniversary">Anniversary</option>
                    <option value="other">Other Celebration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#555850] mb-1">Event Date *</label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={e => setEventDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E8E6DF] rounded-md focus:outline-none focus:border-[#94442A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#555850] mb-1">Location / City *</label>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="e.g. Pune, MH or Bengaluru, KA"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E8E6DF] rounded-md focus:outline-none focus:border-[#94442A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#555850] mb-1">Estimated Guest Count *</label>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    placeholder="e.g. 150"
                    value={guestCount}
                    onChange={e => setGuestCount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E8E6DF] rounded-md focus:outline-none focus:border-[#94442A] tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#555850] mb-1">Venue Preference</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['indoor', 'outdoor', 'mixed'] as VenueType[]).map(vt => (
                    <button
                      key={vt}
                      type="button"
                      onClick={() => setVenueType(vt)}
                      className={`py-2 px-3 text-xs font-medium rounded-md border capitalize text-center ${
                        venueType === vt
                          ? 'bg-[#EFF4EE] border-[#788A72] text-[#40533C]'
                          : 'bg-white border-[#E8E6DF] text-[#555850] hover:bg-[#F8F7F3]'
                      }`}
                    >
                      {vt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#555850] mb-1">Event Vision / Brief (Optional)</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe your vision, vibe, or special notes..."
                  className="w-full px-3 py-2 text-sm bg-white border border-[#E8E6DF] rounded-md focus:outline-none focus:border-[#94442A]"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#555850] mb-1">Total Target Budget (₹ INR) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm text-[#777A72]">₹</span>
                  <input
                    type="number"
                    step="5000"
                    min="1000"
                    placeholder="e.g. 500000"
                    value={budgetLimit}
                    onChange={e => setBudgetLimit(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-[#E8E6DF] rounded-md focus:outline-none focus:border-[#94442A] font-medium tabular-nums"
                  />
                </div>
                {budgetLimit ? (
                  <p className="text-[11px] text-[#777A72] mt-1">
                    Formatted: ₹{Number(budgetLimit).toLocaleString('en-IN')}
                  </p>
                ) : null}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#555850] mb-1">Budget Flexibility</label>
                  <select
                    value={budgetFlexibility}
                    onChange={e => setBudgetFlexibility(e.target.value as BudgetFlexibility)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E8E6DF] rounded-md focus:outline-none focus:border-[#94442A]"
                  >
                    <option value="strict">Strict (Do not exceed)</option>
                    <option value="moderate">Moderate (±10% tolerance)</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#555850] mb-1">Cost Strategy</label>
                  <select
                    value={budgetPriority}
                    onChange={e => setBudgetPriority(e.target.value as BudgetPriority)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E8E6DF] rounded-md focus:outline-none focus:border-[#94442A]"
                  >
                    <option value="cost_effective">Value / Cost-conscious</option>
                    <option value="balanced">Balanced Experience</option>
                    <option value="premium">Premium Experience</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#555850] mb-1">Must-Have Allocations</label>
                <input
                  type="text"
                  value={mustHaves}
                  onChange={e => setMustHaves(e.target.value)}
                  placeholder="e.g. Great photography, open bar, drone shoot"
                  className="w-full px-3 py-2 text-sm bg-white border border-[#E8E6DF] rounded-md focus:outline-none focus:border-[#94442A]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#555850] mb-1">Items to Avoid or Minimize</label>
                <input
                  type="text"
                  value={avoidItems}
                  onChange={e => setAvoidItems(e.target.value)}
                  placeholder="e.g. Plastic decor, printed flex banners, fireworks"
                  className="w-full px-3 py-2 text-sm bg-white border border-[#E8E6DF] rounded-md focus:outline-none focus:border-[#94442A]"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#555850] mb-1">Theme & Aesthetic Vibe</label>
                <input
                  type="text"
                  value={theme}
                  onChange={e => setTheme(e.target.value)}
                  placeholder="e.g. Royal Marigold & Sage, Rustic Bohemian, Minimalist Pastel"
                  className="w-full px-3 py-2 text-sm bg-white border border-[#E8E6DF] rounded-md focus:outline-none focus:border-[#94442A]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#555850] mb-1">Food & Beverage Highlights</label>
                <input
                  type="text"
                  value={foodPreferences}
                  onChange={e => setFoodPreferences(e.target.value)}
                  placeholder="e.g. Live chaat counter, Dum Biryani, artisanal bakery"
                  className="w-full px-3 py-2 text-sm bg-white border border-[#E8E6DF] rounded-md focus:outline-none focus:border-[#94442A]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#555850] mb-1">Dietary & Accessibility Needs</label>
                <input
                  type="text"
                  value={dietaryRequirements}
                  onChange={e => setDietaryRequirements(e.target.value)}
                  placeholder="e.g. Jain counter, Wheelchair ramp access, Halal"
                  className="w-full px-3 py-2 text-sm bg-white border border-[#E8E6DF] rounded-md focus:outline-none focus:border-[#94442A]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#555850] mb-1">Entertainment & Music</label>
                <input
                  type="text"
                  value={entertainmentPreferences}
                  onChange={e => setEntertainmentPreferences(e.target.value)}
                  placeholder="e.g. Live indie singer, Bollywood retro DJ, MC games"
                  className="w-full px-3 py-2 text-sm bg-white border border-[#E8E6DF] rounded-md focus:outline-none focus:border-[#94442A]"
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-[#F8F7F3] border border-[#E8E6DF] space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#94442A] font-semibold">{eventType}</span>
                    <h3 className="font-editorial text-lg font-medium text-[#252722]">{name || 'Unnamed Event'}</h3>
                    <p className="text-xs text-[#777A72]">{location || 'Location pending'} • {guestCount || 0} Guests • {venueType} venue</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-[#777A72]">Target Budget</span>
                    <p className="text-sm font-semibold text-[#252722] tabular-nums">₹{Number(budgetLimit || 0).toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <div className="border-t border-[#E8E6DF] pt-2 text-xs space-y-1">
                  {theme && <p><span className="font-medium text-[#555850]">Theme:</span> {theme}</p>}
                  {foodPreferences && <p><span className="font-medium text-[#555850]">Catering:</span> {foodPreferences} {dietaryRequirements ? `(${dietaryRequirements})` : ''}</p>}
                  {mustHaves && <p><span className="font-medium text-[#555850]">Must-haves:</span> {mustHaves}</p>}
                </div>
              </div>

              <div className="p-3 rounded-md bg-[#EFF4EE] border border-[#D8E2D5] text-xs text-[#40533C]">
                <p className="font-medium flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#52634D]" />
                  <span>Planning Pipeline:</span>
                </p>
                <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px] text-[#40533C]/90">
                  <li>Calculates categorized budget allocations tailored to Indian market benchmarks.</li>
                  <li>Generates chronological preparation timeline with milestone deadlines.</li>
                  <li>Builds supplier command checklist and personalized creative suggestions.</li>
                  <li>Arms your AI Event Twin with baseline data ready for Scenario Lab stress-testing.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[#E8E6DF] bg-[#F8F7F3] flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={prevStep}
              disabled={isGenerating}
              className="px-3 py-1.5 rounded-md text-xs font-medium text-[#252722] hover:bg-[#EFECE5] border border-[#E8E6DF] flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : <div />}

          {step < 4 ? (
            <button
              onClick={nextStep}
              className="px-4 py-2 rounded-md text-xs font-medium bg-[#94442A] text-white hover:bg-[#B35C40] flex items-center space-x-1 shadow-xs"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-5 py-2 rounded-md text-xs font-medium bg-[#94442A] text-white hover:bg-[#B35C40] flex items-center space-x-2 shadow-xs disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing Blueprint...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                  <span>Generate AI Blueprint</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
