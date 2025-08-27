import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
import db from '../services/database';
import Toast from '../components/common/Toast';
import CircularProgress from '../components/common/CircularProgress';
import BottomNavigation from '../components/layout/BottomNavigation';

const Tracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  
  // Sets×Reps模式状态
  const [currentSet, setCurrentSet] = useState(1);
  const [repsCompletedInCurrentSet, setRepsCompletedInCurrentSet] = useState(0);
  
  // Total count/weight模式状态
  const [currentCount, setCurrentCount] = useState(0);
  const [currentWeight, setCurrentWeight] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customCount, setCustomCount] = useState('');
  
  // 跟踪会话状态
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [sessionData, setSessionData] = useState({
    completedSets: []
  });

  useEffect(() => {
    loadProject();
  }, [id]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const projectData = await db.fitness_projects.get(id);
      if (projectData) {
        setProject(projectData);
        setStartTime(Date.now());
        
        // 初始化状态
        if (projectData.type === 'TOTAL_COUNT') {
          setCurrentCount(projectData.currentCount || 0);
          // 初始化重量为项目的目标重量（如果已设置）
          if (projectData.targetWeight) {
            setCurrentWeight(projectData.targetWeight.toString());
          }
        } else if (projectData.type === 'SETS_REPS') {
          // 加载已完成的组数
          if (projectData.completedSets) {
            setSessionData({ completedSets: projectData.completedSets });
          }
          // 设置当前组数为已完成组数+1
          const completedCount = projectData.completedSets 
            ? projectData.completedSets.reduce((sum, count) => sum + count, 0)
            : 0;
          setCurrentSet(Math.min(completedCount + 1, projectData.sets));
        }
      } else {
        setError('项目不存在');
      }
    } catch (err) {
      console.error('加载项目失败:', err);
      setError('加载项目失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    loadProject();
  };

  const calculateProgress = () => {
    if (!project) return 0;
    
    if (project.type === 'SETS_REPS') {
      // 计算实际完成的总组数
      const totalCompletedSets = sessionData.completedSets.reduce((sum, count) => sum + count, 0);
      return project.sets > 0 ? (totalCompletedSets / project.sets) * 100 : 0;
    } else {
      return project.targetCount > 0 ? (currentCount / project.targetCount) * 100 : 0;
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Sets×Reps模式操作
  const handleRepsChange = (delta) => {
    if (isPaused) return;
    const newReps = Math.max(0, repsCompletedInCurrentSet + delta);
    setRepsCompletedInCurrentSet(newReps);
  };

  const handleCompleteSet = async () => {
    if (!project || repsCompletedInCurrentSet <= 0) return;
    
    try {
      // 更新完成的组数记录 - 添加实际完成的组数
      const newCompletedSets = [...sessionData.completedSets];
      // 添加一个记录，表示完成了repsCompletedInCurrentSet组
      newCompletedSets.push(repsCompletedInCurrentSet);
      setSessionData({ ...sessionData, completedSets: newCompletedSets });
      
      // 更新当前组数
      const totalCompletedSets = newCompletedSets.reduce((sum, count) => sum + count, 0);
      const newCurrentSet = Math.min(totalCompletedSets + 1, project.sets); // 前进到下一组
      setCurrentSet(newCurrentSet);
      setRepsCompletedInCurrentSet(0);
      
      // 保存进度到数据库 - 记录实际完成的组数
      await db.progress_records.add({
        projectId: project.id,
        timestamp: Date.now(),
        type: 'SETS_REPS',
        value: repsCompletedInCurrentSet, // 记录实际完成的组数
        setNumber: currentSet
      });
      
      // 同时更新项目本身的进度
      const updatedProject = {
        ...project,
        completedSets: newCompletedSets,
        updatedAt: Date.now()
      };
      await db.fitness_projects.update(project.id, updatedProject);
      // 更新本地project状态
      setProject(updatedProject);
      
      setToast({message: `完成${repsCompletedInCurrentSet}组！`, type: 'success'});
    } catch (err) {
      console.error('保存进度失败:', err);
      setToast({message: '进度保存失败，请重试', type: 'error'});
    }
  };

  const handleSkipSet = () => {
    if (!project) return;
    
    // 进入下一组
    if (currentSet < project.sets) {
      setCurrentSet(currentSet + 1);
      setRepsCompletedInCurrentSet(0);
    }
  };

  // Total count/weight模式操作
  const handleCountChange = async (delta) => {
    if (isPaused) return;
    const newCount = Math.max(0, currentCount + delta);
    setCurrentCount(newCount);
    
    // 实时保存进度到数据库
    try {
      const updatedProject = {
        ...project,
        currentCount: newCount,
        updatedAt: Date.now()
      };
      await db.fitness_projects.update(project.id, updatedProject);
      // 更新本地project状态
      setProject(updatedProject);
    } catch (err) {
      console.error('保存进度失败:', err);
    }
  };

  const handleWeightChange = (e) => {
    if (isPaused) return;
    setCurrentWeight(e.target.value);
  };

  const handleCustomCountChange = () => {
    setShowCustomModal(true);
  };

  const handleCustomCountSubmit = async () => {
    if (customCount && !isNaN(customCount) && parseInt(customCount) >= 0) {
      if (!isPaused) {
        const newCount = parseInt(customCount);
        setCurrentCount(newCount);
        
        // 实时保存进度到数据库
        try {
          const updatedProject = {
            ...project,
            currentCount: newCount,
            updatedAt: Date.now()
          };
          await db.fitness_projects.update(project.id, updatedProject);
          // 更新本地project状态
          setProject(updatedProject);
        } catch (err) {
          console.error('保存进度失败:', err);
        }
      }
      setShowCustomModal(false);
      setCustomCount('');
    }
  };

  const handleCustomCountCancel = () => {
    setShowCustomModal(false);
    setCustomCount('');
  };

  // 跟踪控制操作
  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const handleEndTracking = async () => {
    if (!project) return;
    
    try {
      // 更新项目进度
      if (project.type === 'SETS_REPS') {
        // 检查是否完成所有组数
        const totalCompletedSets = sessionData.completedSets.reduce((sum, count) => sum + count, 0);
        const isCompleted = totalCompletedSets >= project.sets;
        
        // 更新SETS_REPS项目的完成组数
        const updatedProject = {
          ...project,
          completedSets: sessionData.completedSets,
          updatedAt: Date.now()
        };
        
        // 如果项目已完成，更新状态和完成日期
        if (isCompleted) {
          updatedProject.status = 'COMPLETED';
          updatedProject.completedAt = Date.now();
          updatedProject.completedDate = new Date().toISOString().split('T')[0];
        }
        
        await db.fitness_projects.update(project.id, updatedProject);
        
        // 保存进度记录
        // 计算总完成组数
        const progressRecord = {
          projectId: project.id,
          timestamp: Date.now(),
          type: 'SETS_REPS',
          value: totalCompletedSets, // 记录总完成组数
          setNumber: sessionData.completedSets.length // 记录完成操作的次数
        };
        await db.progress_records.add(progressRecord);
      } else {
        // 检查是否完成目标次数
        const isCompleted = currentCount >= project.targetCount;
        
        // 更新TOTAL_COUNT项目的完成次数
        const updatedProject = {
          ...project,
          currentCount: currentCount,
          updatedAt: Date.now()
        };
        
        // 如果项目已完成，更新状态和完成日期
        if (isCompleted) {
          updatedProject.status = 'COMPLETED';
          updatedProject.completedAt = Date.now();
          updatedProject.completedDate = new Date().toISOString().split('T')[0];
        }
        
        await db.fitness_projects.update(project.id, updatedProject);
        
        // 保存进度记录
        await db.progress_records.add({
          projectId: project.id,
          timestamp: Date.now(),
          type: 'TOTAL_COUNT',
          value: currentCount,
          weight: currentWeight ? parseFloat(currentWeight) : null
        });
      }
      
      setToast({message: '跟踪已完成，进度已保存', type: 'success'});
      setTimeout(() => {
        navigate(`/project/${id}`);
      }, 1500);
    } catch (err) {
      console.error('保存进度失败:', err);
      setToast({message: '进度保存失败，请重试', type: 'error'});
    }
  };

  if (loading) {
    return (
      <div className="tracking-page">
        <div className="loading">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tracking-page">
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
        <div className="error-state">
          <p>{error}</p>
          <button className="retry-button" onClick={handleRetry}>
            重试
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="tracking-page">
        <div className="empty-state">
          <p>项目不存在</p>
          <button className="primary-button" onClick={() => navigate('/')}>
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <CSSTransition in={true} timeout={300} classNames="page" appear>
      <div className="tracking-page">
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
        
        {/* 自定义次数模态框 */}
        {showCustomModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>设置自定义次数</h3>
              <input
                type="number"
                value={customCount}
                onChange={(e) => setCustomCount(e.target.value)}
                placeholder="输入次数"
                min="0"
                className="custom-count-input"
              />
              <div className="modal-actions">
                <button className="secondary-button" onClick={handleCustomCountCancel}>
                  取消
                </button>
                <button className="primary-button" onClick={handleCustomCountSubmit}>
                  确定
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* 顶部导航栏 */}
        <header className="tracking-header">
          <button className="back-button" onClick={() => navigate(`/project/${id}`)}>
            ←
          </button>
          <h1 className="project-title">{project.name}</h1>
        </header>

        <div className="tracking-content">
          {/* 项目信息区域 */}
          <div className="card">
            <div className="project-info">
              <h2 className="project-name">{project.name}</h2>
              <div className="project-type-tag">
                {project.type === 'SETS_REPS' ? 'Sets×Reps' : 'Total count/weight'}
              </div>
              <div className="project-goal">
                {project.type === 'SETS_REPS' ? (
                  <p>{project.sets}组 × {project.repsPerSet}次</p>
                ) : (
                  <p>{project.targetCount}次{project.targetWeight ? ` (${project.targetWeight}kg)` : ''}</p>
                )}
              </div>
            </div>
          </div>

          {/* 进度可视化区域 */}
          <div className="card">
            <div className="progress-section">
              <div className="circular-progress-wrapper">
                <CircularProgress percentage={calculateProgress()} size={150} strokeWidth={12} />
              </div>
              <div className="progress-text">
                {project.type === 'SETS_REPS' ? (
                  <p>已完成 {sessionData.completedSets.reduce((sum, count) => sum + count, 0)} 组/共 {project.sets} 组</p>
                ) : (
                  <p>已完成 {currentCount} 次/共 {project.targetCount} 次</p>
                )}
              </div>
            </div>
          </div>

          {/* 跟踪控件区域 */}
          <div className="card">
            {project.type === 'SETS_REPS' ? (
              <div className="sets-reps-controls">
                <div className="current-set-info">
                  {sessionData.completedSets.reduce((sum, count) => sum + count, 0) >= project.sets 
                    ? `已完成${project.sets}组/共${project.sets}组` 
                    : `第${currentSet}组/共${project.sets}组`}
                </div>
                <div className="counter-controls">
                  <button 
                    className="counter-button" 
                    onClick={() => handleRepsChange(-1)}
                    disabled={isPaused}
                  >
                    -
                  </button>
                  <div className="counter-display">{repsCompletedInCurrentSet}</div>
                  <button 
                    className="counter-button" 
                    onClick={() => handleRepsChange(1)}
                    disabled={isPaused}
                  >
                    +
                  </button>
                </div>
                <div className="set-actions">
                  <button 
                    className="secondary-button" 
                    onClick={handleSkipSet}
                    disabled={isPaused}
                  >
                    跳过当前组
                  </button>
                  <button 
                    className="primary-button" 
                    onClick={handleCompleteSet}
                    disabled={isPaused}
                  >
                    完成当前组
                  </button>
                  {sessionData.completedSets.reduce((sum, count) => sum + count, 0) >= project.sets && (
                    <button 
                      className="completed-button" 
                      disabled
                    >
                      已完成
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="count-weight-controls">
                <div className="counter-controls">
                  <button 
                    className="counter-button" 
                    onClick={() => handleCountChange(-5)}
                    disabled={isPaused}
                  >
                    -5
                  </button>
                  <button 
                    className="counter-button" 
                    onClick={() => handleCountChange(-1)}
                    disabled={isPaused}
                  >
                    -
                  </button>
                  <div className="counter-display">{currentCount}</div>
                  <button 
                    className="counter-button" 
                    onClick={() => handleCountChange(1)}
                    disabled={isPaused}
                  >
                    +
                  </button>
                  <button 
                    className="counter-button" 
                    onClick={() => handleCountChange(5)}
                    disabled={isPaused}
                  >
                    +5
                  </button>
                  <button 
                    className="counter-button custom-button" 
                    onClick={handleCustomCountChange}
                    disabled={isPaused}
                  >
                    自定义
                  </button>
                </div>
                <div className="weight-input">
                  <label htmlFor="weight">重量 (kg)</label>
                  <input
                    type="number"
                    id="weight"
                    value={currentWeight}
                    onChange={handleWeightChange}
                    placeholder="重量"
                    min="0"
                    step="0.1"
                    disabled={isPaused}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 底部操作按钮区域 */}
        <div className="tracking-actions">
          <button className="pause-button" onClick={handlePauseResume}>
            {isPaused ? '继续' : '暂停'}
          </button>
          <button className="primary-button" onClick={handleEndTracking}>
            结束跟踪
          </button>
        </div>
        
        <BottomNavigation />
      </div>
    </CSSTransition>
  );
};

export default Tracking;