import React, { useState } from 'react';
import { generateCustomCourse } from '../services/geminiService';
import { Course } from '../types';
import { Sparkles, Loader2, ArrowRight, BookOpen, CheckCircle } from 'lucide-react';

interface CourseGeneratorProps {
  onCourseGenerated: (course: Course) => void;
}

const CourseGenerator: React.FC<CourseGeneratorProps> = ({ onCourseGenerated }) => {
  const [role, setRole] = useState('');
  const [goal, setGoal] = useState('');
  const [level, setLevel] = useState('Intermediate');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !goal) return;

    setLoading(true);
    setError('');

    try {
      const course = await generateCustomCourse(role, goal, level);
      onCourseGenerated(course);
    } catch (err) {
      setError("课程生成失败，请检查您的 API Key 或稍后重试。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-blue-600 p-8 text-center text-white relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full opacity-10">
               <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                   <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
               </svg>
           </div>
          <Sparkles className="mx-auto h-12 w-12 mb-4 text-blue-200" />
          <h2 className="text-3xl font-bold mb-2">AI 智能课程设计中心</h2>
          <p className="text-blue-100 max-w-lg mx-auto">
            基于 Gemini 2.5 强大模型，为您的团队量身定制“岗位-技能”匹配的专属学习路径。
          </p>
        </div>

        <div className="p-8">
          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">目标岗位 (Target Role)</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="例如：高级产品经理、Java 后端开发、销售总监"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">课程难度 (Difficulty)</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-white"
                >
                  <option value="Beginner">入门 (Beginner)</option>
                  <option value="Intermediate">进阶 (Intermediate)</option>
                  <option value="Advanced">专家 (Advanced)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">具体学习目标 / 技能缺口</label>
              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="例如：我需要团队掌握 RAG 架构的实施方法，以便在企业内部知识库项目中落地..."
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none h-32 resize-none"
                required
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all transform hover:-translate-y-1 ${
                loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/30'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" />
                  正在规划课程体系...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  立即生成学习路径
                  <ArrowRight size={20} />
                </div>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100">
             <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">为什么选择讯飞 AI 课程生成？</h4>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-green-500 mt-0.5" />
                    <p className="text-sm text-slate-600">根据企业业务场景定制，拒绝通用空泛内容。</p>
                </div>
                <div className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-green-500 mt-0.5" />
                    <p className="text-sm text-slate-600">自动生成配套的测验与实战作业。</p>
                </div>
                <div className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-green-500 mt-0.5" />
                    <p className="text-sm text-slate-600">无缝对接企业内部人才胜任力模型。</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseGenerator;