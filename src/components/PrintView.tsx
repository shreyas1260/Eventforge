import React from 'react';
import { FullEventPlan } from '../types';
import { formatINR, calculateBudgetSummary } from '../lib/calculations';

interface PrintViewProps {
  plan: FullEventPlan;
}

export const PrintView: React.FC<PrintViewProps> = ({ plan }) => {
  const { event, budgetItems, tasks, vendors, ideas } = plan;
  const summary = calculateBudgetSummary(event.budgetLimit, budgetItems);

  return (
    <div className="hidden print:block p-8 bg-white text-black max-w-4xl mx-auto space-y-6 text-sm">
      {/* Header */}
      <div className="border-b-2 border-black pb-4 flex justify-between items-end">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider">EventForge AI • Master Blueprint</span>
          <h1 className="text-3xl font-serif font-bold mt-1">{event.name}</h1>
          <p className="text-xs text-gray-600 mt-1">
            {event.location} • {event.eventDate} • {event.guestCount} Guests • {event.venueType} Venue
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
          <p className="text-lg font-bold">Budget: {formatINR(event.budgetLimit)}</p>
        </div>
      </div>

      {/* Financial Executive Summary */}
      <div className="space-y-2">
        <h2 className="text-base font-serif font-bold uppercase tracking-wider border-b border-gray-300 pb-1">
          1. Financial Summary
        </h2>
        <div className="grid grid-cols-4 gap-4 text-xs py-2 bg-gray-50 p-2 border border-gray-200">
          <div>
            <span className="text-gray-500">Target Ceiling:</span>
            <p className="font-bold">{formatINR(summary.budgetLimit)}</p>
          </div>
          <div>
            <span className="text-gray-500">Total Planned:</span>
            <p className="font-bold">{formatINR(summary.totalPlanned)}</p>
          </div>
          <div>
            <span className="text-gray-500">Remaining Balance:</span>
            <p className="font-bold">{formatINR(summary.remainingBudget)}</p>
          </div>
          <div>
            <span className="text-gray-500">Actual Disbursed:</span>
            <p className="font-bold">{formatINR(summary.totalActual)}</p>
          </div>
        </div>

        <table className="w-full text-xs text-left border-collapse mt-2">
          <thead>
            <tr className="border-b border-gray-300 font-bold">
              <th className="py-1">Category</th>
              <th className="py-1">Description</th>
              <th className="py-1 text-right">Planned Amount</th>
              <th className="py-1 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {budgetItems.map(item => (
              <tr key={item.id}>
                <td className="py-1 font-semibold">{item.category}</td>
                <td className="py-1">{item.description}</td>
                <td className="py-1 text-right font-mono">{formatINR(item.plannedAmount)}</td>
                <td className="py-1 text-center capitalize">{item.status.replace(/_/g, ' ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Timeline Section */}
      <div className="space-y-2 pt-4">
        <h2 className="text-base font-serif font-bold uppercase tracking-wider border-b border-gray-300 pb-1">
          2. Preparation Milestones
        </h2>
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-300 font-bold">
              <th className="py-1">Due Date</th>
              <th className="py-1">Task Title & Details</th>
              <th className="py-1 text-center">Priority</th>
              <th className="py-1 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tasks.map(t => (
              <tr key={t.id}>
                <td className="py-1 font-mono">{t.dueDate}</td>
                <td className="py-1">
                  <p className="font-semibold">{t.title}</p>
                  {t.description && <p className="text-[11px] text-gray-600">{t.description}</p>}
                </td>
                <td className="py-1 text-center uppercase text-[10px]">{t.priority}</td>
                <td className="py-1 text-center capitalize">{t.status.replace(/_/g, ' ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vendor Section */}
      <div className="space-y-2 pt-4">
        <h2 className="text-base font-serif font-bold uppercase tracking-wider border-b border-gray-300 pb-1">
          3. Vendor & Supplier Checklist
        </h2>
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-300 font-bold">
              <th className="py-1">Category</th>
              <th className="py-1">Supplier / Requirement</th>
              <th className="py-1 text-right">Quoted Amount</th>
              <th className="py-1 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {vendors.map(v => (
              <tr key={v.id}>
                <td className="py-1 font-semibold">{v.category}</td>
                <td className="py-1">
                  <p>{v.description}</p>
                  {v.contactNotes && <p className="text-[10px] text-gray-500">{v.contactNotes}</p>}
                </td>
                <td className="py-1 text-right font-mono">{v.quotedAmount ? formatINR(v.quotedAmount) : '—'}</td>
                <td className="py-1 text-center capitalize">{v.status.replace(/_/g, ' ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
