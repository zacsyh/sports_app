import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import db from '../services/database';
import Toast from '../components/common/Toast';
import BottomNavigation from '../components/layout/BottomNavigation';
import CreateProjectForm from '../components/common/CreateProjectForm';
import BackButton from '../components/common/BackButton';

const CreateProject = () => {
  const navigate = useNavigate();
  
  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pageRef = useRef(null);
  
  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    
    try {
      // 准备项目数据
      const projectData = {
        id: Date.now().toString(), // 使用时间戳作为简单ID
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: 'ACTIVE'
      };
      
      // 根据项目类型添加相应字段
      if (formData.type === 'SETS_REPS') {
        projectData.sets = parseInt(formData.sets);
        projectData.repsPerSet = parseInt(formData.reps);
        projectData.completedSets = []; // 初始化完成组数记录为空数组
      } else {
        projectData.targetCount = parseInt(formData.targetCount);
        projectData.targetWeight = formData.targetWeight ? parseFloat(formData.targetWeight) : null;
        projectData.currentCount = 0; // 初始化当前完成次数为0
        projectData.history = []; // 初始化历史记录为空数组
      }
      
      // 保存到数据库
      console.log('准备保存项目数据:', projectData);
      const result = await db.fitness_projects.add(projectData);
      console.log('项目保存结果:', result);
      
      // 验证数据是否正确保存
      const savedProject = await db.fitness_projects.get(result);
      console.log('保存后的项目数据:', savedProject);
      
      // 显示成功提示并返回首页
      setToast({message: '项目创建成功', type: 'success'});
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      console.error('保存项目失败:', error);
      setToast({message: '项目保存失败，请重试', type: 'error'});
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleRetry = () => {
    setToast(null);
  };
  
  const handleCancel = () => {
    navigate('/');
  };
  
  return (
    <CSSTransition in={true} timeout={300} classNames="page" appear nodeRef={pageRef}>
      <div className="create-project-page" ref={pageRef}>
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
        {toast && toast.type === 'error' && (
          <div className="retry-button-container">
            <button 
              type="button" 
              className="retry-button" 
              onClick={handleRetry}
              disabled={isSubmitting}
            >
              {isSubmitting ? '重试中...' : '重试'}
            </button>
          </div>
        )}
        <header className="create-project-header">
          <BackButton onClick={handleCancel} text="返回" />
          <h1>创建项目</h1>
        </header>
        
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CreateProjectForm 
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
        
        <BottomNavigation />
      </div>
    </CSSTransition>
  );
};

export default CreateProject;