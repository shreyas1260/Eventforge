import React, { useState } from 'react';
import { Plus, Phone, Trash2 } from 'lucide-react';
import { VendorChecklistItem, VendorStatus, PriorityLevel } from '../types';
import { formatINR } from '../lib/calculations';

interface VendorsTabProps {
  vendors: VendorChecklistItem[];
  onUpdateVendors: (newVendors: VendorChecklistItem[]) => void;
}

export const VendorsTab: React.FC<VendorsTabProps> = ({ vendors, onUpdateVendors }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [quotedAmount, setQuotedAmount] = useState<number>(0);
  const [contactNotes, setContactNotes] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [status, setStatus] = useState<VendorStatus>('researching');

  const handleUpdateStatus = (id: string, newStatus: VendorStatus) => {
    const updated = vendors.map(v => (v.id === id ? { ...v, status: newStatus, updatedAt: new Date().toISOString() } : v));
    onUpdateVendors(updated);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this vendor record?')) {
      onUpdateVendors(vendors.filter(v => v.id !== id));
    }
  };

  const handleAddVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category.trim() || !description.trim()) return;

    const newVendor: VendorChecklistItem = {
      id: `vendor-${Date.now()}`,
      eventId: vendors[0]?.eventId || 'event-active',
      category,
      description,
      decisionDeadline: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
      priority,
      status,
      quotedAmount: Number(quotedAmount) || 0,
      contactNotes,
      questionsToAsk: [
        'What is your cancellation and refund policy if dates change?',
        'Are there any unlisted setup or teardown fees?',
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onUpdateVendors([...vendors, newVendor]);
    setCategory('');
    setDescription('');
    setQuotedAmount(0);
    setContactNotes('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-[#E8E6DF] p-5 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-editorial text-xl font-medium text-[#252722]">Vendor Command Center</h2>
          <p className="text-xs text-[#777A72]">
            Track quotes, supplier deadlines, and negotiation checklists. Quotes remain distinct from actual spending.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3 py-1.5 rounded-md text-xs font-medium bg-[#94442A] text-white hover:bg-[#B35C40] flex items-center space-x-1 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Vendor</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vendors.length === 0 ? (
          <div className="col-span-2 p-8 text-center text-[#777A72] text-xs bg-white rounded-xl border border-[#E8E6DF]">
            No vendor arrangements recorded. Click "Add Vendor" to start your supplier checklist.
          </div>
        ) : (
          vendors.map(v => (
            <div key={v.id} className="bg-white rounded-xl border border-[#E8E6DF] p-5 shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#94442A] tracking-wider">
                      {v.category}
                    </span>
                    <h3 className="font-editorial text-lg font-medium text-[#252722] mt-0.5">{v.description}</h3>
                  </div>

                  <select
                    value={v.status}
                    onChange={e => handleUpdateStatus(v.id, e.target.value as VendorStatus)}
                    className={`text-[11px] font-semibold px-2 py-1 rounded border capitalize focus:outline-none ${
                      v.status === 'confirmed' ? 'bg-[#EFF4EE] text-[#40533C] border-[#D8E2D5]' :
                      v.status === 'quotation_received' ? 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]' :
                      'bg-[#F8F7F3] text-[#555850] border-[#E8E6DF]'
                    }`}
                  >
                    <option value="researching">Researching</option>
                    <option value="quotation_received">Quote Received</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="flex items-center space-x-4 text-xs pt-2">
                  <div>
                    <span className="text-[#777A72]">Quote:</span>{' '}
                    <span className="font-semibold text-[#252722] tabular-nums">
                      {v.quotedAmount ? formatINR(v.quotedAmount) : 'Pending Quote'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#777A72]">Deadline:</span>{' '}
                    <span className="font-medium text-[#555850]">{v.decisionDeadline}</span>
                  </div>
                </div>

                {v.contactNotes && (
                  <div className="mt-2.5 p-2 rounded bg-[#F8F7F3] border border-[#E8E6DF] text-xs text-[#555850] flex items-start space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#777A72] shrink-0 mt-0.5" />
                    <span>{v.contactNotes}</span>
                  </div>
                )}

                {v.questionsToAsk && v.questionsToAsk.length > 0 && (
                  <div className="mt-3 text-xs space-y-1">
                    <span className="text-[10px] uppercase font-semibold text-[#777A72]">Suggested Questions:</span>
                    <ul className="list-disc list-inside text-[#555850] text-[11px] space-y-0.5">
                      {v.questionsToAsk.map((q, idx) => (
                        <li key={idx}>{q}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2 border-t border-[#E8E6DF]">
                <button
                  onClick={() => handleDelete(v.id)}
                  className="text-xs text-[#777A72] hover:text-[#DC2626] flex items-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#191D17]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#E8E6DF] shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-editorial text-xl font-medium text-[#252722]">Add Vendor Requirement</h3>

            <form onSubmit={handleAddVendor} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#555850] font-medium mb-1">Service Category *</label>
                <input
                  type="text"
                  required
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  placeholder="e.g. Photography, Catering, Sound"
                  className="w-full px-3 py-2 bg-white border border-[#E8E6DF] rounded-md focus:outline-none focus:border-[#94442A]"
                />
              </div>

              <div>
                <label className="block text-[#555850] font-medium mb-1">Company / Scope Title *</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g. Shree Heritage Catering Service"
                  className="w-full px-3 py-2 bg-white border border-[#E8E6DF] rounded-md focus:outline-none focus:border-[#94442A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#555850] font-medium mb-1">Estimated / Quoted (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={quotedAmount}
                    onChange={e => setQuotedAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-[#E8E6DF] rounded-md focus:outline-none focus:border-[#94442A] tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-[#555850] font-medium mb-1">Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as VendorStatus)}
                    className="w-full px-3 py-2 bg-white border border-[#E8E6DF] rounded-md focus:outline-none focus:border-[#94442A]"
                  >
                    <option value="researching">Researching</option>
                    <option value="quotation_received">Quote Received</option>
                    <option value="confirmed">Confirmed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#555850] font-medium mb-1">Contact Notes / References</label>
                <input
                  type="text"
                  value={contactNotes}
                  onChange={e => setContactNotes(e.target.value)}
                  placeholder="Phone number, manager name, quote valid till..."
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
                  Save Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
