
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Loader2, Sparkles, Target, Zap, Layout, ChevronRight, Check } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
  loading: boolean;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, loading }) => {
  const [profile, setProfile] = useState<UserProfile>({
    role: '产品经理',
    level: '入门',
    goal: '就业/转行',
    timeCommitment: '5',
    skills: []
  });

  // Added 'AI Coding' to the list
  const skillOptions = ['Python', 'Prompt Engineering', 'RAG 开发', 'AI Agent', 'AI 绘画', '数据分析', '大模型微调', 'AI Coding'];

  const handleSkillToggle = (skill: string) => {
    setProfile(prev => ({
        ...prev,
        skills: prev.skills.includes(skill) 
            ? prev.skills.filter(s => s !== skill)
            : [...prev.skills, skill]
    }));
  };

  return (
    <div className="animate-in fade-in zoom-in-95 duration-700">
      
      <div className="text-center mb-10">
         <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            构建您的 <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-yellow-400">AI 知识图谱</span>
         </h2>
         <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            基于<span className="text-blue-400 font-bold mx-1">讯飞星火大模型</span>全维度解析职业基因，一键生成匹配的技能树与实战演练路径。
         </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Configuration Panel */}
          <div className="lg:col-span-7 space-y-6">
              <div className="bg-[#0f172a]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                  
                  {/* Row 1: Role & Level */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="space-y-3">
                          <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">当前身份</label>
                          <select 
                            value={profile.role}
                            onChange={e => setProfile({...profile, role: e.target.value})}
                            className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                          >
                              <option>产品经理</option>
                              <option>前端开发</option>
                              <option>后端开发</option>
                              <option>设计师</option>
                              <option>运营/市场</option>
                              <option>学生</option>
                              <option>创业者</option>
                          </select>
                      </div>
                      <div className="space-y-3">
                          <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">AI 基础</label>
                          <div className="flex p-1 bg-[#1e293b] rounded-xl border border-white/10">
                              {['入门', '进阶', '专家'].map(l => (
                                  <button
                                    key={l}
                                    onClick={() => setProfile({...profile, level: l})}
                                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                                        profile.level === l 
                                        ? 'bg-blue-600 text-white shadow-lg' 
                                        : 'text-slate-500 hover:text-white'
                                    }`}
                                  >
                                      {l}
                                  </button>
                              ))}
                          </div>
                      </div>
                  </div>

                  {/* Row 2: Goal & Time */}
                  <div className="mb-8 space-y-6">
                      <div className="space-y-3">
                          <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">核心目标</label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {['就业/转行', '职场提效', '考取证书', '商业落地'].map(g => (
                                  <button
                                    key={g}
                                    onClick={() => setProfile({...profile, goal: g})}
                                    className={`py-3 px-2 rounded-xl border text-sm font-bold transition-all ${
                                        profile.goal === g 
                                        ? 'bg-blue-500/10 border-blue-500 text-blue-400' 
                                        : 'bg-[#1e293b] border-transparent text-slate-400 hover:border-white/20'
                                    }`}
                                  >
                                      {g}
                                  </button>
                              ))}
                          </div>
                      </div>
                      
                      <div className="space-y-3">
                         <div className="flex justify-between">
                            <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">每周投入时间</label>
                            <span className="text-yellow-400 font-bold">{profile.timeCommitment} 小时</span>
                         </div>
                         <input 
                            type="range" min="1" max="20" step="1"
                            value={profile.timeCommitment}
                            onChange={e => setProfile({...profile, timeCommitment: e.target.value})}
                            className="w-full h-2 bg-[#1e293b] rounded-lg appearance-none cursor-pointer accent-yellow-400"
                         />
                      </div>
                  </div>

                  {/* Row 3: Skills */}
                  <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">技术偏好 (可多选)</label>
                      <div className="flex flex-wrap gap-3">
                          {skillOptions.map(skill => (
                              <button
                                key={skill}
                                onClick={() => handleSkillToggle(skill)}
                                className={`px-4 py-2 rounded-full border text-sm font-medium transition-all flex items-center gap-2 ${
                                    profile.skills.includes(skill)
                                    ? 'bg-yellow-400/10 border-yellow-400 text-yellow-400'
                                    : 'bg-[#1e293b] border-transparent text-slate-400 hover:bg-white/5'
                                }`}
                              >
                                  {skill}
                                  {profile.skills.includes(skill) && <Check size={14} />}
                              </button>
                          ))}
                      </div>
                  </div>

                  <div className="mt-10 pt-8 border-t border-white/10">
                      <button
                        onClick={() => onComplete(profile)}
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-yellow-500 hover:from-blue-500 hover:to-yellow-400 text-black font-bold text-lg rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all transform hover:scale-[1.02] flex items-center justify-center gap-3"
                      >
                          {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} fill="black" />}
                          {loading ? '星火大模型正在运算...' : '立即生成专属规划'}
                      </button>
                  </div>

              </div>
          </div>

          {/* Right: Preview / Ads */}
          <div className="lg:col-span-5 space-y-6">
              
              {/* Dynamic Preview Card */}
              <div className="bg-[#1e293b]/50 border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-20 bg-blue-600/20 blur-[60px] rounded-full -translate-y-10 translate-x-10"></div>
                  
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Zap className="text-yellow-400" size={20} /> 猜你需要
                  </h3>
                  
                  {/* Mock Bootcamp Recommendation based on selection */}
                  <div className="bg-black/40 rounded-2xl p-4 border border-white/5 hover:border-yellow-400/50 transition-colors cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                          <span className="bg-yellow-400 text-black text-[10px] font-bold px-2 py-0.5 rounded">训练营</span>
                          <span className="text-slate-400 text-xs line-through">¥2999</span>
                      </div>
                      <h4 className="font-bold text-lg text-white mb-1">
                          {profile.role === '产品经理' ? 'AI 产品经理实战训练营' : 'LLM 全栈开发训练营'}
                      </h4>
                      <p className="text-sm text-slate-400 mb-3">
                          {profile.role === '产品经理' ? '从 0 到 1 打造你的第一个 AI Agent 产品' : '基于 LangChain + RAG 搭建企业级应用'}
                      </p>
                      <div className="flex items-center justify-between">
                          <span className="text-yellow-400 font-bold text-lg">¥0 <span className="text-xs font-normal text-slate-400">限时试听</span></span>
                          <ChevronRight className="text-slate-500" size={16} />
                      </div>
                  </div>

                  <div className="mt-4 p-4 rounded-2xl border border-dashed border-white/10 text-center">
                      <p className="text-sm text-slate-500">
                          AI 智能引擎将根据您的 <span className="text-blue-400">{profile.role}</span> 背景与 <span className="text-yellow-400">{profile.timeCommitment}h</span> 投入时间，
                          为您裁剪出最适合的路径。
                      </p>
                  </div>
              </div>

              {/* Stats Decoration */}
              <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#1e293b]/50 border border-white/10 rounded-2xl p-5 text-center">
                      <div className="text-2xl font-bold text-white mb-1">12W+</div>
                      <div className="text-xs text-slate-500">累计生成路径</div>
                  </div>
                  <div className="bg-[#1e293b]/50 border border-white/10 rounded-2xl p-5 text-center">
                      <div className="text-2xl font-bold text-white mb-1">4.9</div>
                      <div className="text-xs text-slate-500">用户评分</div>
                  </div>
              </div>

          </div>
      </div>
    </div>
  );
};

export default Onboarding;
