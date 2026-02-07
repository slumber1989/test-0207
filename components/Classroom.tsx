import React, { useState, useRef, useEffect } from 'react';
import { Task, ChatMessage, LearningPath, ClassroomTab, QuizQuestion, AINote, TranscriptLine, FlashCard } from '../types';
import { sendTutorMessage, generateQuiz, generateAINotes, evaluateCode } from '../services/geminiService';
import { 
    PlayCircle, Send, User, Sparkles, ArrowLeft, Code2, 
    Notebook, Bot, Camera, PenTool, Highlighter, BrainCircuit, Layers, FileText, Share2, QrCode, X, Copy, Download, GripVertical, CheckCircle
} from 'lucide-react';

interface ClassroomProps {
  task: Task;
  onBack: () => void;
  fullPath?: LearningPath; 
}

// Mock Transcript Data
const TRANSCRIPT_DATA: TranscriptLine[] = [
    { time: '00:05', text: '大家好，欢迎来到星火大模型实战课程。今天我们主要讲解 API 的核心调用逻辑。' },
    { time: '00:15', text: '首先，我们需要在开放平台获取 APPID 和 APISecret，这是鉴权的关键。' },
    { time: '00:45', text: '在 Python SDK 中，我们通过 SparkClient 类来初始化连接。大家注意看屏幕上的代码。' },
    { time: '01:20', text: '流式响应（Streaming）是提升用户体验的重要手段，它允许我们像打字机一样逐字展示结果。' },
    { time: '02:10', text: '如果遇到 401 错误，通常是签名生成算法的时间戳过期导致的，请检查系统时间。' },
];

// --- Simple Markdown Renderer Components ---
const parseInline = (text: string) => {
    // Bold: **text**
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
            return <code key={i} className="bg-slate-100 text-red-500 px-1 py-0.5 rounded font-mono text-sm">{part.slice(1, -1)}</code>;
        }
        return part;
    });
};

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    // 1. Split by code blocks
    const parts = content.split(/(```[\s\S]*?```)/);
    
    return (
        <div className="markdown-body space-y-2">
            {parts.map((part, index) => {
                if (part.startsWith('```') && part.endsWith('```')) {
                    // Code Block
                    const codeContent = part.slice(3, -3).replace(/^.*\n/, ''); // remove first line (lang)
                    return (
                        <div key={index} className="bg-slate-800 text-slate-200 p-3 rounded-xl my-3 font-mono text-xs md:text-sm overflow-x-auto shadow-sm border border-slate-700">
                            <pre>{codeContent.trim()}</pre>
                        </div>
                    );
                } else {
                    // Standard Text
                    return (
                        <div key={index}>
                            {part.split('\n').map((line, lineIdx) => {
                                const trimmed = line.trim();
                                if (!trimmed) return <div key={lineIdx} className="h-1" />;
                                
                                // Headers
                                if (trimmed.startsWith('### ')) return <h3 key={lineIdx} className="text-base font-bold text-slate-800 mt-4 mb-2">{parseInline(trimmed.slice(4))}</h3>;
                                if (trimmed.startsWith('## ')) return <h2 key={lineIdx} className="text-lg font-bold text-slate-900 mt-5 mb-3">{parseInline(trimmed.slice(3))}</h2>;
                                
                                // Lists
                                if (trimmed.startsWith('- ')) return <div key={lineIdx} className="flex gap-2.5 ml-1 my-1.5"><span className="text-blue-500 font-bold mt-1.5 w-1 h-1 rounded-full bg-blue-500 shrink-0 block"></span><div className="leading-relaxed">{parseInline(trimmed.slice(2))}</div></div>;
                                
                                // Ordered Lists
                                const orderedMatch = trimmed.match(/^(\d+)\. (.*)/);
                                if (orderedMatch) return <div key={lineIdx} className="flex gap-2 ml-1 my-1.5"><span className="font-bold text-blue-600 text-sm shrink-0">{orderedMatch[1]}.</span><div className="leading-relaxed">{parseInline(orderedMatch[2])}</div></div>;

                                // Blockquotes
                                if (trimmed.startsWith('> ')) return <blockquote key={lineIdx} className="border-l-4 border-blue-300 pl-4 py-1 my-3 bg-blue-50/50 text-slate-600 italic rounded-r-lg">{parseInline(trimmed.slice(2))}</blockquote>;

                                // Paragraph
                                return <div key={lineIdx} className="my-1.5 leading-relaxed">{parseInline(trimmed)}</div>;
                            })}
                        </div>
                    );
                }
            })}
        </div>
    );
};
// -------------------------------------------

const Classroom: React.FC<ClassroomProps> = ({ task, onBack, fullPath }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<ClassroomTab>('companion');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Resizable Split Pane State
  const [leftWidth, setLeftWidth] = useState(55); // percentage
  const containerRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  // Resize Handlers
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current || !containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      // Limit width between 20% and 80%
      if (newLeftWidth > 20 && newLeftWidth < 80) {
        setLeftWidth(newLeftWidth);
      }
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const startResizing = (e: React.MouseEvent) => {
      e.preventDefault();
      isResizing.current = true;
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none'; // Prevent text selection while dragging
  };
  
  // Flashcards (Chinese content & font)
  const [flashcards, setFlashcards] = useState<FlashCard[]>([
      { id: '1', front: 'API 鉴权三要素是什么？', back: 'APPID, APIKey, APISecret', mastered: false },
      { id: '2', front: 'WebSocket 状态码 10110 代表什么？', back: '服务端会话超时，通常由于网络波动或连接未正常关闭导致。', mastered: false },
      { id: '3', front: 'RAG 的核心流程？', back: '检索(Retrieve) -> 增强(Augment) -> 生成(Generate)', mastered: true }
  ]);
  const [flippedCardId, setFlippedCardId] = useState<string | null>(null);
  
  // Notes
  const [noteData, setNoteData] = useState<AINote[]>([]);
  const [userNotes, setUserNotes] = useState('');

  // Transcript Selection Share
  const [selectedText, setSelectedText] = useState('');
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [showShareCardModal, setShowShareCardModal] = useState(false);

  useEffect(() => {
    setMessages([{
        id: 'init',
        role: 'model',
        text: `### 👋 你好！我是你的 **AI 伴学**
        
我在听课的同时会为您：
- 📝 实时整理 **课程笔记**
- 🧠 绘制 **思维导图**
- 💡 整理 **知识闪卡**

您可以随时打断我提问，或者截图问我！`,
        timestamp: new Date()
    }]);

    generateAINotes(task.title).then(setNoteData);
  }, [task]);

  useEffect(() => {
    if (activeTab === 'companion') {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  const handleSendMessage = async (e?: React.FormEvent, imageBase64?: string) => {
    if (e) e.preventDefault();
    if (!input.trim() && !imageBase64) return;

    const currentText = input;
    const userMsg: ChatMessage = { 
        id: Date.now().toString(), 
        role: 'user', 
        text: currentText || (imageBase64 ? '我对这个画面有疑问' : ''), 
        image: imageBase64,
        timestamp: new Date() 
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const responseText = await sendTutorMessage([...messages, userMsg], currentText, imageBase64);
    
    const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: responseText, timestamp: new Date() };
    setMessages(prev => [...prev, botMsg]);
    setIsTyping(false);
  };

  const captureFrameAndAsk = () => {
      if (videoRef.current) {
          const video = videoRef.current;
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const dataUrl = canvas.toDataURL('image/jpeg', 0.5); 
              const base64 = dataUrl.split(',')[1];
              setActiveTab('companion');
              handleSendMessage(undefined, base64);
          }
      }
  };

  const handleTextSelection = () => {
      if (isResizing.current) return;
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          if (rect.top > 0) {
              setSelectedText(selection.toString().trim());
              setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top - 10 });
              setShowShareTooltip(true);
          }
      } else {
          setShowShareTooltip(false);
      }
  };

  // Modern Tab Button Component
  const TabButton = ({ id, icon: Icon, label, active }: { id: string, icon: any, label: string, active: boolean }) => (
      <button
        onClick={() => setActiveTab(id as ClassroomTab)}
        className={`group relative flex flex-col items-center gap-1.5 p-3 px-4 rounded-2xl transition-all duration-300 ${
            active 
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
            : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
        }`}
      >
          <Icon size={22} strokeWidth={active ? 2.5 : 2} className="transition-transform group-hover:scale-110" />
          <span className="text-[10px] font-bold tracking-wide">{label}</span>
      </button>
  );

  return (
    <div className="fixed inset-0 top-[80px] bg-slate-50 flex flex-col z-40 overflow-hidden" onMouseUp={handleTextSelection}>
      
      {/* Clean Header */}
      <div className="h-16 px-6 bg-white border-b border-slate-100 flex items-center justify-between shrink-0 shadow-sm z-20">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors">
                <ArrowLeft size={18} />
            </button>
            <div>
                <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                    {task.type === 'video' ? <PlayCircle size={16} className="text-blue-500" /> : <Code2 size={16} className="text-green-500" />}
                    {task.title}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">第二章 · 大模型开发实战</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs font-bold text-green-700">AI 实时伴学在线</span>
          </div>
      </div>

      {/* Split Screen Layout */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 relative bg-white" ref={containerRef}>
        
        {/* LEFT: Video & Transcript */}
        <div 
            className="w-full bg-[#0f172a] relative flex flex-col border-r border-slate-200 flex-shrink-0"
            style={{ width: isDesktop ? `${leftWidth}%` : '100%' }}
        >
            {/* Video Player */}
            <div className="flex-1 bg-black relative group flex items-center justify-center overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none z-10"></div>
                 <video 
                    ref={videoRef}
                    className="w-full h-full object-contain cursor-pointer"
                    src="https://openres.xfyun.cn/xfyundoc/2025-09-29/f43e43de-7ea7-4bad-9deb-e53e348d85be/1759120019651/aicoding%201.mp4"
                    controls={true}
                    crossOrigin="anonymous"
                >
                    您的浏览器不支持 Video 标签。
                </video>
                <button 
                    onClick={(e) => { e.stopPropagation(); captureFrameAndAsk(); }}
                    className="absolute bottom-24 right-8 px-4 py-2 bg-white/10 hover:bg-blue-600 backdrop-blur-md border border-white/20 rounded-lg text-white text-xs font-bold flex items-center gap-2 transition-all opacity-0 group-hover:opacity-100 z-20 hover:scale-105"
                >
                    <Camera size={14} /> 截图提问
                </button>
            </div>

            {/* Transcript Area */}
            <div className="h-48 bg-white flex flex-col border-t border-slate-200 shrink-0">
                <div className="px-6 py-3 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <h3 className="text-xs font-bold text-slate-500 flex items-center gap-2 uppercase tracking-wider"><FileText size={14} /> 实时字幕</h3>
                    <div className="text-[10px] text-slate-400 bg-white px-2 py-1 rounded border border-slate-100">支持划词提问</div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {TRANSCRIPT_DATA.map((line, idx) => (
                        <div key={idx} className="flex gap-4 group hover:bg-slate-50 p-2 rounded-lg transition-colors cursor-pointer">
                            <span className="text-xs font-mono text-blue-500 mt-1 select-none opacity-60 group-hover:opacity-100">{line.time}</span>
                            <p className="text-sm text-slate-600 leading-relaxed group-hover:text-slate-900 transition-colors">
                                {line.text}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* RESIZER HANDLE (Desktop Only) */}
        <div 
             className="hidden lg:flex w-1 hover:w-1.5 -ml-0.5 hover:bg-blue-500 cursor-col-resize z-30 absolute top-0 bottom-0 items-center justify-center group transition-all select-none bg-slate-200"
             style={{ left: `${leftWidth}%` }}
             onMouseDown={startResizing}
        >
        </div>

        {/* RIGHT: AI Tools Panel */}
        <div 
            className="w-full bg-white flex flex-col min-h-0 flex-grow"
            style={{ width: isDesktop ? `${100 - leftWidth}%` : '100%' }}
        >
            {/* Styled Tabs Header */}
            <div className="flex items-center justify-around px-6 py-3 border-b border-slate-100 bg-white/80 backdrop-blur sticky top-0 z-10">
                <TabButton id="companion" icon={Bot} label="AI 伴学" active={activeTab === 'companion'} />
                <TabButton id="mindmap" icon={BrainCircuit} label="思维导图" active={activeTab === 'mindmap'} />
                <TabButton id="notes" icon={Notebook} label="智能笔记" active={activeTab === 'notes'} />
                <TabButton id="flashcards" icon={Layers} label="知识闪卡" active={activeTab === 'flashcards'} />
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50/30 relative">
                
                {/* 1. AI Companion (Chat) */}
                {activeTab === 'companion' && (
                    <div className="flex flex-col h-full">
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in slide-in-from-bottom-2 duration-300`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm ${
                                        msg.role === 'user' ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white' : 'bg-white text-blue-600 border border-slate-100'
                                    }`}>
                                        {msg.role === 'user' ? <User size={14} /> : <Bot size={16} />}
                                    </div>
                                    <div className={`max-w-[88%] space-y-2`}>
                                        {msg.image && (
                                            <div className="rounded-xl overflow-hidden border border-slate-200 max-w-[200px] shadow-sm">
                                                <img src={`data:image/jpeg;base64,${msg.image}`} alt="Screenshot" className="w-full h-auto" />
                                            </div>
                                        )}
                                        <div className={`rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm ${
                                            msg.role === 'user' 
                                            ? 'bg-blue-600 text-white rounded-tr-none' 
                                            : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
                                        }`}>
                                            {msg.role === 'model' ? <MarkdownRenderer content={msg.text} /> : msg.text}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex gap-3 px-2">
                                    <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center text-blue-500 shadow-sm">
                                        <Sparkles size={14} />
                                    </div>
                                    <div className="text-slate-400 text-xs flex items-center h-8">AI 正在思考...</div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>
                        <form onSubmit={(e) => handleSendMessage(e)} className="p-4 bg-white border-t border-slate-100 shadow-[0_-5px_20px_rgba(0,0,0,0.02)]">
                            <div className="relative">
                                <input 
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="输入问题或点击左侧截图提问..."
                                    className="w-full pl-5 pr-12 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none text-sm text-slate-800 transition-all placeholder-slate-400"
                                />
                                <button type="submit" disabled={!input.trim()} className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md">
                                    <Send size={16} />
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* 2. Mind Map - Tree Structure */}
                {activeTab === 'mindmap' && (
                    <div className="p-6 h-full flex flex-col animate-in fade-in slide-in-from-right-4">
                        <div className="bg-white border border-slate-100 rounded-2xl p-6 flex-1 shadow-sm relative overflow-hidden flex items-center justify-center">
                            <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-xs font-bold text-slate-500 shadow-sm border border-slate-100 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                实时生成中
                            </div>
                            <svg className="w-full h-full" viewBox="0 0 400 300">
                                <g transform="translate(200, 40)">
                                    {/* Root */}
                                    <circle r="20" fill="#3b82f6" stroke="#2563eb" strokeWidth="2" />
                                    <text textAnchor="middle" dy="5" fill="white" fontSize="10" fontWeight="bold">API 核心</text>

                                    {/* Level 1 Connections */}
                                    <path d="M0 20 L-100 80" stroke="#cbd5e1" strokeWidth="2" fill="none" />
                                    <path d="M0 20 L0 80" stroke="#cbd5e1" strokeWidth="2" fill="none" />
                                    <path d="M0 20 L100 80" stroke="#cbd5e1" strokeWidth="2" fill="none" />

                                    {/* Level 1 Nodes */}
                                    {/* Left */}
                                    <g transform="translate(-100, 80)">
                                        <rect x="-30" y="-12" width="60" height="24" rx="12" fill="white" stroke="#3b82f6" strokeWidth="2" />
                                        <text textAnchor="middle" dy="4" fontSize="10" fill="#1e293b">鉴权机制</text>
                                        <path d="M0 12 L-30 50" stroke="#cbd5e1" strokeWidth="1.5" />
                                        <path d="M0 12 L30 50" stroke="#cbd5e1" strokeWidth="1.5" />
                                        <g transform="translate(-30, 50)">
                                            <rect x="-20" y="-8" width="40" height="16" rx="8" fill="#f1f5f9" />
                                            <text textAnchor="middle" dy="3" fontSize="8" fill="#475569">AppID</text>
                                        </g>
                                        <g transform="translate(30, 50)">
                                            <rect x="-20" y="-8" width="40" height="16" rx="8" fill="#f1f5f9" />
                                            <text textAnchor="middle" dy="3" fontSize="8" fill="#475569">APIKey</text>
                                        </g>
                                    </g>
                                    {/* Center */}
                                    <g transform="translate(0, 80)">
                                        <rect x="-30" y="-12" width="60" height="24" rx="12" fill="white" stroke="#3b82f6" strokeWidth="2" />
                                        <text textAnchor="middle" dy="4" fontSize="10" fill="#1e293b">流式响应</text>
                                        <path d="M0 12 L0 50" stroke="#cbd5e1" strokeWidth="1.5" />
                                        <g transform="translate(0, 50)">
                                            <rect x="-25" y="-8" width="50" height="16" rx="8" fill="#f1f5f9" />
                                            <text textAnchor="middle" dy="3" fontSize="8" fill="#475569">WebSocket</text>
                                        </g>
                                    </g>
                                    {/* Right */}
                                    <g transform="translate(100, 80)">
                                        <rect x="-30" y="-12" width="60" height="24" rx="12" fill="white" stroke="#3b82f6" strokeWidth="2" />
                                        <text textAnchor="middle" dy="4" fontSize="10" fill="#1e293b">SDK集成</text>
                                        <path d="M0 12 L0 50" stroke="#cbd5e1" strokeWidth="1.5" />
                                        <g transform="translate(0, 50)">
                                            <rect x="-20" y="-8" width="40" height="16" rx="8" fill="#f1f5f9" />
                                            <text textAnchor="middle" dy="3" fontSize="8" fill="#475569">Client</text>
                                        </g>
                                    </g>
                                </g>
                            </svg>
                        </div>
                    </div>
                )}

                {/* 3. AI Notes */}
                {activeTab === 'notes' && (
                    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-right-4">
                         <div className="flex items-center justify-between">
                             <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm"><Highlighter className="text-yellow-500" size={16}/> 智能摘要</h3>
                             <button className="text-xs text-blue-600 font-bold hover:bg-blue-50 px-2 py-1 rounded transition-colors">导出 Markdown</button>
                         </div>
                         <div className="space-y-3">
                             {noteData.map((note) => (
                                 <div key={note.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-blue-200 transition-all hover:shadow-md cursor-pointer group">
                                     <div className="flex items-center gap-2 mb-2">
                                         <span className="text-[10px] font-mono bg-slate-50 px-2 py-0.5 rounded text-slate-400 group-hover:text-blue-500 transition-colors">{note.timestamp}</span>
                                         <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                             note.tag === 'KeyPoint' ? 'bg-red-50 text-red-500' : 
                                             note.tag === 'Code' ? 'bg-slate-800 text-white' : 'bg-blue-50 text-blue-500'
                                         }`}>{note.tag}</span>
                                     </div>
                                     <p className="text-sm text-slate-600 leading-relaxed">{note.content}</p>
                                 </div>
                             ))}
                         </div>
                         
                         <div className="pt-6 border-t border-slate-100">
                             <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4 text-sm"><PenTool className="text-blue-500" size={16}/> 我的手记</h3>
                             <textarea 
                                value={userNotes}
                                onChange={(e) => setUserNotes(e.target.value)}
                                className="w-full h-32 bg-white border border-slate-200 rounded-xl p-4 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none resize-none transition-all placeholder-slate-300"
                                placeholder="记录您的想法..."
                             />
                         </div>
                    </div>
                )}

                {/* 4. Flashcards */}
                {activeTab === 'flashcards' && (
                    <div className="p-6 h-full flex flex-col items-center justify-center animate-in fade-in slide-in-from-right-4">
                        <div className="w-full max-w-sm aspect-[3/2] relative perspective-1000 group">
                            {flashcards.map((card, index) => {
                                if (index !== 0) return null; 
                                return (
                                    <div 
                                        key={card.id}
                                        onClick={() => setFlippedCardId(flippedCardId === card.id ? null : card.id)}
                                        className={`w-full h-full relative preserve-3d transition-transform duration-700 cursor-pointer ${
                                            flippedCardId === card.id ? 'rotate-y-180' : ''
                                        }`}
                                        style={{ transformStyle: 'preserve-3d', transform: flippedCardId === card.id ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                                    >
                                        {/* Front */}
                                        <div className="absolute inset-0 backface-hidden bg-white rounded-3xl shadow-xl border border-slate-100 flex flex-col items-center justify-center p-8 text-center hover:shadow-2xl transition-shadow">
                                            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6">
                                                <Layers size={24} />
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-800 leading-snug font-sans mb-4">{card.front}</h3>
                                            <div className="text-xs text-slate-400 font-medium">点击翻转查看答案</div>
                                        </div>

                                        {/* Back */}
                                        <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 text-center text-white" style={{ transform: 'rotateY(180deg)' }}>
                                            <div className="w-12 h-12 bg-white/20 text-white rounded-full flex items-center justify-center mb-6 backdrop-blur-sm">
                                                <CheckCircle size={24} />
                                            </div>
                                            <h3 className="text-lg font-bold leading-relaxed font-sans mb-8 opacity-90">{card.back}</h3>
                                            <div className="flex gap-3 w-full px-4">
                                                <button className="flex-1 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold backdrop-blur-sm transition-colors">熟悉</button>
                                                <button className="flex-1 py-2 bg-white text-blue-600 rounded-lg text-xs font-bold shadow-lg hover:bg-blue-50 transition-colors">需复习</button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-10 flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                            <span>Progress</span>
                            <div className="w-32 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div className="w-1/3 h-full bg-blue-500 rounded-full"></div>
                            </div>
                            <span>1 / {flashcards.length}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>

      </div>

      {/* Share Tooltip */}
      {showShareTooltip && (
          <div 
            className="fixed z-50 transform -translate-x-1/2 -translate-y-full"
            style={{ left: tooltipPos.x, top: tooltipPos.y }}
          >
              <button 
                onClick={() => { setShowShareCardModal(true); setShowShareTooltip(false); }}
                className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl flex items-center gap-2 hover:scale-105 transition-transform animate-in zoom-in duration-200"
              >
                  <Share2 size={14} /> 生成金句卡片
              </button>
          </div>
      )}

      {/* Share Card Modal */}
      {showShareCardModal && (
          <div className="fixed inset-0 z-[60] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl overflow-hidden max-w-sm w-full shadow-2xl relative">
                   <button onClick={() => setShowShareCardModal(false)} className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors">
                       <X size={20} />
                   </button>
                   
                   {/* The Card */}
                   <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                       <Sparkles className="text-yellow-400 mb-6" size={32} />
                       
                       <p className="text-xl font-serif font-medium leading-relaxed mb-8 opacity-95">
                           “{selectedText}”
                       </p>
                       
                       <div className="flex items-end justify-between border-t border-white/20 pt-6">
                           <div>
                               <div className="font-bold text-lg">{task.title}</div>
                               <div className="text-xs text-blue-200 mt-1">讯飞AI大学堂 · AI伴学</div>
                           </div>
                           <div className="bg-white p-1 rounded-lg">
                               <QrCode size={40} className="text-slate-900" />
                           </div>
                       </div>
                   </div>

                   <div className="p-4 bg-slate-50 flex gap-3">
                       <button className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 flex items-center justify-center gap-2">
                           <Download size={16} /> 保存图片
                       </button>
                       <button className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-100 flex items-center justify-center gap-2">
                           <Copy size={16} /> 复制链接
                       </button>
                   </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Classroom;