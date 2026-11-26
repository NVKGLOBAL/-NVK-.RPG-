import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSovereignAI } from '../../context/SovereignAIContext';

export interface AssistantTask {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: number;
}

export interface AssistantGoal {
  id: string;
  title: string;
  progress: number;
  totalSteps: number;
  deadline?: string;
}

export interface AssistantResearch {
  id: string;
  topic: string;
  status: 'pending' | 'active' | 'complete';
  summary?: string;
}

export interface AssistantAccomplishment {
  id: string;
  title: string;
  date: number;
  type: 'task' | 'goal' | 'research';
}

interface AssistantDashboardPanelProps {
  addEchoMessage: (source: string, text: string, colorClass?: string) => void;
}

const AssistantDashboardPanel: React.FC<AssistantDashboardPanelProps> = ({ addEchoMessage }) => {
  const { invokeAI, isGenerating } = useSovereignAI();
  
  const [tasks, setTasks] = useState<AssistantTask[]>([
    { id: 't1', title: 'Initialize Sovereign Kernel', completed: true, priority: 'high', createdAt: Date.now() - 86400000 },
    { id: 't2', title: 'Calibrate Entropic Sensors', completed: false, priority: 'medium', createdAt: Date.now() },
    { id: 't3', title: 'Review Codex Axioms', completed: false, priority: 'low', createdAt: Date.now() },
  ]);
  
  const [goals, setGoals] = useState<AssistantGoal[]>([
    { id: 'g1', title: 'Master Tri-Sophian Architecture', progress: 3, totalSteps: 10 },
    { id: 'g2', title: 'Synthesize Prime Artifact', progress: 1, totalSteps: 5 },
  ]);
  
  const [research, setResearch] = useState<AssistantResearch[]>([
    { id: 'r1', topic: 'Quantum Resonance in UI Design', status: 'active' },
    { id: 'r2', topic: 'Non-Euclidean Data Structures', status: 'pending' },
  ]);
  
  const [accomplishments, setAccomplishments] = useState<AssistantAccomplishment[]>([
    { id: 'a1', title: 'System Boot Sequence Completed', date: Date.now() - 172800000, type: 'task' },
    { id: 'a2', title: 'First Artifact Generated', date: Date.now() - 86400000, type: 'goal' },
  ]);

  const [newTaskInput, setNewTaskInput] = useState('');
  const [newResearchInput, setNewResearchInput] = useState('');
  const [newGoalInput, setNewGoalInput] = useState('');

  const handleAddGoal = () => {
    if (!newGoalInput.trim()) return;
    const newGoal: AssistantGoal = {
      id: `g_${Date.now()}`,
      title: newGoalInput.trim(),
      progress: 0,
      totalSteps: 5 // Default steps
    };
    setGoals([newGoal, ...goals]);
    setNewGoalInput('');
    addEchoMessage('Assistant', `Goal established: ${newGoal.title}`, 'text-amber-400');
  };

  const handleProgressGoal = (id: string) => {
    const goal = goals.find(g => g.id === id);
    if (!goal || goal.progress >= goal.totalSteps) return;
    
    const newProgress = goal.progress + 1;
    
    setGoals(prev => prev.map(g => 
      g.id === id ? { ...g, progress: newProgress } : g
    ));
    
    if (newProgress === goal.totalSteps) {
      setAccomplishments(acc => [{
        id: `a_${Date.now()}`,
        title: `Achieved Goal: ${goal.title}`,
        date: Date.now(),
        type: 'goal'
      }, ...acc]);
      addEchoMessage('Assistant', `Goal achieved: ${goal.title}`, 'text-amber-400');
    }
  };

  const handleAddTask = () => {
    if (!newTaskInput.trim()) return;
    const newTask: AssistantTask = {
      id: `t_${Date.now()}`,
      title: newTaskInput.trim(),
      completed: false,
      priority: 'medium',
      createdAt: Date.now()
    };
    setTasks([newTask, ...tasks]);
    setNewTaskInput('');
    addEchoMessage('Assistant', `Task added: ${newTask.title}`, 'text-emerald-400');
  };

  const handleToggleTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    const isCompleting = !task.completed;
    
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, completed: isCompleting } : t
    ));
    
    if (isCompleting) {
      setAccomplishments(acc => [{
        id: `a_${Date.now()}`,
        title: `Completed Task: ${task.title}`,
        date: Date.now(),
        type: 'task'
      }, ...acc]);
      addEchoMessage('Assistant', `Task completed: ${task.title}`, 'text-emerald-400');
    }
  };

  const handleStartResearch = async () => {
    if (!newResearchInput.trim() || isGenerating) return;
    
    const topic = newResearchInput.trim();
    const newRes: AssistantResearch = {
      id: `r_${Date.now()}`,
      topic,
      status: 'active'
    };
    
    setResearch([newRes, ...research]);
    setNewResearchInput('');
    addEchoMessage('Assistant', `Initiating research on: ${topic}`, 'text-indigo-400');

    try {
      const prompt = `You are a highly advanced AI assistant. Provide a concise, insightful 3-sentence summary researching the following topic: "${topic}"`;
      const response = await invokeAI(prompt, undefined, "text/plain");
      
      setResearch(prev => prev.map(r => 
        r.id === newRes.id ? { ...r, status: 'complete', summary: response || "Research complete." } : r
      ));
      
      setAccomplishments(acc => [{
        id: `a_${Date.now()}`,
        title: `Researched: ${topic}`,
        date: Date.now(),
        type: 'research'
      }, ...acc]);
      
      addEchoMessage('Assistant', `Research complete: ${topic}`, 'text-teal-400');
    } catch (error) {
      setResearch(prev => prev.map(r => 
        r.id === newRes.id ? { ...r, status: 'complete', summary: 'Research failed due to temporal interference.' } : r
      ));
    }
  };

  return (
    <div className="w-full min-h-[700px] bg-slate-950/80 border border-indigo-500/30 rounded-2xl p-6 flex flex-col gap-6 overflow-hidden backdrop-blur-xl shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
        <div>
          <h2 className="text-2xl font-cinzel font-bold text-indigo-300 flex items-center gap-3">
            <i className="ri-robot-2-line text-3xl text-indigo-500"></i>
            Sovereign Assistant Nexus
          </h2>
          <p className="text-xs font-mono text-slate-400 mt-1 uppercase tracking-widest">Personalized Intelligence Matrix</p>
        </div>
        <div className="flex gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400">{tasks.filter(t => t.completed).length}</div>
            <div className="text-[10px] font-mono text-slate-500 uppercase">Tasks Done</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-teal-400">{research.filter(r => r.status === 'complete').length}</div>
            <div className="text-[10px] font-mono text-slate-500 uppercase">Insights</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-400">{accomplishments.length}</div>
            <div className="text-[10px] font-mono text-slate-500 uppercase">Milestones</div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow min-h-0">
        
        {/* Active Goals */}
        <div className="bg-slate-900/50 border border-white/5 rounded-xl p-4 flex flex-col gap-4 overflow-hidden">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <i className="ri-focus-3-line text-amber-400"></i> Active Goals
          </h3>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={newGoalInput}
              onChange={e => setNewGoalInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddGoal()}
              placeholder="Define new objective..."
              className="flex-grow bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 outline-none"
            />
            <button 
              onClick={handleAddGoal}
              disabled={!newGoalInput.trim()}
              className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white px-3 py-2 rounded-lg transition-colors"
            >
              <i className="ri-add-line"></i>
            </button>
          </div>
          <div className="flex-grow overflow-y-auto custom-scrollbar space-y-4 pr-2">
            {goals.map(goal => (
              <div key={goal.id} className="bg-black/20 p-3 rounded-lg border border-white/5">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-medium text-slate-300">{goal.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-amber-400">{goal.progress} / {goal.totalSteps}</span>
                    {goal.progress < goal.totalSteps && (
                      <button 
                        onClick={() => handleProgressGoal(goal.id)}
                        className="text-amber-400 hover:text-amber-300 transition-colors"
                        title="Advance Progress"
                      >
                        <i className="ri-arrow-right-s-line"></i>
                      </button>
                    )}
                  </div>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5">
                  <div 
                    className="bg-amber-400 h-1.5 rounded-full transition-all duration-500" 
                    style={{ width: `${(goal.progress / goal.totalSteps) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Research */}
        <div className="bg-slate-900/50 border border-white/5 rounded-xl p-4 flex flex-col gap-4 overflow-hidden">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <i className="ri-microscope-line text-teal-400"></i> Active Research
          </h3>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={newResearchInput}
              onChange={e => setNewResearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleStartResearch()}
              placeholder="Enter topic to research..."
              className="flex-grow bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-teal-500 outline-none"
            />
            <button 
              onClick={handleStartResearch}
              disabled={isGenerating || !newResearchInput.trim()}
              className="bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white px-3 py-2 rounded-lg transition-colors"
            >
              <i className="ri-search-line"></i>
            </button>
          </div>
          <div className="flex-grow overflow-y-auto custom-scrollbar space-y-3 pr-2">
            {research.map(res => (
              <div key={res.id} className="bg-black/20 p-3 rounded-lg border border-white/5">
                <div className="flex items-center gap-2 mb-1">
                  {res.status === 'active' ? (
                    <i className="ri-loader-4-line animate-spin text-teal-400"></i>
                  ) : res.status === 'complete' ? (
                    <i className="ri-check-double-line text-emerald-400"></i>
                  ) : (
                    <i className="ri-time-line text-slate-500"></i>
                  )}
                  <span className="text-sm font-medium text-slate-200">{res.topic}</span>
                </div>
                {res.summary && (
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed italic border-l-2 border-teal-500/30 pl-2">
                    {res.summary}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Task Matrix */}
        <div className="bg-slate-900/50 border border-white/5 rounded-xl p-4 flex flex-col gap-4 overflow-hidden">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <i className="ri-list-check-2 text-emerald-400"></i> Task Matrix
          </h3>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={newTaskInput}
              onChange={e => setNewTaskInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddTask()}
              placeholder="Add new task..."
              className="flex-grow bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none"
            />
            <button 
              onClick={handleAddTask}
              disabled={!newTaskInput.trim()}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-3 py-2 rounded-lg transition-colors"
            >
              <i className="ri-add-line"></i>
            </button>
          </div>
          <div className="flex-grow overflow-y-auto custom-scrollbar space-y-2 pr-2">
            {tasks.map(task => (
              <div 
                key={task.id} 
                className={`flex items-center gap-3 p-2 rounded-lg border transition-colors cursor-pointer hover:bg-white/5 ${
                  task.completed ? 'bg-emerald-900/10 border-emerald-500/20 opacity-60' : 'bg-black/20 border-white/5'
                }`}
                onClick={() => handleToggleTask(task.id)}
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                  task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-500'
                }`}>
                  {task.completed && <i className="ri-check-line text-white text-xs"></i>}
                </div>
                <span className={`text-sm flex-grow ${task.completed ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                  {task.title}
                </span>
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  task.priority === 'high' ? 'bg-rose-500' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-sky-500'
                }`} title={`Priority: ${task.priority}`}></div>
              </div>
            ))}
          </div>
        </div>

        {/* Accomplishments Log */}
        <div className="bg-slate-900/50 border border-white/5 rounded-xl p-4 flex flex-col gap-4 overflow-hidden">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <i className="ri-trophy-line text-indigo-400"></i> Accomplishments
          </h3>
          <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 relative">
            <div className="absolute left-[11px] top-2 bottom-2 w-px bg-slate-700"></div>
            <div className="space-y-4 relative">
              {accomplishments.map(acc => (
                <div key={acc.id} className="flex gap-4 relative">
                  <div className="w-6 h-6 rounded-full bg-slate-800 border-2 border-indigo-500 flex items-center justify-center shrink-0 z-10">
                    <i className={`text-[10px] ${
                      acc.type === 'task' ? 'ri-check-line text-emerald-400' : 
                      acc.type === 'research' ? 'ri-microscope-line text-teal-400' : 
                      'ri-focus-3-line text-amber-400'
                    }`}></i>
                  </div>
                  <div className="pt-1">
                    <div className="text-sm font-medium text-slate-200">{acc.title}</div>
                    <div className="text-[10px] font-mono text-slate-500 mt-1">
                      {new Date(acc.date).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AssistantDashboardPanel;
