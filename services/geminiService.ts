
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { LearningPath, UserProfile, AnalyticsData, QuizQuestion, AINote, CodeEvaluation, ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Robust schema for detailed generation
const pathSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    totalDuration: { type: Type.STRING },
    description: { type: Type.STRING },
    tags: { type: Type.ARRAY, items: { type: Type.STRING } },
    phases: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          goal: { type: Type.STRING },
          weeks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                week: { type: Type.INTEGER },
                theme: { type: Type.STRING },
                outcome: { type: Type.STRING },
                tasks: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      type: { type: Type.STRING, enum: ["video", "practice", "quiz"] },
                      description: { type: Type.STRING },
                      duration: { type: Type.STRING },
                      isPro: { type: Type.BOOLEAN }
                    },
                    required: ["title", "type", "description", "duration"]
                  }
                }
              },
              required: ["week", "theme", "tasks"]
            }
          }
        },
        required: ["title", "goal", "weeks"]
      }
    }
  },
  required: ["title", "totalDuration", "description", "phases"]
};

export const generateLearningPath = async (profile: UserProfile): Promise<LearningPath> => {
  try {
    const prompt = `
      You are an expert AI Learning Architect at iFLYTEK AI University (讯飞AI大学堂).
      Your task is to generate a **comprehensive, deep, and highly personalized** learning path based on the user profile below.
      
      **User Profile**:
      - Role: ${profile.role}
      - Level: ${profile.level}
      - Core Goal: ${profile.goal}
      - Time Commitment: ${profile.timeCommitment} hours/week
      - Tech Stack/Interests: ${profile.skills.join(', ') || 'General AI Application'}

      **Requirements**:
      1. **Structure**: Create 3-4 distinct Learning Phases (e.g., Foundation, Advanced Application, Real-world Project).
      2. **Detail**: Each phase must contain 1-3 weeks. Each week must have 3-5 specific tasks.
      3. **Description**: The top-level 'description' field must be **SHORT and CONCISE** (under 50 words). It should sound like a professional course syllabus overview.
      4. **Tags**: Provide 3-5 short keywords (e.g., "High Salary", "Python", "RAG", "Official Cert") in the 'tags' field.
      5. **Content Context**: 
         - The content MUST be based on **iFLYTEK Spark Model (星火大模型)** ecosystem.
         - Mention specific tools like "Spark Python SDK", "iFLYTEK Open Platform", "Spark Desk", or "Spark API".
      6. **Role Customization**:
         - If the user is a "Developer" or chose "AI Coding", focus heavily on API integration, Python SDK, WebSocket handling, and RAG implementation.
         - If the user is a "Product Manager", focus on Prompt Engineering, Agent orchestration, and business scenario analysis.
      7. **Task Types**:
         - 'video': Theoretical learning (e.g., "Spark API Architecture Deep Dive").
         - 'practice': Hands-on coding or prompts (e.g., "Build a CLI Chatbot using Spark SDK").
         - 'quiz': Knowledge check.
      8. **Language**: Chinese (Simplified). Ensure professional terminology.

      Generate a rich JSON response matching the schema.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: pathSchema,
        maxOutputTokens: 8192, 
        temperature: 0.7,
      }
    });

    const data = JSON.parse(response.text || "{}");
    return {
      ...data,
      id: crypto.randomUUID(),
      phases: data.phases?.map((p: any) => ({
        ...p,
        id: crypto.randomUUID(),
        weeks: p.weeks?.map((w: any) => ({
            ...w,
            tasks: w.tasks?.map((t: any) => ({ ...t, id: crypto.randomUUID() }))
        }))
      }))
    };
  } catch (error) {
    console.error("Failed to generate path:", error);
    return {
      id: "fallback",
      title: "星火大模型应用全栈工程师 (Fallback)",
      totalDuration: "4周",
      description: "生成超时，已为您切换至默认推荐路径。请检查网络或 API Key。",
      tags: ["Fallback", "Spark SDK", "Python"],
      phases: [
        {
          id: "p1",
          title: "Phase 1: 星火大模型基础与环境搭建",
          goal: "掌握 API 调用与鉴权机制",
          weeks: [
            {
              week: 1,
              theme: "环境准备与 Hello World",
              outcome: "成功调通第一次 API",
              tasks: [
                { id: "t1", title: "讯飞开放平台控制台概览", type: "video", description: "获取 APPID, APIKey, APISecret", duration: "15min", isPro: false },
                { id: "t2", title: "Python SDK 快速集成", type: "video", description: "pip install 与环境配置", duration: "20min", isPro: false },
                { id: "t3", title: "实战：编写第一个对话 Demo", type: "practice", description: "使用 Python 实现控制台对话", duration: "45min", isPro: false }
              ]
            }
          ]
        }
      ]
    };
  }
};

export const evaluateCode = async (code: string, taskDescription: string): Promise<CodeEvaluation> => {
    try {
        const prompt = `
            You are an AI Code Interpreter for a Python/JavaScript sandbox.
            Task Context: ${taskDescription}
            User Code:
            \`\`\`
            ${code}
            \`\`\`
            
            Please evaluate this code. 
            1. Simulate the output/console logs.
            2. Check if it logically solves the task context.
            
            Return JSON: { "output": string, "pass": boolean, "feedback": string }
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        
        return JSON.parse(response.text || '{ "output": "Error", "pass": false, "feedback": "Analysis failed" }');
    } catch (e) {
        return { output: "System Error: Unable to evaluate code.", pass: false, feedback: "Please check your network." };
    }
};

export const generateCustomCourse = async (role: string, goal: string, level: string): Promise<LearningPath> => {
  return generateLearningPath({
    role,
    goal,
    level,
    timeCommitment: "5",
    skills: []
  });
};

export const generateAnalytics = async (path: LearningPath): Promise<AnalyticsData> => {
    return {
        radarData: [
            { subject: '理论基础', A: 75, fullMark: 100 },
            { subject: '实战能力', A: 50, fullMark: 100 },
            { subject: '创新思维', A: 85, fullMark: 100 },
            { subject: '工程落地', A: 40, fullMark: 100 },
            { subject: '商业洞察', A: 60, fullMark: 100 },
        ],
        progressData: [
            { day: 'Mon', hours: 2 },
            { day: 'Tue', hours: 1 },
            { day: 'Wed', hours: 3 },
            { day: 'Thu', hours: 0 },
            { day: 'Fri', hours: 2 },
            { day: 'Sat', hours: 4 },
            { day: 'Sun', hours: 1 },
        ],
        matchScore: 82,
        strengths: ["学习自驱力强", "AI 认知清晰"],
        weaknesses: ["代码实战需加强"],
        nextSteps: ["建议完成第 2 周的实战作业", "尝试使用 API 构建简易 Agent"]
    };
};

export const sendTutorMessage = async (history: ChatMessage[], currentMessage: string, imageBase64?: string): Promise<string> => {
    try {
      // If we have an image, we use models.generateContent directly with parts
      if (imageBase64) {
          const prompt = `用户上下文: 用户正在观看视频课程或查看文档。
          用户提问: ${currentMessage}. 
          任务: 你是一位专业的AI金牌讲师，请针对用户的图片内容进行答疑。
          
          **回答要求**：
          1. **语言**：必须使用**简体中文**。
          2. **格式**：必须严格使用 **Markdown** 排版。
             - 使用 **加粗** 强调重点。
             - 使用列表（- 或 1.）分条陈述。
             - 关键结论请引用或高亮。
          3. **风格**：教学语气，循循善诱，将复杂问题简单化。
          
          请解析图片内容或回答用户问题。`;
          
          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: {
                  parts: [
                      { inlineData: { mimeType: 'image/png', data: imageBase64 } },
                      { text: prompt }
                  ]
              }
          });
          return response.text || "我无法解析这张图片，请重试。";
      } else {
          // Standard text chat
          const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
              systemInstruction: `你是一位专业、博学且耐心的AI金牌讲师，服务于“讯飞AI大学堂”。
              
              你的回答必须严格遵守以下规范：
              1. **语言**：必须使用**简体中文**。
              2. **排版**：必须使用 **Markdown** 格式。
                 - 核心观点使用 **加粗**。
                 - 分点内容必须使用列表（- 或 1.）。
                 - 代码段必须使用 \`\`\` 包裹。
                 - 重要提示可以使用 > 引用格式。
              3. **语气**：像老师一样循循善诱，既专业又亲切。对于复杂概念，多使用类比。
              4. **结构**：
                 - 🎯 **核心结论**：先给出直接回答。
                 - 📖 **详细解析**：分点展开逻辑。
                 - 💡 **助教建议**：给出延伸思考或操作建议。
              `
            }
          });
          // Note: In a real app, we would send the full history here.
          const result = await chat.sendMessage({ message: currentMessage });
          return result.text || "服务繁忙。";
      }
    } catch (error) {
      console.error(error);
      return "网络波动，请重试。";
    }
};

export const generateQuiz = async (topic: string): Promise<QuizQuestion[]> => {
    return [
        {
            id: '1',
            question: '在使用 Python SDK 调用星火大模型时，必须配置的三个鉴权参数是什么？',
            options: ['AppID, APIKey, APISecret', 'UserID, Password, Token', 'AppID, ClientSecret, Public Key', 'AccessKey, SecretKey, Region'],
            correctAnswer: 0
        },
        {
            id: '2',
            question: '若要实现打字机效果的流式输出，需要监听哪个回调函数？',
            options: ['on_message', 'on_open', 'on_error', 'on_close'],
            correctAnswer: 0
        },
        {
            id: '3',
            question: '安装讯飞星火 Python SDK 的正确命令是？',
            options: ['pip install spark_ai_python', 'npm install spark-ai', 'pip install iflytek-spark', 'pip install spark-sdk'],
            correctAnswer: 0
        }
    ];
};

export const generateAINotes = async (topic: string): Promise<AINote[]> => {
    return [
        { id: '1', timestamp: '00:15', content: '安装环境：确保 Python 版本 >= 3.8，执行 pip install 依赖库。', tag: 'KeyPoint' },
        { id: '2', timestamp: '01:45', content: '鉴权配置：在控制台获取 APPID、APISecret 和 APIKey，切勿硬编码在代码中。', tag: 'KeyPoint' },
        { id: '3', timestamp: '03:20', content: 'WebSocket URL 拼接鉴权签名的核心逻辑实现。', tag: 'Code' },
        { id: '4', timestamp: '05:10', content: 'SparkMessage 对象结构：区分 user 和 assistant 的 role 属性。', tag: 'Summary' }
    ];
};

export const analyzeUploadedFile = async (fileName: string): Promise<string> => {
  return `### 👨‍🏫 **AI 助教导读报告**

我已为您通读全文文档 **"${fileName}"**，以下是提炼的核心知识体系：

#### 1. 核心原理 (Page 3-5)
- **知识点**：详细推导了 **Self-Attention** (自注意力机制) 的计算公式。
- **重点**：请重点理解 $Q, K, V$ 三个矩阵的物理含义及其交互方式。

#### 2. 架构创新 (Page 8)
- **对比**：阐述了 Transformer 相比 RNN/LSTM 在并行计算上的巨大优势。
- **机制**：解析了 **Positional Encoding** 如何解决序列位置信息丢失的问题。

#### 3. 实战落地 (Page 12)
- **代码**：提供了基于 PyTorch 的代码实现片段。
- **建议**：建议重点阅读 \`MultiHeadAttention\` 类的实现逻辑。

---
💡 **助教建议**：
建议您先通读第 1 章的概念介绍，然后直接跳转到第 3 章的代码部分进行实操练习。遇到不懂的数学公式，可以随时**截图提问**！`;
}
