import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { callGemini, isGeminiConfigured } from './geminiService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    geminiConfigured: isGeminiConfigured(),
    timestamp: new Date().toISOString(),
  });
});

function createDefaultBlueprint(eventData: any) {
  const { name, eventType, budgetLimit = 1000000, guestCount = 150, eventDate, venueType = 'indoor' } = eventData;
  const isOutdoor = venueType === 'outdoor' || venueType === 'mixed';

  const budgetItems = [
    {
      id: `bi-venue-${Date.now()}`,
      category: 'Venue',
      description: `${eventType === 'wedding' ? 'Banquet hall & lawn rental' : 'Event hall booking'} (${guestCount} guests)`,
      plannedAmount: Math.round(budgetLimit * 0.30),
      actualAmount: 0,
      priority: 'high',
      status: 'planned',
      notes: 'Includes hall access, seating, basic lighting, and maintenance',
    },
    {
      id: `bi-catering-${Date.now()}`,
      category: 'Catering',
      description: `Buffet dining & welcome refreshments (${guestCount} pax @ ₹${Math.round((budgetLimit * 0.32) / guestCount)}/plate)`,
      plannedAmount: Math.round(budgetLimit * 0.32),
      actualAmount: 0,
      priority: 'high',
      status: 'planned',
      notes: 'Covers welcome drinks, main course, and dessert counters',
    },
    {
      id: `bi-decor-${Date.now()}`,
      category: 'Decoration',
      description: 'Backdrop, entrance arch, floral accents & ambient lighting',
      plannedAmount: Math.round(budgetLimit * 0.14),
      actualAmount: 0,
      priority: 'medium',
      status: 'planned',
      notes: 'Theme-aligned fabric and flora arrangements',
    },
    {
      id: `bi-photo-${Date.now()}`,
      category: 'Photography & Video',
      description: 'Candid event photographer + video highlights coverage',
      plannedAmount: Math.round(budgetLimit * 0.10),
      actualAmount: 0,
      priority: 'medium',
      status: 'planned',
      notes: 'Full coverage from arrivals to event close',
    },
    {
      id: `bi-entertainment-${Date.now()}`,
      category: 'Entertainment',
      description: 'Audio system, microphones & DJ / performer set',
      plannedAmount: Math.round(budgetLimit * 0.06),
      actualAmount: 0,
      priority: 'low',
      status: 'planned',
      notes: 'Background acoustic and dance track sets',
    },
    {
      id: `bi-contingency-${Date.now()}`,
      category: 'Contingency Reserve',
      description: 'Emergency buffer for unforeseen operational variations',
      plannedAmount: Math.round(budgetLimit * 0.08),
      actualAmount: 0,
      priority: 'medium',
      status: 'planned',
      notes: 'Reserved for weather shifts or guest count variations',
    },
  ];

  const tasks = [
    {
      id: `task-venue-${Date.now()}`,
      title: 'Inspect venue capacity and confirm security deposit',
      description: 'Review contract terms, air conditioning, parking, and curfew limits.',
      dueDate: eventDate || new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
      priority: 'high',
      status: 'not_started',
      category: 'Venue',
    },
    {
      id: `task-cater-${Date.now()}`,
      title: 'Finalize menu options and dietary requirements',
      description: 'Taste dishes and confirm headcount buffer with caterer.',
      dueDate: eventDate || new Date(Date.now() + 86400000 * 20).toISOString().split('T')[0],
      priority: 'high',
      status: 'not_started',
      category: 'Catering',
    },
    {
      id: `task-decor-${Date.now()}`,
      title: 'Approve final floral and lighting blueprint',
      description: 'Verify dimensions and setup window with venue manager.',
      dueDate: eventDate || new Date(Date.now() + 86400000 * 28).toISOString().split('T')[0],
      priority: 'medium',
      status: 'not_started',
      category: 'Decoration',
    },
  ];

  if (isOutdoor) {
    tasks.push({
      id: `task-weather-${Date.now()}`,
      title: 'Verify rain shelter & waterproof tenting contingency',
      description: 'Confirm backup banquet hall access or canopy supplier on speed dial.',
      dueDate: eventDate || new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
      priority: 'high',
      status: 'not_started',
      category: 'Contingency',
    });
  }

  const vendors = [
    {
      id: `vendor-venue-${Date.now()}`,
      category: 'Venue',
      description: 'Primary Event Venue & Facilities',
      decisionDeadline: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0],
      priority: 'high',
      status: 'researching',
      quotedAmount: Math.round(budgetLimit * 0.30),
      questionsToAsk: [
        'Is power generator fuel included in basic quote?',
        'What is the sound curfew enforcement hour?',
      ],
    },
    {
      id: `vendor-cater-${Date.now()}`,
      category: 'Catering',
      description: 'Full Service Catering & Live Stalls',
      decisionDeadline: new Date(Date.now() + 86400000 * 15).toISOString().split('T')[0],
      priority: 'high',
      status: 'researching',
      quotedAmount: Math.round(budgetLimit * 0.32),
      questionsToAsk: [
        'What are the extra charges if guest count increases by 20 people?',
        'Do you supply water dispensers and uniformed staff?',
      ],
    },
  ];

  const ideas = [
    {
      id: `idea-theme-${Date.now()}`,
      title: 'Earthy Terracotta & Marigold Palette',
      description: 'Utilize terracotta urns with floating candles and fresh marigolds for a warm aesthetic.',
      category: 'Theme & Palette',
      costLevel: 'budget',
      saved: true,
      appliedToPlan: false,
    },
    {
      id: `idea-photo-${Date.now()}`,
      title: 'Interactive Memory Clothesline',
      description: 'Hang candid photos on natural twine with wooden pegs where guests can clip well-wishing notes.',
      category: 'Guest Engagement',
      costLevel: 'budget',
      saved: true,
      appliedToPlan: false,
    },
  ];

  return {
    summary: `Structured blueprint for "${name}" with ${guestCount} guests and ₹${budgetLimit.toLocaleString('en-IN')} budget.`,
    budgetItems,
    tasks,
    vendors,
    ideas,
    assumptions: [
      'Estimates represent market averages for planning purposes.',
      'Prices exclude local statutory taxes and festival surcharges.',
    ],
  };
}

app.post('/api/generate-blueprint', async (req, res) => {
  const eventData = req.body;
  if (!eventData?.name || !eventData?.budgetLimit) {
    return res.status(400).json({ error: 'Missing required event parameters.' });
  }

  const prompt = `
Generate a structured, complete event blueprint for:
Name: ${eventData.name}
Type: ${eventData.eventType}
Date: ${eventData.eventDate}
Location: ${eventData.location}
Guest Count: ${eventData.guestCount}
Budget Limit: INR ${eventData.budgetLimit}
Venue Type: ${eventData.venueType}
Preferences: ${JSON.stringify(eventData.preferences || {})}

Return valid JSON matching this schema exactly:
{
  "summary": "string",
  "budgetItems": [
    {
      "id": "string",
      "category": "Venue | Catering | Decoration | Photography & Video | Clothing & Styling | Entertainment | Invitations & Printing | Transport | Contingency Reserve",
      "description": "string",
      "plannedAmount": 10000,
      "priority": "high | medium | low",
      "notes": "string"
    }
  ],
  "tasks": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "dueDate": "YYYY-MM-DD",
      "priority": "high | medium | low",
      "category": "string"
    }
  ],
  "vendors": [
    {
      "id": "string",
      "category": "string",
      "description": "string",
      "decisionDeadline": "YYYY-MM-DD",
      "priority": "high | medium | low",
      "quotedAmount": 10000,
      "questionsToAsk": ["string"]
    }
  ],
  "ideas": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "category": "Theme & Palette | Decoration | Guest Engagement | Food & Drinks | Entertainment | Photo Opportunities",
      "costLevel": "budget | moderate | premium"
    }
  ],
  "assumptions": ["string"]
}
`;

  try {
    const geminiPromise = callGemini(prompt, true);
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Generation timeout')), 5500)
    );

    const result = await Promise.race([geminiPromise, timeoutPromise]);
    const parsed = JSON.parse(result.text);

    return res.json({
      success: true,
      source: 'gemini',
      modelUsed: result.model,
      data: parsed,
    });
  } catch (err: any) {
    const fallback = createDefaultBlueprint(eventData);
    return res.json({
      success: true,
      source: 'rules',
      data: fallback,
    });
  }
});

app.post('/api/generate-scenario', async (req, res) => {
  const { currentPlan, scenarioType, scenarioInput } = req.body;
  if (!currentPlan?.event) {
    return res.status(400).json({ error: 'Missing currentPlan payload.' });
  }

  const { event, budgetItems = [], tasks = [] } = currentPlan;
  const currentTotal = budgetItems.reduce((acc: number, b: any) => acc + (Number(b.plannedAmount) || 0), 0);

  let proposedBudgetChanges: any[] = [];
  let proposedTaskChanges: any[] = [];
  let proposedVendorChanges: any[] = [];
  let rationale = '';
  let warnings: string[] = [];
  let assumptions: string[] = [];
  let proposedLimit = event.budgetLimit;

  if (scenarioType === 'budget_reduction') {
    proposedLimit = Number(scenarioInput.newBudgetLimit) || Math.round(event.budgetLimit * 0.8);
    const cutRequired = Math.max(0, currentTotal - proposedLimit);
    rationale = `Simulating budget optimization down to ₹${proposedLimit.toLocaleString('en-IN')} (reducing ₹${cutRequired.toLocaleString('en-IN')}). Discretionary categories (decor, entertainment, styling) are trimmed while safeguarding core venue and catering.`;
    
    const decorItem = budgetItems.find((i: any) => i.category === 'Decoration');
    const entertainItem = budgetItems.find((i: any) => i.category === 'Entertainment');
    const miscItem = budgetItems.find((i: any) => i.category === 'Miscellaneous' || i.category === 'Contingency Reserve');

    if (decorItem) {
      const reduction = Math.round(decorItem.plannedAmount * 0.25);
      proposedBudgetChanges.push({
        id: decorItem.id,
        action: 'modify',
        item: { ...decorItem },
        originalAmount: decorItem.plannedAmount,
        proposedAmount: decorItem.plannedAmount - reduction,
        difference: -reduction,
        reason: 'Shift to potted plants and warm ambient lighting instead of imported cut flowers.',
        selectedForApply: true,
      });
    }

    if (entertainItem) {
      const reduction = Math.round(entertainItem.plannedAmount * 0.35);
      proposedBudgetChanges.push({
        id: entertainItem.id,
        action: 'modify',
        item: { ...entertainItem },
        originalAmount: entertainItem.plannedAmount,
        proposedAmount: entertainItem.plannedAmount - reduction,
        difference: -reduction,
        reason: 'Book local acoustic ensemble instead of heavy trussing and equipment rental.',
        selectedForApply: true,
      });
    }

    if (miscItem) {
      const reduction = Math.round(miscItem.plannedAmount * 0.20);
      proposedBudgetChanges.push({
        id: miscItem.id,
        action: 'modify',
        item: { ...miscItem },
        originalAmount: miscItem.plannedAmount,
        proposedAmount: miscItem.plannedAmount - reduction,
        difference: -reduction,
        reason: 'Optimize miscellaneous contingency allocation to fit revised ceiling.',
        selectedForApply: true,
      });
    }

    proposedTaskChanges.push({
      id: `task-renegotiate-${Date.now()}`,
      action: 'add',
      task: {
        title: 'Renegotiate decor and sound vendor contracts with revised budget ceiling',
        description: 'Provide vendors with the capped figure and select consolidated package bundles.',
        dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
        priority: 'high',
        category: 'Budget',
      },
      reason: 'Action to enforce new budget constraints.',
      selectedForApply: true,
    });

    assumptions = [
      'Vendors have not yet received final non-refundable advance deposits.',
      'Core venue and catering headcount remains unchanged.',
    ];
  } else if (scenarioType === 'bad_weather') {
    rationale = 'Heavy rain forecasted. Transitioning outdoor setups to weatherproof banquet canopy and indoor shelter.';
    warnings = ['Outdoor sound equipment and electrical setups must be enclosed immediately under covered zones.'];

    proposedBudgetChanges.push({
      id: `bi-tent-${Date.now()}`,
      action: 'add',
      item: {
        category: 'Equipment & Supplies',
        description: 'Waterproof German Hanger / Clear-Span Canopy for lawn segment',
        plannedAmount: 60000,
        actualAmount: 0,
        priority: 'high',
        status: 'planned',
        notes: 'Covers buffet line and guest walkway from rain',
      },
      originalAmount: 0,
      proposedAmount: 60000,
      difference: 60000,
      reason: 'Prevent rain from disrupting buffet and dining areas.',
      selectedForApply: true,
    });

    proposedTaskChanges.push(
      {
        id: `task-weather-tent-${Date.now()}`,
        action: 'add',
        task: {
          title: 'Confirm German hanger canopy installation window with venue',
          description: 'Ensure tent crew sets up 24 hours prior to inspect rain gutters and drainage.',
          dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
          priority: 'high',
          category: 'Contingency',
        },
        reason: 'Rainproofing requires early staging.',
        selectedForApply: true,
      },
      {
        id: `task-indoor-backup-${Date.now()}`,
        action: 'add',
        task: {
          title: 'Lock indoor banquet hall as primary dining backup',
          description: 'Inform catering captain to prepare food counters inside the hall.',
          dueDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
          priority: 'high',
          category: 'Venue',
        },
        reason: 'Guarantees comfortable dining regardless of weather.',
        selectedForApply: true,
      }
    );

    proposedVendorChanges.push({
      id: `v-tent-${Date.now()}`,
      action: 'add',
      vendor: {
        category: 'Tent & Waterproofing',
        description: 'Rain Canopy & Industrial De-watering Pumps',
        decisionDeadline: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        priority: 'high',
        quotedAmount: 60000,
      },
      reason: 'Rental required to protect guests and equipment.',
      selectedForApply: true,
    });
  } else if (scenarioType === 'increased_guests') {
    const added = Number(scenarioInput.addedGuests) || 40;
    const newGuestTotal = event.guestCount + added;
    rationale = `Guest count increased from ${event.guestCount} to ${newGuestTotal} (+${added} guests). Recalculating food plates, seating inventory, and venue capacity limit.`;
    
    const cateringItem = budgetItems.find((i: any) => i.category === 'Catering');
    if (cateringItem) {
      const perHead = cateringItem.plannedAmount / (event.guestCount || 1);
      const additionalFoodCost = Math.round(perHead * added);
      proposedBudgetChanges.push({
        id: cateringItem.id,
        action: 'modify',
        item: { ...cateringItem },
        originalAmount: cateringItem.plannedAmount,
        proposedAmount: cateringItem.plannedAmount + additionalFoodCost,
        difference: additionalFoodCost,
        reason: `Catering expansion for +${added} guests @ ₹${Math.round(perHead)}/plate.`,
        selectedForApply: true,
      });
    }

    proposedTaskChanges.push({
      id: `task-seating-${Date.now()}`,
      action: 'add',
      task: {
        title: `Arrange +${added} extra dining chairs and round tables with venue`,
        description: 'Ensure seating layout accommodates expanded headcount without blocking fire exits.',
        dueDate: new Date(Date.now() + 86400000 * 6).toISOString().split('T')[0],
        priority: 'high',
        category: 'Venue',
      },
      reason: 'Seating capacity must be verified before final floor layout.',
      selectedForApply: true,
    });
  } else {
    const vendorCat = scenarioInput.cancelledVendorCategory || 'Catering';
    rationale = `Contingency plan: Primary ${vendorCat} vendor cancelled unexpectedly. Prioritizing replacement suppliers and fast-tracking contract signatures.`;
    warnings = [`Replacement ${vendorCat} services must be confirmed within 72 hours.`];

    proposedTaskChanges.push(
      {
        id: `task-replace-vendor-${Date.now()}`,
        action: 'add',
        task: {
          title: `Contact backup suppliers for ${vendorCat}`,
          description: 'Obtain immediate availability quotes and arrange emergency sample inspection.',
          dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
          priority: 'high',
          category: vendorCat,
        },
        reason: 'Immediate replacement needed.',
        selectedForApply: true,
      }
    );

    proposedVendorChanges.push({
      id: `v-backup-${Date.now()}`,
      action: 'add',
      vendor: {
        category: `${vendorCat} (Backup)`,
        description: `Replacement provider for ${vendorCat}`,
        decisionDeadline: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        priority: 'high',
      },
      reason: 'Replace cancelled contract.',
      selectedForApply: true,
    });
  }

  let proposedPlanned = currentTotal;
  proposedBudgetChanges.forEach(change => {
    if (change.action === 'modify') {
      proposedPlanned += (change.difference || 0);
    } else if (change.action === 'add') {
      proposedPlanned += (change.proposedAmount || 0);
    } else if (change.action === 'remove') {
      proposedPlanned -= (change.originalAmount || 0);
    }
  });

  const scenarioResult = {
    id: `scenario-${Date.now()}`,
    eventId: event.id,
    baseVersionId: `snap-${Date.now()}`,
    scenarioType,
    scenarioInput,
    status: 'generated',
    title: `Simulation: ${scenarioType.replace(/_/g, ' ').toUpperCase()}`,
    rationale,
    assumptions,
    warnings,
    proposedBudgetChanges,
    proposedTaskChanges,
    proposedVendorChanges,
    recalculatedTotals: {
      originalLimit: event.budgetLimit,
      proposedLimit: proposedLimit,
      originalPlanned: currentTotal,
      proposedPlanned,
      difference: proposedPlanned - currentTotal,
      originalRemaining: event.budgetLimit - currentTotal,
      proposedRemaining: proposedLimit - proposedPlanned,
      isOverBudget: proposedPlanned > proposedLimit,
    },
    createdAt: new Date().toISOString(),
  };

  return res.json({
    success: true,
    scenario: scenarioResult,
  });
});

app.post('/api/ai-assistant', async (req, res) => {
  const { message, currentPlan } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  const { event, budgetItems = [], tasks = [] } = currentPlan || {};
  const currentTotal = budgetItems.reduce((acc: number, b: any) => acc + (Number(b.plannedAmount) || 0), 0);
  const remaining = (event?.budgetLimit || 0) - currentTotal;

  const prompt = `
Event Context:
Name: ${event?.name || 'Event'} (${event?.eventType || 'Celebration'})
Budget: INR ${event?.budgetLimit?.toLocaleString('en-IN') || '0'}, Planned: INR ${currentTotal.toLocaleString('en-IN')}, Remaining: INR ${remaining.toLocaleString('en-IN')}
Total tasks: ${tasks.length}
User question: "${message}"

Provide a concise, practical, 2-3 paragraph planning answer tailored to this event and budget numbers.
`;

  try {
    const result = await callGemini(prompt, false);
    return res.json({
      success: true,
      answer: result.text,
      source: 'gemini',
    });
  } catch (_err) {
    const answer = `Based on your plan for **${event?.name || 'your event'}** with a remaining balance of **₹${remaining.toLocaleString('en-IN')}**:\n\n1. **Priority Focus:** Confirm high-priority vendor quotes first, especially Venue and Catering.\n2. **Buffer Protection:** Maintain at least ₹50,000 in your Contingency Reserve for transport adjustments or unexpected last-minute additions.\n3. **Milestones:** Review the Timeline Deadline Radar to ensure no critical deadlines slip this week.`;
    return res.json({
      success: true,
      answer,
      source: 'rules',
    });
  }
});

app.listen(PORT, () => {
  console.log(`EventForge AI running on http://localhost:${PORT}`);
});
