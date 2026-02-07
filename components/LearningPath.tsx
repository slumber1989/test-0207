import React, { useState, useRef, useEffect } from 'react';
import { LearningPath as LearningPathType, Task, ChatMessage } from '../types';
import { PlayCircle, Code2, FileQuestion, ChevronDown, ChevronUp, Clock, Zap, LayoutDashboard, Bot, Send, X, Tag } from 'lucide-react';
import { sendTutorMessage } from '../services/geminiService';

interface LearningPathProps {
  path: LearningPathType;
  onStartTask: (task: Task) => void;
  onRegenerate: () => void;
  onViewAnalytics: () => void;
}

const LearningPath: React.FC<LearningPathProps> = ({ path, onStartTask, onRegenerate, onViewAnalytics }) => {
  const [expandedPhase, setExpandedPhase] = useState<string | null>(path.phases[0]?.id || null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantInput, setAssistantInput] = useState('');
  const [assistantMessages, setAssistantMessages] = useState<ChatMessage[]>([
      { id: '1', role: 'model', text: '你好！我是您的专属规划顾问。对目前的学习路径还满意吗？我可以帮您调整难度、侧重点或增加特定技能模块。', timestamp: new Date() }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const progressPercentage = 15;
  const size = 80;
  const strokeWidth = 6;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2 - 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  useEffect(() => {
    if (isAssistantOpen) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [assistantMessages, isAssistantOpen]);

  const handleAssistantSend = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!assistantInput.trim()) return;

      const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: assistantInput, timestamp: new Date() };
      setAssistantMessages(prev => [...prev, userMsg]);
      setAssistantInput('');
      setIsTyping(true);

      let responseText = "收到。";
      if (assistantInput.includes("难") || assistantInput.includes("简单") || assistantInput.includes("调整")) {
          responseText = `### 👨‍🏫 助教反馈
          
收到您的反馈！

1. **需求确认**：为您调整课程难度与侧重点。
2. **正在执行**：重新规划学习路径中，请稍候...`;
          setTimeout(() => {
              onRegenerate(); 
          }, 2000);
      } else {
          responseText = await sendTutorMessage(assistantMessages, assistantInput);
      }

      const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: responseText, timestamp: new Date() };
      setAssistantMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20 relative">
      
      {/* Path Header */}
      <div className="mb-12 flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
         <div className="flex-1 space-y-4">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold">
                 <Zap size={12} /> 星火大模型 · 专属规划
             </div>
             <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">{path.title}</h2>
                <p className="text-slate-400 max-w-2xl text-base leading-relaxed">{path.description}</p>
             </div>
             {path.tags && path.tags.length > 0 && (
                 <div className="flex flex-wrap gap-2 pt-1">
                     {path.tags.map((tag, idx) => (
                         <span key={idx} className={`text-xs font-medium px-2.5 py-1 rounded-full border bg-blue-500/10 text-blue-300 border-blue-500/20 flex items-center gap-1.5`}>
                             <Tag size={10} /> {tag}
                         </span>
                     ))}
                 </div>
             )}
         </div>
         
         <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full lg:w-auto bg-[#0f172a]/50 p-4 rounded-2xl border border-white/5">
             <div className="flex items-center gap-4">
                <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
                    <svg className="transform -rotate-90" width={size} height={size}>
                        <circle cx={center} cy={center} r={radius} stroke="#1e293b" strokeWidth={strokeWidth} fill="transparent" />
                        <circle cx={center} cy={center} r={radius} stroke="#3b82f6" strokeWidth={strokeWidth} fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
                    </svg>
                    <span className="absolute text-sm font-bold text-white">{progressPercentage}%</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-xs text-slate-400 font-bold uppercase mb-0.5">当前进度</span>
                    <span className="text-sm font-bold text-white">进行中</span>
                </div>
             </div>
             <div className="h-10 w-px bg-white/10 hidden sm:block"></div>
             <button onClick={onViewAnalytics} className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-blue-900/20">
                <LayoutDashboard size={16} /> 学习效果评估
             </button>
         </div>
      </div>

      {/* Main Roadmap */}
      <div className="max-w-4xl mx-auto relative">
          {/* Connecting Line (Curve Effect) */}
          <div className="absolute left-8 lg:left-1/2 top-4 bottom-0 w-1 bg-[#1e293b] rounded-full transform -translate-x-1/2">
              <div className="absolute top-0 left-0 w-full h-1/4 bg-gradient-to-b from-blue-600 to-transparent"></div>
          </div>

          <div className="space-y-12 relative">
              {path.phases.map((phase, index) => {
                  const isEven = index % 2 === 0;
                  return (
                    <div key={phase.id} className={`flex flex-col lg:flex-row gap-8 items-start relative ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                        
                        {/* Milestone Marker */}
                        <div className="absolute left-8 lg:left-1/2 w-12 h-12 bg-[#0f172a] border-4 border-blue-600 rounded-full flex items-center justify-center transform -translate-x-1/2 z-10 shadow-[0_0_20px_rgba(59,130,246,0.6)]">
                            <span className="text-white font-bold text-lg">{index + 1}</span>
                        </div>

                        {/* Spacer for Desktop Layout */}
                        <div className="hidden lg:block lg:w-1/2"></div>

                        {/* Content Card */}
                        <div className={`w-full lg:w-1/2 pl-24 lg:pl-0 ${isEven ? 'lg:pr-16 lg:text-right' : 'lg:pl-16 lg:text-left'}`}>
                             <div className={`bg-[#1e293b]/60 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden hover:border-blue-500/30 transition-all duration-300 group ${
                                 expandedPhase === phase.id ? 'ring-2 ring-blue-500/30 bg-[#1e293b]/80' : ''
                             }`}>
                                 <div 
                                    className={`p-6 cursor-pointer ${isEven ? 'lg:flex-row-reverse' : ''}`}
                                    onClick={() => setExpandedPhase(expandedPhase === phase.id ? null : phase.id)}
                                 >
                                    <div className="mb-2 inline-block px-3 py-1 rounded-full bg-blue-900/30 text-blue-400 text-xs font-bold border border-blue-500/20">
                                        PHASE {index + 1}
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">{phase.title}</h3>
                                    <p className="text-slate-400 text-sm mb-4">{phase.goal}</p>
                                    
                                    <div className={`flex items-center gap-2 text-sm text-slate-500 ${isEven ? 'lg:justify-end' : ''}`}>
                                        {expandedPhase === phase.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        <span>{expandedPhase === phase.id ? '收起详情' : '查看任务'}</span>
                                    </div>
                                 </div>

                                 {/* Tasks List */}
                                 {expandedPhase === phase.id && (
                                     <div className="border-t border-white/5 bg-[#0f172a]/30 p-4 space-y-4">
                                         {phase.weeks.map((week) => (
                                             <div key={week.week} className="space-y-3">
                                                 <div className={`text-xs font-bold text-slate-400 uppercase tracking-wider ${isEven ? 'lg:text-right' : ''}`}>Week {week.week} - {week.theme}</div>
                                                 {week.tasks.map((task, tIdx) => (
                                                      <div 
                                                        key={tIdx}
                                                        onClick={() => !task.isPro && onStartTask(task)}
                                                        className={`p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer bg-[#1e293b] border-white/5 hover:bg-blue-900/20 hover:border-blue-500/30 group/task ${isEven ? 'lg:flex-row-reverse' : ''}`}
                                                      >
                                                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover/task:scale-110 ${
                                                              task.type === 'video' ? 'bg-blue-500/20 text-blue-400' :
                                                              task.type === 'practice' ? 'bg-purple-500/20 text-purple-400' :
                                                              'bg-green-500/20 text-green-400'
                                                          }`}>
                                                              {task.type === 'video' && <PlayCircle size={14} />}
                                                              {task.type === 'practice' && <Code2 size={14} />}
                                                              {task.type === 'quiz' && <FileQuestion size={14} />}
                                                          </div>
                                                          <div className={`flex-1 ${isEven ? 'lg:text-right' : ''}`}>
                                                              <h4 className="text-sm font-medium text-slate-200 group-hover/task:text-white transition-colors">{task.title}</h4>
                                                              <div className={`text-xs text-slate-500 flex items-center gap-2 mt-1 ${isEven ? 'lg:justify-end' : ''}`}>
                                                                  <Clock size={10} /> {task.duration}
                                                              </div>
                                                          </div>
                                                      </div>
                                                 ))}
                                             </div>
                                         ))}
                                     </div>
                                 )}
                             </div>
                        </div>
                    </div>
                  );
              })}
          </div>
      </div>

      {/* Floating Assistant */}
      <div className="fixed bottom-8 right-8 z-50">
          {!isAssistantOpen && (
              <button 
                onClick={() => setIsAssistantOpen(true)}
                className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:scale-110 transition-transform text-white group"
              >
                  <Bot size={28} className="group-hover:rotate-12 transition-transform" />
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse border-2 border-[#020617]"></span>
              </button>
          )}

          {isAssistantOpen && (
              <div className="w-[350px] h-[500px] bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
                  <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-between text-white">
                      <div className="flex items-center gap-2 font-bold">
                          <Bot size={18} /> 规划顾问
                      </div>
                      <button onClick={() => setIsAssistantOpen(false)} className="hover:bg-white/10 p-1 rounded">
                          <X size={16} />
                      </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-[#0f172a]">
                      {assistantMessages.map((msg) => (
                          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                             <div className={`p-3 rounded-2xl text-xs max-w-[85%] whitespace-pre-wrap ${
                                 msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-[#1e293b] text-slate-200 border border-white/5 rounded-tl-none'
                             }`}>
                                 {msg.text}
                             </div>
                          </div>
                      ))}
                      {isTyping && <div className="text-slate-500 text-xs ml-4">AI 正在思考...</div>}
                      <div ref={messagesEndRef}></div>
                  </div>
                  <form onSubmit={handleAssistantSend} className="p-3 bg-[#1e293b] border-t border-white/10 flex gap-2">
                      <input 
                        value={assistantInput}
                        onChange={(e) => setAssistantInput(e.target.value)}
                        placeholder="输入 '太难了' 或 '增加实战'..."
                        className="flex-1 bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                      />
                      <button type="submit" className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500">
                          <Send size={16} />
                      </button>
                  </form>
              </div>
          )}
      </div>

    </div>
  );
};

export default LearningPath;