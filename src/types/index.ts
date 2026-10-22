export type EventType = 'wedding' | 'birthday' | 'community' | 'college' | 'anniversary' | 'other';
export type VenueType = 'indoor' | 'outdoor' | 'mixed';
export type BudgetFlexibility = 'strict' | 'moderate' | 'flexible';
export type BudgetPriority = 'cost_effective' | 'balanced' | 'premium';
export type PriorityLevel = 'high' | 'medium' | 'low';
export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked';
export type VendorStatus = 'pending' | 'researching' | 'quotation_received' | 'confirmed' | 'cancelled';
export type BudgetItemStatus = 'planned' | 'quotation_received' | 'committed' | 'paid';

export type BudgetCategory = 
  | 'Venue' 
  | 'Catering' 
  | 'Decoration' 
  | 'Photography & Video' 
  | 'Clothing & Styling' 
  | 'Entertainment' 
  | 'Invitations & Printing' 
  | 'Transport' 
  | 'Accommodation' 
  | 'Equipment & Supplies' 
  | 'Miscellaneous' 
  | 'Contingency Reserve';

export interface EventPreferences {
  theme?: string;
  colors?: string[];
  foodPreferences?: string;
  dietaryRequirements?: string;
  entertainmentPreferences?: string;
  accessibilityNotes?: string;
  culturalNotes?: string;
  budgetFlexibility: BudgetFlexibility;
  budgetPriority: BudgetPriority;
  mustHaves?: string;
  niceToHaves?: string;
  avoidItems?: string;
}

export interface Event {
  id: string;
  name: string;
  eventType: EventType;
  eventDate: string; // YYYY-MM-DD
  location: string;
  guestCount: number;
  currency: string;
  budgetLimit: number;
  venueType: VenueType;
  description?: string;
  preferences: EventPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetItem {
  id: string;
  eventId: string;
  category: BudgetCategory;
  description: string;
  plannedAmount: number;
  actualAmount: number;
  priority: PriorityLevel;
  status: BudgetItemStatus;
  notes?: string;
  vendorQuotationRef?: string;
  estimateType?: 'user_defined' | 'ai_estimate' | 'vendor_quote';
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  eventId: string;
  title: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
  priority: PriorityLevel;
  status: TaskStatus;
  category: string;
  notes?: string;
  dependencies?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface VendorChecklistItem {
  id: string;
  eventId: string;
  category: string;
  description: string;
  decisionDeadline: string; // YYYY-MM-DD
  priority: PriorityLevel;
  status: VendorStatus;
  quotedAmount?: number;
  contactNotes?: string;
  questionsToAsk?: string[];
  createdAt: string;
  updatedAt: string;
}

export type IdeaCategory = 
  | 'Theme & Palette' 
  | 'Decoration' 
  | 'Guest Engagement' 
  | 'Food & Drinks' 
  | 'Entertainment' 
  | 'Photo Opportunities' 
  | 'Budget Substitutions' 
  | 'Accessibility' 
  | 'Eco-friendly';

export interface Idea {
  id: string;
  eventId: string;
  title: string;
  description: string;
  category: IdeaCategory;
  costLevel: 'budget' | 'moderate' | 'premium';
  saved: boolean;
  appliedToPlan: boolean;
  assumptions?: string;
  createdAt: string;
}

export interface PlanSnapshot {
  id: string;
  eventId: string;
  versionNumber: number;
  createdAt: string;
  changeSummary: string;
  data: {
    event: Event;
    budgetItems: BudgetItem[];
    tasks: Task[];
    vendors: VendorChecklistItem[];
    ideas: Idea[];
  };
}

export type ScenarioType = 
  | 'budget_reduction' 
  | 'bad_weather' 
  | 'increased_guests' 
  | 'vendor_cancellation' 
  | 'custom';

export interface ProposedBudgetChange {
  id: string;
  action: 'modify' | 'add' | 'remove';
  item: Partial<BudgetItem> & { category: BudgetCategory; description: string };
  originalAmount?: number;
  proposedAmount: number;
  difference: number;
  reason: string;
  selectedForApply: boolean;
}

export interface ProposedTaskChange {
  id: string;
  action: 'modify' | 'add' | 'remove';
  task: Partial<Task> & { title: string; dueDate: string };
  reason: string;
  selectedForApply: boolean;
}

export interface ProposedVendorChange {
  id: string;
  action: 'modify' | 'add' | 'remove';
  vendor: Partial<VendorChecklistItem> & { category: string; description: string };
  reason: string;
  selectedForApply: boolean;
}

export interface Scenario {
  id: string;
  eventId: string;
  baseVersionId: string;
  scenarioType: ScenarioType;
  scenarioInput: {
    newBudgetLimit?: number;
    rainForecastProbability?: string;
    indoorAlternativeRequired?: boolean;
    addedGuests?: number;
    cancelledVendorCategory?: string;
    customPrompt?: string;
  };
  status: 'draft' | 'generated' | 'reviewed' | 'applied' | 'rejected' | 'failed';
  title: string;
  rationale: string;
  assumptions: string[];
  warnings: string[];
  proposedBudgetChanges: ProposedBudgetChange[];
  proposedTaskChanges: ProposedTaskChange[];
  proposedVendorChanges: ProposedVendorChange[];
  recalculatedTotals: {
    originalLimit: number;
    proposedLimit: number;
    originalPlanned: number;
    proposedPlanned: number;
    difference: number;
    originalRemaining: number;
    proposedRemaining: number;
    isOverBudget: boolean;
  };
  createdAt: string;
  reviewedAt?: string;
  appliedAt?: string;
}

export interface PlanHealth {
  overallScore: number; // 0 - 100
  rating: 'Excellent' | 'Good' | 'Needs Attention' | 'At Risk';
  budgetHealth: {
    score: number;
    maxScore: number;
    status: 'healthy' | 'warning' | 'critical';
    message: string;
  };
  timelineHealth: {
    score: number;
    maxScore: number;
    overdueCount: number;
    dueSoonCount: number;
    status: 'healthy' | 'warning' | 'critical';
    message: string;
  };
  vendorHealth: {
    score: number;
    maxScore: number;
    unconfirmedCriticalCount: number;
    totalVendors: number;
    status: 'healthy' | 'warning' | 'critical';
    message: string;
  };
  contingencyHealth: {
    score: number;
    maxScore: number;
    hasContingencyItem: boolean;
    hasOutdoorPlan: boolean;
    status: 'healthy' | 'warning' | 'critical';
    message: string;
  };
  deductions: Array<{
    reason: string;
    points: number;
    recommendation: string;
  }>;
}

export interface FullEventPlan {
  event: Event;
  budgetItems: BudgetItem[];
  tasks: Task[];
  vendors: VendorChecklistItem[];
  ideas: Idea[];
  snapshots: PlanSnapshot[];
  activeScenario?: Scenario;
}
