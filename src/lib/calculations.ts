import { BudgetItem, BudgetCategory, Task, VendorChecklistItem, Event, PlanHealth } from '../types';

export function formatINR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';
  const isNegative = amount < 0;
  const abs = Math.abs(Math.round(amount));
  const formatted = new Intl.NumberFormat('en-IN').format(abs);
  return `${isNegative ? '-' : ''}₹${formatted}`;
}

export function formatCompactINR(amount: number): string {
  if (isNaN(amount) || amount === 0) return '₹0';
  const isNegative = amount < 0;
  const abs = Math.abs(amount);

  if (abs >= 10000000) {
    const cr = (abs / 10000000).toFixed(2).replace(/\.00$/, '');
    return `${isNegative ? '-' : ''}₹${cr} Cr`;
  }
  if (abs >= 100000) {
    const lakh = (abs / 100000).toFixed(2).replace(/\.00$/, '');
    return `${isNegative ? '-' : ''}₹${lakh} L`;
  }
  if (abs >= 1000) {
    const k = (abs / 1000).toFixed(1).replace(/\.0$/, '');
    return `${isNegative ? '-' : ''}₹${k} K`;
  }
  return formatINR(amount);
}

export interface BudgetSummary {
  budgetLimit: number;
  totalPlanned: number;
  totalActual: number;
  remainingBudget: number;
  usagePercentage: number;
  isOverBudget: boolean;
  overageAmount: number;
  categoryBreakdown: Array<{
    category: BudgetCategory;
    planned: number;
    actual: number;
    percentage: number;
    itemCount: number;
  }>;
}

export function calculateBudgetSummary(budgetLimit: number, items: BudgetItem[]): BudgetSummary {
  const safeLimit = Math.max(0, budgetLimit || 0);
  const totalPlanned = items.reduce((sum, item) => sum + (Number(item.plannedAmount) || 0), 0);
  const totalActual = items.reduce((sum, item) => sum + (Number(item.actualAmount) || 0), 0);
  const remainingBudget = safeLimit - totalPlanned;
  const usagePercentage = safeLimit > 0 ? Math.min(999, Math.round((totalPlanned / safeLimit) * 100)) : 0;
  const isOverBudget = totalPlanned > safeLimit;
  const overageAmount = isOverBudget ? totalPlanned - safeLimit : 0;

  const categoryMap = new Map<BudgetCategory, { planned: number; actual: number; count: number }>();

  items.forEach(item => {
    const existing = categoryMap.get(item.category) || { planned: 0, actual: 0, count: 0 };
    existing.planned += Number(item.plannedAmount) || 0;
    existing.actual += Number(item.actualAmount) || 0;
    existing.count += 1;
    categoryMap.set(item.category, existing);
  });

  const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, stats]) => ({
    category,
    planned: stats.planned,
    actual: stats.actual,
    percentage: totalPlanned > 0 ? Math.round((stats.planned / totalPlanned) * 100) : 0,
    itemCount: stats.count,
  })).sort((a, b) => b.planned - a.planned);

  return {
    budgetLimit: safeLimit,
    totalPlanned,
    totalActual,
    remainingBudget,
    usagePercentage,
    isOverBudget,
    overageAmount,
    categoryBreakdown,
  };
}

export function getDaysUntil(dateString: string): number {
  const target = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function isTaskOverdue(task: Task): boolean {
  if (task.status === 'completed') return false;
  return getDaysUntil(task.dueDate) < 0;
}

export function isTaskDueSoon(task: Task, thresholdDays = 7): boolean {
  if (task.status === 'completed') return false;
  const days = getDaysUntil(task.dueDate);
  return days >= 0 && days <= thresholdDays;
}

export interface TaskSummary {
  total: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  blocked: number;
  overdue: number;
  dueSoon: number;
  completionPercentage: number;
}

export function calculateTaskSummary(tasks: Task[]): TaskSummary {
  const total = tasks.length;
  if (total === 0) {
    return {
      total: 0,
      completed: 0,
      inProgress: 0,
      notStarted: 0,
      blocked: 0,
      overdue: 0,
      dueSoon: 0,
      completionPercentage: 0,
    };
  }

  let completed = 0;
  let inProgress = 0;
  let notStarted = 0;
  let blocked = 0;
  let overdue = 0;
  let dueSoon = 0;

  tasks.forEach(t => {
    if (t.status === 'completed') completed++;
    else if (t.status === 'in_progress') inProgress++;
    else if (t.status === 'blocked') blocked++;
    else notStarted++;

    if (isTaskOverdue(t)) overdue++;
    else if (isTaskDueSoon(t)) dueSoon++;
  });

  return {
    total,
    completed,
    inProgress,
    notStarted,
    blocked,
    overdue,
    dueSoon,
    completionPercentage: Math.round((completed / total) * 100),
  };
}

export function calculatePlanHealth(
  event: Event,
  budgetItems: BudgetItem[],
  tasks: Task[],
  vendors: VendorChecklistItem[]
): PlanHealth {
  const deductions: Array<{ reason: string; points: number; recommendation: string }> = [];

  const budgetSummary = calculateBudgetSummary(event.budgetLimit, budgetItems);
  let budgetScore = 30;
  let budgetStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
  let budgetMessage = 'Planned spending is within budget limit.';

  if (budgetSummary.isOverBudget) {
    const overPct = (budgetSummary.overageAmount / (budgetSummary.budgetLimit || 1)) * 100;
    if (overPct > 15) {
      budgetScore = 0;
      budgetStatus = 'critical';
      budgetMessage = `Plan exceeds budget limit by ${formatINR(budgetSummary.overageAmount)} (${Math.round(overPct)}%).`;
      deductions.push({
        reason: 'Severe budget overrun',
        points: 30,
        recommendation: 'Run Scenario Lab Budget Reduction simulation to re-balance categories.',
      });
    } else {
      budgetScore = 15;
      budgetStatus = 'warning';
      budgetMessage = `Plan exceeds budget limit by ${formatINR(budgetSummary.overageAmount)}.`;
      deductions.push({
        reason: 'Minor budget overrun',
        points: 15,
        recommendation: 'Adjust discretionary allocations like decor or entertainment.',
      });
    }
  } else if (budgetSummary.remainingBudget < budgetSummary.budgetLimit * 0.05 && budgetSummary.budgetLimit > 0) {
    budgetScore = 25;
    budgetStatus = 'warning';
    budgetMessage = 'Remaining budget buffer is very tight (<5%).';
    deductions.push({
      reason: 'Tight financial buffer',
      points: 5,
      recommendation: 'Maintain a 5-10% contingency reserve for incidentals.',
    });
  }

  const taskSummary = calculateTaskSummary(tasks);
  let timelineScore = 25;
  let timelineStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
  let timelineMessage = 'Timeline is on track with no overdue tasks.';

  if (taskSummary.overdue > 2) {
    timelineScore = 5;
    timelineStatus = 'critical';
    timelineMessage = `${taskSummary.overdue} tasks are overdue and require attention.`;
    deductions.push({
      reason: 'Multiple overdue deadlines',
      points: 20,
      recommendation: 'Review Timeline Deadline Radar and update milestone statuses.',
    });
  } else if (taskSummary.overdue > 0) {
    timelineScore = 15;
    timelineStatus = 'warning';
    timelineMessage = `${taskSummary.overdue} task is currently overdue.`;
    deductions.push({
      reason: 'Overdue task found',
      points: 10,
      recommendation: 'Complete pending tasks or adjust due dates to current schedule.',
    });
  } else if (tasks.length === 0) {
    timelineScore = 10;
    timelineStatus = 'warning';
    timelineMessage = 'No timeline tasks recorded.';
    deductions.push({
      reason: 'Missing preparation timeline',
      points: 15,
      recommendation: 'Add milestone tasks to track preparation deadlines.',
    });
  }

  let vendorScore = 25;
  let vendorStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
  const criticalVendors = vendors.filter(v => v.priority === 'high');
  const unconfirmedCritical = criticalVendors.filter(v => v.status !== 'confirmed');
  let vendorMessage = 'All essential vendors and suppliers are confirmed or tracked.';

  if (criticalVendors.length > 0 && unconfirmedCritical.length > 1) {
    vendorScore = 10;
    vendorStatus = 'warning';
    vendorMessage = `${unconfirmedCritical.length} high-priority vendor categories (${unconfirmedCritical.map(v => v.category).slice(0, 2).join(', ')}) are unconfirmed.`;
    deductions.push({
      reason: 'Unconfirmed high-priority vendors',
      points: 15,
      recommendation: 'Finalize quotes and confirm key services in Vendor Command Center.',
    });
  } else if (vendors.length === 0) {
    vendorScore = 10;
    vendorStatus = 'warning';
    vendorMessage = 'No vendor checklist items defined.';
    deductions.push({
      reason: 'Empty vendor checklist',
      points: 15,
      recommendation: 'Record supplier requirements to avoid last-minute booking conflicts.',
    });
  }

  let contingencyScore = 20;
  let contingencyStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
  const hasContingencyItem = budgetItems.some(i => i.category === 'Contingency Reserve' && i.plannedAmount > 0);
  const isOutdoor = event.venueType === 'outdoor' || event.venueType === 'mixed';
  const hasOutdoorPlan = tasks.some(t => {
    const title = t.title.toLowerCase();
    return title.includes('weather') || title.includes('rain') || title.includes('tent');
  });

  let contingencyMessage = 'Adequate contingency reserves and environmental backups in place.';

  if (isOutdoor && !hasOutdoorPlan) {
    contingencyScore -= 10;
    contingencyStatus = 'warning';
    contingencyMessage = 'Outdoor venue without a recorded bad weather contingency arrangement.';
    deductions.push({
      reason: 'No weather contingency for outdoor venue',
      points: 10,
      recommendation: 'Run Bad Weather scenario in Scenario Lab to generate rain backup plans and tent checklist.',
    });
  }

  if (!hasContingencyItem) {
    contingencyScore -= 10;
    if (contingencyStatus === 'healthy') contingencyStatus = 'warning';
    deductions.push({
      reason: 'No contingency reserve allocated',
      points: 10,
      recommendation: 'Add a 5-10% contingency line item in Budget Planner for incidental expenses.',
    });
  }

  const overallScore = Math.max(0, Math.min(100, budgetScore + timelineScore + vendorScore + contingencyScore));

  let rating: 'Excellent' | 'Good' | 'Needs Attention' | 'At Risk' = 'Excellent';
  if (overallScore < 50) rating = 'At Risk';
  else if (overallScore < 70) rating = 'Needs Attention';
  else if (overallScore < 85) rating = 'Good';

  return {
    overallScore,
    rating,
    budgetHealth: {
      score: budgetScore,
      maxScore: 30,
      status: budgetStatus,
      message: budgetMessage,
    },
    timelineHealth: {
      score: timelineScore,
      maxScore: 25,
      overdueCount: taskSummary.overdue,
      dueSoonCount: taskSummary.dueSoon,
      status: timelineStatus,
      message: timelineMessage,
    },
    vendorHealth: {
      score: vendorScore,
      maxScore: 25,
      unconfirmedCriticalCount: unconfirmedCritical.length,
      totalVendors: vendors.length,
      status: vendorStatus,
      message: vendorMessage,
    },
    contingencyHealth: {
      score: contingencyScore,
      maxScore: 20,
      hasContingencyItem,
      hasOutdoorPlan,
      status: contingencyStatus,
      message: contingencyMessage,
    },
    deductions,
  };
}
