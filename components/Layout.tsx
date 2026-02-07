import React, { useState, useRef, useEffect } from 'react';
import { LayoutDashboard, Network, Zap, Bot, X, Send, Sparkles, MessageSquare } from 'lucide-react';
import { sendTutorMessage } from '../services/geminiService';
import { ChatMessage } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  resetView: () => void;
  goToKnowledgeGraph: () => void;
  showAssistant?: boolean;
}

const GlobalAssistant: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: 'init', role: 'model', text: '你好！我是您的**专属助教**。\n\n我可以为您解答关于：\n- 🎓 **课程体系咨询**\n- 🛠️ **平台功能使用**\n- 💡 **个性化学习建议**\n\n请问有什么可以帮您？', timestamp: new Date() }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        const contextMsg = "（系统提示：你现在是讯飞AI大学堂的全局专属助教，不局限于具体课程，而是服务于整个平台用户。请回答用户关于平台、课程体系或通用AI学习的问题。） " + input;
        
        const responseText = await sendTutorMessage(messages, contextMsg);
        
        const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: responseText, timestamp: new Date() };
        setMessages(prev => [...prev, botMsg]);
        setIsTyping(false);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end pointer-events-auto">
            {!isOpen && (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="group flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 pl-5 pr-3 py-3 rounded-full shadow-[0_8px_20px_rgba(59,130,246,0.3)] hover:scale-105 transition-all"
                >
                    <span className="font-bold text-base text-white">专属助教</span>
                    <div className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center text-white relative">
                        <Bot size={22} />
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full animate-pulse border-2 border-indigo-500"></span>
                    </div>
                </button>
            )}

            {isOpen && (
                <div className="w-[380px] h-[600px] bg-white/95 backdrop-blur-xl border border-blue-100 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300 ring-1 ring-blue-50">
                    {/* Header */}
                    <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-between shrink-0 shadow-sm">
                        <div className="flex items-center gap-2 text-white font-bold text-base">
                            <Bot size={22} />
                            专属助教
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-lg transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 scrollbar-hide">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${
                                    msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border border-blue-100'
                                }`}>
                                    {msg.role === 'user' ? <MessageSquare size={18} /> : <Sparkles size={18} />}
                                </div>
                                <div className={`p-3.5 rounded-2xl text-sm leading-relaxed max-w-[85%] shadow-sm whitespace-pre-wrap ${
                                    msg.role === 'user' 
                                    ? 'bg-blue-600 text-white rounded-tr-none' 
                                    : 'bg-white text-slate-700 border border-blue-100 rounded-tl-none'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                             <div className="flex gap-3">
                                <div className="w-9 h-9 rounded-lg bg-white border border-blue-100 flex items-center justify-center text-blue-500 shadow-sm">
                                    <Sparkles size={18} />
                                </div>
                                <div className="text-slate-500 text-sm flex items-center">思考中...</div>
                             </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="p-4 bg-white border-t border-blue-50 flex gap-2 shrink-0">
                        <input 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="询问课程、平台功能或学习建议..."
                            className="flex-1 bg-slate-50 text-slate-800 text-sm px-4 py-3 rounded-xl border border-blue-100 focus:border-blue-500 outline-none placeholder-slate-400 transition-colors"
                        />
                        <button type="submit" disabled={!input.trim()} className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md">
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

const Layout: React.FC<LayoutProps> = ({ children, resetView, goToKnowledgeGraph, showAssistant = true }) => {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-blue-200 selection:text-blue-900 relative overflow-x-hidden">
      
      {/* Light Clean Background */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-br from-slate-50 via-blue-50 to-white">
          {/* Subtle Orbs */}
          <div className="absolute top-[-10%] left-[20%] w-[40vw] h-[40vw] bg-blue-200/20 rounded-full blur-[120px] animate-pulse-slow mix-blend-multiply"></div>
          <div className="absolute bottom-[-10%] right-[10%] w-[35vw] h-[35vw] bg-indigo-200/20 rounded-full blur-[100px] animate-float mix-blend-multiply"></div>
          
          {/* Tech Grid - Light */}
          <div className="absolute inset-0" 
             style={{
               backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.05) 1px, transparent 1px)',
               backgroundSize: '80px 80px',
               maskImage: 'radial-gradient(circle at 50% 50%, black 40%, transparent 100%)'
             }}>
          </div>
      </div>
      
      {/* Navigation */}
      <nav className="h-20 fixed top-0 w-full z-50 px-6 lg:px-8 flex items-center justify-between border-b border-blue-100 bg-white/80 backdrop-blur-xl shadow-sm">
        
        {/* Logo */}
        <div className="flex items-center gap-4 cursor-pointer group" onClick={resetView}>
          <div className="relative w-9 h-9 flex items-center justify-center">
              <div className="absolute inset-0 bg-blue-500 blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <img 
                src="https://www.aidaxue.com/images/logo_2025-7026010a9d6870e90dcc127095dd5629.png" 
                alt="讯飞AI大学堂" 
                className="w-full h-full object-contain relative z-10"
              />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800 group-hover:text-blue-600 transition-colors">
            讯飞AI大学堂
          </span>
        </div>

        {/* Center Nav */}
        <div className="hidden md:flex items-center gap-1 p-1 bg-slate-100/50 rounded-full border border-blue-100/50">
            <button onClick={resetView} className="px-6 py-2.5 rounded-full text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-white hover:shadow-sm transition-all flex items-center gap-2">
                <LayoutDashboard size={16} /> 智能学习规划
            </button>
            <button onClick={goToKnowledgeGraph} className="px-6 py-2.5 rounded-full text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-white hover:shadow-sm transition-all flex items-center gap-2">
                <Network size={16} className="text-blue-500" /> AI 知识图谱
            </button>
        </div>

        {/* User */}
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                  <div className="text-sm font-bold text-slate-800">Learner</div>
                  <div className="text-xs text-blue-500">进阶 · 工程师</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 p-[1px] shadow-lg shadow-blue-500/20">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-sm font-bold text-blue-600">
                      L
                  </div>
              </div>
           </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 relative z-10">
        {children}
      </main>

      {/* Global AI Assistant Widget */}
      {showAssistant && <GlobalAssistant />}

    </div>
  );
};

export default Layout;