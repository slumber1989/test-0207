import React, { useState, useRef, useMemo } from 'react';
import { 
    ArrowRight, Zap, BookOpen, 
    Terminal, Brain, MessageSquareCode, Database, Bot, Video,
    CheckCircle2, Map, Clock, FileText, PlayCircle,
    Maximize2, Folder, Code, X, UploadCloud, Plus,
    Cpu, Network, GitBranch, Layers, Share2, Search, Target, Radar, Activity, GraduationCap,
    Rocket, Flag
} from 'lucide-react';
import { LearningPath } from '../types';

interface KnowledgeGraphProps {
    onBack: () => void;
    onSelectMaterial: (title: string, type: 'video' | 'doc') => void;
    path?: LearningPath; // Optional path for personalized view
}

type NodeStatus = 'completed' | 'in-progress' | 'locked' | 'recommended';
type ViewMode = 'knowledge' | 'skills';

interface Material {
    type: 'video' | 'doc';
    title: string;
    duration?: string;
    pages?: string;
    isUserUploaded?: boolean;
}

interface GraphNode {
    id: number;
    x: number;
    y: number;
    label: string;
    subLabel?: string;
    type: 'root' | 'milestone' | 'leaf' | 'particle';
    category: 'foundation' | 'llm' | 'application' | 'engineering' | 'extension';
    status: NodeStatus;
    icon?: React.ElementType;
    size?: number;
    description: string;
    materials: Material[];
}

const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ onBack, onSelectMaterial, path }) => {
    const [selectedNode, setSelectedNode] = useState<number | null>(path ? 0 : 4); // Select root if path exists
    const [viewMode, setViewMode] = useState<ViewMode>('knowledge');
    const [userMaterials, setUserMaterials] = useState<Material[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const isVideo = file.type.startsWith('video') || file.name.endsWith('.mp4');
        const newMaterial: Material = {
            type: isVideo ? 'video' : 'doc',
            title: file.name,
            duration: isVideo ? '未知时长' : undefined,
            pages: !isVideo ? '解析中...' : undefined,
            isUserUploaded: true
        };
        setUserMaterials(prev => [newMaterial, ...prev]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Helper to generate materials
    const genMaterials = (label: string): Material[] => [
        { type: 'video', title: `${label} 核心概念解析`, duration: '15分钟' },
        { type: 'video', title: `${label} 实战案例演示`, duration: '25分钟' },
        { type: 'doc', title: `${label} 学习手册.pdf`, pages: '12页' },
        { type: 'doc', title: `${label} 常见面试题.docx`, pages: '5页' },
    ];

    // Generate Nodes: Either from Path (Personalized) or Default (Global)
    const nodes: GraphNode[] = useMemo(() => {
        // --- MODE A: PERSONALIZED PLAN GALAXY ---
        if (path) {
            const planNodes: GraphNode[] = [];
            
            // 1. Center Sun: The Plan Goal
            planNodes.push({
                id: 0, x: 1000, y: 500, 
                label: "我的专属规划", 
                subLabel: "Goal",
                type: 'root', 
                category: 'foundation', 
                status: 'completed', 
                icon: Rocket, 
                size: 80, 
                description: path.description || "您的定制化 AI 学习路径",
                materials: [] 
            });

            // 2. Orbits: Phases
            path.phases.forEach((phase, i) => {
                // Distribute phases in a circle
                const angle = (i / path.phases.length) * 2 * Math.PI - (Math.PI / 2); // Start top
                const orbitRadius = 350;
                const px = 1000 + Math.cos(angle) * orbitRadius;
                const py = 500 + Math.sin(angle) * orbitRadius;
                
                const phaseNodeId = (i + 1) * 1000;
                
                planNodes.push({
                    id: phaseNodeId, x: px, y: py,
                    label: phase.title,
                    subLabel: `Phase ${i + 1}`,
                    type: 'milestone',
                    category: 'llm',
                    status: i === 0 ? 'in-progress' : 'locked',
                    icon: Flag,
                    description: phase.goal,
                    materials: []
                });

                // 3. Satellites: Tasks per Phase
                // Flatten tasks from all weeks in this phase
                const tasks = phase.weeks.flatMap(w => w.tasks);
                tasks.forEach((task, j) => {
                    // Cluster tasks around their phase node
                    const taskAngle = (j / tasks.length) * 2 * Math.PI;
                    const taskRadius = 140; // Distance from phase node
                    const tx = px + Math.cos(taskAngle) * taskRadius;
                    const ty = py + Math.sin(taskAngle) * taskRadius;

                    planNodes.push({
                        id: phaseNodeId + j + 1,
                        x: tx, y: ty,
                        label: task.title.length > 10 ? task.title.substring(0, 10) + '...' : task.title,
                        type: 'leaf',
                        category: 'application',
                        status: i === 0 ? 'recommended' : 'locked',
                        icon: task.type === 'video' ? Video : Code,
                        description: task.description,
                        materials: [{ type: task.type === 'video' ? 'video' : 'doc', title: task.title, duration: task.duration }]
                    });
                });
            });

            // Add some background particles for atmosphere
            for(let k=0; k<20; k++) {
                const ang = Math.random() * Math.PI * 2;
                const rad = 600 + Math.random() * 200;
                planNodes.push({
                    id: 9000 + k,
                    x: 1000 + Math.cos(ang) * rad,
                    y: 500 + Math.sin(ang) * rad,
                    label: "扩展知识",
                    type: 'particle',
                    category: 'extension',
                    status: 'locked',
                    description: "Bonus Content",
                    materials: []
                });
            }

            return planNodes;
        }

        // --- MODE B: GLOBAL KNOWLEDGE GALAXY (Default) ---
        const baseNodes: GraphNode[] = [
             // Center - Core Foundation
            { id: 1, x: 1000, y: 500, label: "AI 基础理论", subLabel: "Core", type: 'root', category: 'foundation', status: 'completed', icon: Brain, size: 100, description: "人工智能核心概念，包含图灵测试、符号主义与连接主义。", materials: genMaterials("AI 基础") },
            
            // Orbit 1 - Pillars
            { id: 2, x: 700, y: 500, label: "编程基础", subLabel: "Python", type: 'milestone', category: 'engineering', status: 'completed', icon: Terminal, description: "掌握 Python 语法、数据结构及常用库。", materials: genMaterials("Python 编程") },
            { id: 3, x: 1300, y: 500, label: "机器学习", subLabel: "ML", type: 'milestone', category: 'foundation', status: 'completed', icon: Cpu, description: "监督学习、无监督学习与强化学习基础。", materials: genMaterials("机器学习") },
            { id: 4, x: 1000, y: 200, label: "深度学习", subLabel: "DL", type: 'milestone', category: 'foundation', status: 'completed', icon: Network, description: "神经网络、反向传播与优化算法。", materials: genMaterials("深度学习") },
            { id: 5, x: 1000, y: 800, label: "大模型原理", subLabel: "LLM", type: 'milestone', category: 'llm', status: 'in-progress', icon: MessageSquareCode, description: "Transformer 架构、Attention 机制与预训练。", materials: genMaterials("大模型") },

            // Orbit 2 - Applications & Extensions (Dense)
            { id: 6, x: 500, y: 300, label: "计算机视觉", type: 'leaf', category: 'application', status: 'locked', icon: Video, description: "CNN、目标检测与图像分割。", materials: genMaterials("计算机视觉") },
            { id: 7, x: 500, y: 700, label: "自然语言处理", type: 'leaf', category: 'application', status: 'locked', icon: FileText, description: "RNN、LSTM、BERT 与 NLP 任务。", materials: genMaterials("NLP") },
            { id: 8, x: 1500, y: 300, label: "强化学习", type: 'leaf', category: 'foundation', status: 'locked', icon: Target, description: "Markov 决策过程、Q-Learning 与策略梯度。", materials: genMaterials("强化学习") },
            { id: 9, x: 1500, y: 700, label: "知识图谱", type: 'leaf', category: 'application', status: 'locked', icon: GitBranch, description: "实体抽取、关系推理与图数据库。", materials: genMaterials("知识图谱") },
            
            // LLM Cluster
            { id: 10, x: 900, y: 950, label: "Prompt工程", type: 'leaf', category: 'llm', status: 'recommended', icon: Zap, description: "提示词设计艺术与思维链 (CoT)。", materials: genMaterials("Prompt 工程") },
            { id: 11, x: 1100, y: 950, label: "RAG开发", type: 'leaf', category: 'llm', status: 'locked', icon: Database, description: "检索增强生成架构与向量数据库。", materials: genMaterials("RAG") },
            { id: 12, x: 1000, y: 1100, label: "Agent智能体", type: 'leaf', category: 'llm', status: 'locked', icon: Bot, description: "自主智能体设计与工具调用。", materials: genMaterials("AI Agent") },
            { id: 13, x: 800, y: 1050, label: "微调技术", type: 'leaf', category: 'llm', status: 'locked', icon: Layers, description: "LoRA、P-Tuning 等高效微调方法。", materials: genMaterials("模型微调") },
            { id: 14, x: 1200, y: 1050, label: "模型量化", type: 'leaf', category: 'llm', status: 'locked', icon: Cpu, description: "模型压缩、剪枝与推理加速。", materials: genMaterials("模型量化") },

            // Engineering Cluster
            { id: 15, x: 600, y: 500, label: "数据结构", type: 'leaf', category: 'engineering', status: 'completed', description: "栈、队列、树与图算法。", materials: genMaterials("数据结构") },
            { id: 16, x: 500, y: 400, label: "Linux基础", type: 'leaf', category: 'engineering', status: 'completed', description: "常用命令与 Shell 脚本。", materials: genMaterials("Linux") },
            { id: 17, x: 500, y: 600, label: "Docker容器", type: 'leaf', category: 'engineering', status: 'in-progress', description: "容器化部署与 K8s 基础。", materials: genMaterials("Docker") },
            
            // My Knowledge Base
            { id: 99, x: 200, y: 150, label: "我的知识库", subLabel: "Upload", type: 'root', category: 'extension', status: 'completed', icon: BookOpen, description: "个人上传资料分析与学习。", materials: userMaterials }
        ];

        // Generate ~40 more particle nodes for visual density (Galaxy Effect)
        const particles: GraphNode[] = [];
        const labels = [
            "TensorFlow", "PyTorch", "Pandas", "NumPy", "Scikit-learn", "Keras", "OpenCV", "NLTK", "SpaCy", "HuggingFace", 
            "LangChain", "LlamaIndex", "ChromaDB", "Milvus", "FastAPI", "Flask", "React", "NextJS", "CUDA", "Git", 
            "Jupyter", "VSCode", "Redis", "MongoDB", "Neo4j", "ElasticSearch", "Kafka", "Airflow", "MLflow", "WandB",
            "Ray", "Spark", "Hadoop", "Hive", "Flink", "Tableau", "PowerBI", "Matplotlib", "Seaborn", "Plotly"
        ];
        
        labels.forEach((label, i) => {
            const angle = (i / labels.length) * 4 * Math.PI; // Spiral
            const radius = 400 + (i * 15) + Math.random() * 50; 
            particles.push({
                id: 100 + i,
                x: 1000 + Math.cos(angle) * radius,
                y: 500 + Math.sin(angle) * radius,
                label: label,
                type: 'particle',
                category: i % 2 === 0 ? 'engineering' : 'application',
                status: 'locked',
                description: `${label} 工具使用与最佳实践。`,
                materials: genMaterials(label)
            });
        });

        return [...baseNodes, ...particles];
    }, [userMaterials, path]);

    // Generate connections based on generated nodes
    const connections = useMemo(() => {
        if (path) {
            // Personalized path connections
            const conns: {from: number, to: number}[] = [];
            const planNodes = nodes; // Nodes are already computed for path
            
            // Root (0) -> Phases (1000, 2000...)
            const phases = planNodes.filter(n => n.type === 'milestone');
            phases.forEach(phase => {
                conns.push({ from: 0, to: phase.id });
                // Phase -> Tasks
                // We know tasks for phase 1000 have ids 1001, 1002...
                // But safer to filter by proximity or ID range if logic allows.
                // Here, simple ID check: task ID > phase ID and < phase ID + 999
                const tasks = planNodes.filter(t => t.type === 'leaf' && t.id > phase.id && t.id < phase.id + 999);
                tasks.forEach(task => {
                    conns.push({ from: phase.id, to: task.id });
                });
            });
            // Connect phases sequentially
            for(let i=0; i<phases.length-1; i++) {
                conns.push({ from: phases[i].id, to: phases[i+1].id });
            }
            return conns;
        }

        // Global default connections
        const coreLinks = [
            { from: 1, to: 2 }, { from: 1, to: 3 }, { from: 1, to: 4 }, { from: 1, to: 5 },
            { from: 4, to: 6 }, { from: 4, to: 7 },
            { from: 3, to: 8 }, { from: 3, to: 9 },
            { from: 5, to: 10 }, { from: 5, to: 11 }, { from: 5, to: 12 }, { from: 5, to: 13 }, { from: 5, to: 14 },
            { from: 2, to: 15 }, { from: 2, to: 16 }, { from: 2, to: 17 }
        ];
        const particleLinks = nodes.filter(n => n.type === 'particle').map(p => ({
            from: p.id % 5 + 2, 
            to: p.id
        }));
        return [...coreLinks, ...particleLinks];
    }, [nodes, path]);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setStartPos({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setOffset({
            x: e.clientX - startPos.x,
            y: e.clientY - startPos.y
        });
    };

    const handleMouseUp = () => setIsDragging(false);

    const getNodeStyle = (node: GraphNode) => {
        let baseSize = node.type === 'root' ? 24 : node.type === 'milestone' ? 20 : node.type === 'leaf' ? 16 : 8;
        let baseColor = 'bg-white border-slate-200 text-slate-400';
        
        // Custom styling for Skill Tree view
        if (viewMode === 'skills' && !path) {
             if (node.category === 'engineering' || node.category === 'application') {
                 baseColor = 'bg-green-500 border-green-400 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]';
                 if (node.status === 'locked') baseColor = 'bg-white border-green-400 text-green-600 border-dashed';
             } else {
                 baseColor = 'bg-slate-900 border-slate-700 text-slate-600 opacity-30';
             }
        } else {
            // Default Knowledge Graph / Plan View styling
            if (node.status === 'completed') baseColor = 'bg-blue-500 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]';
            else if (node.status === 'in-progress') baseColor = 'bg-white border-yellow-400 text-slate-800 shadow-[0_0_15px_rgba(250,204,21,0.3)] ring-2 ring-yellow-100';
            else if (node.status === 'recommended') baseColor = 'bg-white border-blue-400 text-blue-600 border-dashed';
        }
        
        if (node.type === 'particle') baseColor = 'bg-slate-800/50 border-slate-700 text-slate-400 text-[10px] opacity-70 hover:opacity-100 hover:bg-blue-600 hover:text-white';

        return { baseSize, baseColor };
    };

    return (
        <div className="fixed inset-x-0 bottom-0 top-20 bg-[#0f172a] overflow-hidden flex animate-in fade-in duration-500">
             
             {/* LEFT SIDEBAR: Personal Learning Analysis */}
             <div className="w-[400px] bg-white/95 backdrop-blur-xl border-r border-slate-200 flex flex-col z-20 h-full relative shadow-xl shrink-0">
                <div className="p-6 border-b border-slate-100 shrink-0">
                    <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors text-sm font-bold mb-6">
                        <ArrowRight className="rotate-180" size={16} /> 返回首页
                    </button>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                        <Activity className="text-blue-600" size={24} /> 
                        {path ? "专属学习路径分析" : "个人学习情况智能分析"}
                    </h2>
                    
                    {/* View Switcher - Only meaningful in Global Mode */}
                    {!path && (
                        <div className="mt-6 flex bg-slate-100 p-1 rounded-xl">
                            <button 
                                onClick={() => setViewMode('knowledge')}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'knowledge' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                知识图谱
                            </button>
                            <button 
                                onClick={() => setViewMode('skills')}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'skills' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                技能树
                            </button>
                        </div>
                    )}
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Stats Summary */}
                    <div className="grid grid-cols-2 gap-4">
                         <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                             <div className="text-xs text-slate-500 mb-1">
                                 {path ? "本计划节点" : "已掌握知识点"}
                             </div>
                             <div className="text-2xl font-bold text-slate-800">
                                 {path ? "0" : "18"} <span className="text-sm font-normal text-slate-400">/ {nodes.filter(n=>n.type !== 'particle').length}</span>
                             </div>
                         </div>
                         <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                             <div className="text-xs text-slate-500 mb-1">预计时长</div>
                             <div className="text-2xl font-bold text-slate-800">{path ? path.totalDuration : "24h"}</div>
                         </div>
                    </div>

                    {/* AI Assessment */}
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                        <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                            <Bot size={16} className="text-blue-500" /> AI 导师评估
                        </h4>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                                <span>理论基础</span>
                                <span className="text-slate-700 font-bold">85%</span>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-[85%] rounded-full"></div>
                            </div>

                            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                                <span>实战目标</span>
                                <span className="text-slate-700 font-bold">100%</span>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div className="h-full bg-yellow-500 w-[100%] rounded-full animate-pulse"></div>
                            </div>

                            <div className="mt-4 p-3 bg-white rounded-xl border border-slate-100 text-sm text-slate-600 leading-relaxed shadow-sm">
                                <p>{path ? "您的专属学习星系已生成。建议按顺时针方向，从 Phase 1 开始攻克核心节点。" : "建议您加强 Docker 容器 和 Agent 智能体 相关的实战练习，以提升工程落地能力。"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Current Focus */}
                    <div>
                        <h4 className="text-sm font-bold text-slate-400 uppercase mb-3 tracking-wider">正在攻克</h4>
                        <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-yellow-400">
                            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-600">
                                <MessageSquareCode size={20} />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-slate-800">
                                    {path ? path.phases[0]?.title || "规划启动" : "大模型原理"}
                                </div>
                                <div className="text-xs text-slate-500">
                                    {path ? "Phase 1 - 基础夯实" : "Transformer 架构解析"}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
             </div>

             {/* GRAPH CANVAS */}
             <div className={`flex-1 relative bg-[#020617] overflow-hidden transition-colors duration-1000 ${viewMode === 'skills' && !path ? 'bg-[#022c22]' : ''}`}>
                 {/* Starfield Background */}
                 <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute top-[20%] left-[30%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[20%] right-[30%] w-[400px] h-[400px] bg-purple-900/10 rounded-full blur-[100px]"></div>
                    <div className="w-full h-full opacity-20" 
                        style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '50px 50px' }}>
                    </div>
                 </div>

                 <div 
                    ref={containerRef}
                    className={`w-full h-full cursor-${isDragging ? 'grabbing' : 'grab'} relative z-10`}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                 >
                    <div 
                        className="absolute transition-transform duration-75 ease-out origin-top-left"
                        style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
                    >
                        {/* Lines */}
                        <svg className="overflow-visible pointer-events-none" width="4000" height="2000">
                            {connections.map((conn, i) => {
                                const from = nodes.find(n => n.id === conn.from);
                                const to = nodes.find(n => n.id === conn.to);
                                if (!from || !to) return null;
                                return (
                                    <line 
                                        key={i} 
                                        x1={from.x} y1={from.y} x2={to.x} y2={to.y} 
                                        stroke={viewMode === 'skills' && !path ? "#14532d" : "#1e293b"} 
                                        strokeWidth="1" 
                                        strokeOpacity={to.type === 'particle' ? 0.2 : 0.5}
                                    />
                                );
                            })}
                        </svg>

                        {/* Nodes */}
                        {nodes.map((node) => {
                            const { baseSize, baseColor } = getNodeStyle(node);
                            const Icon = node.icon;
                            
                            const opacity = 1;

                            return (
                                <div 
                                    key={node.id}
                                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 group transition-all duration-500`}
                                    style={{ left: node.x, top: node.y, opacity }}
                                    onClick={(e) => { e.stopPropagation(); setSelectedNode(node.id); }}
                                >
                                    <div className={`
                                        relative flex items-center justify-center rounded-full border transition-all duration-300 hover:scale-125 cursor-pointer 
                                        ${baseColor}
                                    `} style={{ width: baseSize * 4, height: baseSize * 4 }}>
                                        {Icon && <Icon size={baseSize * 2} />}
                                        {!Icon && <div className="w-1.5 h-1.5 bg-current rounded-full"></div>}
                                    </div>
                                    
                                    {(node.type !== 'particle' || node.status !== 'locked') && (
                                        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 text-center w-32 pointer-events-none">
                                            <div className="text-sm font-bold text-slate-300 shadow-black drop-shadow-md">{node.label}</div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                 </div>
             </div>

             {/* Right Drawer - Learning Resources */}
             {selectedNode !== null && (
                 <div className="absolute right-8 top-8 bottom-8 w-[480px] bg-white/95 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl p-0 z-50 animate-in slide-in-from-right-10 duration-300 flex flex-col overflow-hidden ring-1 ring-slate-200">
                     
                     <div className="relative p-10 pb-6 shrink-0">
                         <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-blue-50 to-transparent pointer-events-none"></div>
                         
                         {/* Close Button - Explicitly supported */}
                         <button 
                            onClick={() => setSelectedNode(null)} 
                            className="absolute top-8 right-8 p-2 rounded-full bg-white/50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors z-20 shadow-sm"
                            aria-label="关闭"
                        >
                             <X size={24} />
                         </button>

                         {(() => {
                            const node = nodes.find(n => n.id === selectedNode);
                            if (!node) return null;
                            return (
                                <div className="relative z-10">
                                    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-5 shadow-sm ${
                                        node.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                        <Zap size={12} fill="currentColor" />
                                        {node.status === 'completed' ? '已掌握' : node.status === 'in-progress' ? '进行中' : '未解锁'}
                                    </span>
                                    <h2 className="text-4xl font-extrabold text-slate-900 mb-3">{node.label}</h2>
                                    <p className="text-blue-600 text-lg font-medium">{node.description}</p>
                                </div>
                            );
                         })()}
                     </div>

                     {(() => {
                         const node = nodes.find(n => n.id === selectedNode);
                         if (!node) return null;
                         return (
                            <div className="flex-1 overflow-y-auto px-10 pb-10 space-y-8 custom-scrollbar">
                                {/* My KB Upload */}
                                {node.id === 99 && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 border-dashed">
                                        <h4 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                                            <UploadCloud size={20} className="text-blue-500" /> 上传学习资料
                                        </h4>
                                        <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.docx,.mp4,.mov" onChange={handleFileUpload} />
                                        <button onClick={() => fileInputRef.current?.click()} className="w-full py-3 bg-white text-blue-600 border border-blue-200 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm">
                                            <Plus size={18} /> 选择文件
                                        </button>
                                    </div>
                                )}

                                <div>
                                    <h4 className="text-base font-bold text-slate-800 mb-5 flex items-center gap-3"><BookOpen size={20} className="text-blue-500" /> 学习资源</h4>
                                    <div className="space-y-4">
                                        {node.materials.length > 0 ? node.materials.map((item, idx) => (
                                            <div key={idx} onClick={() => onSelectMaterial(item.title, item.type)} className="bg-white rounded-2xl border border-slate-100 p-5 hover:border-blue-300 cursor-pointer flex items-center gap-5 shadow-sm group">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.type === 'video' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                                                    {item.type === 'video' ? <Video size={18} /> : <FileText size={18} />}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-bold text-slate-700">{item.title}</div>
                                                    <div className="text-xs text-slate-400 mt-1">{item.duration || item.pages}</div>
                                                </div>
                                                <PlayCircle size={20} className="text-slate-300 group-hover:text-blue-500" />
                                            </div>
                                        )) : <div className="text-slate-400 text-sm">暂无推荐资源，请先解锁前置节点。</div>}
                                    </div>
                                </div>
                            </div>
                         );
                     })()}
                 </div>
             )}
        </div>
    );
};

export default KnowledgeGraph;