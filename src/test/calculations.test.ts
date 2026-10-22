import { describe, it, expect } from 'vitest';
import { formatINR, formatCompactINR, calculateBudgetSummary, getDaysUntil, calculatePlanHealth } from '../lib/calculations';
import { BudgetItem, Event, Task, VendorChecklistItem } from '../types';

describe('EventForge AI - Deterministic Calculation Engine', () => {
  it('formats Indian Rupee correctly', () => {
    expect(formatINR(500000)).toBe('₹5,00,000');
    expect(formatINR(0)).toBe('₹0');
    expect(formatINR(-25000)).toBe('-₹25,000');
  });

  it('formats compact INR with Lakhs and Crores', () => {
    expect(formatCompactINR(1500000)).toBe('₹15 L');
    expect(formatCompactINR(10000000)).toBe('₹1 Cr');
  });

  it('calculates budget summary deterministically', () => {
    const items: BudgetItem[] = [
      {
        id: '1',
        eventId: 'e1',
        category: 'Venue',
        description: 'Lawn',
        plannedAmount: 400000,
        actualAmount: 200000,
        priority: 'high',
        status: 'committed',
        createdAt: '',
        updatedAt: '',
      },
      {
        id: '2',
        eventId: 'e1',
        category: 'Catering',
        description: 'Buffet',
        plannedAmount: 300000,
        actualAmount: 0,
        priority: 'high',
        status: 'planned',
        createdAt: '',
        updatedAt: '',
      },
    ];

    const summary = calculateBudgetSummary(1000000, items);
    expect(summary.totalPlanned).toBe(700000);
    expect(summary.totalActual).toBe(200000);
    expect(summary.remainingBudget).toBe(300000);
    expect(summary.usagePercentage).toBe(70);
    expect(summary.isOverBudget).toBe(false);
  });

  it('correctly warns when planned spending exceeds limit', () => {
    const items: BudgetItem[] = [
      {
        id: '1',
        eventId: 'e1',
        category: 'Venue',
        description: 'Lawn',
        plannedAmount: 600000,
        actualAmount: 0,
        priority: 'high',
        status: 'planned',
        createdAt: '',
        updatedAt: '',
      },
    ];

    const summary = calculateBudgetSummary(500000, items);
    expect(summary.isOverBudget).toBe(true);
    expect(summary.overageAmount).toBe(100000);
    expect(summary.remainingBudget).toBe(-100000);
  });

  it('computes transparent Plan Health Score rules', () => {
    const event: Event = {
      id: 'e1',
      name: 'Test Gala',
      eventType: 'wedding',
      eventDate: '2026-12-01',
      location: 'Pune',
      guestCount: 200,
      currency: 'INR',
      budgetLimit: 1000000,
      venueType: 'indoor',
      preferences: {
        budgetFlexibility: 'moderate',
        budgetPriority: 'balanced',
      },
      createdAt: '',
      updatedAt: '',
    };

    const budgetItems: BudgetItem[] = [
      {
        id: 'bi1',
        eventId: 'e1',
        category: 'Contingency Reserve',
        description: 'Emergency buffer',
        plannedAmount: 50000,
        actualAmount: 0,
        priority: 'medium',
        status: 'planned',
        createdAt: '',
        updatedAt: '',
      },
    ];

    const tasks: Task[] = [
      {
        id: 't1',
        eventId: 'e1',
        title: 'Book hall',
        description: '',
        dueDate: '2026-11-20',
        priority: 'high',
        status: 'completed',
        category: 'Venue',
        createdAt: '',
        updatedAt: '',
      },
    ];

    const vendors: VendorChecklistItem[] = [
      {
        id: 'v1',
        eventId: 'e1',
        category: 'Venue',
        description: 'Heritage Hall',
        decisionDeadline: '2026-11-15',
        priority: 'high',
        status: 'confirmed',
        createdAt: '',
        updatedAt: '',
      },
    ];

    const health = calculatePlanHealth(event, budgetItems, tasks, vendors);
    expect(health.overallScore).toBeGreaterThanOrEqual(80);
    expect(health.rating).toBe('Excellent');
    expect(health.budgetHealth.status).toBe('healthy');
  });
});
