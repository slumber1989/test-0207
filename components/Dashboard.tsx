import React, { useState } from 'react';
import { Course, AppView, UserProfile } from '../types';
import { 
    Sparkles, 
    ArrowRight, 
    Layers,
    TrendingUp,
    Clock,
    Star,
    CheckCircle2,
    Briefcase,
    GraduationCap,
    Cpu,
    X,
    MessageSquare,
    Fingerprint,
    Send
} from 'lucide-react';
import { generateLearningPath } from '../services/geminiService';

interface DashboardProps {
  setCurrentView: (view: AppView) => void;
  onCourseGenerated: (course: Course) => void;
}

// Mock Data for Recommendations
const RECOMMENDATIONS = [
    {
        id: 1,
        title: "星火大模型全栈开发实战",
        category: "大模型开发",
        duration: "12 小时",
        level: "进阶",
        rating: 4.9,
        image: "https://picsum.photos/seed/ai-dev/400/220",
        tags: ["Python", "LangChain"]
    },
    {
        id: 2,
        title: "企业级 RAG 知识库搭建",
        category: "大模型开发",
        duration: "8 小时",
        level: "专家",
        rating: 5.0,
        image: "https://picsum.photos/seed/rag/400/220",
        tags: ["RAG", "向量数据库"]
    },
    {
        id: 3,
        title: "Stable Diffusion 商业设计流",
        category: "AI 绘画",
        duration: "6 小时",
        level: "入门",
        rating: 4.8,
        image: "https://picsum.photos/seed/sd/400/220",
        tags: ["SD", "ControlNet"]
    }
];

const TAGS = ["热门推荐", "大模型开发", "AI 绘画", "职场提效", "面试冲刺"];

const Dashboard: React.FC<DashboardProps> = ({ setCurrentView, onCourseGenerated }) => {
  const [activeTag, setActiveTag] = useState("热门推荐");
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'model', text: string}[]>([
      { role: 'model', text: `### 👋 欢迎来到讯飞 AI 大学堂

我是您的**智能学习规划师**。

请告诉我想学习的场景，我将为您定制专属路径。例如：
- 🎯 **求职**：我想成为 AI 产品经理
- 🏢 **落地**：我想在企业内部部署 RAG 知识库
- 🎨 **技能**：我想学习数字人直播带货` }
  ]);

  // Modal State
  const [profile, setProfile] = useState<UserProfile>({
      role: '',
      level: '',
      goal: '',
      timeCommitment: '5',
      skills: []
  });

  const handleSendMessage = async () => {
      if (!chatInput.trim()) return;
      
      setChatHistory(prev => [...prev, { role: 'user', text: chatInput }]);
      const tempInput = chatInput;
      setChatInput('');
      setLoading(true);

      // Simulate AI response then redirect
      setTimeout(() => {
          setLoading(false);
          setCurrentView(AppView.KNOWLEDGE_GRAPH);
      }, 1500);
  };

  const handleNextStep = async () => {
      if (modalStep < 3) {
          setModalStep(modalStep + 1);
      } else {
          setLoading(true);
          try {
              const path = await generateLearningPath(profile);
              onCourseGenerated(path);
              setShowPlanModal(false);
          } catch (e) {
              console.error(e);
          } finally {
              setLoading(false);
          }
      }
  };

  const filteredRecommendations = activeTag === "热门推荐" 
      ? RECOMMENDATIONS 
      : RECOMMENDATIONS.filter(item => item.category === activeTag);

  // Text formatter for chat
  const formatMessage = (text: string) => {
    return text.split('\n').map((line, i) => {
        if (line.trim().startsWith('### ')) return <h3 key={i} className="text-lg font-bold text-slate-800 mt-4 mb-2">{line.replace('### ', '')}</h3>;
        if (line.trim().startsWith('- ')) return <div key={i} className="flex gap-2 ml-1 my-1 text-base"><span className="text-blue-500 font-bold">•</span><span dangerouslySetInnerHTML={{__html: parseBold(line.replace('- ', ''))}} /></div>;
        if (line.trim() === '') return <div key={i} className="h-2"></div>;
        return <div key={i} className="my-1 text-base text-slate-700" dangerouslySetInnerHTML={{__html: parseBold(line)}} />;
    });
  };
  const parseBold = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 font-bold">$1</strong>');

  return (
    <div className="min-h-screen pt-12 pb-24 px-6 relative flex flex-col items-center">
      
      {/* --- Section 1: Hero Split Layout --- */}
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[600px] mb-16">
         
         {/* Left: Value Prop & Modal CTA */}
         <div className="lg:col-span-5 space-y-8 animate-in slide-in-from-left-8 duration-700 text-center lg:text-left">
             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-bold tracking-wide shadow-sm mx-auto lg:mx-0">
                <Sparkles size={14} />
                <span>AI 驱动的终身学习引擎</span>
             </div>
             
             <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                 让 AI 为你定制 <br/>
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">独一无二的学习路径</span>
             </h1>
             
             <p className="text-slate-500 text-xl leading-relaxed font-light">
                 讯飞星火大模型实时分析您的技能缺口，动态调整课程内容。<br className="hidden lg:block"/>
                 <span className="text-slate-700 font-medium">不仅是学习，更是您的私人 AI 导师。</span>
             </p>

             <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button 
                    onClick={() => setShowPlanModal(true)}
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-lg font-bold shadow-xl shadow-blue-500/30 hover:scale-105 transition-all flex items-center justify-center gap-3"
                >
                    <Sparkles size={20} />
                    快速定制学习计划
                </button>
                <button 
                    onClick={() => setCurrentView(AppView.KNOWLEDGE_GRAPH)}
                    className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-full text-lg font-bold shadow-sm transition-all flex items-center justify-center gap-3"
                >
                    浏览全站课程
                </button>
             </div>
             
             <div className="flex items-center justify-center lg:justify-start gap-8 pt-4">
                 <div>
                     <div className="text-2xl font-bold text-slate-900">128亿+</div>
                     <div className="text-xs text-slate-500 uppercase">知识参数</div>
                 </div>
                 <div className="w-px h-10 bg-slate-200"></div>
                 <div>
                     <div className="text-2xl font-bold text-slate-900">100%</div>
                     <div className="text-xs text-slate-500 uppercase">私人定制</div>
                 </div>
             </div>
         </div>

         {/* Right: Chat Interface (Restored) */}
         <div className="lg:col-span-7 w-full">
             <div className="relative w-full max-w-xl mx-auto lg:mr-0">
                 {/* Glow */}
                 <div className="absolute inset-0 bg-blue-200/50 blur-[80px] rounded-full -z-10 opacity-50"></div>
                 
                 <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-[32px] shadow-2xl shadow-blue-900/5 overflow-hidden ring-1 ring-white/60 flex flex-col h-[600px]">
                     {/* Chat Header */}
                     <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between bg-white/50">
                         <div className="flex items-center gap-3 text-slate-800 font-bold text-base">
                             <Sparkles size={20} className="text-blue-500" />
                             智能学习规划
                         </div>
                         <div className="flex gap-1.5">
                             <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                             <div className="w-3 h-3 rounded-full bg-yellow-400/80"></div>
                             <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
                         </div>
                     </div>

                     {/* Chat Messages */}
                     <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-slate-50/50">
                         {chatHistory.map((msg, i) => (
                             <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                                     msg.role === 'user' ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-white text-blue-600 border border-blue-100'
                                 }`}>
                                     {msg.role === 'user' ? <Fingerprint size={20} /> : <Sparkles size={20} />}
                                 </div>
                                 <div className={`p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-sm ${
                                     msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-blue-50'
                                 }`}>
                                     {msg.role === 'user' ? msg.text : formatMessage(msg.text)}
                                 </div>
                             </div>
                         ))}
                         {loading && (
                             <div className="flex gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-white border border-blue-100 flex items-center justify-center text-blue-500">
                                     <Sparkles size={20} />
                                 </div>
                                 <div className="flex items-center gap-2 h-10">
                                     <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                                     <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                                     <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                                 </div>
                             </div>
                         )}
                     </div>

                     {/* Chat Input */}
                     <div className="p-4 bg-white border-t border-slate-100">
                         <div className="relative">
                             <input 
                                 value={chatInput}
                                 onChange={(e) => setChatInput(e.target.value)}
                                 onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                 placeholder="输入学习目标，如：我想转型做大模型算法工程师..."
                                 className="w-full bg-slate-50 text-slate-800 text-base rounded-2xl pl-5 pr-14 py-4 border border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all placeholder-slate-400"
                             />
                             <button 
                                onClick={handleSendMessage}
                                disabled={!chatInput.trim() || loading}
                                className="absolute right-2 top-2 bottom-2 aspect-square bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md"
                             >
                                 <ArrowRight size={20} />
                             </button>
                         </div>
                     </div>
                 </div>
             </div>
         </div>
      </div>

      {/* --- Section 2: Recommended Learning --- */}
      <div className="w-full max-w-7xl mx-auto space-y-10 animate-in slide-in-from-bottom-20 duration-1000">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                  <Layers className="text-blue-600" size={28} /> 推荐学习路径
              </h2>
              
              <div className="flex flex-wrap gap-2 p-1.5 bg-white rounded-full border border-slate-200 shadow-sm">
                  {TAGS.map(tag => (
                      <button
                        key={tag}
                        onClick={() => setActiveTag(tag)}
                        className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                            activeTag === tag 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : 'text-slate-500 hover:text-blue-600 hover:bg-slate-50'
                        }`}
                      >
                          {tag}
                      </button>
                  ))}
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredRecommendations.map((item, idx) => (
                  <div 
                      key={item.id}
                      onClick={() => setCurrentView(AppView.KNOWLEDGE_GRAPH)}
                      className="group bg-white border border-slate-100 rounded-3xl overflow-hidden hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer relative"
                      style={{ animationDelay: `${idx * 100}ms` }}
                  >
                      <div className="h-48 overflow-hidden relative">
                          <img 
                              src={item.image} 
                              alt={item.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-60"></div>
                          <div className="absolute bottom-4 left-4 flex gap-2">
                              {item.tags.map(t => (
                                  <span key={t} className="px-2.5 py-1 rounded bg-white/20 backdrop-blur-md border border-white/20 text-xs text-white font-medium">
                                      {t}
                                  </span>
                              ))}
                          </div>
                          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                              <Star size={12} fill="currentColor" /> {item.rating}
                          </div>
                      </div>

                      <div className="p-6">
                          <h3 className="text-xl font-bold text-slate-800 mb-3 line-clamp-1 group-hover:text-blue-600 transition-colors">
                              {item.title}
                          </h3>
                          <div className="flex items-center gap-5 text-sm text-slate-500 mb-5">
                              <span className="flex items-center gap-1.5"><Clock size={14} /> {item.duration}</span>
                              <span className="flex items-center gap-1.5"><TrendingUp size={14} /> {item.level}</span>
                          </div>
                          
                          <div className="flex items-center justify-between mt-2 pt-5 border-t border-slate-50">
                               <div className="flex items-center gap-2 text-sm text-slate-500">
                                   <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">L</div>
                                   AI 讲师团队
                               </div>
                               <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                   <ArrowRight size={18} />
                               </button>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      </div>

      {/* --- Custom Plan Modal --- */}
      {showPlanModal && (
          <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                  
                  {/* Progress Bar */}
                  <div className="h-2 bg-slate-100 w-full relative">
                      <div 
                        className="h-full bg-blue-600 transition-all duration-500 ease-out" 
                        style={{ width: `${(modalStep / 3) * 100}%` }}
                      ></div>
                  </div>
                  
                  <div className="p-8 flex-1 relative min-h-[400px]">
                       <button 
                            onClick={() => setShowPlanModal(false)}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
                       >
                           <X size={24} />
                       </button>

                       {/* Step 1: Role */}
                       {modalStep === 1 && (
                           <div className="space-y-6 animate-in slide-in-from-right-4">
                               <div className="flex items-center gap-3 mb-2">
                                   <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                       <Briefcase size={20} />
                                   </div>
                                   <h2 className="text-2xl font-bold text-slate-800">您的当前身份是？</h2>
                               </div>
                               <p className="text-slate-500">我们将为您匹配最适合的职业发展路径。</p>
                               
                               <div className="grid grid-cols-2 gap-4">
                                   {['在校学生', '产品经理', '前端开发', '后端开发', '设计师', '运营/市场', '创业者', '其他'].map(role => (
                                       <button
                                            key={role}
                                            onClick={() => setProfile({...profile, role})}
                                            className={`p-4 rounded-xl border text-left font-medium transition-all ${
                                                profile.role === role 
                                                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' 
                                                : 'border-slate-200 hover:border-blue-300 text-slate-600'
                                            }`}
                                       >
                                           {role}
                                       </button>
                                   ))}
                               </div>
                           </div>
                       )}

                       {/* Step 2: Level & Goal */}
                       {modalStep === 2 && (
                           <div className="space-y-8 animate-in slide-in-from-right-4">
                               <div className="flex items-center gap-3 mb-2">
                                   <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                       <GraduationCap size={20} />
                                   </div>
                                   <h2 className="text-2xl font-bold text-slate-800">当前基础与目标？</h2>
                               </div>
                               
                               <div className="space-y-4">
                                   <label className="text-sm font-bold text-slate-700">当前 AI 基础</label>
                                   <div className="flex gap-4">
                                       {['零基础入门', '有一定了解', '行业从业者'].map(l => (
                                           <button
                                                key={l}
                                                onClick={() => setProfile({...profile, level: l})}
                                                className={`flex-1 py-3 rounded-xl border font-medium transition-all ${
                                                    profile.level === l 
                                                    ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-sm' 
                                                    : 'border-slate-200 hover:border-purple-300 text-slate-600'
                                                }`}
                                           >
                                               {l}
                                           </button>
                                       ))}
                                   </div>
                               </div>

                               <div className="space-y-4">
                                   <label className="text-sm font-bold text-slate-700">核心学习目标</label>
                                   <div className="grid grid-cols-2 gap-4">
                                       {['就业/转行', '职场技能提升', '考取专业证书', '商业项目落地'].map(g => (
                                           <button
                                                key={g}
                                                onClick={() => setProfile({...profile, goal: g})}
                                                className={`py-3 px-4 rounded-xl border text-left font-medium transition-all ${
                                                    profile.goal === g 
                                                    ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-sm' 
                                                    : 'border-slate-200 hover:border-purple-300 text-slate-600'
                                                }`}
                                           >
                                               {g}
                                           </button>
                                       ))}
                                   </div>
                               </div>
                           </div>
                       )}

                       {/* Step 3: Skills */}
                       {modalStep === 3 && (
                           <div className="space-y-6 animate-in slide-in-from-right-4">
                               <div className="flex items-center gap-3 mb-2">
                                   <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                       <Cpu size={20} />
                                   </div>
                                   <h2 className="text-2xl font-bold text-slate-800">感兴趣的技术领域？</h2>
                               </div>
                               <p className="text-slate-500">可多选，AI 将根据选择生成技能树。</p>

                               <div className="flex flex-wrap gap-3">
                                   {['大模型应用开发', 'RAG 知识库', 'AI 智能体 (Agent)', '提示词工程', 'AI 绘画 (SD/MJ)', '数据分析', 'AI 办公自动化', '语音交互技术', 'Python 编程', '机器学习'].map(skill => (
                                       <button
                                            key={skill}
                                            onClick={() => {
                                                const newSkills = profile.skills.includes(skill)
                                                    ? profile.skills.filter(s => s !== skill)
                                                    : [...profile.skills, skill];
                                                setProfile({...profile, skills: newSkills});
                                            }}
                                            className={`px-5 py-2.5 rounded-full border font-medium transition-all flex items-center gap-2 ${
                                                profile.skills.includes(skill)
                                                ? 'border-green-500 bg-green-50 text-green-700 shadow-sm' 
                                                : 'border-slate-200 hover:border-green-300 text-slate-600 bg-slate-50'
                                            }`}
                                       >
                                           {skill}
                                           {profile.skills.includes(skill) && <CheckCircle2 size={16} />}
                                       </button>
                                   ))}
                               </div>
                           </div>
                       )}
                  </div>

                  {/* Footer */}
                  <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                      {modalStep > 1 ? (
                          <button 
                            onClick={() => setModalStep(modalStep - 1)}
                            className="text-slate-500 font-bold hover:text-slate-800 px-4"
                          >
                              上一步
                          </button>
                      ) : <div></div>}
                      
                      <button 
                        onClick={handleNextStep}
                        disabled={loading || (modalStep === 1 && !profile.role) || (modalStep === 2 && !profile.level)}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          {loading ? (
                              <>正在生成路径...</>
                          ) : (
                              <>{modalStep === 3 ? '生成专属学习路径' : '下一步'} <ArrowRight size={18} /></>
                          )}
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default Dashboard;