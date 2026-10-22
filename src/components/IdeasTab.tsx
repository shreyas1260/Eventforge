import React, { useState } from 'react';
import { Sparkles, Plus, Check, Bookmark, BookmarkCheck } from 'lucide-react';
import { Idea, IdeaCategory, BudgetItem, Task } from '../types';

interface IdeasTabProps {
  ideas: Idea[];
  onUpdateIdeas: (newIdeas: Idea[]) => void;
  onAddBudgetItem: (item: BudgetItem) => void;
  onAddTask: (task: Task) => void;
}

const CATEGORIES: (IdeaCategory | 'All')[] = [
  'All',
  'Theme & Palette',
  'Decoration',
  'Guest Engagement',
  'Food & Drinks',
  'Entertainment',
  'Photo Opportunities',
  'Eco-friendly',
];

export const IdeasTab: React.FC<IdeasTabProps> = ({
  ideas,
  onUpdateIdeas,
  onAddTask,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<IdeaCategory | 'All'>('All');

  const filteredIdeas = selectedCategory === 'All'
    ? ideas
    : ideas.filter(i => i.category === selectedCategory);

  const handleToggleSave = (id: string) => {
    const updated = ideas.map(i => (i.id === id ? { ...i, saved: !i.saved } : i));
    onUpdateIdeas(updated);
  };

  const handleApplyToPlan = (idea: Idea) => {
    const updated = ideas.map(i => (i.id === idea.id ? { ...i, appliedToPlan: true, saved: true } : i));
    onUpdateIdeas(updated);

    const newTask: Task = {
      id: `task-idea-${Date.now()}`,
      eventId: idea.eventId,
      title: `Implement Idea: ${idea.title}`,
      description: `${idea.description} (Category: ${idea.category})`,
      dueDate: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
      priority: 'medium',
      status: 'not_started',
      category: idea.category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onAddTask(newTask);
    alert(`"${idea.title}" added to your Event Timeline.`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-[#E8E6DF] p-5 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[#94442A]" />
            <h2 className="font-editorial text-xl font-medium text-[#252722]">Personalized Ideas Studio</h2>
          </div>
          <p className="text-xs text-[#777A72] mt-0.5">
            Creative concepts and experiential touches matched to your event preferences.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              selectedCategory === cat
                ? 'bg-[#94442A] text-white border-[#94442A]'
                : 'bg-white text-[#555850] border-[#E8E6DF] hover:bg-[#F8F7F3]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIdeas.length === 0 ? (
          <div className="col-span-3 p-8 text-center text-[#777A72] text-xs bg-white rounded-xl border border-[#E8E6DF]">
            No ideas in this category yet.
          </div>
        ) : (
          filteredIdeas.map(idea => (
            <div key={idea.id} className="bg-white rounded-xl border border-[#E8E6DF] p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#94442A] transition-colors">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <span className="text-[10px] uppercase font-semibold text-[#94442A] tracking-wider px-2 py-0.5 rounded bg-[#F8F7F3] border border-[#E8E6DF]">
                    {idea.category}
                  </span>
                  <button
                    onClick={() => handleToggleSave(idea.id)}
                    className="text-[#777A72] hover:text-[#94442A] p-0.5"
                    title={idea.saved ? 'Unsave idea' : 'Save idea'}
                  >
                    {idea.saved ? (
                      <BookmarkCheck className="w-4 h-4 text-[#94442A]" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <h3 className="font-editorial text-lg font-medium text-[#252722]">{idea.title}</h3>
                <p className="text-xs text-[#777A72] leading-relaxed">{idea.description}</p>

                {idea.assumptions && (
                  <p className="text-[11px] text-[#555850] italic bg-[#F8F7F3] p-2 rounded border border-[#E8E6DF]">
                    {idea.assumptions}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-[#E8E6DF] flex items-center justify-between">
                <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded ${
                  idea.costLevel === 'budget' ? 'bg-[#EFF4EE] text-[#40533C]' :
                  idea.costLevel === 'moderate' ? 'bg-[#FEF3C7] text-[#92400E]' :
                  'bg-[#F3F1EB] text-[#555850]'
                }`}>
                  {idea.costLevel}
                </span>

                <button
                  onClick={() => handleApplyToPlan(idea)}
                  disabled={idea.appliedToPlan}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center space-x-1 transition-colors ${
                    idea.appliedToPlan
                      ? 'bg-[#EFF4EE] text-[#40533C] cursor-default'
                      : 'bg-[#94442A] text-white hover:bg-[#B35C40] shadow-xs'
                  }`}
                >
                  {idea.appliedToPlan ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Added to Plan</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Plan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
