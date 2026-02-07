import React from 'react';
import { Award, CheckCircle, Lock, MonitorPlay, FileCheck, ScrollText, ArrowRight } from 'lucide-react';

const Certificates: React.FC = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-3xl p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4">讯飞 AI 技能认证中心</h2>
            <p className="text-blue-100 max-w-2xl text-lg leading-relaxed">
                权威认证，职场加分。通过“学、练、考”一体化流程，获得由讯飞 AI 大学堂颁发的区块链数字证书。
            </p>
        </div>
        <Award className="absolute right-10 top-1/2 transform -translate-y-1/2 text-white/10 w-48 h-48 rotate-12" />
      </div>

      {/* Process Flow */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         {[
             { icon: MonitorPlay, title: "1. 视频课程学习", desc: "系统化掌握理论知识" },
             { icon: MonitorPlay, title: "2. 实战项目考核", desc: "在线编程环境，AI 实时评分" },
             { icon: FileCheck, title: "3. 在线综合考试", desc: "严谨的理论知识测试平台" },
             { icon: ScrollText, title: "4. 获得权威证书", desc: "支持 LinkedIn 分享与企业查询" }
         ].map((step, idx) => (
             <div key={idx} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center text-center relative">
                 {idx < 3 && <div className="hidden md:block absolute top-1/2 -right-6 w-8 h-0.5 bg-slate-200 z-10"></div>}
                 <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                     <step.icon size={24} />
                 </div>
                 <h4 className="font-bold text-slate-800 mb-1">{step.title}</h4>
                 <p className="text-xs text-slate-500">{step.desc}</p>
             </div>
         ))}
      </div>

      {/* Certificate Lists */}
      <div className="space-y-8">
          {/* Free Tier */}
          <div>
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <CheckCircle className="text-green-500" /> 免费认证项目
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                      { title: "Prompt Engineering 初级认证", level: "入门", hours: "4小时", image: "https://picsum.photos/seed/cert1/400/200" },
                      { title: "讯飞星火大模型应用基础", level: "入门", hours: "6小时", image: "https://picsum.photos/seed/cert2/400/200" }
                  ].map((cert, idx) => (
                      <div key={idx} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer">
                          <div className="h-32 overflow-hidden relative">
                              <img src={cert.image} alt={cert.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                              <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded font-medium">免费</div>
                          </div>
                          <div className="p-5">
                              <h4 className="font-bold text-slate-800 mb-2">{cert.title}</h4>
                              <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
                                  <span className="bg-slate-100 px-2 py-1 rounded">{cert.level}</span>
                                  <span>{cert.hours} 学习时长</span>
                              </div>
                              <button className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg font-bold text-sm hover:bg-blue-100 transition-colors">
                                  开始学习
                              </button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>

          {/* Paid / Future Tier */}
          <div>
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Lock className="text-orange-500" /> 专业版认证 (2025 开启)
                  <span className="text-xs font-normal text-slate-500 ml-2 bg-slate-100 px-2 py-0.5 rounded-full">企业认可度高</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                      { title: "AI 系统架构师 (L3)", desc: "包含私有化部署实战考核", image: "https://picsum.photos/seed/cert3/400/200" },
                      { title: "企业级 RAG 开发专家", desc: "需通过 3 个实战项目评审", image: "https://picsum.photos/seed/cert4/400/200" },
                      { title: "AI 产品经理高级认证", desc: "涵盖商业化落地全流程", image: "https://picsum.photos/seed/cert5/400/200" }
                  ].map((cert, idx) => (
                      <div key={idx} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden opacity-80 hover:opacity-100 transition-opacity group relative">
                          <div className="h-32 overflow-hidden bg-slate-200">
                              <img src={cert.image} alt={cert.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                          </div>
                          <div className="p-5">
                              <h4 className="font-bold text-slate-800 mb-2">{cert.title}</h4>
                              <p className="text-sm text-slate-500 mb-4">{cert.desc}</p>
                              <button className="w-full py-2 border border-slate-200 text-slate-400 rounded-lg font-bold text-sm cursor-not-allowed flex items-center justify-center gap-2">
                                  <Lock size={14} /> 敬请期待
                              </button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>

    </div>
  );
};

export default Certificates;