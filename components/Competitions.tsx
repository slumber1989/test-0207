import React from 'react';
import { Trophy, Calendar, Users, ArrowRight, Timer } from 'lucide-react';

const Competitions: React.FC = () => {
  const competitions = [
    {
        id: 1,
        title: "讯飞星火杯 AI 开发者大赛",
        status: "进行中",
        deadline: "2024-12-30",
        prize: "¥ 1,000,000",
        participants: 12450,
        tags: ["大模型应用", "创意开发"],
        image: "https://picsum.photos/seed/comp1/600/300"
    },
    {
        id: 2,
        title: "AI for Science 科学计算挑战赛",
        status: "报名中",
        deadline: "2024-11-15",
        prize: "¥ 500,000",
        participants: 3200,
        tags: ["算法", "生物医药"],
        image: "https://picsum.photos/seed/comp2/600/300"
    },
    {
        id: 3,
        title: "智能语音交互创新设计赛",
        status: "即将开始",
        deadline: "2025-01-10",
        prize: "¥ 200,000",
        participants: 0,
        tags: ["UI/UX", "语音技术"],
        image: "https://picsum.photos/seed/comp3/600/300"
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
       <div className="flex items-end justify-between">
           <div>
               <h2 className="text-3xl font-bold text-slate-900">全球 AI 开发者竞技场</h2>
               <p className="text-slate-500 mt-2">以赛代练，赢取百万奖金与名企 Offer</p>
           </div>
           <button className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors">
               我的赛事中心
           </button>
       </div>

       <div className="grid grid-cols-1 gap-6">
           {competitions.map((comp) => (
               <div key={comp.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 hover:shadow-lg transition-shadow group">
                   <div className="w-full md:w-1/3 h-48 rounded-xl overflow-hidden relative">
                       <img src={comp.image} alt={comp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                       <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white ${
                           comp.status === '进行中' ? 'bg-green-500' : comp.status === '报名中' ? 'bg-blue-500' : 'bg-orange-500'
                       }`}>
                           {comp.status}
                       </div>
                   </div>
                   
                   <div className="flex-1 flex flex-col justify-between py-2">
                       <div>
                           <div className="flex flex-wrap gap-2 mb-3">
                               {comp.tags.map(tag => (
                                   <span key={tag} className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                       {tag}
                                   </span>
                               ))}
                           </div>
                           <h3 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                               {comp.title}
                           </h3>
                           <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 mt-4">
                               <div className="flex items-center gap-2">
                                   <Trophy size={16} className="text-yellow-500" />
                                   <span className="font-bold text-slate-700">总奖池: {comp.prize}</span>
                               </div>
                               <div className="flex items-center gap-2">
                                   <Calendar size={16} />
                                   <span>截止: {comp.deadline}</span>
                               </div>
                               <div className="flex items-center gap-2">
                                   <Users size={16} />
                                   <span>{comp.participants} 人已报名</span>
                               </div>
                           </div>
                       </div>

                       <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-50">
                           <div className="flex items-center gap-2 text-orange-500 font-medium text-sm">
                               <Timer size={16} />
                               <span>距离报名截止仅剩 12 天</span>
                           </div>
                           <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-500 transition-colors flex items-center gap-2">
                               立即报名 <ArrowRight size={16} />
                           </button>
                       </div>
                   </div>
               </div>
           ))}
       </div>
    </div>
  );
};

export default Competitions;