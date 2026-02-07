
import React, { useEffect, useState } from 'react';
import { generateAnalytics } from '../services/geminiService';
import { LearningPath, AnalyticsData } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';
import { Loader2, ArrowLeft, Target, TrendingUp, Award, Info } from 'lucide-react';

interface AnalyticsProps {
  path: LearningPath;
  onBack: () => void;
}

const Analytics: React.FC<AnalyticsProps> = ({ path, onBack }) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
        setLoading(true);
        // In a real app, we would wait for API. Here we simulate delay
        setTimeout(async () => {
            const res = await generateAnalytics(path);
            setData(res);
            setLoading(false);
        }, 1500);
    };
    loadData();
  }, [path]);

  if (loading) {
      return (
          <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="animate-spin mb-4" size={32} />
              <p>AI 正在分析课程结构与岗位匹配度...</p>
          </div>
      );
  }

  if (!data) return null;

  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
            <ArrowLeft size={16} /> 返回路径
        </button>
        
        {/* Warning Banner */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 mb-8 flex items-center gap-3 text-sm text-blue-200">
            <Info size={18} className="flex-shrink-0" />
            <span>注：学习进度超过 50% 后可完整显示所有维度数据，当前仅为 AI 预估结果。</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-[#1e293b]/50 border border-white/10 rounded-2xl p-6 flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400"><Target size={24} /></div>
                <div>
                    <h4 className="text-slate-400 text-sm">岗位匹配度</h4>
                    <div className="text-2xl font-bold text-white">{data.matchScore}%</div>
                </div>
            </div>
            <div className="bg-[#1e293b]/50 border border-white/10 rounded-2xl p-6 flex items-center gap-4">
                <div className="p-3 bg-green-500/20 rounded-xl text-green-400"><Award size={24} /></div>
                <div>
                    <h4 className="text-slate-400 text-sm">预计提升技能</h4>
                    <div className="text-2xl font-bold text-white">5 项</div>
                </div>
            </div>
            <div className="bg-[#1e293b]/50 border border-white/10 rounded-2xl p-6 flex items-center gap-4">
                <div className="p-3 bg-yellow-500/20 rounded-xl text-yellow-400"><TrendingUp size={24} /></div>
                <div>
                    <h4 className="text-slate-400 text-sm">实战项目占比</h4>
                    <div className="text-2xl font-bold text-white">40%</div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Radar Chart */}
            <div className="bg-[#1e293b]/30 border border-white/10 rounded-3xl p-8">
                <h3 className="text-xl font-bold text-white mb-6">能力模型预测</h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.radarData}>
                            <PolarGrid stroke="#334155" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar
                                name="能力值"
                                dataKey="A"
                                stroke="#facc15"
                                strokeWidth={2}
                                fill="#facc15"
                                fillOpacity={0.3}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 text-center text-sm text-slate-500">
                    完成课程后，您的创新思维与理论基础将显著提升
                </div>
            </div>

            {/* Analysis Text */}
            <div className="space-y-6">
                <div className="bg-[#1e293b]/30 border border-white/10 rounded-3xl p-8 h-full">
                    <h3 className="text-xl font-bold text-white mb-6">AI 深度点评</h3>
                    
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-bold text-blue-400 uppercase mb-2">您的优势</h4>
                            <div className="flex flex-wrap gap-2">
                                {data.strengths.map((s, i) => (
                                    <span key={i} className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-sm text-blue-200">{s}</span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-bold text-orange-400 uppercase mb-2">待加强领域</h4>
                            <div className="flex flex-wrap gap-2">
                                {data.weaknesses.map((s, i) => (
                                    <span key={i} className="px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full text-sm text-orange-200">{s}</span>
                                ))}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/10">
                            <h4 className="text-sm font-bold text-slate-300 mb-2">下一步建议</h4>
                            <ul className="space-y-2">
                                {data.nextSteps.map((step, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
                                        {step}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Analytics;
