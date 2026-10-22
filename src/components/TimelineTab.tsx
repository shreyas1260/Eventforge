import React, { useState } from 'react';
import { Plus, CheckCircle, Clock, ShieldAlert, Trash2, Calendar } from 'lucide-react';
import { Task, TaskStatus, PriorityLevel } from '../types';
import { getDaysUntil, isTaskOverdue, isTaskDueSoon } from '../lib/calculations';

interface TimelineTabProps {
  tasks: Task[];
  eventDate: string;
  onUpdateTasks: (newTasks: Task[]) => void;
}

export const TimelineTab: React.FC<TimelineTabProps> = ({
  tasks,
  eventDate,
  onUpdateTasks,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [category, setCategory] = useState('Planning');

  const sortedTasks = [...tasks].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const overdueTasks = sortedTasks.filter(isTaskOverdue);
  const dueSoonTasks = sortedTasks.filter(t => isTaskDueSoon(t, 7));

  const handleToggleStatus = (id: string) => {
    const updated = tasks.map(t => {
      if (t.id === id) {
        const nextStatus: TaskStatus = t.status === 'completed' ? 'in_progress' : 'completed';
        return { ...t, status: nextStatus, updatedAt: new Date().toISOString() };
      }
      return t;
    });
    onUpdateTasks(updated);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this task?')) {
      onUpdateTasks(tasks.filter(t => t.id !== id));
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      eventId: tasks[0]?.eventId || 'event-active',
      title,
      description,
      dueDate,
      priority,
      status: 'not_started',
      category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onUpdateTasks([...tasks, newTask]);
    setTitle('');
    setDescription('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-[#E8E6DF] p-5 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-editorial text-xl font-medium text-[#252722]">Timeline & Deadline Radar</h2>
          <p className="text-xs text-[#777A72]">
            Preparation sequence anchored against event date ({eventDate}).
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3 py-1.5 rounded-md text-xs font-medium bg-[#94442A] text-white hover:bg-[#B35C40] flex items-center space-x-1 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Task</span>
        </button>
      </div>

      {(overdueTasks.length > 0 || dueSoonTasks.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {overdueTasks.length > 0 && (
            <div className="p-4 rounded-xl bg-[#FEE2E2] border border-[#FECACA] space-y-2">
              <div className="flex items-center space-x-2 text-[#991B1B]">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  Radar Alert: {overdueTasks.length} Overdue Task(s)
                </h3>
              </div>
              <ul className="space-y-1 text-xs text-[#7F1D1D]">
                {overdueTasks.map(t => (
                  <li key={t.id} className="flex justify-between items-center bg-white/60 p-2 rounded">
                    <span>{t.title}</span>
                    <button
                      onClick={() => handleToggleStatus(t.id)}
                      className="px-2 py-0.5 rounded bg-[#991B1B] text-white text-[10px] hover:bg-[#7F1D1D]"
                    >
                      Mark Complete
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {dueSoonTasks.length > 0 && (
            <div className="p-4 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] space-y-2">
              <div className="flex items-center space-x-2 text-[#92400E]">
                <Clock className="w-4 h-4 shrink-0" />
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  Due in Next 7 Days ({dueSoonTasks.length})
                </h3>
              </div>
              <ul className="space-y-1 text-xs text-[#78350F]">
                {dueSoonTasks.map(t => (
                  <li key={t.id} className="flex justify-between items-center bg-white/60 p-2 rounded">
                    <span>{t.title}</span>
                    <span className="text-[10px] font-mono">{t.dueDate}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl border border-[#E8E6DF] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E8E6DF] bg-[#F8F7F3] flex justify-between items-center">
          <h3 className="font-editorial text-lg font-medium text-[#252722]">Preparation Milestones ({tasks.length})</h3>
          <span className="text-xs text-[#777A72]">
            {tasks.filter(t => t.status === 'completed').length} completed
          </span>
        </div>

        <div className="divide-y divide-[#E8E6DF]">
          {sortedTasks.length === 0 ? (
            <div className="p-8 text-center text-[#777A72] text-xs">
              No tasks scheduled. Click "Add Task" to create one.
            </div>
          ) : (
            sortedTasks.map(task => {
              const overdue = isTaskOverdue(task);
              const isCompleted = task.status === 'completed';
              const daysLeft = getDaysUntil(task.dueDate);

              return (
                <div 
                  key={task.id} 
                  className={`p-4 flex items-start justify-between gap-3 hover:bg-[#FAF9F6] transition-colors ${
                    isCompleted ? 'opacity-60 bg-[#F8F7F3]/50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <button
                      onClick={() => handleToggleStatus(task.id)}
                      className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                        isCompleted
                          ? 'bg-[#52634D] border-[#52634D] text-white'
                          : 'bg-white border-[#777A72] hover:border-[#94442A]'
                      }`}
                    >
                      {isCompleted && <CheckCircle className="w-3.5 h-3.5" />}
                    </button>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-sm font-medium ${isCompleted ? 'line-through text-[#777A72]' : 'text-[#252722]'}`}>
                          {task.title}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#EFECE5] text-[#555850]">
                          {task.category}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-semibold ${
                          task.priority === 'high' ? 'bg-[#FEE2E2] text-[#991B1B]' :
                          task.priority === 'medium' ? 'bg-[#FEF3C7] text-[#92400E]' :
                          'bg-[#F3F1EB] text-[#555850]'
                        }`}>
                          {task.priority}
                        </span>
                      </div>

                      {task.description && (
                        <p className="text-xs text-[#777A72] leading-relaxed max-w-2xl">{task.description}</p>
                      )}

                      <div className="flex items-center space-x-3 text-[11px] pt-1">
                        <span className={`flex items-center space-x-1 ${overdue ? 'text-[#DC2626] font-semibold' : 'text-[#777A72]'}`}>
                          <Calendar className="w-3 h-3" />
                          <span>{task.dueDate}</span>
                          {!isCompleted && (
                            <span>
                              ({overdue ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days left`})
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(task.id)}
                    className="p-1 rounded text-[#777A72] hover:text-[#DC2626] hover:bg-[#FEE2E2]"
                    title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#191D17]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#E8E6DF] shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-editorial text-xl font-medium text-[#252722]">Add New Milestone Task</h3>

            <form onSubmit={handleAddTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#555850] font-medium mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Schedule food tasting with caterer"
                  className="w-full px-3 py-2 bg-white border border-[#E8E6DF] rounded-md focus:outline-none focus:border-[#94442A]"
                />
              </div>

              <div>
                <label className="block text-[#555850] font-medium mb-1">Details / Notes</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Key dependencies, contacts, or instructions..."
                  className="w-full px-3 py-2 bg-white border border-[#E8E6DF] rounded-md focus:outline-none focus:border-[#94442A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#555850] font-medium mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E8E6DF] rounded-md focus:outline-none focus:border-[#94442A]"
                  />
                </div>

                <div>
                  <label className="block text-[#555850] font-medium mb-1">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    placeholder="Venue, Catering, Decor..."
                    className="w-full px-3 py-2 bg-white border border-[#E8E6DF] rounded-md focus:outline-none focus:border-[#94442A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#555850] font-medium mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as PriorityLevel)}
                  className="w-full px-3 py-2 bg-white border border-[#E8E6DF] rounded-md focus:outline-none focus:border-[#94442A]"
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
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
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
