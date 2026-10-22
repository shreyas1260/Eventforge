import React, { useState } from 'react';
import { Plus, Trash2, Edit2, ShieldAlert } from 'lucide-react';
import { BudgetItem, BudgetCategory, PriorityLevel, BudgetItemStatus } from '../types';
import { formatINR, calculateBudgetSummary } from '../lib/calculations';

interface BudgetTabProps {
  budgetLimit: number;
  items: BudgetItem[];
  onUpdateItems: (newItems: BudgetItem[]) => void;
  onUpdateBudgetLimit: (newLimit: number) => void;
}

const CATEGORIES: BudgetCategory[] = [
  'Venue',
  'Catering',
  'Decoration',
  'Photography & Video',
  'Clothing & Styling',
  'Entertainment',
  'Invitations & Printing',
  'Transport',
  'Accommodation',
  'Equipment & Supplies',
  'Miscellaneous',
  'Contingency Reserve',
];

export const BudgetTab: React.FC<BudgetTabProps> = ({
  budgetLimit,
  items,
  onUpdateItems,
  onUpdateBudgetLimit,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);

  const [category, setCategory] = useState<BudgetCategory>('Venue');
  const [description, setDescription] = useState('');
  const [plannedAmount, setPlannedAmount] = useState<number>(10000);
  const [actualAmount, setActualAmount] = useState<number>(0);
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [status, setStatus] = useState<BudgetItemStatus>('planned');
  const [notes, setNotes] = useState('');

  const summary = calculateBudgetSummary(budgetLimit, items);

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    if (editingItem) {
      const updated = items.map(item =>
        item.id === editingItem.id
          ? {
              ...item,
              category,
              description,
              plannedAmount: Number(plannedAmount) || 0,
              actualAmount: Number(actualAmount) || 0,
              priority,
              status,
              notes,
              updatedAt: new Date().toISOString(),
            }
          : item
      );
      onUpdateItems(updated);
      setEditingItem(null);
    } else {
      const newItem: BudgetItem = {
        id: `bi-${Date.now()}`,
        eventId: items[0]?.eventId || 'event-active',
        category,
        description,
        plannedAmount: Number(plannedAmount) || 0,
        actualAmount: Number(actualAmount) || 0,
        priority,
        status,
        notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onUpdateItems([...items, newItem]);
    }

    setDescription('');
    setPlannedAmount(10000);
    setActualAmount(0);
    setNotes('');
    setShowAddModal(false);
  };

  const handleStartEdit = (item: BudgetItem) => {
    setEditingItem(item);
    setCategory(item.category);
    setDescription(item.description);
    setPlannedAmount(item.plannedAmount);
    setActualAmount(item.actualAmount);
    setPriority(item.priority);
    setStatus(item.status);
    setNotes(item.notes || '');
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this budget line item?')) {
      onUpdateItems(items.filter(i => i.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-[#E8E6DF] p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E8E6DF] pb-4 mb-4">
          <div>
            <h2 className="font-editorial text-xl font-medium text-[#252722]">Budget Intelligence & Allocations</h2>
            <p className="text-xs text-[#777A72]">
              All totals calculated deterministically in application logic.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-3 w-full sm:w-auto">
            <div className="flex items-center space-x-1.5 text-xs">
              <span className="text-[#777A72]">Limit:</span>
              <input
                type="number"
                step="10000"
                value={budgetLimit}
                onChange={e => onUpdateBudgetLimit(Math.max(0, Number(e.target.value)))}
                className="flex-1 sm:w-32 px-2 py-1.5 bg-[#F8F7F3] border border-[#E8E6DF] rounded text-xs font-semibold text-[#252722] tabular-nums"
              />
            </div>
            <button
              onClick={() => {
                setEditingItem(null);
                setDescription('');
                setPlannedAmount(10000);
                setActualAmount(0);
                setNotes('');
                setShowAddModal(true);
              }}
              className="px-3.5 py-1.5 rounded-md text-xs font-medium bg-[#94442A] text-white hover:bg-[#B35C40] flex items-center justify-center space-x-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Item</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-lg bg-[#F8F7F3] border border-[#E8E6DF]">
            <span className="text-[#777A72]">Target Limit</span>
            <p className="text-lg font-semibold text-[#252722] tabular-nums mt-0.5">{formatINR(summary.budgetLimit)}</p>
          </div>

          <div className="p-3 rounded-lg bg-[#F8F7F3] border border-[#E8E6DF]">
            <span className="text-[#777A72]">Total Planned</span>
            <p className="text-lg font-semibold text-[#252722] tabular-nums mt-0.5">{formatINR(summary.totalPlanned)}</p>
          </div>

          <div className={`p-3 rounded-lg border ${summary.isOverBudget ? 'bg-[#FEE2E2] border-[#FECACA]' : 'bg-[#EFF4EE] border-[#D8E2D5]'}`}>
            <span className={summary.isOverBudget ? 'text-[#991B1B]' : 'text-[#40533C]'}>
              {summary.isOverBudget ? 'Budget Overrun' : 'Remaining Balance'}
            </span>
            <p className={`text-lg font-semibold tabular-nums mt-0.5 ${summary.isOverBudget ? 'text-[#DC2626]' : 'text-[#40533C]'}`}>
              {formatINR(summary.remainingBudget)}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-[#F8F7F3] border border-[#E8E6DF]">
            <span className="text-[#777A72]">Actual Paid Out</span>
            <p className="text-lg font-semibold text-[#252722] tabular-nums mt-0.5">{formatINR(summary.totalActual)}</p>
          </div>
        </div>

        {summary.isOverBudget && (
          <div className="mt-4 p-3 rounded-md bg-[#FEE2E2] border border-[#FECACA] text-xs text-[#991B1B] flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>
              <strong>Budget Exceeded:</strong> Total planned allocations exceed your target limit by {formatINR(summary.overageAmount)}.
            </span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-[#E8E6DF] p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs uppercase tracking-wider font-semibold text-[#555850]">Spending Allocation by Category</h3>
          <span className="text-xs text-[#777A72]">{summary.categoryBreakdown.length} active categories</span>
        </div>

        <div className="w-full h-3 rounded-full bg-[#EFECE5] flex overflow-hidden">
          {summary.categoryBreakdown.map((cat, idx) => (
            <div
              key={cat.category}
              className="h-full first:rounded-l-full last:rounded-r-full transition-all"
              style={{
                width: `${cat.percentage}%`,
                backgroundColor: [
                  '#94442A', '#C66B4E', '#52634D', '#788A72', '#B15F00', '#D97706', '#4B5563', '#6B7280'
                ][idx % 8],
              }}
              title={`${cat.category}: ${formatINR(cat.planned)} (${cat.percentage}%)`}
            />
          ))}
        </div>

        <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
          {summary.categoryBreakdown.map((cat, idx) => (
            <span key={cat.category} className="px-2 py-0.5 rounded bg-[#F8F7F3] border border-[#E8E6DF] text-[#555850] flex items-center space-x-1.5">
              <span 
                className="w-2 h-2 rounded-full inline-block"
                style={{
                  backgroundColor: [
                    '#94442A', '#C66B4E', '#52634D', '#788A72', '#B15F00', '#D97706', '#4B5563', '#6B7280'
                  ][idx % 8],
                }}
              />
              <span>{cat.category}: <strong>{formatINR(cat.planned)}</strong> ({cat.percentage}%)</span>
            </span>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E8E6DF] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E8E6DF] flex justify-between items-center bg-[#F8F7F3]">
          <h3 className="font-editorial text-lg font-medium text-[#252722]">Budget Items ({items.length})</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[620px]">
            <thead>
              <tr className="border-b border-[#E8E6DF] bg-[#F8F7F3] text-[#777A72] uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-4 font-semibold">Category</th>
                <th className="py-2.5 px-4 font-semibold">Description</th>
                <th className="py-2.5 px-4 font-semibold text-right">Planned (₹)</th>
                <th className="py-2.5 px-4 font-semibold text-right">Actual (₹)</th>
                <th className="py-2.5 px-4 font-semibold text-center">Priority</th>
                <th className="py-2.5 px-4 font-semibold text-center">Status</th>
                <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E6DF]">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#777A72]">
                    No budget items found. Click "Add Item" to add your first expense.
                  </td>
                </tr>
              ) : (
                items.map(item => (
                  <tr key={item.id} className="hover:bg-[#FAF9F6] transition-colors">
                    <td className="py-3 px-4 font-medium text-[#252722]">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-[#EFECE5] text-[#555850]">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#252722]">
                      <p className="font-medium">{item.description}</p>
                      {item.notes && <p className="text-[11px] text-[#777A72] mt-0.5">{item.notes}</p>}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-[#252722] tabular-nums">
                      {formatINR(item.plannedAmount)}
                    </td>
                    <td className="py-3 px-4 text-right text-[#555850] tabular-nums">
                      {formatINR(item.actualAmount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        item.priority === 'high' ? 'bg-[#FEE2E2] text-[#991B1B]' :
                        item.priority === 'medium' ? 'bg-[#FEF3C7] text-[#92400E]' :
                        'bg-[#F3F1EB] text-[#555850]'
                      }`}>
                        {item.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-[#EFF4EE] text-[#40533C] capitalize">
                        {item.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleStartEdit(item)}
                        className="p-1 rounded text-[#777A72] hover:text-[#94442A] hover:bg-[#F3F1EB]"
                        title="Edit item"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1 rounded text-[#777A72] hover:text-[#DC2626] hover:bg-[#FEE2E2]"
                        title="Delete item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#191D17]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#E8E6DF] shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-editorial text-xl font-medium text-[#252722]">
              {editingItem ? 'Edit Budget Item' : 'New Budget Item'}
            </h3>

            <form onSubmit={handleSaveItem} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#555850] font-medium mb-1">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as BudgetCategory)}
                  className="w-full px-3 py-2 bg-white border border-[#E8E6DF] rounded-md focus:outline-none focus:border-[#94442A]"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#555850] font-medium mb-1">Description *</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g. Lawn canopy rental"
                  className="w-full px-3 py-2 bg-white border border-[#E8E6DF] rounded-md focus:outline-none focus:border-[#94442A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#555850] font-medium mb-1">Planned Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={plannedAmount}
                    onChange={e => setPlannedAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-[#E8E6DF] rounded-md focus:outline-none focus:border-[#94442A] tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-[#555850] font-medium mb-1">Actual Paid (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={actualAmount}
                    onChange={e => setActualAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-[#E8E6DF] rounded-md focus:outline-none focus:border-[#94442A] tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#555850] font-medium mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as PriorityLevel)}
                    className="w-full px-3 py-2 bg-white border border-[#E8E6DF] rounded-md focus:outline-none focus:border-[#94442A]"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#555850] font-medium mb-1">Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as BudgetItemStatus)}
                    className="w-full px-3 py-2 bg-white border border-[#E8E6DF] rounded-md focus:outline-none focus:border-[#94442A]"
                  >
                    <option value="planned">Planned</option>
                    <option value="quotation_received">Quotation Received</option>
                    <option value="committed">Committed</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#555850] font-medium mb-1">Notes / Vendor Ref</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Quotation terms or contact details..."
                  className="w-full px-3 py-2 bg-white border border-[#E8E6DF] rounded-md focus:outline-none focus:border-[#94442A]"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-[#E8E6DF]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium text-[#252722] hover:bg-[#F3F1EB] border border-[#E8E6DF]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md text-xs font-medium bg-[#94442A] text-white hover:bg-[#B35C40] shadow-xs"
                >
                  {editingItem ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
