import React, { useState } from 'react';
import Layout from './components/Layout';
import Onboarding from './components/Onboarding';
import LearningPath from './components/LearningPath';
import Classroom from './components/Classroom';
import Analytics from './components/Analytics';
import Dashboard from './components/Dashboard'; 
import KnowledgeGraph from './components/KnowledgeGraph';
import { generateLearningPath } from './services/geminiService';
import { UserProfile, LearningPath as LearningPathType, Task, AppView } from './types';

function App() {
  const [view, setView] = useState<AppView>(AppView.ONBOARDING);
  const [loading, setLoading] = useState(false);
  const [path, setPath] = useState<LearningPathType | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const handleCourseGenerated = (generatedPath: LearningPathType) => {
      setPath(generatedPath);
      // DIRECTLY show the Graph view for the plan instead of linear path
      setView(AppView.KNOWLEDGE_GRAPH);
  };

  const handleStartTask = (task: Task) => {
    setActiveTask(task);
    setView(AppView.CLASSROOM);
  };

  const handleMaterialSelect = (title: string, type: 'video' | 'doc') => {
      const tempTask: Task = {
          id: Date.now().toString(),
          title: title,
          type: type === 'video' ? 'video' : 'practice',
          description: '来自知识图谱的精选内容',
          duration: '20min',
          isPro: false
      };
      setActiveTask(tempTask);
      setView(AppView.CLASSROOM);
  };

  const fullReset = () => {
      setView(AppView.ONBOARDING);
      setPath(null);
      setActiveTask(null);
  };

  const renderContent = () => {
    switch (view) {
      case AppView.ONBOARDING:
        return <Dashboard setCurrentView={setView} onCourseGenerated={handleCourseGenerated} />;
      
      // Kept for backward compatibility or explicit toggle, but default flow is now Graph
      case AppView.PATH_VIEW:
        return path ? (
            <LearningPath 
                path={path} 
                onStartTask={handleStartTask} 
                onRegenerate={() => setView(AppView.ONBOARDING)}
                onViewAnalytics={() => setView(AppView.ANALYTICS)}
            />
        ) : (
            <div>Error: No path data</div>
        );
      
      case AppView.CLASSROOM:
        return activeTask ? (
            <Classroom 
                task={activeTask} 
                onBack={() => setView(AppView.KNOWLEDGE_GRAPH)} 
                fullPath={path || undefined} 
            />
        ) : (
            <div>Error: No active task</div>
        );
      
      case AppView.ANALYTICS:
          return path ? (
              <Analytics path={path} onBack={() => setView(AppView.KNOWLEDGE_GRAPH)} />
          ) : null;

      case AppView.KNOWLEDGE_GRAPH:
          return (
            <KnowledgeGraph 
                onBack={() => setView(AppView.ONBOARDING)} 
                onSelectMaterial={handleMaterialSelect}
                path={path || undefined} // Pass the path if it exists
            />
          );

      default:
        return <Dashboard setCurrentView={setView} onCourseGenerated={handleCourseGenerated} />;
    }
  };

  return (
    <Layout 
        resetView={fullReset}
        // Clicking header nav resets to global graph (no path)
        goToKnowledgeGraph={() => { setPath(null); setView(AppView.KNOWLEDGE_GRAPH); }}
        showAssistant={view !== AppView.CLASSROOM}
    >
      {renderContent()}
    </Layout>
  );
}

export default App;