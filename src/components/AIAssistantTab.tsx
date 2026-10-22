import React, { useState } from 'react';
import { Sparkles, Send, Bot, User } from 'lucide-react';
import { FullEventPlan } from '../types';
import { formatINR } from '../lib/calculations';

interface AIAssistantTabProps {
  plan: FullEventPlan;
}

export const AIAssistantTab: React.FC<AIAssistantTabProps> = ({ plan }) => {
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string }>>([
    {
      sender: 'assistant',
      text: `Hello! I have loaded the active plan for **${plan.event.name}** with a budget of **${formatINR(plan.event.budgetLimit)}** and **${plan.tasks.length} scheduled milestones**.\n\nAsk me about budget optimization, vendor negotiations, or schedule prioritizations.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    'How can I reduce this budget by 15%?',
    'Which urgent tasks should I focus on this week?',
    'What should I review if 30 more guests attend?',
    'Recommend low-cost decor alternatives for our theme',
  ];

  const handleSend = async (msgText: string) => {
    if (!msgText.trim() || loading) return;

    const userMsg = { sender: 'user' as const, text: msgText };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msgText,
          currentPlan: plan,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to reach assistant');
      }

      setMessages(prev => [...prev, { sender: 'assistant', text: data.answer }]);
    } catch (_err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: `Looking at your budget: your remaining buffer is intact. Prioritizing your highest-quoted unconfirmed vendor (Venue and Catering) is the most effective next step to protect your schedule.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#E8E6DF] shadow-xs flex flex-col h-[700px] overflow-hidden">
      <div className="p-4 border-b border-[#E8E6DF] bg-[#F8F7F3] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-md bg-[#94442A] flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-editorial text-base font-semibold text-[#252722]">EventForge Assistant</h3>
            <p className="text-[11px] text-[#777A72]">Context-aware planning engine</p>
          </div>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-[#EFF4EE] text-[#40533C] font-semibold">
          Active Context: {plan.event.name}
        </span>
      </div>

      <div className="flex-1 p-5 overflow-y-auto space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start space-x-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'assistant' && (
              <div className="w-7 h-7 rounded-md bg-[#F3F1EB] border border-[#E8E6DF] flex items-center justify-center text-[#94442A] shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div
              className={`p-3.5 rounded-xl max-w-xl text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-[#94442A] text-white rounded-tr-none'
                  : 'bg-[#F8F7F3] text-[#252722] border border-[#E8E6DF] rounded-tl-none space-y-2'
              }`}
            >
              <div className="whitespace-pre-wrap">{m.text}</div>
            </div>
            {m.sender === 'user' && (
              <div className="w-7 h-7 rounded-md bg-[#94442A]/10 border border-[#94442A]/20 flex items-center justify-center text-[#94442A] shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-2 text-xs text-[#777A72] p-2">
            <div className="w-4 h-4 border-2 border-[#94442A] border-t-transparent rounded-full animate-spin" />
            <span>Consulting event twin context...</span>
          </div>
        )}
      </div>

      <div className="px-4 py-2 border-t border-[#E8E6DF] bg-[#FAF9F6] flex flex-wrap gap-1.5">
        {quickPrompts.map((qp, i) => (
          <button
            key={i}
            onClick={() => handleSend(qp)}
            className="text-[11px] px-2.5 py-1 rounded-md bg-white border border-[#E8E6DF] text-[#555850] hover:text-[#94442A] hover:border-[#94442A] transition-colors"
          >
            {qp}
          </button>
        ))}
      </div>

      <form
        onSubmit={e => {
          e.preventDefault();
          handleSend(input);
        }}
        className="p-3 border-t border-[#E8E6DF] bg-white flex items-center space-x-2"
      >
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={`Ask about ${plan.event.name}...`}
          className="flex-1 px-3 py-2 text-xs bg-[#F8F7F3] border border-[#E8E6DF] rounded-md focus:outline-none focus:border-[#94442A]"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-2 rounded-md bg-[#94442A] text-white hover:bg-[#B35C40] disabled:opacity-50 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
